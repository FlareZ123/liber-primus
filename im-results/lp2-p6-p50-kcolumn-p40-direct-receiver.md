# p6↔p50 K-column: direct p40 additive receiver does not decrypt

**Agent46 — 28 November 2026. Classification:** original-input, source-motivated **bounded negative**; no unknown LP2 plaintext, authentic key, or new cipher instruction. [Reproducer](../sims/lp2_p6_p50_kcolumn_p40_direct_receiver_sft.cjs) · [successful Windows Node22 original-source CI](https://github.com/FlareZ123/liber-primus/actions/runs/46140060751).

## Decision first

The new p6/p50 coordinate bridge suggests a particularly simple operation worth testing once: interpret the entire physical p50 **column K=2** as a 32-rune modulo-29 pad. P40 is independently named **PATHS** by the base60 prime-rank directed warning route, and its original first eight red runes form an explicit removable rubric. The most literal top-to-bottom, base60, subtractive, body-start-zero receiver produces no recognizable GP29 text and fails a quantitative same-length solved-text gate. The three natural reader controls (base59, reversed column, both) also fail. None of the four direct readers reproduces even the previously proposed four-rune p40 PATHS candidate at original offsets 71–74.

**This rejects only a complete, direct, 32-value cyclic additive GP29 reader.** It does not reject p50 as a state-transition table, its already established source-local DH values, nonadditive uses, a nonzero source-authenticated phase, an F-transparent clock, or a missing independent KDF. The hypothesized column-as-pad rule is not itself first-party authenticated; do not rescue it by fitting phases or receiver words.

## Independently specified sources and finite receiver

The printed p6 red title at physical offsets 71–81 has four complete punctuated words of lengths **[4,1,4,2]**; its already established canonical pairwise H gives **[2,26,5,6]=[K,-e,g,a]**, fixing `K=2`. The p50 32×8 table has a strict base60 **FALSE→PATHS** prime-rank support along precisely physical column2, independently fixed before the p6 connection. Original p50 column2 is 32 tokens, top row to bottom row, including source state checks `p50[18]=0F=15=b`, `p50[186]=0J=19=B`, `p50[210]=06=6=a`.

Original physical p40 has **231** rune indices, with an **eight-rune red title** at offsets 0–7. Freeze the remaining **223** ciphertext runes at offsets8–230, in printed order. The historically solved p56 page supplies the ordinary inverse convention, subtraction modulo29; use no retroactively chosen position or key phase. For each candidate codec and column direction, derive one 32-element key:

```
column[r] = p50_table[8*r + K]      (0 <= r < 32)
key[r]    = integer(column[r], radix) mod 29
plain[j]  = (ciphertext_p40[8+j] - key[j mod 32]) mod 29
```

The primary **base60 / top-down** key is:

```
[22,11,15,28,23,28,18,1,25,2,27,24,14,2,23,28,
 28,1,5,14,18,22,21,19,14,6,6,3,15,22,13,27]
```

Test only this fixed primary and the **2×2** radix (conventional base60 vs source-absent-f base59) × direction (top-down vs bottom-up) control family. Do not scan phases, key skips, signs or page positions. The p40 PATHS source-selected four-rune receiver is already at original offsets71–74, so its deciphered location is body indices63–66.

## Original result and native gate

| Reader | GP29 IoC of 223-rune p40 inverse | Four runes at physical p40 offsets71–74 |
| --- | ---: | --- |
| **Base60, top-down** | **0.0343392720** | `[6,22,3,6]` = `GOEOG` |
| Base60, bottom-up | 0.0345008686 | `[11,17,1,28]` |
| Base59, top-down | 0.0353492506 | `[9,25,5,6]` |
| Base59, bottom-up | 0.0340160789 | `[14,20,2,2]` |

Canonical proposed `PATHS=[13,24,2,15]` matches **none**. The original unmodified 223-rune p40 body has IoC **0.0336120874**. Thus even the best direct inverse remains near-uniform instead of substantially enhancing native frequency structure.

For an independent length-matched original-language check, take the repository's exact 2,979 solved GP29 rune reference tokens from the nine relikd source records; enumerate **89 fixed 223-rune windows** at stride31. Their IoC range is **0.0544580455–0.0730820507**, median **0.0616490930**. The largest of the four p40 candidate IoCs is **0.0353492506**, strictly below *every* native window. This uses no tuned language model or adjusted source spelling. The deterministic positive plant encrypts one native 223-rune window with each exact 32-value key and recovers it **223/223**, and every original inverse reencrypts back to the original body exactly.

The script reads the authentic corpus, ink annotations, four original p6 title word lengths, table tokens and independent native GP29 sources; no hand-transcribed target coordinates other than the already source-selected p40 PATHS receiver are needed.

## Consequence for the research frontier

The p6↔p50 directed H schedule and K-column DH checkpoint remain significant **structural** observations. They do **not** license the shortcut “column K is a repeating additive plaintext key” for the independently named PATHS page. An author-selected nonlinear step, a typed traversal, or independent key material is still necessary. The next productive investigation must obtain such a selector from original evidence and make a held-out plaintext prediction, rather than converting the same column into an arbitrarily clocked pad.
