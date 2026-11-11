# p0 27×27 opening selector: source-constrained candidate and two-block consistency

**Status: provisional opening hypothesis, with an independently falsified simple block-03 carry rule. No authenticated LP2 plaintext.** The source-visible arithmetic now gives a more economical reason for the three-rune node than the p0 marginal-stave projection count alone. The first two conditional plaintext blocks are consistent with the external 27×27 route, but the second block's path and axis are imported from that proposal rather than independently selected.

## Original-source selector

The original corpus records exactly **729 runes** on physical p0–p2, permitting a conditional 27×27 row-major layout. The layout itself is not yet authenticated.

On p0:

- The red heading has **13 runes**, in two words of **8 and 5**.
- The sum and difference of those word lengths give **8+5=13** and **8−5=3**. The first agrees with the red-heading length and following 13-dot mark; the second is a direct source-visible cue for a **three-rune node**.
- The two words' GP-prime sums are **347** and **315**, totaling **662** with mean **331**.
- Applying the p56/2013-motivated totient operation gives **φ(662)=330**, and **330 mod 29 = 11 = J**.
- The heading's horizontal orientation and **φ(13)=12** select the candidate center at one-based **(row 13, column 12)**.
- The horizontal three-rune source node at zero-based flattened positions **334–336** is **AE–J–EA**. Applying φ to the center gives **AE–I–EA** as the candidate key.

This uses the observed word-length difference to support node length 3; it does not depend on the irregular three-projection geometry of the two marginal staves.

## First ciphertext block

The first post-marker black line has **7 runes**, selecting the candidate block length. The key node begins at position 334 and the candidate ciphertext path begins at position 348:

- The displacement is **14** from the node's first cell. The earlier interpretation was two marginal staves × the 7-rune line.
- Equivalently, the displacement is **13** from the node center (position 335), exactly the red-heading length. This is a simpler candidate instruction: move 13 cells east from the center.
- These are two descriptions of the same observed start position, not independent confirmations. The manuscript has not yet fixed which, if either, is the intended instruction.

Original ciphertext positions **348–354** are L AE N TH P U X. Subtracting the repeating key **AE I EA** gives:

**A S I G O TH E** (ASIGOTHE).

**Original printed delimiter check (Agent 47, 11 November 2026):** the manuscript's actual ciphertext word boundaries at **zero-based positions 348–354** already divide the seven runes into **[348–349], [350], [351–352], [353–354]**, with word lengths **[2,1,2,2]**. Under the proposed AE–I–EA key, those four printed words individually decode to **AS / I / GO / THE**, respectively. This exact consecutive four-word length pattern occurs **once** among all **2,896** canonical unsolved printed words, at this very location. The source supplies those four word *lengths*, but its first boundary is a **literal period**: original runes 348–349 are followed by `.` before the single-rune word at 350, then ordinary `-` word separators. In the authentic solved LP2 p57 control, `.` is used for full-stop punctuation. If the proposed decoder preserves punctuation, it therefore predicts **`AS. I GO THE`**, which is grammatically awkward; stripping or remapping the period would require an independent source rule. The word-length alignment alone is stronger than arbitrary segmentation, but this punctuation-type conflict counterbalances that evidence. Reproducer: [source-delimiter SFT](../sims/lp2_27x27_opening_wordboundaries_sft.cjs).

**Limitations:** this was noticed after the published 27×27 opening route and its first plaintext had been selected; its uniqueness is descriptive, **not a preregistered probability or a blind cipher prediction**. The published second block WEATHER uses original positions **364–368**, yet the printed source word spans **364–369**; proposed block03 TURNS starts at source position 369 inside that printed word. Thus the source delimiter preservation observed at the opening **does not carry through the next two blocks** under the published paths, and no universal word-preserving rule or authentic LP2 decryption has been established. An independently prescribed source clue must still select key positions and succeeding ciphertext paths.

## Second-block consistency check

The p0 candidate's transition calculation, using the external proposal's Reports 01 and 03, predicts next phase 2 and the next key signature. The natural next source window at positions **354–356** is **X–OE–X**. Transforming its center gives **X–I–X**; phase-2 alignment gives **X–X–I**.

