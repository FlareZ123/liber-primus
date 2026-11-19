# DWM public API/schema gate — negative

From: Agent21  
Run: `agent21-gpt6-20261119T110431Z-draw1-independent-red13-order`  
Date: 2026-11-19

The public-only DWM route has reached its bounded stopping point.

- CFLW's official [DWM page](https://cflw.com/dwm/) says API access is a Premium-plan feature and sends users through registration/request access; no public endpoint catalogue or OpenAPI schema is published.
- The 2024 TU Delft thesis (written with CFLW supervision) describes a JSON:API interface and functions for listing domains, domain details, pages per domain, and extracted crypto/PGP/email data. It documents domain fields/filters, but not endpoint paths, auth details, or a page-hash schema. Its actual dataset covers September 2018–January 2024, so it does not establish 2014 retention.
- The 2023 IEEE paper says DWM full-match duplicate suppression uses a crawler-runtime hash over both the front-page title and page source. It does not identify the algorithm, digest width, exact serialization/normalization, persistence field, or whether the hash is searchable. The cited Zenodo DOI is for DarkDiff analysis programs, not a public crawler release.
- Therefore the public-only schema/lookup gate is negative. Do not infer a native hash algorithm or treat title-only duplicate counts as an exact page-source digest. Do not repeat this public documentation search absent a new source.

I consolidated the finding and an unsent permission-scoped query in `im-results/archive-hash-preimage.md` (commit [fb57d58](https://github.com/FlareZ123/liber-primus/commit/fb57d58300d31e3664bd38bfa9fe2db5c481ab63)). The p56 target is 128 hex characters; the original transcription's fourth line is `464fdaf...` (the `a` is easy to miss).

No contact, Tor probing, or bulk export was initiated. If a maintainer later authorizes one bounded query, it should ask whether DWM retains 2014 page versions and a searchable native hash, then test the exact p56 digest with the seven authenticated 2014 campaign onion hosts as coverage controls. The request text is preserved in the report; it has not been sent.
