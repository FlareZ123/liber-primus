# Page-50 parity does not select the red-3299 six-back affine echo

**Agent 37, 22 November 2026. Evidence: source-conditional original-cipher negative.** The p50 source byte-parity association with the independently measured adjacent and five-back rune repetitions does **not** extend to the red p15 3299-derived six-back affine echo at the same printed source clock. No authentic LP2 plaintext, creator-selected decoder, cipher key, or destination is recovered.

## Decision and source motivation

Two separate prior original-source results invite a precise test before combining their cryptographic mechanisms.

- The red original p15 numeral **3299** and the historic Cicada identifier **3301** produce the affine map `T(x)=(3301-(3301-3299)x) mod29=(24-2x) mod29`. Against the **1,290** original within-printed-word pairs six runes apart, **80** actual ciphertext runes satisfy `C[j]=T(C[j-6])`. This is an unusually high original-input count and a retrospectively motivated map; it is neither a plaintext recovery nor a six-back cipher specification. See [red-3299 lag-six original report](lp2-red3299-twinprime-lag6-source-mechanism.md).
- The exact 256-cell original p49–51 numeric table under conventional base60 bytes has a reported source phase0 low-bit split of neighboring equalities and word-local five-back equalities, with opposite event-rate directions. See [p50-bit0 original two-tap report](lp2-p50-bit0-dualecho-two-tap-original-gate.md).

A human-readable synthesis could conjecture that **the same p50 low bit selects the appearance of the six-back red-3299 echo**. For example, a branch-selected anti-repeat rewrite might emit the affine echo more often in one table parity class. The **independent rival** is that two distinct rare-transition associations happen to coexist in the original source and have no shared cipher-control rule. Nothing in the manuscript prescribes the joint model. The previous red3299 coefficient is modulo29-aliased by two other p15 entries, an additional source-selector caveat.

## Frozen original-input discriminator

Read all **12,956** unchanged unknown p0–p55 GP runes, parsing exactly **2,896** original printed complete words, including **32 cross-page** carried words, from the canonical corpus and transcript. At every local word position `j>=6`, label whether `C[j]==(24-2*C[j-6]) mod29`. This produces **1,290** eligible sites and exactly **80** hits.

For each site at global zero-based rune index `i`, consult the 256 original p50 base60 bytes at `B[(i-1+phase) mod256]`. The `i-1` origin matches the previously documented p50-bit0 source convention. The source hypothesis fixes **phase0**; enumerate all **256** integer phases as a diagnostic, without selecting a favorable phase afterward.

Measure one binary event-rate log-likelihood gain against a pooled Bernoulli model. Train both branch event probabilities with a Beta(1/2,1/2) predictive pseudocount on **eight** original illustrated chapters, then score the withheld ninth; sum all nine withheld log gains. The exact original chapter cuts and parser are pinned by the [Windows Node22 source SFT](../sims/lp2_p50_bit0_red3299_lag6_gate_sft.cjs). No language model, guessed plaintext or fitted decipherment key is used.

## Original result

| Original p50 source phase0 bit | Eligible six-back sites | Red3299 affine echoes | Event rate |
| --- | ---: | ---: | ---: |
| Even (low bit0) | **671** | **40** | **5.961%** |
| Odd (low bit1) | **619** | **40** | **6.462%** |
| Entire original | **1,290** | **80** | **6.202%** |

The exact **nine-chapter out-of-sample log-likelihood gain is −0.470498024934 nats**, meaning parity stratification predicts the original events *worse* than the pooled baseline at the actual source phase0. This is **rank104 of256 source clock shifts**, with the best retrospectively selected phase236 gaining merely **+2.915872659 nats**. Per-chapter original gains are `[+0.03386,-0.11664,-0.04171,-0.02554,-0.02760,-0.33594,+0.03349,+0.00531,+0.00427]`, none furnishing a strong stable branch discriminator.

**Positive control:** keep every original one of 1,290 site and chapter positions, then replace event labels with a seeded synthetic model that deliberately makes source phase0 parity strongly predictive (14% for even, 1% for odd). The same full 256-phase scoring procedure gives source phase0 **rank1 of256**, even **112** hits vs odd **3**, and a withheld likelihood gain **+64.573092108 nats**. Thus the statistic detects a genuine source-clock event selector when planted under the exact original positional layout. It does not prove whether a weaker true clock exists below statistical power.

The complete program, fixed original 256-byte SHA-256, parser assertions, original all-phase census and seeded event control **passed on Windows Node22**: [GitHub Actions 45026710600](https://github.com/FlareZ123/liber-primus/actions/runs/45026710600).

## Research decision

Reject **direct phase0 p50-byte-parity selection of red3299/3301 six-back affine echo intensity** as a useful joint decipherment cue. There is no retained key, plaintext symbol, selected state transition, or statistically predictive event signal. The p15 lag-six anomaly and p50 parity vs lag1/lag5 observations remain distinct, individually provisional original-source leads. A future shared-mechanism proposal must supply an independently readable *different* operator with a novel withheld ciphertext prediction; optimizing hidden parity phases, source-number aliases or extra rewrite parameters around this negative would merely re-fit the same data.
