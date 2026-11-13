# All-secret word-first-rune GP29 affine-feedback decoder: original LP2 rejection

**Agent 3, 13 November 2026. Evidence: complete finite family, conditional on source-calibrated native English. No unknown plaintext or actual key recovered.**

## Why this is a distinct plausible inverse

The original LP2 rune stream has unusually few adjacent repeated glyphs, while its 2,896 printed word boundaries are independently visible. One source-comprehensible reversible mechanism would assign every printed word a transformation determined by its **first ciphertext rune**, using the word break to publish the seed. Such a mechanism can rotate alphabets from word to word, hide ordinary English frequency peaks globally, and make a repeated ciphertext rune encode one relatively rare underlying character (Latin K was a previously considered candidate). It needs no hidden random pad or independently supplied 12,956-symbol key. The source-visible word structure and historically used GP29 modular arithmetic make this worth a **single all-key test**, though no original Cicada instruction presently selects this exact family.

This is more flexible than the previously rejected single stationary slope and substitution for **all** words in [the original word-reset study](lp2-cumulative-difference-zero-symbol-gate.md). Here every one of the 29 possible first ciphertext runes selects its **own unknown affine slope** and **own arbitrary unknown nonlinear alphabet permutation**. Per-word first-glyph values are treated as freely provided cipher state; we ignore every printed word's first position rather than claiming to decode it.

## Exact model and all-key argument

For an original printed word `w`, let `s=C[w,0]` be its first GP29 rune. A proposed length-preserving decoder has the within-word forward rule

`C[w,j] = (a_s * C[w,j-1] + h_s(P[w,j])) mod 29`, for `j >= 1`,

where `a_s` can be **any** of 29 values and `h_s` can be **any** of 29! GP rune permutations, separately for each of the 29 seed glyphs. For each group `s` and slope `a`, the exact original `10,060` interior pairs contribute symbols `D_s,a = (C[w,j] - a*C[w,j-1]) mod29`. An arbitrary bijection `h_s` can only **permute** these 29 category counts. Their sorted spectrum is invariant. Comparing that spectrum to independently derived native GP29 English letter probabilities, conditioned on **each original printed word's exact length and interior position**, therefore gives the mathematical minimum total-variation distance over every `h_s`. We minimize each row independently over all 29 slopes, covering **29^29 slope arrays multiplied by (29!)^29 hidden alphabets** without enumerating keys.

The English reference contains **149,072** authentic source-spelled control words across Gibran, Emerson and Shakespeare. The native spelling implements the solved alphabet's `ING`, `IO`, `QU→CW`, `V→U`, `K/Q→C` and `Z→S` rules. The source parser reproduces **12,956 unknown runes in 2,896 words**. There are no missing reference word lengths. Native first-rune dependence is not explicitly modeled; the conclusion applies to hypotheses whose seed-conditioned plaintext interiors follow this source-length and position-calibrated English model. A secret plaintext-dependent word partition, other languages, compression and within-word dynamic key changes remain different possibilities.

## Outcome on the untouched original and a source-native plant

The [one-file CommonJS SFT](../sims/lp2_wordseed_allsecret_affine_gate_sft.cjs) tests **all 29 original first-rune groups** and all 29 slopes per group, grants each group a completely unknown nonlinear substitution, then computes the **best possible** native-English rank-TV gap in that group.

| Exact 29-group statistic | Best possible original LP2 | Independently enciphered native-English positive control |
|---|---:|---:|
| Minimum group rank-TV | **0.253188** | **0.036285** |
| Mean group rank-TV | **0.282075** | **0.054409** |
| Maximum group rank-TV | **0.304513** | **0.084850** |
| Within-word symbols checked | **10,060** | **10,060 / 10,060 recovered** |

The positive control uses the original 2,896 printed word lengths and *original first-cipher-rune seed group assignment*, then source-calibrated native English, 29 distinct nonlinear bijective alphabets `h_s(p)=(p^5+7s+3) mod29`, and 29 distinct selected slopes `a_s=(7s+3) mod29`. It recovers all 10,060 interior plaintext symbols exactly and exhibits ordinary source-native spectra. The original's **best possible** result under all hidden key choices is far outside the plant's native range. Since each group could choose its own optimal slope and alphabet, a different global key schedule cannot rescue this **stationary within-seed group** model. This is an original-cipher distribution exclusion under the declared English model, rather than a proof against all conceivable plaintexts.

## Cryptanalytic decision

Retire the direct **first-cipher-rune → fixed per-word affine-feedback slope and alphabet** route. The actual unknown original does not conceal a conventional source-native GP29 English stream through that entire family, regardless of its twenty-nine unobserved key mappings. This restricts a motivated class of word-local nonrepeat encoders, complementing the earlier all-secret global word-reset result. A promising successor must introduce genuinely *changing* state inside a word, a different information register, source-selected key material, or an independently evidenced language. No amount of extra parameter fitting within these 29 stationary seed groups changes the sorted-spectrum obstruction.

**Exact original-source reproduction:** all group/generator assertions and the 10,060-position independent plant passed in [manual GitHub Actions 43482515566](https://github.com/FlareZ123/liber-primus/actions/runs/43482515566).
