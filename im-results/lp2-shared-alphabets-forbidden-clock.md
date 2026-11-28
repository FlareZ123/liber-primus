# Exact shared forbidden-label clock collapse: periods 8 and 13

**Agent10, 28 November 2026.** New exact original-ciphertext restriction, superseding the narrower heuristic original negatives in the [blind two-alphabet receiver report](lp2-fibonacci-independent-alphabet-em.md). No original plaintext or author key recovered.

## Reduction

Let (P=0) emit literal (C=0) without advancing the consuming phase; otherwise (B(C)=A(P)+K_j\pmod{29}), where (A,B) are arbitrary unknown permutations, with (A(0)=0) WLOG by shifting the key. Define (Z_j=B^{-1}(K_j)). A consuming event at phase (j) is legal exactly when (C\ne Z_j); a hold event is legal exactly when (C=0). Thus the complete original-ciphertext legality problem is identical to the native additive F-hold problem with key (Z), independent of the two secret alphabets. Conversely any legal (Z) has a realization for any chosen (A,B) by setting (K_j=B(Z_j)). The reduction is an exact bijection for fixed (B), not an approximation.

It holds still more generally for any arbitrary GP29 bijective phase decoder (T_j): (Z_j=T_j^{-1}(0)), independent of the other 28 entries. Decoder charts may even be chapter-private provided their forbidden-label vector is shared. If (Z_j=0) for every (j), all ciphertext F sites must be holds, and all non-F consume. For the two-shared-alphabet additive model specifically this forces (K_j=B(0)) constant; its inverse is one stationary F-preserving substitution. For the broader phase-chart model the other entries can still vary, so do **not** assert stationary substitution there.

## Exhaustive search

Nine visual chapter starts at rune offsets 0,729,1874,3603,5506,6527,7960,9640,12648. End 12956. Body-only starts remove the literal red-heading lengths [13,16,12,20,16,19,10,8,9] (123 runes). Periods are the historical WELCOME and KOAN periods; the current LP2 source does not authenticate these clocks. A common phase-zero reset at the chosen chapter start is the main hypothesis. In the independently variable-start case, the longest chapter is fixed at phase zero without loss of generality by rotating the common vector, and every other initial phase is permitted.

For each nonzero run terminated by a visible F (plus each last run), precompute the entry-phase mask allowed by each possible single assignment (Z_j=k), (k=0..28). Intersect masks for all assigned digits; at an F ending the run permit hold and, unless its phase is already assigned forbidden label 0, consumption. A partial assignment permits all unassigned digits and may only over-admit paths. Forward/backward reachable-mask pruning removes entry phases not on any complete relaxed chapter path. Enumerate every single and pair assignment; propagate these necessary domains in a minimum-remaining-values DFS, running the same exact relaxed path check at each depth. A complete assignment is exact. No language score, heuristic candidate cap, alphabet restriction, or guessed plaintext is used. The explicitly capped free-q13 experiment is not an exhaustive result.

| Framing | Period | Tests | DFS nodes | Legal vectors | Complete |
|---|---:|---:|---:|---:|---|
| Complete chapters, phase zero |8|2,094|13|1|yes|
| Complete chapters, phase zero |13|30,140|2,134|1|yes|
| Body-only chapters, phase zero |8|3,260|18|1|yes|
| Body-only chapters, phase zero |13|36,451|2,332|1|yes|
| Complete chapters, independent initial phases |8|20,575|203|1|yes|
| Complete chapters, independent initial phases |13|2,000,025|84,039|3 found|**no**|

Every completed search returns exactly the all-zero vector. The q13 free-start partial search found zero and two rotations of a one-nonzero vector (nonzero value 15); **these are only examples of feasible vectors, not a complete survivor set or an upper bound**. The q8 result independently follows from the prior [113 exact page-free native vectors](lp2-allsecret-period8-ftransparent-original-exclusion.md), filtered at the nine fixed chapter starts (41 after first, 1 after second). The direct new search does not depend on that prior output. The earlier uninterrupted pp40–55 q13 search had 10,418 survivors and does not contradict the nine-frame reset constraint.

Four separate 29^q exhaustive rune-by-rune DP controls, q2/q3 and fixed/free starts, match the complete optimized leaf sets (378, 358, 10,198, 13,191 respectively); distinct random two-secret-alphabet planted senders with q8/q13 and both nonzero/F events retain their true forbidden vector. These are exact feasibility controls, not unknown-key recovery. The separate blind receiver previously achieved full oracle parity on four literary plants; exact legality now explains why the original common-clock receiver was negative.

## Stronger arbitrary-chart original prose obstruction

When the only vector is zero, the nonzero-consuming phase at each original position is determined by the count of earlier nonzero ciphertext symbols since its frame start. For a fixed plaintext non-F symbol, any bijective chart selects precisely one nonzero ciphertext bin at each phase. Therefore the maximum count of any one plaintext non-F is at most the sum of phase-histogram largest bins. For top-k non-F use top-k bins; grant independent arbitrary phase charts to each chapter for a looser bound (sum separate chapter bounds). The latter bound is invariant under arbitrary per-chapter phase shifts, since such a shift only permutes phase histograms.

| Original scope | q | Shared top-1 / top-2 | Even chapter-private top-1 / top-2 | Lowest top-1 / top-2 across donor windows |
|---|---:|---:|---:|---:|
| Complete 12,956 |8|560 / 1105|816 / 1544|1408 / 2441|
| Complete 12,956 |13|600 / 1169|941 / 1772|1408 / 2441|
| Bodies 12,833 |8|569 / 1103|805 / 1527|1393 / 2416|
| Bodies 12,833 |13|611 / 1189|934 / 1757|1393 / 2416|

The reference envelope exhausts every contiguous length-matched GP-native window of Emerson/Shakespeare/Gibran under the same normalization as the earlier receiver: 562,060 windows for complete chapters, 562,429 for bodies. All fail even the chapter-private top-1 bound; comparison includes only non-F bins. No language score is required. This is an exclusion of those finite native reference registers, not a universal theorem about all possible plaintexts. The shared-forbidden-vector assumption remains essential even for private charts. Independent per-chapter forbidden vectors, variable clock lengths, non-bijective chart laws, transport/reordering, and arbitrary initial phases at q13 remain outside the completed result. All-zero vectors alone do not mean ciphertext cannot encode an intermediate high-entropy representation.

**Disposition:** retire this exact common forbidden-label periodic family for q8/q13 under completed clocks, including arbitrary full phase substitution tables and private charts with common forbidden labels. A new source-selected operation is needed. Do not promote the capped q13 free-start experiment to an exclusion. This strengthens the all-secret direct additive/F-hold results without repeating their key searches.

[CommonJS search, toy controls and frequency program](../sims/lp2_shared_alphabets_forbidden_clock_sft.cjs) · [raw complete and capped outputs, input hashes](lp2-shared-alphabets-forbidden-clock-output.json). Core executed in connected V8; standalone Node wrapper not independently run. `solve(raw,q,maxTests,free,body)`, `selfTest()`, and `frequency(raw,donorStrings)` are exported.
