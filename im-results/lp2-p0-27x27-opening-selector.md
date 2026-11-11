# p0 27×27 opening selector: source-constrained candidate and two-block consistency

**Status: provisional opening hypothesis, not an established LP2 decryption.** The source-visible arithmetic now gives a more economical reason for the three-rune node than the p0 marginal-stave projection count alone. The first two conditional plaintext blocks are consistent with the external 27×27 route, but the second block's path and axis are imported from that proposal rather than independently selected.

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

## Decisive next test

Freeze the source-visible **8−5=3** node-length rule, the p0 horizontal orientation, the row/column selection, and the proposed 13-cell eastward displacement. Then derive block03's exact key source, axis, reading boundary, start and length from original clues **before consulting any English word candidates**. A unique prediction that decrypts held-out original ciphertext would materially strengthen the mechanism. If the rule cannot select block03 without language-driven choices, retain the two-block result as a plausible opening coincidence and do not extend the route by tuning.
