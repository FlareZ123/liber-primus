# Original LP2 256-byte table under ciphertext-XOR feedback: all-seed convergence

**Classification (12 November 2026, Agent 15): bounded original-cipher negative and exact finite-state reduction.** No unknown Liber Primus plaintext, historical key, original cipher, or continuation was recovered. The result avoids repeating the autonomous lookup `s'=T[s]` already excluded by [the complete functional-graph census](lp2-grid-lookup-state-graph-gate.md).

## Source and explicit human solve-path hypothesis

The manuscript's source-visible pp49–51 **32×8** table can be read, conditionally, as a 256-byte lookup `T[0..255]`. The signed 2013 Cicada TCP challenge explicitly uses `3301` in its BASE29 worked example, and earlier Cicada stages used bytewise XOR. A technically literate solver might hypothesize that each published rune drives the next table lookup, avoiding the autonomous table's very short cycles. The manuscript supplies **no** authenticated instruction for XORing a GP rune with a byte state, making the construction exploratory and the weakest premise. This report tests exactly one simple reversible reading rather than fitting a key or adding cipher layers.

Read all 256 actual base60-decoded table bytes **in physical row-major order** from `resources/liber-primus/base60-grid.json` (SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2bdb23184a4b290`). Fix `s₀ = 3301 mod 256 = 229`. At each canonical GP29 ciphertext index `cᵢ`, decode and update:

```text
pᵢ     = (cᵢ - (T[sᵢ] mod 29)) mod 29
sᵢ₊₁  = T[sᵢ XOR cᵢ]
```

The exact forward encryption is `cᵢ = (pᵢ + (T[sᵢ] mod29)) mod29` followed by the same observed-ciphertext state update. It is **lossless for every input**, uses a 256-state register and has neither a fitted phase nor a reset. It is a different construction from the previously rejected 32-state ranked permutation and from the one-step polynomial/derivative feedback.

## Real-original outcome and positive control

All **12,956** unknown GP runes on the 55 rune-bearing physical p0–55 pages were inverted in unmodified source order. The full original output re-encrypts exactly, as it must for any reversible model. Its first forty recovered tokens are `S G R U U A IA C Y A O OE J M W AE OE EO J D H H Y G AE N TH OE IA IA P F OE H L T U X S Y`; it is not recognizable GP-native prose.

| Input/output | GP29 IoC |
| --- | ---: |
| Original unmodified unknown ciphertext | **0.0344783978645** |
| Fixed source-key inverse, full 12,956 runes | **0.0345353194358** |
| Fixed inverse after original position223 | **0.0345371141489** |
| Authentic solved p57 plaintext, independent positive plant | **0.0627099664054** |

Each of nine original-image-derived visual chapters still has candidate IoC between **0.033969** and **0.035018**, with no legible complete passage. The source-native positive is stronger: encrypt all 95 authentic solved p57 runes with the same exact algorithm and seed, then decode, recovering **95/95** runes and every original solved-text symbol. This is an implementation validation, not evidence for the unknown-page model.

## Exact all-secret initial-state result

An attacker might object that 229 was not the true initial byte. Because the state rule depends entirely on **observed ciphertext**, it can be evaluated for **all 256 possible unknown seeds** without guessing plaintext. Propagate the entire initial state set `0..255` on the authentic original input. Its distinct reachable states shrink from 256 to **161 after one rune**, 38 after eleven, 8 after 51, 2 after 201, and exactly **one state after rune223**: state **32**. The standalone reproducer explicitly checks that **every one of the 256 seeds yields exactly the same decoded suffix from rune223 onward**. This is a complete finite-state obstruction to rescuing this exact cipher by finding a better secret starting byte. No arbitrary initial byte or seed-only key search changes the final **12,733-rune** original output.

## Decision

This exact source-motivated ciphertext-XOR 256-byte lookup cannot directly recover ordinary GP-native unknown-page prose. An unknown initial byte alone cannot fix it after position223. A new consumer of the numeric grid must be selected by a distinct original clue and change the **transition or readout itself**, rather than extend this seed search. This does not exclude other table encodings, a larger state, historical missing keys, or non-GP intermediate representations.

**Reproducer:** [`sims/lp2_grid_cipherfeedback_byte_xor_sft.cjs`](../sims/lp2_grid_cipherfeedback_byte_xor_sft.cjs), CommonJS Node.js 22, source hash and original full-corpus counts asserted; no packages or network access.
