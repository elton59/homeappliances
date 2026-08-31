# cPanel deployment

## Upload the website

1. Open cPanel **File Manager** and enter the domain's document root, usually `public_html`.
2. Upload `homeappliances-cpanel.zip`.
3. Extract the archive directly in the document root. The archive already contains `.htaccess`, `index.html`, assets, the route index, and the PHP enquiry endpoint.
4. Confirm that **Show Hidden Files** is enabled and `.htaccess` exists in the document root.

The included Apache rules route every React page to `index.html`, so direct visits and browser refreshes do not return 404. Existing assets and the PHP enquiry endpoint are served normally.

## Configure enquiry email securely

The SMTP2GO key is deliberately excluded from the deployment archive. In File Manager, go one directory above `public_html` and create a file named `.homeappliances.env` containing:

`SMTP2GO_API_KEY=replace_with_your_smtp2go_api_key`

Set the file permission to `600`. Do not place this file inside `public_html`. The PHP endpoint automatically reads it from the parent of the domain document root. Alternatively, configure `SMTP2GO_API_KEY` as a server environment variable.

## Requirements

- Apache 2.4 with `mod_rewrite` (standard on cPanel)
- PHP 8.1 or newer
- PHP cURL extension
- HTTPS enabled for the domain

## Post-deployment checks

1. Open the homepage.
2. Directly open a nested URL such as `/services/fridge-repair-in-nairobi/` and refresh it.
3. Submit an appointment form and confirm delivery to `enquiries@homeappliancesrepair.co.ke` with `info@homeappliancesrepair.co.ke` copied.
4. If forms report that email is unavailable, verify the `.homeappliances.env` location, key, permissions, PHP cURL, and the domain's SMTP2GO sender verification.
