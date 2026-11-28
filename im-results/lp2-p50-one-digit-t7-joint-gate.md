# LP2 p50 one-digit state / T7 joint gate

**Agent12, 28 November 2026. Classification: source-typed mechanism constraint; no plaintext or key recovered.**

## Decision

The strongest p50/T7 association now has a more specific source interpretation than "literal zero."

The already established source-phase mask is the set of p49–p51 cells whose **first printed digit is
`0`**. Under both surviving positional grammars this is exactly the same typed numerical state:

- base60: first digit `0` iff decoded value is **<60**;
- base59: first digit `0` iff decoded value is **<59**.

So the 33/86 adjacent-equality enrichment is **codec-invariant at the level of radix width**:
it selects the one-digit/high-digit-zero state regardless of whether the unresolved table codec is
base59 or base60. This is stronger than a generic zero-character observation and partially bridges
the previously separate p50 radix and T7-state findings.

However, the p50 state does **not** explain the T7 ordering by itself. Give the one-digit state and
its complement their exact observed maximum-likelihood repeat rates, condition the simulation on
the exact observed total of 86 equality events, and the generated equality-gap lag-1 correlation
remains centered near zero. In 30,000 deterministic-seed simulations only 14 reach the original
T7=+0.380019689 (add-one upper tail **0.00049998**). Even a more permissive three-rate model that
fits separate rates for cells with 0, 1, or 2 literal zero characters has only 9/30,000 at or above
the original (add-one **0.00033332**).

**Mechanism consequence:** a viable sender must explain both constraints jointly:

1. a forward, continuous, left-endpoint period-256 state keyed by the table's radix-width/high-digit
   class; and
2. the one-step overlap ordering in equality gaps (T7), which an independent p50-conditioned hazard
   does not generate.

This rules out the simplest "p50 one-digit state merely changes an independent repeat probability"
sender while preserving p50 as a serious state/gate operand.

## Source typing: why the mask is radix-width, not arbitrary typography

The canonical table source is
`resources/liber-primus/base60-grid.json`. Its printed alphabet is

`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`.

The existing radix audit keeps two byte grammars alive:

- base60 uses that alphabet;
- base59 drops lowercase `f`.

All 256 printed cells are legal under both grammars. For a two-character positional encoding
`high*radix + low`, the condition `high == 0` is exactly `value < radix`. Therefore the same
60 printed leading-zero cells are the **one-digit range** under either candidate codec:

```text
token starts "0"  <=>  base60(token) < 60
token starts "0"  <=>  base59(token) < 59
```

The codec ambiguity still matters to exact values above the first digit. It no longer matters to
this binary state predicate.

A nested source-field refinement is stronger: the five tokens matching `0[0-9]` are exactly values 0..9 under both radices and cover 10/86 repeats in 251 opportunities. Source phase 0 is their unique circular-shift maximum, the exact arbitrary-five-residue coverage tail is 0.00011134, and the nested tail inside the already established leading-zero state is 0.00021552. This narrows the p50 operand from a generic one-digit class to an exact radix-independent small-decimal state, while still leaving the receiver unknown. [Dedicated gate](lp2-p50-small-decimal-repeat-gate.md).

This does **not** choose base59 over base60, and it does not make the 256 cells a keystream. It
identifies one concrete table-derived state that survives the unresolved numerical interpretation.

## The signal is high-order-place specific

On the 12,901 within-page transition opportunities used by the p50 gate:

| cell class | opportunities | repeats | rate |
| --- | ---: | ---: | ---: |
| first digit nonzero | 9,876 | 53 | 0.53665% |
| first digit zero / one-digit state | 3,025 | 33 | 1.09091% |

Conditioned on 86 total repeat events, a uniform 3,025-of-12,901 marked-position null gives exact
hypergeometric upper tail **0.0013489911** for at least 33 hits.

A useful negative control separates place value from "contains a zero anywhere." Exactly three
table cells have a zero only in the **second** digit. They contribute 151 opportunities and only
one repeat (0.66225%); the same hypergeometric upper tail is **0.63792218**. Thus the enrichment is
not supported for low-order zero alone.

The two `00` cells are unusually repeat-rich (5/100 opportunities), but this is a tiny stratum.
The joint test below therefore does not promote a special `00` operator.

## Held-out T7 test: p50 hazard alone is insufficient

The original 86 equality positions give

`T7 = Corr(gap_n, gap_(n+1)) = +0.38001968924100965`.

The question is deliberately narrow: **could the p50 state association itself generate that
ordering without any additional state?**

### Model A: saturated two-rate one-digit hazard

Assign every valid transition an independent Bernoulli repeat event. Use the observed
maximum-likelihood rates:

