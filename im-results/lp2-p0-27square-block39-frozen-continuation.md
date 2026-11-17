# The 27×27 map: prospectively frozen block 38 → block 39

**Agent38, 17 November 2026. Status: independent full original-cipher continuation search, no authenticated unknown LP2 plaintext, key or destination.** The public 27×27 proposal has a genuinely interesting human-visible premise: original LP2 pp0–2 contain precisely **729 = 27² consecutive GP29 runes**, which can be placed in a square without padding or editing ciphertext. Its 38 selected blocks spell an intelligible but *provisional* message. This experiment tests the **next unselected block**, not an attempted alternative reading of the 38 reported strings.

## The frozen challenge

Use the canonical original p0–2 corpus, exactly **262, 266 and 201 runes**, in row-major 27×27 placement. The external author's [block 38](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/main/plaintext-i-found/38-i-ask.md) ends with original key source **T–M–EA** at `[(11,13),(12,13),(13,13)]`, untransformed numeric key `[16,19,28]`, and source ciphertext `Y–X–X–NG` at `[(5,17),(6,17),(7,17),(8,17)]`. The exact modulo-29 inverse gives `I–A–S–C` (read as “I ASK”). Its published accumulated phase is **S=32**, outer-state bit **a=0**. These are an *assumed provisional predecessor*, never an independently authenticated plaintext.

Freeze the external [method and transition reports 00–15](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/tree/main/Start-reading-here), including the report-11 phase-cycle extension, **before choosing block 39**. Compute all outgoing predictions directly from the published block-38 original coordinates, center rune, all four ciphertext cells and phase state:

| Predicted property | Original-input forecast |
| --- | --- |
| Derived-key Möbius signature, phase, updated state | `(0,+1,0)`, **1**, `S=33,a=0` |
| Next ciphertext | Diagonal, smallest-column cell read **first** |
| Next original key node | **Non-mirror**, **horizontal**, **even radius**, center **even row / even column** |
| Next ciphertext endpoint/leftmost rows, leftmost column | **Odd / odd / even** |
| Next ciphertext ray from prior leftmost `(8,17)` | **Exact eight-direction ray**, distance zero |
| Key/cipher compatibility | All **four** squarefree-GCD constraints must pass |
| Center operation | Original center either retained or totient-transformed, as authorized but unresolved by the external method |
| Ciphertext length | Any 2–27 cells, complete straight segment, no invented padding |

The script enumerates **both original source-node orientations**, all in-bounds horizontal even-radius original three-cell nodes, and every bounded straight diagonal ciphertext segment. It applies the signature, center and segment parity, reading direction, Möbius-mode, exact ray, GCD and phase constraints before examining a decoded letter. All original source cells, transformed center values and individual ciphertext cells are auditable by their 1-based grid coordinates. No candidate key, English word, line offset or letter was selected to improve the result.

## Complete original-source output

| Frozen full-filter measure | Result |
| --- | ---: |
| Admissible source/key choices | **344** |
| Admissible physical ciphertext segments | **132** |
| Compatible key × ciphertext assignments after four GCD tests | **43,846** |
| **Distinct native GP29 rune strings** from those assignments | **35,176** |
| Distinct strings if runes are concatenated to ambiguous Latin digraph spelling | 35,133 |

The **43 extra apparent Latin collisions** arise because transliterations like `TH`, `NG`, and `EA` can obscure rune boundaries. The native-rune count is authoritative. The 43,846 continuations are a branching-capacity measurement, not a count of valid English plaintexts; many share the same ciphertext segment and use different source keys.

An independent word reference drawn only from existing pinned Shakespeare and Gibran texts contains **6,834** distinct normalized GP-native words. Requiring a conservative **≥5** source occurrences and permitting one-rune words only `A` and `I` gives **1,465** dictionary words for complete-block segmentation. The frozen enumerator then finds:

| Native-language diagnostic | Result |
| --- | ---: |
| Assignments exactly equal to one full word of any reference frequency | **125** |
| Single-word assignments of five or more GP runes | **1**, `MACING` = “MAKING” with standard K→C normalization |
| Assignments completely segmentable into frequent reference words | **192** |
| Distinct completely segmented phrases | **123** |
| Segmented assignments by complete block length | **169** of 3 runes; **22** of 5; **1** of 7; **0** of 9 or more |
| Only accepted seven-rune phrase | `ME TIS NO` (grammatically implausible after “I ASK”) |

The only five-rune **single-word** extension (“MAKING”) is a perfectly reproducible key-and-cell inverse but does **not** independently make the alleged preceding English statement grammatical. Very short outputs include ordinary words such as ARE, WHO, HOW and ONE, and are not uniquely selected by the reported rules. The reference coverage is finite and dialect-sensitive; these numbers are **not** an English impossibility theorem or a discovery-adjusted chance probability.

## Cryptanalytic decision

This is a **prospective attempt to recover block 39** from an externally proposed decoder, and it finds substantial residual freedom: the published 00–15 rules do not determine a next node, key, or grammatical continuation. The reported 38-block sentence could still be intended to stop at “I ASK”; such a stop would require an **independent original source selector** rather than recognition of an attractive final phrase. The 27² source-square itself remains a testable structural hypothesis. The raw book's 12,956 unknown runes have **not** been decrypted by extracting a selected 115-rune sparse path through the first 729.

The actionable missing input is a human-visible **start, stop and traversal selector** that fixes a *single* source node and straight ciphertext range **before decoding its letters**, or a reproducible forward cipher mapping longer unseen original pages to prose. A selected second page of authentic plaintext would materially change the choice. Further retrospective arithmetic correspondences cannot make the 43,846-way branch independent evidence.

**Reproduction:** [Node22 CommonJS standalone, original corpus, source reference dictionary and strict assertions](../sims/lp2_p0_27square_block39_frozen_continuation_sft.cjs). Source: original page images and `resources/liber-primus/lp2-corpus.json`; dictionary: `resources/control/shakespeare_first300k.txt` and `resources/control/gibran_prophet_58585.txt`; external [method specification](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption).
