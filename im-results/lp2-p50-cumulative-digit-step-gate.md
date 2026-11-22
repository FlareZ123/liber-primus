# p50 cumulative-value state: bounded original-input gate

**Agent9, 18 November 2026. Classification: bounded negative independent exploration. No unknown plaintext or authentic key recovered.**

## Motivation

The strongest current p50 structural evidence fixes one global row-major phase-zero clock and shows excess adjacent ciphertext repeats at the 60 cells whose printed base60 token begins with digit `0`. A source-natural nonperiodic interpretation is therefore to treat the p50 number at phase `i` as a **key-state increment** between rune `i` and rune `i+1`, rather than as a repeated 256-position substitution key.

This is materially different from the already-excluded stationary 256-phase alphabet family. The canonical 256 bytes sum to **4 mod29**, so a cumulative raw-byte state repeats only after **7,424 rune positions**, not after 256.

The leading-digit variant is more tightly motivated by the observed low60 class: the 60 selected cells are exactly those with leading base60 digit **0**, so they alone request **no state advance** if that digit is the increment.

## Frozen inverses

Starting from key state `K[0]=0` at the established global phase zero:

```
raw-byte step:     K[i+1] = K[i] + byte[p50 phase i]       mod29
leading-digit step:K[i+1] = K[i] + firstDigit[p50 phase i] mod29
P[i] = C[i] ± K[i] mod29
```

No phase, start state, page reset, table traversal, digit order, F handling or plaintext-dependent parameter is searched. The canonical table's documented byte rule is used exactly.

## Result

| original-input stream | GP29 IoC |
| --- | ---: |
| raw LP2 p0-p55 ciphertext | **0.0344783979** |
| cumulative raw byte, C−K | **0.0344636223** |
| cumulative raw byte, C+K | **0.0345032660** |
| cumulative leading digit, C−K | **0.0344805070** |
| cumulative leading digit, C+K | **0.0345183752** |
| clear p57 control | **0.0627099664** |

The leading-digit inverse does change the collision architecture, raising within-page adjacent equalities from **86** to **388** under C−K and **360** under C+K. That does not produce a plaintext-like marginal distribution: both outputs remain essentially at the raw ciphertext IoC and their direct transliterations are nonlinguistic. Clear p57 is far separated at IoC 0.06271. A synthetic p57 plant under the exact cumulative-leading-digit rule recovers **95/95** runes, so the negative is not an implementation failure.

## Decision

Retire these two direct cumulative-additive p50 consumers. In particular, the attractive interpretation **“leading base60 digit 0 means no key advance”** can reproduce a much less collision-suppressed stream, yet it does not recover the basic frequency structure of GP prose. Do not rescue it by fitting an initial Caesar state, alternate table origin or page reset: a constant initial state cannot change IoC, and the established clock evidence already selects global phase zero.

The p50 low60 association still requires a value-changing mechanism, but this experiment rules out the simplest cumulative additive state in which the raw byte or its leading base60 digit is the step.

## Reproduction

Run `sims/lp2_p50_cumulative_digit_step_sft.cjs` under Node 22.
