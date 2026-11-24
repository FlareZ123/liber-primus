# Unchanged-clock collision-repair crib recovery

**Agent 9, 24 November 2026. Conditional original decision; no recovered unknown LP2 plaintext.**

## Distinct model and solve path

The unusually low original adjacent-doublet count motivates a hypothetical repeat repair stage after a historical GP29 periodic cipher. Unlike the earlier [one-redraw model](lp2-period8-collision-redraw-key-recovery.md), the key clock never advances an extra time. Unlike the [one-target repair bound](lp2-allsecret-single-target-doublet-repair-original-gate.md), the replacement destination can be any nonrepeat symbol and the underlying precursor need not be uniform.

At plaintext F (index0), emit literal F and hold the key clock; do not repair it. At other symbols, calculate U=(P+K_j) mod29 and advance once. When U equals the previous emitted ciphertext, it may be replaced by any distinct symbol; otherwise emit U. The decoder admits every such replacement, regardless of policy. This is a conditional many-to-one relation, not a complete lossless codec without a recoverable repair mask or equivalent redundancy.

A player could try the repeated formulas from LP1 as cribs, recover the historically observed q8/q13 key despite unknown repairs, then use it on an independent continuation. The source does not authenticate either formula reuse or the repair layer.

## Exact original decision

A known non-F plaintext rune aligned to C intersects its phase's key domain with {C−P, Cprev−P} mod29 (the second option only if C≠Cprev). Literal plaintext F requires C=0, holds the clock and constrains no key symbol. Because known plaintext fixes all phase advances and emitted predecessors are observed, independent domain intersections are necessary and sufficient for the crib. Enumerate the Cartesian product of all surviving key domains. Phase zero at crib start is without loss of generality up to rotation.

The six maximal repeated LP1 spans ≥20 have lengths 37,29,42,41,22,20. Their exact runes are in the output. Both q8/q13 were tested at every possible start of the 12,956-rune original stream, continuously across page and printed-group boundaries. Across **155,102** crib/period/start combinations, **zero** compatible keys remain. This grants arbitrary collision replacements, not just a guessed fixed substitute map. No candidate reaches the held-out continuation stage. No original language score or recovered plaintext.

## Constructive recovery on native controls

Two independent target sections (KOAN1 and LOSS OF DIVINITY) each supply their longest repeated phrase as crib. Three deterministic hidden key plants per period/section use an 0.8 collision replacement probability with uniform nonrepeat destinations. The key search stops at the first crib's end; the following 150 runes are withheld from key selection, and the entire target section is excluded from trigram training. Exact fixed-key Viterbi then enumerates literal F, unmodified non-F and collision repair choices, using the synthetic 0.8 probability and target-excluded smoothed native GP29 trigram model. Chosen paths pass exact conditional forward-replay assertions.

| Metric | Result |
|---|---:|
| True rotated key/start retained | 12/12 |
| Unique prefix key/start | 9/12 |
| Blind unique-key held-out recovery | 1,311/1,350 (97.11%) |
| Ambiguous prefix cases | 3/12, 32 candidates each |
| Truth-assisted decoder diagnostic on ambiguous cases | 434/450 (96.44%) |

The three ambiguous period13 LOSS controls explicitly select the known planted key for the diagnostic; this is not blind recovery. The residual errors demonstrate why the repair mask and literal-F ambiguity cannot be assumed recoverable from key alone. Exact replay uses explicit replacement choices and verifies model compatibility, not independent recovery of the author's side state.

## Decision and limits

Retire the tested continuous q8/q13 repeated-formula receivers, including all allowed repair destinations. This is not a universal exclusion of either period, other plaintext, independent internal resets, arbitrary changes at noncollision positions, or alternate F semantics. The prior anti-repeat evidence alone does not select this operation. A new authentic key/state selector or a different independently motivated receiver is needed; do not shorten the cribs or tune the synthetic repair probability.

Run `node sims/lp2_fixedclock_collision_repair_crib_sft.cjs` from the repository root. [Executed output](lp2-fixedclock-collision-repair-crib-output.json) includes exact input blob IDs, original counts, control plaintext truth, candidate paths and repair flags. Executed in connected JavaScript against exact repository blobs; Windows CI was not independently run.
