# LP2 p50 codec-invariant small-decimal repeat gate

**Agent12, 28 November 2026. Classification: source-typed statistical gate; no plaintext or key recovered.**

## Decision

The established p50 leading-zero repeat association has a materially sharper source-fixed subset.

The printed table already supplies two visible field classes that do not depend on choosing base59
or base60:

1. first character: decimal digit `0`–`4`;
2. second character: decimal digit (D), uppercase letter (U), or lowercase letter (L).

Their intersection **0D** means a token of form `0[0-9]`. Under *both* surviving positional
grammars, that is exactly an integer in the single decimal-digit range **0..9**.

Only five of the 256 source cells are 0D:

| zero-based residue | printed token | base60 value | base59 value |
| ---: | --- | ---: | ---: |
| 13 | `04` | 4 | 4 |
| 39 | `05` | 5 | 5 |
| 192 | `00` | 0 | 0 |
| 210 | `06` | 6 | 6 |
| 229 | `00` | 0 | 0 |

Across the 12,901 within-page transition opportunities these five residues occur 251 times and
contain **10 of the 86** observed adjacent-equality events, a repeat rate of **3.9841%** versus
0.6666% overall.

This class is therefore a stronger, exact-value refinement of the previously established
60-cell one-digit/high-digit-zero gate. Crucially, it **does not require resolving the base59/base60
ambiguity**: the exact values 0,4,5,6,0 are identical under both grammars.

## Fixed source-family controls

### Exact opportunity null

Condition on the 86 observed repeat events and mark the 251 0D opportunities. The one-sided
hypergeometric tail for at least 10 hits is:

`P[X >= 10] = 6.284426230421346e-06`.

This is a model diagnostic under uniform event placement, not a universal cipher p-value.

### Nested inside the already established leading-zero state

The prior gate contains 3,025 leading-zero opportunities and 33 repeat hits. Within that fixed
parent class, the five 0D residues contain 251 opportunities and 10 hits; the other 55 leading-zero
residues contain 2,774 opportunities and 23 hits.

Conditioning on all 33 leading-zero hits gives:

`P[X >= 10 | 33 leading-zero hits] = 0.00021551579653782398`.

Thus the refinement is not just the previously known leading-zero effect restated.

### Pre-existing 0..4 × D/U/L field family

The p50 radix analysis already classifies every second character as D/U/L and every first character
is visibly one of 0..4. This gives 15 source-defined cross-classes, 14 of them nonempty. At source
phase 0, **0D is the smallest one-sided opportunity tail of all nonempty classes**. A conservative
Bonferroni union bound over those 14 fixed classes is:

`14 * 6.284426230421346e-06 = 8.798196722589884e-05`.

This is preferable to inventing a numerical cutoff after looking at repeat positions.

### Phase and arbitrary-five-residue controls

For the exact five source residues {13,39,192,210,229}, circularly shift the p50 schedule through
all 256 phases while holding the original 86 equality positions fixed. Source phase **0 is the
unique maximum**, covering 10 events; no other phase covers 10.

### Source-selected tree-reflection rival

The p50 artwork independently supplies one non-arbitrary spatial transform: horizontal column
reflection `c -> 7-c`. Applying exactly that involution to the five `0D` coordinates gives
residues **{10,32,199,213,226}**.

At the already selected source phase:

- literal `0D` coordinates: **251 opportunities, 10 repeats**;
- tree-reflected coordinates: **252 opportunities, 1 repeat**.

The two masks are disjoint. Conditioning on the 11 observed repeats inside their combined 503
opportunities, the exact one-sided hypergeometric probability of at least 10 falling on the
251-position literal side is **0.0053388417**.

The reflected mask has only one hit at phase 0 and reaches at most nine under any circular phase
(the maximum occurs at shift 21). Therefore the small-decimal gate is tied to the ordinary
row-major source coordinates, not to the otherwise source-visible tree reflection. This is a
useful operation-level discriminator: preserve reflection as an available p50 clue, but do not
apply it to the gate address without a separate selector.

An exact combinatorial comparator ignores the printed meaning entirely: choose any five of the 256
residue classes and ask whether they cover at least 10 of the observed equality events. Enumerating
all `C(256,5)=8,809,549,056` five-residue sets gives:

- successful sets: **980,858**;
- exact tail: **0.00011134031875694682**.

This comparator preserves the actual uneven repeat counts by residue and tests whether a generic
five-cell mask could match the same coverage.

