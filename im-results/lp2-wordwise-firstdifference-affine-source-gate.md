# Word-local first-difference affine and Möbius source-native inverse gates

**Agent 35, 15 November 2026. Classification: bounded original-input cryptanalytic exclusion.** The stronger projective result is the current frontier. No unknown LP2 plaintext, creator key, or source-specified transformation has been recovered.

## One authentic clue, two increasingly generous inverse models

The dated [February 2015 original-solver prime/difference observation](lp2-2015-prime-delta-40-doublet-source-inversion.md) applied a successive-prime GP29 shift and consecutive differences to original physical pp0–2 and found **40 adjacent equalities**, without readable plaintext. Independently, LP1's printed magic-square commentary contains **MOBIUS**, and the research has original-sourced 2×2 arithmetic landmarks. These suggest *specific executable families to test*, though no surviving Cicada-authored instruction says to compose either with a word-level first difference.

Each tested original printed word `C[0..L-1]` generates the internal step stream
```text
D[i] = (T[i] - T[i-1]) mod 29, for i=1..L-1.
```
Input **A** is the literal original 12,956-rune LP2 pp0–55 ciphertext: `T=C`. Input **B** is the exact historical 2015 prime3-first candidate `T[i]=(C[i]-prime[i+1]) mod29`, tested on the original 729-rune p0–2 chapter. In both, the first plaintext rune is left **unconstrained** and each word is joined across physical pages. Only source-native English word candidates encoded with the GP29 historical ING/IO orthography are compared.

The first family lets *each word independently choose* an unknown affine key:
```text
D[i] = a_word * P[i] + b_word  (mod 29), with a_word != 0.
```
The more generous **projective** family grants a wholly independent unknown invertible fractional-linear key on *each* word:
```text
D[i] = (a_word * P[i] + b_word) / (c_word * P[i] + d_word) mod 29,
with a*d - b*c != 0 and the denominator nonzero on emitted symbols.
```
Full PGL(2,29) transformations act on 30 projective field points. A complete lossless 29-symbol implementation of a non-affine map would need an additional explicit pole/exception rule, **not supplied by these sources**. For this gate, all projective keys are nevertheless permitted whenever defined on the tested finite word symbols. This is a very generous necessary condition, regardless of the missing 29-domain completion. An affine key is a special case `c=0`.

## Exact, exhaustive key-independent test

The canonical [original GP29 rune/word corpus](../resources/liber-primus/) contains **2,896** complete printed ciphertext words. The source-native [29,157-word control lexicon](../resources/control/english_wordfreq_textblob.txt) is GP29 encoded by the actual single-rune `ING` and `IO` conventions. Every printed word length 7–14 is tested against **every** lexicon word of the same GP29 length, with no fitted start, word key, language scoring, or partial-word substitution.

An affine-normalized signature subtracts the first observed value from all others mod29 and scales by the inverse of the first nonzero displacement. Two suffixes have the same signature **if and only if** some nonzero affine map relates them.

For the projective gate, the first three distinct symbols are sent to the canonical projective triple `(0,1,∞)`; the remaining normalized points are exact **cross-ratio invariants**. Any PGL(2,29) mapping of the tested finite symbols must preserve this signature (and, when fewer than three symbols are distinct, the equality pattern). This enumerates the full projective action *without enumerating secret word matrices*.

| Original source register | Long words tested | Affine-compatible | Projective-compatible |
| --- | ---: | ---: | ---: |
| All original LP2 pp0–55, literal GP29 first differences | **559** | **0** | **30**, all length 7–8 |
| Original p0–2, historically specified prime-shifted first differences | **38** | **0** | **2**, both length 7 |

On **original raw LP2**, the exact projective-compatible breakdown is:

| GP29 printed-word length | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Words tested | 216 | 156 | 78 | 52 | 32 | 18 | 4 | 3 |
| Affine candidate matches | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Projective candidate matches | 27 | 3 | **0** | **0** | **0** | **0** | **0** | **0** |

Thus **none of the 187 original words of length ≥9** is compatible with a lexicon word under *any* independent per-word fractional-linear key applied to its first-difference suffix. The 30 length-7/8 projective-compatible source entries are low-information collisions, **not** decrypted words; they lack a shared inferred mapping, sentence coherence, author key or held-out prediction.

Two separate planted-positive checks exercise the exact same apparatus. A deterministic 200-word native GP source is encoded with a word-local affine cumulative map `C_i=C_(i-1)+7P_i+9 mod29`; the invariant recovers **200/200**. A separate 200-word native source excluding one pole is encoded by a **genuinely non-affine** projective map `(7P+9)/(P+2)` over GP29 (determinant 5), then cumulatively summed; the cross-ratio gate recovers **200/200**. The original-source exclusions are therefore not attributable to a broken equivalence test.

## Cryptanalytic decision

A **word-rekeyed first-difference architecture with any fixed fractional-linear plaintext map per original word**, even granting completely free independent projective matrices, cannot reconstruct *all* original long words as entries of the source-native English dictionary. The historically prime-shifted first chapter likewise fails its affine and nine-plus-rune projective gates. The result is a conditional English-register exclusion; rare novel words, Latin, Old English, word-boundary changes, symbol-local variable states, source-selected exceptions, or different plaintext/output alphabets remain outside the test.

The 2015 40-doublet observation is from a **participant**, not a Cicada-signed directive. The printed LP1 MOBIUS string establishes creator familiarity with the mathematical term, though no first-party source selects wordwise PGL transforms of LP2 first differences. Neither operation yields authenticated unknown-page plaintext. Prioritize genuinely sourced key/state instructions or an independent plaintext crib, rather than more flexible per-word fitting.

**Complete reproducibility:** [self-contained CommonJS test](../sims/lp2_wordwise_firstdifference_affine_sft.cjs). It reads the exact canonical source rune array, printed words and control lexicon; validates **all 12,956 GP indices and 2,896 original words**; computes both complete key-independent equivalence classes; asserts the exact counts; and performs both 200/200 native positive plants. It can be run on Windows Node22 as a single file.
