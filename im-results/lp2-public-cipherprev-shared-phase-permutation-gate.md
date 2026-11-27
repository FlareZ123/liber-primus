# Public ciphertext predecessor with a shared phase alphabet: exact all-key collision bound

## Research decision

Consider the length-preserving receiver

`C[t] = S[phase(t)](R[C[t-1]](P[t]))`

on each physical page, where the first printed rune is a public IV, the preceding **printed ciphertext** rune selects a secret GP29 permutation R, and a second GP29 permutation S is shared across all 29 predecessor states at each clock phase. The outer family includes ordinary additive shifts as a strict subset. This is a mathematical extension of fixed-phase substitution and ciphertext-predecessor models; **no original clue authenticates this architecture**. It is relevant because public ciphertext feedback can change output concentration, which ordinary phase-only models cannot. The model is bijective for every known pair of maps and uses no printed word lengths.

**Decision:** for the frozen literary histogram envelope, even arbitrary pre-encipherment permutation of the donor runes cannot rescue q=1,8,13,23, either traversal direction and all three tested physical clocks, with or without literal F bypass. The q=29 ordinary-consuming variant also fails all three **forward** clocks after the phase-consistency bound; q=29 F-bypass under arbitrary transport and reverse q=29 arbitrary maps have not been closed. Fixed additive outer shifts fail every tested period, direction and clock. No unknown plaintext or key has been recovered.

## Exact statistic and upper bound

Let H[a,r,x] count the ciphertext symbol x when the public predecessor is r and phase is a. Each phase's inverse S relabels its 29 columns identically for every predecessor row. Undoing these shared phase maps leaves, for each r, a single unknown permutation R[r]; that permutation cannot change the number of equal pairs within the row. Thus the statistic is

`J = sum_(r,p) choose(n[r,p],2)`,

where n counts the plaintext runes assigned to that predecessor row.

The within-phase term is invariant: W = sum_(a,r,x) choose(H[a,r,x],2). For every pair a<b, the cross-phase contribution has a 29x29 integer assignment matrix

`M_ab[x,y] = sum_r H[a,r,x] H[b,r,y]`.

The two phase alphabets induce a bijective column matching. Independently maximizing each pair gives an all-key upper bound U = W + sum_ab max_assignment(M_ab). For outer additive shifts, replace max_assignment by max over the 29 cyclic diagonals. Pair choices need not be mutually consistent, so these are conservative upper bounds. All assignments are solved exactly with feasible integer duals and zero primal/dual gap. The implementation checks 64 small exhaustive assignment oracles.

The F-bypass relaxation permits P=F to print C=F without applying either permutation; the **public phase still advances**. Other plaintexts may also produce ciphertext F. Drop the held events when evaluating J, but retain every original event for U. Nonnegative counts make U a valid upper bound for every hold mask, with no need to identify it. This is a physical-clock bypass, not the historical LP1/p56 consuming-clock hold.

## Exact finite native lower bound, without plaintext order

There are 12,956 original runes on 55 nonempty physical pages; the public-IV convention leaves 12,901 actual transitions. For any native reference histogram h, permit arbitrary deletion of 55 IV positions. For F bypass, additionally remove every plaintext F before deleting up to 55 other symbols. Even granting the remaining n[p] occurrences of each rune independently free distribution over all 29 predecessor rows, convexity gives

`f(n) = 29*b*(b-1)/2 + b*r, b=floor(n/29), r=n mod29`.

The lower bound is sum_p f(n[p]). Removing the IV count by leveling the largest counts minimizes this convex symmetric sum; any redistribution of the fixed remaining total away from this majorization minimum cannot lower it. This grants arbitrary transport across physical pages and predecessors, and ignores actual row capacities, so is weaker than a full ordered-text constraint. For F bypass it also grants all possible printed-F hold masks without using their actual positions.

The existing GP normalization from `sims/lp2_gp29_plainprev_escape_parallelpage_beam_sft.cjs` (native longest token, QU→CW, V→U, K/Q→C, Z→S, ING/IO special handling, Gutenberg wrapper removed when present) yields 532,721 consecutive windows of length 12,956:

| Register | Windows | Ordinary minimum J | Physical F-bypass minimum J |
|---|---:|---:|---:|
| Gibran | 34,674 | 162,279 | 159,874 |
| Shakespeare | 204,151 | 156,719 | 155,755 |
| Emerson | 293,896 | 164,864 | 162,758 |
| Combined floor | 532,721 | **156,719** | **155,755** |

## Original result

Clock conventions: continuous printed positions (including page IVs), page-local printed positions, and a continuous transition-only clock excluding the page IVs (still advancing at every literal F). Reverse traversal reverses the page sequence and each page's rune sequence; the first rune in traversal is the IV. A common phase origin is immaterial with arbitrary phase maps.

