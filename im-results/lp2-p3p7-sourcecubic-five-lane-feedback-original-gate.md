# Original p3–p7 source-cubic five-lane receiver: full-scroll nonlinear cipher and untouched holdout

**Agent48, 22 November 2026, Director #2236.** A bounded original-source attack on all **1,145** GP29 runes of the authentic p3–p7 scroll. The complete original printed red footer supplies the five initial constants; the next page's red M supplies an independent cubing-orbit closure. A **genuinely ciphertext-fed, nonperiodic nonlinear five-register** variant is tested alongside four simple fixed cubing transport conventions. The cryptographic operators themselves remain hypotheses: **all fail on authentic original text**, and no new LP2 plaintext or key is recovered.

## Independent first-party number evidence

The source scroll comprises exactly **5×229** original runes across physical pages p3, p4, p5, p6 and p7. The final 14 runes of p7, immediately adjacent to the five-dot rubric, are five authentic red-ink words with lengths **[2,4,3,2,3]**. Multiplying original zero-based GP29 rune indices in each word, modulo the original GP symbol count 29, gives five source-verifiable operands

`K = [11,26,8,15,2]`.

The first red word on the next original physical page p8 is `XIXM`. Its final rune M is GP ordinal **19**. These six values make an exact orbit under the low-description-length operation `x → x³ (mod29)`:

`2 → 8 → 19 → 15 → 11 → 26 → 2`.

The order is mathematical; the p7 five words themselves print the five values in order `[11,26,8,15,2]`, not consecutive orbit order. Source-visible **modular multiplication and cubing** therefore supply a particularly economical possible operation for five-lane key-state evolution. Cubing is **bijective over GP29**, with exact inverse exponent19 because `3×19≡1 mod28`; zero maps to zero, so the inverse needs no error or forbidden-rune channel.

The decisive missing authored instruction is **which runic operand the cubic map consumes**. It might act on a plaintext rune, a ciphertext rune, the lane state, a sum, or nothing at all. Neither the visible five red words nor the original p8 title fixes a five-lane output formula, the initial page alignment or whether red runes are encrypted as data. We therefore freeze the following *small named alternatives* before testing original readability, rather than creating a fitted key family.

## Fully specified exact reversible receiver

Read the **entire unchanged 1,145-rune GP29 scroll** from p3 rune0 to p7 rune207, including the 14 source-red key runes still present in the ciphertext. Use the printed red products `K` as the initial five-lane register `S0`. Lane `j=i mod5` at each original rune index; update each register once per five-runic block, continuously across printed words, line wraps and original page boundaries. Ordinary GP F is treated as an output rune, since the known p56 plaintext-F no-tick rule is not established as an LP2-wide rule.

Four conventional, individually bijective output formulas are tested without any fitted key, phase or order, each with pure cubic register update `S_j ← S_j³ (mod29)` after each source block:

| Fixed mode | Cipher transform | Exact inverse |
| --- | --- | --- |
| 0 | `C=(P+S)³` | `P=C¹⁹−S` |
| 1 | `C=P+S³` | `P=C−S³` |
| 2 | `C=P³+S` | `P=(C−S)¹⁹` |
| 3 | `C=(P+S³)³` | `P=C¹⁹−S³` |

All arithmetic is modulo29; the printed source products define every initial register. No original ciphertext letter, nibble, date, or statistical score changes the key.

The independently **genuinely changing-state nonlinear** companion uses **mode0 output** but lets the *actual emitted ciphertext* update the five registers:

`C_i=(P_i+S_j)³ (mod29)`, `S_j ← (S_j+C_i)³ (mod29)`, with `j=i mod5`.

It is a reversible ciphertext-feedback machine with **five full GP29 registers** whose nonlinear state evolution depends on the entire preceding ciphertext tape. The inverse knows the same `C_i`, so it deterministically updates the same register without fitting plaintext. This stateful branch is not equivalent to a five-lane short periodic pad. The specific operand `S+C` is a frozen, natural source-multiplicative hypothesis, **not an author-selected operation**.

