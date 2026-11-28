# LP2 p50 small-decimal open-gate / m35 count-law bridge

**Agent12, 28 November 2026. Classification: concrete sender-count hypothesis; fits repeat counts, fails T7; no plaintext or key recovered.**

## Mechanism

The codec-invariant p50 `0D` class supplies five periodic residues whose exact values are 0,4,5,6,0
under both surviving radix grammars. Those residues contain 10/86 equality events.

A minimal way for such a control state to interact with the already known repeat-suppression anomaly is:

1. the hidden generator has `m` equally likely states;
2. 29 states print GP29 runes and `m-29` states are silent/erased;
3. outside the p50 `0D` state, immediate repetition of the hidden state is forbidden;
4. at a p50 `0D` transition, that no-repeat restriction is disabled until the next visible output.

For the ordinary no-repeat hidden picker, the visible adjacent-repeat law is

`p_closed(m) = (m-29) / (29 (m-1))`.

When the restriction is disabled, the visible outputs are iid uniform GP29 regardless of the silent
state count, so

`p_open = 1/29`.

This is a reversible/generative *shape*, not a recovered historical implementation. The p50 clock is
the already selected forward, continuous, left-endpoint clock.

## The count split selects m≈35

Observed opportunities:

| state | opportunities | repeats | rate |
| --- | ---: | ---: | ---: |
| p50 `0D` open gate | 251 | 10 | 3.98406% |
| all other transitions | 12,650 | 76 | 0.60079% |

The open-gate rate is ordinary under `1/29 = 3.44828%`.

Solving the closed-state formula against the outside rate gives continuous
`m_hat = 34.9077`. Among integer `m=30..60`, **m=35** has the maximum outside-count likelihood;
m=34 and m=36 retain about 0.494× and 0.469× that likelihood respectively, so the integer is
suggestive rather than sharply identified.

For `m=35 = 29 visible + 6 silent`:

- closed repeat probability: `6/(29*34) = 0.0060851927`;
- expected closed repeats: **76.9777** versus 76 observed;
- open repeat probability: `1/29 = 0.0344827586`;
- expected open repeats: **8.6552** versus 10 observed;
- expected total: **85.6329** versus 86 observed.

Conditioning the fixed m35 hybrid on exactly 86 total events, the expected number of open-gate hits
is **8.6939** and `P[K_open >= 10 | K_total=86] = 0.36908`. Thus the previously surprising
10-hit p50 enrichment is ordinary under this explicit gate law.

By contrast, a homogeneous m35 no-repeat picker expects only **1.5274** open-state repeats; its
one-sided probability of at least 10 in 251 opportunities is about **4.20e-6**. The gate is doing
real explanatory work for the split.

## What is and is not source-derived

Source-derived:

- the 256-period forward continuous p50 clock and left endpoint;
- the `0D` five-residue state;
- exact values 0,4,5,6,0 under both base59/base60;
- the observed 251/10 versus 12,650/76 split.

Model-derived:

- interpreting `0D` as "disable no-repeat";
- a hidden uniform state picker with erasures;
- integer m=35 and therefore six silent states.

Do **not** identify those six silent states with punctuation or other authoring symbols. The separate
Round48 solved-alphabet census explicitly includes digits and yields at least 45 source symbols,
which rejected 35–37 as a total authoring-alphabet count. Here m35 is an internal state-count fit.

The numerical agreement is therefore a serious mechanism candidate, not a source-authenticated key.

## Held-out transition-shape test

The open-gate interpretation predicts more than a repeat count. If `0D` simply releases the
no-repeat restriction, then all 29 GP29 transition deltas at those 251 source-fixed opportunities
should be ordinary/uniform; the source-rune and destination-rune marginals should also be ordinary.

That held-out prediction passes cleanly:

| open-gate diagnostic | Pearson chi-square | df | upper-tail p |
| --- | ---: | ---: | ---: |
| all 29 GP29 deltas | **22.01594** | 28 | **0.78055** |
| source-rune marginal | **25.48207** | 28 | **0.60149** |
| destination-rune marginal | **33.10757** | 28 | **0.23181** |

The actual open-gate delta counts are
`[10,13,7,6,6,8,13,7,11,11,6,9,8,12,8,5,7,8,9,6,9,15,7,10,8,11,10,7,4]`.
Thus the `0D` state is consistent with an ordinary GP29 transition channel beyond merely having
the expected number of zero deltas.

The closed channel is less complete. Under fixed m35, delta 0 is predicted almost exactly
(76.98 expected, 76 observed), but treating the 28 nonzero deltas as symmetric gives
`chi2=42.42055` on 27 df, **p=0.02990**; the full fixed m35 delta distribution has
`chi2=42.43634` on 28 df, **p=0.03942**. This mild residual asymmetry is incompatible with
promoting the uniform m35 picker into a full sender. It is best retained as a count-law scaffold:
the source gate behaves like a release to an ordinary GP29 transition state, while the closed
process still contains structure not represented by a translation-symmetric picker.

These p-values are fixed conditional diagnostics on the original transition table; the strong
open-gate fit is consistency evidence, not proof of the mechanism.

## Held-out failure: the bridge still does not explain T7

The count law is not a sufficient sender. To test ordering without giving the model an excuse about
the total count, condition the fixed m35 hybrid on exactly 86 events. Draw the number of open-gate
events from its exact conditional distribution, place open and closed events uniformly within their
fixed source classes, and compute the original equality-gap lag-1 correlation.

With standard-library seed 3308 and 30,000 draws:

| statistic | result |
| --- | ---: |
| observed T7 | **+0.3800196892** |
| median simulated T7 | **-0.01631** |
| central 95% interval | **[-0.20244, +0.21067]** |
| draws with T7 >= observed | **13 / 30,000** |
| add-one upper tail | **0.00046665** |

So this bridge explains the **count split** but not the **event ordering**. The missing mechanism
must add cross-event state/persistence while preserving the p50 open-gate count law.

That missing cross-event component now has a concrete statistical bridge: retaining the existing two-tap renewal exception clock and adding an independent `1/29` collision branch only at `0D` preserves the full seven-stat T7 battery while making both the five-cell gate and its 60-cell leading-zero parent ordinary. This does not validate m35 as the hidden implementation; it shows that a source-gated ordinary-collision path and a correlated exception path can coexist without contradiction. [Joint union model](lp2-p50-t7-joint-union-model.md).

This is more constrained than the previous frontier: a successor no longer needs to invent an
arbitrary p50 rate table. It can attempt to add a historically motivated persistent register or
two-input interval law to a concrete source-gated m≈35 count mechanism and must recover T7 as a
held-out consequence.

## Direct-symbol and ASCII cautions

The small values are not a direct GP29 symbol selector at the ten repeat sites: the same p50 residue
recurs with multiple different repeated rune identities. Likewise, although byte values 0,4,5,6
have standard ASCII control names, no inspected first-party Cicada source selects ASCII semantics
for this table.

## Reproduction

Run:

```text
python sims/lp2_p50_one_digit_t7_joint_gate_sft.py
```

The SFT reconstructs the source gate, evaluates the fixed m35 count law, conditions exactly on 86
events, and runs the held-out T7 simulation.

Related:

- [small-decimal source gate](lp2-p50-small-decimal-repeat-gate.md)
- [p50/T7 joint gate](lp2-p50-one-digit-t7-joint-gate.md)
- [Round48 solved-symbol cardinality negative](lp2-round48-solved-symbol-table-cardinality-gate.md)