The external proposal supplies a horizontal, leftmost-first block02 path at original positions **364–368**. Those ciphertext runes are NG P EO O E. Subtracting the transition-predicted key **X X I** gives:

**W EA TH E R** = **WEATHER**.

Thus the first two conditional blocks read **“AS I GO THE WEATHER…”**. The original-cipher arithmetic is reproducible in [the source-selector SFT](../sims/lp2_27x27_p0_seed_selector_sft.py).

**Important limitation:** the block02 path and its axis/boundary are supplied by external Reports 01 and 03. This is a consistency check against original ciphertext, not a blind prediction of block02's exact start and length.

## Evidence classification and remaining uncertainty

**Direct observations:** p0 red-span length 13; word lengths 8 and 5; the two red-word GP-prime sums 347 and 315; the first post-marker black line length 7; two marginal staves; and the original rune values at the cited positions.

**Mathematical/computational consequences:** φ(662)=330; 330 mod29=11; φ(13)=12; the AE–J–EA node, AE–I–EA key, first-block output, transition signature, X–OE–X next node, X–X–I aligned key, and WEATHER output.

**Hypotheses:** 27×27 row-major layout; use of the red heading as a coordinate/seed; horizontal three-rune key-node cipher; the 13-cell eastward displacement; the external update rules; and the external block02 path.

The arithmetic center selector is not unique under a simple p0 cyclic-rotation null: **15 of 262** rotations produce the same φ(sum) mod29 center. The 27×27 external route also retains reused-cell plaintext conflicts and **52 admissible next words after block38**. The opening fit therefore does not authenticate the full 38-block route, resolve its continuation, or recover any of the other 55 unsolved pages.

## Further source-geometry and the first falsified carry rule (11 November 2026, Agent 40)

Three original facts give the published block-02 placement an economical retrospective geometric description. The second red-heading word has **five** runes. The published second key source **X–OE–X** is centered at **(row 14, column 5)**, and its five-rune ciphertext reading begins at **(row 14, column 14)**, the exact central cell of the 27×27 square. The first-row boundary between 13 red runes and the first black glyph likewise lies at **column 14**; that glyph is **TH**. These are exact ciphertext/layout observations, requiring no English language fit. The grid orientation, using the second word length as a key coordinate, and choosing the geometric center as a ciphertext origin were each identified after the published WEATHER selection, so they are **candidate source selectors**, not independent authentication.

A tempting *deterministic* sequel to the first two source nodes is to source each next three-rune key starting **at the final ciphertext rune of the previous block**. This reproduces the original first-to-second transition: block 01 ends at zero-based cell 354, and the published block-02 key source starts at cell 354. Freeze the carry rule and predict block 03 without consulting its claimed English text. The published block 02 ends at zero-based cell **368**, so the carried source node must be original cells **368–370**, namely **E–A–G** (GP indices **[18,24,6]**). With the published optional center totient this becomes **E–H–G**; with no center transform it remains E–A–G. Both have the same ordered Möbius/totient signature **[+1,0,−1]** and phase 0.

The independently specified Report 01 transition from block 02, evaluated on **all five actual block-02 cells** at row14 columns14–18, has source absolute-position Möbius sum **−1**. Given the outgoing state before this transition **S=2, outer=1**, its direct/+1 mode predicts **next phase0, outer0, and required signature [0,0,0]**. Thus the simple last-cell-as-next-key rule **cannot** generate a Report-01-compatible third key on original LP2. This is a direct original-cipher contradiction, independent of deciding what plaintext word to read or using the published block-03 key.

The separately published block-03 proposal instead chooses a nonlocal vertical source **H–NG–C** at (4,23),(14,23),(24,23). That source does satisfy signature [0,0,0] and can yield the five-rune word TURNS along column19 when its separately selected upward path and length are supplied. The contrast explains precisely why the simple endpoint continuity rule fails; it **does not refute every 27×27 proposal or prove that the published nonlocal selection is intended**. To take the published block03 as a genuine prediction, an independent clue must select its jump from the block02 ending cell to the source center, its vertical radius, the upward ciphertext direction and the five-cell stop before looking at TURNS.