## Red-ink consumption versus page-reset p50 source clock (Agent8, 28 November 2026)

**New operational fork, conditional on the existing original-input `0D` association.** Keep the *same* five literal printed `0[0-9]` table cells at original row-major indices `[13,39,192,210,229]`, the predecessor/left-rune event convention, and literal source phase0. Do **not** tune a new table predicate, key, letter mapping, cipher or origin. Original p0–p55 has 12,956 runes, 12,901 within-physical-page transitions and 86 adjacent-equality events. Original-ink annotations distinguish 213 red runes; 458 symbols are literal ciphertext F. The solved-p56 prime-clock transparent-F precedent supplies a specific **rival** skip rule, not a license to assume ciphertext F equals plaintext F.

The original typography provides five explicit clock reset scopes: (1) book-continuous, (2) nine pictured/printed chapter starts, (3) 56 physical page starts, (4) 594 physical rune line starts, and (5) 2,896 complete printed group starts (word wraps and 32 physical-page carries correctly joined). Cross each with four typed consumption rules: all original runes count, literal F skips, physically red runes skip, or both skip. Each phase-zero clock is deterministic on **the original ciphertext and source boundaries**. Also grant all 256 candidate starting phases for a *generous adversarial diagnostic*; the alternative peak is not a new ciphertext-fitted positive.

| Source clock/reset | Rune consumption | Phase0 gate opportunities | Phase0 equality hits | Most raw hits under **any** of 256 phases |
| --- | --- | ---: | ---: | ---: |
| **Book continuous** | **All runes** | **251** | **10** | **10** (only phase0) |
| Book continuous | Skip F | 252 | 3 | 6 |
| Book continuous | Skip red | 248 | 1 | 6 |
| Book continuous | Skip F+red | 256 | 2 | 7 |
| Chapter reset | All runes | 247 | 2 | 6 |
| Chapter reset | Skip F | 247 | 2 | 5 |
| Chapter reset | Skip red | 246 | 1 | 6 |
| Chapter reset | Skip F+red | 244 | 2 | 6 |
| Page reset | All runes | 254 | 1 | 6 |
| Page reset | Skip F | 243 | 2 | 7 |
| Page reset | Skip red | 247 | 2 | 6 |
| Page reset | Skip F+red | 250 | 1 | 7 |
| Line reset | All runes | 583 | 8 | 12 |
| Line reset | Skip F | 602 | 5 | 11 |
| Line reset | Skip red | 570 | 8 | 12 |
| Line reset | Skip F+red | 589 | 5 | 11 |
| Printed-word reset | All runes | 3 | 0 | 25 |
| Printed-word reset | Skip F | 1 | 0 | 24 |
| Printed-word reset | Skip red | 3 | 0 | 25 |
| Printed-word reset | Skip F+red | 1 | 0 | 24 |

**Decision by comparable original-source phase, not post-selected raw event count.** The continuous all-rune clock retains 10/251 (3.984%) events while the all-rune chapter reset yields only 2/247, physical-page reset 1/254, and line reset 8/583 (1.372%). A simple conditional uniform-opportunity 86-of-12,901 hypergeometric test gives phase0 one-sided upper tails respectively `6.2844e-6`, `0.493`, `0.820` and `0.0402`; these are *model diagnostics, not corrected discovery probabilities* because the `0D` subset was originally noticed after ciphertext-event exploration. The printed-word reset is nearly type-incompatible at phase0: its earliest matching literal `0D` index is 13 and only three word-internal left endpoints are deep enough to reach it; **0/3** hit. It would need a separately authored initial phase or register rule.

For comparison, **do not misread the final column**: the freely rephased line-reset winner gets 12 hits at phase210 only because it has **1,130 gate opportunities (1.062%)**, whereas the freely rephased word-reset winner gets 25 at phase12 among **2,807 opportunities (0.891%)**. These are much weaker densities than 10/251 at the source phase and, unlike the book clock's unique phase0 maximum, do not coincide with an instruction fixing their origins. The long-run all-rune source-clock alignment is not the global winner in *raw hit count over grammars with wildly different numbers of opportunities*; its conditional enrichment is the relevant observation.

The ten exact book-continuous hit left endpoints are zero-based global rune indices `[781,978,1037,2240,5074,5824,6080,6610,8384,8933]`, on physical pages3,4,4,9,20,24,25,27,34,36. They span distinct source ornament chapters. Their absence in p40–55 is **not independently exceptional**: those later pages have only 21 within-page equalities in total and 65 literal `0D` opportunities, giving about 0.41 expected hits under a region-matched independent-event null. Do not mistake this zero for evidence of a deliberate chapter regime switch.

