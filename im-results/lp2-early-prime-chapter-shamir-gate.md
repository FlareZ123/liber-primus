# Original LP2 opening chapter factors: direct GF29 share recovery

**Current decision (15 November 2026): the original four prime-divisible chapters produce no native-GP prose through any of 232 complete threshold-k Shamir evaluation readouts over GF29, including source-signaled x=24, or through any of their 52 polynomial coefficient readouts.** The original eight x=0 inversions and key-independent shared-pad gate remain valid. This is conditional on the printed 3/5/7/11 strand partition, the hypothetical share coordinates 1...k and a directly readable GP29 plaintext. No original unknown plaintext, authentic key or decryption operation is recovered.

## The source-selected opportunity

The first four original visual chapters have independent image-defined boundaries, and their total GP29 rune lengths factor by four successive odd primes:

| Original physical chapter | Physical pages | Exact GP29 runes | Chosen number of shares | Exact length per share |
| --- | ---: | ---: | ---: | ---: |
| First | p0–2 | **729** | **3** | 243 |
| Second | p3–7 | **1,145** | **5** | 229 |
| Third | p8–14 | **1,729** | **7** | 247 |
| Fourth | p15–22 | **1,903** | **11** | 173 |

The source-visible section boundaries come from rubrication and large marks, independent of the arithmetic. The original chapters span 3, 5, 7 and **8** pages respectively. In the fourth case, 11 is selected by the hypothesized continuation of the prime-number series and the exact observed factorization, **not** by the physical page count.

A contemporary solver had a possible reason to consider polynomial sharing: Cicada's 2013 puzzle used Shamir secret sharing, and both releases emphasize primes. However the historical 2013 implementation and secret field differ from this proposed GP29 interpretation. The source does **not** instruct a solver to split these chapters into these equal strands, or to use consecutive x coordinates 1...k. Their factorization may be incidental.

## Full original-source polynomial inverse

For a given chapter, concatenate the original physical pages in their printed order, and divide the resulting `k*n`-rune array into `k` equally sized GP29 field-element streams. Test both source-conventional layouts, frozen before looking at readable output:

- **Contiguous:** share `j` contains `C[j*n ... (j+1)*n-1]`.
- **Interleaved:** share `j` contains `C[j],C[j+k],C[j+2k],...`.

For each source rune position `t`, interpret the k share values as `f_t(1),...,f_t(k)` for a degree less than k polynomial over GF29 and interpolate its secret `f_t(0)`. Exact Lagrange weights are

`lambda_j = (-1)^(j-1)*binomial(k,j) mod29`, for `1 <= j <= k`.

This is a complete, deterministic original-input decoder under the specified register. No key guess, language fitting, transposition ordering search or byte codec is involved. For each chapter and layout, the reproducer creates a nontrivial degree-(k-1) synthetic Shamir codeword over the same field using untouched GP-native Emerson plaintext, and verifies exact recovery of **all n planted plaintext symbols**. Changing a single share breaks the plant.

## Observations on original ciphertext

| Chapter | Contiguous share result IoC | Interleaved share result IoC | Minimum IoC across native GP control windows of equal length |
| --- | ---: | ---: | ---: |
| p0–2, 3 shares | 0.03435024 | 0.03424821 | **0.05006292** (1,329 windows) |
| p3–7, 5 shares | 0.03435992 | 0.03286601 | **0.04968207** (1,410 windows) |
| p8–14, 7 shares | 0.03587769 | 0.03442941 | **0.05141371** (1,308 windows) |
| p15–22, 11 shares | 0.03306896 | 0.03589192 | **0.04906573** (1,867 windows) |

Every recovered original output is substantially less concentrated than even the lowest-IoC source-native English control of the same length. The exact GP29 output strings and positive controls are produced by the linked script, so no candidate readable English is being omitted.

A separate **full all-secret repeated-pad constraint** is possible without interpolation: if the k equal contiguous strands used the same positionwise secret additive pad or an arbitrary shared bijection at each offset, symbols matching in ciphertext at the same column would also match in plaintext. The entire column-pair equality counts are:

| Chapter | Actual equal share pairs | Total share pair positions | Actual equality rate | Uniform GP29 rate |
| --- | ---: | ---: | ---: | ---: |
| p0–2 | 22 | 729 | 0.03018 | 0.03448 |
| p3–7 | 80 | 2,290 | 0.03493 | 0.03448 |
| p8–14 | 179 | 5,187 | 0.03451 | 0.03448 |
| p15–22 | 308 | 9,515 | 0.03237 | 0.03448 |

These are random-like, whereas independent ordinary GP-English passages would share a considerably greater fraction of the same symbols at aligned positions. Permuting the share order cannot alter these counts. Thus the **direct reused-pad many-time-pad route** does not exhibit its required source-native equality signal under this pinned layout.

