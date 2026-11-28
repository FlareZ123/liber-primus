# Stage7 seven-square ↔ p8 seven-fragment matrix: shared GF29 root, no source-selected decoder

**Agent2, 28 November 2026. Classification: new cross-source structural observation and bounded negative original-input matrix transport; not a plaintext or key recovery.** The historically authentic 2014 Stage7 `magicsquares.txt` includes exactly one 7×7 square (middle of 5×5, 7×7, 5×5), with every row and column summing to **1,033**. Independently, original LP2 p8 has 49 black fragments immediately after two red fragments, giving an independently established 7×7 fragment-length matrix. Both source objects predate the current proposed comparison. The p33–39 Babylonian header also prints 1033 / 3301, but it is not a key-operation instruction.

Under the already native GP29 modulus, reducing the historical 7×7 square `S` gives det(S)=**2** mod29, and its exact GF29 characteristic roots are **{8,18,24}**. The fixed p8 black-length matrix `M` has det(M)=**18** mod29 and exact characteristic roots **{24}**. The shared root is **24=−g mod29** for the independently derived DH generator `g=5`. The square's constant row-sum eigenvalue is **18=1033 mod29**; its *other* roots 8 and24 are not determined by that trivial row sum. Explicit right eigenvectors normalized at their final coordinate 1 are

```text
S at 24: [ 1,10,20,25,20,10, 1]    (a palindrome)
M at 24: [18, 9, 9, 8,28, 0, 1]
```

Their right eigenspaces are **different**: the stacked `(S−24I; M−24I)` matrix has full rank7 over GF29. Thus a numerical root agreement is not a shared eigenvector/key. The square is 180° symmetric by its original construction, whereas the black-fragment matrix is not. No original indication names an eigenspace comparison, matrix multiplication or a 49-symbol receiving plaintext channel. Stage7's demonstrated historical operation was submission of its three number squares to the 2014 CGI form, not decryption of LP2 p8.

**Exactly four fixed direct matrix transports, without key/target tuning:** multiply the p8 length matrix by the source square or its inverse, on the left or right. Flatten outputs in the originally printed p8 7×7 order and read canonical GP29. All 49-rune outputs have near-uniform IoC:

| Stage7→p8 transport | GP29 IoC | Decipherment |
| --- | ---: | --- |
| `S^-1*M` | 0.035714 | no sustained native plaintext |
| `M*S^-1` | 0.028061 | no sustained native plaintext |
| `S*M` | 0.033163 | no sustained native plaintext |
| `M*S` | 0.036565 | no sustained native plaintext |

This is an economical cross-source candidate rather than a new authorization to fit a matrix family. The standalone SFT parses both unchanged source files, validates p8 rune identities/fragments, computes ranks/roots/vectors, emits every original 49-digit output, and re-encrypts/decrypts an independent 49-rune *genuinely clear* p57 positive control in both matrix orientations. Run `node sims/lp2_stage7_p8_shared_root24_7matrix_sft.cjs`.

**Decision:** retain the 24 shared root as a *conditional structural lead*, with 8 and18 as comparison roots; do not promote it to authored key material, because it has no common eigenvector or source-selected receiver. Literal 7×7 source-matrix multiplication/inversion does not recover prose from the 49 visible p8 lengths. A genuine successor must discover a first-party clue specifying which matrix acts on what original cipher register and predict held-out rune identities; do **not** sweep phases or word lengths to salvage this coincidence. The previously source-selected p8 right eigenvector remains the stronger local result; its periodic ciphertext decoder already failed independently.
