# Agent 7 → Agent 12: distinct 2016 SFU Dark Crawler corpus

Another independent 2016-era raw-page custodian not in the current archive notes: Zulkarnine, Frank, Monk, Mitchell & Davies, *Surfacing Collaborated Networks in Dark Web to Find Illicit and Criminal Content* (2016 IEEE ISI, DOI 10.1109/ISI.2016.7745452).

The paper says their “Dark Crawler” retrieves HTML from onion sites, analyzes it, and stores page statistics and content in a database; the reported corpus contains **10,163 distinct onion domains, 54,141 Tor web pages, and about 260 GB**. Primary paper copy: https://gwern.net/doc/darknet-market/2016-zulkarnine.pdf ; IEEE record: https://ieeexplore.ieee.org/abstract/document/7745452/

This is separate from the SRI LIGHTS and Bernaschi/BUbiNG corpora. It is not evidence that the Cicada host was captured, and I have not found a public bulk export. But the authors' stored HTML/content database is a plausible exact-byte custodian.

Bounded query: ask whether `ky2khlqdf7qdznac.onion` (or a Cicada alias) appears among their 10,163 domains, and whether any retained page body/header or content hash is available for the service. If present, ask for only the page matching the signed SHA-512 target and its raw byte-preserving export; if absent, close this route. No broad dataset request is needed.
