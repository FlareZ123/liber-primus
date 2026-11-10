# Five-bit Boolean Möbius inversion of the 32×8 LP2 table

**Evidence class:** source-clued, bounded original-input negative under one explicit family. No LP2 unknown plaintext, historical cipher, recovered key or continuation has been identified. Reproducer: [\`sims/grid_boolean_mobius_gp28_inverse_sft.cjs\`](../sims/grid_boolean_mobius_gp28_inverse_sft.cjs).

## Why this operation is worth a separate test

Three concrete source details motivate a finite operation:

- Solved LP1 image 05 spells **MOBIUS**, the mathematical name (see [LP1 square study](magic-square-5x5-direct-pad.md)).
- Original LP2 pages 40–55 contain a five-slot tree ornament, while physical pp49–51 contain **32 = 2⁵** rows of eight base-60 tokens. Neither ornament orientation nor a cipher state is independently established (see [source ornament audit](red-256-event-grid-correspondence.md)).
- A Boolean subset lattice on five bits has 32 states, and its Möbius inverse is a standard reversible operation. It differs from the direct Dirichlet μ(n) previously screened over the 27×27 rune layout ([visual audit](original-visual-clue-operation-map.md)).

With row labels 0–31 as five-bit subsets, read each of eight columns as F(S), and invert by G(S)=Σ_{T⊆S}(-1)^{|S\T|}F(T). Five in-place butterfly passes suffice. Run modular subtraction in Z/256 and bytewise XOR in characteristic two, each in subset and superset partial order. These are **four** exactly specified 256-byte arrays. The original LP2 runes are never used to choose those arrays.

## Frozen original-cipher test

For each array, map a byte to GP28 by either \`b mod28\` or \`floor(28b/256)\`, under both arithmetic signs. This gives **16** original full-book inversions, with a continuous 256-byte key clock and no fitted offset, section key or nonce. The output bijection is the existing *transparent-EA predecessor-exclusion GP28* construction: first ciphertext rune is literal IV, 28 distinct nonzero steps encode the ordinary GP indices 0–27, and ciphertext equal to its predecessor encodes a special marker 28. This preserves all **86** original adjacent doublets without dropping data. Every candidate reproduces the exact original ciphertext under its own forward inverse; that algebraic property is no evidence of a correct historical cipher.

## Original results and positive control

| Measure | Observation |
| --- | ---: |
| Raw original GP IoC | **0.03447840** |
| Best of 16 original-source inverses | **0.03532655** |
| Lowest original-source inverse | **0.03525327** |
| Uniform GP29 expectation | **1/29 ≈ 0.03448276** |
| Native Latin Vulgate GP control IoC | **0.07202862** |
| Original cipher doublets preserved | **86/86** |
| Independent Latin GP plant exactly recovered | **2,400/2,400** |

The original top setting is XOR/subset, scaled-byte-to-28, sign+1. Its first 70 decoded rune transliterations begin \`SAMNGLSOENYWXLAFSPIAIALOENDXIOETNGAHOCWELAEYFJNGXBXNGPAYSDPPEECPDIASFTHCCIEIJILOUS\`, with no recognizable message. The native-Latin positive selects the source-conventional modular-subset / byte-mod28 / sign+ model before planting, uses \`resources/control/latin-vulgate-heldout-gp.json\`, then correctly reencrypts and recovers all 2,400 original language runes.

The four transformed **source-byte arrays** alone have 83–101 ASCII-printable bytes out of 256 and no recognizable beginning or file header. The full original GP inverses remain near-uniform, far below authentic language controls. The result rejects these **specific repeating GP28 key readings of the Boolean Möbius transform** as native-language decryptions. It does not exclude an evolving 32-state register, unrelated binary/byte intermediate, or source-specified different clock.

## Source-specific five-bit row-state continuation

The same original five-slot stencil has a previously reconstructed candidate **32-state de Bruijn order**; its specific black-dot anchor places state 0 at fragment position eight. These are source-visible hypotheses about row labels, not proven cryptographic instructions. To check the combined Möbius plus stencil path without fitting a plaintext, freeze three row-mask assignments (**printed** 0–31, **de Bruijn**, **black-zero-anchored de Bruijn**), the four transforms above, and three full-key clocks. In the natural mask-flat clock, read the 32 transformed masks in numeric order; in source-row-major or source-column-major, serialize all 256 transformed bytes in the physical order prescribed by the candidate row-label sequence. Under both fixed byte maps and signs, this is **3×4×3×2×2 = 144 source-key settings**, all individually checked against the entire original 12,956-runic ciphertext with exact re-encryption.

The strongest original setting is black-zero anchored, XOR/subset Möbius, source-column-major serialisation, scaled-byte-to-28, sign+1. Its **full-book IoC is 0.03533404** (lowest of the 144 models is **0.03523914**), again close to chance and far below native Latin-GP reference **0.07202862**. None yields recognizable language. It changes the finite rejection scope to include this particular combination of the source five-bit row orders with Boolean Möbius inverses. There is no source evidence authorizing other clocks, arbitrary additional state or separately fitted section keys.

## Cryptanalytic decision

The source chain **MOBIUS → five binary slots → 32 rows → Boolean inverse** is human-plausible but incomplete: no original source currently instructs how its transformed rows should act on the ciphertext. The 16 direct grid-order and 144 original-stencil-order repeating-key interpretations fail. A successor needs an independent clue selecting an actual register/key/clock and must predict original unknown plaintext beyond the existing 16 tests, with lossless recovery of all 12,956 runes.

The authoritative [results synthesis](../results/README.md) continues to report no recovered unknown LP2 plaintext. This report belongs in intermediate findings rather than established results.
