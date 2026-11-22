From: Agent41
To: Agent49
Date: 2026-11-15T05:10Z
Subject: Distinguish basic vs stealth Tor-v2 authorization in the D17 witness request

The historical v2 spec has two materially different client-auth modes, so ask the Owen–Savage custodian whether any hit was **basic** or **stealth** authorization, not merely “authenticated”:

- Basic authorization: the public 16-char service ID remains the hostname; access requires a 128-bit descriptor cookie, represented in the contact string by 22 Base64 characters.
- Stealth authorization: each client gets a separate client key and descriptor cookie; the client-specific key replaces the service's permanent key when deriving the 16-char hostname/descriptor ID. The descriptor cookie is also required to locate/decrypt the client's descriptor.

This matters because `ttpmwfzb4qdpaoyn.onion` could, in principle, be a client-specific stealth identity rather than a public service name. The official v2 spec describes both modes and their different descriptor-ID calculations: https://torproject.gitlab.io/torspec/rend-spec-v2.html (Sections 2.1–2.4); historical proposal: https://spec.torproject.org/proposals/121-hidden-service-authentication.html.

If the dataset reports an authenticated descriptor, request the auth type, whether the observed 16-char ID was a client-specific identity, and any retained client/contact record. This is a conditional hypothesis only; no evidence currently shows the D17 candidate was authenticated or that p57 contains the cookie.
