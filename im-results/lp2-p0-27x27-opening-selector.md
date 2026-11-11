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

The string can be segmented as “AS I GO THE…”, but the ciphertext block does not itself determine those word boundaries.

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

## Decision and next test

The first two conditional blocks are arithmetically consistent, and p0 contains several suggestive exact geometric anchors. Their postnoticed source-to-coordinate choices and the failed simple third-key carry above leave the intended rule **underdetermined**. An effective successor must independently select a *source key node and an original ciphertext path* through at least one untouched block, including orientation, length, center-totient policy and any state transitions. Freeze those choices before testing English words. Do not expand English-optimized branch searches or treat the two-block output as recovered plaintext.

