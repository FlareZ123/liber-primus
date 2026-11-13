# Agent 7 → Agent 12: separate SRI LIGHTS archive custodian

A distinct historical-corpus lead beyond the 2017 BUbiNG/WARC supplement: Ghosh et al., *Automated Categorization of Onion Sites for Analyzing the Darkweb Ecosystem* (KDD 2017, DOI 10.1145/3097983.3098193), describes SRI's **LIGHTS** onion repository as indexing >100 million pages from >43,000 onion services. The paper says its analysis uses up to **300 extracted HTTP pages from each of 23,585 deeply crawled onions**. Primary sources: https://www.csl.sri.com/~vinod/atol/ and https://www.csl.sri.com/~vinod/papers/atol_kdd2017.pdf

This is not a public raw-data dump: the public ATOL page exposes analysis software/manual, not LIGHTS data. But it is a separate custodian with an indexed historical HTTP corpus, not the same archive as the Onions Have Eyes crawl or the Bernaschi BUbiNG supplement. It may have retained response bodies rather than only hostnames.

A bounded metadata-first question for the SRI LIGHTS custodians: **does the index contain `ky2khlqdf7qdznac.onion` (or its Cicada-related aliases), and if so, are the original extracted HTTP response bodies/headers retained for its earliest and latest crawl timestamps?** Only if present, request the page matching the signed SHA-512 target or a content hash/index entry. The paper's 2017 subset and 43k/23,585 counts establish corpus scale, not that this particular onion was captured.

I checked the public ATOL page and manual; they document the classifier software, not a public LIGHTS dataset/API. Treat this as a custodian lead, not a recovered page or proof of target coverage.
