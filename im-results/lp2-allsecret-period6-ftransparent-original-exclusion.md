# LP2 period-six exact original-ciphertext exclusion under historical plaintext-F bypass

**14 November 2026, Agent47. Exact all-secret family exclusion; no plaintext, genuine author-selected cipher, key or endpoint.**

This fills the previously untested gap between independently completed shared-key periods **five** and **seven/eight**, using the same original-source model. The 2014 puzzle features 5×5 and 7×7 squares, but the choice of period six here is an explicit *bridge check*, rather than a proposed authentic creator clue. Its purpose is to decide whether a plausible short additive period remains between two excluded source-motivated periods, without fitting an English score or a guessed key.

## Original-input model

Take **all 12,956 original GP29 ciphertext runes** across **55 physical rune-bearing LP2 unknown pages p0–p55**, with one fully unknown six-symbol additive key shared across the whole manuscript. At non-F plaintext, \`C=(P+K[j]) mod29\` and phase j advances mod6; a plaintext F=0 emits literal ciphertext F without consuming the key, as established for the solved p56. Both origins of ciphertext F are retained. Critically, **every physical page chooses any independent initial phase among six**. Opposite additive sign is covered by key negation. All original rune boundaries are retained.

## Exact finite necessary-condition search

For a fixed nonzero key symbol \`v\` at one nominated phase, give every other key phase an *unknown wildcard* and allow **every** original ciphertext F to either skip or advance even if the eventual exact key would forbid an advance. This six-state permissive inverse is a superset of all genuine inverses. Since initial page phases are arbitrary, circular rotation places any tested digit at nominated phase0 without loss.

Nine nonzero GP29 values \`[5,6,7,12,16,20,22,27,28]\` are impossible at **any** key position: at least one complete original source page has no phase path even under this overapproximation. The other positions can contain only

\`[0,1,2,3,4,8,9,10,11,13,14,15,17,18,19,21,23,24,25,26]\`,

20 values including zero.

Assign these 20 values recursively to the six key positions, rechecking *all* original pages under the relaxed F automaton after each assignment. A failed partial key cannot have any feasible completion, so prune its whole subtree. Number of visited nodes at assigned depths 0..6:

\`[1,20,400,780,1160,1540,1920]\`.

Nodes that still admit at least one relaxed source phase path:

\`[1,20,39,58,77,96,115]\`.

Only **115** complete keys remain after the sound necessary-condition search. Each is run through the **exact** original source F-bypass inverse, retaining every ciphertext-F ambiguity and letting every physical page start at any of six phases.

**Result: only the all-zero identity key [0,0,0,0,0,0] passes all 55 original pages.** Thus no nontrivial period-six **book-common, page-phase-reset** additive GP29 key can explain the original, independent of every English assumption. The finding is stronger than an IoC or dictionary failure and covers any fixed six-digit secret.

## Source-native positive and implications

The SFT encrypts the 95 actual already-clear p57 GP runes under a six-slot nonzero planted key and unknown initial phase. The three literal F plaintext runes skip key consumption; the exact decoder accepts the resulting 95-symbol ciphertext with **92 consumed key steps**. The original all-zero key also passes as expected. The positive shows this finite gate can recognize a real native F-bypass cipher rather than merely rejecting all inputs.

**Scope:** Period six is a mathematical exclusion under this explicitly specified historical F-handling additive mechanism. It does not address independently keyed pages, word-local seeds, evolving nonperiodic states, a non-additive alphabet or plaintext not represented by GP29. The companion no-go studies cover [period five](lp2-allsecret-period5-ftransparent-original-exclusion.md), [period seven](lp2-allsecret-period7-ftransparent-original-exclusion.md), and [period eight](lp2-allsecret-period8-ftransparent-original-exclusion.md), together showing that constant shared short additive keys with authentic plaintext-F bypass cannot produce ordinary GP-native prose. Further short fixed-key sweeps without new clue-selectors offer little causal route to unknown plaintext.

[Windows Node22 original-source CI success 43634071627](https://github.com/FlareZ123/liber-primus/actions/runs/43634071627) · [Reproducible single-file Windows Node22 test](../sims/lp2_allsecret_period6_ftransparent_exact_sft.cjs) · [canonical original GP29 corpus](../resources/liber-primus/lp2-corpus.json).
