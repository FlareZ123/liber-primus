# A complete 729-rune Peano traversal with the authenticated p56 prime/totient inverse

**Status:** A new, original-cipher, single-operation negative. No unknown plaintext or key recovered.

## Motivation, input and finite readout

The original LP2 opening on physical pp0–2 has exactly **729 GP29 runes**, which can be arranged on a **27×27** lattice. This size also accommodates the canonical third-order **Peano space-filling curve**, whose fixed 3×3 substitution produces one continuous non-self-crossing walk through every lattice cell. Unlike the separately tested Sierpiński carpet hole test, Peano has a complete 729-symbol inverse without information loss or unassigned cells.

This test takes the standard Peano 1890 3×3 L-system `X→XFYFX+F+YFXFY-F-XFYFX; Y→YFXFY-F-XFYFX+F+YFXFY`, turtles at 90° for three iterations, and reads the original p0–2 runes at the resulting 729 locations. All eight distinct rotations/reflections and traversal reversals are charged; after duplicate removal there are **8** unique traversals. The only next operation is the **authentic p56** prime-totient formula `plaintext = (cipher−φ(prime_i)) mod29`, beginning with prime2 and using either all runes or the solved-page-style literal-F bypass (where a ciphertext F remains F and skips the key index). This gives **16** finite variants, no trained key.

The exact solved p56 85-rune input decrypts to the independently recorded plaintext under its authentic single literal-F exception at original position56. The Peano construction itself visits all 729 lattice positions once. These are important positive controls.

## Output and null

A GP29 bigram model is trained on the committed LP1 *solved Latin translations only* (`lp1-plaintext-reference.txt`, excluding pp56–57), normalized to GP orthography; source lines yield **2,397** GP runes. The held-out authentic p56 output scores **−2.699923** mean log-likelihood per transition.

The best of the **16** opening Peano/totient variants scores **−3.9162004979**, giving nonsensical transliteration beginning `GMOIHEEAOEIAXFNFPPWUOEHBIAROJGWFJIOELEAFDTHMWNXFEOCIADFUMY`. The same complete 16-way selection is evaluated on all **729** cyclic shifts of the original 729-rune source. **109/729** shifts score at least as highly as the true alignment, a cyclic-rotation rank fraction **0.14952**. This rotation test is a deterministic control for source-grid alignment, not a universal null probability or proof against every conceivable encrypted Peano system.

## Decision

The standard 729-point Peano traversal **does not recover readable plaintext** with the independently solved p56 prime/totient inverse and its two natural F treatments. Neither the plain p0 original rune distribution nor a Peano rearrangement alone can restore natural English symbol frequencies by pure transposition.

This excludes a concrete, fully reversible readout family; it does **not** exclude a separately supplied key, different transform, or source-selected multi-step spatial mechanism. Peano is a math-motivated interpretation of the visible 27² geometry, not an operation named in a Cicada-authenticated clue. Do not extend it by arbitrary rotations, key offsets, or flexible curves absent a new source instruction.

Reproduce: `node sims/lp2_p0_27square_peano_p56_phi_sft.cjs`. Original input files: `resources/liber-primus/lp2-corpus.json` and `resources/liber-primus/lp1-plaintext-reference.txt`. The solved p56 positive-control method is independently codified by `sims/authentic_lp2_p56_totient_regression.cjs`. Peano L-system reference: https://paulbourke.org/fractals/lsys/ .
