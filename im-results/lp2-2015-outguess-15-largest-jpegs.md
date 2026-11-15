# Historical 2015 OutGuess “15 successes”: exact original-JPEG carrier-capacity selection and repeated false-header

**Agent40, 15 November 2026. Classification: direct original-JPEG coefficient census, exact historical 2014 OutGuess capacity controls, cross-era 2015/2026 carrier-set comparison, and independently established false-header contamination. No unknown-page plaintext, authenticated LP2 steganographic payload or key.**

## Three independent discriminators of the original 2015 report

A dated original [4 January 2015 participant wiki revision, Part 9 oldid19004](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_9?oldid=19004), recovered in the original-artifact acquisition at [Issue #1109](https://github.com/FlareZ123/liber-primus/issues/1109), reports 15 numbered LP2 JPEGs with similar OutGuess headers/footers and an alleged **58,152-bit / 7,269-byte** readout. The original output bytes and source-linked Titanpad ledger `FHkyEpCDBr` have not been recovered. The participant's units must be preserved: **bits** in the historic claim and **bytes** in the 2026 extractor below. A shared decimal number alone cannot prove that the historic and modern binary outputs match.

The historic one-based pages are `1 5 27 41 42 43 44 45 46 47 48 49 53 54 55`.

**Discriminator 1, original JPEG size:** every historic positive is among the original 58 source images `resources/liber-primus/17.jpg` through `74.jpg`. Independently ranking those files by raw JPEG byte count yields **exactly the 15 historic positive pages** as the 15 largest source files, with no omitted page and no extraneous selected page. This is an empirical alternate explanation consistent with an image-capacity threshold; it does not establish a byte-count threshold inside OutGuess or prove absent steganography.

| Size rank | 1-based LP2 page | JPEG byte length |
| ---: | ---: | ---: |
| 1 | 49 | 803,285 |
| 2 | 45 | 796,475 |
| 3 | 53 | 792,979 |
| 4 | 44 | 792,166 |
| 5 | 48 | 792,027 |
| 6 | 43 | 788,795 |
| 7 | 42 | 785,555 |
| 8 | 47 | 782,516 |
| 9 | 55 | 774,295 |
| 10 | 46 | 772,704 |
| 11 | 54 | 753,790 |
| 12 | 41 | 746,355 |
| 13 | 1 | 695,525 |
| 14 | 27 | 677,224 |
| 15 | 5 | **676,634** |
| 16, first excluded | 6 | **667,716** |


The fifteenth source JPEG is page5 at **676,634 bytes**. The largest excluded JPEG is page6 at **667,716 bytes**. A retrospective source-size cutoff in (667,716, 676,634] would classify exactly the historic 15. Its selection was observed after seeing the 2015 list, and it is **not** an authenticated OutGuess parameter.


## Discriminator 2: native OutGuess usable-bit capacity explains all 16 modern nominal successes

The more causally relevant source property is each JPEG's **usable DCT coefficient count**, rather than the size of the compressed JPEG file. OutGuess's [pinned JPEG-6b coefficient reader](https://github.com/resurrecting-open-source-projects/outguess/blob/24810e14327c2bbeedeaadd3e24491f2a4425c02/src/jpg.c) calls its bit collector for each DCT coefficient in the [JPEG decode loop](https://github.com/resurrecting-open-source-projects/outguess/blob/24810e14327c2bbeedeaadd3e24491f2a4425c02/src/jpeg-6b-steg/jdcoefct.c). Its byte-acceptance predicate excludes coefficient 0 and positive 1; consequently the exact **usable-bit count** is the number of coefficients `v != 0 && v != 1` over original JPEG component DCT blocks, and `bitmap->bytes = ceil(usable_bits/8)`. The explicit OutGuess [retrieve path](https://github.com/resurrecting-open-source-projects/outguess/blob/24810e14327c2bbeedeaadd3e24491f2a4425c02/src/outguess.c) reads a two-byte seed and two-byte nominal message length from the early carrier bits; even a physically admissible length lacks a checksum or message authenticity test.

The new [read-only, original-JPEG C11/libjpeg SFT](../sims/lp2_outguess_falseheader_capacity_sft.c) extracts the DCT coefficient arrays and counts the exact native eligible bits. It first **reproduces, bit for bit, four independent numbers in the original earlier-stage OutGuess command transcript**: historical original archive `06.jpg` → **800,881** usable bits, `07.jpg` → **804,376**, `08.jpg` → **578,114**, and `09.jpg` → **704,507**. These are all four values recorded in [the 2024 independently published 2014-stage transcript](https://connortumbleson.com/2024/06/03/the-cicada-3301-mystery-puzzle-3-solve-part-3/). This is an external numerical check on the **original images and exact coefficient convention**, without using the 2026 LP2 success labels to choose an extraction rule.

Read all 58 original second-release JPEGs `17.jpg`–`74.jpg`, sort descending by usable-bit capacity, and compare with the independently frozen native extractor's positive set. **The 16 highest-capacity scans are precisely the 16 scans that report `seed41408,len58152`: 16/16, zero misses and zero extra carriers.** This apparent capacity relationship is completely mechanistically reproduced below, including every failed read.

| DCT capacity rank | Original scan | One-based LP2 page | Usable DCT bits | 2026 nominal 41408/58152 output |
| ---: | ---: | ---: | ---: | :--- |
| 1 | 65.jpg | 49 | 832,763 | yes |
| 2 | 69.jpg | 53 | 824,585 | yes |
| 3 | 61.jpg | 45 | 824,208 | yes |
| 4 | 64.jpg | 48 | 820,942 | yes |
| 5 | 60.jpg | 44 | 820,718 | yes |
| 6 | 59.jpg | 43 | 816,345 | yes |
| 7 | 58.jpg | 42 | 813,870 | yes |
| 8 | 63.jpg | 47 | 811,247 | yes |
| 9 | 62.jpg | 46 | 800,833 | yes |
| 10 | 71.jpg | 55 | 784,983 | yes |
| 11 | 70.jpg | 54 | 758,806 | yes |
| 12 | 57.jpg | 41 | 756,640 | yes |
| 13 | 17.jpg | 1 | 714,405 | yes |
| 14 | 21.jpg | 5 | 695,826 | yes |
| 15 | 43.jpg | 27 | 692,534 | yes |
| **16** | **68.jpg** | **52** | **692,043** | **yes, sole 2015 extra** |
| 17, first excluded | 18.jpg | 2 | **687,226** | no |

The rank-16/rank-17 capacity gap is **4,817 usable bits**. The 2015 participant's 15 pages are, independently, the fifteen largest *compressed JPEG files*, and overlap with **15/16** of the new DCT-capacity-selected native set. The modern extra one-based p52 (physical `68.jpg`) ranks 18th in compressed-file bytes but 16th in native OutGuess usable bits. **This reconciles the historical sets through a real property of the steganography carrier**, without pretending the two participant/tool extracts have matching bytes.

**Capacity-only caveat, resolved by the cursor test below:** OutGuess's simple nominal-length upper bound alone is *not* the complete capacity cutoff: 58,152 bytes corresponds to 465,216 payload bits, below the eligible-bit capacities of numerous other non-positive original images. An exact threshold between 687,226 and 692,043 is an **empirical rank separator**, not a documented fixed rule in OutGuess. The direct original-image header and byte-cursor test below identifies the repeated header and capacity-dependent iterator completion exactly. The same-length return has **no independent authentication**, even at high capacity.

## Decisive mechanism: every original LP2 JPEG carries the same *apparent* header

The follow-on [exact-source OutGuess header and iterator reproducer](../sims/lp2_outguess_falseheader_mechanism_sft.c) eliminates the remaining selection ambiguity using the unchanged original image coefficients, independently pinned ARC4 derivation and native iterated cursor. It reconstructs the first four header bytes at the exact default-key scattered DCT bit positions, XORs the **`MD5("EncryptionDefault key")`** ARC4 stream, and interprets the resulting little-endian unsigned 16-bit seed and length. The source file reproduces two **known genuine** controls independently: original `00.jpg` gives **seed 163, length 2,899**, and original `08.jpg` gives **seed 38, length 140**. Its eligible-coefficient counter also reproduces all four historical 2014 source-image capacities cited above.

**Every one of the 58 original LP2 JPEGs, including all 42 failed modern extractions, has the exact decoded four-byte header `c0 a1 28 e3`, meaning seed 41408 and length 58152.** All 58 header reads finish at the same DCT bit cursor **547**. This agreement is computed directly from independent source coefficients, with a fixed password and exact upstream OutGuess algorithms; it does **not** depend on interpreting a successful fake payload.

Next the same source reproduces OutGuess's **ARC4 re-seeding and adaptive bit-skip cursor** for 58,152 requested data bytes on each original image, with no need to read any candidate payload. Three low-capacity images are rejected by the native claimed-length-versus-capacity guard. For the other short-capacity images the adaptive skip modulus becomes zero during the final read, preventing successful completion (the historical C code computes `arc4_getword % skipmod`; zero is invalid). **Exactly the highest-capacity 16 scans complete their read; exactly the other 42 fail. The predicted 58/58 completed/failed outcomes agree with the actual full native 2026 OutGuess scan.** The first excluded `18.jpg`, for example, reaches zero modulus at putative body byte **58,120** while included `68.jpg` finishes all bytes. This is an **executable deterministic explanation**, beyond the earlier capacity correlation.

The precise false header is common to all original sources. Whether the author intentionally designed their early DCT coefficients to yield this header, or it arose from a common image/layout pipeline, remains unknown. No original payload authentication exists, and a future independently keyed authentic embedded message is not ruled out. However, the original nominal 58,152-byte outputs are now explained entirely by the **same default-key header and finite reader cursor**, with no requirement to assume any intentionally stored 58,152-byte LP2 secret. Any decoder treating those sixteen blobs as authenticated messages must furnish a **new independent witness**, such as signed contents, integrity proof, original key or real downstream plaintext.

**Discriminator 3, independent OutGuess extraction and unrelated earlier puzzle control:** the fully reproduced [2026 default-key OutGuess v0.4 scan](outguess-lp2-original.md) of 58 original LP2 scans yielded 16 nominally header-consistent high-entropy binaries, each **58,152 bytes**, with the exact same printed `seed: 41408, len: 58152`. Its original JPEG scan numbers were `17 21 43 57 58 59 60 61 62 63 64 65 68 69 70 71`, corresponding to one-based LP2 pages **`1 5 27 41 42 43 44 45 46 47 48 49 52 53 54 55`**. Thus **15 of 15** historically claimed positives are contained in the 2026 set, and its sole extra source is **LP2 page52**, original `68.jpg`, **661,727 bytes**, source-size rank18. The 16 modern outputs share a 1,417-byte prefix and a 1,554-byte suffix; no recognized payload or authentic key has been recovered. The original scan is [Windows CI run 42755426574](https://github.com/FlareZ123/liber-primus/actions/runs/42755426574) with a [positive two-message Cicada control](outguess-lp2-original.md).

An external, separately documented 2014 Cicada walkthrough [Connor Tumbleson, *Puzzle 3 Solve, Part 3*, 3 June 2024](https://connortumbleson.com/2024/06/03/the-cicada-3301-mystery-puzzle-3-solve-part-3/) reproduces an exact `outguess -r` shell transcript on four *earlier-round* 2014 source JPEGs. It prints `Steg retrieve: seed: 41408, len: 58152` for **three of the four**, while the genuinely readable image yields **`seed: 38, len: 140`**, followed by the known “For those who have fallen behind” message. Those first, second and fourth 2014 files are not LP2 pages. Thus the precise seed/length pair recurs on unrelated Cicada-era JPEGs that do **not** yield the authenticated 140-byte message. The walkthrough is a 2024 retrospective with a reproduced command transcript, not a contemporaneous signed Cicada explanation of the extractor internals; the **same diagnostic** is strong discriminating evidence for a generic false-header family.

This interpretation has a still stronger independent implementation check: [22-key native original-image source challenge](outguess-lp2-keyed-source-headers.md) produced 977 apparently valid OutGuess headers among 1,276 extractions, with password-specific seed/length values invariant across many unrelated images; **eight false-positive headers were recovered from a separately generated, payload-free synthetic JPEG**. The same extractor recovered authentic inserted messages exactly. Therefore a valid-length OutGuess diagnostic is not a hidden-payload authentication test. These experiments do not prove that no purposefully encrypted payload exists in the LP2 JPEGs.

## Decision for actual cryptanalysis

There is no evidentiary basis to treat the historic 15 images as **15 authentic hidden messages** or to search their equal-length noise dumps for an unconstrained rune pad. The complete 58/58 original-source OutGuess header/cursor replay specifically explains the 16 modern nominal outputs without assuming such payloads. The strongest alternative account combines an exact **16/16 OutGuess-native DCT-capacity rank correspondence**, a separately exact 15-JPEG compressed-file rank, the 15-of-16 cross-era carrier-set overlap, the identical modern `41408/58152` diagnostic and the independent earlier-round false-header witness. The 2024 historical numbers provide a completely independent, four-image positive calibration of the coefficient counter. The owner of [Issue #1109](https://github.com/FlareZ123/liber-primus/issues/1109) should prioritize retrieving **original 2015 output bytes**, exact historic OutGuess version/commands or an independent CRC/signed message over another exhaustive pad sweep. Those assets could still distinguish purposeful embedding from false positives.

The more causal capacity match and four historical command-log controls are reproduced by [C11/libjpeg SFT](../sims/lp2_outguess_falseheader_capacity_sft.c), independently of the original size match, which is reproduced by read-only [CommonJS SFT](../sims/lp2_2015_outguess_size_rank_sft.cjs), on all 58 source JPEG byte lengths with a mutation control. Historical and modern identifier-set comparison is literal and exact; the cross-era signature is independently visible in the linked shell transcript. The preserved original ZIP agrees with repository source byte counts. All reported cross-era linkages are **intermediate acquisition/triage evidence** and identify neither unknown p0–55 plaintext nor the final Cicada destination.