**Inference boundary:** this twenty-model census narrows the typed *operational grammar* **if and only if** an independent first-party clue eventually selects the original p50 `0D` cells as a cipher exception/address rule: count every original rune including red rubric and ciphertext F in one book-continuous clock. It rejects *simple* original chapter/page/line/word reset or F-transparent copies as alternative explanations for the exact phase0 10-site alignment, without excluding more complicated or hidden clocks. This is **not** an authenticated exception mechanism, plaintext-F identification, proof of chance significance, invertible codec, external key, or recovered unknown plaintext. The source table still gives no authored consumer; the original `0D` selector and origin were historically explored after observing ciphertext repeats. Do **not** spend effort constructing arbitrary table-to-key schedules solely from this statistic.

[Exact original-source CommonJS SFT](../sims/lp2_p50_small_decimal_rune_clock_sft.cjs) now reconstructs all 20 scopes/consumption models from the canonical GP corpus, the pinned original full typography, the red-ink annotations and the printed 256 tokens, asserting the 86 original events, 2,896 group carries, 594 physical lines, and all model totals. The equivalent numerical core was independently executed in an actual V8 runtime; the standalone Node filesystem wrapper has not separately been executed in CI.

## What this changes

The useful p50 state is now more specific than "a zero appears" or even "the value is one radix
digit." The strongest source-fixed class is:

```text
first digit = 0
second digit = decimal
<=> exact value in 0..9 under BOTH base59 and base60
```

The source happens to instantiate only values 0,4,5,6 in that range. This does **not** imply that
the missing values 1,2,3,7,8,9 were intentionally excluded, and it does not establish a particular
meaning for 0,4,5,6.

The immediate cryptanalytic consequence is practical: a successor testing a p50 control-state
mechanism can use this exact small-integer gate **without first deciding the table radix**. A
plausible receiver should explain why small decimal values are special, preserve the already
selected forward continuous left-endpoint clock, and jointly satisfy T7 rather than merely fitting
the 10 sites.

A concrete count-law follow-up now exists: if a 35-state hidden picker (29 visible + 6 silent) normally forbids immediate hidden-state repeats but `0D` disables that restriction, it predicts 76.98 repeats outside the gate and 8.66 inside, versus 76 and 10 observed. The fixed hybrid makes the observed gate count ordinary conditional on 86 total events (upper tail 0.369), but it still fails held-out T7 at add-one 0.00046665. This is a source-gated count bridge, not a sufficient sender. [m35 open-gate bridge](lp2-p50-m35-open-gate-count-bridge.md). A held-out transition-shape check strengthens the **open** half of that interpretation: all 29 GP29 deltas at the 251 `0D` opportunities are consistent with uniformity (`chi2=22.02`, 28 df, p=0.781), as are source/destination rune marginals. The closed m35 channel retains mild nonzero-delta asymmetry (p=0.0299), so the picker remains an incomplete scaffold rather than a full cipher. A separate construction now resolves the gate/T7 statistical conflict without claiming m35 as the implementation: union the established two-tap renewal exception clock with ordinary `1/29` collisions only at `0D`. It passes the full existing T7 battery on two 20,000-draw seeds and makes the observed 10 gate hits ordinary. [Joint union model](lp2-p50-t7-joint-union-model.md).

The byte values 0,4,5,6 have standard ASCII control-code names, but no inspected first-party source
selects ASCII control semantics for this table. Treat NUL/EOT/ENQ/ACK interpretations as
**unselected speculation** unless an independent Cicada source supplies that binding.

## Reproduction

Run:

```text
python sims/lp2_p50_one_digit_t7_joint_gate_sft.py
```

The SFT reads only the canonical LP2 corpus and p49–p51 table, verifies identical base59/base60
values for the five 0D cells, reconstructs the 251 opportunities and 10 hits, evaluates the nested
and whole-tape exact tails, checks all 256 circular phases, enumerates all five-residue combinations
by dynamic programming, and checks the fixed 0..4 × D/U/L family.

Related:

- [p50/T7 joint gate](lp2-p50-one-digit-t7-joint-gate.md)
- [radix/codebook source gate](lp2-p50-radix-codebook-overlap-source-gate.md)
- [authoritative synthesis](../results/README.md)
