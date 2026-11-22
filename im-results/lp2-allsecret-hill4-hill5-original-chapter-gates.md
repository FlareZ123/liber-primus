
# Secret-key-independent Hill-4 and Hill-5 tests on original LP2

**22 November 2026, Agent44. Classification:** reproducible conditional cryptanalytic exclusions. **No original unknown plaintext/key recovered.**

## Original source cue and fixed model

Original LP2 p15 (32.jpg) has the independently authenticated 4 × 4 Fibonacci-prime matrix:

    3258 3222 3152 3038
    3278 3299 3298 2838
    3288 3294 3296 2472
    4516 1206  708 1820

Its determinant is 17 modulo 29, so it is an invertible Hill-4 key candidate. Previous direct transfers of this matrix failed; the new test considers **every possible unknown invertible 4×4 matrix** rather than attempting to guess a key.

For ordinary Hill encryption, C_block = H P_block mod29. Each unknown plaintext coordinate must equal one of the nonzero linear functions v·C mod29, where v is some inverse-matrix row. Multiplying a nonzero vector v by a nonzero scalar merely relabels the 29 GP rune symbols, preserving the unigram collision rate. The projective search therefore needs only (29^4 − 1)/28 = **25,260** candidate vectors, exhaustive over every possible inverse row of every unknown invertible Hill-4 key. English-in-GP distributions are substantially more uneven than a uniform 29-symbol source; a valid inverse row should carry that frequency skew into an untouched block suffix.

Authentic corpus: resources/liber-primus/lp2-corpus.json. Test intact original runes with no changes to printed source data, but ignore word/page punctuation for this specific fixed-block model. For each original corridor, test all starting offsets 0,1,2,3; select the eight most concentrated projections from the fixed original training prefix; evaluate those exact vectors on an untouched suffix. A positive control uses independent Shakespeare text mapped to native 29-symbol Gematria Primus, encrypted with the genuine invertible original p15 4×4 matrix and evaluated by the same scanner. That control explicitly demonstrates recovery of **all four** true English-bearing inverse directions without knowing the key during the search.

## Exhaustive source results

| Original rune corridor | Original runes | Starting offsets | Training / held blocks | Highest train collision IoC over all key rows and phases | Held-out IoC of that winning direction |
|---|---:|---:|---:|---:|---:|
| p16–p21 unillustrated | 1,613 | 0,1,2,3 | 280 / 122–123 | **0.040169** | **0.036519** |
| p40–p48 pretable floral | 2,408 | 0,1,2,3 | 400 / 201–202 | **0.038571** | **0.036451** |

Eight exhaustive phase decisions = **202,080 projective directions**. The null GP29 collision rate is 1/29 = 0.034483. All four best-trained directions from every phase retain near-uniform collision on held-out original ciphertext.

On the exact-matched native Shakespeare-GP plants encrypted with the source p15 matrix, all four true inverse rows are among the strongest four training directions:

- Synthetic p16–p21: four directions train **0.058141–0.069329**, hold **0.061309–0.071438**.
- Synthetic p40–p48: four directions train **0.061228–0.065965**, hold **0.055859–0.068716**.

Every plant is built from original-style GP29 symbols with the same number of complete four-blocks as its matched original corridor; no model parameter is selected on original plaintext. The first phase-zero original winner on p16–p21 is vector [1,1,21,7], raw training collision-pair count 3,138. The p40–p48 winner is [1,4,26,5], count 6,156. These counts are fixed input regression assertions.

**Executable reproducer:** [p15 all-secret Hill-4 two-chapter SFT](../sims/lp2_p15_allsecret_hill4_twochapters_sft.cjs). Read-only Windows 11 Node22 CommonJS. All eight phase searches and both source-native plants were actually executed against repository source, with the above values independently confirmed. The p15 source-matrix construction is independently asserted in [fibonacci_prime_spiral.cjs](../sims/fibonacci_prime_spiral.cjs).

## Five-rune variant, separate source object

The solved LP1 5×5 numeric square motivates a distinct fixed 5-symbol Hill cipher. A direct 5D linear projection similarly covers every possible unknown inverse row through (29^5−1)/28 = **732,541** projective vectors. On the p40–p53 intact runic stream (3,008 GP runes; 601 five-blocks), **400 train / 201 held**, the strongest original projection [1,13,27,26,4] scored **0.039023 train / 0.033333 held**. An independent full-rank 5×5 Hill-encrypted Shakespeare-GP plant, subjected to the identical complete scanner, recovered five strong plaintext-bearing inverse directions. Its best scored **0.068972 train / 0.071990 held**, and all five genuine directions scored above **0.05872** in training.

The larger p40–p53 route crosses the printed numerical-table interruption; a separately executed full **732,541**-direction source-local p40–p48 test (2,408 runes, 481 five-blocks, 300 train / 181 held) yielded **0.040870 train / 0.033763 held** for its best direction. These Hill-5 tests used only block origin zero, so no claim about alternate five-rune starting phases is made. [Hill-5 original and planted SFT](../sims/lp2_flower_allsecret_hill5_projection_sft.cjs).

## Exact scope of the exclusion

This finite linear-projection test excludes an ordinary *one-static-invertible-matrix* Hill-4 native-English cipher within each of the two tested corridors, regardless of secret key or four-rune starting offset, under the stated source-matched English collision criterion. It also strongly disfavors the specified origin-zero Hill-5 models on the floral corridor. It does not exclude any of the following independent mechanisms: dynamically changing matrices, encrypted ciphertext rewriting, nonuniform block/word movement, page resets inside the chosen corridor, compression, or deliberately balanced/non-English plaintext. A cryptographic roundtrip alone does not prove the historical cipher; these plants independently confirm that the method recognizes a real source-native inverse.

**Research decision:** stop fitting arbitrary static Hill-4 or source-square matrices to p16–p21 and p40–p48. Future work should specify a new operation and its state/key provenance from genuine original clues, or seek actual original plaintext bytes, rather than multiply key/phase variants of the excluded architecture. Preserve the current report as an intermediate gate, not as a solved-page claim.
