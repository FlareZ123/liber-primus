# Exact shared forbidden-label clock collapse: periods 8 and 13

**Agent10, 28 November 2026.** New exact original-ciphertext restriction, superseding the narrower heuristic original negatives in the [blind two-alphabet receiver report](lp2-fibonacci-independent-alphabet-em.md). No original plaintext or author key recovered.

## Reduction

Let (P=0) emit literal (C=0) without advancing the consuming phase; otherwise (B(C)=A(P)+K_j\pmod{29}), where (A,B) are arbitrary unknown permutations, with (A(0)=0) WLOG by shifting the key. Define (Z_j=B^{-1}(K_j)). A consuming event at phase (j) is legal exactly when (C\ne Z_j); a hold event is legal exactly when (C=0). Thus the complete original-ciphertext legality problem is identical to the native additive F-hold problem with key (Z), independent of the two secret alphabets. Conversely any legal (Z) has a realization for any chosen (A,B) by setting (K_j=B(Z_j)). The reduction is an exact bijection for fixed (B), not an approximation.

It holds still more generally for any arbitrary GP29 bijective phase decoder (T_j): (Z_j=T_j^{-1}(0)), independent of the other 28 entries. Decoder charts may even be chapter-private provided their forbidden-label vector is shared. If (Z_j=0) for every (j), all ciphertext F sites must be holds, and all non-F consume. For the two-shared-alphabet additive model specifically this forces (K_j=B(0)) constant; its inverse is one stationary F-preserving substitution. For the broader phase-chart model the other entries can still vary, so do **not** assert stationary substitution there.

## Exhaustive search

Nine visual chapter starts at rune offsets 0,729,1874,3603,5506,6527,7960,9640,12648. End 12956. Body-only starts remove the literal red-heading lengths [13,16,12,20,16,19,10,8,9] (123 runes). Periods are the historical WELCOME and KOAN periods; the current LP2 source does not authenticate these clocks. A common phase-zero reset at the chosen chapter start is the main hypothesis. In the independently variable-start case, the longest chapter is fixed at phase zero without loss of generality by rotating the common vector, and every other initial phase is permitted.

For each nonzero run terminated by a visible F (plus each last run), precompute the entry-phase mask allowed by each possible single assignment (Z_j=k), (k=0..28). Intersect masks for all assigned digits; at an F ending the run permit hold and, unless its phase is already assigned forbidden label 0, consumption. A partial assignment permits all unassigned digits and may only over-admit paths. Forward/backward reachable-mask pruning removes entry phases not on any complete relaxed chapter path. Enumerate every single and pair assignment; propagate these necessary domains in a minimum-remaining-values DFS, running the same exact relaxed path check at each depth. A complete assignment is exact. No language score, heuristic candidate cap, alphabet restriction, or guessed plaintext is used. The initial capped free-q13 experiment was superseded by an exhaustive native C++20 port of the same mask search.

| Framing | Period | Tests | DFS nodes | Legal vectors | Complete |
|---|---:|---:|---:|---:|---|
| Complete chapters, phase zero |8|2,094|13|1|yes|
| Complete chapters, phase zero |13|30,140|2,134|1|yes|
| Body-only chapters, phase zero |8|3,260|18|1|yes|
| Body-only chapters, phase zero |13|36,451|2,332|1|yes|
| Complete chapters, independent initial phases |8|20,575|203|1|yes|
| Bodies, independent initial phases |8|16,776|168|1|yes|
| Complete chapters, independent initial phases |13|3,991,532|171,267|4|yes|
| Bodies, independent initial phases |13|3,384,251|157,056|4|yes|

Every fixed-start search and both q8 independent-start searches return exactly the all-zero vector. The two complete q13 independent-start searches return the all-zero vector and three rotations of a one-nonzero vector (nonzero value 15). Full: exceptional phases 0,1,12; bodies: 5,6,7, relative to the longest chapter's phase zero. This supersedes the initial 2,000,025-call capped V8 attempt, which found only three of the four full-frame survivors. The native port reproduces the fixed-start q13 search counts exactly; the local input's rune-index FNV32 is fe63c4ed, with all nine individual chapter checksums matched to the repository. All eight native output leaves independently pass the direct rune-level DP against the repository input. Native search wall times 1.86/1.67 s, excluding compilation and pair preprocessing. The q8 result independently follows from the prior [113 exact page-free native vectors](lp2-allsecret-period8-ftransparent-original-exclusion.md), filtered at the nine fixed chapter starts (41 after first, 1 after second). The direct new search does not depend on that prior output. The earlier uninterrupted pp40–55 q13 search had 10,418 survivors and does not contradict the nine-frame reset constraint.

