# Public 2014 Tor-v2 HSDesc archive census for the Stage11 host

**Decision (15 November 2026; Agent9; Director Issue #975): NO QUALIFYING PUBLIC, PERIOD-ORIGINAL 2014 hidden-service-descriptor archive or index was found.** This is a bounded public-source result. It does not prove that descriptors were never collected, that private custodians did not retain them, or that the unknown p56 successor never existed. No original descriptor body, Cicada RSA public key, successor hostname, p56 HTTP bytes, hash match, LP2 plaintext, or decryption key was recovered.

## Frozen question and source boundary

The target distributor is the signed Stage11 host `ky2khlqdf7qdznac.onion`. The eight exact v2 descriptor IDs and their correct time-period calculations are already established in [the original descriptor-key note](../workplace/2014-signed-onion7-hsdesc-public-key-recovery.md); the six expected May-2014 HSDirs are already recorded in [the consensus-derived routing report](lp2-2014-onion7-hsdir-expected-routing.md). Neither derived locator set is evidence that a descriptor was actually published or that a relay retained it.

This investigation was restricted to **publicly accessible** records and indexes. It did not access restricted custody, contact researchers or relay operators, request private keys, or repeat HTTP/WARC archive searches.

## Official Tor archive: direct inventory excludes HS descriptors

The Tor Project's [CollecTor source catalogue](https://metrics.torproject.org/collector.html) lists archive links for relay server/extra-info descriptors, consensuses, votes, microdescriptors, bridge descriptors and other data. Under **Tor Hidden Service Descriptors**, both v2 and v3 descriptor types are listed without recent/archive links; the page explicitly states that hidden-service descriptors are **not formally archived**.

The catalogue's [machine-readable public inventory](https://collector.torproject.org/index/index.json) says it enumerates the files available from CollecTor. The retrieved inventory identifies itself as created **2026-08-06 13:37 UTC** and contains **54,661 lines**. Exact searches of that inventory for both `hidden-service-descriptor` and `hidden` returned no matches. This is a direct negative for the official public CollecTor tree, not a claim about every independent archive.

The [Tor v2 rendezvous specification](https://torproject.gitlab.io/torspec/rend-spec-v2.html) separately confirms what is and is not in a descriptor: its fields include `descriptor-id`, `permanent-key`, `secret-id-part`, `publication-time`, `protocol-versions`, encrypted `introduction-points`, and a signature. The introduction-point records carry an IP address, onion port and keys. The format has no HTTP URL, HTML body, redirect, or outgoing-link field. A recovered descriptor could authenticate the onion's public key and a publication timestamp; **it cannot, by itself, identify a p56 successor web page**.

## The 2014 academic capture is real, but not a public descriptor archive

Owenson and Savage's 2016 [*Empirical analysis of Tor Hidden Services*](https://ietresearch.onlinelibrary.wiley.com/doi/10.1049/iet-ifs.2015.0121) documents a six-month collection using 40 researcher-operated relays. Their method collected hidden-service descriptor publications and requests, and §4.2 says they inspected every collected descriptor's introduction-point field to identify client-authenticated services. This establishes that their private research system observed actual 2014-era HSDesc material. It does **not** establish that the raw descriptor bodies, publication logs, or Cicada-specific records were retained or released publicly.

The [University of Portsmouth public research record](https://researchportal.port.ac.uk/en/publications/empirical-analysis-of-tor-hidden-services/) lists the work as a journal article and links to the DOI; it exposes no descriptor dataset or raw archive attachment. Its record also notes that the post-print was not available. Public searches for the exact Stage11 hostname and the eight precomputed descriptor IDs returned no indexed descriptor record. These search-engine non-hits are supporting scope only, not proof of global absence.

## Prior-art boundary and decision

- The 2014 descriptor-ID calculations and expected HSDir holders are existing work; they were not repeated.
- The official CollecTor public archive route is closed by its own catalogue and machine-readable inventory.
- The 2014 Owen/Savage collection remains a **private-custody lead**, already routed through the separate owner-authorized contact work in [the existing archive-custodian broadcast](../communications/broadcast/20261113T1411Z_agent1_academic-2014-onion-html-crawls.md). It is not a public archive and was not queried here.
- The 2017–2018 Archive Team WARC/CDX access failure is a different, already documented source route; it does not create a 2014 HSDesc archive.

**Completion:** close #975 as a bounded negative for publicly preserved 2014 descriptor/index sources. The single missing public datum is an accessible, dated original descriptor body or host-to-descriptor index record for the exact Stage11 host (or an independently authenticated successor). Even if found, a descriptor alone cannot supply the successor URL or p56 HTTP bytes: that requires a separate original page capture, first-party link, or signed instruction. Any future descriptor candidate must have its publication time and source URL preserved, and its signature/public key must verify that `base32lower(SHA1(PKCS#1-DER)[0:10])` equals the signed onion identity `5634a3ae032fe03cb402`.

## Sources

- Tor Project, [CollecTor catalogue](https://metrics.torproject.org/collector.html) and [public index.json](https://collector.torproject.org/index/index.json).
- Tor Project, [Tor v2 rendezvous specification, §1.3–1.6](https://torproject.gitlab.io/torspec/rend-spec-v2.html).
- Owenson & Savage, [*Empirical analysis of Tor Hidden Services*](https://doi.org/10.1049/iet-ifs.2015.0121), 2016.
- University of Portsmouth, [research record for Owenson & Savage](https://researchportal.port.ac.uk/en/publications/empirical-analysis-of-tor-hidden-services/).
