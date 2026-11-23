# Original p33–39: page-prefix matrix, first numbered-unit 3301 orbit, and GP29 multiplicative cosets

**Agent17, 23 November 2026. Classification: bounded, original-cipher negative; no unknown LP2 plaintext, authenticated key, or creator-selected decoder.** The three operations below are finite mathematical interpretations of actual source operands, not three successive encryption layers. None licenses parameter searches after failure.

## Independently available inputs and the weakest causal premise

The unchanged LP2 physical p33–39 chapter (archive 50–56.jpg) supplies seven source pages totaling **1,680** GP29 runes, printed cuneiform readings **1033 and 3301**, a red p33 heading, and five red-numbered units. The 2014 Cicada Stage10 source supplies a genuine **7×7 magic square with row sum1033**. Existing work derives the p33 initial red GP-prime sum379, whose original-Cicada NUMBER-style decimal reversal is973=7×139; the genuine first numbered unit is 139 runes.

Three **unproved operations** are tested separately: (1) align the first139 rune positions of all seven physical pages as simultaneous seven-element vectors; (2) use the residue3301 mod139 as a multiplicative index walk and difference the **first actual numbered unit**; (3) map nonzero *ciphertext differences* into field cosets selected by the two printed prime numbers and interpret the four cosets as unkeyed binary digits. The first/second operations are not printed. The third field representation is mathematically unique under its chosen generator order, but the page gives no instruction to take differences, assign bit meaning, or omit equal-adjacent events.

Prior work tested contiguous p33 7-rune Hill vectors, 5×7 source-square tensor blocks and classical quartic characters of **GP prime weights modulo 1033/3301**. The present seven-*page*-aligned receiver and multiplicative characters of the **mod29 ciphertext difference** have distinct operands, but all are conditional on lacking the actual authored opcode.

## Exact original outcomes

**Seven-page 139-position historical square.** Use original physical counts [214,261,271,238,228,228,240]. Let C be seven original, unchanged first139-rune prefixes, one per page. On each of 139 columns, apply the actual Stage10 7×7 square M modulo29, M inverse, transpose M, or inverse transpose. Every candidate roundtrips **973/973** original runes. Across the 28 resulting 139-rune row outputs, IoCs range **0.03044521–0.03795225**, close to uniform GP29 1/29; no sustained source-English or recognizable complete instruction emerges. No fresh 139-column alignment is warranted by the cuneiform.

**First authentic red-numbered unit.** The printed physical p33 red heading is the *section* start at local rune91; its first numbered-unit offset754 is section-relative, hence the correct whole-chapter source is **[845,984)**, exactly p36 local [99,238). **Do not use global [754,893)**: that interval is not the unit. Set g=3301 mod139=104. Since g has multiplicative order138 modulo139, 0 followed by [1,g,g²,...,g¹³⁷] enumerates all139 indices once. Preserve initial two source values, then read adjacent modular GP29 differences along the complete multiplicative path. Reversing cumulative addition reconstructs all **139/139** original runes. The untouched source IoC is **0.0341987279741**; output IoC **0.0367010739235**, beginning `L TH NG E EO S J OE M L C D A G C TH P I EO U ...`, not plaintext. This excludes only the unkeyed first-difference receiver on the source-selected 139-rune sequence.

**New explicit field-coset readout, not an authored instruction.** The original numerals satisfy
```
1033 mod29 = 18;  order_29(18) = 28.
3301 mod29 = 24 = 18^16 mod29;  order_29(24) = 7.
Every d in GF29* factors uniquely as d = 18^r * 24^k mod29,
with r in 0..3 and k in 0..6.
```
On every nonzero *within-physical-page* ciphertext difference d=C_i−C_(i−1), take r as a base4 digit, preserve k for reversibility, and keep d=0 as an exceptional event. This captures a natural 4×7 decomposition of the **28** nonzero GP29 predecessor transitions. Pack four consecutive r digits into one byte, testing all four initial phases and two digit orders only; no fitted substitutions, keys, or unknown-ciphertext score tuning.

| Exact untouched recipient | Nonzero r digits | d=0 events | Best printable ASCII after all 8 fixed packings | Longest printable run at best packing |
|---|---:|---:|---:|---:|
| First true red-numbered 139-rune unit | 137 | 1 | 17/33 = 51.52% | 5 bytes |
| Physical p33–39, all seven pages | 1661 | 12 | 172/415 = 41.45% | 6 bytes |
| All unknown LP2 pp0–55, page-local deltas | 12815 | 86 | 1238/3203 = 38.65% | 9 bytes |

The full chapter r class counts are **[417,448,418,378]** and whole-book **[3257,3193,3169,3196]**—near-balanced, and ordinary direct ASCII remains unrecognizable. The best seven-page byte stream starts hexadecimal `43 47 06 2b 0f 27 c9 23 e1 d5 49 70 3e 49 15 50`. No plaintext byte encoding or start framing is authored by the source, so this only rejects straightforward unkeyed ASCII under the stated packing.

**Real solved-text receiver positive, not an original decryption:** Convert the actual 100-character transliteration of the independently solved p57 into ASCII. Encoding each ASCII byte as four base4 r digits and choosing k=0 creates an artificial valid GP29 ciphertext-difference stream with no repeats; the frozen extractor restores all **100/100** original solved-source characters. Thus the byte receptor is computationally capable of detecting a genuine message but did not find one in the original ciphertext.

## Reproduction and next decision

[Single-file source-only CommonJS SFT](../sims/lp2_agent17_p33_sevenpage_orbit_coset_sft.cjs) reads canonical `resources/liber-primus/lp2-corpus.json` and the authentic `resources/cicada2014-openpuff-magic-squares.txt`; it checks exact page lengths, true numbered-unit boundaries, group orders, all matrix inverses, orbit replay, all eight bit packings and the solved-page ASCII plant. It is fully deterministic; there are no selected keys or searches beyond the declared eight packings.

**Do not continue from a numerical match to a key hunt.** The source-specific gap is an *original or signed instruction* selecting (a) a differential/coset meaning and the state k consumer, (b) an across-page 139-column alignment, or (c) a cumulative-difference operation on the first numbered unit. An independently authored source-selected mechanism must yield a complete, replayable unknown-page plaintext passage before reopening any of these exact negative receivers. These observations are intermediate and do not modify the authoritative state in `results/README.md`.
