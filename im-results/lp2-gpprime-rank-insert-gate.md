# GP-prime adaptive rank insertion: original-data gate

Agent 7 — 2026-11-27. Related: [time-dependent insertion](lp2-prime-rank-insert-recency-gate.md). This is a candidate mechanism, not an authenticated Cicada instruction.

For a private bijection S: plaintext rune -> rank and arbitrary initial permutation A of GP29, emit C=A[S(P)], remove C and insert it at R(X)=(GPprime(X)-1) mod 29, with X=C or P. The receiver reverses the same update. In the transparent-F extension P=0 emits literal C=0 without changing A. The motivation is the authenticated prime/totient vocabulary, GP chart and circumference language; none selects this list update.

## Ordinary gate

Immediate repeats imply S(P_i)=R(X_{i-1}); nonrepeats forbid that assignment. In each known-donor alignment the insertion ranks are known, so propagate a bitset of possible positions per ciphertext glyph. At each symbol intersect the selected glyph domain with the static S domain for the aligned plaintext rune, update the position domains, complete the rank assignment and replay initial slots. This refinement recovered both exact secret permutations on four independently keyed full-length controls (two disjoint Gibran windows reused across roles, 51,824 runes total). Earlier rank-completion search hit caps on three controls; the refined solver does not. This is known-donor inversion, not ciphertext-only key recovery.

All 35,129 full-book windows and 45,077 p40–53 windows of the normalized Gibran donor fail the positive repeat anchor for both roles. For ciphertext-driven insertion, the public insertion schedule also permits all-initial-order position-domain bounds independent of a proposed plaintext:

| Scope | Top-two rank counts at most | Minimum donor top-two |
|---|---:|---:|
| Whole book | 1097 | 2555 |
| p40–53, carried state | 256 | 563 |
| p40–53, independent reset | 337 | 563 |

The position domains synchronize at index 372 on whole-book input and 203 on the reset chapter. The fixed private rank chart only permutes frequencies. Canonical A with all 812 affine S per role, fitted p0–2 and scored on carried p40–53, produces nonprose; best held scores -4.9836 (C-driven), -5.0478 (P-driven). Exact encryption replay is necessary but not evidence for the key.

## Transparent F, ciphertext-driven, all private charts and initial permutations

Fix f=S(F). Partition the relaxed state by the exact rank z of ciphertext glyph 0. Initialize each possible z, with other glyph domains excluding z. A visible zero may hold (output rank f) or consume at z if z != f. A nonzero selects a rank different from f; split the selected rank domain at z, so the new position of zero is exact. Apply singleton all-different propagation before and after updating rank domains; merge states only within the same z and fixed f, unioning domains and taking the maximum of each accumulated rank count. Every concrete path is included. Individual count maxima need not share a path, so their two largest sum is a conservative upper bound.

Two independent 3008-rune F controls retain all 174,464 actual glyph positions and correct rank counts under this relaxation. This is containment validation, not key recovery.

On the whole book, 28 of 29 fixed f choices become impossible by offset 534 at latest. Only f=27 survives, one terminal zero-position state with singleton domains, and top-two count <=1126 (donor minimum 2555). On independently reset p40–53, 28 choices die by offset 505 at latest; f=27 survives with top-two <=345 (donor minimum 563). Therefore the C-driven receiver cannot match any tested native donor frequency profile under any initial permutation, rank chart or transparent-F decisions. The relaxed surviving path need not be a concrete path. The P-driven transparent-F arbitrary-chart family is not excluded here. Do not extend finite-donor comparisons to universal claims about English or all adaptive alphabets.

## Ciphertext-only partial-chart pilot

Forward search keeps a partial ciphertext list and a private P->rank bijection. On a seen glyph the selected rank is known; on a new glyph it branches over unbound positions. A new rank assignment branches over unused plaintext runes. Reverse search branches over P satisfying R(P)=the current glyph position, then reverses insertion to S(P). Transparent F adds the literal-zero hold. Use a 512-state global beam scored by direction-specific smoothed trigram probabilities trained on 217,106 Shakespeare, 321,327 Emerson and 2,979 native solved runes; Gibran plants withheld.

Two independently keyed 512-rune plants (ordinary and transparent-F) fail all 12 variants (both directions, known chart, unknown chart, unknown chart with 32 true edge runes). Unseeded truth is pruned within 1–8 symbols; full-forward best accuracies 22–38/512, reverse searches die between 33 and 218 symbols. Crib-only variants die at 5–13 symbols because tied unresolved key branches are pruned, despite every retained prefix agreeing with the crib until death. No original-data beam run was attempted; the pilot has no demonstrated ciphertext-only inversion capability. It does not exclude this receiver.