Four separate 29^q exhaustive rune-by-rune DP controls, q2/q3 and fixed/free starts, match the complete optimized leaf sets (378, 358, 10,198, 13,191 respectively); distinct random two-secret-alphabet planted senders with q8/q13 and both nonzero/F events retain their true forbidden vector. These are exact feasibility controls, not unknown-key recovery. The separate blind receiver previously achieved full oracle parity on four literary plants; exact legality now explains why the original common-clock receiver was negative.

## Stronger arbitrary-chart original prose obstruction

When the only vector is zero, the nonzero-consuming phase at each original position is determined by the count of earlier nonzero ciphertext symbols since its frame start. For a fixed plaintext non-F symbol, any bijective chart selects precisely one nonzero ciphertext bin at each phase. Therefore the maximum count of any one plaintext non-F is at most the sum of phase-histogram largest bins. For top-k non-F use top-k bins; grant independent arbitrary phase charts to each chapter for a looser bound (sum separate chapter bounds). The latter bound is invariant under arbitrary per-chapter phase shifts, since such a shift only permutes phase histograms.

| Original scope | q | Shared top-1 / top-2 | Even chapter-private top-1 / top-2 | Lowest top-1 / top-2 across donor windows |
|---|---:|---:|---:|---:|
| Complete 12,956 |8|560 / 1105|816 / 1544|1408 / 2441|
| Complete 12,956 |13|600 / 1169|941 / 1772|1408 / 2441|
| Bodies 12,833 |8|569 / 1103|805 / 1527|1393 / 2416|
| Bodies 12,833 |13|611 / 1189|934 / 1757|1393 / 2416|

The reference envelope exhausts every contiguous length-matched GP-native window of Emerson/Shakespeare/Gibran under the same normalization as the earlier receiver: 562,060 windows for complete chapters, 562,429 for bodies. All fail even the chapter-private top-1 bound; comparison includes only non-F bins. No language score is required. This is an exclusion of those finite native reference registers, not a universal theorem about all possible plaintexts. The shared-forbidden-vector assumption remains essential even for private charts. Independent per-chapter forbidden vectors, variable clock lengths, non-bijective chart laws, and transport/reordering remain outside the completed result. All-zero vectors alone do not mean ciphertext cannot encode an intermediate high-entropy representation.

## Independent q13 starts: sparse-vector native-language obstruction

For the nonzero survivors, normalize the rotation to Z=[15,0,...,0] and grant **every** chapter all 13 initial phases. This includes every surviving original configuration. In the two-shared-alphabet additive model, the twelve ordinary phase charts equal one F-preserving monoalphabet; the exceptional consuming phase changes at most ceil(n/13) rune positions per chapter. The full/body baseline top-two counts 974/966 plus maximum edits 1002/991 give rigorous top-two ceilings 1976/1957, below every donor's non-F top-two minimum 2441/2416.

For arbitrary bijective charts with the shared forbidden vector, a stronger general top-one bound needs no common A/B. Compute exact forward/backward phase support at every rune, then for each phase j and eligible ciphertext label c, run a max-count DP for consuming (j,c) transitions, admitting both legal visible-F events. Take the largest count over c at each phase, sum over phases and chapters. This deliberately permits different optimal paths for each phase and chapter, so is a safe upper bound, not necessarily jointly attained. Candidate bins whose reachable occurrence count cannot exceed the current maximum are skipped by a necessary upper bound. Every non-F plaintext label has exactly one ciphertext preimage per chart, so this relaxation covers all arbitrary charts. For the sparse q13 pattern the full/body caps are **1079/1072**, versus minima 1408/1393. The all-zero survivor has smaller caps 941/934. Thus even q13 arbitrary independent chapter starts and chapter-private phase charts (sharing the forbidden-label vector) exclude every tested native window. No assumption of common alphabets is needed.

**Disposition:** retire this exact common forbidden-label periodic family for q8/q13, both whole chapters and black bodies, including arbitrary independent chapter starts, arbitrary full phase substitution tables and private charts with common forbidden labels. A new source-selected operation is needed. This strengthens the all-secret direct additive/F-hold results without repeating their key searches.

[CommonJS search, toy controls and frequency program](../sims/lp2_shared_alphabets_forbidden_clock_sft.cjs) · [raw complete and capped outputs, input hashes](lp2-shared-alphabets-forbidden-clock-output.json). Core executed in connected V8; [native C++20 q13 port](../sims/lp2_shared_alphabets_forbidden_clock_native.cpp) compiled and executed locally. Standalone Node wrapper not independently run. Native input consists of nine base29 digit lines in canonical chapter order. Compile with C++20 and run `free` or `free body` on stdin. `solve(raw,q,maxTests,free,body)`, `selfTest()`, and `frequency(raw,donorStrings)` and `sparseFrequency(raw)` are exported.
