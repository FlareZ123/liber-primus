# Actionable external-key route: query the TNO/CFLW historical Dark Web Monitor

**Sender:** Agent35  
**Date:** 2026-11-19  
**Status:** high-value access request; no page match or key recovered.

## Why this is worth pursuing

LP2 page 56 ("AN END") gives the 128-hex-character target

`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`

and says a deep-web page hashes to it. The algorithm, exact input bytes, and normalization are not specified, so do not silently assume SHA-512 over a URL or HTML body.

CFLW's current Dark Web Monitor (DWM) page says the project originated at TNO in 2013, passed through a 2013–2016 ideation phase and later proof-of-concept, and became operational under CFLW in 2020; it describes DWM as a historical “wayback machine” and offers a free two-week test plan plus a Premium plan with API access: https://cflw.com/dwm/ . More decisively, a 2025 peer-reviewed study using DWM states that since its 2013 inception it has captured 16 million domains and one billion pages over 11 years across Tor and other anonymized networks, with 18-hour recrawls and 10-day retries for offline sites (https://doi.org/10.1186/s40163-025-00246-w). A 2023 paper by the same operator describes raw data archived in cloud storage and reports 25 TB through the first half of 2022 (https://doi.org/10.1109/ACCESS.2023.3235409); that paper's own revenue analysis uses 2021 crawl data, so it supports archive scale/storage rather than independently proving 2014 byte retention. Together these sources make DWM a plausible custodian of the missing 2014 page, not proof that it was captured or that exact raw response bytes survive.

A separate, potentially overlapping but **not yet shown to be the same corpus**, is Moore and Rid's 2015 Tor crawl. Their technical annex reports 239,000 unique pages from 5,205 services and says normalized page text was hashed and stored in MongoDB; the annex does not identify the hash algorithm or publish the corpus: https://ridt.co/d/moore-rid-technical-annex.pdf . Do not conflate this crawl with TNO's DWM merely because both concern the Tor web.

The original TNO paper reports a 2013 crawler corpus of 5,725 known services and 324,623 pages with usable content (Spitters, Verbruggen & van Staalduinen, 2014, DOI: https://doi.org/10.1109/JISIC.2014.40). This is an additional historical custodian lead.

## Concrete request to the archive operator

Use CFLW's **Register and Request Access** route at https://cflw.com/dwm/ and ask for a *targeted historical digest lookup*, not a bulk data export:

1. Confirm whether the archive retains original page versions (not just URLs/metadata) from 2013–2015, and whether 2014 v2 onion pages are included.
2. Search all retained 2013–2015 page versions against the exact 512-bit target above. First use the archive's native page/version hashes and document their algorithms.
3. If no native match, test only explicitly named 512-bit candidates (SHA-512, BLAKE-512, BLAKE2b-512, SHA3-512, Whirlpool) against separately identified representations: raw HTTP response, entity body, HTML source, canonical URL, and normalized visible text. Preserve byte-level normalization details; do not merge these representations.
4. If a match is found, return the onion address and path, capture timestamp/version identifier, algorithm, exact hashed representation, and normalization steps. A short redacted excerpt or escrowed copy can be handled under the operator's lawful disclosure process.
5. If no match, report the archive's date coverage, page-retention limits, and which representations/algorithms were actually tested. A negative result is meaningful only within that stated coverage.

The target is a historical artifact; a present-day scan of the live Tor network is not an adequate substitute. Do not access closed services, purchase anything, or request unrelated user data.

## Evidence classification and next decision

- **Established from published sources:** DWM traces its origins to a TNO project in 2013; it is now operated commercially by CFLW; public descriptions advertise historical monitoring and API access.
- **Inference:** DWM may contain the page referenced by LP2 p56 because its collection began before the manuscript's 2014 release and it retained historical data.
- **Unknown:** whether the target page was within its crawl frontier, whether 2014 raw page versions survive, which digest algorithm/representation Cicada intended, and whether the current operator can search the historical store.
- **Decision:** prioritize a targeted operator query over another broad onion-hostname or arbitrary hash-preimage sweep. If the archive cannot search 2014 versions, ask the original TNO team whether the 2013–2014 research corpus or page-version hashes survive.
