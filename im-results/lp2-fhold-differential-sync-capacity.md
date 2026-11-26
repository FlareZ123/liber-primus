# Spacing-free all-key differential history exclusion with literal F holds

**Agent8, 26 November 2026.** Exact collision-capacity theorem and finite contiguous native-register original exclusion. No unknown LP2 plaintext or key recovered.

## Why this changes the F-held predecessor decision

The [existing literal-F-held feedback receiver](lp2-rank28-plainprev-parallelframe-beam.md#literal-f-held-page-state-extension-agent42-26-november) recovers planted native keys but has no complete legal original key; all exact arbitrary-key feasibility searches remain capped. The [earlier aligned source-crib inverse](lp2-plainprev-fhold-differential-source-crib.md) rejects literal known excerpts. The earlier [spacing-free synchronization theorem](lp2-plainprev-fhold-spacingfree-sync.md) uses direct ciphertext, not integrated differences.

A **key-independent differential synchronization bound** bypasses the huge permutation space, including the need to find any particular legal key. It applies to a strictly broader family: for P≠0,
\[
 C_i=C_{i-1}+H(Q_i,P_i)\pmod{29},
\]
where Q_i is the last m consuming plaintext runes, H is any deterministic stationary table (not necessarily additive in P, injective, or known), and literal P=0 emits C_i=0 and preserves Q_i. Grant arbitrary initial IV and state per physical page. The specific permutation law H(q,p)=p−K[q] is a special case. The family need not use printed word boundaries. No first-party source currently selects it.

**Theorem.** Two equal contiguous *F-free* plaintext sequences of length m+4, each contained inside a physical frame, force equal four-symbol ciphertext difference sequences at their aligned positions after the first m symbols. Indeed those m consuming symbols synchronize the complete plaintext-memory state, and the following four P and Q values are equal term by term. The physical preceding C cancels in D=C_i−C_{i-1}. A consuming transition may emit C=0; no assumption excludes it. Literal F outside the selected window and arbitrary initial state are immaterial. Every equal eligible plaintext pair must therefore contribute one equal original D-pair. For independent private tables, count pairs only within the same table scope. This is an exact necessary inequality, independent of a fitted language score and of the secret alphabet of *rows* (using the canonical GP29 additive output index).

## Original geometry and native-register sweep

Use all 55 nonempty unsolved physical pages of the canonical LP2 corpus (12,956 runes). First rune per page is the model's public IV, giving 12,901 emitting transitions. For each page, ignore its first m modeled differences; count all remaining overlapping four-difference tuples. For plaintext reference, take an equal number of emitting runes from contiguous source-native GP29 prose, split at exactly the same physical page emission lengths, and count only F-free (m+4)-tuples contained within one page. Equality-pair count is sum of binomial(count,2). Shared tables allow equality pairs across frames; page-private tables use each page's own capacity. No printed word positions or lexical scores enter.

Every possible donor start is evaluated by exact rolling count updates. The three long, independently pinned reference texts are Gibran (47,629 GP runes), Shakespeare (217,106), Emerson (306,851); Blake (2,001) contributes to smaller chapters. Normalize GP-native with ING/IO single glyphs and standard QU/V/K/Q/Z substitutions, dropping existing Gutenberg framing where present. The program directly recalculates minima and minimum violating-page witnesses; all input hashes are pinned.

### Whole-book contiguous native windows, m=1 through 4

Exactly 34,729 Gibran, 204,206 Shakespeare and 293,951 Emerson starts, **532,886** per memory length.

| Memory m | Original shared capacity | Lowest donor shared counts (G/S/E) | Original page-private total capacity | Lowest donor page-private totals (G/S/E) | Surviving starts, either scope |
|---:|---:|---:|---:|---:|---:|
| 1 | 99 | 8,147 / 5,324 / 3,256 | 1 | 530 / 192 / 139 | 0 |
| 2 | 98 | 3,311 / 2,421 / 1,226 | 1 | 292 / 109 / 64 | 0 |
| 3 | 97 | 1,624 / 1,290 / 417 | 1 | 177 / 65 / 26 | 0 |
| 4 | 97 | 806 / 643 / 169 | 1 | 99 / 22 / 8 | 0 |

Even if every physical page uses an arbitrary independent secret nonlinear table, **all contiguous book-length windows fail** at each memory length 1–4. This does not require discovering a permutation or assuming intact word boundaries.

### Chapter-private tables, independent donor windows (m=1)

| Physical chapter | Original shared D4 pairs | Minimum Gibran | Shakespeare | Emerson | Blake |
|---|---:|---:|---:|---:|---:|
| p0–2 | 0 | 9 | 3 | 1 | 9 |
| p3–7 | 0 | 46 | 13 | 9 | 56 |
| p8–14 | 2 | 117 | 38 | 35 | 120 |
| p15–22 | 5 | 157 | 51 | 48 | 182 |
| p23–26 | 0 | 31 | 9 | 7 | 42 |
| p27–32 | 0 | 88 | 23 | 19 | 79 |
| p33–39 | 2 | 112 | 35 | 31 | 112 |
| p40–53 | 2 | 411 | 265 | 167 | — |
| p54–55 | 1 | 0 | 0 | 0 | 0 |

The first eight chapters independently exclude all starts under m=1 even with unrelated chapter keys and unrelated donor choices. For arbitrary page-private tables within each chapter, p8–14, p15–22, p27–32, p33–39, p40–53 still independently exclude every start. The shorter p54–55 scope has survivors; this is not an all-key theorem against short terminal prose. On p40–53 the m=2 private table minima are31/1/3 versus zero original private pairs; m=3 and m=4 private scope has survivors. Shared chapter m=4 has five Emerson surviving starts. Full raw output retains these limits.

### Positive controls and interpretation

Twelve independently hidden stationary random permutation-row senders (3 donors × m=1..4) on actual 55-frame geometry, same native windows and original public IVs, cover literal holds and consuming ciphertext-zero alternatives. True branch inverse is verified exactly. All 12 satisfy shared and each page's necessary inequality; e.g. m=1 Gibran 9,886 plaintext pairs vs 11,250 ciphertext difference pairs. These are algebraic sender/replay controls, not blind unknown-key recovery.

**Decision:** the unresolved #3045 permutation feasibility is now an unpromising route to ordinary contiguous native GP prose; broader private nonlinear differential memories through four also fail all the full-book reference windows. Do not interpret a hypothetical legal key as native-language recovery. No need to extend the capped SAT search absent an independent different register, nonlocal ordering or state law. Arbitrary new plaintext, arbitrary within-book rearrangement, independent *per-page* donor choices, altered orthography, length changes, a secret output alphabet, memory>4, and clocks beyond the last consuming plaintext runes remain outside these particular exclusions. This is not an unconditional impossibility theorem for the fixed original cipher; it materially narrows the native-register explanation.

[Single-file CommonJS SFT](../sims/lp2_fhold_differential_sync_capacity_sft.cjs) · [complete machine output and source hashes](lp2-fhold-differential-sync-capacity-output.json). Core executed in connected V8; no independent Node/CI run claimed.


## Phase-dependent integrated additive receiver: exact trigram MAP on the terminal chapter (Director #3074, Agent25)

This is a **different phase-dependent law** from the stationary plaintext-memory theorem above. Freeze the original black body at p54 offset9 (223 runes) as training, then p55 (76 runes) as holdout. Initial physical predecessor C[-1]=0 and consuming phase t=0; continue both through the page boundary. For non-F plaintext, C[i]=C[i−1]+P[i]+K[t mod q] (mod29), then advance t; plaintext F emits literal zero and holds t. Its emitted zero becomes the next physical predecessor. Therefore at a consuming position, P[i]=(C[i]−C[i−1]−K[t]) mod29 must be nonzero. At a zero ciphertext position, the alternative hold emits F, even when the difference is nonzero. This is not the ordinary F-held receiver on the difference tape; its hold sites belong to the **original C**, not D.

### Exact finite training search

There are three visible zeros at p54 black-body offsets32,56,186. Enumerate all eight masks, independently for q8 and q13. For each mask derive exact non-F shift domains by removing every observed consuming D at its assigned phase. All masks have nonempty domains (q8 sizes8–15; q13 sizes14–20). No all-key feasibility contradiction follows.

Reuse the solved-native GP29 trigram log-likelihood convention with smoothing0.1, per-section training (no cross-section n-grams), and no printed spacing assumption. With a fixed mask, each trigram involves at most three consecutive consuming key phases, including contexts across holds. Assign its factor to the latest consuming phase. This gives a ring of triple potentials F_j(K[j−2],K[j−1],K[j]). Fix the first two variables, eliminate the remaining variables by max-plus dynamic programming on adjacent phase pairs, add the two wrap factors, and traceback. Thus each of the sixteen mask/period optimizations is globally optimal **for that fixed language model**, up to floating arithmetic. Store one maximizer per mask (no claim of enumerating all equal-score or suboptimal keys). For these frozen keys, evaluate every legal prefix mask and every holdout mask without changing K or resetting predecessor/clock. Exact forward replay validates each accepted path.

### Controls matched to the actual zero profile

Train with each native section withheld. Independently select a 299-rune native window and a random hidden key conditional only on the original 3+3 ciphertext-zero profile, with both actual held F and consuming zeros present. No selection by model score/recovery success.

| q | Native source | Prefix recovered | Holdout recovered | Top key rank | Native holdout nats/rune |
|---|---|---:|---:|---:|---:|
| 8 | WELCOME | 223/223 | 76/76 | 1 | −2.738272 |
| 8 | KOAN1 | 223/223 | 76/76 | 1 | −2.771186 |
| 13 | LOSS OF DIVINITY | 223/223 | 76/76 | 1 | −2.980449 |
| 13 | Second KOAN | 223/223 | 76/76 | 1 | −2.696808 |

All four hidden keys are recovered, 1,196/1,196 plaintext runes; authentic unintegrated LP1 WELCOME and second KOAN keys independently replay 515/515 and 319/319. Twelve small restricted-domain exhaustive searches match the cycle optimizer. The integrated controls are plants, not evidence that historical LP used integration.

### Original prediction

| Period | Exact best prefix nats/rune | Distinct per-mask optimum keys | Keys with any full legal path | Full paths among those keys | Top training key p55 score |
|---|---:|---:|---:|---:|---:|
| 8 | −3.419813 | 8 | 2 | 3 | no continuation |
| 13 | −3.277665 | 8 | 6 | 29 | −3.608960 |

The original prefix optima are below even the weakest matched native prefix (−2.924447). The q8 best retrospectively selected continuation among all legal frozen keys/paths is −3.665948; q13 is −3.608960. Both are substantially below all four true native holdouts (−2.980449 to −2.696808). No coherent running plaintext. The q13 winning candidate key is [6,22,6,12,16,20,18,12,18,11,16,6,12]; it is a statistical optimum, not a recovered historical key. Its selected p55 output begins EO IA U X X NG J H OE W S W J AE B J NG X G Y W D TH TH A F H P OE IA AE H OE I N E X … (GP tokens; no inferred spaces). Exact replay is automatic given a legal inverse.

**Decision:** close #3074 as a calibrated original prediction failure for this exact canonical integrated q8/q13 receiver. The fixed trigram model admits legal nonprose inverses; this is not a key-independent impossibility theorem, and unenumerated lower-ranked keys or different language registers remain mathematically possible. Do not expand this unselected state law or promote optimized fragments. No authentic key, unknown plaintext, or independent author selector. Core executed in connected V8; no standalone Node/Windows execution claimed.

[Exact cyclic MAP SFT](../sims/lp2_integrated_fhold_periodic_exact_map_sft.cjs) · [Original masks, complete candidate paths, and controls](lp2-integrated-fhold-periodic-exact-map-output.json).
