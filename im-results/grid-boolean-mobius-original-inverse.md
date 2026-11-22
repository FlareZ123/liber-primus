# Boolean Möbius inversions of the LP2 table: 5-bit and full 8-bit readings

**Evidence class:** source-clued, bounded original-input negatives for direct 5-bit and full 8-bit Boolean Möbius repeating-key readings. No LP2 unknown plaintext, historical cipher, recovered key or continuation has been identified. Reproducers: [5-bit source-stencil study](../sims/grid_boolean_mobius_gp28_inverse_sft.cjs) and [full 8-bit table study](../sims/grid_boolean_mobius_8bit_inverse.cjs).

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

## Full 8-bit Boolean-lattice extension

The 256-byte table can also be treated as a single (2^8)-element vector, applying the named Boolean Möbius operation across all eight index bits in printed row-major order. This is less directly supported than the five-bit reading—the ornament explicitly has five slots—but the literal **MOBIUS** clue and exact 256 = (2^8) table size motivate one finite extension. No bit permutation, table reordering, or fitted state is searched.

The full 8-bit inverse produces four fixed 256-byte arrays: subset/superset partial order × subtraction modulo 256 or XOR in characteristic two. None is a permutation/S-box: their distinct-byte counts are **163, 165, 175 and 174**, with maximum byte multiplicities **6, 5, 4 and 4**, respectively. Each is tested as a repeating key under **64** original-input variants: GP29 additive or GP28 predecessor-exclusion; byte projection by remainder or proportional scaling; both signs; and book-global or 13-dot-fragment-reset key clocks. In GP28 mode the previous-ciphertext state resets at each source fragment. The first 28 source fragments cover all 12,956 unknown runes.

| Full 8-bit result | Observation |
| --- | ---: |
| Tested original-input variants | **64** |
| Direct-GP29 IoC range | **0.03445825–0.03453450** |
| GP28 raw IoC range | **0.03524310–0.03530704** |
| Exact original re-encryption | **64/64** |
| Mechanics-only planted recovery | **64/64** |

The best direct-GP29 output is superset/mod-256, remainder projection, positive sign, book clock (IoC **0.03453450**); its first 120 transliterations begin `CFEABDGAEPCCTBMBTHNGYPIAOSCOYIAWCDLBOUTHHNGDHWRBNIAPEOOGCORGNTNEOJIANIATHJJUIAYHOHWSOEOEOGOEWWNGOEAHOHHSLEAPTCLWGPPWRTEAOEPEJCUIAEAGJXEPLTDSPEONGDNG`. The best raw-GP28 output is subset/mod-256, remainder projection, negative sign, book clock (IoC **0.03530704**); its prefix begins `SNGCHEOEOTSMIAHHBTHSHAFFTEOMDADEODTHEDMEIJPJYGEOYFEOJIPIDTHSLWEODOTHMUUDCUJJXNCJOGCAEXAEALUAIXGAENGWMAEIAMOEYUIANTHNOEWPMLETISEOPEWPPGEOROESHJIAHIANG`. Neither is readable prose. GP28 raw IoC includes a distinguished transparent marker and is not an ordinary uniform-GP28 language statistic.

This full-8-bit test is a distinct, bounded extension of the five-bit work, not evidence that the source intended the flattened 256-cell lattice. Its four arrays and all 64 ciphertext inverses remain nonlinguistic; exact re-encryption and the positive plants validate only the implementation.

## Cryptanalytic decision

The source chain **MOBIUS → five binary slots → 32 rows → Boolean inverse** is human-plausible but incomplete: no original source currently instructs how its transformed rows should act on the ciphertext. The 16 direct grid-order and 144 original-stencil-order five-bit repeating-key interpretations fail; the distinct full-8-bit flattened-table extension also fails across 64 fixed GP29/GP28 variants. These are bounded negatives for direct repeating-key uses of the tested Boolean Möbius arrays, not for every possible role of Möbius inversion. A successor needs an independent clue selecting an actual register/key/clock or state transition and must predict original unknown plaintext, with lossless recovery of all 12,956 runes.

The authoritative [results synthesis](../results/README.md) continues to report no recovered unknown LP2 plaintext. These five-bit and full-8-bit results belong in intermediate findings rather than established results.
