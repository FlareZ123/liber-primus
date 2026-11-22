# Gwern DN Archives (2013–2015): independent participant mirror, not a p56 response index

**Agent 1, 15 November 2026 · Director task #1111. Decision: a new public historical corpus exists, but the accessible evidence does not qualify it as a p56 byte-preimage source.** This is a bounded coverage/source gate, not a digest test or a claim that the target was absent.

## Why this corpus is distinct

Gwern Branwen's [Dark Net Market Archives (2013–2015)](https://gwern.net/dnm-archive) is an independently published collection of roughly **89 Tor Bitcoin markets and 37+ related forums**, based on daily or weekly scrapes from 2013–2015. The publisher describes about **4,438 mirrors / 43.6 million files**, roughly **50 GB compressed** and about **1.6 TB uncompressed**. The files are distributed as dated, service-specific tar.xz archives, with a public [file directory](https://gwern.net/doc/darknet-market/dnm-archive/file/index). This corpus is outside the previously audited Arquivo.pt, Wayback, Common Crawl and ArchiveTeam-Tor index cohorts.

The public file directory exposes source-dated forum subarchives including `thehub-forums-20140420-whom-astorposts.tar.xz` and `agora-forums-20140421-whom-astorposts.tar.xz`, as well as larger `thehub-forums.tar.xz` and `agora-forums.tar.xz` objects. The Hub 20 April 2014 subarchive is the most plausible narrowly bounded starting point **if** an original participant record links Cicada to a specific Hub thread.

## What the published index actually preserves

The archive is a participant-published mirror of scraped HTML, not a WARC collection. The publisher says the archives are date-stamped, service-specific wget-style directory trees; the public directory indexes the archive tarballs, not individual response URLs or HTTP records. No original response headers, transfer metadata, or complete page-URL-to-file index is exposed by the public file listing. A saved HTML body may preserve useful content and links, but it is not automatically the exact on-wire response entity.

A separate public GitHub project, [ADA-2019/Project](https://github.com/ADA-2019/Project), cites the same DN Archives and publishes a small Agora-derived subset. Its [README](https://github.com/ADA-2019/Project/blob/master/README.md) documents a date/service hierarchy; its [data README](https://github.com/ADA-2019/Project/blob/master/data/README.md) shows that the archived Agora forum HTML contains original onion-host links.

A concrete format positive control is `data/agora-forum/2015-05-11/index.php?action=stats`: 34,734 bytes, Git blob SHA `50483b2bad02ddddb115e41b8eb0d7d211aa413e`. The body preserves links to `http://lacbzxobeprssrfx.onion/index.php?action=help`, `...action=search`, and `.../index.php`; the date folder supplies the 2015-05-11 snapshot date and the path preserves the `index.php?action=stats` route. This proves that at least one dated mirrored page body retains its original host/path. It does **not** prove original HTTP headers or wire-byte fidelity.

The accessible ADA-2019 subset contains only one Agora market date (`2014-04-06`) and one Agora forum date (`2015-05-11`). Exact searches across that repository for the p56 digest, `Cicada 3301`, `Liber Primus`, `uRkNsGsa.htm`, the known distribution onion, and the solved sixth-onion address returned no hits. This is a negative only for that small public subset, not for the full 50-GB DN Archives collection.

## Why no p56 hash test is justified

The full DN Archives corpus is market/forum-focused; no first-party Cicada source currently selects one of its services or pages as the p56 target. The target URL remains unknown, and the public archive directory has no page-level URL index with which to query an unknown host. Searching all 43.6 million files or hashing reconstructed HTML without a source-selected host/path would be an unconstrained corpus sweep, not a causal test of the p56 instruction.

No candidate body was retrieved, no hash-family or newline/canonicalization sweep was run, and no digest preimage, LP2 key, plaintext, or destination was recovered. The accessible HTML mirrors are not sufficient to establish an exact original HTTP response boundary.

## Smallest missing source and decision

The minimum useful new input is a **source-dated 2014–2016 participant citation naming a specific DN Archives service/thread URL** (preferably an exact The Hub thread URL) as Cicada-related, plus a page-level mapping from that original URL and capture date to the archived file. If that witness appears, retrieve only the corresponding dated subarchive, preserve the exact stored body and URL/date mapping, and test the fixed p56 digest under a small predeclared contemporaneous 512-bit family and explicit raw-body framing. Do not download the full archive or contact private custodians on this evidence alone.

**Disposition:** one genuinely distinct public historical mirror identified; its archive-level file index and sample HTML are real, but no Cicada-linked page or source-selected target URL is present in the accessible evidence. It is not a qualifying p56 preimage corpus until a dated Cicada-to-page witness and page-level URL/body mapping are supplied.

## Sources

- [Gwern, Dark Net Market Archives (2013–2015)](https://gwern.net/dnm-archive)
- [Gwern archive file directory](https://gwern.net/doc/darknet-market/dnm-archive/file/index)
- [ADA-2019/Project dataset description](https://github.com/ADA-2019/Project)
- [ADA-2019 data structure description](https://github.com/ADA-2019/Project/blob/master/data/README.md)
- [ADA-2019 archived Agora forum positive-control HTML](https://github.com/ADA-2019/Project/blob/master/data/agora-forum/2015-05-11/index.php%3Faction%3Dstats)
- [Existing p56 archive synthesis](../results/README.md)
