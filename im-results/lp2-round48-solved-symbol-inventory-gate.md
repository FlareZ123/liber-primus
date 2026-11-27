# Round48 remembered-drop alphabet: solved-source symbol inventory

**Agent16, 27 November 2026. Classification: intermediate source-side selector. No unknown LP2 plaintext or authentic key recovered.**

## Decision

Dukotah Round48 M1 introduced a zero-parameter remembered-drop construction: choose uniformly from an (m)-symbol table, forbid choosing the immediately previous table symbol, print only 29 GP29 symbols, and remember the (m-29) unprinted symbols. It independently proposed a concrete next discriminator: count the symbol repertoire already used by solved Cicada plaintext artifacts; a 35–37-symbol repertoire would give this construction a source-side prior.

That count lands exactly in the proposed interval without adding invented symbols.

Using the repository-pinned nine solved GP29 source records in
`resources/external/relikd-solved-gp29-native-v1.json`:

- canonical GP29 contributes **29** rune symbols;
- ordinary rune-bearing prose uses exactly six additional non-whitespace symbols:
  **`• ⁜ ⁘ ⁚ " '`**;
- therefore the directly observed prose repertoire is **35 symbols**;
- the solved *Loss of Divinity* passage additionally uses literal list labels **`1`** and **`2`** attached to rune prose, giving **37 symbols** if those labels share the same symbol table;
- numeric magic-square rows and p56's hexadecimal digest are separate literal-data channels and are not counted as ordinary prose symbols.

This is a source-constrained bracket, not a tuned alphabet. There is no source-fixed 36-symbol convention in this census.

## Original-cipher discriminator

For the remembered-drop stationary law,

[
q_m=P(C_i=C_{i-1})=rac{m-29}{29(m-1)}.
]

On the authoritative unknown LP2 prefix (N=12{,}956), the observed adjacent-equality count is (D=86) in (12{,}955) adjacent pairs.

| (m) | silent table symbols | expected doublets | relative likelihood from (D=86) |
|---:|---:|---:|---:|
| 35 | 6 | 78.8337 | 0.775 |
| 36 | 7 | 89.3448 | 1.000 |
| 37 | 8 | 99.2720 | 0.418 |

The likelihood ratio uses the exact Bernoulli equality law with the common binomial coefficient omitted. It is descriptive evidence only: the external m=35–37 interval was noticed before this source census, so this is not a blind confirmation. In particular, the doublet count mildly prefers the unsourced integer (m=36); that is **not** permission to manufacture a seventh hidden symbol.

## Segmentation-volume check

Cutting the canonical LP2 transcription after its first 12,956 GP29 runes (physical p0–55) gives:

- 2,727 printed word dividers `-`;
- 174 printed period marks `.`;
- 2,901 word-plus-period segmentation marks total.

The remembered-drop model predicts (N(m-29)/29) unprinted draws: **2,680.55 / 3,127.31 / 3,574.07** for (m=35/36/37). If one naively equated each visible word/period boundary to one lost draw, the count alone would imply (m=35.495).

Do **not** promote that numerical proximity to a mechanism. Round48 already notes that the observed doublet sites do not preferentially occupy printed word boundaries, and the remembered-drop generator assumes uniform table draws whereas English formatting is not uniform. The useful result is narrower: the amount of formatting in LP2 is not grossly incompatible with the same 35–37 scale, but positions and receiver remain unselected.

## Consequence for the solve frontier

The source inventory upgrades remembered-drop (m=35) and conditionally (m=37) from arbitrary alphabet sizes to artifact-compatible constructions. It does **not** show that the six/eight symbols are the actual silent states, that they are plaintext separators, or that LP2 is raw generator output. The direct seeded-generator reading remains externally negative, and a no-repeat extended alphabet cannot simply be identified with ordinary plaintext because solved prose itself contains repeated letters.

The next useful test is therefore receiver-side, not another (m) sweep: build a planted known-key transducer in which a 35-symbol or 37-symbol no-repeat state layer is consumed while only GP29 symbols reach the printed ciphertext, verify that the intended inverse can recover language, and then apply only source-selected key/state schedules to original LP2. Without such a typed receiver, the inventory is a prior rather than a decipherment.

## Reproduction

`sims/agent16_round48_symbol_inventory_sft.cjs` reads only the two pinned repository resources above plus `resources/liber-primus/lp2-corpus.json`. It reproduces the symbol census, the exact p0–55 transcription cut, visible separator counts, expected remembered-drop counts, and the three likelihood ratios. The computational core was executed in the connected JavaScript runtime; no standalone Node wrapper was separately run.

External premise: Dukotah/cicada3301, `liber-primus/analysis/round48/M1-INDEPENDENT-PASS.md` and `M1-leak-census/RESULTS.md`, filed 27 November 2026.
