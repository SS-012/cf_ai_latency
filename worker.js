/**
 * Cloudflare Worker: Simple /ping endpoint that returns edge routing info
 * (ASN, country, city, colo) for basic latency and network tests.
 */

export default {
    async fetch(request, env, ctx) {
        let url = new URL(request.url)

        if (url.pathname === "/ping") {
            const asn = request.cf?.asn || "UNK";
            const country = request.cf?.country || "UNK";
            const city = request.cf?.city || "UNK";
            const colo = request.cf?.colo || "UNK";
            return new Response(JSON.stringify({msg: "pong", asn, country, city, colo}), { 
                headers: {"Content-Type" : "application/json"
                }
            });
        }
        return new Response("OK");
    }

};