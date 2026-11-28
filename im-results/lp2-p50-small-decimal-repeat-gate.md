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

**Distinct operational decision, conditional on the existing original-input 0D correlation.** Instead of fitting any new p50 lookup, cipher, letter map or phase, compare eight explicitly typed possible clocks for the *same already-known* five literal `0[0-9]` table tokens, at row-major zero-based indices `[13,39,192,210,229]`. Count the left rune of each of the 12,901 within-page transitions, including the 86 adjacent equalities, using the original 12,956-rune p0–p55 tape. The pinned original-ink annotations mark 213 of those unsolved runes red (p0 heading is the corrected full 13 red runes); 458 runes have the original glyph F. Two continuous/page-reset clocks each count (i) all runes, (ii) skip red, (iii) skip literal F, or (iv) skip both. Literal F skipping is specifically motivated by the independent solved-p56 prime-shift rule. Source phase starts at zero. Skipped endpoints remain on the last consumed counter position.

| Frozen original source-clock rule | Phase-zero 0D opportunities | Phase-zero repeats | Highest repeats under **any** of 256 phases |
| --- | ---: | ---: | ---: |
| Continuous, all runes consumed | **251** | **10** | **10** (unique phase zero) |
| Continuous, literal F skipped | 252 | 3 | 6 |
| Continuous, red runes skipped | 248 | 1 | 6 |
| Continuous, F and red skipped | 256 | 2 | 7 |
| Restart each physical page, all runes | 254 | 1 | 6 |
| Restart each page, F skipped | 243 | 2 | 7 |
| Restart each page, red skipped | 247 | 2 | 6 |
| Restart each page, F and red skipped | 250 | 1 | 7 |

The ten exact full-clock repeat endpoints are global left-rune indices `[781,978,1037,2240,5074,5824,6080,6610,8384,8933]`, on physical pp3,4,4,9,20,24,25,27,34,36. They are not one localized patch. The source-motivated all-runes continuous clock thus retains the original 0D association, while **none** of the seven rivals reaches 10 hits even with all 256 possible phase origins. This includes the source-motivated transparent-F model: **if** the p50 source gate actually drives the cipher, its clock would need to count each printed F, unlike the authentically solved p56 prime-shift clock. The two halves give 7 and 3 hits under the full clock; the absence of later hits is a reason not to presume a stationary book-wide sender.

**What this establishes and does not:** These are exact counts and **relative discrimination of eight frozen clocks**, not authenticated key consumption or a decryption. The 0D subset and earlier leading-zero association were originally noticed after inspecting original repeat sites, and the table has no independently authored receiver. No phase/global-significance claim, unobserved-plaintext prediction or cipher state follows from this conditional alignment alone. Its use is narrow: if a future source binds p50 0D to the cipher's exception gate, model every physical rune (including literal F and red headings) in one continuing source clock before pursuing a transparent-F, red-skipping or page-restart alternative. Do not introduce more table-to-key schedules on this evidence.

[Standalone deterministic source-data SFT](../sims/lp2_p50_small_decimal_rune_clock_sft.cjs) asserts all ten original sites and all eight models, using the canonical GP source tape, the printed tokens and the separate red-ink annotations. It is a clock-specific extension of this consolidated gate, not new unknown plaintext.

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
