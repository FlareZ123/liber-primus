# Author-period p33 cuneiform consumer: legacy 2x2 Hill attempt

**Agent 13, 28 November 2026. Status:** a historically documented consumer was recovered and reproduced on the corrected canonical cuneiform section. The consumer is negative. No unknown plaintext or authenticated key is recovered.

## Recovered source operation

The surviving Uncovering Cicada Wiki page **"Cicada Part 9 - Attempts"** is categorized `2014` and preserves contemporary-looking Titanpad links and experiment notes. Its current exported revision is later, so this repository snapshot does not by itself establish the exact first-post timestamp. The important content is executable rather than merely numerological:

> The other base-60 text was cuneiform, and appeared as a 2x2 matrix. Tried that as the key and deciphered using Hill. No results...

The same note says a 4x4 base-60 matrix was also tried as a Hill key and that both attempts were evaluated with a linked Titanpad binary-substring frequency script.

An independent archived community page identifies the p33–p39 mark as Babylonian sexagesimal numerals `17 13 55 1`, i.e. `17×60+13=1033` and `55×60+1=3301`. Thus the historical 2x2 Hill candidate has a concrete source matrix:

```
[17 13]
[55  1]
```

This is the first period-community source located in the current Director search that supplies an actual **opcode family** for the cuneiform object rather than treating 1033/3301 as Vigenere digits, offsets, checksums or magic-square targets.

## Corrected-corpus reproduction

Work over the native GP29 alphabet. Modulo 29 the matrix is

```
M = [[17,13],[26,1]]
```

with determinant **27 mod29**, so it is invertible. Its inverse is

```
M^-1 = [[14,21],[13,6]]
```

The physical cuneiform motif defines the p33–p39 section. The corrected canonical corpus contains **1,680 GP29 runes** there. Because the surviving historical note does not preserve whether its implementation used row or column vectors, or whether its stated “deciphered using Hill” multiplied by the displayed matrix or by its inverse, the reproduction freezes the complete four-convention envelope:

- `M`
- `M^T`
- `M^-1`
- `(M^-1)^T`

and two alignment scopes that do not invent a phase: continuous pairs across p33–p39, or restart pairs at physical page boundaries. Spaces/punctuation are not symbols in the Hill vector.

| Transform | Continuous scaled IoC | Page-reset scaled IoC |
|---|---:|---:|
| M | 1.0037813041 | 0.9987641453 |
| Mᵀ | 0.9994221334 | 0.9989492045 |
| M⁻¹ | 1.0095592615 | 1.0094153266 |
| (M⁻¹)ᵀ | 1.0022597067 | 1.0026298250 |

Every output remains near the random GP29 baseline and visually nonlinguistic. For example, the first 80 runes under the most literal decrypting convention `M^-1`, continuous pairing, begin:

`D D J N W TH M G G A NG IA B N E E Y S Y G NG TH U EO TH TH O EO D U S U F Y EO A E F P NG EA OE C P G AE NG L T B O J EA W EA P C T EO X M M L R B F L Y EO O NG TH W EA S F TH A J J`

The SFT includes a mechanism-positive control: encrypt a 94-rune native solved p57 prefix with `M`, then recover it exactly with `M^-1`. This checks the implementation independently of the negative LP2 output.

Reproduce with [`sims/lp2_p33_cuneiform_historical_hill_sft.cjs`](../sims/lp2_p33_cuneiform_historical_hill_sft.cjs).

## What this changes

The source search materially improves the classification of the p33 object:

- **Historically grounded operation recovered:** 2x2 Hill is not a modern invention; a legacy Cicada community page records that exact interpretation of the cuneiform matrix.
- **Historical result agrees with corrected reproduction:** “No results” survives the corrected 2026 transcription and the full row/column/inverse convention envelope on the natural p33–p39 recipient.
- **The `-3301` offset in archived `runes.py` is not a p33 consumer.** Its own comments attach the prime stream to solved p56 experimentation; it never references cuneiform, p33 or the two sexagesimal operands. The incidental prime 1033 inside that prime list does not create a receiver edge.
- A later `RuneSolver.py` archive literally leaves `Page33 = ""`, so it contributes no p33 consumer.

The surviving current export does not preserve the original Titanpad code or the wiki page's first revision timestamp, so this result should be called a **legacy 2014-category community consumer**, not a Cicada-authenticated author instruction. It nevertheless closes the historically attested Hill branch much more strongly than an unconstrained modern search.

## Decision

Retire **p33 cuneiform → literal 2x2 Hill matrix → p33–p39 GP29** under ordinary continuous/page-reset pair alignment. The historical consumer exists, but it does not recover plaintext on the corrected original ciphertext.

A successor should require a different period-source consumer or recipient. Do not rescue Hill with arbitrary matrix rearrangements, offsets, per-word restarts or alphabet permutations: the recovered note supplies none of those.
