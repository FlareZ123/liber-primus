# Unqueried 2017 KAIST dark-web crawl as an AN END preimage witness

**Classification (Agent 8, 13 November 2026): independent archival input lead, not a discovered target page or Liber Primus key.** No new LP2 plaintext, recovered preimage, hash-algorithm selector or authentic puzzle continuation is claimed.

## Independent original research source

The peer-reviewed 2019 WWW paper *Doppelgängers on the Dark Web: A Large-scale Assessment on Phishing Hidden Web Services*, by Changhoon Yoon, Kwanwoo Kim, Yongdae Kim, Seungwon Shin, and Sooel Son, documents a **January–July 2017** Tor crawl that acquired **21,537,119 textual webpages**, observing **28,928 unique onion domains** and **13,326 unique second-level onion services**. The crawlers began with 10,000 onion addresses from Ahmia and FreshOnion, expanded their frontier through linked onion URLs, and collected textual content rather than arbitrary binary assets. These are the paper's measurements; **the archived original HTML, response headers, URL inventory, and continued custody have not been independently accessed in this investigation**.

Sources: [author-paper PDF, WWW 2019](https://syssec.kaist.ac.kr/pub/2019/yoon_www_2019.pdf), [published proceedings and DOI](https://doi.org/10.1145/3308558.3313551), [KAIST Web Security & Privacy Lab research index](https://wsp-lab.github.io/research/). A second KAIST study, *MFScope*, reports **27,665,572 webpages across 36,864 .onion domains**, collected **January 2017 through March 2018** ([NDSS 2019 paper, Table I](https://wsp-lab.github.io/papers/lee-mfscope-ndss19.pdf)). Because its authorship and collection periods overlap the 21.5-million-page study, these are **two publications describing potentially overlapping crawl material**, not proof of two independent retained archives. Their exact corpus relationship and availability remain unknown. Do not sum their claimed coverage without a manifest.

## Why this corpus is potentially consequential

The solved LP2 **AN END** page prints a 128-hex-character digest and explicitly says that an unidentified *deep-web page* hashes to it. The target bytes and known representation traps are documented in [the project's current preimage record](../im-results/archive-hash-preimage.md). The other surveyed academic crawls there are a May–June 2016 EURECOM/Deusto 1.5-million-page corpus and the smaller DUTA corpus. **The substantially larger KAIST 2017 corpus was not among the previously recorded leads**, and repository code search for its paper title and the exact count 21,537,119 returned no results at this checkpoint.

This is a testable new *data source*, not a new brute-force candidate generator. A crawl could preserve a 2014-vintage onion page that remained reachable in 2017, or could contain a link pointing to it. Neither paper gives evidence that the specific target was ever reachable, indexed, or retained. A 2022 NLP study ([NAACL 2022, CoDA paper](https://aclanthology.org/2022.naacl-main.412/)) notes that DUTA was then the only publicly available Dark Web corpus, so do not imply the KAIST raw crawl is freely downloadable. The old Tor v2 network has been discontinued, and the exact host of the target is still unknown.

## High-value, bounded recovery request

1. Determine whether the corresponding historical URL and content inventory remains in institutional custody or has been released by its authors. Do not infer a public download from the publication alone.
2. If the exact original HTML/HTTP bodies survive, compare each *unmodified* archived page body to the original p56 target under the currently documented candidate 512-bit digest families, preserving exact bytes and original URL/timestamp. Also check whether the source-known **`ky2khlqdf7qdznac.onion`** appears in the crawl's URL inventory, but remember that this is merely LP2's *distributor*, not necessarily the unknown hash-target host.
3. If a whole-corpus sweep is infeasible, ask the study's custodians only for a narrowly scoped target-digest match and/or a host/URL census. A preimage hit must supply the original response bytes, capture metadata and reproducible hash calculation; otherwise it is just an unverified claim.
4. If the corpus no longer exists, never contained the relevant onion host or has no candidate digest match after specified exact tests, retire precisely this archival lane. A negative is conditional on temporal coverage, storage fidelity and the chosen hash families; it is not evidence of impossibility.

## Decision

This creates a **distinct unexamined archival acquisition opportunity** with a causal route to the final puzzle's missing externally referenced page. It does not justify another unconstrained string/hash candidate battery against already-held Stage11 files, nor further unauthenticated cipher layering on the LP2 manuscript. Prioritize obtaining a manifest or direct author response about original page bytes before writing any sweeping program. If found, treat the target's page content as an externally sourced continuation and inspect for any actual key/instruction, then test its claimed effect on the original ciphertext.
