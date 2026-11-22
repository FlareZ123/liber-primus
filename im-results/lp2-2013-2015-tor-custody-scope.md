# 2013–2015 Tor-crawl custody: public evidence and access decision

**Decision (13 November 2026):** the TNO/Dark Web Monitor and Portsmouth/Searchlight lineages are real, distinct historical research/crawler programmes, but the public material does **not** establish a surviving, queryable host-level index for the Stage11 onion, nor preservation of its byte-exact HTTP response body. They remain actionable only through a narrow, owner-authorized custodian query. No page, digest preimage, key, unknown LP2 plaintext, or destination was recovered. This is a bounded access/coverage decision, not evidence that the page was never captured.

This report covers the 2013–2015 custody branch in #768. It does not repeat the 2016 EURECOM/DUTA work, the 2017 Archive Team WARC access gate, or earlier p56 digest-family tests; see [the consolidated p56 archive/hash report](archive-hash-preimage.md) and [Agent 1's contact handoff](../communications/broadcast/20261113T1411Z_agent1_academic-2014-onion-html-crawls.md).

## TNO / 2013 crawler → Dark Web Monitor → CFLW

### What the original research establishes

Spitters, Verbruggen and van Staalduinen's 2014 paper reports a December 2013 Tor collection with 5,725 known hidden services, 1,481 services with downloaded content, 11,557,357 known page URLs, 2,196,410 downloaded pages and 324,623 pages retained as usable content after preprocessing. The crawler downloaded HTML (not media or other file types), extracted text, filtered error/redirect pages and discarded very short texts. The paper also says the crawler had discovered almost 2,000 new hidden-service addresses over the preceding five months, and reports online-service measurements through May 2014. These are useful signs of a real continuing collection, but the table's corpus snapshot is December 2013 and the publication does not provide a public per-host capture index or specify retention of original HTTP entity bodies.

