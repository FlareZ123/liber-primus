# Direct consecutive-prime half-gap framing — excluded

## Decision
Director #2788 tests whether the original printed complete-group lengths are L_i=(p_(j+i+1)-p_(j+i))/2, consecutive odd primes, with no wrapping or rune-value fitting. The authentic p56 prime clock and p15 prime-ordinal work motivate this direct public-state transfer, but neither explicitly instructs this framing. **No exact frame or cursor is recovered.** More strongly, all nine chapters contain a modular obstruction that rules out this exact rule at *any* prime origin, not merely the finite search window. Retire this convention, not the decoy-spacing hypothesis or other source-selected clocks.

## Exact all-origin rejection
If two successive lengths a,b give residues 0,2a,2(a+b) all distinct modulo 3, the required three consecutive primes p,p+2a,p+2(a+b) contain a multiple of 3. At an interior group offset >=1, starting with any odd prime, p>3; hence this is impossible. The corrected opening has [11,5] at zero-based group offset 5: p,p+22,p+32 exhaust residues 0,1,2. The actual first pair [8,5] likewise exhausts the residues; the sole potentially exceptional starting prime 3 has actual first half-gap 1, not 8. No need to extend the ordinal search. There are 549 forbidden interior adjacent pairs in the concatenated book (547 within the separately reset chapters; chapter seams may contribute). No adjacent [1,1] occurs, so the more general mod3 argument is required.

## Reproducible finite search and heldout
Source: corrected transcription blob f7b534a33edeb212d427329798438325307463d7, canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165. Parse physical p0–55, carry line and page fragments, match all 12,956 rune indices to canonical tape and 2,896 complete groups. Printed section-marker cuts: 0,729,1874,3612,5506,6527,7960,9640,12648,12956. The offset3612 marker follows the isolated nine-rune red rubric on physical p15 (archive32.jpg), visually separated from the main body by its numeric square and infinity figure. The physical-page chapter convention used in #2719 starts p15 at offset3603 instead. Both are explicitly tested; all other cuts coincide. Exhaust one-based ordinal 2–3301 inclusive, no wrapping. Fit longest exact prefix of first floor(n/2) groups; freeze lowest ordinal among ties; score second half without reranking. Separately measure longest full prefix. Nulls: 2,000 deterministic within-chapter histogram-preserving shuffles, retaining nine chapter sizes and searching every allowed origin; book uses their concatenation, plus 2,000 unrestricted whole-book histogram shuffles. The scope-family statistic is max prefix over nine chapters and full book.

| Physical chapter | Groups | Longest prefix | Tied origins | Frozen suffix exact positions | Mod3 obstructions | Null prefixes >= observed |
|---|---:|---:|---:|---:|---:|---:|
| p0–2 | 158 | 1 | 110 | 9/79 | 29 | 2000/2000 |
| p3–7 | 255 | 1 | 473 | 20/128 | 49 | 2000/2000 |
| p8–14 + p15 rubric | 385 | 3 | 5 | 25/193 | 75 | 1139/2000 |
| p15 after rubric–22 | 435 | 2 | 57 | 28/218 | 83 | 1559/2000 |
| p23–26 | 224 | 3 | 5 | 9/112 | 47 | 1107/2000 |
| p27–32 | 326 | 2 | 7 | 20/163 | 67 | 1588/2000 |
| p33–39 | 378 | 1 | 473 | 30/189 | 67 | 2000/2000 |
| p40–53 | 669 | 2 | 52 | 47/335 | 120 | 1586/2000 |
| p54–55 | 66 | 2 | 32 | 5/33 | 10 | 1535/2000 |
| All | 2896 | 1 | 110 | 196/1448 | 549 | 2000/2000 |

For the printed section-marker convention, the familywise maximum prefix is 3, reached/exceeded by 2000/2000 controls; unrestricted book shuffle likewise 2000/2000. With physical-page chapter starts the affected p8–14/p15–22 scopes have 383/437 groups, longest prefix 3/4, ties5/1, frozen suffix24/192 and32/219, and the same 75/83 exact mod3 obstructions. Their null exceedances are 1136/2000 and 523/2000; the maximum4 is reached/exceeded by 1858/2000 familywise controls. All ten physical-start plants also uniquely recover their cursor and all disjoint heldout gaps. Thus the all-origin rejection holds under both source-visible boundary conventions. Even selecting the best suffix post hoc among the 110 book-prefix ties yields only 201/1448. The suffix match counts are descriptive, not recovered exact plaintext. The observed length histogram is [83,448,720,513,317,256,216,156,78,52,32,18,4,3] for lengths 1..14.

## Positive controls and limits
For each scope, generate true consecutive-prime half-gap frames of exactly the same number of groups with starts [2,13,23,59,83,133,331,1033,3301,3301]. Select the cursor using first half alone: all ten starts uniquely recovered; all ten disjoint second halves reproduced exactly. In 100 same-histogram permutations of each plant, maximum exact prefix is 5–7. Plants preserve their own gap histogram, not the different original histogram. They test exact cursor identifiability only; no plaintext cipher claim is made.

Reproducer: [CommonJS SFT](../sims/lp2_prime_half_gap_framing_sft.cjs), tested in V8 with fetched source bytes; run from checkout using `node sims/lp2_prime_half_gap_framing_sft.cjs`. The first finite test and independent-half correction are commits d120b899db77fb492c7b45b721b067da44a4879a and 5456b5729a78169e0dfe865b80806df967f93fc1. Both boundary conventions are implemented in commit 3823a6b40c6cc1051235baed8b05cca07a506d83. No CI used. No new original plaintext, authentic key, or destination.

## Research consequence
No cursor can be passed to the p56 receiver through this convention. Do not generalize by adding arbitrary prime skipping, offsets, scale, or post-selected length permutations. A different source-fixed decoy framing rule requires a new independent clue.
