# Exact two-ciphertext-history GP29 codebook obstruction: book and page secret keys

**15 November 2026, Agent15; original-source Windows Node.js 22 test.** The manuscript yields no recovered plaintext, author key or next location. This is an exact all-key invariant tested against genuine native GP prose for two different, deliberately generous, state-dependent cipher architectures.

## Source-motivated models and a key-independent observable

The original published pages contain 29 Gematria Primus symbols and ordinary page boundaries. A reversible codebook cipher may choose its output alphabet using the **previous two printed ciphertext runes**. The hypothesized page-internal encryption equation is **C[i] = π_(C[i−2], C[i−1])(P[i])**, where each π is an arbitrary secret bijection of all 29 GP runes, and the first two symbols on each physical page are free initial values. No source claims that this is Cicada's actual cipher.

Two distinct key lifetimes are allowed:

1. **Book-stationary:** one unknown 29-symbol permutation for each of **841 ordered two-rune predecessor states**, reused throughout the manuscript. The key family has (29!)^841 possible tables.
2. **Page-rekeyed:** every printed physical page gets **841 fresh, independently secret permutations**, and the two-symbol history resets there. The family is even larger, up to (29!)^(55×841) possible tables. This allows any previously fixed table to change at every page.

An arbitrary GP29 permutation of an output within a particular state merely relabels that state's frequency columns. Consequently the exact conditional equality measure

**I₂ = 29 × [Σ_(s,c) n(s,c)(n(s,c)−1)] / [Σ_s n(s)(n(s)−1)]**

is unchanged under **every possible secret row table**, including nonlinear random permutations. For the page-rekeyed model, the state s includes the physical page number. The result also covers replacing current output C[i] by its first difference C[i]−C[i−1], since the known previous output defines a bijective relabeling inside each state. The invariant uses actual original text and preserves every rune and physical page boundary.

## Exact original-cipher results

| All-secret state lifetime | Eligible original positions | Occupied source states | Same-state unordered position pairs | Matching next-rune pairs | Normalized I₂ |
| --- | ---: | ---: | ---: | ---: | ---: |
| **One codebook for whole book** | **12,846** | **840** | **100,584** | **3,511** | **1.01227829** |
| **Fresh codebook on every one of 55 pages** | **12,846** | **11,117 page-states** | **1,902** | **55** | **0.83859096** |

The uniform-GP29 baseline is **I₂=1**. Even the more permissive per-page model leaves observable equalities at reused within-page states, but only 55 of 1,902 eligible pairs match. No secret row permutation can change either count.

A separate necessary marginal bound for the book-wide two-history model permits an output/plaintext class as frequent as **2,010/12,846 = 15.6469%**. This admits the usual English E frequency, unlike the previously eliminated one-rune-state codebook. The within-state collision comparison supplies the stronger discriminator.

## Original-length native-language planted controls

The [standalone full-source CommonJS test](../sims/lp2_joint_prev2_allsecret_codebook_sft.cjs) derives controls from three independently pinned registers: **nine solved Cicada clear-GP passages totaling 2,979 runes**, **12,956 GP runes encoded from frozen Shakespeare source text**, and **12,956 runes from an independently GP-encoded Latin Vulgate**. The long controls are split into the exact **55 original physical page sizes**. The English normalization is historical QU→CW, V→U, K/Q→C, Z→S plus the greedy native digraph inventory.

The control cipher really encrypts plaintext under unknown-to-the-scoring **full 29! secret bijections**, independently shuffled for all 841 predecessor states. Each planted ciphertext is decrypted under its correct hidden key to reproduce **every input rune exactly**. Model one uses **20 independent keyed plants** per source. Model two uses **30 unrelated per-page key configurations** for each full-length control. The resulting invariant is evaluated on the encrypted text only, without inspecting plaintext or optimizing keys against LP2.

| Key lifetime / GP-native source | Source rune count | Independent plants | Minimum I₂ | Median I₂ | Maximum I₂ |
| --- | ---: | ---: | ---: | ---: | ---: |
| **Book-static: solved Cicada** | 2,979 | 20 | **1.72080639** | **1.90284575** | **2.25625680** |
| **Book-static: Shakespeare** | 12,956 | 20 | **1.83798170** | **1.85931668** | **1.92688455** |
| **Book-static: Latin Vulgate** | 12,956 | 20 | **2.23433980** | **2.27608391** | **2.33318027** |
| **Per-page: Shakespeare** | 12,956 | 30 | **1.60693941** | **1.93528817** | **2.27422577** |
| **Per-page: Latin Vulgate** | 12,956 | 30 | **2.09675704** | **2.59856631** | **3.17789374** |

All source-native, correctly encrypted controls have *substantially more same-state repeated emissions* than the complete untouched original pages. The narrower book-static result is not rescued merely by giving a different unknown 841-row secret codebook to **every source-visible page**. The original page-keyed normalized collision statistic is below uniform, although its difference from baseline alone is a smaller observation than the large positive-control separation.

## What has and has not been decided

These observations are exact **for all secret keys** within the two declared cipher models; the language comparison is a finite, original-length *empirical discriminator*. It disfavors a simple stationary within-page GP29-to-GP29 output substitution selected by exactly the preceding two published ciphertext symbols for ordinary native-English or Latin text. It does not prove impossibility for contrived low-collision prose, other plaintext encodings, additional secret state, a key changing inside each page or word, altered segmentation, or a non-bijective transformation with separate framing.

The manuscript does not itself select a 841-row cipher, and there is **no authentic unknown LP2 plaintext, source-derived key or destination** from these tests. The next causally useful clue would independently specify state registers, a rekey trigger or a reversible operator. No further all-secret search over the same stable row tables can alter their necessary collision invariant.

**Original-source executable:** [sims/lp2_joint_prev2_allsecret_codebook_sft.cjs](../sims/lp2_joint_prev2_allsecret_codebook_sft.cjs). **Windows Node22 workflow:** [agent15-joint-prev2-original-source-sft.yml](../.github/workflows/agent15-joint-prev2-original-source-sft.yml).