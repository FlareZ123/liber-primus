# LP2 original-visual clue → operation map

**Status:** intermediate audit; no new LP2 plaintext, cipher key, or decryption recovered. This is a decision map, not an established result.

**Scope:** inspected the 58 original LP2 page images (resources/liber-primus/00.jpg–57.jpg) against the canonical rune corpus. I did not inspect or manipulate red ink or the printed 32×8 table; issue #9 explicitly requires coordination with issue #3 first.

## Ranked source-visible routes

### 1. Five-slot tree ornament → 13/31 stencil counts → 32×8 table (issue #3 owns this line)

**Original locations:** LP2 pages 49–51 (49.jpg–51.jpg), with repeated 13-dot stencil marks elsewhere in the book.

A separate Agent 41 source audit reports that the same five-slot tree ornament flanks the printed 32×8 table on all three pages. Under one explicit convention—topmost slot first, clockwise, solid=1 and hollow=0—the left and right ornaments read 01101₂=13 and 11111₂=31. The audit also reports 31 instances of the 13-dot stencil, yielding 32 intervening fragments, which matches the table's 32 rows.

**What a solver could infer:** the repeated tree ornament and dot stencil may select a five-bit reading convention, then a 31-separator/32-fragment alignment with the printed table. This is the strongest direct visual-to-table candidate, but it is not a result of this invocation and the orientation/polarity convention remains a hypothesis.

The evidence and current tests are already consolidated in [im-results/red-256-event-grid-correspondence.md](red-256-event-grid-correspondence.md); this belongs to issue #3. I did not touch the table, red ink, or repeat its experiments. Do not duplicate that work under issue #9; coordinate with issue #3 before any further use.

### 2. Babylonian numerals → 2014 magic-square source → prime counting

**Original locations:** LP2 pages 33, 35, 38, 39 (33.jpg, 35.jpg, 38.jpg, 39.jpg).

The repeated two-row cuneiform motif reads as sexagesimal pairs 17,13 and 55,1, conventionally rendered as decimal 1033 and 3301. Those values match the line sums in the archived 2014 magic-square material (resources/cicada2014-openpuff-magic-squares.txt). The existing derivation in [results/fibonacci-prime-spiral.md](../results/fibonacci-prime-spiral.md) applies prime counting to the earlier square centres and recovers the GP letters LP.

**What a solver could infer:** recognise the Babylonian numerals, search the earlier Cicada material for 1033/3301, and reuse the prime-counting operation already motivated by the 2014 squares. This is the strongest historically motivated cross-round route in the artwork. It confirms a connection to the title, not an unknown LP2 key or plaintext.

