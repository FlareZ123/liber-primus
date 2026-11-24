# p15 Fibonacci ordinal gaps as literal consuming packet lengths (#2630)

**Decision, Agent 2, 24 November 2026: exact original inverse dies at p15 black-body rune index 36.** No full legal F-hold path; no unknown plaintext/key. This is a new packet framing, distinct from #2409's proposed parallel 16 lanes and #2347's scalar period16 clock.

## Fixed source rule

The independently established [p15 grid](../results/lp2-p15-fibonacci-prime-spiral.md) equals abs(3301-prime(F+1)) in the red-origin spiral. Its sixteen distinct Fibonacci values are 0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987. Freeze the one-based prime ordinals o=F+1. For packet i=0..14, consume exactly o[i+1]-o[i] non-F plaintext symbols under a single constant shift (prime(o[i])-1) mod29. Plaintext F is emitted literally and does not consume; encrypted non-F may emit ciphertext F. The fifteen packets total 987 consuming symbols. Stop on the 987th consumption, without extrapolating or repeating.

| Ordinal | Packet length | Shift GP0 |
| ---: | ---: | ---: |
| 1 | 1 | 1 |
| 2 | 1 | 2 |
| 3 | 1 | 4 |
| 4 | 2 | 6 |
| 6 | 3 | 12 |
| 9 | 5 | 22 |
| 14 | 8 | 13 |
| 22 | 13 | 20 |
| 35 | 21 | 3 |
| 56 | 34 | 1 |
| 90 | 55 | 27 |
| 145 | 89 | 16 |
| 234 | 144 | 1 |
| 378 | 233 | 11 |
| 611 | 377 | 11 |

The 16-cell grid is reproduced exactly before use. The source does not independently authenticate interpreting its gaps as packets. Start at p15 local rune offset20, first black rune after lower rubric, through p22; 1883 original runes available. Inputs pinned: corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, ink 0614aca67969a14ae006e0c1ae6dcd8136e6, external solved reference 1b064ef6d85819b7d96adaff31a82d1ec551598f.

## Exact inverse

Maintain every reachable consuming count j and its BigInt number of paths. At ciphertext c=0, allow literal F with unchanged j. Independently, allow consuming p=(c-k[j]) mod29 if p is nonzero; increment j. A transition to j=987 records a terminal physical prefix. No path cap, lexical restriction, reset or fitted phase enters.

Original after body index35: exactly one state, j=35 with multiplicity1. At index36, c=3 (GP O) and k[35]=3, hence the consuming inverse would yield p=0, which must bypass and emit 0. Literal F is also impossible because c=3. No path survives. This is p15 local index56, 37th body rune. No terminal 987-consumption candidate exists.

Authentic control: sequential prime-minus-one (not the new packets) plus the same F semantics reproduces all 85 p56 ciphertext runes, 84 consuming shifts. Two constructed packet controls use concatenated native solved reference sections 0..4 and 4..8 respectively. They consume all 987 key digits and exactly replay 1007 and 997 physical runes (20 and 10 F holds). Their true endpoint is reachable; its multiplicity is 2426283980516271075 and 143652619110 respectively. Thus the inverse correctly preserves latent-F ambiguity; it does not identify a unique plaintext on these plants. A single nonzero original symbol with no legal inverse is sufficient to reject independently of any language model.

## Reproduction and next decision

`node sims/lp2_p15_fibonacci_gap_packet_fhold_sft.cjs` reconstructs the original grid, confirms authentic p56 and both native plants, and prints the exact dying trace. Core executed on pinned inputs in JS tool runtime; standalone wrapper supplied. Retire this packet framing. Do not shift packet endpoints, cycle the sequence, change signs or substitute new packet values absent a new independent source instruction. No later original interval was fitted or used to select a different schedule.
