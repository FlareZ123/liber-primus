# Original GP29 no-doublet source: universal one-target repair bound

**Agent 4, 22 November 2026. Exact source contingency and parameter-free model-conditional tail.** One particularly simple attempt to explain the LP2 doublet deficit is statistically incompatible with the original manuscript. This is a constraint on the *possible upstream scrambling/repair architecture*, with **no new unknown ciphertext plaintext, authentic key, instruction or destination**.

## Source path and narrow generative model

The 55 rune-bearing unsolved LP2 physical pages p0–55 (p50 is runeless) contain 12,956 actual GP29 runes. They have **12,901 within-page consecutive transitions**, of which just **86** emit the same rune twice. All other 28 successor choices appear approximately uniform in the authentic aggregate, suggesting the plausible but **unverified** hypothesis of an independently uniform GP29 precursor stream whose ordinary collisions were deliberately suppressed.

A simple 2014-era human algorithm could retain all precursor symbols except at an equal-adjacent collision: when the new tentative GP29 symbol `u` equals the last emitted symbol `q`, either leave it unchanged or replace it by a fixed alternate `f(q) ≠ q`. The repair decision may depend on any extra unknown state, hidden key, time, page, or random choice. Give the puzzle creator the entire secret arbitrary map `f:{0..28}→{0..28}`, with 29 unrelated choices, and unlimited discretion over *whether* to repair each collision. What stays fixed in this model is that the **destination of each repaired repeat for a given predecessor q is one particular f(q)** and that ordinary non-colliding precursors are copied unchanged.

This is a **postprocessor**, not a lossless cipher without sidecar repair bits. For a complete reversible encoder it would require separately supplied side information identifying changes; the synthetic controls below include such side bits. The model assumes that the input to this postprocessor consists of independent **uniform** GP29 values. Source-flat rune counts are insufficient to establish that premise.

## Parameter-free all-secret invariant

For every source transition with previous emitted value `q`, define

```text
E(q,u) := 1 if emitted symbol is either q or f(q), else 0
```

**Crucial identity:** `E(q,u)=1` if and only if the *uniform precursor* was one of `q` and `f(q)`. Repair can move an attempted `q` to `f(q)`, but it cannot move any precursor into or out of that two-symbol set. Since precursor draws are independent and uniform, the sum over all **12,901** original within-page transitions would obey exactly

`V_f ~ Binomial(12,901, 2/29)`

**regardless of the map f and regardless of the repair policy or its time-varying probability**. The arbitrary preceding emitted q depends on earlier history, yet the conditional probability is always 2/29, so the Bernoulli events are independent. At page starts the first rune is an arbitrary initializer and not a transition.

How to test **all** secret maps without guessing one: construct the observed original 29×29 directed transition-count matrix `N[q][r]`. For any hidden fixed `f`, the observed event total is

```text
V_f = Σ_q (N[q][q] + N[q][f(q)])
    ≤ Σ_q (N[q][q] + max_{r≠q} N[q][r])
    = 86 + 714 = 800.
```

The right-hand side is an *exact maximizing envelope over all 28^29 possible secret predecessor-specific targets*, with no search and no language model.

| Original source statistic | Value |
| --- | ---: |
| All original within-page transitions | **12,901** |
| Actual repeat transitions | **86** |
| Sum of 29 most frequent off-diagonal row successors | **714** |
| Maximum possible `V_f` under any hidden one-target map | **800** |
| Null binomial event expectation | **889.72413793** |
| Null binomial standard deviation | **28.78131082** |
| Exact lower tail `Pr[Binom(12901,2/29) ≤ 800]` | **0.00083008286294** |

For *any* proposed source-independent fixed map `f`, the actual event count cannot exceed 800, placing its observation in the **lower 0.083%** of that model's exact distribution. The unknown choice of `f` introduces **no multiple-key penalty**: the observed threshold is already maximized over every secret map, and the hypothetical true map is among them. The chance quoted is a *conditional model test*, not a discovery-wide posterior probability for Cicada having used this scheme.

For contrast, the obvious `f(q)=q+1 mod29` map has only **543** source events, substantially less than even the all-secret upper envelope. An alternative with **two permitted replacement targets per q** is outside the rejected one-target family: the all-secret two-target envelope is **1,445**, above its corresponding binomial expectation **13,341/10 = 1,334.5862069** (12,901×3/29), so this particular invariant gives no equivalent rejection. The target count and its pattern require genuine independently provided key/side-channel evidence.

## Native solved-source controls and limitations

[The standalone CommonJS SFT](../sims/lp2_single_target_doublet_repair_allsecret_sft.cjs) reconstructs the complete original 29×29 matrix from the checked-in [original GP29 corpus](../resources/liber-primus/lp2-corpus.json), asserts all six key statistics and recomputes the small binomial tail with its own stable factorial recurrence. It also uses authentic clear p57 GP29 runes, repeated to the original 12,956-position page structure, and hides them beneath an independently generated deterministic HMAC-SHA256 counter pad.

Six source-length-matched **synthetic** witnesses then apply either a fixed `f(q)=q+1` repair or a uniformly chosen one-of-28 repair when the tentative precursor equals q; repair side bits and exact secret pads are saved. Both allow **12,956/12,956 exact recovered planted p57-derived plaintext runes**, and all six original-length generated transition inventories pass the implemented checks. The fixed-target plants exhibit the expected dominant true-f edges. The diffuse plants are diagnostics of a different, more flexible architecture, **not purported reproductions of the source**. [Windows Node 22 verified run](https://github.com/FlareZ123/liber-primus/actions/runs/45085771611).

The result constrains models which **copy every noncollision verbatim** and replace a collision with **exactly one predecessor-specific fixed substitute** after an iid-uniform GP29 stage. It is silent about precursor correlations, nonuniform symbols, replacement of additional non-collision positions, varying replacement destinations, word/page-dependent maps, deterministic rank28 encoders with external escape symbols, cryptographic key streams or other layers. The true unknown plaintext remains unidentified.

## Research decision

**Deprioritize all arbitrary-secret static one-target doublet-repair hypotheses of an iid-uniform precursor.** The original lacks their unavoidable combined `q,f(q)` transition mass even when each predecessor has its own independently secret target and even if the repair clock is free to vary. An intended reversible solution should instead identify a genuine source-selected full-alphabet encoder, evolving state, an authentic pad, or visible escape carrier that predicts original ciphertext and yields a complete new plaintext passage. Unmotivated additional single-target keys cannot change this original-source bound.