- [Pilot SFT](../sims/lp2_gpprime_plain_rank_beam_sft.cjs)
- [Pilot output](lp2-gpprime-plain-rank-beam-output.json)

The Gibran start marker is absent in the pinned input; an initial pilot invocation mistakenly sliced at -1 and failed before search. Corrected to the same conditional normalization as the other SFTs. The saved code and output reflect the completed corrected run. Further blind search needs actual key/crib constraints or diversity-aware exact propagation, rather than wider unstructured beams.

## Does the secret plaintext-dependent state forget its initial list?

For a fixed chart the move is T(j)=R(S^-1(j)). Despite duplicate targets in T, applying the observed ciphertext does not establish synchronization. On three 3008-rune independent literary controls using affine charts (1,0), (7,13), (17,4), zero of 96 independently shuffled starting trajectories coalesce with the canonical trajectory; canonical initialization decodes 128/116/112 correct runes respectively, with errors through the final rune. Four fixed original charts, 32 initial lists each, have zero observed coalescences across all 12,956 runes. The sound per-glyph rank-domain relaxation unions exact moves over every allowed selected position, then applies singleton all-different propagation. It retains every true rank (261,696 control checks, 1,502,896 original checks), but every original selected rank remains ambiguous; domains average approximately 28.79 positions each. Noninjectivity alone does not imply useful synchronization. This is not a proof that no initial lists can coalesce, and not an all-key exclusion.

- [Synchronization SFT](../sims/lp2_gpprime_plain_rank_sync_sft.cjs)
- [Output](lp2-gpprime-plain-rank-sync-output.json)

The independently proposed opening title EPIPHANY SEEKS (GP EPIPHANY SEECS) gives plaintext indices [18,13,10,13,8,24,9,26,15,18,18,5,15]. Against original red13, with canonical or reversed initial list and either role, its repeated P at offset3 requires a different rank from offset1. Thus all four fixed initial-list hypotheses are inconsistent with this conditional crib, even with an arbitrary static chart. The title is not authenticated plaintext, and arbitrary initial lists are outside this observation.

## Constructive exact lexical inverse (Agent 2)

The partial-list representation permits **exact search for a fixed rank chart without guessing unseen glyph positions**. At a forward step a seen ciphertext glyph fixes its current rank and hence plaintext; an unseen glyph must occupy the unbound position S(P). Bind the glyph only when selected, then move it to R(P). Reverse search instead selects lexical P compatible with current rank R(P), undoing the move to S(P). A length-indexed trie constrains each complete printed group; transparent plaintext F introduces the literal-zero hold branch. Unassigned positions at an edge can be completed arbitrarily. The finite lexical register is 32,655 distinct GP forms constructed from pinned Shakespeare, Emerson, Gibran, Blake, Liber AL and TextBlob sources. This uses an intact printed-word assumption and no semantic phrase scoring.

Two dictionary-assembled controls with hidden affine rank charts (7,13) and (17,4), independent random lists per frame, ordinary and F-hold clocks respectively, each identify the unique correct chart out of all 812 on the first 76-rune frame. Three geometry-matched frames (76,71,68) per control then have unique exact plaintexts, all 430/430 runes recovered. These are artificial lexical controls, not natural prose. The enlarged-register native Gibran trials (known arbitrary chart, unknown list, reverse traversal, 134 and 132 runes) both cap at 4M nodes without completion, so native-scale recovery is not established by this recorded experiment. A smaller-register exploratory pilot had recovered both, but the enlarged-register result takes precedence.

Original window: zero-based printed group 1353, 76 runes, lengths 14,7,7,10,8,5,4,9,2,7,3. All 812 affine charts in **each** clock exhaust without completion or cap (403,132 ordinary nodes; 385,488 F-hold nodes; maximum depth 20). This excludes this plaintext-driven insertion schedule with an affine chart, arbitrary initial list, intact groups and all words from the finite register. Arbitrary nonaffine charts, out-of-register words, segmentation changes and state resets inside the frame are outside this conclusion.

- [Exact lexical SFT](../sims/lp2_gpprime_plain_rank_lexical_sft.cjs)
- [Raw output](lp2-gpprime-plain-rank-lexical-output.json)

## Short-crib arbitrary-chart recovery with unread continuation (Agent 2)

The fixed-chart restriction can be lifted when a genuine prefix is known. Keep 29 domains B[p] for the unknown rank chart and 29 domains D[c] for the list positions. Each known consuming pair intersects B[p] with D[c], applies the exact removal/insertion rank movement as a sound domain union, and fixes the selected glyph at R(p). Reverse traversal fixes the removal rank R(p) and allows insertion at B[p]. Singleton all-different propagation and alternating whole-prefix sweeps tighten the common chart. Branch on the smallest non-singleton domain of an observed plaintext rune. When all observed ranks are fixed, replay the partial list exactly; a compatible chart completion exists because all unobserved glyph slots remain exchangeable. The continuation search lazily binds unused chart labels and unseen glyphs under the lexical trie.

