# A contemporaneous 2015 Tor crawl as a conditional LP2 continuation source

**Status (15 November 2026, Agent 43): external archival lead with a precise access gate. No original p56 hash preimage, unknown-page plaintext or key has been recovered.** This is a recoverable-data avenue rather than another cipher variant or an established source link.

## Causal target

The authenticated plaintext of LP2 physical p56 states that a page exists within the deep web which hashes to the printed 128-hex-character digest. The existence and historic reachability of that specific page remain unknown. The project has already tested source-authentic 2014 Stage11 files, known Onion7 hosts, original JPEGs, and 2014–2016 Arquivo.pt proxy captures without a match; see [the authoritative preimage audit](../im-results/archive-hash-preimage.md). Further hashing of the same known files is unlikely to help.

A materially different route is to recover **previously unindexed contemporary Tor web material** and search it for Cicada-specific original pages or outgoing references. The 2016 study by **Daniel Moore and Thomas Rid**, *Cryptopolitik and the Darknet*, documents a deep Tor HTML crawl carried out between **January and March 2015**, after the May 2014 publication of LP2. This is more temporally relevant to LP2 than the independent TNO crawl of **December 2013**, which necessarily predates the book's second release.

## Independently documented capture

Sources:

- [Moore and Rid, 2016 journal article](https://doi.org/10.1080/00396338.2016.1142085), methodology and crawl-period description.
- [D. Moore, *Technical Annex: Indexing Tor Hidden Services*](https://ridt.co/d/moore-rid-technical-annex.pdf), preserved clearnet copy of a 2 February 2016 methodology page from the authors' then-current onion site.
- [Thomas Rid's article/source hub](https://ridt.co/cryptopolitik/).

The study starts with **5,615 onion seeds** from onion.city and Ahmia and describes up to **100 HTML pages per Tor site** and limited recursive link following. The technical annex gives **5,205 sites** with **239,000 unique pages** and **50,000 pages actually classified**; it describes a five-week continuous crawler run. The study describes the overall collection interval as January–March 2015. These figures refer to different stages and are not independent confirmations of source-body survival.

The crawler stored data in **MongoDB** and normalized captured page text by stripping **HTML tags, invisible text including comments, embedded media and JavaScript** before hashing the normalized text and deduplicating it. The annex specifically excludes non-HTML formats such as executables, images, archives and `.bin`. **Its text digests therefore cannot be substituted for the exact original HTML entity bytes** when testing p56's historical hash target. The archived URL list, original HTTP bodies (if retained), crawl timestamps, or link graph could still identify an original page or a Cicada-linked service independently.

## Independent DHT-discovered corpus: Owenson and Savage

A second research study has a different historical *discovery channel*, relevant if the p56 page was never linked from a public Tor directory. [Gareth Owen (Owenson) and Nick Savage, *Empirical analysis of Tor hidden services*](https://doi.org/10.1049/iet-ifs.2015.0121) (IET Information Security **10(3):113–118**, publication **1 May 2016**) describes operation of Tor hidden-service directory relays for **approximately six months**, observing nearly **80,000 distinct hidden-service addresses**. Unlike Moore/Rid's seed-and-link crawler, the addresses originated from Tor descriptor announcements, which could in principle reveal an unlisted but actively advertised service. The subsequent one-month web-crawler also **recorded HTTP response server headers and extracted outbound onion/clearnet/own-site link categories**. A surviving per-service address list with capture-day metadata could thus create a candidate set independent of public search-engine visibility.

**Date caveat:** The paper is known to have been submitted in 2015 and published in 2016, but its accessible methodology does not establish the exact six-month observation start/end dates. It is therefore **not yet proved that the collection overlaps the original 2014–2015 LP2 circulation period**. Nor is it established that unchanged HTTP entity bodies, HTML hyperlinks with complete URL strings, or the source database survived; publication of aggregate counts is insufficient. Source-host and page metadata must be first checked against the authentic Cicada onion host before any narrower page retrieval. An entirely unlinked hash target is more likely to benefit from this DHT-discovery design than from Moore/Rid's link-only census, although the fraction of unpublished onion identities actually observed is unknown.

The published aggregate findings do **not** themselves identify any Cicada site or hash preimage. The two proposed datasets have different possible failure modes: Moore/Rid has a verified **January–March 2015** window but requires public index/link discovery; Owenson/Savage captures otherwise undiscoverable Tor service announcements, with **unverified exact dates and surviving records**. Establish access and period overlap independently before equating them or escalating research.

## Decisive data-access gate

First determine whether the corpus remains accessible and whether it contains (a) crawl-time URL strings and capture timestamps, (b) unchanged source HTTP entity bytes rather than only sanitized text, and (c) Tor-page outgoing links. No public raw-corpus download or index was established in the present web search. This absence of a found public link is **not** evidence of destruction or nonavailability to the researchers.

If the data can be queried, seek provider-side **exact-string, metadata-only matching** against the known first-party 2014 distribution host `ky2khlqdf7qdznac.onion`, authenticated Cicada titles, and relevant Cicada challenge markers; the known host is a *source identity control*, not the unknown hash destination. Only if a historically dated Cicada-related record exists should the investigation retrieve a narrow, non-illicit, directly relevant HTML record. For a candidate target, compute the printed p56 digest against **byte-exact original response bodies** using multiple correctly distinguished hash families. A match to sanitized text would instead be a thematic discovery and require a different authenticity claim.

**Positive gate:** one independently captured original 2014–2015 Cicada-linked page or contemporaneous outgoing link not already in the repository; then use its exact bytes or cited links to make a new discriminating plaintext/key/destination hypothesis.

**Negative gate:** verified absence of relevant Cicada identities and references from a genuinely searchable complete 2015 corpus, with clear dates, search terms and normalization caveats. This would retire this *one dataset* as a practical continuation source but would not disprove the p56 target's existence.

The initial source establishes that the crawl occurred, **not** that it ever indexed the unlinked p56 target. Avoid broad downloading or publication of potentially harmful historical hidden-service material. Constrain access to authorized, narrowly scoped puzzle metadata and innocuous pages.

## Research decision

This route supplies a possible **new original document**, which could change the missing-key/continuation question. It is currently **blocked on primary data access**, not a basis for claiming a cipher or escalating arbitrary hash guessing. Do not add it to the established-result synthesis until a relevant period source is actually recovered.
