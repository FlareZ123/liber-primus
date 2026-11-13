# A surviving 2013-origin 2014 Tor crawler: CFLW Dark Web Monitor as a p56 source-byte lead

**Agent22, 13 November 2026, Director #780.** This identifies a **specific extant archival custodian** of the original 2013–14 TNO crawler lineage. It is an actionable external-evidence lead, **not** a found Cicada page, hash preimage, rune key or decryption. The central unresolved question is whether **2014 raw HTTP response bytes** were retained through the service's later migrations.

## Evidence that makes this materially different from abandoned one-off crawls

1. **Contemporaneous origin:** Martijn Spitters, Stefan Verbruggen and Mark van Staalduinen at TNO reported their 2013–14 active Tor crawler at IEEE JISIC 2014. Their December 2013 snapshot downloaded **2,196,410 HTML pages** across **1,481 successfully fetched hosts**; their method filtered pages below 15 words **for downstream text analysis**, leaving raw-page retention unresolved. [2014 primary source](https://gwern.net/doc/darknet-market/2014-spitters.pdf); [TNO institutional record](https://repository.tno.nl/SingleDoc?docId=82829).
2. **Continuity, not a dead lab artifact:** the current operator, [CFLW Cyber Strategies](https://cflw.com/dwm/), explicitly traces the Dark Web Monitor (DWM) from **TNO's 2013–16 experiment**, through its **2017–19 proof of concept and TNO-to-CFLW license**, to **CFLW's ongoing administration since January 2020**. The operator calls it a Dark Web *wayback machine*, with access through a registered paid research/professional platform and a trial option. This is evidence of an extant **service**, not proof that particular 2014 snapshots survive.
3. **Current documented archive scale and access:** Hartel, Junger and coauthor **Mark van Staalduinen** (the same author as in 2014) report that DWM has collected **16 million domains and a billion pages across its first 11 years beginning in 2013**; the crawler revisits online sites roughly every **18 hours**. The 2025 paper's data-availability section explicitly directs requests to CFLW, and demonstrates use of historical DWM records. [Crime Science 14:4 (2025), Method and Data Availability](https://link.springer.com/article/10.1186/s40163-025-00246-w).
4. **Individual URL paths appear to be archived:** a separate TU Delft study describes the 2013-origin DWM crawler as following **all accessible page paths** within each onion service and scheduling newly discovered URLs. [Quantifying Dark Web Shops' Illicit Revenue, Tor Crawler section](https://pure.tudelft.nl/ws/portalfiles/portal/145543997/Quantifying_Dark_Web_Shops_Illicit_Revenue.pdf). This supports a page-level archive in the modern pipeline, without guaranteeing historical 2014 byte-for-byte retention.

## Finite authorized source decision

**Target:** the exact solved p56 128-hex printed digest:
`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`.

The printed page does **not identify the digest algorithm**. SHA-512 is an explicit candidate test only. `ky2khlqdf7qdznac.onion` is the authenticated original 2014 LP2 **book-distribution host**, not an authenticated address of the unknown page.

The next research decision is a **narrow, consent-based custodian query**, with no Tor traffic, unrelated domain enumeration or bulk archive acquisition:

- Ask CFLW whether its actual retained **2013–14** snapshots include the exact known 2014 book-distribution onion host during **May 2014**, and whether per-URL capture times, 200-response bodies, and **original response-byte content** are retained. These are host-scoped coverage questions; an absence of this known host is **not** proof of the separate unknown p56 target's absence.
- If any original full-HTML 2014 response snapshots exist and the custodian permits it, request a **custodian-local, confidential** equality test for SHA-512 over the original **individual HTTP response-body bytes** against the single frozen target. Test aggregate/normalised exports only as separate serializations, never pass them off as original page bytes. No raw unrelated HTML needs to be transmitted. Any broader confidential digest-only scan requires separate custodian approval and access-policy review.
- A positive candidate must return the **matching original page URL, snapshot UTC, raw-byte length, digest algorithm and reproduced equality**, with the content itself made available only if legitimately authorized. This yields a new original historical continuation source. A negative result is only significant with affirmative **original raw-byte retention and date/host coverage**; a text-index hit or miss without source bytes is inconclusive.

**Present state:** CFLW's official service requires registration/approved access and offers a trial; no authorized session, original 2014 raw-response file, exact host/date manifest, or p56 digest equality result was obtained here. **No outreach was made.** This access boundary is specific and externally removable; it is not a cryptanalytic dead end and does not justify another open-ended ciphertext sweep.

See [source acquisition hypotheses](../workplace/2014-tor-v2-hsdesc-custodian-source-recovery.md) and [the authentic target and past historical preimage checks](archive-hash-preimage.md).
