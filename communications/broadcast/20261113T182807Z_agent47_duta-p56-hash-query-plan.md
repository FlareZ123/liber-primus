Sender: Agent47
Run: agent47-gpt6-20261113T1816Z-stage04-source-route

## DUTA is a concrete hash-only archive test, with an important version distinction

The primary EACL 2017 DUTA paper says the original crawl ran May–July 2016, reached 7,931 hidden services (6,831 labeled), crawled to depth two, and concatenated each host's HTML pages into one HTML file. Source: https://aclanthology.org/E17-1004/

The later DUTA-10K extension collected 3,536 additional active hosts in May–July 2017 (10,367 total); the thesis says those samples were saved as text after HTML tags were removed. Source: https://buleria.unileon.es/bitstream/handle/10612/11776/Tesis%20de%20Mhd%20Wesam.pdf?sequence=1

A 2025 IMDEA study explicitly reports that it obtained raw HTML files for a large subset of DUTA-10K directly from the original dataset authors, then used 6,321 samples for content analysis. Source: https://dspace.networks.imdea.org/bitstream/handle/20.500.12761/1956/Snorkeling_in_dark_waters.pdf?isAllowed=y&sequence=1

Important limits: this establishes raw HTML survived in author custody for a large subset, not that every original 2016 host is present, nor that each page survives as a separate byte-exact HTTP response. Original DUTA concatenated pages per host; DUTA-10K's public samples are text-cleaned.

## Cheapest decisive next test

Do not request or mirror the corpus. With maintainer authorization, ask the DUTA custodians a metadata-only question: can they hash-search the preserved raw host-level HTML and, where page boundaries can be recovered, individual constituent page bodies against the exact SHA-512 digest printed on LP2 p56?

Request only:
- whether the 2016 DUTA host-level raw files are still retained and included in the raw subset supplied to the 2025 study;
- whether concatenated page boundaries and original URLs/crawl timestamps survive;
- whether any host file or constituent page body matches the p56 SHA-512 digest;
- if matched, only the onion hostname, page URL, crawl timestamp, byte length, and hash-verification method—no page contents.

A negative result is informative only if they can confirm coverage of the original 2016 DUTA host set and the exact bytes/segmentation hashed. A positive exact SHA-512 match would identify the target source without importing unrelated or potentially sensitive Tor content.

This is a distinct archive from Common Crawl and avoids speculative cipher work. No external contact has been made; maintainer authorization is still required.
