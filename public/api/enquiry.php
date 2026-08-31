<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $body): never {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['error' => 'Method not allowed.']);
}

$contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > 20000) {
    respond(413, ['error' => 'Request is too large.']);
}

$raw = file_get_contents('php://input');
$input = json_decode($raw ?: '{}', true);
if (!is_array($input)) {
    respond(400, ['error' => 'Invalid request.']);
}

function field(array $input, string $key, int $limit): string {
    $value = trim((string) ($input[$key] ?? ''));
    return function_exists('mb_substr') ? mb_substr($value, 0, $limit) : substr($value, 0, $limit);
}

$data = [
    'name' => field($input, 'name', 120),
    'phone' => field($input, 'phone', 40),
    'email' => field($input, 'email', 160),
    'location' => field($input, 'location', 160),
    'service' => field($input, 'service', 160),
    'requestType' => field($input, 'requestType', 80),
    'message' => field($input, 'message', 4000),
    'source' => field($input, 'source', 300),
    'website' => field($input, 'website', 300),
];

if ($data['website'] !== '') respond(400, ['error' => 'Spam submission rejected.']);
if ($data['name'] === '' || $data['phone'] === '' || $data['message'] === '') {
    respond(400, ['error' => 'Name, phone number, and message are required.']);
}
if ($data['email'] !== '' && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    respond(400, ['error' => 'Enter a valid email address.']);
}
$allowedTypes = ['Appointment request', 'General enquiry', 'Quotation request'];
if (!in_array($data['requestType'], $allowedTypes, true)) $data['requestType'] = 'General enquiry';
if ($data['source'] === '') $data['source'] = 'Website';

// Basic per-IP abuse protection: five submissions per ten minutes.
$ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$rateFile = sys_get_temp_dir() . '/har-' . hash('sha256', $ip) . '.json';
$now = time();
$attempts = [];
if (is_file($rateFile)) {
    $stored = json_decode((string) file_get_contents($rateFile), true);
    if (is_array($stored)) $attempts = array_values(array_filter($stored, fn($time) => is_int($time) && $now - $time < 600));
}
if (count($attempts) >= 5) respond(429, ['error' => 'Too many requests. Please try again in a few minutes.']);
$attempts[] = $now;
@file_put_contents($rateFile, json_encode($attempts), LOCK_EX);

function readApiKey(): string {
    $environmentKey = getenv('SMTP2GO_API_KEY');
    if (is_string($environmentKey) && $environmentKey !== '') return $environmentKey;

    // Recommended cPanel location: one directory above public_html.
    $documentRoot = rtrim((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''), DIRECTORY_SEPARATOR);
    $configPaths = [
        dirname($documentRoot) . DIRECTORY_SEPARATOR . '.homeappliances.env',
        dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . '.homeappliances.env',
    ];
    foreach (array_unique($configPaths) as $path) {
        if (!is_file($path)) continue;
        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
            if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
            [$key, $value] = array_map('trim', explode('=', $line, 2));
            if ($key === 'SMTP2GO_API_KEY') return trim($value, "\"'");
        }
    }
    return '';
}

$apiKey = readApiKey();
if ($apiKey === '') {
    error_log('Home Appliances enquiry: SMTP2GO_API_KEY is not configured.');
    respond(503, ['error' => 'Email service is temporarily unavailable. Please call 0790076362.']);
}

