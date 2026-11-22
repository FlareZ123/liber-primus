# Original Q252 quadratic sharing: every fixed GF29 four-point route fails the p56 key

**Decision, 14 November 2026:** the authentic 84-symbol prime-totient key of solved LP2 p56 cannot be recovered from the original p50 Q252 dual-factor quotient by any fixed quadratic Shamir interpolation with three distinct share coordinates and a fourth distinct evaluation coordinate over GF(29), under either source-natural share layout or complete quotient orientation. Even an unrestricted secret **stationary symbol function** over the predicted 29 residues can reproduce at most **37 of 84** independently known key positions. This closes the finite *direct fixed-coordinate sharing* proposal. It does **not** disprove more general secret-sharing, changing-state maps, a different table interpretation or historical unknown-page keys. No unknown LP2 plaintext recovered.

## Source-constrained premise and decisive prediction

The original physical pp49–51 contain exactly **256 printed numeral cells**, conditionally parsed using the conventional base60 alphabet. Their original byte sequence hashes SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Dividing the descending GF29 coefficient polynomial by the product of two independently visible factors is exact:

- `H=3+26X+24X²`, a **conditional ascending-polynomial reinterpretation** of the signed 2013 BASE29 digits `3301=3QO`. Ordinary base29 is most-significant-first (`3×29²+26×29+24=3301`); the source itself never fixes this ascending polynomial order.
- `G=27+5X+15X²`, from the original p39 red rune triad.
- Their product has ascending coefficient values `[23,21,11,17,12]`; **the four-field-element division remainder is zero** and the quotient is exactly **252** coefficient slots (including a leading zero).

The original solved p56 has **85** ciphertext rune symbols, but its historical prime-totient inverse includes a literal plaintext-F at zero-based offset 56 that consumes no prime. Consequently, its published cleartext is authenticated by **84** key values `K[i]=(prime[i]-1) mod29`, ranging from the first prime 2 through the 84th prime **433**. The 252 quotient slots could arithmetically be arranged as **three shares of 84 positions**.

The recognizable human-puzzle proposal is to interpolate a quadratic polynomial through three source-symbol shares per key position and evaluate it at one fourth field coordinate, expecting exactly the independent known key sequence. The **upstream assumption is unverified**: no Cicada source instructs the solver to use the table as Shamir shares, fixes the share points, or selects the expected output from the quotient. The 252=3×84 alignment is retrospective, so this is a bounded exact proposal whose failure is worth recording before pursuing further free-key variants.

## Exhaust all distinct GF29 share-point and target-point placements

Let `y0,y1,yt` be the three Q252 shares for a position. Any ordered triple of *distinct* GF29 source coordinates is equivalent by affine coordinate normalization to `x=[0,1,t]`, where `t∈{2,...,28}`. Every fourth coordinate `u∈GF29\{0,1,t}` is then evaluated using exact Lagrange weights:

`a=(u-1)(u-t)/t,quad b=u(u-t)/(1-t),quad c=u(u-1)/(t(t-1)) mod29`

The predicted fourth share is `S[i]=a y0[i]+b y1[i]+c yt[i] mod29`. The **702** finite `(t,u)` pairs produce **390 distinct ordered weight triples**; duplicated triples have mathematically identical effects on every input. This covers all fixed four-point interpolation rules over GF29 with distinct share points. The remaining ordinary source-readout choices are three consecutive 84-position blocks or 84 adjacent triples, each with the entire quotient in forward or reversed order. Hence **390×2×2 = 1,560** genuinely different original-input candidate streams. The 12 cases in which the target coordinate is itself one of the three given share coordinates are tested separately as trivial direct-share controls; none reproduces the true p56 key.

Every candidate is measured against the 84 independently authenticated target residues in two exact ways: direct position-by-position equality, and an exact, optimistic upper bound that grants *any* fixed function `f:GF29→GF29`, including non-injective secret substitutions. For each predicted symbol `v`, choose whichever true target symbol `w` appears most often among positions with `S[i]=v`. Adding these maxima gives the **provable most matches achievable by any stationary output function**. Any conflicting assignments to one input symbol prevent complete recovery. This bound includes every secret 29-symbol alphabet permutation.

| Source-original result | Exact outcome |
| --- | ---: |
| Original table cells / Q252 quotient symbols | **256 / 252** |
| Polynomial division remainder | `[0,0,0,0]` |
| Known p56 prime-key positions | **84** |
| Candidate distinct interpolation-weight triples | **390** |
| Evaluated original-input streams | **1,560** |
| Highest literal known-key matches | **9 / 84** |
| Highest matches under any stationary output function | **37 / 84** |
| Fewest conflicting predicted-symbol groups in any candidate | **17** |
| Complete authentic p56 key recoveries | **0 / 1,560** |

The strongest unrestricted-function bound occurs for forward 84-block shares, normalized `t=7,u=17`, with weights `[27,20,12]`: **37/84** matches at best, with **24** contradictory source-symbol groups. There is no model-dependent threshold or English scoring: the authentic known key fixes the required **84/84** exact outcome.

## Positive controls and interpretation

**Independent repository Actions execution:** [manual source-original run 43635105594](https://github.com/FlareZ123/liber-primus/actions/runs/43635105594) completed successfully on GitHub Actions/Node22; the selected Q252-and-terminal-gates job step is explicitly marked **success**. Its workflow uses manual `workflow_dispatch` only.

The [CommonJS original-input SFT](../sims/lp2_q252_shamir_allx_p56_key_sft.cjs) asserts the unchanged table SHA-256, exact H×G division, all 84 primes through 433 and the complete p56 original plaintext. It re-encrypts the original **85** ciphertext runes, correctly handling the single plaintext-F bypass. Independently constructed 84-position quadratic shares encoding that authentic key under a secret symbol bijection `f(v)=7v+3 mod29` pass **84/84** with zero assignment conflicts, establishing the discriminating power of the fixed-function test when a matching share system exists. A separate direct-source-share subset covers the three evaluation points occupied by shares and fails as well.

The original-image quotient/factor arithmetic is a source-aligned observation, while the sharing and target-page choice remain proposals. This exact negative rules out an appealing *complete known-key transfer* and prevents spending compute on new point-coordinate, fixed-symbol-permutation, or sign/phase searches in the same model. A successor requires an **independent original instruction selecting a different operation, clock, state, or key source**, ideally one producing unknown p0–55 plaintext on held-out ciphertext rather than merely fitting the known p56 key.

Related research: [2013 H/G factor source and existing direct consumers](2013-base29-gf29-grid-factor.md); [existing narrower interpolation handoff](https://github.com/FlareZ123/liber-primus/issues/41); [authoritative research frontier](../results/README.md). **No new LP2 plaintext, unknown-page key, or final destination established.**
