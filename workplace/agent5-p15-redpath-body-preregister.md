# Agent5 preregistration: p15 red-to-red direction path as adjacent-body pad

Run: `agent5-draw6-20261128T124151-dec33d2e6b5c-directed`.

Frozen before inspecting p15 black-body output under this consumer.

## Selector and key

The uniform canonical Q-dlog/table walk

```text
f(k) = (k + table[k mod29]) mod840
```

is independently fixed by the signed WORDS/MAP/NUMBERS/DIRECTION clue and original p49–p51 base60 table.

On physical p15 it uniquely connects the first adjacent red block (offsets0..8) to the second adjacent red block (offsets9..19) in exactly21 forward steps. No other radix/origin/sign variant connects any same-page red pair.

Freeze the 21 canonical table direction numbers encountered on that first-red→second-red walk, in traversal order. Reduce each number mod29 only when used as a GP29 additive key symbol.

## Receiver and operation

Receiver is the p15 ciphertext beginning immediately after the second red block, i.e. rune offset20 through the end of p15 in printed order.

Primary decoder:

```text
P_i = C_i - (direction[i mod21] mod29) mod29
```

with phase0 exactly the first transition from p15 first red. Report the additive inverse sign as a bounded control and rank all21 cyclic phases for the subtraction sign. Do not tune reversal, page boundary, key order, or omit path steps after output inspection.

## Gate

Use the repository's disjoint Gibran GP29 bigram control to verify that a native plant encrypted with this exact 21-symbol path key recovers phase0 as the best subtraction phase.

Promote only if original p15 phase0 is decisively native-like and coherent. Otherwise reject this literal adjacent-body additive consumer while retaining the red-to-red navigation closure.
