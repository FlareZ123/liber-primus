# DWM duplicate-hash public-source gate

**Agent4, 19 November 2026 · Director Issue #1894.** Decision: public sources confirm a crawler-runtime hash used in DWM duplicate handling, but disclose neither the hash algorithm nor a public exact-hash query path. Stop here; do not contact custodians, register for access, probe Tor, or guess API endpoints.

## What public sources establish

1. **Continuity of the product.** The crawler began as TNO research in 2013. The 2023 IEEE Access paper by Kris Oosthoek, Mark van Staalduinen (CFLW), and Georgios Smaragdakis says the data is now available as the commercial product Dark Web Monitor (DWM). CFLW’s own history says TNO licensed DWM to the company in 2019 and CFLW took over daily administration and development in January 2020. [2023 paper](https://doi.org/10.1109/ACCESS.2023.3235409) · [CFLW DWM history](https://cflw.com/dwm/) · [2019 license announcement](https://cflw.com/2019/11/13/tno-licenses-dark-web-monitor-to-cyberdevops/)

2. **A crawler-runtime hash exists.** The 2023 paper states that full-match duplicates were filtered using both the front-page title and page-source contents, “based on a hash generated at crawler runtime.” In a separate description of the current crawler, it says identical HTML source pages are aggregated within a single domain ID. This establishes a real hash-based duplicate mechanism, but it does not prove that the two descriptions refer to the same stored field or the same deduplication scope. [2023 paper, Section IV-A and Section V.1](https://pure.tudelft.nl/ws/portalfiles/portal/145543997/Quantifying_Dark_Web_Shops_Illicit_Revenue.pdf)

3. **The crawler retains versions and page trees.** The same paper says the crawler saves page trees on each visit, crawls online onions at least every 18 hours, and revisits unavailable onions with backoff up to ten days. It describes recursive discovery of linked pages and says raw data is archived in cloud storage. This establishes repeated captures, but not whether the hash is per response, page version, page tree, or domain record. [2023 paper](https://pure.tudelft.nl/ws/portalfiles/portal/145543997/Quantifying_Dark_Web_Shops_Illicit_Revenue.pdf)

4. **The service is not publicly documented as an API.** CFLW’s official page offers a two-week test plan, registered accounts, and subscription tiers; it explicitly says the Premium Plan grants API access. Its public page links to the platform and registration flow, not to an API schema or source repository. The platform links were not publicly fetchable without access. [CFLW DWM product page](https://cflw.com/dwm/)

5. **Researchers can search DWM through authorized access, but this does not expose a public hash query.** A 2025 Crime Science paper reports title searches and historical-data analysis using DWM, including approximately two million sites and repeated captures. It does not document a duplicate-hash field, its algorithm, or an unauthenticated hash-search interface. [2025 paper](https://doi.org/10.1186/s40163-025-00246-w)

6. **The apparent open-source label is ambiguous.** The INTERPOL taxonomy site labels DWM “Open Source,” but links only to dwm.pm and provides no code repository. CFLW’s official wording is “open-source intelligence (OSINT) service,” which describes the intelligence source, not necessarily an open-source software license. The only official GitHub repository found in this trail is the separate [INTERPOL taxonomy project](https://github.com/INTERPOL-Innovation-Centre/DW-VA-Taxonomy), not the DWM crawler.

## Field-level answers

| Question | Publicly established answer |
|---|---|
| Does DWM use a crawler-generated hash for duplicate handling? | Yes. The 2023 paper explicitly says so. |
| What content is involved? | The full-match duplicate procedure uses front-page title and page-source contents. A separate statement describes aggregation of identical HTML source within a domain ID. |
| Hash algorithm and digest width | **Unknown.** No public source found names SHA-1, SHA-256, SHA-512, or another algorithm. |
| Exact input bytes and normalization | **Unknown.** No public source specifies concatenation order, title encoding, raw versus parsed HTML, canonicalization, whitespace, headers, or dynamic-content treatment. |
| Storage key and deduplication scope | **Partially known.** Identical HTML pages can be aggregated under one domain ID; mirror filtering also considers title plus page source. Exact database key and field name are undisclosed. |
| Version semantics | **Partially known.** Page trees are saved on visits and the crawler recrawls; whether the hash is version-specific or reused across versions is undisclosed. |
| Public exact-hash search | **Not established.** The official site gates API access behind the Premium Plan; no public schema or unauthenticated query path was found. |

## Relevance to the LP2 p56 digest

The p56 target is 128 hexadecimal characters (a 512-bit-length representation). That length alone does not establish that it is SHA-512, and no public DWM source connects the p56 digest to the crawler hash. It would be unjustified to assume the DWM field is SHA-512 or that its input is a page's raw HTML.

## Minimal permission-scoped question

If an authorized DWM account holder or maintainer chooses to pursue this, the minimal request is:

> Can you perform one read-only exact-match lookup for the 128-hex LP2 p56 target against the crawler-generated duplicate hash used for full-match detection? Please return only whether it matches and, if so, the page/version identifier and capture timestamp. To interpret the result, please also confirm the field name, hash algorithm and digest width, exact input construction and normalization (including whether front-page title and raw page source are combined), deduplication scope/storage key, and whether the hash is version-specific across recrawls. No bulk export or unrelated records are requested.

**Completion:** close this public-source audit negatively. Further progress requires authorized access to the documented Premium API or an explicit maintainer answer. No contact or access request has been initiated.