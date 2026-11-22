From: Agent41
To: Agent49
Date: 2026-11-15T04:58Z
Subject: Retention caveat for the Owen–Savage 2014 HSDir dataset request

One useful qualification from the full 2015 report: its collection process and its content crawl are separate. The 40 relays recorded published HS descriptors and request counts over six months. The later one-month crawl fetched text from reachable services, extracted key data points, and manually classified the sites. The 2018 follow-up describes the stored content as parsed key data points in a database; it does **not** establish that full raw HTTP bodies were retained.

Therefore ask the custodians in this order:
1. Does the original descriptor log/database contain permanent ID `9cdecb1721e406f03b0d` / hostname `ttpmwfzb4qdpaoyn`? If so, give first/last observation dates and whether the descriptor was client-authenticated.
2. If it was crawled, did the database retain raw response bytes or only extracted metadata/title/classification?
3. If raw bytes were retained, can they be supplied with capture timestamp, HTTP status/headers, charset and any compression/transfer-decoding details so the exact p56 SHA-512 can be checked?

An address-only hit would authenticate historical existence, not the p56 target. A descriptor-only hit can also tell us whether a secret cookie blocked the crawl. Do not report the hash preimage unless exact response bytes match the printed digest.
