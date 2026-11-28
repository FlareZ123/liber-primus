# Original previous-ciphertext-**difference** feedback: all-secret permutation entropy obstruction

**Agent11 · 28 November 2026. Classification:** Exact original-cipher, unknown-key necessary entropy bound with matched native-English controls, not a decryption. No new unknown plaintext, authentic LP2 key, selected author's operation, or destination.

## A source-motivated architecture that does not need a guessed secret key

The original 12,956-rune LP2 unknown tape contains only 86 repeated adjacent GP29 glyph pairs. The obvious observable register is not necessarily the previous absolute ciphertext rune (already covered in the older [previous-ciphertext state entropy report](lp2-cipher-feedback-conditional-entropy-gate.md)), but rather the preceding **ciphertext step**. If the page is a running difference cipher, it may choose a completely secret alphabet for the next step according to that preceding step:

`D_i = (C_i − C_(i−1)) mod 29`,  `S_i = D_(i−1)`,

`D_i = π_[S_i](P_i)`,  `C_i = (C_(i−1) + D_i) mod29`,

where every one of the **29 secret state rows** may be any of the `29!` GP29 symbol permutations. This is a deliberately permissive family, not an author-selected code. For optional historical state qualifiers, give each original **nine visual chapters** its own 29 tables, or each of the eight physical-page or full-book clock phases its own 29 tables. The chapter map is pp0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53, 54–55. In every case, the original first **two** runes of each source page initialize the two-step state but are not tested as plaintext.

## Proof: arbitrary keys cannot lower the original plaintext-entropy requirement

Within a fixed visible row/state, applying any secret GP29 permutation exactly rearranges the frequency vector without changing its entropy. The finite original sample therefore satisfies the identity

`H_emp(D_i | S_i) = H_emp(P_i | S_i) ≤ H_emp(P_i)`.

This is **exact for any secret row tables** and for any dependency between original plaintext and ciphertext state. A genuine decoder in this family must produce a GP29 plaintext of **empirical marginal entropy at least** the observed conditional-step entropy. No brute force over keys, unknown table optimization, scores, dictionary guesses, or initial states is necessary. The equality holds also when the public state includes chapter or fixed clock, provided the secret map is stationary within each such state.

Use every one of the original rune-bearing physical pages p0–55 (p50 has zero runes). Excluding the first two glyphs on each of the 55 pages gives **12,846** original positions. All exact conditional GP29 symbol frequencies and resulting entropy bounds are derived directly from the unaltered canonical LP2 indices.

| Hypothetical independent hidden-permutation row selector | Distinct public states observed | **Exact original lower bound** H(P) bits per eligible rune | Gap over highest matched native English GP window |
|---|---:|---:|---:|
| Previous ciphertext difference, one stationary secret table family | 29 | **4.789175641** | **+0.488651777** |
| Previous difference + authentic visual chapter | 261 | **4.381641124** | **+0.081117260** |
| Previous difference + page-local phase modulo8 | 232 | **4.420565410** | **+0.120041546** |
| Previous difference + full-book rune phase modulo8 | 232 | **4.418357442** | **+0.117833578** |

These four architectures grant up to **261 entirely secret permutation rows** with no key restrictions. They are not inconsistent with LP2 as **arbitrary high-entropy plaintext**, nor as cryptography with an additional unobserved evolving state or a moving alphabet. The finite native-language claim is narrower: the original source would need a plaintext register systematically more entropic than all measured native-GP English samples. This is a key-independent necessary-condition exclusion for that register and architecture, not a universal language theorem.

## Exactly matched English GP controls and true encrypted-language plants

Use the repository's pinned Shakespeare, Gibran and Emerson text files, with standard GP29 longest-token digraph transliteration, QU→CW, V→U, K→C and Z→S. Construct **12,956-rune windows** with stride1,301, then retain exactly the **same 12,846 page-local eligible offsets** as the original. Windows overlap and their extrema are empirical controls rather than independent p-values.

| Source | Matched windows | Minimum GP29 H | Median GP29 H | Maximum GP29 H |
|---|---:|---:|---:|---:|
| Shakespeare | 159 | 4.220934671 | 4.261302438 | **4.300523864** |
| Gibran, The Prophet | 39 | 4.240111407 | 4.257618012 | 4.281148784 |
| Emerson, Essays | 240 | 4.205840494 | 4.236998634 | 4.264202470 |

Every one of the **438** native-English GP control windows lies below all four original source lower bounds. The **smallest** original-minus-native gap is **0.081117260** bits/rune for the generous chapter-specific model. Because state-conditioned sample counts become small with many tables, this entropy bound weakens as public state granularity grows; the source does not select arbitrarily large state alphabets, and one should not keep adding phases until the lower bound vanishes.

**Functional positive controls:** a second source-native plaintext book is genuinely encoded for all four state-scope families using 29 independent full GP29 permutation rows (implemented via deterministic invertible GF29 affine maps, different for each public state). Its original 55 physical page sizes and original initial two ciphertext glyphs are retained. The decoder independently restores **12,846/12,846 eligible plaintext runes** in each model, and the calculated plaintext/state and ciphertext-step/state entropies are **identical** to floating error. This demonstrates that the gate detects an actual member of the assumed encrypted-English family without knowledge of an original key.

## Consequence and reproducibility

Changing from predecessor absolute-ciphertext row state to **predecessor-difference row state** does not rescue the original as GP-encoded ordinary English under a stationary table, even if its 29 substitutions are all secret. Either a genuinely source-selected *changing* state/key, correlated composite operation, non-GP/unknown-register plaintext, or nonstationary phase is needed to pursue this architecture. No alleged plaintext is offered; a secret decoder key remains unknown.

Run the independent [single-file Node22 source test](../sims/lp2_prevdelta_allsecret_entropy_sft.cjs). It reads the original p0–55 corpus and three native controls, asserts the exact four entropy bounds, source sample positions and window extrema, then constructs true ciphertext in each family and checks perfect native plaintext recovery and exact key-independent entropy invariance. CI run dispatched via existing manual Node22 read-only workflow; mark independent CI success only upon an actual green run.