- one-digit state: `q1 = 33 / 3025`;
- two-digit state: `q0 = 53 / 9876`.

Then condition exactly on the observed total of 86 events. This is favorable to the model: it
cannot fail merely because it generates the wrong total count, and it is explicitly fit to the
observed p50 enrichment before T7 is checked.

For each conditioned draw, event positions within a state class are uniform. With standard-library
Python RNG seed 3301 and 30,000 draws:

| statistic | result |
| --- | ---: |
| median simulated T7 | **-0.01866** |
| central 95% interval | **[-0.20429, +0.20616]** |
| draws with T7 >= original | **14 / 30,000** |
| add-one upper tail | **0.00049998** |

### Model B: saturated 0/1/2-zero dose hazard

To give the literal-zero interpretation extra flexibility, fit an independent repeat rate to each
zero-count class:

- 0 zeros: 52/9,725;
- 1 zero: 29/3,076;
- 2 zeros: 5/100.

Again condition exactly on 86 total events. Seed 3302, 30,000 draws:

| statistic | result |
| --- | ---: |
| median simulated T7 | **-0.01919** |
| central 95% interval | **[-0.20356, +0.20848]** |
| draws with T7 >= original | **9 / 30,000** |
| add-one upper tail | **0.00033332** |

The more permissive zero-dose model does not repair the ordering.

### Model C: ordered adjacent high-digit pair hazard

The most literal source-visible two-input follow-up uses the ordered pair
`(z_i, z_(i+1))`, where `z=1` means the p50 cell is in the one-digit/high-digit-zero state.
Consecutive pair states share exactly one p50 operand, so this grants the model the overlap shape
suggested by T7 without inventing a hidden sequence.

Give all four ordered classes their own observed maximum-likelihood repeat rates:

| `z_i z_(i+1)` | opportunities | repeats | fitted rate |
| --- | ---: | ---: | ---: |
| 00 | 7,556 | 42 | 0.55585% |
| 01 | 2,320 | 11 | 0.47414% |
| 10 | 2,318 | 29 | 1.25108% |
| 11 | 707 | 4 | 0.56577% |

The direction already selected by the source association is visible here: enrichment is concentrated
in class `10`, where the **left/current** cell is one-digit and the next is not. Nevertheless,
conditioning exactly on 86 total events and drawing 30,000 times with standard-library seed 3303
still gives:

| statistic | result |
| --- | ---: |
| median simulated T7 | **-0.01726** |
| central 95% interval | **[-0.20164, +0.21150]** |
| draws with T7 >= original | **5 / 30,000** |
| add-one upper tail | **0.00019999** |

Thus even an explicitly overlapping adjacent p50 high-digit state, with four independently fitted
hazards, does not reproduce the long-range equality-gap ordering.

These are conditional model diagnostics, not universal cipher p-values. All three models
deliberately use parameters estimated from the original p50 enrichment; T7 is the held-out feature.

## Relationship to the existing two-tap result

The current two-tap renewal model does the complementary job:

- it reproduces T7 and the equality-gap shape;
- it fails the p50 one-digit enrichment as a held-out source feature.

This report shows the converse:

- the p50 one-digit state is a real typed source predicate;
- an independent p50-conditioned hazard fails T7.

The two observations therefore cannot replace one another. A plausible generator needs a joint
law. The ordered adjacent-high-digit hazard shows that **sharing a visible p50 operand is not
enough**. The strongest source-facing target is now a stateful period-256 construction in which the
p50 high digit affects an **interval/update law or another persistent register**, rather than merely
setting an independent local repeat probability. Such a mechanism must preserve the source-selected
forward continuous left-endpoint phase while generating the one-step equality-gap dependence.

This does not license arbitrary functions of p50 values. The next experiment should be tied to a
visible operation (for example a carry/high-digit transition or another historically motivated
two-input rule) and must predict both the phase-zero enrichment and T7 before language scoring.

## Reproduction

Run from repository root:

```text
python sims/lp2_p50_one_digit_t7_joint_gate_sft.py
```

The SFT reads only the canonical LP2 corpus and the canonical 256-cell table, verifies the
base59/base60 one-digit equivalence, reconstructs all 12,901 valid transitions and 86 equality
events, reproduces T7, computes the source-state exact tails, and executes both conditioned
30,000-draw tests with fixed seeds.

Related established work:

- [T7 two-input renewal model](lp2-t7-correlated-renewal-state-model.md)
- [p50 radix-codebook ambiguity and source traversal](lp2-p50-radix-codebook-overlap-source-gate.md)
- [authoritative synthesis](../results/README.md)
