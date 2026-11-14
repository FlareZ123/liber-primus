# The 2017 ArchiveBot `1711141131131.xyz` HTML: exact indexed payloads recovered, no Cicada continuation

**Agent4, 14 November 2026, Director #948. Source decision:** Recoverable public Wayback replays exactly match both published historical CDX SHA-1 payload digests. The exact source WARCs are access-restricted, and the replayed HTML is an unauthenticated third-party 2017 puzzle, with **no supported source pointer to the original 2014 LP2 cipher or solved p56 target page**. Neither recovered HTML body hashes to the original p56 digest under SHA-512. No original unknown LP2 plaintext, key or destination is recovered.

## Fixed archival sources and byte identities

The [ArchiveBot host item inventory](https://github.com/JustAnotherArchivist/archivebot-archives/blob/master/archives/items/falconk_archivebot_1711141131131_xyz_20170629.yaml) lists `1711141131131.xyz-inf-20170629-043925-ewtko-00000.warc.gz`, **22,508,403 bytes**. The [separate www item](https://github.com/JustAnotherArchivist/archivebot-archives/blob/master/archives/items/falconk_archivebot_www_1711141131131_xyz_20170629.yaml) lists `www.1711141131131.xyz-inf-20170629-044401-1z9jb-00000.warc.gz`, **9,302 bytes**. Both exact Internet Archive download requests returned **HTTP 401 Unauthorized** on a 2026-11-14 Windows Actions runner. Anonymous Archive.org item metadata identified the requested WARC filenames but reported `metadata["access-restricted-item"] == "true"` for both items. **Their original WARC records remain inaccessible; do not claim a raw WARC replay.** No restriction bypass was attempted.

Independent public [2017 CDX inventory](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/corpus/A-primary-artifacts/_logs/cdx_1711141131131.xyz.txt) pins two literal URLs and timestamps. Their Wayback `id_` replays were fetched on the Windows runner and hashed, producing:

| Indexed 2017 HTTP capture | Exact replay entity bytes | Replay SHA-1 base32 = CDX payload digest | Replay SHA-256 | Replay SHA-512 matches p56? |
| --- | ---: | --- | --- | --- |
| [2017-06-29 04:39:35 UTC domain root](https://web.archive.org/web/20170629043935id_/http://1711141131131.xyz/) | **7,063** | `GPMGLFNUMSJSUJVXPZSRAZPQJBVLRDPV` = **yes** | `2bcfba6bbd27738ba3bab0033713d4fc533be8f1a26b5b55de3d7274c79c590b` | **no** |
| [2017-06-16 04:27:51 UTC /092317.html](https://web.archive.org/web/20170616042751id_/http://www.1711141131131.xyz:80/092317.html) | **971** | `7YVF4J7SVN5YO4VRCDYQG52ACLAP7V2O` = **yes** | `1c9fc79532c2f39bb384aa6d995309d85f037e57703df64127a99d294efe7f46` | **no** |

The historical CDX figures **4,521** and **680** are *WARC record lengths*, not HTML entity-body byte counts. The SHA-1 equality demonstrates that the actual replay body matches the Wayback indexed **payload** for each capture, not merely a same-title page or a present-day redirect. Because the replay and CDX digest share archival provenance, this is **not an independent attestation of exact 2017 on-wire transfer/content encoding**. No other byte normalization was guessed or hashed.

## Original-source visible contents and outbound assets

The recovered June 29 root HTML contains a title **`Elsa ~ 628`**, short puzzle prose involving "Alice and Bob", embedded autoplay audio references, styling, an image and a PNG. The HTML parser extracts **exactly five direct media/anchor targets** from the stored body, all relative to its same domain: `MasterCicada1.mp3`, `July5th.mp3`, `Kees.mp3`, `QII.jpg`, `30.png`. These are **third-party filenames** and are not a first-party signed Cicada program, decoder or key. No target media bytes were fetched because the issue concerns the exact two HTML entities, and no sign or link selects any target as a 2014 LP2 operand.

The June 16 `092317.html` is a standalone HTML/JavaScript clock setting `new Date("Sep 23, 2017 12:00:00")`, then computing a countdown for display. It has no outbound links. Its clear calendar date is a 2017 destination in that site, not an original Cicada 2014 instruction.

Across both recovered bodies, the scan finds **no PGP-signed block**, **no literal `.onion` address**, **no `uRkNsGsa`**, **no `3301` literal**, and **no printed p56 128-hex target**. The root contains the term "Cicada" in an audio filename, which alone does not authenticate provenance. These narrow absence statements refer to the two exact bytestrings above, not the whole 2017 website or missing historical infrastructure.

The full 128-digit p56 target was compared against SHA-512 of each recovered entity. The domain root SHA-512 is
`d37740dcf0af6f271fa8dcc959167ebde0a10fb7001498a5a1ddca71d1be76a4163e9c77acc404b908dbd733ff150b6506f0a4283be0f4c5b4d39088e7549620`.
The countdown SHA-512 is
`0b739a3074c38b860a204fac5de23ca64d4ef45db1300d4c3ac1c78165a0401944513803c770b8710e391599fbb6c6f12b65340aa8d15c92d2b154da1dcd882a`.
**Neither matches the printed p56 target**. No unselected hash-encoding alternatives were tried, and the unknown historical p56 hash algorithm remains unresolved.

## Reproduction and decision

[Standalone Windows/Python 3.12 source check](../sims/lp2_p56_2017_archivebot_warc_http_sft.py) downloads only the two identified ArchiveBot WARC objects when permitted, prints the HTTP 401 plus public item access flag if denied, then fetches the two source-indexed `id_` captures. It computes SHA-1 base32 alongside the exact registered CDX digest, SHA-256/SHA-512, extracts source-provided links, screens source-specific markers, and records source-date provenance without modifying bytes or inventing extra candidates. [Successful exact-body Windows Actions run 43648162111](https://github.com/FlareZ123/liber-primus/actions/runs/43648162111); [earlier successful index-equivalence run 43648040128](https://github.com/FlareZ123/liber-primus/actions/runs/43648040128). The initial WARC-only error run 43647820988 established the access blocker before graceful replay fallback was added.

**Director fork:** This exact 2017 ArchiveBot source is **not a supported p56 preimage or first-party LP2 continuation**. The provenance gap is decisive: a 2017 third-party HTML page with unverified Cicada attribution cannot assign a key or original cipher. Do not spin further hash variants or harvest linked media on this evidence. Reopen only for a newly authenticated first-party connection or a source-supported original webpage preimage. Genuine remaining archival leads include a 2014–2016 Cicada-host response preserved as original content, the missing 2016 `uRkNsGsa.htm`, or a source specifying the p56 hash contract.
