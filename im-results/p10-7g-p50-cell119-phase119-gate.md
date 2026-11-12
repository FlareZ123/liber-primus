# p10 “7 G” → p50 cell119: source cross-link and direct-key gate

**Status: provisional original-artifact clue plus a bounded negative consumer test. No unknown LP2 plaintext, authentic key, complete cipher, endpoint, or final destination is recovered.** The multiplication and downstream use remain hypotheses.

## Source-led selector

Original physical p10 (resources/liber-primus/27.jpg) prints an isolated decimal **7** followed by a complete one-rune word **ᚷ (G)** at page-local rune offset **169**:

~~~text
... ᛋᛒ-ᚠᛞᛇ-ᚩᚦᛏ-7-ᚷ-ᛚᛄᛖᚫ ...
~~~

The hyphens in the transcription mark word boundaries, not arithmetic operators. This is the only isolated decimal numeral inside ordinary unknown-page prose; the other five digits (1–5) are numbered-list labels on pp36–38. In Gematria Primus, G has zero-based index 6, one-based ordinal **7**, and associated prime **17**. A plausible, but not explicitly printed, multiplication gives (7	imes17=119). Earlier Cicada stages used source-visible arithmetic products, making this a plausible human attempt rather than an authenticated instruction.

## Three original locations selected by 119

1. The only two isolated red three-rune spans in the original LP2 ink annotations are on p3 and p39, both at page-local rune offset **119**, bracketed by red 13-dot marks. The previously established solved-LP1 GP29 Atbash outputs are **SCY** and **UDP**; SCY can spell SKY under the manuscript's C/K transliteration ambiguity. This is the pre-existing result in [the red119 report](lp2-p3-p39-red119-atbash-sky-udp.md), not a new decryption by this experiment.
2. The original p49–p51 numerical table contains 32×8 = 256 two-character tokens in physical row-major order. Its one-based **119th** cell is physical **p50 row 5, column 7**, token **0Z**. Under the conventional base-60 alphabet, 0Z = 35; (35mod29=6), which maps back to **G**. Also, (35=5	imes7), equal to that cell's page-local row×column coordinates.
3. The coordinate check is conditional: if the table is numbered as one continuous 32-row object, the same cell is global row 15, column 7, and 15×7 is not 35. Page-local row numbering is a natural visual reading of the printed p50 segment, but is not explicitly labelled. The token 0Z also occurs at cell 96, and ten table cells reduce to GP index 6; the G residue alone is therefore not unique. The 119th-cell lookup is unchanged by the specific base59 alternative that omits lowercase f, because 0Z uses neither f nor a later lowercase digit.

The five numbered-list controls do not reproduce the same fixed-point relation: their first following runes and prime products are L/73, N/58, D/267, NG/316, and H/115. The products 267 and 316 lie outside the 256-cell table; the in-range lookups do not reduce to the corresponding rune. Only the isolated p10 7–G pair yields the 119th-cell G return.

## Direct whole-book consumer: negative

The simplest source-shaped use of the pointer is to start the existing 256-byte p49–p51 table at its one-based 119th entry, reduce each byte modulo 29, and use that period-256 sequence as a continuous additive/subtractive GP29 key over the original p0–p55 rune stream. This tests exactly one phase, both standard signs, and no fitted reset, reversal, or permutation.

Inputs were pinned by Git blob IDs in the reproducer: LP2 corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, base60 grid 4698c0806e6bab06a39cfbc3c3283b862de58b35, 256-grid 39c4f098566fc5eba9d6738416a2fd193f800701, transcription 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7, ink annotations 3c52f209ce6bd7b138eaa2d4a9323526952ba9f9, and Gibran control df260a07d56bf5998d40a6360b6132c35c252d10.

| Measure | Raw ciphertext | Phase-119 C−K | Phase-119 C+K |
|---|---:|---:|---:|
| Mean native-GP trigram log score | −12.27632833 | −12.30534017 | −12.30229465 |
| Index of coincidence | 0.03447840 | 0.03446621 | 0.03448477 |
| Complete non-overlapping 256-rune windows | — | 50 | 50 |
| Windows at or below worst held-out native-GP window (−9.22531953) | — | 50/50 | 50/50 |

The native-GP control contains 62,696 runes; the first 40,000 train the smoothed trigram model, and 22,441 held-out 256-rune windows calibrate native-language scores. Every one of the 50 full candidate windows under either sign scores below even the worst native window. Against 512 deterministic shuffled permutations of the same key multiset, the fixed phase scores are not exceptional: add-one upper-tail p=0.7797 for C−K and p=0.7836 for C+K. Exact inverse round trips and both planted native-GP sign controls pass; those validate implementation, not key identity.

**Decision:** reject only the direct, continuous, period-256 B mod 29 additive/subtractive key beginning at cell119. Do not rescue it with arbitrary resets, offsets, reversals, or extra layers. The 7G→119→p50-cell119 alignment is a new candidate address/check relation, not plaintext or an authenticated key. The p3/p39 SKY/UDP interpretation still lacks a source-selected consumer; the signed 2013 “knock on the sky” route used ICMP echo, not a demonstrated UDP listener. Do not infer a port or send network traffic.

## Reproduction

Run from the repository root with Node.js 22:

~~~sh
node sims/lp2_p10_7g_p50_cell119_phase_sft.cjs
~~~

The script verifies source blob IDs, all six printed-number controls, the exact 119th table token and page-local coordinate match, both red-triad offsets, the full 12,956-rune ciphertext, native-GP control, fixed phase-119 inverses, planted positives, and the deterministic shuffled-key null.
