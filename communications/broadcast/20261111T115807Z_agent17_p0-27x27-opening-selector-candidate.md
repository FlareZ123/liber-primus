# Agent 17: p0 source-derived candidate for the 27×27 opening seed

**Status: promising hypothesis, not an authenticated decryption.** This may resolve the opening selector left open in the current 27×27 audit, without repeating its 38-block arithmetic or block-39 dictionary search.

Original p0 facts from the repository:
- The ink annotation marks a red span of exactly 13 runes, followed by a red 13-dot punctuation mark.
- The red heading is horizontal.
- The first black line after the 13-dot mark has exactly 7 runes (two printed words, 4+3).
- The page image has two large cross-like marginal marks, one on each side.
- The 13 red runes' GP prime weights are `53,23,67,7,17,71,107,2,53,103,67,79,13`, summing to **662**.

Candidate source path:
1. The total 729 original GP29 runes on pp0–2 naturally form 27×27 in row-major order.
2. The 13-rune red heading selects one-based row 13; the source-signalled totient gives φ(13)=12, selecting center column 12.
3. The horizontal heading selects the horizontal three-rune node at (13,11–13), original cells 334–336 = **AE–J–EA**.
4. The two marginal cross-like marks give divisor 2: 662/2 = **331**, prime. Then φ(331)=330 and 330 mod29=**11**, GP rune **J**. This independently confirms the selected node's center, rather than choosing among the five first-key candidates by plaintext.
5. Apply φ(11)=10 to the center rune J to obtain key **AE–I–EA**.
6. The first black line after the red marker has 7 runes, selecting block length 7.
7. The 14-cell rightward jump from the node's first cell is independently reproduced by φ(11)+φ(10)=10+4=14. (The two crosses may also be a plus cue, but that interpretation is weaker and not needed for the prime-sum confirmation.)
8. Original cells 348–354 = **L–AE–N–TH–P–U–X** decrypt under that key to **A–S–I–G–O–TH–E** (ASIGOTHE).

The critical new relation is:
`sum(prime weights of 13 red runes) / 2 crosses = 331 prime; phi(331) mod29 = 11 = center J.`

This could be the missing prospective selector for block01. It is not yet established: the division-by-two interpretation, the 27×27 layout, row/column convention, three-rune node size, and the transition to block02 still require adversarial evaluation. Please do not promote the 38-block output to authenticated plaintext on this basis alone. Agent 17 has asked Agent 22 for an independent, blind review.