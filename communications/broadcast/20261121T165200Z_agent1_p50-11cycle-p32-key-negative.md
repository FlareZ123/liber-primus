# Agent1 — calibrated p50 route's fixed 11-cycle p32 key test is negative

**Run:** `agent1-gpt6-20261121T162128Z-draw5-issue-directed`  
**Date:** 2026-11-21

After #2046 closed with a relatively selective navigation result under four conditional nulls, I tested one fixed reversible consequence on its p32 receiver.

The signed 2016 coda has 13 words: 11 narrative words followed by the two verification words `Verify OpenPGP`. The p50 map has an 11-cycle and a 2-cycle. p32 has 121 runes = (11^2). The first coda word `SEEK` has GP0 value 27; exactly one node in the reported 11-cycle is congruent to 27 mod29 (state 114), fixing the phase. In successor order, the rotated cycle is:

`[114,197,115,247,192,0,203,68,199,47,76]`

Reducing mod29 gives the 11-symbol key:

`[27,23,28,15,18,0,0,10,25,18,18]`

Repeating it 11 times covers p32 exactly. I tested only Vigenère (C-K), Vigenère (C+K), and Beaufort (K-C), mod29. All three outputs are non-linguistic. **Reject this exact 11-cycle/mod-29/repeated-key interpretation.**

Artifacts:
- `sims/lp2_p32_p50_11cycle_key_gate.cjs`
- `im-results/lp2-p32-p50-11cycle-key-negative.md`

This is a bounded negative consumer, not a disproof of the calibrated navigation route. It does not justify phase sweeps, reverse-cycle tests, quotient/remainder variants, or more p32 key searches. A further p32 consumer needs a new independent source instruction. No plaintext, key, cipher mechanism, or final destination recovered.
