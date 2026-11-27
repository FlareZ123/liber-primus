# p15 Fibonacci ordinal gaps: packet framing and prime-cursor strides

**Current decision (27 November 2026): both fixed interpretations of the recovered gaps fail on original ciphertext under authentic F-hold semantics.** #2630's constant-shift packet inverse dies at p15 black-body rune index 36; the distinct cyclic gap-stride prime cursor fails every one of 480 tested rank/phase/sign combinations on both p15 black-body–p22 and p16–22, despite recovering two concealed control keys. No unknown plaintext/key. These are scoped negatives, not an exclusion of all Fibonacci-selected clocks.

## #2630 — literal consuming packet lengths (Agent2, 24 November)

### Fixed source rule

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

## Cyclic gap-stride prime cursor (Agent10, 27 November)

The source p15 spiral independently fixes one-based ranks [1,2,3,4,6,9,14,22,35,56,90,145,234,378,611,988]. Its successive rank differences are `[1,1,1,2,3,5,8,13,21,34,55,89,144,233,377]`. This test uses each gap as a **cursor increment**, not a packet length, fixed decimation stride (#2653), shift value, or plaintext-addressed increment (#2775). The p56 prime-minus-one convention supplies the shift at the current rank. Repetition of the finite gap tape is motivated by the infinity mark but is not authenticated; ordinary continuous prime clocks and decorative artwork remain plausible rivals.

For each of the 16 printed source-derived ranks, each of 15 gap phases, and both arithmetic signs, use `k_j=sign*(prime(r_j)-1) mod29; r_(j+1)=r_j+gap[(phase+j) mod15]`. Each *consuming* plaintext symbol advances the cursor once, while literal F emits 0 and leaves it unchanged. The exact inverse retains the complete reachable set of consuming indices at every original rune. At c=0 both hold and consuming branches are considered, provided the latter gives non-F. No path cap, dictionary, or word order constraint. The 480 configurations include the literal red rank1/phase0 forward start plus an explicit finite relaxation; no origins beyond the 16 source-derived ranks are claimed excluded.

| Original span | Runes | Legal complete candidates | Latest first impossible offset (0-based) | Last-surviving configuration |
|---|---:|---:|---:|---|
| p15 black body through p22 | 1883 | 0/480 | 574 | rank611, phase14, sign−1 |
| p16 through p22 | 1744 | 0/480 | 408 | rank2, phase0, sign−1 |

The native positive checks include authentic p56 85/85, 84 consumed successive primes; the *new* clock is separately calibrated on two constructed controls with disjoint native donor sections and concealed rank/phase/sign. The exact 400-rune fit feasibility gate leaves two and three candidates respectively, retaining truth in both. Rank those survivors using a GP29 add-0.5 bigram Viterbi score fitted on the seven other native reference sections; freeze the highest fit scorer before decoding the continuation. Correct keys selected 2/2, 800/800 fit runes and 735/735 withheld runes recovered, exact full forward replay. Full-interval Viterbi can resolve ambiguous prefix path state after the key is frozen; this is not a strictly causal prefix-state freeze. Exact feasibility alone does not identify the control key (a phase-successor alias survives in each full control), and the small number of controls does not establish universal statistical discrimination.

Without F holds, score all 480 ordinary inverses on p15–19 or p16–19 and freeze the top training candidate for p20–22 (673 runes). Held scores are −3.828959 and −3.826287 nats/rune respectively, compared with disjoint known-native control held scores −2.717681 and −2.775779; even postselected best held scores are only −3.749345 and −3.735341. These are heuristic nonprose diagnostics, not exact ordinary-cipher impossibility. The full fit-selected original tapes are retained in the raw output.

**Decision:** retire this finite gap-stride clock family. It gives no authenticated plaintext/key and no reason to tune more Fibonacci strides absent an independent source-selected clock. No change to the established research frontier. The new evidence extends the related gap-use record without contradicting the original constant-shift packet result.

Reproduction: [single-file CJS](../sims/lp2_p15_fibonacci_gap_stride_prime_sft.cjs) (final code commit dce61c097838f466b4532bb303d731e4fba14737), [raw output](lp2-p15-fibonacci-gap-stride-prime-output.json) (afa82e64f627507e37bb7cd0854fffe36174f982). Core executed in connected V8 on corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 and native reference blob 1b064ef6d85819b7d96adaff31a82d1ec551598f; standalone Node wrapper not independently run.
