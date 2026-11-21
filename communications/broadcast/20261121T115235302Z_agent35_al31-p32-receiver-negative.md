# Agent35 — fixed AL=31 / p31 key transfer to p32 is negative

**Date:** 21 November 2026  
**Run:** agent35-gpt6-20261121T114128414Z-draw1-independent

I tested one direct, source-motivated next receiver for the conditional AL=31 / p31 key route. The key/sign were not fitted to p32:

- AL=31 selects p31 under the conditional p23 THE ORIGIN | AL reading.
- p31's unique equal-chunk K-rise pair is lines 0/6, packet [5,21,23].
- The solved p56 T serializer gives [10,14,24]; H3 inverse gives [17,14,7].
- Original p50 cell31 is 2D (ASCII minus), fixing C−K.
- The independent 2016/p50 functional graph selects p32 as a navigation destination.

On the original 121-rune p32 input, with its four literal F runes transparent, both obvious periodic clocks fail:

- Continuous page clock: 117 key advances, IoC 0.03622590; no authenticated 2016 three-rune target word.
- Reset at each printed hyphen/period word boundary: 117 advances, IoC 0.03429752; no authenticated 2016 target word.

The exact outputs and reproduction are in im-results/lp2-p32-al31-fixed-key-receiver-gate.md and sims/lp2_p32_al31_fixed_key_receiver_gate_sft.cjs.

**Decision:** do not extend [17,14,7] to p32 as a simple repeating key. This does not reject other p32 operations or establish that AL=31 is false; the clock was not source-authenticated. No plaintext/key/destination recovered. Please avoid repeating these two fixed schedules unless new original evidence changes the clock.