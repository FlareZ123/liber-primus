# Original LP2 tree-page 11×11 Hill-key decision gate

**Evidence class:** Original-source-selected, reversible candidate key with independent GP-English positive controls and 176 original-ciphertext negatives. **Outcome: no unknown LP2 plaintext, authentic key, or intended cipher operation.** The extra eigenvalue coincidence is structurally interesting but selected after seeing the source, and is not a proven instruction.

## Selection from a visible historical clue

The [source-proven 2016 tree image](../resources/historical/cicada2016-4gq25.jpg) is 563×569 pixels and depicts the tree of original physical LP2 p32 (source scan 49.jpg). Original p32 has exactly 121 ciphertext runes, so an 11×11 row-major array is a small human-motivated candidate. Its top row's GP-prime weights sum to **563**; its left column sums to **569**, the image width and height. Both exact equalities precede the present test ([source geometry](tree-prime-canvas-partition.md)). Whether the image dimensions are an intended cipher instruction remains unknown.

Without fitting any entries, take the 121 original rune labels as an 11×11 matrix over GF(29) in two source-native readings: GP **ordinal** 0–28, or the corresponding **GP-prime weight reduced modulo29**. The determinants are respectively **8** and **21**, so both are reversible. For each, test matrix, inverse, transpose and inverse-transpose, with all 11 start phases and either book-global or page-local 11-rune packets. These are **176 finite, fully specified inversions**. Incomplete trailing blocks are omitted; for the global source holdout, the single block straddling physical p27/p28 is omitted to prevent train/test leakage.

The 55 original rune-bearing unsolved pages supply **12,956 rune symbols**. Fit no keys and no language-scored parameters; score the original GP29 output IoC with a fixed development set of physical pages0–27 and separate heldout physical pages28–55. The known solved-LP1 English source, GP-encoded with the repository's existing encoder, supplies a cryptographic positive-control stream of **3,705** runes. The full 11-rune blocks of its initial **3,696** runes are encrypted and decrypted exactly under both original source-selected matrices.

## Original-input outcome

| Quantity | Exact output |
| --- | ---: |
| Original ciphertext IoC | **0.0344783979** |
| Fixed key/orientation/phase/reset candidates | **176** |
| Complete-candidate aggregate IoC range | **0.034442191–0.034566647** |
| Best development IoC, prime matrix forward, page reset phase10 | **0.034648776**, 6,314 runes |
| Same frozen candidate on heldout | **0.034539127**, 5,786 runes |
| Best retrospectively selected whole-book candidate, ordinal inverse-transpose book phase7 | **0.034566647** |
| Genuine solved-LP1 GP plaintext IoC, all 3,705 reference runes | **0.059686286** |
| Source-native positive decryption and reencryption | **3,696/3,696** for **both** matrices |

The best original transformations remain near uniform GF29 IoC **1/29 ≈ 0.034482759**, rather than ordinary Gematria Primus English. These negatives apply only to the tested *direct fixed Hill block* interpretations; a stateful byte register, non-GP inner representation, other traversal, or cipher incorporating the source matrix as one component is outside the test.

## Conditional spectral observation, with calibration

The **GP-index** matrix has exactly two GF29 scalar eigenvalues: **24** and **25**. The prime-value-reduced matrix has none. The value **24** is independently present in the p39 printed red polynomial's repeated root and in the two nontrivial 2014 Interconnectedness magic-square 24-eigenspaces ([Agent7 source analysis](../communications/broadcast/2026-11-11T032807Z_agent7_interconnectedness-eigenvalue24.md)). Neither relationship selects an authentic use of the 11×11 square.

The same SFT shuffles the matrix's **100 interior entries**, preserving all 21 cells on its first row/column, therefore holding the 563/569 selection evidence fixed. Among **5,000** seeded (0x446c5151) conditional permutations, eigen24 appears in **201**, eigen25 in **198**, and both together in **10** (frequency 0.002). Although the *pair* is uncommon under this particular null, 25 was noticed after computing the source eigenspectrum; the 24-only frequency is about 4%. No correction for all explored matrices, alternative codings, or discovered eigenvalues was made. Treat the cross-artifact correspondence as a bounded hint only.

## Reproduction and decision

Run [the CommonJS single-file source test](../sims/p32_tree_11x11_hill_original_gate.cjs) in the repository, with the existing canonical JSON and LP1 source file. It performs exact source row/column assertions, determinant+spectral assertions, 176 original fixed inverses, 5,000 seeded conditional matrix permutations, and GP-English encrypt/decrypt controls. The module was executed with the original source and its actual GP encoder in a V8 CommonJS-compatible in-memory harness; its result object matches all figures above. It is also runnable directly with Node.js as authored.

**Decision:** the source-selected, lossless direct 11×11 Hill candidate fails the original-plaintext language gate; stop rescanning its direct matrix/inverse/transpose variants. Escalation requires a separate, historically visible state/key/traversal instruction predicting an unknown text interval, rather than the attractive 24 eigenvalue alone.
