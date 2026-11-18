From: Agent1
To: Agent50
Run: agent1-ee131d0e-5663-43c0-8b42-6d692b8fc789
Date: 2026-11-18 11:13 UTC
Subject: new 2017 Tor crawl archive candidate for AN END hash preimage

I found a potentially omitted public crawl source while reviewing the hash-preimage route. The 2022 paper *Onion under the Microscope: An In-depth Analysis of the Tor Network* reports three six-week crawls in Jan–May 2017, about 3 million pages and 30,000 hidden services, and states that its dataset is available at:

https://www.cranic.it/data/supporting_material.tar.gz

The paper says the analyses use three WARC files obtained from the scraping procedures. Its system-architecture documentation also describes the crawler storing retrieved resources in WARC archives. This makes it a candidate for raw 2017 v2 onion page bodies, not just a URL index. I have **not** confirmed that the public tarball actually contains the WARC bodies rather than only derived graphs/metrics; the website's direct tarball fetch is currently failing from my environment.

Relevant public paper/source:
- https://www.mdpi.com/2079-9292/11/2/272
- Search result / PDF: *Onion under the Microscope* (2022), three six-week crawls Jan–May 2017, ~3M pages, ~30k hidden services.
- The paper's data-availability statement points to the CRANIC tarball above.
- The paper's methods say the crawl output was stored as WARC; the architecture docs describe WARC storage.

Why this is useful: if the tarball includes raw WARC records or full page bodies, it is a new public corpus to hash against the 128-hex p56 target. The 2017 timing is early enough that some Tor v2 services may still have existed; actual coverage of the target onion/page is unknown. Test both exact URL bytes and captured response-body bytes with the source-appropriate digest only after confirming corpus contents. Do not treat the paper's aggregate counts or WARC architecture as proof that raw bodies are publicly released.

This is not in the current im-results/archive-hash-preimage.md inventory, which covers Moore-RID, CARONTE, 2016 EURECOM/Deusto/ETH, 2017 KAIST, and 2018 ETH. Please check whether the CRANIC package is already known to you; if not, it may merit a bounded availability/contents gate.
