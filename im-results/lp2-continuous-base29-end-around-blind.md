# Whole-manuscript BASE29 end-around carry: exact compact-unit inverse

**Decision (Agent 1, 24 November 2026):** exact blind recovery of all four independent native planted keys; no readable original candidate or authentic key. This tests the circular-closure variant of the prior continuous unit-carry attack, not a newly authenticated cipher.

## Model and motivation

The 2013 BASE29 command makes a positional representation historically plausible; solved p57 mentions circumferences. A speculative literal interpretation is to treat the entire unresolved rune stream as one circular fixed-width integer, rather than reset carry at word boundaries or discard it at the manuscript edge. Let M=29^n−1, with canonical GP digits in reading order (also test the complete reversed order). Reserve the all-28 digit string as a fixed sentinel. For other strings define C = (s a P) mod M, s∈{+1,−1}, 1≤a≤3301 and gcd(a,M)=1. The inverse is unique. Unlike the prior [ordinary carry search](lp2-continuous-base29-unitcarry-blind.md), the incoming and outgoing carry are linked; there is no free starting state. Unlike the [word-wise cyclic model](lp2-word-end-around-carry-quadratic-original-gate.md), neither word length nor punctuation selects resets. The circumference clue does not uniquely specify this operation or the multiplier bound.

For Z=sC mod M, solve k=−Z M^−1 mod a and obtain P=(Z+kM)/a. This is an exact integer identity. For a=1, k=0. Score the top 144 GP digits of every admissible inverse using a trigram model (target native section excluded for each plant). Freeze the highest prefix score before evaluating 144 following digits. The full original ciphertext is necessary for cyclic closure; the holdout is a held-out language-score region, not a ciphertext-withheld prediction. Full re-encryption is checked as an implementation invariant.

## Executed results

| Plant | Signed unit | Recovered full runes | Withheld runes |
| --- | --- | ---: | ---: |
| WELCOME | +1033 | 515/515 | 144/144 |
| First KOAN (reverse) | −3299 | 780/780 | 144/144 |
| LOSS OF DIVINITY | −463 | 755/755 | 144/144 |
| Second KOAN (reverse) | +3301 | 319/319 | 144/144 |

All four keys were selected exactly. Native holdout scores range from −2.825687 to −2.530229 nats/rune.

| Original p0–55 | Admissible signed units | Frozen multiplier | Fit | Holdout | Full score |
| --- | ---: | ---: | ---: | ---: | ---: |
| Forward | 1,484 | +1769 | −3.583665 | −3.705320 | −3.747835 |
| Reverse | 1,484 | +2249 | −3.615389 | −3.735319 | −3.754849 |

Both inverses replay all 12,956 original runes; neither produces native prose. The winning original candidates have 472 and 455 adjacent repeats respectively, versus the 86 original events. This is compatible with a scrambling map undoing the repeat anomaly in one particular output but does not establish an intended cipher or prove that it can produce the observed anomaly on native plaintext. Original ciphertext holdout scores before inversion are −3.741654 / −3.715301.

The search enumerates every signed compact **unit**, not nonunits (which do not have a lossless inverse on the whole residue domain), arbitrary additive masks, larger units, alternative alphabet orders, or changing state. It is exact under the stated objective and bound; it is not an impossibility theorem for all possible language. The near-tied original prefix runners and nonprose heldout support rejecting this specific transfer. Do not widen its key domain or add a free carry without independent source evidence.

- [CommonJS reproducer](../sims/lp2_continuous_base29_end_around_blind_sft.cjs)
- [Executed output](lp2-continuous-base29-end-around-blind-output.json)

Executed directly in connected JavaScript runtime. No new CI workflow or run. No unknown LP2 plaintext; no change to the established-results synthesis.
