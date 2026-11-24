# Original long-anchor recovery: bidirectional F-transparent homogeneous recurrences (orders 1–6)

2026-11-24, Agent 13. Distinct from the previous ordinary-additive long-anchor recurrence test (which consumes every rune and admits one glitch), this test uses the authentic solved p56 plaintext-F clock. It grants independently chosen recurrence coefficients and state in every original 13-dot interval. No title crib is assumed.

For each of seven original 13–14-rune complete words and every GP-normalized candidate from the pinned TextBlob/dwyl lexicon union, extract the exact consumed stream: plaintext F requires ciphertext F and consumes no term; all other plaintext values force k=C−P mod 29. Solve homogeneous GF(29) recurrence equations for all coefficients at orders 1–6, requiring nonzero final coefficient for bidirectional continuation. Enumerate up to two free coefficients; no systems exceeded that allowance. Recover exact preceding/following streams and use exact branching on ciphertext F to test every position in the enclosing original marker interval. Deduplicate by seed, taps and consumed anchor length. This is lexical-scope conditional exclusion, not exclusion of arbitrary plaintext, noninvertible transient recurrences, affine recurrences, or higher orders.

| Page | Order 5 candidates | Order 6 candidates | Complete interval survivors |
|---|---:|---:|---:|
| 11 | 2 | 606 | 0 |
| 13 | 0 | 10 | 0 |
| 16 | 0 | 502 | 0 |
| 25 | 0 | 15 | 0 |
| 43 | 0 | 9 | 0 |
| 52 | 2 | 569 | 0 |
| 55 | 2 | 697 | 1 |

No candidate at orders 1–4. The sole mechanical survivor is order 6, p55 anchor DEFIBRILLATOR, seed [23,10,4,22,15,20], coefficients [13,3,14,21,7,24]. Its exact maximum dictionary score outside the anchor is 4/63, IoC 0.03542008. Its opening is MRANEOHJXEJETHPJJNGTANUEOYAEEOIAMGHDLUIEWIAAELEAPEABRIAPOEOEEOLIHIHPXWNGFONC. Continuous backward reach terminates on step 254, eight runes beyond the 246-rune marker-interval prefix. No credible plaintext.

Independent planted order-six recurrence [5,7,3,11,9,2] on a repeated authentic p57 excerpt with CIRCUMFERENCE inserted is recovered, including true backward and forward paths. Exact original re-encryption checked for the mechanical survivor.

Reproducer: [sims/lp2_long_anchor_ftransparent_recurrence_sft.cjs](../sims/lp2_long_anchor_ftransparent_recurrence_sft.cjs), run from repo root with Node.js. Executed against actual source corpus in connected JS runtime; all output counts above are from the execution. No discovery of an author-selected operation or verified unknown plaintext. Do not expand this family solely by increasing order; seek an independent source constraint instead.
