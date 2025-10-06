// Cloudflare Worker to inject CF headers into Pages requests
export default {
  async fetch(request, env, ctx) {
    // Get the original URL
    const url = new URL(request.url);
    
    // Only process requests to your Pages domain
    if (!url.hostname.includes('cf-ai-latency.pages.dev')) {
      return fetch(request);
    }

    // Create a new request with CF headers injected
    const modifiedRequest = new Request(request, {
      headers: {
        ...request.headers,
        // Inject CF headers that Pages doesn't include by default
        'cf-asn': request.cf?.asn || '',
        'cf-country': request.cf?.country || '',
        'cf-city': request.cf?.city || '',
        'cf-colo': request.cf?.colo || '',
        'cf-region': request.cf?.region || '',
        'cf-timezone': request.cf?.timezone || '',
        'cf-latitude': request.cf?.latitude?.toString() || '',
        'cf-longitude': request.cf?.longitude?.toString() || '',
        'cf-postal-code': request.cf?.postalCode || '',
        'cf-metro-code': request.cf?.metroCode || '',
        'cf-region-code': request.cf?.regionCode || '',
        'cf-subdivision': request.cf?.subdivision || '',
        'cf-subdivision-2': request.cf?.subdivision2 || '',
        'cf-continent': request.cf?.continent || '',
        'cf-http-protocol': request.cf?.httpProtocol || '',
        'cf-request-priority': request.cf?.requestPriority || '',
        'cf-edge-request-id': request.cf?.edgeRequestId || '',
        'cf-client-trust-score': request.cf?.clientTrustScore?.toString() || '',
        'cf-bot-score': request.cf?.botScore?.toString() || '',
        'cf-bot-score-source': request.cf?.botScoreSource || '',
        'cf-threat-score': request.cf?.threatScore?.toString() || '',
        'cf-threat-score-source': request.cf?.threatScoreSource || '',
        'cf-anonymizer': request.cf?.anonymizer || '',
        'cf-tls-version': request.cf?.tlsVersion || '',
        'cf-tls-cipher': request.cf?.tlsCipher || '',
        'cf-tls-client-auth': request.cf?.tlsClientAuth || '',
        'cf-tls-exempted': request.cf?.tlsExempted || '',
        'cf-tls-exempted-reason': request.cf?.tlsExemptedReason || ''
      }
    });

    // Forward the request to your Pages application
    const response = await fetch(modifiedRequest);
    
    // Return the response with additional debugging headers
    const modifiedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        'x-cf-worker': 'injected',
        'x-cf-debug': JSON.stringify({
          asn: request.cf?.asn || 'not-available',
          country: request.cf?.country || 'not-available',
          city: request.cf?.city || 'not-available',
          colo: request.cf?.colo || 'not-available'
        })
      }
    });

    return modifiedResponse;
  }
};