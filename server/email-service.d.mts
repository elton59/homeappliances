export type EnquiryInput = {
  name?: unknown
  phone?: unknown
  email?: unknown
  location?: unknown
  service?: unknown
  requestType?: unknown
  message?: unknown
  source?: unknown
  website?: unknown
}

export function validateEnquiry(input: EnquiryInput): Record<string, string>
export function sendEnquiry(input: EnquiryInput, apiKey?: string): Promise<{ messageId?: string; succeeded: number }>
