# p50 leading-zero base60 factorization yields a 55-entry GP29+bit page schedule

**Agent3 independent exploration, 18 November 2026. Classification: new source-derived schedule plus bounded negative consumers. No unknown plaintext or authenticated cipher recovered.**

## Exact factorization

The established p50 repeat anomaly selects the **60** row-major table cells whose printed token begins with `0`, equivalently conventional-base60 values `0..59`. Under the historically available 60-character digit order, every selected value has the exact decomposition `B = 2q + b`, with `q in 0..29` and `b in {0,1}`.

For `q=0..28`, the quotient is directly a GP29 rune index and `b` is one bit. The remaining quotient `q=29` is outside the 29-rune alphabet and is therefore a natural candidate sentinel rather than a rune.

On the unchanged original table: leading-zero cells **60**; `q<29` cells **55**; `q=29` cells **5**. The sentinel cells are exactly **22, 51, 81, 219, 220**, with literal tokens/values **0x/59, 0x/59, 0w/58, 0x/59, 0w/58**.

Unknown LP2 p0-p55 contains exactly **55 rune-bearing physical pages** because p50 is numeric-only. The 55 non-sentinel cells therefore provide, in source row-major order, one candidate `(GP29 rune, bit, physical cell)` record per rune-bearing unknown page.

Repository code search found no prior report of this specific factorization. It remains interpretive and depends on the conventional base60 digit map; the competing drop-`f` radix59 reading has no `2x30` decomposition. Under a simple conditional uniform-low-digit model, seeing at least five of 60 cells in values 58/59 has probability about **0.0496** (exactly five about **0.0348**). These are scale calibrations only because the factorization was noticed retrospectively.

## Direct consumers

**Authenticated p56 prime/totient page start.** Page `j` starts the solved p56 prime stream at ordinal `q_j`; its bit chooses arithmetic direction. Both global bit-to-sign polarities are tested with the exact plaintext-F transparent/non-consuming rule and both legal ciphertext-F inverse branches. Complete algebraically legal inverses survive on only **2/55** and **3/55** pages. This rejects the direct schedule-to-p56 transfer before language scoring.

**Page-keyed reversible collision code.** Let `R=q_j` be the sole plaintext rune encoded as a repeated ciphertext rune; rank the other 28 GP symbols around the predecessor-excluding output alphabet and let the bit choose forward/reverse rank direction. Both bit polarities round-trip, but decoded full-book GP29 IoCs are **0.0345327932953** and **0.0345123935193**, with no coherent plaintext.

**GP29 cyclic ramp.** Start each page at `q_j` and advance one GP state per rune in the bit-selected direction. Across both bit polarities and both additive signs, full-book IoC is **0.0344624069186..0.0344868818835**.

**Anchored p50 table walk.** Use the record's physical p50 cell as the page-local start of a forward/backward 256-cell walk and consume `byte mod29` additively. Across both bit polarities and both arithmetic signs, full-book IoC is **0.0344848681206..0.0344983567575**.

All value-changing candidates remain ciphertext-like. There is no basis for tuning offsets, alternate table orders, or extra layers around these failed consumers.

## Decision

Preserve the **60 -> 55 GP29+bit + 5 sentinel** factorization as a compact source-derived candidate schedule. It is more constrained than an arbitrary page-key search and would weakly favor conventional base60 if an independent consumer validates it.

Do not promote the 55-page count as authorship evidence by itself. A successor requires an independently motivated operation that specifically needs one GP rune and one bit per physical page and must make a blind original-text prediction.

Reproducer: `sims/lp2_p50_low60_gpbit55_schedule_sft.cjs`.
