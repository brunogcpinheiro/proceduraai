/**
 * Privacy Filter
 * Detects and filters sensitive fields to protect user privacy
 */

/**
 * List of sensitive field types and patterns
 */
const SENSITIVE_TYPES = new Set([
  'password',
  'credit-card',
  'cc-number',
  'cc-exp',
  'cc-csc',
  'card-number',
])

const SENSITIVE_NAME_PATTERNS = [
  /password/i,
  /senha/i, // Portuguese
  /pwd/i,
  /secret/i,
  /credit.?card/i,
  /cartao/i, // Portuguese
  /cvv/i,
  /cvc/i,
  /ssn/i,
  /social.?security/i,
  /cpf/i, // Brazilian tax ID
  /cnpj/i, // Brazilian company ID
  /pin/i,
  /otp/i,
  /token/i,
  /api.?key/i,
]

const SENSITIVE_AUTOCOMPLETE = new Set([
  'current-password',
  'new-password',
  'cc-number',
  'cc-exp',
  'cc-exp-month',
  'cc-exp-year',
  'cc-csc',
  'cc-type',
])

/**
 * Check if an element is a sensitive field
 */
export function isSensitiveField(element: HTMLElement): boolean {
  if (!(element instanceof HTMLInputElement) && !(element instanceof HTMLTextAreaElement)) {
    return false
  }

  // Check input type
  if (element instanceof HTMLInputElement) {
    if (SENSITIVE_TYPES.has(element.type)) {
      return true
    }
  }

  // Check autocomplete attribute
  const autocomplete = element.getAttribute('autocomplete')
  if (autocomplete && SENSITIVE_AUTOCOMPLETE.has(autocomplete)) {
    return true
  }

  // Check name, id, and placeholder for sensitive patterns
  const identifiers = [
    element.name,
    element.id,
    element.placeholder,
    element.getAttribute('aria-label'),
  ].filter(Boolean)

  for (const identifier of identifiers) {
    if (matchesSensitivePattern(identifier!)) {
      return true
    }
  }

  // Check for parent form fields with sensitive labels
  const label = findAssociatedLabel(element)
  if (label && matchesSensitivePattern(label)) {
    return true
  }

  return false
}

/**
 * Check if a string matches any sensitive pattern
 */
function matchesSensitivePattern(text: string): boolean {
  return SENSITIVE_NAME_PATTERNS.some((pattern) => pattern.test(text))
}

/**
 * Find the associated label for a form element
 */
function findAssociatedLabel(element: HTMLInputElement | HTMLTextAreaElement): string | null {
  // Check for label with 'for' attribute
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`)
    if (label) {
      return label.textContent?.trim() || null
    }
  }

  // Check for parent label
  const parentLabel = element.closest('label')
  if (parentLabel) {
    return parentLabel.textContent?.trim() || null
  }

  return null
}

/**
 * Mask sensitive values in captured data
 */
export function maskSensitiveValue(value: string): string {
  if (!value) return value

  // Mask credit card numbers (keep last 4 digits)
  if (/^\d{13,19}$/.test(value.replace(/\s|-/g, ''))) {
    const cleaned = value.replace(/\s|-/g, '')
    return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4)
  }

  // Mask everything for short values (likely codes/pins)
  if (value.length <= 6) {
    return '*'.repeat(value.length)
  }

  // Default: mask middle portion
  const visibleChars = 3
  if (value.length > visibleChars * 2) {
    return value.slice(0, visibleChars) + '*'.repeat(value.length - visibleChars * 2) + value.slice(-visibleChars)
  }

  return '*'.repeat(value.length)
}

/**
 * Check if a URL contains sensitive information
 */
export function containsSensitiveUrl(url: string): boolean {
  const sensitiveUrlPatterns = [
    /\/login/i,
    /\/signin/i,
    /\/password/i,
    /\/reset/i,
    /\/checkout/i,
    /\/payment/i,
    /\/pagamento/i, // Portuguese
  ]

  return sensitiveUrlPatterns.some((pattern) => pattern.test(url))
}