The following are maxima of the pairwise upper bounds over both directions and all three clocks, not fitted keys.

| q | Arbitrary outer phase maps U | Additive outer shifts U | Ordinary / F-bypass decision, arbitrary maps |
|---:|---:|---:|---|
| 1 | 101,478 | 101,478 | excluded / excluded |
| 8 | 115,552 | 102,937 | excluded / excluded |
| 13 | 127,096 | 105,090 | excluded / excluded |
| 23 | 150,114 | 109,797 | excluded / excluded |
| 29 | 163,278 | 112,201 | pairwise bound insufficient / insufficient |

The additive outer-shift family is excluded for all 30 tested direction/period/clock cases under both plaintext conventions.

### q=29: enforce phase consistency without enumerating keys

The initial independent pair relaxation leaves q=29 open. Let s_ab(x,y) be the nonnegative integer slack from a dual-optimal minimum assignment on -M_ab. For a globally consistent alignment of every phase column, the sum S of these slacks across all aligned labels and all unordered phase pairs equals U-J. Define for each unordered endpoint pair a,b:

`T_ab(x,y)=sum_(c != a,b) min_z [s_ac(x,z)+s_bc(y,z)]`.

For any fixed globally aligned labels, the actual third-phase column is one candidate z, hence the sum of T over aligned labels is at most 2(q-2) times S: each edge appears exactly twice for each third phase. Solve each T_ab independently by exact minimum assignment, subtract the dual row/column potentials to obtain a new nonnegative residual slack, and iterate the same inequality. If m_i is the sum of assignment minima at iteration i and D=2(q-2), the certified deficit is at least

`m_1/D + m_2/D^2 + ... + m_i/D^i`.

Because J is integral, subtract its ceiling from U. All rational numerators, denominators and integer costs were below 2^53 in the executed four-iteration gate, and every assignment checked primal/dual equality and dual nonnegativity.

| Forward q=29 clock | Initial U | Four-iteration U | Ordinary floor gap | F-bypass floor gap |
|---|---:|---:|---:|---:|
| continuous | 163,042 | 156,460 | 259 | -705 |
| page | 162,862 | 156,294 | 425 | -539 |
| transition-only | 163,121 | 156,577 | 142 | -822 |

A positive gap is an exact finite-reference exclusion; negative gap means the relaxation has not excluded that model. These results close the three forward ordinary q=29 clocks even with arbitrary donor transport. Reverse q=29 phase consistency has not been executed here.

A separate exact ordered-donor gate grants unrelated arbitrary maps at every (phase,predecessor) stratum. For each of the 532,721 direct native alignments and each forward q=29 clock, an ordinary map must preserve equality both ways within each stratum; a bypassed plaintext F must land on original C=F, and non-F pairs must form a partial bijection. Zero ordinary or physical F-bypass candidates survive any forward clock. This latter gate excludes aligned contiguous native reuse only, not arbitrary transport.

## Native controls and reproducibility

Six original-geometry plants (three literary donors, q8/q13/q23, ordinary and F-fixed bijections) each invert all 12,901 transitions exactly under the planted R/S maps; their actual J lies between the corresponding lower and upper bounds. The independent q29 ordinary plant inverts all 12,901 transitions; actual J=174,399, four-iteration U=199,299, so the stronger certificate retains it. These are implementation/bound controls, not blind key-recovery successes. The original is not being identified as one of the donors.

- [Base SFT](../sims/lp2_public_cipherprev_shared_phase_permutation_sft.cjs); [executed output and input blobs](lp2-public-cipherprev-shared-phase-permutation-output.json).
- [Iterative q29 SFT](../sims/lp2_public_cipherprev_q29_phase_consistency_sft.cjs); [executed forward result](lp2-public-cipherprev-q29-forward-output.json).
- Reproduce from repository root with Node.js: `node sims/lp2_public_cipherprev_shared_phase_permutation_sft.cjs` and `node sims/lp2_public_cipherprev_q29_phase_consistency_sft.cjs`. The second defaults to both directions; the published output was run with `run(raw,{directions:[1],iterations:4})`.

## Remaining causal path

Retire blind key fitting for the excluded receiver under the frozen reference envelope. This evidence does not exclude arbitrary new prose, chapter-private maps, arbitrary state-dependent permutations, phase permutation **before** the predecessor-dependent map, literal F that also pauses a hidden phase clock, dependence on previous plaintext or a larger hidden state, or all other periods. The q29 physical bypass transport and reverse arbitrary-map branch are mathematical residuals, not authenticated hypotheses deserving automatically expanded search. There is no LP2 key, recovered unknown plaintext, or source-selected next action. An actual source-selected state update or original plaintext anchor is a materially stronger next research input than multiplying unmotivated feedback laws.
