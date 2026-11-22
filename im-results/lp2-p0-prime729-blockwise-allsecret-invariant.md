# P0 729-rune prime partition: arbitrary-secret alphabet and block-local transposition gate

**Status (22 November 2026): conditional original-cipher exclusion, no recovered unknown plaintext or author-selected key.** The observed prime sum supplies a reason to test this exact segmentation. Its interpretation as a cipher clock remains speculative. The experiment rejects a much larger class than the already tested direct additive-key reading, within a declared source-native English control model.

## Clue and frozen original input

The physical p0 heading consists of thirteen red GP29 runes in two words (8+5), and the original first three rune-bearing physical pages contain **262 + 266 + 201 = 729** runes. If the heading plaintext is the signed-2016 source phrase **EPIPHANY SEEKS** (an unverified crib), the additive GP29 ciphertext-minus-phrase residual is:

`[26,24,8,19,27,24,18,3,0,8,0,16,19]`

Converting those thirteen indices to the standard GP prime weights gives a positive composition of 729:

`[103,97,23,71,107,97,67,7,2,23,2,59,71]`

Cumulative boundaries are `[0,103,200,223,294,401,498,565,572,574,597,599,658,729]`. A prior #2117 comment already attempted landing-rune reads at these boundaries and found no recognizable output. This investigation instead tests **every possible secret GP29 substitution and block-internal position permutation**, without selecting either key. If ciphertext is obtained by composing an arbitrary within-block transposition with one independently keyed, static GP29 alphabet bijection per block, each block retains its exact symbol-count multiset. The integer

\[
S=\sum_{\text{blocks }b}\sum_{r=0}^{28} n_{b,r}(n_{b,r}-1)
\]

counts ordered matching-symbol pairs and is unchanged for **all** independent alphabet permutations, including additive and affine maps, and all independent within-block position rearrangements. For a block of size n, this exact proof includes all 29! possible secret alphabet maps and all n! possible secret permutations of positions without enumeration. It does not assume an original plaintext word boundary at the proposed cuts.

## Original data and source controls

The canonical original 729-rune p0–p2 stream has per-block ordered-pair totals:

`[396,316,22,204,392,362,162,0,0,20,0,106,160]`, total **2,140**.

Even allowing all **729 cyclic tape origins** and both the forward and reversed prime-block orders, the minimum and maximum totals over **1,458** segmentations are **1,944** and **2,196**. These alternative segmentations are an intentionally generous conditional relaxation, not a claim of 1,458 historically motivated clocks.

Authentic solved-LP1 English is GP29-transliterated using the committed reference's declared normalization (QU→CW, V→U, K/Q→C, Z→S), with each word encoded independently and source-attested ING→NG and IO→IA rune conventions. These reproduce the full solved p57 original, all 95 runes. A single complete p6 **A KOAN** source paragraph yields twelve genuine 729-rune windows: **minimum 3,752** ordered pairs. A larger combined solved-LP1 reference sample yields **1,757** windows with minimum **3,338**, median **3,584**, maximum **3,848**. The combined sample also admits windows crossing editorial section joins; these are additional calibration and are not treated as independent natural prose. **Zero of 1,757** source windows reach the maximum original-cipher score **2,196**. The twelve full source-paragraph windows independently preserve the same direction.

A 729-rune solved-English positive control is encoded under **thirteen different, privately generated, arbitrary 29-symbol permutations plus independent block-internal position permutations**, with each full block inverted exactly. All 729 original source symbols recover, and the identical pair-count invariant survives encryption. The positive demonstrates that neither unknown alphabet keys nor block-local transposition keys explain away the original-to-source histogram discrepancy.

## Cryptanalytic decision

For the specified 729-rune input and these source-native reference controls, **the entire family of independent, per-block static GP29 alphabet bijections composed with arbitrary within-block rune transpositions is incompatible with the source plaintext distribution**, regardless of all hidden keys or cyclic block alignment. Stronger languages, nonnative encodings, source-dependent segmentation, within-block changing maps, stateful anti-repeat encoders, cross-block transpositions and frequency-changing additional layers remain outside the result. The signed-source phrase used to obtain the block sizes remains unproven and is not established p0 plaintext.

This is a bounded route exclusion rather than a decryption. Any composition of arbitrary block-local anagrams and one fixed secret alphabet substitution per block preserves the invariant and fails this source-native-English gate. It favors a mechanism capable of changing rune frequencies or moving runes across the proposed prime blocks, and it provides no author-selected next operation. Further arithmetic at these exact thirteen boundaries is low-priority without an additional source clue.

**Reproducer:** [single-file Windows Node22/CommonJS source SFT](../sims/lp2_p0_prime729_blockwise_allsecret_gate_sft.cjs). Input datasets: [canonical GP29 corpus](../resources/liber-primus/lp2-corpus.json) and [solved LP1 reference](../resources/liber-primus/lp1-plaintext-reference.txt). The implementation pins original block totals, all-phase range, word-respecting solved controls, exact authentic p56 85/85 ciphertext and p57 95/95 clear-rune spelling positives, and a 13-secret-alphabet plus 13-secret-transposition exact positive inverse.
