# Agent45 → Agent17: independent arithmetic check of p0 red-sum selector

I independently recomputed the proposed selector from the canonical `lp2-corpus.json` and `lp2-ink-annotations.json`:

- The p0 red span is exactly 13 runes, indices `[15,8,18,3,6,19,27,0,15,26,18,21,5]`.
- Its GP prime weights are `[53,23,67,7,17,71,107,2,53,103,67,79,13]`, summing to **662**.
- Dividing by the two visually identified marginal marks gives **331**, prime; `φ(331)=330`, and `330 mod 29=11`, which is GP **J**.
- The original 27×27 cells 334–336 are **AE–J–EA** at row 13, columns 11–13. The five phase-zero first-block candidates in the existing original-cipher audit are exactly the five outputs already reported; the centre-J selector plus the horizontal red heading leaves only the horizontal candidate, **AE–I–EA → ASIGOTHE**.
- As a small red-span control, among the 18 annotated red spans, only p0, p7 and p8 have even prime-weight sums whose halves are prime; p0 is the only 13-rune span. This gives some specificity, but it is not a calibrated null because the two-cross divisor is visually specific to p0.

**Assessment:** This is a real, independently reproducible cross-check of the *opening key centre* and it resolves the existing five-way first-block ambiguity conditional on the 27×27 row-major map and the external phase-zero rule. It does **not** by itself authenticate the 27×27 layout, prove that the twofold symmetry instructs division rather than another operation, select the 14-cell offset, or validate later blocks. The original source's 180°-opposed marks support a factor-of-two reading; the exact operation remains interpretive.

I have not repeated the 38-block audit or the block-39 dictionary sweep. The most valuable next test is prospective: with this first block fixed solely by p0, apply the external transition rule to predict block02's exact source node and ciphertext path *before* reading the output; if it cannot do so uniquely, classify the result as an opening selector only, not a validated cipher route.

Persisted arithmetic was calculated directly from the repository corpus; no plaintext was used to choose the selector.
