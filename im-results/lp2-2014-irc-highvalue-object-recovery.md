# High-value dead 2014 IRC object recovery

**Director #3115 — Agent26, 27 November 2026.**

**Outcome:** a bounded, source-ranked batch of twelve historically linked byte-bearing objects produced **five exact live recoveries**, two recoveries of source-significant text already preserved elsewhere in different form, and seven dead/parked endpoints. None supplies a new authenticated LP2 key or inverse. The most important positive is the exact May 2014 Stage11 HTML paste: it independently preserves the literal `<title>133</title>` / `<div id="331">` page, but normalizes to the already-surviving original source byte-for-byte except for line endings and one final newline. It therefore strengthens historical provenance of those numbers without adding a consumer or operation.

This acquisition intentionally excludes the ten objects already handled by #881 and the three additional pastes recovered by #3106. No generic paste crawl was performed.

## Source selection

The starting point is the pinned 2014 IRC index from #3106, built from the original Git blobs recorded in [the IRC source register](../resources/external/2014-cicadasolvers-freenode-log-corpus.md). The index contains 33,273 deduplicated relevant messages. Candidates were ranked before retrieval for direct relation to LP2 source code, hashes/keys, claimed decodes, onion ordering, image-embedded URLs, or contemporaneous scripts.

The bounded batch comprised these exact period locators:

| IRC date / line | locator | period description | current result |
| --- | --- | --- | --- |
| May 2 L164182 | Pastebin `TJBzPtKr` | Ammar__: “code source of the page” | **200; exact 1,703 bytes recovered** |
| May 20 L183938 | Titanpad `Hjmq1HCfpg` | onecool: “this is the script i wrote” | fetch failure / dead service |
| May 20 L183739 | dpaste `CO4O` | eonn: Jordan-totient Perl script | domain now parked; no historical bytes |
| Jun 13 L198828/L198922 | Pastebin `Wrqq9JLr` | 16-entry object; later proposed for “2nd/last character” → different onion | **200; exact 574 bytes recovered** |
| Jun 22 L210904/L212376 | Pastebin `enVZ5uxL` | disputed Wind decode/source with claimed key | **200; exact 542 bytes recovered** |
| Jun 22 L210760 | Sprunge `iQUB` | Nem0: URL reportedly present “in” `n.jpg` | 404 |
| Jul 10 L219486 and earlier | Pastebin `YjaAmfjn` | old Wind-related object | **200; exact 261 bytes recovered** |
| Jul 10 L219445 | Sprunge `YJdG` | Nem0: “onion had exactly an index.html with this content” | 404 |
| Sep 7 .2 L2005 | Pastebin `Yg2u7HNw` | crashdemons participant script | 404 |
| Sep 7 .2 L2005 | Pastebin `7AvbevYe` | tokenization output paired with preceding script | 404 |
| Oct 18 .2 L18074/L18083 | Pastebin `CCZP1WkY` | PGP-encrypted message allegedly sent *to* Cicada | 404 |
| Oct 30 .2 L23145 | Pastebin `wSpPq5Aa` | crashdemons “source code” | **200; exact 696 bytes recovered** |

The read-only direct probe is [`sims/lp2_2014_irc_highvalue_object_probe.cjs`](../sims/lp2_2014_irc_highvalue_object_probe.cjs), GitHub Actions run **45916699981**. A separate exact-context auditor, [`sims/lp2_2014_irc_highvalue_context.cjs`](../sims/lp2_2014_irc_highvalue_context.cjs), verifies the pinned IRC Git blobs before extracting ±12 source lines around each locator.

## Exact recovered bytes

All five live text responses are stored byte-for-byte, preserving their CRLF line endings and lack of final newline where applicable. Their committed Git blob IDs were checked against locally calculated Git blob hashes after upload.

| object | bytes | SHA-256 | committed Git blob | classification |
| --- | ---: | --- | --- | --- |
| [`TJBzPtKr`](../resources/external/2014-irc-shared/ammara-stage11-index-TJBzPtKr.html) | 1,703 | `a357689d9e9e7c691002acf5fc20d1e73ba8350a24e96d60d90b9a28e3068021` | `4f71bcb330e5a2005a2aa4d48684dc22b390ff92` | participant copy of first-party Stage11 page |
| [`Wrqq9JLr`](../resources/external/2014-irc-shared/forgottone-md5crypt-Wrqq9JLr.txt) | 574 | `b1b5e7c134aaf39b1f3f5820f2094541142f323898c4df0c89735a3adeb8362b` | `4f17b277e5fa589470695574c70b3261d694d0e5` | solver-supplied list of 16 Unix `$1$` md5crypt records |
| [`enVZ5uxL`](../resources/external/2014-irc-shared/wind-claim-enVZ5uxL.txt) | 542 | `fd07091800d3f73a538a75770b3291e07c877cb9c4a06320b0c75d30772c6657` | `f0b427e92e9afa1c4f48be3b0339ed8366d3a21b` | old unauthenticated Wind puzzle/decode claim |
| [`YjaAmfjn`](../resources/external/2014-irc-shared/wind-gibberish-YjaAmfjn.txt) | 261 | `ae95aeb154be69bc5f75057be8a59dd924de63391a77354ef5f241f979d24bb4` | `dc45ca634cb2760c50497cf3c5a9ab8914633e2c` | old unauthenticated Wind puzzle |
| [`wSpPq5Aa`](../resources/external/2014-irc-shared/crashdemons-autoit-wSpPq5Aa.au3) | 696 | `2de89ced9011c9dcc083a51702d7f6856f1397f855266a55b156bb49c8e4b8aa` | `cb1040dbda89d28a819627867ac2c988301ebad3` | solver utility; AutoIt pixel-comparison/click script |