The [source-original executable carry gate](../sims/lp2_27x27_endcell_carry_gate.cjs) asserts all 729 original rune indices, the exact first two conditional blocks, p0 red/black TH boundary, block02 center geometry, both carried-key signatures, the Report-01 output and the published alternate vertical source. No text candidates are searched. Its negatives are restricted to the named deterministic carry hypothesis.

## Third-block source-only uniqueness gate (Agent 43, 11 November 2026)

**Decision: the published constraints do not select block 03's exact three-rune node, ciphertext start or stopping point.** This closes the original-only selector question without testing candidate English words. The earlier two conditional outputs **ASIGOTHE WEATHER** remain arithmetic fits to externally selected paths, not authenticated unknown LP2 plaintext.

The [new original-input SFT](../sims/lp2_27x27_block03_source_uniqueness_sft.cjs) begins with the original 729 GP29 rune indices from physical pp0–2 and rederives block 02's original **X–OE–X** horizontal node at positions 354–356, center (14,5), transformed key **X–X–I**, phase 2 and conditional five-rune output WEATHER at positions 364–368. It then freezes the public Reports 01–15 **before examining any block 03 plaintext**, including all four Report 10 squarefree-GCD gates. The resulting original-source restrictions are:

- Next key: **vertical**, nonmirror, center on **even row / odd column**, **even physical radius**, derived key phase 0 and Möbius/totient signature **[0,0,0]**; optional original-center totient is retained as the public method allows.
- Next ciphertext: **vertical, bottommost/leftmost first**, even first and last row, odd column, beginning exactly on one of the eight rays through the preceding ciphertext's leftmost cell (14,14). These constraints force the next run to start on **row 14 in an odd-numbered column**, with odd lengths **3,5,7,9,11,13**.
- The Report 09 parity must use the actual predecessor phase **2**, hence its center term is **μ(n₀(14,5))=0**. Using the phase-0 center rotation would incorrectly exclude the published odd-column start. The source-axis derivation uses the genuine untransformed preceding **X–OE–X** prime sum **177** and right outer source cell (14,6).

An exhaustive source-only enumeration yields **129 key variants** over **86 different original three-rune node geometries** and **84 candidate ciphertext paths** from **14 starts**. Their Cartesian product retains **4,108 distinct node/path assignments** after all four Report 10 conditions, using no vocabulary or rune-language score. Every key variant appears in at least one passing assignment; 63 of the 84 paths remain. Giving the proposal the *exact* published ciphertext path (14,19) up to (10,19), original positions **[369,342,315,288,261]**, still leaves **64 key variants across 40 separate geometric key nodes**.

There is a sharper source-defined ambiguity even after granting the exact published key source and ciphertext path. Original key cells **[103,373,643]** are **H–NG–C** centered at (14,23), radius 10. Its **untransformed** key yields **T–U–R–N–S** on that path. The **center-totient-transformed** key uses φ(NG index 21)=12 (EO), yields **T–I–R–N–A** on the *same original ciphertext*, and has the **same required [0,0,0] signature, phase 0, orientation, source radius and Report 10 outcome**. Both candidate plaintexts re-encrypt the original five ciphertext runes exactly. The public source rules do not select that center-transform bit. Treating the appearance of the English word TURNS as the selector would be plaintext fitting.

The original p0 red heading and marginal staves may inspire a retrospective radius 10, column offset 4, or five-cell length. No independent original instruction fixes **all** of those choices, nor the center transformation. The simple predecessor-endcell key carry is already falsified above. The missing input is an authentic creator-supplied node address, length, and center-transform rule, or a new operation that produces a blind untouched original ciphertext prediction. Do not rerun the candidate-word sweep or continue the 38 selected external blocks under these incomplete constraints.

**Reproducibility:** [standalone Node 22 SFT](../sims/lp2_27x27_block03_source_uniqueness_sft.cjs) was run successfully against original repository data in [GitHub Actions run 43033254846](https://github.com/FlareZ123/liber-primus/actions/runs/43033254846) using the existing manual `grid-256-tests.yml` workflow with `probe=p0-block03-source`. Its assertions cover exact predecessor state, original rune geometry, all source-only constraint counts, the published conditional output pair, and exact two-way re-encryption.

