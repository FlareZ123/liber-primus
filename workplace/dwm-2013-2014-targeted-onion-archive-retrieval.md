# Targeted 2014 Tor archive recovery: Dark Web Monitor (DWM)

**Classification (22 November 2026, Agent19): independently documented *prospective source custodian*, no retrieved 2014 bytes, LP2 key, unknown-page plaintext or solved hash preimage.** This is a concrete alternative to repeating public Wayback/CDX and guessed keystream searches.

## Historical source and continuity

- The original peer-reviewed Spitters, Verbruggen & van Staalduinen, *Towards a Comprehensive Insight into the Thematic Organization of the Tor Hidden Services* (IEEE JISIC, September 2014; DOI **10.1109/JISIC.2014.40**) describes a live Tor HTML crawler. For its **December 2013** data alone it indexed **5,725 known hidden services**, obtained content from **1,481**, and downloaded **2,196,410 HTML pages** (324,623 usable after text preprocessing). It explicitly observes network uptime through **May 2014** and discusses testing on new hidden services discovered since January 2014. The 2.2m corpus number belongs to *December 2013*, so it **does not establish that May 2014 page responses were saved**. Source: https://gwern.net/doc/darknet-market/2014-spitters.pdf (pp. 220–223, especially Table I and section III); permanent TNO record https://repository.tno.nl/SingleDoc?docId=82829.
- A **13 April 2025** open-access paper with **the original 2014 coauthor Mark van Staalduinen**, Hartel, Junger & van Staalduinen, *Comparing Bitcoin generators on the clear web and the dark web* (https://link.springer.com/article/10.1186/s40163-025-00246-w), says the **same DWM system began in 2013** and accumulated **16 million domains and one billion pages over eleven years** (section Method). DWM retains historical data for later queries; its example studies 2022–2024 records. Crucially the *Data availability* section explicitly instructs researchers to request the DWM dataset from **https://www.cflw.com**; the 2025 paper places van Staalduinen at CFLW Cyber Strategies. This is an identifiable, still-documented archive access route, unlike an unknown 2014 HSDir monitor.

## Single low-cost custodian question

Ask CFLW/DWM whether its **2014**, especially **10–15 May 2014 UTC**, retained *public web page* metadata or raw HTTP responses include the **signed Cicada 2014 Stage11 hidden-service domain**

\`ky2khlqdf7qdznac.onion\`

This domain is selected by the genuine 2014 signed message archived as \`resources/historical/cicada2014-stage11-message.asc\`. The participant-preserved contemporaneous Stage11 index and exact source JPEG set are already known in this repository, so returning only the same static index would not add plaintext. **Ask narrowly for (a)** whether the exact domain appears with dated captures, **(b)** whether original raw response bytes, original URL path, and capture UTC time remain, **(c)** whether 2014 records contain external onward links or a response *other than* the known static index, and **(d)** whether a separate public **Tor v2 service descriptor RSA-1024 public identity key** was stored. A crawler that recorded only text and URLs might answer (a) but be unable to answer (d).

If the host is absent, one second bounded question is whether the 2014 corpus supports **indexed lookups by 128-character hexadecimal digest** or **the signed Cicada public PGP-key ID**; do not demand wholesale release of the crawl. The p56 deep-web digest's exact serialization/hash rule and target host are unresolved, so matching an archive entry by its raw bytes would still need an explicit independently testable algorithm. No claim that the signed Stage11 host equals the unknown p56 target is supported.

**Research protection:** request only legal, puzzle-relevant host metadata and authorized original source bytes; there is no need to download, publish or inspect the entire corpus, which the 2014 paper notes included substantial illicit material. Do not equate the 2013 sample with May 2014 coverage or assume historical retention of all early entries. Avoid duplicate outreach if Agent1's current 2014-onion historical-custodian channel already covers this specific organization.

## Branch result conditions

- **Positive:** an authenticated 2014 domain capture with a previously missing signed source link/body or Tor-v2 descriptor public RSA identity key. Freeze source URL, UTC timestamp and raw bytes and independently verify their provenance before trying a derived key against untouched LP2. A preserved index alone confirms delivery history, not a decryptor.
- **Negative:** CFLW says May 2014 material was never collected or preserved, or its archive lacks the exact domain. Record that concrete answer once; stop rerequesting or searching unrelated dark-web datasets.
- **Unanswered:** retain this as a narrowly scoped *custodian lead* rather than a claim of artifact recovery. Public web search located a source-backed contact path but did not itself retrieve any 2014 content.

**Related already-completed work:** [historical v2 descriptor IDs and HSDir routing](../im-results/lp2-2014-onion7-hsdir-expected-routing.md), [exact original source delivery](../im-results/lp2-2014-original-distribution-carrier-gate.md), [archive hash preimage route](../im-results/archive-hash-preimage.md). This source line is independent of the prior Owenson–Savage HSDir archive custodian and later 2016 DUTA/Onions-Have-Eyes crawls.
