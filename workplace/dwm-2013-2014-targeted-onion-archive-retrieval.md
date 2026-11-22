# Targeted 2014 Tor archive recovery: Dark Web Monitor (DWM)

**Classification (22 November 2026, Agent19): independently documented *prospective source custodian*, no retrieved 2014 bytes, LP2 key, unknown-page plaintext or solved hash preimage.** This is a concrete alternative to repeating public Wayback/CDX and guessed keystream searches.

## Historical source and continuity

- The original peer-reviewed Spitters, Verbruggen & van Staalduinen, *Towards a Comprehensive Insight into the Thematic Organization of the Tor Hidden Services* (IEEE JISIC, September 2014; DOI **10.1109/JISIC.2014.40**) describes a live Tor HTML crawler. For its **December 2013** data alone it indexed **5,725 known hidden services**, obtained content from **1,481**, and downloaded **2,196,410 HTML pages** (324,623 usable after text preprocessing). It explicitly observes network uptime through **May 2014** and discusses testing on new hidden services discovered since January 2014. The 2.2m corpus number belongs to *December 2013*, so it **does not establish that May 2014 page responses were saved**. Source: https://gwern.net/doc/darknet-market/2014-spitters.pdf (pp. 220–223, especially Table I and section III); permanent TNO record https://repository.tno.nl/SingleDoc?docId=82829.
- A **13 April 2025** open-access paper with **the original 2014 coauthor Mark van Staalduinen**, Hartel, Junger & van Staalduinen, *Comparing Bitcoin generators on the clear web and the dark web* (https://link.springer.com/article/10.1186/s40163-025-00246-w), says the **same DWM system began in 2013** and accumulated **16 million domains and one billion pages over eleven years** (section Method). DWM retains historical data for later queries; its example studies 2022–2024 records. Crucially the *Data availability* section explicitly instructs researchers to request the DWM dataset from **https://www.cflw.com**; the 2025 paper places van Staalduinen at CFLW Cyber Strategies. This is an identifiable, still-documented archive access route, unlike an unknown 2014 HSDir monitor.

## Directly confirmed 2026 custodian and access channel

The current [official CFLW Dark Web Monitor page](https://cflw.com/dwm/) specifically dates its origin to **2013** under TNO, shows **2014 early research screenshots**, confirms the TNO-to-CFLW licensing handoff, and says CFLW has operated it since **January 2020**. It describes the system as a historical Dark Web *wayback machine* and advertises a **two-week test subscription**, a [Platform login/access-request portal](https://platform.cflw.com/) and a [contact page](https://cflw.com/contact/) for specific inquiries. This is a directly verified operational access/contact route. The site does **not** state how much pre-2020 raw response history survived the transfer or that the 2014 Cicada host was collected. Specific host-level inquiry remains necessary. Academic research access could also be requested through the original TNO authors if CFLW lacks early data.

## Direct evidence of preserved raw crawler content (2023)

A third, *more direct* first-party-institutional source is **Kris Oosthoek, Mark van Staalduinen and Georgios Smaragdakis, “Quantifying Dark Web Shops' Illicit Revenue,” IEEE Access 11 (2023), 4793–4807; DOI [10.1109/ACCESS.2023.3235409](https://doi.org/10.1109/ACCESS.2023.3235409)**, section IV-A, public author PDF https://pure.tudelft.nl/ws/portalfiles/portal/145543997/Quantifying_Dark_Web_Shops_Illicit_Revenue.pdf (p.4797, second page of methodology). It states explicitly that **the crawler's raw data were archived in cloud storage buckets, totaling about 25 TB through the first half of 2022**. It also explains that the system extracts PGP public keys as well as HTML content and recursively discovers additional onion links, with then-current crawling intervals of about 18 hours when services were online. **Do not project the 2022 crawl interval, extraction code, or 25 TB volume backward into 2014:** the same paper specifies a new crawler version introduced in **2020**. The raw-archive existence as of 2022 is thus a stronger reason to ask the custodian about archived first-party 2014 bytes, but is still no proof that May2014 raw entries or Tor descriptors survived.

If the specific 2014 distributor host was not crawled or no raw response remains, a narrowly scoped alternative is an **archived PGP-key-identifier lookup for Cicada's contemporaneous signed notices**, followed only if hits have verified original date and host links; the crawler's documented key-extraction feature makes this a more constrained backup than unbounded searching by religious/cryptographic vocabulary.

## 2023 operator-side lookup semantics: per-domain version and metadata

A direct **CFLW-owned operator study** now supplies an even more targeted query shape: Hartel, Haspels, van Staalduinen & Texeira, **[DarkDiff: Explainable Web Page Similarity of TOR Onion Sites](https://arxiv.org/abs/2308.12134)** (23 August 2023), explicitly states (method §3.2) that DWM **stores database metadata for every fetched page**, and **preserves each changed version of a homepage** rather than duplicating identical revisits. All authors worked at CFLW; their primary data stayed on CFLW servers (§2.8), and their data access acknowledgment directs inquiries to CFLW. The study's measured population is **June 2020–September 2022** and does not show that a 2014 historical layer survived. This fixes the most affordable original question precisely:

> Does the retained indexed **domain metadata/version table**, including any pre-2020 legacy records, contain `ky2khlqdf7qdznac.onion`, with earliest/latest original crawl timestamps and any HTML version? If yes, can a puzzle-specific authorized historical body be retrieved?

That yes/no indexed lookup avoids bulk scanning and does not require a Tor descriptor, which the crawler may never have captured. **The study also establishes that its current crawler ran with JavaScript disabled**, so any lost JS-generated content might not be present even when the host was known. Do not assume this was true for the 2014 crawler. The **different** preimage digest query is gated on original raw-body retention and affordable indexed search, as described below.

## Single low-cost custodian question

Ask CFLW/DWM whether its **2014**, especially **10–15 May 2014 UTC**, retained *public web page* metadata or raw HTTP responses include the **signed Cicada 2014 Stage11 hidden-service domain**

\`ky2khlqdf7qdznac.onion\`

This domain is selected by the genuine 2014 signed message archived as \`resources/historical/cicada2014-stage11-message.asc\`. The participant-preserved contemporaneous Stage11 index and exact source JPEG set are already known in this repository, so returning only the same static index would not add plaintext. **Ask narrowly for (a)** whether the exact domain appears with dated captures, **(b)** whether original raw response bytes, original URL path, and capture UTC time remain, **(c)** whether 2014 records contain external onward links or a response *other than* the known static index, and **(d)** whether a separate public **Tor v2 service descriptor RSA-1024 public identity key** was stored. A crawler that recorded only text and URLs might answer (a) but be unable to answer (d).

If the host is absent, one second bounded question is whether the 2014 corpus supports **indexed lookups by 128-character hexadecimal digest** or **the signed Cicada public PGP-key ID**; do not demand wholesale release of the crawl. The p56 deep-web digest's exact serialization/hash rule and target host are unresolved, so matching an archive entry by its raw bytes would still need an explicit independently testable algorithm. No claim that the signed Stage11 host equals the unknown p56 target is supported.

**Research protection:** request only legal, puzzle-relevant host metadata and authorized original source bytes; there is no need to download, publish or inspect the entire corpus, which the 2014 paper notes included substantial illicit material. Do not equate the 2013 sample with May 2014 coverage or assume historical retention of all early entries. Avoid duplicate outreach if Agent1's current 2014-onion historical-custodian channel already covers this specific organization.

## Independent higher-upside candidate: p56 destination preimage in historical raw HTML

The solved p56 `AN END` contains the exact originally printed **128-hex/64-byte** deep-web destination digest (see [first-party semantics audit](../im-results/lp2-p56-source-defined-hash-semantics-gate.md)):

```text
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

**If** a DWM operator confirms retention of archived raw 2014–2017 HTML bodies and can lawfully perform an **operator-side exact digest query**, ask for **SHA-512 of the raw captured HTTP entity body, byte-for-byte as stored** to equal this one digest. That is a single 512-bit digest family selected by *length*, not a claim that Cicada originally specified SHA-512: the authored plaintext says only “HASHES TO”, with no algorithm, encoding, URL/body choice, or positive source control. A match would be decisive and identify the original URL, time and response bytes, enabling a genuinely new continuation and possibly key input. A miss would exclude only this **one exact operation over the operator's actually retained corpus**. Restrict any output to an authorized Cicada/puzzle-related page; a numeric yes/no match and independently preserved timestamp are sufficient at first, with no bulk transfer of potentially illicit content.

This preimage route is *independent* of the known Stage11 host; that original host may be a clue distributor rather than the p56 destination. It is also technically costly on a many-terabyte archive and should only be asked **after** confirming 2014–2017 raw-body retention and whether the archive already supports content-digest searches. Do not request uncontrolled cloud-wide SHA-512 scanning as the initial contact. If the operator cannot run it cheaply, retire the request until a narrower source-selected URL candidate exists.

## Branch result conditions

- **Positive:** an authenticated 2014 domain capture with a previously missing signed source link/body or Tor-v2 descriptor public RSA identity key. Freeze source URL, UTC timestamp and raw bytes and independently verify their provenance before trying a derived key against untouched LP2. A preserved index alone confirms delivery history, not a decryptor.
- **Negative:** CFLW says May 2014 material was never collected or preserved, or its archive lacks the exact domain. Record that concrete answer once; stop rerequesting or searching unrelated dark-web datasets.
- **Unanswered:** retain this as a narrowly scoped *custodian lead* rather than a claim of artifact recovery. Public web search located a source-backed contact path but did not itself retrieve any 2014 content.

**Related already-completed work:** [historical v2 descriptor IDs and HSDir routing](../im-results/lp2-2014-onion7-hsdir-expected-routing.md), [exact original source delivery](../im-results/lp2-2014-original-distribution-carrier-gate.md), [archive hash preimage route](../im-results/archive-hash-preimage.md). This source line is independent of the prior Owenson–Savage HSDir archive custodian and later 2016 DUTA/Onions-Have-Eyes crawls.
