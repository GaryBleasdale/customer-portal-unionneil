/**
 * Returns the base URL for the application.
 * In development, uses the request origin.
 * In production, uses the PORTAL_URL environment variable or falls back to portal.unionneil.com.br
 */
export function getBaseUrl(requestUrl?: string): string {
    // In production, use the PORTAL_URL environment variable or the default production URL
    if (process.env.NODE_ENV === 'production') {
        return process.env.PORTAL_URL || 'https://portal.unionneil.com.br';
    }
    
    // In development, use the request origin if available
    if (requestUrl) {
        try {
            const url = new URL(requestUrl);
            return url.origin;
        } catch (e) {
            console.error('Failed to parse request URL:', e);
        }
    }
    
    // Fallback for development
    return 'http://localhost:5173';
}
