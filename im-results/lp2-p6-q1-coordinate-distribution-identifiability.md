# P6 q1 page-key sums do not identify ordered coordinate keys

**Agent1, 28 November 2026. Classification: exact target-rune-blind non-identifiability gate for Director issue #3401. No p37–p40 holdout was opened. No unknown plaintext or authentic ordered key is claimed.**

## Decision

The frozen p6 page-key-sum tape does not select a complete coordinatewise key on the first q block p32–p35, even inside a deliberately narrow low-description family. A literal source-anchor arithmetic-progression family has no four-page checksum solution; the minimal checksum-normalized relaxation has 29 distinct solutions, and restricting its one global slope to numeric values visibly present on p6 still leaves 17 distinct complete key streams.

Issue #3401 therefore stops at its prescribed gate. The second q block p37–p40 remains sealed: there is no target-rune-blind basis for choosing one q1 serializer to freeze and transfer.

## Frozen source-only inputs

Only already established receiver geometry and p6 checksum fields are used:

```text
page        p32  p33  p34  p35
start        30  132    4   25
Q=floor/29    1    4    0    0
R=start%29    1   16    4   25
arity n       3    4    2    5
p6 title T   24   16   14   17
companion D   9   13   15    8
key sum sigma 4    0    0   25
receiver GP0  5   28    6    3
slot          0    1    2    3
```

The identity `sigma=T+D mod29` is checked in the reproducer. The script contains no authenticated target rune vectors, no fitted p32–p35 coordinate keys, and no p37–p40 receiver data.

The q1 receiver starts come from the existing p6-only block1 address grammar. The page-key sums come from the independent p6 checksum scheduler. This test asks only whether those scalar constraints identify an ordered key.

## Gate A: literal anchored arithmetic progressions

First test the rigid form

```text
K_i[j] = A_i + s*j mod29,
```

with one global slope `s` and a source-visible page anchor `A_i`. Charge these 13 anchor roles:

```text
Q, R, n, T, D, Csum, slot,
Q+R, Q-R, R-Q,
T+D, T-D, D-T.
```

Crossing all 13 roles with all 29 slopes gives **377 labeled rules**. Require the generated key on every p32–p35 page to have the already frozen page sum `sigma_i`.

Result:

```text
377 labeled rules
0 satisfy all four q1 page-key sums.
```

So the most literal one-anchor/one-slope reading of the available geometry does not even reach the checksum tape. This is a target-rune-blind rejection; no plaintext coordinates are consulted.

## Gate B: minimal checksum-normalized arithmetic progression

Relax only the intercept. Keep one global left-to-right slope `s`, but let the page intercept be the unique value forced by the frozen checksum and visible arity:

```text
K_i[j] = b_i(s) + s*j mod29

b_i(s)
= (sigma_i - s*n_i*(n_i-1)/2) * n_i^-1 mod29.
```

Because all q1 arities are nonzero modulo29, `b_i(s)` exists uniquely for every `s`.

This family is intentionally tiny: one global GF29 scalar determines the complete ordered keys on all four pages. Yet the checksum gate cannot choose it:

```text
29 slopes in GF(29)
29 distinct complete four-page key streams
29/29 satisfy all four frozen page-key sums.
```

Restrict the global slope to values already printed or derived by the p6 source grammar itself. Take the union of:

- Fehu `0`;
- the eleven red-title rune values;
- title-word lengths `[4,1,4,2]`;
- frozen `H4(title lengths)=[2,26,5,6]`;
- closing red marker `13`;
- 13-dot stencil column populations `[4,5,4]`;
- balanced black-line width `20`, already used by the checksum scheduler.

These collapse to **17 distinct numeric slopes**:

```text
[0,1,2,4,5,6,12,13,14,15,16,17,19,20,24,26,27].
```

All 17 generate distinct complete q1 key streams and all 17 satisfy every frozen q1 checksum. Examples include:

```text
s=0
p32 [11,11,11]
p33 [0,0,0,0]
p34 [0,0]
p35 [5,5,5,5,5]

s=1
p32 [10,11,12]
p33 [13,14,15,16]
p34 [14,15]
p35 [3,4,5,6,7]

s=2
p32 [9,11,13]
p33 [26,28,1,3]
p34 [28,1]
p35 [1,3,5,7,9]
```

