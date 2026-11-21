# p15 Fibonacci-prime / p23 red-heading ciphertext-feedback gate

**Agent 43, 15 November 2026. Classification:** one exact, source-derived candidate for a word-position / previous-ciphertext state cipher has been inverted on original LP2 pp23–26. It recovers **no unknown plaintext, key, or destination**. The candidate is rejected as a direct native-GP29 prose inverse; this does not reject the wider stateful family.

## Human-visible route and frozen operation

The source offers two unusually well-defined 16-item operands:

- Original physical p15 (resources/liber-primus/32.jpg) prints a 4×4 clockwise numerical spiral. Its 16 values are exactly the absolute differences between 3301 and prime(F+1) for the first 16 distinct Fibonacci values F = [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987]. The resulting prime sequence is [2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817]. The solved p56 cipher independently makes Euler's prime totient a known Cicada operation, motivating the fixed multiplier a[j] = (prime[j]-1) mod 29.
- Original physical p23 (resources/liber-primus/40.jpg) opens with five dots and a 16-rune red heading. Its exact GP29 indices are [1,24,7,21,6,14,23,6,10,17,10,12,16,17,10,26].

**New independent source-pointer context (Agent19, 21 November 2026):** summing the GP prime weights of the original 16-rune p23 red heading yields **786**, whose residue modulo the 256-cell p50 table is cell **18**; that cell prints `0F`, valued **15** in both base59 and base60, pointing directly to the physical p15 16-number square. [The complete all-nine-chapter original table lookup](lp2-red-heading-prime256-page-pointer-fork.md) fixes the rule before retaining these page hits and shows five headings with out-of-book values. This makes p15 a more specifically motivated p23 pairing than the equal length alone, but **no authenticated source tells a solver to sum red prime weights, reduce mod256 or turn a byte into a page pointer**. It does not authorize the affine state equation or make its already observed failed inverse positive.

Agent43's independent word-state work left two possible two-rekey chapter boundaries, p15+p23 or p15+p27, but no executable key/state generator. This test asks whether the p15 prime-totient vector and p23 red-heading vector can supply one simple, reproducible generator for the p23 chapter. The five-dot ornament is a chapter locator here; it does not itself specify the equation.

The single frozen model is a position-dependent affine ciphertext-feedback cipher over GF(29):

\[
C_{w,j} = a_j P_{w,j} + b_j C_{\mathrm{prev}} \pmod{29},
\]

where a[j] = phi(prime(F_j+1)) mod 29, from p15's clockwise spiral; b[j] is the p23 red-heading rune index at the same zero-based position; j resets to zero at each original printed word; C_prev is the preceding published ciphertext rune and carries across word and page boundaries; and the initial C_prev is the final rune of the p23 red heading, index 26.

The exact inverse is P[w,j] = a[j]^-1 * (C[w,j] - b[j]*C_prev) mod 29, updating C_prev to the current ciphertext rune after each symbol. Every a[j] is nonzero, so the transform is bijective for each fixed previous-cipher state. No offset, skip, page reset, key phase, or plaintext parameter is fitted.

This is a plausible experiment, not an authenticated creator instruction. The newly identified numerical page pointer, if actually intended, offers a direct route from p23's heading to the p15 square, but the source does **not** specify the prime256 lookup, prime totients as multipliers, the p23 heading as feedback coefficients, or resetting this clock at printed words. The 16-item visual match and page-pointer coincidence are insufficient evidence of a solved cipher.

## Exact original-source result

The canonical parser and GP29 corpus fix the target without post-selection:

- p23–26 contain **1,021** original runes; removing exactly the 16-rune p23 red heading leaves **1,005 body runes**.
- The body consists of **220 complete printed words**, with maximum rune-word length **14**.
- Original body page counts are **[197,270,273,265]**.
- The inverse is applied to every original body rune in printed order, preserving every word boundary and all 1,005 positions.

| Stream | GP29 index of coincidence |
|---|---:|
| Original p23–26 body | **0.034304573** |
| Frozen inverse output | **0.034514678** |
| Matched-length native-GP Gibran positive plant | **0.062975957** |
| Solved p57 reference | **0.062709966** |

The inverse's first 60 rune transliterations are:

TH S S F L AE IA T P NG L A W O AE F G E NG Y EA A IA B TH NG B NG E M P A AE L U O B O N S U S EA S M OE EA X H G AE H EA O D P I N F IA

The original inverse remains at the near-uniform GP29 baseline 1/29 ≈ 0.034483; it does not approach the independent native-GP control. The output is not a readable opening. The result is therefore negative for this exact direct plaintext model.

A source-native positive control selects 220 authentic Gibran words with exactly the original 220 GP-rune word lengths, encrypts them under the same p15/p23 state equation, and recovers all **1,005/1,005** runes. Exact forward re-encryption also passes. This confirms that the implementation can recover native GP text when the frozen model is actually used; it does not authenticate the model as the historical LP2 cipher.

## Important limitation and decision

The p15 and p23 features each contain 16 entries, but the longest original body word has only 14 runes. Consequently the inverse consumes only p15 coefficient positions 0–13; p15 positions 14–15 are unused. The p23 heading positions 0–13 are feedback coefficients, position 15 seeds the initial previous-cipher register, and position 14 is unused. This is an additional weakness in the proposed pairing, not a reason to invent padding or a different clock.

**Retire this exact p15-totient / p23-heading affine-feedback construction.** Do not continue by tuning signs, reversing one vector, changing word/page resets, or fitting phases. The two conditional chapter-boundary patterns from the all-secret singleton theorem remain only structural possibilities; this test does not resolve them or exclude a different source-selected generator. The next useful route needs an independent clue that specifies the state update or an authentic external key, not another post-hoc combination of the same 16-item features.

## Reproduction

- Original source inputs: resources/liber-primus/lp2-corpus.json, resources/lp2-transcription.txt, resources/control/gibran_prophet_58585.txt.
- Shared word parser: sims/lp2_word_pages.cjs.
- Standalone reproducer: sims/lp2_p15_p23_word_feedback_sft.cjs.
- Manual execution uses the existing .github/workflows/manual-readonly-commonjs-sft.yml; no workflow file is added.
