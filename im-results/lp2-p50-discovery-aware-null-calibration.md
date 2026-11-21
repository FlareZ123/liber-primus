# Discovery-aware p50 / signed-2016 route calibration

**Decision (21 November 2026, Agent15; Director #2046).** The original 256-token table's \`EPIPHANY / SEEKS / THE / DEVOTED → p32\` route remains comparatively rare under four exact-multiset conditional permutation nulls even after charging all 40 signed four-word windows, seven GP-derived word encodings, two address origins, seven DH depths, two radices and eight table traversals. Across 10,000 replicates in each stratum, *any configuration reaching any canonical page whose rune count equals the window's first word* occurred in 0 global shuffles, 3 within-page shuffles, 15 within-row shuffles and 5 within-column shuffles. It remains a **navigation hypothesis**, with no recovered unknown plaintext, authentic cipher key or verified original-cipher inverse.

## Selection history and what was charged

The underlying source table is the 32×8 two-character p49–p51 table; its original-scan 256-token transcription has SHA-256 \`463c57a3949a941027c416522d1b0463a196efb2faa3550377ba15829dcdf6c4\` under the documented row serialization. The 2016 signed message has 43 alphabetic words including the separate \`Hello\` salutation. The known GP29 order and canonical physical p0–p57 rune counts are unchanged.

#1978 first reported the GP0 \`EPIPHANY / SEEKS / THE / DEVOTED\` depth-23 route to physical p32 under base60/row-major, then considered a 560-case source family; #2012 independently re-transcribed the original table and verified the expanded 62,720 configuration family. The 121-rune p32 count and \`GP0(EPIPHANY)=121\` relationship were part of the discovery and **cannot be counted as an untouched holdout**. The p50 path's \`EMPTY\` at step 7 was recognized retrospectively. The apparent p0 title echo and p0/p6 red-span relations arose elsewhere and are not independent validation in this test.

The 62,720-family baseline includes 40 contiguous four-word windows × seven encodings (GP0, GP0 mod256, GP1, GP1 mod256, GP-prime sum, GP-prime sum mod256, GP rune length) × two address origins × seven DH depths \`[23,5,6,15,8,19,2]\` × two base59/base60 token decodings × eight row/column orientations. For every configuration, the state starts at the second word's encoded number; the two states immediately before termination must equal the third and fourth word's numbers under the same origin convention; the terminal state must name one of **all 58** physical pages, with rune count equal to the first word's number. The page/count target was broadened beyond p32 before permutations. The complete family contains only **13** windows/encoding combinations that can satisfy a canonical page count and have valid bounded numeric states, so implementation safely prefilters those while retaining the exact 62,720 formal search space.

The original table has **two raw matches**, GP0/GP0-mod256 aliases, one normalized route: \`71→108→14→183→81→58→146→92→236→238→129→179→175→18→15→212→70→169→228→144→125→20→102→32\`, using base60, row-major-forward, origin zero, depth23, with first-word count121. These results exactly reproduce #2012 and establish the baseline for all nulls.

## Frozen null models and results

Each null retains all **256 original two-character tokens**, including multiplicity and which representations can be invalid under a radix. It also retains exact signed-word order, segmentation, seven word encodings, seven depths, all 58 page counts and all 62,720 configurations. The only randomized object is table token position. The independent strata constrain progressively different table features; they do not estimate a universal probability of Cicada design.

| Null model | Fixed additional structure | Seed | Trials | Any-hit trials | Raw configuration hits |
|---|---|---|---:|---:|---:|
| Global exact-multiset permutation | No positional structure | \`0x20261121\` | 10,000 | **0** | 0 |
| Within each original page | 80/104/72-cell page multisets | \`0x20261122\` | 10,000 | **3** | 8 |
| Within each eight-token row | Every original row multiset | \`0x20261123\` | 10,000 | **15** | 32 |
| Within each column | Every 32-token column multiset | \`0x20261124\` | 10,000 | **5** | 12 |

Deterministic xorshift32 draws and Fisher-Yates rejection sampling prevent modulo bias in choosing positions. Each stratum uses its own continuous fixed-seed stream. A separate earlier 1,000-trial smoke test is **not** included in these denominators. Among positive within-page replicates, the raw-hit histogram was two trials with two alias matches and one trial with four; within-row, fourteen with two and one with four; within-column, four with two and one with four.

The zero-hit global stratum gives the one-sided exact 95% binomial upper bound \`1−0.05^(1/10000)=0.00029952836\`, conditional on that exchangeability null. Rates for the other conditional strata are respectively 0.03%, 0.15% and 0.05%. Distinct strata are not interchangeable and must not be pooled as independent tests of one historical null.

## Inference, limitation and fork

The path is unusually selective relative to these **particular source-conserving rearrangements**. The within-row model, which keeps all 32 original row multisets fixed, still produces a matching route in 15/10,000 trials. This supports retaining p50 word-map navigation as a testable branch and rejects the simple claim that such a route is routine under these four exact-multiset nulls. It does **not** establish that the signed message selected the precise original table function, that the authors designed the route, or that p32 contains plaintext read by this operation.

The discovery history contains pre-existing choices about word windows, p32/121 and table reading. Four conditional nulls charge the fully documented 62,720 source family and all receiver counts, but cannot charge every undocumented earlier idea, independent post hoc p0/p6 visual correlation or the larger space of conceivable operations. In particular, the earlier 2016 \`Its words are the map\` phrase grammatically refers to Liber Primus; treating the signed words themselves as a map is an interpretive leap. No general statistical p-value or “proved designed” statement follows.

**Director fork:** preserve this as relatively selective navigation and commission a **genuinely prospective, independently source-selected, reversible unknown-original-cipher consequence** before another p32 key search. Require an input/clock/key chosen without inspecting target plaintext, at least one untouched ciphertext holdout, and full forward reencryption as implementation check. Without that selector, stop graph-based decoder sweeps.

## Reproduction

\`node sims/lp2_p50_discovery_aware_null_sft.cjs\` (Node.js 22 CommonJS; reads the three canonical repository inputs, asserts exact 256-token transcription hash and baseline, and reruns all four fixed-seed 10,000-trial strata). Input Git blob SHA-1: \`lp2-corpus.json\` \`054f2a0f780b7d46901acbe3d9bf4f0ac1801165\`; \`lp2-grid-256.json\` \`39c4f098566fc5eba9d6738416a2fd193f800701\`; signed-2016 \`cicada2016-4gq25-outguess.asc\` \`a0d8bd2d73613e01cd8a2103d5721b2b998ee482\`.
