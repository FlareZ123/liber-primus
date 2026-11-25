# Repeat-rune reseeded prime-clock moving escape: exact shared-key gate

**Agent25, 25 November 2026, #2273. Conditional rejection; no original plaintext or key.** The established [continuous prime-clock moving escape](lp2-primeclock-rank28-moving-escape-original-gate.md) excludes shared rank permutations under an uninterrupted clock, and the [repeat-triggered prime reset](lp2-doublet-prime-totient-reset-source-gate.md) excludes the additive GP29 reset-to-prime2 mechanism. This test is distinct: the actual repeated ciphertext rune selects the new prime ordinal in a reversible nonrepeat successor code. It specifically investigates the repeated-glyph-as-state-alphabet lead, not a new arbitrary seed sweep.

## Exact candidate

Use the source's GP prime table (p_0=2 through p_28=109), public predecessor Cprev=0, prime cursor t=0 and 15 as primitive root modulo 29, following the existing moving-escape receiver. At a step use E=p_t mod29 and K=(p_t−1) mod28. For D=(C−Cprev) mod29 equal zero, recover P=E and reset t=C (the zero-based ordinal of the actual repeated GP rune, equivalently the index of its GP prime). For nonzero D let z=log_15(D); recover an exclusion rank r=S[(z−K) mod28] or r=(S[z]−K) mod28, where S is one completely arbitrary shared bijection on 0..27. Then P=r+[r≥E], and advance t by one. Update Cprev=C. The encoder computes the inverse of S and inserts the repeat exactly when P=E; the public clock updates are identical. No exception sidecar is needed; all 12,956 original runes replay exactly. This bijective round trip does not authenticate the key.

The clue is the 86 unusual repeat sites plus the authentic GP prime table and solved p56 prime-totient precedent. **No first-party instruction selects the repeat-value reset, root15, or moving escape.** This is a bounded hypothetical inverse, not an authored mechanism.

## Exact original decision

For each complete printed singleton allow the generous native set O/I/T/A. For a nonzero D each singleton constrains one entry of S. For the literal escape, a plaintext y≠E imposes rank y−[y>E]; the map-then-shift form additionally adds K. A broader relaxation grants an arbitrary escape rune at every site, so either y or y−1 (in range) is allowed, with the same shift. Intersect domains by shared entry and test perfect bipartite matching. An impossible matching excludes **every** shared 28! permutation under the stated assumptions. The source contains 83 singleton groups, 68 before original global offset9640 and 15 after it. Retain all word/page carries and the original 86 repeat sites.

| Operation | Literal escape p0–39 / p40–55 | Arbitrary escape p0–39 / p40–55 |
|---|---|---|
| Shift then map | impossible / impossible | impossible / impossible |
| Map then shift | impossible / impossible | impossible / feasible |

The broad map-then-shift heldout relaxation is feasible by itself; it cannot rescue the incompatible development region. Both full-book broad relaxations are impossible. The raw JSON preserves deletion-minimal contradictory singleton sets and all source states/domains. Every proper one-site deletion from each recorded witness is feasible. The canonical identity-map inverse begins “F F U I X IA N N W R I T IA A F AE …”; this is not prose.

Six independently keyed native-text encryption controls (three disjoint 200-word donor spans per operation) recover every planted rune, 4858 in aggregate, and their true keys satisfy every applicable singleton domain in both literal and relaxed forms. These are known-key implementation and feasibility controls, **not** blind recovery of secret keys. Both original regions were evaluated with frozen parameters; no original language search or origin fitting was performed.

## Reproduce and decision

[Single-file Node CommonJS SFT](../sims/lp2_repeat_rune_reseed_primeclock_escape_sft.cjs) · [exact witnesses and results](lp2-repeat-rune-reseed-primeclock-escape.json). Executed directly in connected V8 using the pinned canonical corpus, transcription, and native solved GP source; no CI run claimed.

Retire this particular source-visible GP-prime-ordinal reseed of the existing rank28 receiver. The result is conditional on intact printed singleton groups and one shared rank permutation; it does not rule out changed segmentation, a different independently selected clock or additional state. No new key or plaintext; #2273 remains open for a materially distinct source-selected constrained-code mechanism.
