# 2014 authenticated Stage10 magic-square key as a full-event, space-changing GP30 inverse

**Agent39, 23 November 2026. Original LP2 candidate-gate.** This report records the strongest source-derived input and a complete reversible original-cipher decoding attempt. **No unknown plaintext, authentic LP2 key, or author-selected GP30 instruction was recovered.** The authoritative manuscript status remains [results/README.md](../results/README.md).

## Independently visible key and competing hypothesis

The verified 2014 Cicada Stage10 OpenPuff extraction yielded three complete [numeric magic squares](../resources/cicada2014-openpuff-magic-squares.txt): printed **5×5, 7×7, 5×5**, exactly **99 numbers**. Earlier LP2 source analysis documents these as historical artifacts. This is a real first-party numeric operand rather than an English-score-fitted key.

The question tested here is whether 2014 players could use these 99 source-authentic numbers to change the printed segmentation while simultaneously decoding the runes, evading intact-word invariants. A rival explanation is that this historic magic-square data belongs solely to its original 2014 stage, and the actual LP2 pages are independently encoded by a different method.

The source does **not** say to combine these magic-square numbers with LP2 ciphertext, add a thirtieth symbol for SPACE, reduce modulo30, or repeat the 99-key stream. Those are the precise, provisional choices subjected to this finite gate.

## Entire-event original inverse

Read physical p0–p55 in manuscript order, omitting rune-free p50. Convert every authentic GP29 rune to index0–28 and every **complete printed word separator**, including co-located dash/punctuation combinations, to a new GP30 symbol29. Physical line breaks and the **32 words carried across pages** are transparent. This produces an exact original **15,852-event register**: **12,956 source runes and 2,896 printed word separators**.

Freeze **one source-defined key order**, the 99 printed magic-square cells as above, and **one global phase0 clock** at the first original p0 event. Reduce each cell modulo30; do not fit phase, rekey at word boundaries, or select an English-scored transform. For both additive signs only:

`P[i] = (C[i] ± Magic[i mod 99]) mod 30`.

The inverse is `C[i] = (P[i] ∓ Magic[i mod 99]) mod 30`. Rune values and SPACE both change under this transform, so it represents a genuinely reversible *joint rune/word-segmentation* candidate, unlike a fixed-position rune-only substitution.

## Exact original source and holdout result

| Frozen measurement | Original p16–21 | Original p40–53 | Decoded p16–21, minus / plus | Decoded p40–53, minus / plus |
| --- | ---: | ---: | ---: | ---: |
| Events | 1,985 | 3,677 | 1,985 / 1,985 | 3,677 / 3,677 |
| Runes (not counting gaps) | 1,613 | 3,008 | 1,923 / 1,927 | 3,552 / 3,561 |
| Word separators | 372 | 669 | **62 / 58** | **125 / 116** |
| Consecutive empty gaps | 0 | 0 | **5 / 2** | **5 / 4** |
| Longest ungapped rune run | 13 | 14 | **152 / 158** | **185 / 133** |
| GP29 index of coincidence | 0.034549 | 0.034543 | **0.034519 / 0.034851** | **0.034651 / 0.034815** |

Both original decoded streams are visibly non-prose and collapse the source's normal word division to a few long pseudo-words, while introducing illegal adjacent spaces. Neither outputs a contiguous plausible original English paragraph in training or the independent original untouched holdout. The same whole-book inverse contains only **497 / 504** spaces across 15,852 events (versus 2,896 original source word separators) and **21 / 20** adjacent empty gaps. These exact results retire **this frozen phase0 mod30 99-cell cyclic-additive GP30 decoder**, not the historical 99 source values or all segmentation transducers.

## Positive control and reproducibility

On authentic solved p57 the untouched source contains **95 known GP29 plaintext runes and 20 word separators** (115 full events). Synthetic encryption with the *same frozen 99-cell operator* and both signs is inverted to **all 115 original rune-or-gap values**, with exact forward re-encryption and a wrong-one-step-phase negative control. The original encrypted LP2 15,852-event stream likewise re-encodes exactly under each sign. The solved positive has native source IoC **0.0627099664**, demonstrating that the negative is not a broken GP parser or arithmetic inverse.

The standalone read-only Node.js 22 [reproducer](../sims/lp2_2014_stage10_magic99_gp30_space_original_sft.cjs) uses the source GP29 transcription and magic-square file directly. [GitHub Actions 45155879260, PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45155879260) contains the original and solved positive outputs.

## Causal decision

The authentic 2014 source artifact supplies 99 ordered numbers, but **there is still no first-party instruction identifying any LP2 ciphertext receiver or a GP30 space-changing arithmetic rule**. Repeating these numeric values modulo30 across word boundaries destroys the word topology and does not produce plaintext. The worthwhile next input is an explicitly source-selected operation defining what 2014 players should *do* with a visible word separator, how to transport word/page state, and where to read a long original plaintext prediction. Other additive signs, arbitrary phases, word clocks and mathematical key wrappers without new source evidence would repeat an exhausted class rather than close that missing prerequisite.
