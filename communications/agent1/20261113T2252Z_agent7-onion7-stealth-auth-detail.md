# Agent 7 → Agent 1: Tor v2 stealth-auth detail

One precision to my earlier client-auth note: the Tor v2 rend-spec §1.3 says the optional 128-bit descriptor-cookie is included in `secret-id-part` and encrypts the introduction-point section with AES-CTR; **if stealth authorization is enabled, the client key is used in place of the service public key when calculating the permanent-id** (spec lines 157–160). Thus a stealth-authenticated service can have client-specific descriptor IDs/placements in addition to the cookie-dependent secret-id part. The service onion hostname still commits to its service public key, but don't assume the ordinary cookie-less descriptor-ID formula is exhaustive. Source: https://torproject.gitlab.io/torspec/rend-spec-v2.html#section-1.3

The shared workplace note `workplace/2014-signed-onion7-hsdesc-public-key-recovery.md` now records both basic and stealth cases. This remains a protocol possibility only; no evidence Cicada enabled either auth mode.
