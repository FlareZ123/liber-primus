# LP2 numerical-grid columns under a reversible 28-symbol predecessor-exclusion cipher

**Evidence class (Agent 12, 2026-11-10):** executed source-original, finite grid-key inversion negative, with blind planted source-key recovery. No unknown LP2 plaintext, original key, or intended destination recovered.

## Cipher architecture actually tested

The original LP2 manuscript has **12,956** unsolved GP runes grouped here into eight nonempty `$`-delimited records of the canonical `resources/lp2-transcription.txt`. These contain **[729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]** runes. The nine-rune page-15 bridge appears at the **end of the third record** under this transcription, rather than as an independent record in the more detailed master. The original page/word boundaries remain intact in the rune string.

At each ciphertext rune, the visible alphabet contains 29 symbols, but the original ciphertext almost never repeats its preceding symbol. A **reversible exclusion rank** can therefore map each of 28 admissible next symbols to a residue 0–27, with the previous published symbol excluded:

- **Sorted rank**: `R=C-[C>previous]`, when `C!=previous`; its inverse inserts the missing rank slot at `previous`.
- **Cyclic rank**: `R=(C-previous-1) mod29`, when `C!=previous`; its inverse is `C=(previous+R+1) mod29`.

The initial unobserved predecessor is left **unscored**. The original **86** exact adjacent-doublet outputs are also left as **erasures**: they cannot be decoded as ordinary 28-rank symbols. No plaintext symbol is invented at those locations, and all original output symbols remain available as state for their successors.

The independently sourced LP2 32×8 numerical grid yields **eight 32-byte vertical byte columns** (canonical SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`). Each column is a possible independent cipher stream key for one full original text group. Test **two** key primitives (AES-256-CTR and ChaCha20, each 16-byte zero IV), **forward/reversed** column bytes, **byte%28** or `floor(byte×28/256)` output, both **signs** of modulo28 additive encryption and the **two** rank schemes. This gives exactly **32** mode settings; each has all **8! = 40,320** one-to-one section/key assignments optimized by exact 8-bit subset dynamic programming, **1,290,240 settings and assignments** total.

This is a source-constrained **specific candidate cipher**, not an established historical mechanism. The plaintext scoring reference is the first 180,000 characters of stored Shakespeare translated to GP indices, with rare GP index28 folded to residue0 and additive-half smoothing. Exact GP linguistic spelling is only assumed inside this tested model.

## Blind planted key recovery

Construct a synthetic source from the independent last 120,000 characters of Shakespeare (excluded from unigram training), GP-encoded and projected modulo28, retaining **exactly** the original eight section lengths. Encrypt under the **actual original source-table columns** in hidden order `[5,2,6,1,7,0,4,3]`, using cyclic predecessor-exclusion, AES-256-CTR, forward byte orientation, byte%28 and positive encryption sign. Make 85 independently seeded candidate adjacent-repeat overwrites at the source's 0.7% doublet rate, leaving those positions erasures but keeping them as predecessor state.

The **same blind scanner** recovers the **exact** rank scheme, primitive, key orientation, byte reducer, additive sign and **all eight exact table-column assignments as its top training candidate**. The exact inverse recovers **12,870 of 12,870 decodable source GP residues**, with only 85 planted rewrites and the first symbol unknown. Plant scores: **−20,911.39743** training log likelihood, **−17,074.06858** heldout. This control establishes end-to-end power for a correct member of this finite family, and that the decoder accurately inverts the predecessor-exclusion map.

## Actual full original LP2 negative

The scanner chooses settings and all eight keys using only the **first 55% of the 8 groups' rune positions**. The final 45% in every group is a frozen original-ciphertext holdout, and no key or cipher setting is refitted on those positions.

The best **original** training candidate is **sorted predecessor-exclusion, AES-256-CTR, reversed grid bytes, raw byte%28, positive key sign**, key-to-group order `[3,1,6,2,4,7,5,0]`. Its training score is **−29,129.29876** and heldout **−24,446.29212**. All reported candidate plaintext residues are nonlinguistic; the heldout score is **more than 7,372 natural-log units below** the true-key planted control (whose actual GP source scores −17,074.06858 on the corresponding layout and split). This difference is a reference-register diagnostic rather than a generic p-value.

To assess whether the grid order specifically supplies a useful key, shuffle the **32 byte positions inside each original column**, preserving the per-column byte inventory, then independently repeat the complete **32-setting + 8! optimized assignment** family selection. Among **12** full matched shuffled-grid searches, **3** train winners score at least as high as the genuine-grid training winner and **1** has heldout score at least as high as the genuine-grid selected winner. Add-one finite null tails are **4/13 ≈ 0.30769** (train) and **2/13 ≈ 0.15385** (heldout). The literal column order is therefore **not meaningfully preferred** in this small matched trial.

**Conclusion:** the direct original-grid AES/ChaCha **28-rank additive encryption** under the 32 natural modes and every exact eight-column assignment produces no recoverable original LP2 English-GP plaintext or independent key evidence. It also fails to account for the 86 original equal-adjacent glyphs except as externally unspecified erasures. The test does not exclude hidden key skips, alternative IV/key derivation, different source language, an arbitrary outer alphabet, or another 28-symbol generative map. An exact source-key plant is perfectly reversible; the real original result is unpromising.

## Reproduce

- [Self-contained Node.js 22 experiment](../sims/grid_rank28_cryptanalysis.cjs), uses only original transcription, source 256-byte table, independent Shakespeare GP data, built-in `crypto`.
- [Successful source-original GitHub Actions run 42787315087](https://github.com/FlareZ123/liber-primus/actions/runs/42787315087), via the existing `lag5-contiguous-echo-manual.yml` runner's `grid-rank28` dispatch choice. It prints the exact synthetic recovered settings, all five best original modes and all twelve shuffled-grid results.
- Source sections are the **literal eight nonempty `$` records of `resources/lp2-transcription.txt`**, so the page-15 bridge is attached backward. Different source grouping or a red-title-body reset may be informative only if justified by a separate clue.
