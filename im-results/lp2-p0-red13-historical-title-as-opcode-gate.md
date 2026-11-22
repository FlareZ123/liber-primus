# Original LP2 p0 red-title as historical instruction: source-selected operations

**Agent6, 18 November 2026. Classification: bounded original-source operator gate; no recovered unknown LP2 plaintext, key or destination.** The question is whether the original red `8+5` title by itself constitutes a deciphering instruction, independently of the following encrypted prose.

## What the original artifact actually specifies

The [physical-source correction](lp2-p0-red13-13dot-blackbody-original-source-adjudication.md) and the [original ink override](../resources/liber-primus/lp2-p0-physical-ink-override.json) fix the 13 runes of p0 scan17 as `ᛋᚻᛖᚩᚷᛗᛡᚠ-ᛋᚣᛖᛝᚳ` (GP transliteration `SHEOGMIAF SYENGC`, an 8+5-rune title). There is one ordinary red word dot after rune8 and a large red 13-dot mark *after rune13*. The next 249 p0 runes are black; p1–2 continue the same original opening to 729 total runes. The second GP title word's Latin rendering includes one-rune `NG`: character length is not rune length.

Using the first-party GP29 chart, the exact title indices are `[15,8,18,3,6,19,27,0,15,26,18,21,5]`. They form the equality pattern `ABCDEFGH AICJK`; only positions 0/8 and 2/10 repeat. A single bijective static alphabet relabeling must preserve those coincidences. The pattern is a finite constraint, not a proof that the title was intended as an independent plaintext word pair.

A critical independent control is the genuinely solved p56: **its five red title runes are ciphertext** in the same consecutive-prime-minus-one stream as the remaining black text, yielding the coherent title `AN END`; the entire p56 85-rune ciphertext decodes correctly using the one source-known transparent F. The separately clear p57 title is `PARABLE`. These contrasting authentic pages show that red ink and an adjacent large mark by themselves do not determine a title-only cipher regime. The p0/p1 top/bottom infinity-like ornaments and side-cross ornaments also recur across the opening pages, so there is no uniquely printed p0-only arrow or reading-order command in those visual motifs.

## Frozen historically motivated operations, original runes

The [single-file Node22 test](../sims/lp2_p0_red13_historical_title_sft.cjs) implements exactly the original chart and documented earlier solved LP1/LP2 operators, preserving the original 8+5 break. It does not vary a key alphabet, offset, direction, segmentation or start position to improve the output. Both F-bypass options at the title's visible F (rune index7) are shown where relevant. Results:

| Solved historical convention transferred to red title | Exact 8+5 GP transliteration |
| --- | --- |
| First-party GP chart, as printed | `SHEOGMIAF SYENGC` |
| LP1 A WARNING, reverse GP (`28-c`) | `PLIAEOENUEA PTHIWD` |
| LP1 A KOAN, reverse GP +3 (`31-c`) | `TDPEAAEEORTH TCPIY` |
| LP2 p56 prime-totient start2, uninterrupted | `XGXYAEWJJ OEIABXD` |
| LP2 p56 prime-totient start2, F at7 literal/nonconsuming | `XGXYAEWJF YRMLIA` |
| LP1 Vigenère `DIVINITY`, uninterrupted | `NGIABOEYNJO NGTBJAE` |
| LP1 Vigenère `DIVINITY`, F at7 literal/nonconsuming | `NGIABOEYNJF EOHLA` |
| LP1 Vigenère `FIRFUMFERENFE`, uninterrupted | `SIAXOCFIAJ JHNNGT` |
| LP1 Vigenère `FIRFUMFERENFE`, F at7 literal/nonconsuming | `SIAXOCFIAF YOEFEOC` |

None is a complete intelligible two-word 13-rune instruction, much less one that selects a deterministic receiver for an untouched original body paragraph. This is a **nine-member finite gate** on the explicitly enumerated conventions. The first-party 2013 GP29 chart determines symbols and values; it does not specify a running key or one of these operations for LP2 p0. Earlier LP1 and LP2 inversion details are in the [historical player-visible source contract](../workplace/historical-player-solvepath-operator-contract.md). Some historically recovered conventions were inferred by solvers from readable output rather than explicitly ordered by Cicada.

**Native positive controls:** The same SFT recovers all 85/85 original p56 runes from the source ciphertext, with transparent F at index56, and re-runs the shared [599/599 solved LP1/LP2 regression](../sims/authentic_decryption_regression.cjs). Original p0 index, ink offset, title repetitions and the p57 clear title are checked as regression invariants. [Windows Node22 PASS, GitHub Actions run 44291196413](https://github.com/FlareZ123/liber-primus/actions/runs/44291196413) uses the committed SFT; no opaque image-derived key or text-generation candidate is involved.

## Decision and missing input

The actual source supplies a GP29 transcription, two printed red words and a 13-dot stop. It **does not select** an independent 13-rune substitution/reading convention, a second title-specific alphabet, a key, a distinct backward traversal or a rule mapping a decoded title to 249 p0 black symbols. The only local operation family with historical positive controls above fails its full-title instruction test. Retire this **specific historically transferred title-as-opcode route** without presenting the 13-rune coincidence pattern as plaintext evidence.

A source-authenticated title-specific instruction (e.g., a contemporaneous worked 8+5 example or an independently preserved key/operation) would reopen the route; at that point freeze a full 262-rune p0 decoder and a disjoint original-page holdout before selecting on output. An unconstrained wordlist, free 29-letter permutation or source-unspecified key search cannot distinguish an authentic solution from a constructed title.