**Structural hypothesis:** the four identical-orientation motifs delimit a 1,589-rune span into five blocks of [123, 261, 737, 228, 240], at offsets [0, 123, 384, 1121, 1349, 1589]. The external [Cicada Notebook session 16](https://cicadanotebook.com/sessions/16.html) reports that the five numbered list items on pages 36–38 do not align one-to-one with these blocks; the first marker also splits a three-rune word. The motifs do not alternate orientation, so they do not independently signal alternating reversal.

**New bounded tests:** treating the marker-defined block lengths as a five-symbol key gives remainders mod 29 [7,0,12,25,8] and quotients [4,9,25,7,8]. I tested both sequences as repeating additive keys and as one constant shift per block, with both signs, all five phases, literal-F skip/consume, continuous and marker-reset states, on the marked span and following pages 40–53. Across 124 configurations, the best IoC was 0.03683 and no output was readable. I also reused the solved-p56 prime-totient rule, anchored at prime values 1033/3301 or their prime ordinals, with continuous and marker-reset states (32 configurations); best IoC was 0.03549, with no plaintext.

This is distinct from the existing 1033/3301 LCG studies and the existing five-numbered-item pad studies: those use different state rules and the explicit list-item boundaries, not these four image-marker boundaries. See [im-results/lp2-numbered-five-alignment.md](lp2-numbered-five-alignment.md), [im-results/numbered-five-item-shared-key.md](numbered-five-item-shared-key.md), and [im-results/magic1033-3301-fullwidth-lcg-skip.md](magic1033-3301-fullwidth-lcg-skip.md).

**Decision:** retain the 2014 cross-reference as a plausible intended human path. Do not promote marker-length residues or prime-totient resets as a key.

### 3. Möbius / infinity figure → opening-page traversal or Möbius inversion

**Original locations:** LP2 pages 0–2 and 15 (00.jpg–02.jpg, 15.jpg).

The figure-eight/Möbius-like mark repeats on the opening three pages and appears again below the 4×4 Fibonacci-prime square on page 15. The opening three pages contain 729 runes, which can be arranged 27×27 after transcription. Page 15 supplies a visible clockwise centre-out spiral, while the repeated figure suggests cyclicity or a one-sided/twisted traversal.

**What a solver could infer:** consider a cyclic or Möbius-style ordering for the opening block, or interpret the symbol as the number-theoretic Möbius function. The source does not specify the seam, starting cell, handedness, or whether the intended operation is topological traversal versus arithmetic inversion. A 27×27 interpretation is therefore a candidate, not an established authorial instruction.

**New bounded tests:** on the opening 729 runes I tested μ(n) additive masks and one-dimensional Dirichlet Möbius inversion in row-major and centre-out spiral order, plus two-dimensional divisor-lattice Möbius inversion on the 27×27 grid. I also tested the same one-dimensional Möbius operations on the separate page-15–22 span associated with the page-15 figure (1,903 runes), continuously and with page resets. Results remained near the uniform 29-symbol baseline; the best opening-block IoC was 0.03485 and the best page-15–22 IoC was 0.03466. No output was readable.

The direct 4×4 Hill interpretation of the page-15 square is already extensively screened; do not repeat it. See [im-results/clue-matrix-hill.md](clue-matrix-hill.md) and [im-results/p15-hill-block-test.md](p15-hill-block-test.md). The repository's integrated challenge also warns against promoting retrospective grid/tile geometry without an independent source feature selecting it.

**Decision:** the repeated figure is real, but the original pages do not uniquely select a Möbius transform. Keep this as a bounded unresolved visual lead; do not launch another free-parameter search without a source-visible seam or orientation rule.

### 4. Dotted mayfly → GIMP Dissolve image operation, not a cipher key

**Original location:** LP2 page 57 (57.jpg).

An external image reconstruction reports a strong match between the dotted insect and GIMP's historical Dissolve layer mode ([SECRA research and evidence index](https://secra.tech/research/liber-primus-strongest-findings/evidence/index.html)). GIMP's 2.8 manual describes Dissolve as producing a random pixel pattern in partially transparent regions. Crucially, 314159265 is a long-standing GIMP implementation constant: it appears as RANDOM_SEED in GIMP v1.2-derived source and is hard-coded in the modern Dissolve implementation to initialize the 4,096-entry table. It is therefore not evidence that the puzzle author deliberately selected π as a cryptographic key. The source clarification is recorded in [im-results/gimp-dissolve-source-pad-gate.md](gimp-dissolve-source-pad-gate.md).

**What a solver could infer:** reproduce an image-production effect to explain the stippling. This may identify the artwork workflow, but it does not select a plaintext transform or establish a keystream. The repository's existing GIMP-field-as-pad tests remain negative.

**Decision:** treat this as an image-rendering fingerprint, not an encryption key. Do not reuse the digits of the seed as a π-derived pad.

## Other artwork and exhausted routes

- The five-dot stencil and its reflections are already covered by [im-results/black-dot-template-reflections.md](black-dot-template-reflections.md) and the solved-page inversion work. No new route is selected.
- The tree/blur/outline relationship is already covered by [im-results/tree-outline-blur-registration.md](tree-outline-blur-registration.md). Apart from the issue-#3 13/31 ornament lead above, the repeated root, scrollwork, wing, cicada, and botanical motifs are useful section/template markers, but this audit found no independently selected cipher operation in them.
- The page-22 horizontal object and corpse-like figure are visually ambiguous. Calling the upper object a rail fence or skeleton key would be an unsupported identification; no transposition is assigned from it.

## Handoff

No candidate in this audit qualifies for promotion to results/. The positive result is the cross-round 1033/3301 → 2014 magic-square → prime-counting → LP path; the new computational contribution is the bounded negative on marker-defined cuneiform block keys and direct Möbius-function/inversion interpretations.

Keep issue #9 open for a genuinely source-constrained next step. Do not repeat the existing Hill, five-item, LCG, five-dot, tree, or GIMP-pad families. The next useful visual intervention is to revisit the cuneiform/Möbius clues only if another source feature independently fixes a state transition, coordinate convention, or Möbius seam. Coordinate with issue #3 before touching red ink or the 32×8 table. No nine-tile partition is asserted.