- [TNO repository record](https://repository.tno.nl/SingleDoc?docId=82829) identifies the original paper and says publication files require an email request to the TNO repository.
- [Paper PDF mirror](https://gwern.net/doc/darknet-market/2014-spitters.pdf) contains the dataset counts and preprocessing description. It is a paper copy, not the underlying crawl.
- [2018 TITANIUM D6.2 public manual](https://www.titanium-project.eu/docs/TITANIUM_D6.2_PUBLIC.pdf), pp. 110–111, describes TNO's Persistent Dark Web Monitor as a web service indexing forum posts and entire forums; it reports over 30 million posts and says a username/password login code is required. The separate Ephemeral Monitor requires TNO-provided SSH connection information/private key and browses pages cached from a marketplace crawl. This is not evidence that the generic 2013 HTML corpus or all its raw response bodies were migrated into the later monitor.

### Current custody is real, but retention is unproved

CFLW's [official product history](https://cflw.com/dwm/) says the Dark Web Monitor originated in TNO's 2013–2016 work, that TNO licensed it to CyberDevOps in November 2019, and that CFLW took over day-to-day administration from January 2020. The current product describes itself as a historical “wayback machine” for the Dark Web and advertises an API on its premium plan. The [2019 license announcement](https://cflw.com/2019/11/13/tno-licenses-dark-web-monitor-to-cyberdevops/) reports about 150,000 discovered domains by November 2019.

These sources establish a live operator and a plausible historical-query capability. They do **not** establish that the 2013/2014 crawler's URL inventory survives, that the Stage11 host was captured, that the original HTTP body survives, or that the current product's historical replay reaches back to May 2014. Product continuity must not be treated as proof of dataset continuity or byte fidelity.

**TNO branch decision:** no public host-level index/export was found. A custodian query remains worthwhile because the original crawler was operating in the relevant era and the present operator advertises historical replay. Ask CFLW to return metadata only for `ky2khlqdf7qdznac.onion` and the exact p56 target string, including any recorded date, URL/path, capture mode and whether the original unnormalized response body is retained. Do not request bulk data.

## Portsmouth 2014 crawl → Searchlight Cyber

Owenson and Savage's [2016 paper](https://ietresearch.onlinelibrary.wiley.com/doi/10.1049/iet-ifs.2015.0121) describes a six-month 2014 Tor study. The authors observed nearly 80,000 hidden services and chose a one-month HTML crawl toward the end of the study. Their crawler downloaded HTML, parsed key data points and stored those points in a database; it did not fetch images, media or JavaScript. The paper does not state that complete original response bodies were retained. The [University of Portsmouth record](https://researchportal.port.ac.uk/en/publications/empirical-analysis-of-tor-hidden-services/) notes that a post-print is unavailable.

Gareth Owenson's later association with Searchlight Cyber makes a current custodian query plausible. Searchlight's public [law-enforcement product FAQ](https://www.slcyber.io/outcome/law) advertises more than 15 years of historical dark-web intelligence. That is a broad product claim, not evidence that the Portsmouth study's 2014 dataset was transferred, that this specific onion host appears, or that Searchlight retains original HTTP bodies. The public pages examined expose no host-level index or downloadable 2014 dataset.

**Portsmouth/Searchlight branch decision:** a metadata-only question is actionable through Searchlight's [official contact page](https://www.slcyber.io/contact/) and, separately, the original researcher contact listed in the paper (`gareth.owen@port.ac.uk`). Ask whether the 2014 crawl's URL/database records or any transferred historical archive contain the exact Stage11 host, the p56 digest, or references to `59.txt`/`59.bin`; distinguish parsed fields from retained original HTML. No transfer of the academic dataset to Searchlight is established.

## Moore / Rid January–March 2015 crawl

This is a separate 2015 corpus, not the 2014 Portsmouth or TNO collection. The [published paper](https://doi.org/10.1080/00396338.2016.1142085) reports a crawl of 5,615 seed onion addresses, 5,205 responding websites and approximately 205,000 unique pages. Its contemporaneous technical annex, recovered and reviewed by Agent 13, describes HTML stripping, invisible-text/JavaScript removal, translation of non-English text, normalized-text hashing and exclusion of binary files such as `.bin`. That documented representation is unsuitable for a byte-exact raw-page preimage check. A surviving URL/link index or normalized text could still reveal a host or a Cicada-specific textual reference, but Agent 13 has already recorded this route and its limitation in [the research handoff](../communications/broadcast/20261113T1540Z_agent13_2015_moore_rid_tor_crawl.md). Do not duplicate its source search or treat it as a raw-body archive.

## What is missing, and the only useful next action

The decisive missing input is not another hash family or guessed serialization. It is a **custodian-side, metadata-only answer** from TNO/CFLW and/or Portsmouth/Searchlight:

1. Does the archive's seed/discovered-host index contain `ky2khlqdf7qdznac.onion`? Return presence/absence and any recorded dates.
2. Are there records for `59.txt`, `59.bin`, the exact 128-hex p56 target, or a page/link referring to Liber Primus?
3. If a host/page record exists, was it captured in content/collection mode or connectivity-only mode? Are original response bytes retained, or only extracted/normalized text and parsed metadata?
4. Only if exact original bytes survive, can the custodian perform a scoped, lawful digest comparison locally and report the exact byte framing and algorithm tested? The p56 text specifies a 128-hex digest but does not name SHA-512 or define the bytes to hash; SHA-512 is a first hypothesis, not an authenticated instruction.

The appropriate initial request is metadata only; no corpus export or potentially sensitive page content is needed. Agent 1's handoff contains the verified current contact paths and a draft inquiry. **No email, account registration, API request or external contact was made in this invocation** because the repository's maintainer-authorization condition remains in force.

### Final status

- TNO's 2013 collection and the current CFLW operator lineage: **ESTABLISHED**.
- A public 2013–2015 per-host index or exact Stage11 capture: **NOT LOCATED**.
- Portsmouth's 2014 HTML crawl and later Searchlight historical archive claim: **ESTABLISHED**, but dataset transfer and 2014 host coverage: **UNVERIFIED**.
- Moore/Rid 2015 raw-body availability: **NOT SUPPORTED** by the recovered technical annex; normalized-text/host-index use only remains possible.
- Exact p56 preimage, hash algorithm, serialization and destination: **UNRESOLVED**.

**Disposition:** close this bounded public-index/custody audit. Reopen only on a custodian reply, a published host-bearing index, or an independently accessible original-body capture. Do not repeat public source discovery, speculate that product marketing proves retention, or run another digest sweep without the missing source object.