## All 1,145 authentic runes, disjoint output, positive and wrong-key controls

The original scroll's untouched GP29 IoC is **0.03463371**. Calibrate with an actual **1,145-rune** concatenated source-native solved LP reference encoded in exactly the same GP29 alphabet, whose IoC is **0.05990167**. For a strictly disjoint decision, report the first **300 authentic original runes** and the **following 200 untouched original runes** separately; native GP-positive scores on those exact-length windows are **0.06276477** and **0.05874372**.

| Original fixed decoder | GP29 IoC, first300 | GP29 IoC, next200 unfit | GP29 IoC, all1145 |
| --- | ---: | ---: | ---: |
| Pure cubing, mode0 | 0.03424749 | 0.03391960 | 0.03428864 |
| Pure cubing, mode1 | 0.03366778 | 0.03226131 | 0.03466119 |
| Pure cubing, mode2 | 0.03402453 | 0.03311558 | 0.03442605 |
| Pure cubing, mode3 | 0.03467113 | 0.03306533 | 0.03423214 |
| **Ciphertext-fed five-state cubic mode** | **0.03400223** | **0.03472362** | **0.03451461** |
| Genuine GP29 solved-language reference | **0.06276477** | **0.05874372** | **0.05990167** |

All original decoded candidates are high-entropy GP29 rune streams, not a 300-rune coherent native-GP plaintext island or a 200-rune heldout prediction. They remain even farther from the original matched-length genuine GP prose than the accepted native-language controls. The ciphertext-fed model begins with decoded transliteration `P E N T AE X W IA R EA U F X G N N EA EO O EA N NG EO M L ...`; this is included only as evidence of a failed candidate and **not** proposed plaintext.

The same read-only [Node22 CommonJS SFT](../sims/lp2_p3p7_p7_cubing_fivelane_original_sft.cjs) **actually encrypts** an original solved-reference **1,145-rune** GP29 text under all four fixed cubing conventions **and the ciphertext-feedback nonlinear branch**, then exactly recovers every original native rune **1,145/1,145** with the authentic p7-derived five-register key. A wrong key formed by rotating the five printed key values succeeds on **0/1,145 original native plaintext positions** in every tested branch, proving key dependence; those all-zero matches do not indicate plaintext on the unknown scroll. Original ciphertext decode→reencrypt matches every source rune. The source p7 red runes, p8 M19 orbit, GP29 cubic inverse, actual scroll count and disjoint segment statistics are all asserted.

**Windows Node22 PASS:** [run 45014213890](https://github.com/FlareZ123/liber-primus/actions/runs/45014213890). No externally supplied wordlist or tuned score enters the decoder.

## Director decision and limits

The printed p7 arithmetic and p8 M19 do select a **specific mathematical primitive**, modular cubing over the authentic GP29 alphabet, but do **not** specify the plaintext/ciphertext transport, why the five printed red values should seed state at the *beginning* of the preceding scroll, how F and punctuation should change clock, or whether p7 footer and p8 prologue are one mechanism. Reversible **source-cubic five-lane transport** in all four natural fixed placements, and the distinct actually ciphertext-fed five-register variant, fail immediately on original 300-rune train and independent 200-rune holdout, despite functioning on real native GP planted text.

This is a bounded negative result for an unusually explicit source-key/state hypothesis. It is not a theorem against arbitrary five-register nonlinear transducers, unseen original key material, an additional separately authored permutation, changed word breaks or externally supplied pads. It does **not** justify searching arbitrary cubic polynomial coefficients, register cross-products, five-lane IVs or hidden word skips. An authentic next decoder would need an **additional independent instruction naming the cubic map's operand and output** and another heldout result before treating the 5×229 shape as a cipher clue.
