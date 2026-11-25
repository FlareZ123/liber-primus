# Boolean Möbius inversions of the LP2 table: 5-bit and full 8-bit readings

**Evidence class:** source-clued, bounded original-input negatives for direct 5-bit and full 8-bit Boolean Möbius repeating-key readings, plus an exact degree/identifiability obstruction for terminal known-plaintext XOR interpolation. No LP2 unknown plaintext, historical cipher, recovered key or continuation has been identified. Reproducers: [5-bit source-stencil study](../sims/grid_boolean_mobius_gp28_inverse_sft.cjs) and [full 8-bit table study](../sims/grid_boolean_mobius_8bit_inverse.cjs).

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

## Known-terminal XOR mask recovery: exact Boolean degree and ambiguity (Agent8, 25 November 2026)

A different receiver is motivated by the original 32×8 geometry, the solved LP1 MOBIUS cell, authentic historical XOR, and p57's instruction to shed circumferences. The physical p50 table's inner 30×6 rectangle has 180 cells, matching the genuinely known p56 (85) plus p57 (95) plaintext runes; the outer 76 cells match p55's 76 printed runes, including its incoming carry. The arithmetic correspondence does not authenticate the receiver. Unlike the earlier whole-table Möbius transform used as a repeating pad, this model attempts to **learn the mask from known plaintext and predict the entire withheld p55 perimeter**.

Freeze the printed cell address x=8r+c as the eight Boolean input bits, interior reading in physical row-major order, and the reversible byte model B(x)=E(P(x)) XOR K(x), where E is either the GP0 index or authentic GP prime weight. K is an arbitrary eight-bit-output Boolean polynomial of total algebraic degree at most d (all coefficients secret, different per bit). Check both conventional base60 and f-omitted base59 source tokens. Neither the p55 ciphertext nor a language score participates in the fit.

The [exact original-source CJS SFT](../sims/lp2_terminal256_boolean_known180_xor_sft.cjs) rederives all 85 known p56 runes with the authentic prime-minus-one/F-hold decoder and asserts the independent wording, then includes clear p57. Gaussian elimination over GF(2) simultaneously fits all eight mask bit planes to the 180 known XOR residuals. The column rank is source-geometry only:

| Maximum degree | Monomials | Interior rank | Consistent original fits (of 4) | Individually forced perimeter bytes if consistent |
|---:|---:|---:|---:|---:|
| 0 | 1 | 1 | 0 | 76 |
| 1 | 9 | 9 | 0 | 76 |
| 2 | 37 | 36 | 0 | 12 |
| 3 | 93 | 86 | 0 | 12 |
| 4 | 163 | 140 | 0 | 0 |
| 5 | 219 | 172 | 0 | 0 |
| 6 | 247 | 180 | 4 | 0 |
| 7 | 255 | 180 | 4 | 0 |
| 8 | 256 | 180 | 4 | 0 |

The rank is already 180 at degree six, so **every arbitrary 180-byte observation has a degree-six extension**; fitting the authentic known tail is no evidence at that degree. More fundamentally the column-boundary indicator is a degree-two Boolean polynomial, (1 XOR c0 XOR c1)(1 XOR c1 XOR c2), and the row-boundary indicator is degree four, the product of four analogous equality terms on five row bits. Both vanish at every interior address and their union covers every perimeter address. XORing either with any chosen output-byte constant changes a selected perimeter mask byte without affecting the 180 known observations. At degree at least four, no individual perimeter byte is fixed by those observations. This alone does not rule out joint constraints or joint native-GP support.

### Full-output alphabet obstruction and exact completion count

The full original grid itself supplies a stronger test. Both native encodings have fixed zero high bits (GP0 indices <=28: mask 0xE0; GP prime weights <=109: mask 0x80). Therefore these corresponding bit planes of K must equal those of B at **all 256 positions**, irrespective of the unknown plaintext. The Boolean Möbius transform (algebraic normal form) has degree-eight coefficient equal to the XOR of the entire byte table. In base60 it is 0x94; in base59 it is 0x21. Any nonzero fixed-zero high bit in that coefficient forces degree eight, **independent of cell permutation or the ordering of the 180 known runes**. In base59 prime-weight mode, the top bit instead has degree exactly seven in printed coordinates, ruling out degree six.

| Source radix and native encoding | Minimum degree allowing a full valid GP completion | Remaining constraint on 76 unknown runes |
|---|---:|---|
| 60, GP0 | 8 | None: all 29^76 sequences |
| 60, GP primes | 8 | None: all 29^76 sequences |
| 59, GP0 | 8 | None: all 29^76 sequences |
| 59, GP primes | 7 | XOR of 76 prime weights = 105 (0x69) |

In the final row, degree at most seven is exactly one byte-wide condition: the XOR of all 256 residual bytes must be zero. The known 180 prime weights and original table determine the remaining XOR target 105. An exact 256-state BigInt count over 76 positions gives **10792742526028882416703940357513601823103559556676941845862064042807407889996079497658561171692523613614133964** GP29 completions (about 1.0793e109, or 0.7778% of the unconstrained 29^76). These counts are for arbitrary native-symbol sequences before imposing word or language restrictions; they do not assert that each candidate is meaningful prose. At degree eight, every possible GP sequence produces a valid full mask by Möbius interpolation, with no plaintext discrimination at all.

An independent withheld 76-rune normalized LP1 WARNING excerpt was encrypted into the same geometry with a planted degree-one mask; the exact solver fits the authentic 180 known tail and recovers **76/76** withheld symbols. The test asserts both explicit boundary witnesses and the full-table coefficient identity. Source blobs: grid 4698c0806e6bab06a39cfbc3c3283b862de58b35; corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; LP1 control 8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d. The study function was executed in connected JavaScript against those exact sources; the Node/CommonJS wrapper has not been separately executed in Windows CI.

**Decision:** retire this known-tail direct Boolean-polynomial XOR receiver as a path to a uniquely predicted p55. The result is exact for the stated representation and coordinates; it does not exclude an independently specified constrained nonlinear key family, an alternate byte embedding, or a different source role of the table. The base60 degree-eight obstruction also holds under arbitrary table-address permutation for either tested GP encoding. No original unknown plaintext or authentic key was recovered.

## Cryptanalytic decision

The source chain **MOBIUS → five binary slots → 32 rows → Boolean inverse** is human-plausible but incomplete: no original source currently instructs how its transformed rows should act on the ciphertext. The 16 direct grid-order and 144 original-stencil-order five-bit repeating-key interpretations fail; the distinct full-8-bit flattened-table extension also fails across 64 fixed GP29/GP28 variants. These are bounded negatives for direct repeating-key uses of the tested Boolean Möbius arrays. The distinct terminal known-plaintext interpolation cannot uniquely select any p55 output: the minimum admissible degrees are eight (three encodings, entirely unconstrained) or seven (base59 prime weights, one global XOR condition). No original-authored selector supports either use of Möbius inversion. A successor needs an independent clue selecting an actual register/key/clock or state transition and must predict original unknown plaintext, with lossless recovery of all 12,956 runes.

The authoritative [results synthesis](../results/README.md) continues to report no recovered unknown LP2 plaintext. These five-bit, full-8-bit and known-tail results belong in intermediate findings rather than established results.
