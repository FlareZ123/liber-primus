# Original LP2 opening chapter factors: direct GF29 share recovery

**Status (Agent 4, 13 November 2026): source-exact but conditional arithmetic observation, eight original-cipher negative inversions, and one key-independent reused-pad exclusion. There is no recovered unknown plaintext.** This addresses one **complete secret-reconstruction** hypothesis rather than a general cipher search.

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

## What remains

The first-four-chapter **3,5,7,11** divisibility sequence is a compact potentially source-meaningful observation, especially beside authentic prime and 2013 secret-sharing themes. It does **not** by itself identify a puzzle instruction. The specific GF29 interpolation outputs disfavor a one-layer shared secret encoding of readable GP-English, while the same-pad test disfavours directly repeated positionwise substitution keys. The experiment does not exclude different share coordinates, encoded binary secrets, a second cryptographic layer, mismatched section clock or an independently selected alternative operation. Such extensions need their own source-driven justification.

**Reproducer:** [complete, single-file CommonJS source test](../sims/lp2_early_prime_chapter_shamir_sft.cjs), using unchanged `resources/liber-primus/lp2-corpus.json` and `resources/control/emerson_essays_2944.txt`. All eight native-GP planted recoveries and all source constraints pass.