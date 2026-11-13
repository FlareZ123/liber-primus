# Agent 1: possible unsearched *contemporaneous* Tor HTML collections for the AN END preimage

**Research handoff, 13 November 2026. No recovered page or plaintext.** This is distinct from the 2017 Archive Team WARC (#764), Common Crawl's 2014 clearnet ZIP-mirror census, and onion7's known 2014 original homepage.

Two pre-2016 academic studies directly **downloaded hidden-service HTML**, rather than only indexing .onion domains:

1. Gareth Owen and Nick Savage, *Empirical analysis of Tor Hidden Services* ([IET 2016](https://doi.org/10.1049/iet-ifs.2015.0121); [Portsmouth research record](https://researchportal.port.ac.uk/en/publications/empirical-analysis-of-tor-hidden-services/)), collected approximately **80,000 onion addresses over six months in 2014** and crawled HTML for content classification for approximately **one month toward the study's end**. The published methods explicitly say they retained HTML (no images, media or JS). [Accessible methods excerpt](https://ietresearch.onlinelibrary.wiley.com/doi/10.1049/iet-ifs.2015.0121). There is no verified public raw-HTML dataset URL in this handoff.
2. Daniel Moore and Thomas Rid, *Cryptopolitik and the Darknet* ([2016 full-text](https://www.tandfonline.com/doi/full/10.1080/00396338.2016.1142085)), crawled onion HTML **January–March 2015** at up to 100 pages per host and five hops, resulting in about **205,000 unique pages** across 5,205 live hidden websites. Their starting addresses came from onion.city and Ahmia. Again raw corpus access is unverified.

Potential contemporaneous third source: Bernd Spitters et al., *Towards a Comprehensive Insight into the Thematic Organization of the Tor Hidden Services* ([2014 study PDF](https://gwern.net/doc/darknet-market/2014-spitters.pdf)), reports more than two million HTML downloads and notes crawls continuing around May 2014; its December 2013 table alone cannot confirm post-May-2014 coverage. Raw data location unverified.

**Decisive test if lawful non-sensitive raw HTTP content survives:** Ask data custodians to perform a *local hash lookup*, avoiding disclosure or transfer of potentially unlawful site content. First check whether exact host `ky2khlqdf7qdznac.onion` appears among captured origins. Separately, hash every retained original response-body byte string under SHA-512 and compare against the *printed, solved p56 AN END target*:

`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`

The 128-hex target does **not** authenticate SHA-512 or an exact webpage serialization, so raw-body SHA-512 is the smallest, explicit first hypothesis. A match to the original body bytes would be decisive. No match after full digest coverage closes only that exact hashing convention. If the raw HTML was preprocessed or retained only as text/feature vectors, the test cannot be counted as full raw-byte coverage. Recovered benign content would still require its original date, URL and source digest. Do not treat public community mirrors as new period captures.

There is no permission to assume access to private academic data, and this broadcast does not claim the data still exists. This source class merits a **single targeted dataset-availability inquiry or public raw-dataset discovery**, rather than another generic archive sweep or arbitrary cryptanalytic fit.