$reference = 'HAR-' . gmdate('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));
$service = $data['service'] !== '' ? $data['service'] : 'General appliance assistance';
$date = new DateTime('now', new DateTimeZone('Africa/Nairobi'));
$submittedAt = $date->format('l, j F Y \a\t g:i A');
$escape = fn(string $value): string => htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$rows = [
    ['Customer name', $data['name']], ['Telephone', $data['phone']],
    ['Email address', $data['email'] ?: 'Not provided'], ['Service location', $data['location'] ?: 'Not provided'],
    ['Submitted', $submittedAt], ['Website page', $data['source']],
];

$textRows = implode("\n", array_map(fn($row) => $row[0] . ': ' . $row[1], $rows));
$textBody = strtoupper($data['requestType']) . "\nReference: {$reference}\n\nA customer submitted a " . strtolower($data['requestType']) . " through the Home Appliances Repair website.\n\nRequest type: {$data['requestType']}\nService required: {$service}\n{$textRows}\n\nCUSTOMER'S MESSAGE\n{$data['message']}\n\nNEXT STEP\nPlease contact {$data['name']} on {$data['phone']} to acknowledge this request and arrange the next step.\n\nThis message was generated securely by homeappliancesrepair.co.ke.";
$htmlRows = implode('', array_map(fn($row) => '<tr><th style="text-align:left;vertical-align:top;padding:11px 10px;border-bottom:1px solid #eceef1;width:145px;color:#59616d;font-size:13px">' . $escape($row[0]) . '</th><td style="padding:11px 10px;border-bottom:1px solid #eceef1;font-size:14px">' . $escape($row[1]) . '</td></tr>', $rows));
$emailButton = $data['email'] !== '' ? '<a href="mailto:' . $escape($data['email']) . '" style="display:inline-block;background:#292e38;color:#fff;text-decoration:none;font-weight:bold;padding:12px 18px;border-radius:4px">Reply by email</a>' : '';
$htmlBody = '<!doctype html><html><body style="margin:0;background:#f4f5f7;font-family:Arial,sans-serif;color:#20252e"><div style="max-width:720px;margin:24px auto;background:#fff;border:1px solid #e2e4e8"><div style="background:#292e38;padding:26px 30px"><div style="color:#ffd000;font-size:12px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase">Home Appliances Repair Nairobi</div><h1 style="color:#fff;font-size:25px;line-height:1.3;margin:8px 0 0">' . $escape($data['requestType']) . '</h1></div><div style="padding:28px 30px"><p style="font-size:16px;line-height:1.7;margin-top:0">A customer submitted a <strong>' . $escape(strtolower($data['requestType'])) . '</strong> through the website. Please review the details and respond promptly.</p><div style="background:#fff9dc;border-left:4px solid #ffd000;padding:14px 18px;margin:22px 0"><strong>Reference:</strong> ' . $escape($reference) . '<br><strong>Required service:</strong> ' . $escape($service) . '</div><table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 25px">' . $htmlRows . '</table><div style="background:#f6f7f9;padding:20px 22px;margin:24px 0"><h2 style="font-size:16px;margin:0 0 10px">Customer\'s message</h2><p style="white-space:pre-wrap;line-height:1.7;margin:0;color:#454c56">' . $escape($data['message']) . '</p></div><h2 style="font-size:16px;margin:25px 0 8px">Recommended next step</h2><p style="line-height:1.6;color:#59616d">Contact <strong>' . $escape($data['name']) . '</strong> to acknowledge the request, confirm the appliance details, and arrange a suitable appointment.</p><div style="margin-top:20px"><a href="tel:' . $escape($data['phone']) . '" style="display:inline-block;background:#ffd000;color:#20252e;text-decoration:none;font-weight:bold;padding:12px 18px;border-radius:4px;margin:0 8px 8px 0">Call ' . $escape($data['phone']) . '</a>' . $emailButton . '</div></div><div style="background:#f0f1f3;color:#717781;font-size:12px;line-height:1.6;padding:18px 30px">Sent securely from homeappliancesrepair.co.ke · ' . $escape($reference) . '<br>Primary recipient: enquiries@homeappliancesrepair.co.ke · CC: info@homeappliancesrepair.co.ke</div></div></body></html>';

$payload = [
    'sender' => 'Home Appliances Repair <enquiries@homeappliancesrepair.co.ke>',
    'to' => ['enquiries@homeappliancesrepair.co.ke'],
    'cc' => ['info@homeappliancesrepair.co.ke'],
    'subject' => '[' . $data['requestType'] . '] ' . $service . ' — ' . $data['name'] . ($data['location'] ? ', ' . $data['location'] : '') . ' (' . $reference . ')',
    'text_body' => $textBody,
    'html_body' => $htmlBody,
    'custom_headers' => $data['email'] ? [['header' => 'Reply-To', 'value' => $data['email']]] : [],
];

$curl = curl_init('https://api.smtp2go.com/v3/email/send');
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 25,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'X-Smtp2go-Api-Key: ' . $apiKey],
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_SLASHES),
]);
$resultBody = curl_exec($curl);
$status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
$curlError = curl_error($curl);
curl_close($curl);
$result = json_decode(is_string($resultBody) ? $resultBody : '{}', true);
$succeeded = (int) ($result['data']['succeeded'] ?? 0);
if ($curlError !== '' || $status < 200 || $status >= 300 || $succeeded < 1) {
    error_log('Home Appliances enquiry delivery failed: ' . ($curlError ?: (string) $resultBody));
    respond(502, ['error' => 'Unable to send your request right now. Please call 0790076362.']);
}

respond(200, ['ok' => true, 'id' => $result['data']['email_id'] ?? $reference]);