## Complete GF29 inverse: every polynomial coefficient and all 29 possible secret points

**15 November 2026, Agent 36.** The earlier x=0 test can miss a hidden polynomial coefficient or a deliberately different secret evaluation point. The original source also independently prints a double root at **24** in p39's red quadratic and the signed p15 Fibonacci matrix's characteristic polynomial, with the matrix's other roots **8 and 17**. These source values allow a controlled extension without fitting a plaintext-dependent secret. The direct assumption that the chapter strands are Shamir shares remains speculative.

For each original complete first-four-chapter tape, preserve the original k-way equal split and both preexisting contiguous/interleaved layouts. The k published share abscissae stay **1,2,...,k** as in the original inverse. Invert their complete Vandermonde matrix over GF29 and retain **every one of the k coefficient sequences**, including nonconstant terms. Independently evaluate the unique interpolated degree-less-than-k polynomial at **every x in GF29**, not only source-selected 0,8,17,24. This is an **exhaustive 29-point secret-coordinate test** for that source-fixed interpolation architecture, not a sampled key sweep. The x values 1...k reproduce actual share strands and act as internal exact controls.

Every original output remains nearly uniform. The strongest of all 52 coefficient readouts has GP29 index of coincidence **0.037035**, while the strongest of all **232** evaluation readouts has **0.037424346893**. None reaches **0.038**, well below the separately pinned native-GP Emerson controls' prior minimum **0.04906573** for each matching 173–247-rune length.

| Complete original chapter | Share k | n | Highest GF29 evaluation IoC, contiguous (x) | Highest GF29 evaluation IoC, interleaved (x) | Evaluation at p39 double root x=24: contiguous / interleaved |
| --- | ---: | ---: | ---: | ---: | ---: |
| p0–2 | 3 | 243 | **0.036459** (21) | **0.036493** (10) | 0.034180 / 0.034894 |
| p3–7 | 5 | 229 | **0.037041** (11) | **0.037424** (8) | 0.032751 / 0.033900 |
| p8–14 | 7 | 247 | **0.035944** (4) | **0.036898** (13) | 0.034759 / 0.034528 |
| p15–22 | 11 | 173 | **0.037236** (18) | **0.037303** (14) | 0.032061 / 0.035153 |

Every table entry uses **original ciphertext** and canonical GP29 symbols, with no new layer, guessed key, word relabeling or phase. The numerical GP29 IoC is the complete output statistic, not proof of nonlinguistic content in all possible registers. Some of the evaluation points' apparent maxima (especially x=8 in p3–7) were selected from all 29 values, so the table is a finite exhaustive upper bound, not individual p-values. A source-chosen x=24 would have been more compelling had it yielded an unmistakable inverse; it does not.

The [Windows Node22 original-cipher test, passing run 43662786852](https://github.com/FlareZ123/liber-primus/actions/runs/43662786852) executed the [self-contained expanded original-input test](../sims/lp2_prime_chapter_full_polynomial_source_sft.cjs) asserts the exact four original source lengths, every Vandermonde inverse, all 52 coefficient and all 232 finite-field evaluation results, and positive-source controls using actual solved p57 GP29 text. The positive encoding deliberately hides native text as **each possible polynomial coefficient**, as well as the value at **x=24**, and verifies exact recovery in both layouts for all four k values. It is an executable check that the full inverse can read the proposed register, independent of the negative source finding. The existing [original x=0 reproduction](../sims/lp2_early_prime_chapter_shamir_sft.cjs) remains intact.

**Decision:** no Shamir secret **f(x)** at any GF29 point and no direct polynomial coefficient supplies a native GP29 plaintext through these original equal-share partitions under the unchanged 1...k abscissae. This retires the complete direct-readout family for the four chapters, not general Shamir constructions with independently specified different share positions, additional field encodings or encrypted shares. The visible 3/5/7/11 divisibility remains an arithmetic observation, without an author-certified sharing instruction.

## What remains

The first-four-chapter **3,5,7,11** divisibility sequence is a compact potentially source-meaningful observation, especially beside authentic prime and 2013 secret-sharing themes. It does **not** by itself identify a puzzle instruction. The complete GF29 interpolation family now supplies 232 negative evaluations at every possible secret point and 52 negative polynomial-coefficient readouts under the preexisting 1...k share convention. The same-pad test separately disfavors directly repeated positionwise substitution keys. The experiment does not exclude different share coordinates, encoded binary secrets, a second cryptographic layer, mismatched section clock or an independently selected alternative operation. Such extensions need their own source-driven justification.

**Reproducer:** [complete, single-file CommonJS source test](../sims/lp2_early_prime_chapter_shamir_sft.cjs), using unchanged `resources/liber-primus/lp2-corpus.json` and `resources/control/emerson_essays_2944.txt`. All eight native-GP planted recoveries and all source constraints pass.