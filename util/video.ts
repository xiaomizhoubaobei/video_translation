"use server"

/**
 * Sanitizes a string for safe use in error messages.
 * Replaces control characters to prevent log injection.
 */
function sanitizeForLog(input: string): string {
  return input.replace(/[\x00-\x1F\x7F]/g, (char) => {
    return `\\x${char.charCodeAt(0).toString(16).padStart(2, '0')}`
  })
}

/**
 * Validates if an IPv4 address string has valid octet ranges (0-255).
 */
function isValidIPv4Octets(octets: string[]): boolean {
  return octets.every(octet => {
    const num = Number(octet)
    return num >= 0 && num <= 255 && String(num) === octet
  })
}

/**
 * Checks if a hostname is a private or internal address.
 * @param hostname - The hostname to check.
 * @returns True if the hostname is private/internal, false otherwise.
 */
function isPrivateHost(hostname: string): boolean {
  // Normalize hostname - remove surrounding brackets for IPv6
  const normalizedHost = hostname.replace(/^\[|\]$/g, '').toLowerCase()

  // Block localhost and loopback
  if (normalizedHost === 'localhost' || normalizedHost === '127.0.0.1' || normalizedHost === '::1') {
    return true
  }

  // Block 0.0.0.0
  if (normalizedHost === '0.0.0.0') {
    return true
  }

  // Block private IPv4 ranges: 10.x.x.x, 172.16-31.x.x, 192.168.x.x
  const ipv4Match = normalizedHost.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (ipv4Match) {
    const octets = ipv4Match.slice(1)
    // Validate all octets are valid (0-255)
    if (!isValidIPv4Octets(octets)) {
      return false
    }
    const [a, b] = octets.map(Number)
    if (a === 10) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 169 && b === 254) return true // Link-local
    if (a === 127) return true // Loopback range
    if (a === 100 && b >= 64 && b <= 127) return true // CGNAT (100.64.0.0/10)
    return false
  }

  // Check for IPv6 addresses
  if (normalizedHost.includes(':')) {
    // Block IPv6 loopback and unspecified
    if (normalizedHost === '::1' || normalizedHost === '::' || normalizedHost === '::0') {
      return true
    }

    // Block IPv6 Unique Local Addresses (fc00::/7) - fc00:: to fdff:ffff:...
    if (/^f[cd][0-9a-f]{2}:/i.test(normalizedHost)) {
      return true
    }

    // Block IPv6 Link-Local (fe80::/10)
    if (/^fe[89ab][0-9a-f]:/i.test(normalizedHost)) {
      return true
    }

    // Block IPv6 Site-Local (deprecated but still used: fec0::/10)
    if (/^fe[cde][0-9a-f]:/i.test(normalizedHost)) {
      return true
    }

    // Block IPv4-mapped IPv6 addresses (::ffff:127.0.0.1, etc.)
    const ipv4MappedMatch = normalizedHost.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i)
    if (ipv4MappedMatch) {
      return isPrivateHost(ipv4MappedMatch[1])
    }

    return false
  }

  // Block common internal TLDs
  const internalSuffixes = ['.internal', '.local', '.localhost', '.corp', '.home']
  if (internalSuffixes.some(suffix => normalizedHost.endsWith(suffix))) {
    return true
  }

  return false
}

/**
 * Validates a URL to prevent SSRF attacks.
 * @param urlString - The URL to validate.
 * @throws Error if the URL is invalid, too long, contains invalid characters,
 *         has unsupported protocol, or points to a private/internal address.
 */
function validateUrl(urlString: string): string {
  // URL length validation to prevent DoS
  if (urlString.length > 2000) {
    throw new Error('URL exceeds maximum length')
  }

  // Character validation to prevent control characters and injection
  if (/[^\x20-\x7E]/.test(urlString)) {
    throw new Error('URL contains invalid characters')
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(urlString)
  } catch {
    throw new Error('Invalid URL format')
  }

  // Only allow http and https schemes (case-insensitive per RFC 3986)
  if (!/^https?:$/i.test(parsedUrl.protocol)) {
    throw new Error(`Unsupported URL protocol: ${sanitizeForLog(parsedUrl.protocol)}`)
  }

  // Block private/internal hostnames
  const hostname = parsedUrl.hostname
  if (isPrivateHost(hostname)) {
    throw new Error(`Request to internal address is not allowed: ${sanitizeForLog(hostname)}`)
  }

  return parsedUrl.toString()
}

/**
 * Checks if the given video URL is usable.
 * @param url - The video URL to check.
 * @returns Returns a Promise that resolves to `true` if the URL is usable and the content type is video; otherwise, `false`.
 */
export async function isVideoUrlUsable(url: string): Promise<boolean> {
  if (url.includes('/video-proxy')) {
    const _url = new URL(url, 'http://localhost:3000')
    url = _url.searchParams.get('url')!
  }

  // Validate URL to prevent SSRF attacks
  let safeUrl: string
  try {
    safeUrl = validateUrl(url)
  } catch (error) {
    console.error(`URL validation failed: ${error}`)
    return false
  }

  try {
    // Attempt to send a HEAD request
    // redirect: 'error' prevents automatic redirect following to avoid SSRF via redirection
    let response = await fetch(safeUrl, {
      method: 'HEAD',
      redirect: 'error',
    })

    // If the HEAD request is rejected (e.g., 405 Method Not Allowed), try a partial GET request
    if (!response.ok) {
      // Send a GET request with a Range header to avoid downloading the entire video
      response = await fetch(safeUrl, {
        method: 'GET',
        redirect: 'error',
        headers: {
          Range: 'bytes=0-0', // Request the first byte
        },
      })
    }

    // Check if the response is successful
    if (!response.ok) {
      console.warn(`Request failed with status code: ${response.status}`)
      return false
    }

    // Check if the content type is video
    const contentType = response.headers.get('Content-Type')
    if (contentType && (contentType.startsWith('video/') || contentType.startsWith('url-media') || contentType.startsWith('audio/mpeg') || contentType.startsWith('application/octet-stream') || contentType.startsWith('application/x-mpegURL'))) {
      return true
    } else {
      console.warn(`Content type is not video: ${contentType}`)
      return false
    }
  } catch (error) {
    // Catch any network or parsing errors
    console.error(`Error checking URL: %o`, error)
    return false
  }
}
