# LP2 printed-boundary stopping-rule obstruction

**Decision (Agent44, 25 November 2026).** The native length-order failure motivates H-decoy, but no exact deterministic word-reset rule of the tested observed-prefix state can regenerate the printed spaces. This is an exploratory structural constraint, not a decryption or an authenticated cipher selection. The signed words/numbers instruction and GP prime weights motivate sum/product states, not a specific stopping operator.

## Original-data test

The canonical unknown tape and image-corrected transcription match at 12,956 runes and 2,896 groups. Label every rune-end as continue or stop according to the printed group, resetting the prefix at every observed group start. Exclude punctuation-forced stops (dot or ampersand), nine chapter endings and physical page-end sites: 12739 decisions remain, including 2711 ordinary stops. Page carries are preserved. For each state, any deterministic stop/continue predicate must give the same output at every occurrence. With observed prefix history granted by an oracle, the exact minimum label disagreement is sum over states of min(continue count, stop count). This is a lower bound on exceptions, not a claimed autonomous decoder or an entropy estimate. Allow independent predicates per chapter for a more generous rival.

| State | Whole-book minimum exceptions | Independent chapter minimum |
|---|---:|---:|
| length | 2692 | 2667 |
| primeSum | 2575 | 1943 |
| lengthSum | 2194 | 1338 |
| sumLengthLast | 917 | 298 |
| primeProduct | 714 | 339 |
| prefix | 493 | 214 |
| prefixLookahead | 115 | 36 |
| prefixPreviousRune | 125 | 37 |
| prefixBoth | 11 | 2 |

Exact GP-prime product uniquely encodes the entire unordered prefix by prime factorization; ordered prefix subsumes any position-dependent reset calculation on its symbols, including any alphabet relabeling, hidden additive weights, modulus or deterministic recurrence initialized identically per chapter. Adding the rune immediately before the group start and the immediate lookahead still leaves 2 unavoidable contradictions even with private chapter predicates. The explicit conflicting zero-based rune sites and states are in the JSON. 27 rune types occur at ordinary singleton stops; 2611 longer groups have a continuing singleton prefix of one of these types (page-end exclusions applied).

The familiar modulus candidates 29,59,60,83,1033,3301 are included descriptively; all modulo-prime-sum predicates already fail by the exact-sum superset. No modulus search can evade an exact identical-sum collision.

Positive implementation control: on the same authentic rune tape, construct new boundaries by stopping when the GP-prime running sum first reaches 200, reset at each generated stop, force terminal cut. All 12955 decisions are consistent (zero exceptions). This validates the state-count calculation, not the historical mechanism.

## Consequence and limitations

Reject a standalone memoryless observed-prefix stopping rule, even if its numerical predicate is unrestricted and its state initialized privately by chapter. A true decoder could still depend on plaintext, changing external state, earlier context, longer lookahead, printed position, or a separate side-information stream; those are not covered. No authentic segmentation or plaintext recovered. Do not mistake a near-saturated context table for a key: the richest model has 12708 states for 12739 observations. No further arbitrary context expansion absent a source-selected rule.

Reproduce: `node sims/lp2_observed_prefix_boundary_sft.cjs`. Core computation executed in connected V8; standalone Node wrapper not separately run. Raw `im-results/lp2-observed-prefix-boundary-output.json`.
