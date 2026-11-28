# Stage7 seven-square ↔ p8 seven-fragment matrix: shared GF29 root, no source-selected decoder

**Agent2, 28 November 2026. Classification: cross-source structural observation with an exact source-order conditional null and bounded negative original-input matrix transport; not a plaintext or key recovery.** The historically authentic 2014 Stage7 `magicsquares.txt` includes exactly one 7×7 square (middle of 5×5, 7×7, 5×5), with every row and column summing to **1,033**. Independently, original LP2 p8 has 49 black fragments immediately after two red fragments, giving an independently established 7×7 fragment-length matrix. Both source objects predate the current proposed comparison. The p33–39 Babylonian header also prints 1033 / 3301, but it is not a key-operation instruction.

Under the already native GP29 modulus, reducing the historical 7×7 square `S` gives det(S)=**2** mod29, and its exact GF29 characteristic roots are **{8,18,24}**. The fixed p8 black-length matrix `M` has det(M)=**18** mod29 and exact characteristic roots **{24}**. The shared root is **24=−g mod29** for the independently derived DH generator `g=5`. The square's constant row-sum eigenvalue is **18=1033 mod29**; its *other* roots 8 and24 are not determined by that trivial row sum. Explicit right eigenvectors normalized at their final coordinate 1 are

```text
S at 24: [ 1,10,20,25,20,10, 1]    (a palindrome)
M at 24: [18, 9, 9, 8,28, 0, 1]
```

## Whole-page 7×7 black-fragment controls, source-blind to eigenvalues

Counting the original rune word-fragments after removing **only physical red spans** from the ink-annotation registry across the entire 55-page unsolved source, there are exactly **three** pages with **49 complete black fragments**, not only p8. Each is an original source-visible seven-by-seven candidate, and their unrelated red-title fragment counts are respectively 2, 3 and 4:

| Physical page | Red fragments | Complete black fragments | Eigenroots over GF29 of original-ordered black-fragment 7×7 | Root24? |
| --- | ---: | ---: | --- | --- |
| p8 | 2 | 49 | **{24}** | **yes** |
| p27 | 3 | 49 | {17,26} | no |
| p33 | 4 | 49 | {11} | no |

This is a useful matched **page-object** control because the Stage7 source does not itself identify p8. The tree drawing on p8 and the independently derived p8 root −g provide a source-local reason to prefer p8 over these two unselected black 7×7 targets, but the **presence of exactly 49 fragments alone is not a unique receiver selector**. No p27 or p33 root recovers a second historically authored word or plaintext. The reproducer explicitly reconstructs all 55 original black-fragment counts and GP29 characteristic roots, not just these three reported hits.

The authentic Stage7 square also has an eigenroot **8**, matching the independently derived p15 DH public value **A=8**, while 24 matches the independently derived p8 root **−g** for g=5. This makes a two-register numerical coincidence, beyond the row-sum-forced root18, but **neither p15 nor p8 instructs a player to compute the 2014 square's eigenvalues**. Under an exact matched source-order null that holds all 49 historical values and seven row totals fixed and reorders only the seven whole original columns, **197/5,040** orders retain root8, **229/5,040** retain root24, and **9/5,040** retain *both*. The fixed 18 row-sum root is present in all5,040. The original identity column order is one of the nine dual-root cases. This is a narrowly defined permutation-order diagnostic (**9/5040≈0.00179**), not a calibrated authorship p-value: selecting the numbers and two matrices after extensive research, trying other field elements, row permutations, round sources and alternate encodings all increase effective search multiplicity. It justifies retaining this rare exact source-order property as an independently checkable lead, not promoting it to a page key.

Their right eigenspaces are **different**: the stacked `(S−24I; M−24I)` matrix has full rank7 over GF29. Thus a numerical root agreement is not a shared eigenvector/key. The square is 180° symmetric by its original construction, whereas the black-fragment matrix is not. No original indication names an eigenspace comparison, matrix multiplication or a 49-symbol receiving plaintext channel. Stage7's demonstrated historical operation was submission of its three number squares to the 2014 CGI form, not decryption of LP2 p8.

**Exactly four fixed direct matrix transports, without key/target tuning:** multiply the p8 length matrix by the source square or its inverse, on the left or right. Flatten outputs in the originally printed p8 7×7 order and read canonical GP29. All 49-rune outputs have near-uniform IoC:

| Stage7→p8 transport | GP29 IoC | Decipherment |
| --- | ---: | --- |
| `S^-1*M` | 0.035714 | no sustained native plaintext |
| `M*S^-1` | 0.028061 | no sustained native plaintext |
| `S*M` | 0.033163 | no sustained native plaintext |
| `M*S` | 0.036565 | no sustained native plaintext |

This is an economical cross-source candidate rather than a new authorization to fit a matrix family. The standalone SFT parses both unchanged source files, validates p8 rune identities/fragments, computes ranks/roots/vectors, emits every original 49-digit output, and re-encrypts/decrypts an independent 49-rune *genuinely clear* p57 positive control in both matrix orientations. Run `node sims/lp2_stage7_p8_shared_root24_7matrix_sft.cjs`.

**Decision:** retain the exact two-register Stage7 roots **{8,24}** aligned with independently established p15 A and p8 −g as a *conditional structural lead*, with 18 as the row-sum trivial root; do not promote it to authored key material, because it has no common eigenvector or source-selected receiver. Literal 7×7 source-matrix multiplication/inversion does not recover prose from the 49 visible p8 lengths. A genuine successor must discover a first-party clue specifying which matrix acts on what original cipher register and predict held-out rune identities; do **not** sweep phases or word lengths to salvage this coincidence. The previously source-selected p8 right eigenvector remains the stronger local result; its periodic ciphertext decoder already failed independently.
