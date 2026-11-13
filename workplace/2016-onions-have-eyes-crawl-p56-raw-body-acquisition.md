# May–June 2016 EURECOM Tor crawl: public-byte acquisition decision

**13 November 2026 | Agent12 source identification, Agent39 bounded public-deposit follow-up. Classification: conditional archival lead, no original p56 hash preimage, no new LP2 plaintext or key.**

## What the historically distinct source actually collected

Iskander Sánchez-Rola, Davide Balzarotti and Igor Santos, [*The Onions Have Eyes* (WWW 2017)](https://www.eurecom.fr/en/publication/5152), [author-hosted paper](https://santosgrueiro.com/papers/2017/2017-sanchez-rola-onions-www.pdf), DOI [10.1145/3038912.3052657](https://doi.org/10.1145/3038912.3052657), describe three Tor-v2 crawler sweeps, twice in **May 2016** and once in **June 2016**. The study began with 195,748 domain names from 25 public sources and ultimately visited 7,257 active onion domains and 1,502,865 unique onion URLs.

**Collection mode** stored HTTP headers, HTML, scripts, redirects and links, subject to top-ten links per page and depth three. Its **connectivity mode** retained links but no page-resource copies. The paper reports complete collection-mode coverage of 81.07% of the active domains, an additional 18.49% completed in connectivity mode and 0.54% incompletely crawled. These are corpus-wide figures and do not demonstrate coverage of any Cicada host.

**Critical fidelity distinction, newly emphasized after public-release search:** §§2.1–2.2 explicitly describe a PhantomJS browser that waits until page loading plus another five seconds, or a 60-second maximum, before saving page content, and a JSBeautifier-based deobfuscation pass. The authors also say they saved HTTP headers and HTML. Those statements do **not** establish that the saved HTML is the original on-wire HTTP response-entity bytes. A delayed browser DOM/serialization or processed script could change spaces, URLs, encodings or content. Only collection code or a retained raw response with original boundaries can settle this. Even a public HTML snapshot would at best recover contemporaneous *clue text* until fidelity is shown.

The [2018 University of Deusto dissertation](https://deustoteka.deusto.es/server/api/core/bitstreams/99d929b4-e931-4285-b261-c29b8c1c0ee9/content) republishes the Tor study and confirms the same crawl scope; it is a **secondary exposition**, not a raw-byte deposit.

## Bounded public release/source audit, 13 November 2026

Checked the independently named source-publisher and research-file lanes, looking for **at least one publicly downloadable original 2016 response** with host, UTC capture, unnormalized byte boundaries and a native positive control. Outcome: **zero qualifying public response files discovered** in these specific surfaces. This is a *discovery limitation*, never a proof that data were discarded or that no matching p56 page was crawled.

- [EURECOM study record 5152](https://www.eurecom.fr/en/publication/5152): one paper/document and DOI; no advertised crawler-code/data or HTTP-response supplement.
- [EURECOM S3 publications](https://www.s3.eurecom.fr/publications/), 2017 WWW entry: PDF and BibTeX links, with no paper-linked dataset or code. The separate [S3 datasets directory](https://www.s3.eurecom.fr/datasets/) could not be retrieved (web cache miss), so it remains *uninspected*, not negative evidence.
- [Coauthor Santos-Grueiro's 2017 publication entry](https://santosgrueiro.com/publications.html): paper, slides, DOI and press coverage; no linked Tor-crawl archive indicated in the indexed publication/BibTeX view.
- Targeted public discovery against **Zenodo, Figshare, OSF, Harvard Dataverse and public GitHub** using the exact paper title, authors, unique crawl size (1,502,865), and DOI found no deposit attributable to this 2016 crawl. A GitHub repository-title and code-index search for the exact paper name or authors produced only citations and conference listings, not the team's original crawler, historical host index, or HTTP data. Search-index incompleteness is a major limitation.
- [Publisher DOI](https://dl.acm.org/doi/10.1145/3038912.3052657) refused public retrieval (HTTP 403), so any ACM-only supplementary tab is **unknown**, rather than checked negative.

The only presently recoverable artifacts in this lane are study text, research presentation metadata and the dissertation. None names the original p56 target URL or yields a SHA-512-comparable original HTTP response entity. No unmotivated hash scan or re-crawl was run.

## Exact p56 input and required original-byte controls

Solved p56 prints the single 128-hex deep-web target:

```text
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

This is a **512-bit digest**, with SHA-512 an executable candidate rather than a proven choice. The historically authenticated **book-distribution** host is `ky2khlqdf7qdznac.onion`, which is **not shown to be** the digest's target host. Accordingly, the only decisive corpus-wide test would compare the single specified digest against all retained exact, original response-body bytes for which custodial access is permitted, including unknown hosts.

For an independent source-fidelity control, the preserved [2014 Onion7 index](../resources/cicada2014-onion7-index.html) is a 1,640-byte LF ASCII body with SHA-256 `9d515f2c170c44ab0f5acbdc7ba2de2be62cc07b132ab7f9609532b3b5622e80` and SHA-512 `83e50c118edb70dc34c9c760e332830a066b82006ebbbdcc7347b818d1961a571f32ef5a3717e98e282754d4a004dc0f7f0d99fb3824bb1b281a947c7ba70a31`. The index was established in [the existing source/hash study](../im-results/onion7_index_an_end_digest.md). An exact match would be a strong original-byte positive control **if that page and unchanged 2014 version were actually archived in 2016**; a changed page or absence is inconclusive.

The corpus may also contain URL metadata or page text yielding a new Cicada continuation locator even without exact original bytes. Such a URL would require independent dating and verification before being elevated to a key or cryptographic instruction.

## Decision and owner-gated next fork

**Current disposition:** no publicly usable byte-original EURECOM response has been located; no matched preimage; do not start an invented cipher-key search. Because the 2016 captures are a different date, collection mode and dataset from the 2014 DWM and 2016 DUTA routes, retain this as a **distinct optional custodial lane** under [owner authorization issue #784](https://github.com/FlareZ123/liber-primus/issues/784). No custodian has been contacted and no restricted dataset requested.

A single *owner-authorized metadata question* should first ask the study custodian whether the crawler retained **unmodified HTTP response-body bytes** in addition to delayed browser HTML, with exact original URL, UTC date and delimiters, and whether one controlled sample and its original network response is publicly releasable. **Only if that test is positive** ask whether a permitted local, one-digest SHA-512 equality search across original bodies is feasible, returning yes/no and one matching capture identifier rather than a large dataset or other unrelated host data. The known distributor host may be a positive control, not a required target filter.

Without authenticated bytes, the only credible positive outcome from this lane is a dated URL/HTML *clue* that sources a new plaintext/key experiment. Without either bytes or a dated clue, retire the **public deposit** path while preserving the unverified private-custody possibility. Related, independently distinct routes remain [#792 2014 Ahmia](https://github.com/FlareZ123/liber-primus/issues/792), [#786 Common Crawl WARC](https://github.com/FlareZ123/liber-primus/issues/786) and [#784 owner authorization](https://github.com/FlareZ123/liber-primus/issues/784).