Two contiguous Gibran controls, random arbitrary charts and initial permutations, each 182 known prefix runes, recover one exact partial chart in one and three search nodes, respectively. The prefix exposes 24 ordinary consuming plaintext labels and 21 transparent-F labels. All remaining assignments are left unconstrained except bijectivity. The unread 241- and 243-rune continuations each have exactly one plaintext path (242 and 269 continuation nodes, no caps); all 484 runes and the true chart are retained. The vocabulary contains the donor's word forms, but the continuation sequence was not supplied to the solver. These are known-plaintext, not ciphertext-only, recovery controls. They show that a well-supported original crib could make this receiver decisively testable without assuming an affine chart. No such original 182-rune crib has been authenticated.

- [Crib continuation SFT](../sims/lp2_gpprime_plain_rank_crib_continuation_sft.cjs)
- [Raw output](lp2-gpprime-plain-rank-crib-continuation-output.json)

## Independent-word rank-pattern gate (Agent 2, 2026-11-27)

In the ordinary model, starting list A is immaterial to the equality pattern of a reset word: permuting A relabels every output symbol consistently. Encode a word's pattern by the distance to the previous occurrence of each output glyph (zero on first occurrence). This yields an exact per-word necessary condition for the shared secret chart S even when every word has its own initial list. For a tracked glyph at rank q, removal at s and insertion at d update q to q-[s<q]+[d<=q-[s<q]] when s differs from q. Immediate repeat/nonrepeat and gap bounds are inexpensive relaxations, but do not imply exact support.

Exploratory original tests chose 35 printed groups of length >=8 ranked by sum of reciprocal gaps to preceding equal glyphs (stable original index order). The shared arbitrary-chart unary relaxation was SAT but its concrete chart exactly supported only 19/35 independently initialized words. A full symbolic equality-pattern model was SAT for the first two groups (1476 and 1970, zero-based; arbitrary reset lists; lexical witnesses UNEMPLOYMENT and MALICIAUSLY, **not plaintext evidence**). The exact eight-group run timed out at 10 s; a shared two-step constraint relaxation admitted ordinary and F-hold charts with exact replay on only 3/8 and 2/8 respectively; three-step ordinary run timed out at 8 s. No original arbitrary-chart exclusion follows.

A decisive *control* shows why the independent-word objective is inadequate. Use the pinned TextBlob lexicon (29,060 GP forms; 17,635 with length 7–14) and Gibran's Prophet (12,353 words, fixed 2/3 source-position split). Among 1,078 eligible lengths, 175 are outside the lexicon and deliberately excluded. Encode 605 fit and 298 held words using one arbitrary planted chart and independently reset lists. All 406 single-transposition neighbors of the planted rank chart were exhaustively scored. **27 wrong charts have complete support on all 903 observed patterns.** A G/W swap changes the actual planted word patterns of 120 fit and 35 held words (1,214 runes total) despite complete lexical coverage. An AE/Y swap scores strictly higher than truth in both splits under both uniform log-mass and square-root-frequency-weighted log-mass; eight neighbors beat truth on uniform fit and six on weighted fit. This is a counterexample to chart identifiability from independent-word pattern coverage and to those scoring objectives, not merely a failed optimizer. Two-start annealing and soft-pattern pilots also failed to recover the planted key (0–1/29 chart entries correct despite 292–297/298 held pattern support).

Do not repeat independent-word-only key optimization. A credible continuation requires cross-word state constraints or a source-authenticated chart/crib; no source currently selects this insertion model. This experiment is ordinary-only for the exhaustive neighbor result and does not exclude a continuous GP-prime receiver, F-hold receiver, or arbitrary-reset receiver in general.

- [Exact neighbor SFT](../sims/lp2_gpprime_rank_wordpattern_neighbors_sft.cjs)
- [Exact output](lp2-gpprime-rank-wordpattern-neighbors-output.json)

The neighbor experiment was independently executed in local C++ and connected V8 on the pinned inputs; only the latter compact reproducer is committed. The exploratory SAT and optimizer results are local diagnostics, not separately reproduced in the repository.

## Reproduction

- [SFT](../sims/lp2_gpprime_rank_insert_sft.cjs)
- [Raw output](lp2-gpprime-rank-insert-output.json)

Executed the identical experiment function in connected V8 using repository-pinned inputs. No separate Node wrapper or CI execution claimed. No unknown LP2 plaintext, authenticated key or original destination recovered.
