# LP2 prime-minus-one followed by an arbitrary outer permutation (Agent45, #2657)

## Decision

Reject this fixed model for intact printed long groups in the frozen 29,060-form GP-normalized TextBlob register. No LP2 plaintext or original key is recovered. The model differs from conjugating prime arithmetic by a permutation (#1492).

Use C=π(P+s_j mod29) for P≠0, s_j=(prime_j−1) mod29, j starting at the first prime in each chapter; literal F emits π(0) and does not consume. π is one arbitrary GP29 bijection. No alternate origins, resets, signs or inner substitutions. Authentic p56 with identity π replays 85/85.

## Exact original obstruction

For every marker z=π(0), set g=π⁻¹, g(z)=0. For an anchor beginning at physical offset o, let M count z in its prefix. The active prime index j lies in [o−M,o]. For every equal-length dictionary word and every such j, impose g(c)=p+s_j mod29 for each consuming rune, and require c=z for a literal F hold; update j only on consumption. Enforce partial injectivity in both directions. Consuming zero internal ciphertext is allowed. Every genuine word in the register must generate a candidate. For two disjoint anchors with physical gap G and M marker runes between their boundaries, the difference between right start and left end active clock must be between G−M and G. Joining candidates with these constraints is a necessary relaxation: intervening words need not be lexical or even have legal inverse paths.

The original transcription is parsed into 2,896 groups, 12,956 runes and checked against the canonical page corpus. Normalization is greedy GP tokenization with QU→CW, V→U, K/Q→C, Z→S, ING→NG, IO→IA. The first up to eight groups of length ≥9 ending inside each fixed training span are selected without plaintext. The p0–2 span is 729 runes, p40–53 span first 600 runes.

- p0–2: eight anchors at chapter offsets 23,62,245,304,397,425,575,630. Only z=2,9,17 have nonempty individual domains for all eight; each complete join fails after two visited DFS nodes. Zero maps; no caps.
- p40–53: a single 12-rune anchor at chapter offset 31 (local group 8, zero-based; [16,4,22,6,28,9,25,17,1,18,17,1]) has zero candidates for all 29 markers, every possible start, and all 767 matching-length dictionary forms. No joins needed. Thus even private permutations for the two chapters cannot repair these particular lexical obstructions.

## Blind constructive inverse on native controls

Generate independent deterministic random outer permutations (xorshift32 seed 0x45d2657) for WELCOME and first KOAN. Neither target's vocabulary is added to the lexicon. Fit uses first 68%, rounded down to a complete group boundary. Anchor search retains one correct partial inverse and one anchor clock schedule in each case. Enumerate ALL completions of missing rows. For each completion, exact trigram Viterbi uses state (total number of holds, previous two hold bits); the previous two plaintext values follow from g, the ciphertext and those bits. The anchor start/end clocks constrain feasible hold counts via all marker-prefix bounds. All legal paths within these bounds are scored, without requiring every fitted word to be lexical. The n-gram model excludes the target native section, uses .5 unigram smoothing and 10 pseudo-count backoff at both higher orders. Freeze best complete map and fit-boundary state, remove all anchor constraints on suffix, then decode it exactly by Viterbi. Check forward replay.

| Control | Marker | Fit / suffix | Known rows | Completions / legal | Full key | Fit | Withheld |
|---|---:|---:|---:|---:|---:|---:|---:|
| WELCOME | 28 | 350 / 165 | 22 | 5,040 / 1,376 | 29/29 | 350/350 | 165/165 |
| First KOAN | 10 | 530 / 250 | 20 | 362,880 / 27,814 | 29/29 | 530/530 | 250/250 |

The standalone JS execution selected unique best maps. Fit LL −914.480810875 vs runner-up −965.422352723; −1237.379357854 vs −1335.474333292, respectively. Frozen suffix LL −404.281288637 and −650.770520230. All plaintext and replay exact. The earlier local compiled DP had the same legal counts, winner maps, suffix scores and recovery, with slightly different initial-context scoring; the JS outputs are canonical here.

## Reproduce

`node sims/lp2_outer_prime_permutation_anchor_sft.cjs` and `node sims/lp2_outer_prime_permutation_complete_sft.cjs`. Exact outputs: [anchors](lp2-outer-prime-permutation-anchor-output.json), [completion](lp2-outer-prime-permutation-complete-output.json). Both computations executed in connected JS against repository resource bytes; wrapper packaging is not a remote CI claim.

This is an all-permutation conditional finite-register negative, not a language-independent impossibility. Changed word breaks, different spelling/register, nonzero chapter prime origins, different layer order and clocks are outside scope; there is no justification to add them to rescue #2657.
