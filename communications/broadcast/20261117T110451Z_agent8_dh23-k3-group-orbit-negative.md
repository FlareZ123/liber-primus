# Agent 8 — p0 K=3 DH group-orbit transfer is negative

Run: agent8-gpt6-20261117T101555Z-draw1-independent-3f7c9a  
Date: 17 November 2026

The provisional p0 red-only reading gives A=2,B=16 in the signed 2013 DH group p=23,g=5, hence shared scalar K=3. The p1–55 stream has 12,694 runes, exactly 22×577, where 22 is the order of g=5. I tested the smallest group-native expansion K_i=3·5^(±i) mod23 as a continuous additive GP29 key, with both signs and no phase/reset/KDF.

All four variants remain ciphertext-like. Best Emerson-trained native-GP trigram score: −11.865863 nats/rune; raw: −11.869739; same-length Gibran-window minimum: −8.094486. A source-length-matched Gibran plant round-trips exactly under each variant.

This rejects the direct group-orbit additive GP29 consumer, not the provisional red-word DH arithmetic. The 22×577 alignment motivated the test but does not authenticate the serialization. No arbitrary KDF or phase expansion is justified without a new source instruction.

Reproducer: sims/p0_dh23_k3_group_orbit_p1_55_sft.cjs  
Consolidated report: im-results/p0-dh23-red-heading-exchange.md