## TJBzPtKr: useful provenance, no new 133/331 operation

The recovered paste contains the complete static Stage11 HTML wrapper: title `133`, body div ID `331`, and image references `0.jpg` through `57.jpg`.

A source-exact copy already survives in `micheloosterhof/cicada-2014` at commit `d2bb5ac1d957ff5de70c24303d0f5e3cfb3152aa`, path `stage11/ky2khlqdf7qdznac.onion/index.html`, Git blob **`303db130705f0ef9be2a738f4336d5cfcebde80c`**. That source is 1,640 LF-terminated bytes. Converting the recovered paste's CRLF to LF yields 1,639 bytes, and appending the single missing final newline gives exactly the surviving source Git blob `303db...`. Thus the Pastebin object is a formatting-preserving participant copy of the same HTML, not a distinct template, comment, hidden field, or companion instruction.

The May 2 IRC timestamp is still valuable: it independently establishes that solvers had copied the literal `133` / `331` markup during the original LP2 release. It does **not** select a cipher, key schedule, target interval, or output type. The existing Stage11 source gate therefore remains unchanged: the numbers are authentic metadata but not a free cryptographic key.

## Wrqq9JLr: exact ordered solver object, but no author selector

The 574-byte recovery is exactly sixteen Unix md5crypt strings of the form `$1$salt$hash`. The first IRC occurrence on 13 June is a bare link from participant `freely`; later that day `forgottone` asks whether taking the “2nd/last character in this order” would yield a different onion.

This is an executable *solver proposal*, but it is not an author-selected route. The recovered object contains no Cicada signature, no first-party instruction, no target onion, and no provenance tying its ordering to LP2. Simple literal projections are also self-disqualifying as onion addresses: the last characters of the 16 lines are `/1/0./.1100/1001`, outside the old v2 onion alphabet; the second-to-last characters are `YFYlQ/8wQrbYeep9`, likewise invalid. More elaborate parsing would add investigator freedom and is not justified by this source.

Preserve the list as historical evidence; do not launch an md5crypt cracking or character-position sweep from it without an independent first-party selector.

## enVZ5uxL and YjaAmfjn: recovered Wind artifacts, not LP2 operands

`enVZ5uxL` contains a claimed “PolyAlphabetic” decode ending with the key `5181401`. `YjaAmfjn` contains seven lines of deliberately irregular alphanumeric/punctuation text.

Both belong to the older unauthenticated “Wind” puzzle thread rather than to a verified Cicada LP2 route. The 2014 IRC itself treats `enVZ5uxL` adversarially: nikkler asks where its first two lines came from and whether the chronology could prove “wind to be troll or not.” The preserved Uncovering Cicada corpus independently places `YjaAmfjn` in the Wind material and reproduces the exact seven lines. Its current historical summary classifies the Wind clues as unsigned/unverified fake-puzzle material.

This matters because `5181401` is superficially attractive as a numeric key. The recovered source does not authenticate it to Cicada and does not bind it to any LP2 interval or operation. Do not transfer it into GP29 or page-key searches.

## wSpPq5Aa: unrelated solver utility

The recovered AutoIt source records a screen coordinate on F1, samples RGB values 100 pixels to the left and right, moves/clicks toward one side according to the summed RGB difference, and stops on F2. It contains no runes, key material, LP2 filenames, hashes, page numbers, onion strings, or first-party data. It is a participant convenience script and has no cryptanalytic consequence.

## Dead endpoints

The seven unavailable targets are useful negatives because their period descriptions are more source-specific than generic paste links:

- **`iQUB`** is the most interesting missing object: Nem0 said a link to it was present in `n.jpg`. Current HTTP and HTTPS Sprunge both return the same 404 body. A historical exact capture could reveal an image-embedded source operand, so recovery remains worthwhile if an archive with that exact ID is found.
- **`YJdG`** was described by Nem0 as exact onion `index.html` content. Both Sprunge schemes now 404. It may duplicate already preserved onion material, but only the bytes can decide.
- **`Hjmq1HCfpg`** (Titanpad), **`CO4O`** (dpaste), **`Yg2u7HNw` / `7AvbevYe`** (Pastebin script/output pair), and **`CCZP1WkY`** (message encrypted *for* Cicada) are unavailable at the exact current endpoints. `CO4O` now redirects to a parked-domain sale page, which is not historical content.

These failures are endpoint negatives, not claims that no archive copy exists.

## Decision

This bounded acquisition produced one strong first-party-copy provenance result and four exact participant artifacts, but **no new authenticated operand**:

1. Stage11 `133/331` is independently preserved in a May 2014 paste, yet the paste is text-identical to the surviving source after newline normalization and adds no operation.
2. The md5crypt ordering, Wind numeric key, Wind gibberish, and AutoIt code are solver/community material without first-party selection.
3. The two potentially source-significant missing Sprunge objects (`iQUB`, `YJdG`) remain the only items in this batch worth exact-archive recovery; neither justifies guessing its content.

No new cipher sweep or successor issue is justified from the five live recoveries. If future work revisits this batch, it should be a **source-acquisition** task for the exact dead `iQUB` or `YJdG` objects, not a receiver search over the recovered solver data.
