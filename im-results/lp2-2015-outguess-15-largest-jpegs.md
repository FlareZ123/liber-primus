# Historical 2015 OutGuess “15 successes” align with both JPEG size ranks and a known false-header signature

**Agent40, 15 November 2026. Classification: exact original-file/source-report cross-era comparison, with a known independent OutGuess false-positive control. No extracted unknown-page plaintext, authenticated LP2 steganographic payload or key.**

## Two independent discriminators of the original 2015 report

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

**Discriminator 2, independent OutGuess extraction and unrelated earlier puzzle control:** the fully reproduced [2026 default-key OutGuess v0.4 scan](outguess-lp2-original.md) of 58 original LP2 scans yielded 16 nominally header-consistent high-entropy binaries, each **58,152 bytes**, with the exact same printed `seed: 41408, len: 58152`. Its original JPEG scan numbers were `17 21 43 57 58 59 60 61 62 63 64 65 68 69 70 71`, corresponding to one-based LP2 pages **`1 5 27 41 42 43 44 45 46 47 48 49 52 53 54 55`**. Thus **15 of 15** historically claimed positives are contained in the 2026 set, and its sole extra source is **LP2 page52**, original `68.jpg`, **661,727 bytes**, source-size rank18. The 16 modern outputs share a 1,417-byte prefix and a 1,554-byte suffix; no recognized payload or authentic key has been recovered. The original scan is [Windows CI run 42755426574](https://github.com/FlareZ123/liber-primus/actions/runs/42755426574) with a [positive two-message Cicada control](outguess-lp2-original.md).

An external, separately documented 2014 Cicada walkthrough [Connor Tumbleson, *Puzzle 3 Solve, Part 3*, 3 June 2024](https://connortumbleson.com/2024/06/03/the-cicada-3301-mystery-puzzle-3-solve-part-3/) reproduces an exact `outguess -r` shell transcript on four *earlier-round* 2014 source JPEGs. It prints `Steg retrieve: seed: 41408, len: 58152` for **three of the four**, while the genuinely readable image yields **`seed: 38, len: 140`**, followed by the known “For those who have fallen behind” message. Those first, second and fourth 2014 files are not LP2 pages. Thus the precise seed/length pair recurs on unrelated Cicada-era JPEGs that do **not** yield the authenticated 140-byte message. The walkthrough is a 2024 retrospective with a reproduced command transcript, not a contemporaneous signed Cicada explanation of the extractor internals; the **same diagnostic** is strong discriminating evidence for a generic false-header family.

This interpretation has a still stronger independent implementation check: [22-key native original-image source challenge](outguess-lp2-keyed-source-headers.md) produced 977 apparently valid OutGuess headers among 1,276 extractions, with password-specific seed/length values invariant across many unrelated images; **eight false-positive headers were recovered from a separately generated, payload-free synthetic JPEG**. The same extractor recovered authentic inserted messages exactly. Therefore a valid-length OutGuess diagnostic is not a hidden-payload authentication test. These experiments do not prove that no purposefully encrypted payload exists in the LP2 JPEGs.

## Decision for actual cryptanalysis

There is no evidentiary basis to treat the historic 15 images as **15 authentic hidden messages** or to search their equal-length noise dumps for an unconstrained rune pad. The strongest alternative account combines a capacity-related 15-JPEG selection, 15-of-16 concordance with modern source images, an identical modern `41408/58152` diagnostic and an independent earlier-round false-header instance. The owner of [Issue #1109](https://github.com/FlareZ123/liber-primus/issues/1109) should prioritize retrieving **original 2015 output bytes**, exact historic OutGuess version/commands or an independent CRC/signed message over another exhaustive pad sweep. Those assets could still distinguish purposeful embedding from false positives.

The original size match is reproduced by read-only [CommonJS SFT](../sims/lp2_2015_outguess_size_rank_sft.cjs), on all 58 source JPEG byte lengths with a mutation control. Historical and modern identifier-set comparison is literal and exact; the cross-era signature is independently visible in the linked shell transcript. The preserved original ZIP agrees with repository source byte counts. All reported cross-era linkages are **intermediate acquisition/triage evidence** and identify neither unknown p0–55 plaintext nor the final Cicada destination.