No target-rune-blind fact in the #3401 input distinguishes these slopes. Choosing among them would require an additional authored coordinate opcode or a target-derived criterion, which is precisely the missing information the issue was intended to test.

## Why the ambiguity is structural

A scalar checksum supplies one linear equation for an `n`-rune key. Before adding any coordinate grammar, the four q1 pages have

```text
(3-1)+(4-1)+(2-1)+(5-1)=10
```

free GF29 coordinates, hence

```text
29^10 = 420,707,233,300,201
```

raw ordered key tuples with the same four page sums.

The normalized-progression gate is much stronger than merely restating that count: even after compressing the entire four-page serializer to **one global slope**, and even after demanding that slope be a numeric value already visible on p6, the source-only evidence still leaves 17 distinct complete ordered serializers.

## H-free p50 state packet supplies page-specific slopes, but the frozen transfer fails

A later cross-artifact result removes the specific nonidentifiability left by Gate B without consulting q-block target runes. P6 mirror-pair widths plus the independently ordered/directed p50 strict supports select the ordered state packet

```text
[K,-e,g,a] = [2,26,5,6] mod29.
```

This gives a new, source-constrained coordinate law that was unavailable when #3401 closed: assign those four slopes in printed page order to each q-sized block, and let the already frozen page checksum determine the unique intercept

```text
K_i[j] = b_i + s_i*j mod29
b_i = (sigma_i - s_i*n_i*(n_i-1)/2) * n_i^-1 mod29.
```

The exact serializer was committed **before** target-word grading in `e9e84c46de2e6123a9e41811b491ae40b22a3b67`; all eight raw q1/q3 outputs were frozen separately in `56ab57a383599f4c0ca4b005b108a2780c108865`. The resulting keys are:

```text
q1 p32 [9,11,13]
    p33 [19,16,13,10]
    p34 [12,17]
    p35 [22,28,5,11,17]

q3 p37 [6,8,10,12]
    p38 [22,19,16,13,10,7]
    p39 [13,18,23,28,4]
    p40 [20,26,3,9]
```

Post-freeze grading against the authenticated q-block source words gives **0/8 complete words and 2/33 rune-coordinate matches**. The two coordinate matches are p35 final and p40 initial; there is no connected plaintext.

This is a useful negative because it tests the most direct coordinate lift unlocked by the new H-free state serializer while preserving every established receiver and scalar checksum. Do **not** rescue it by wrapping coordinates, reassigning the four slopes, reversing per-page progressions, or adding offsets after target inspection. A successful ordered-key decoder still needs a different independently authored coordinate operation.

Reproducer: [freeze SFT](../sims/lp2_p6_p50_hfree_qblock_slope_freeze_sft.cjs) · [frozen raw outputs](lp2-p6-p50-hfree-qblock-slope-pretarget.json) · [post-freeze grader](../sims/lp2_p6_p50_hfree_qblock_slope_grader_sft.cjs).

## Consequence for the corridor

The p6 page-key-sum tape remains a real checksum constraint and a useful falsification gate for candidate decoders. It is not, by itself, coordinatewise decoder evidence.

Under the #3401 completion rule, the correct action is therefore to **not open p37–p40**. A successor must first supply a source-visible coordinate opcode that chooses one ordered q1 serializer without authenticated plaintext values. Only then is a prospective q3 transfer informative.

This narrows the promotion gate cleanly: receiver location and scalar page sums are now separated from the missing coordinate law. Future work should test an independently authored ordering/state instruction, rather than distribute checksum deficits by another post-target rule.

## Reproduction

Run:

```text
node sims/lp2_p6_q1_coordinate_distribution_identifiability_sft.cjs
```

The SFT asserts the frozen q1 inputs, exhausts the 377 anchored rules, constructs all 29 checksum-normalized slopes, proves their complete key streams are distinct, restricts to the 17 visible-p6 slopes, and never loads target rune values or second-block data.
