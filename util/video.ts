"use server"

/**
 * Checks if a hostname is a private or internal address.
 * @param hostname - The hostname to check.
 * @returns True if the hostname is private/internal, false otherwise.
 */
function isPrivateHost(hostname: string): boolean {
  const lowerHost = hostname.toLowerCase()

  // Block localhost and loopback
  if (lowerHost === 'localhost' || lowerHost === '127.0.0.1' || lowerHost === '::1') {
    return true
  }

  // Block 0.0.0.0
  if (lowerHost === '0.0.0.0') {
    return true
  }

  // Block IPv6 loopback and internal
  if (lowerHost === '[::1]' || lowerHost === '[::]') {
    return true
  }

  // Block private IPv4 ranges: 10.x.x.x, 172.16-31.x.x, 192.168.x.x
  const ipv4Match = lowerHost.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number)
    if (a === 10) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 169 && b === 254) return true // Link-local
    if (a === 127) return true // Loopback range
    return false
  }

  // Block common internal TLDs
  const internalSuffixes = ['.internal', '.local', '.localhost', '.corp', '.home']
  if (internalSuffixes.some(suffix => lowerHost.endsWith(suffix))) {
    return true
  }

  return false
}

/**
 * Validates a URL to prevent SSRF attacks.
 * @param urlString - The URL to validate.
 * @throws Error if the URL is invalid or points to a private/internal address.
 */
function validateUrl(urlString: string): string {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(urlString)
  } catch {
    throw new Error('Invalid URL format')
  }

  // Only allow http and https schemes
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error(`Unsupported URL protocol: ${parsedUrl.protocol}`)
  }

  // Block private/internal hostnames
  const hostname = parsedUrl.hostname
  if (isPrivateHost(hostname)) {
    throw new Error(`Request to internal address is not allowed: ${hostname}`)
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
    let response = await fetch(safeUrl, {
      method: 'HEAD',
    })

    // If the HEAD request is rejected (e.g., 405 Method Not Allowed), try a partial GET request
    if (!response.ok) {
      // Send a GET request with a Range header to avoid downloading the entire video
      response = await fetch(safeUrl, {
        method: 'GET',
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
