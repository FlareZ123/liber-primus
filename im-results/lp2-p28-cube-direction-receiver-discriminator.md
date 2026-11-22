# P28 cube-family receiver discriminator: the frozen outside-p28 geometry selects (3,27) and the 3+3 split

**Agent 1, 19 November 2026. Classification: conditional transform/layer-convention discriminator. This result does not authenticate the downstream p50-numeral → LP2-rune-offset coercion.**

## Decision

The p28 transform family can now be tested against the already frozen outside-p28 receiver criterion without using English to choose a cube direction, layer count, or word split.

The exact source-selected six-rune p28 object is:

```text
[9,28,24,10,1,20] = N EA A I U L
```

Director #1705 had already charged the complete 44-member transform family before the receiver audit:

- 36 uniform cube-orbit exponent pairs from `{1,3,9,27,25,19}`;
- 8 literal per-shell cube/inverse-cube variants.

For this test, every transform output is split at **all five** nonempty rune boundaries. No dictionary or phrase parse chooses the split. Each candidate therefore supplies three GP0 addresses:

```text
whole output sum
left-part sum
right-part sum
```

Those three addresses are routed through the already frozen #1706 receiver family: exact p50 tokens, base60/base59/literal output, zero/one receiver origin, both split endpoint orders, all four endpoint-inclusion choices, and all 23 manuscript-wide whole-word-bounded 23-rune center-F windows. The strict joint criterion requires the whole and split branches to hit **distinct matched windows on the same physical page under one shared output mode/origin**.

Across all **44 × 5 = 220 transform/split candidates**, there is exactly **one** joint receiver hit:

```text
transform  u-3-27
output     [4,28,23,3,1,16] = READOUT
split      [4,28,23] | [3,1,16] = READ | OUT

GP0         75 | 55 | 20
p50 tokens  2v | 1K | 1g
base60     177 | 80 | 102

whole  -> p0 166..188, center177
split  -> p0  80..102, center91
```

Both are the two p0 members of the 23-window matched geometry family.

No other uniform or per-shell transform has a hit at any of its five split points.

## Relation to the Critic direction correction and the concurrent DH inverse result

The Critic correctly showed that the fixed GP29 bridge alone admits both:

```text
e=3:  K -> A -> B -> b
e=19: b -> B -> A -> K
```

and therefore left the direction unresolved.

While this audit was running, Agent 2 committed a stronger source-only discriminator: in the p28 DH group modulo23, private exponent `b=15` is invertible modulo22 with inverse3, while `a=6` is not invertible. Standard DH inversion therefore selects exponent3 independently of English and p50 receiver semantics. That closes the 3-versus-19 direction fork on a stronger premise than this report.

The remaining layer-count fork in Agent 2's result is:

- one operation per visible layer: `(3,27)`;
- zero-indexed layers: `(1,9)`.

The present outside-p28 test discriminates those conventions:

| Transform | Output | Any frozen joint receiver hit? |
| --- | --- | --- |
| `u-3-27` | READOUT | **yes, exactly one: split3** |
| `u-19-27` | CEADOUT | no |
| `u-1-9` | NEAAEEUD | **no** |
| `u-1-25` | NEATIAUW | no |

Thus, conditional on the already frozen receiver architecture, the manuscript-wide geometry selects the **one-action-per-visible-layer convention** and the exact `(3,27)` transform without language feedback.

## Why output reversal adds no new family choice here

This audit scores only GP0 sums of the complete six-rune output and both parts of every possible split. Reversing a six-rune output maps split `k` to split `6-k` while swapping the two endpoint sums. All five split positions and both endpoint orders are already charged. Output reversal therefore generates the same address-triple family and is algebraically redundant for this test.

## What this establishes and what it does not

This materially strengthens the p28 transform selection:

1. Agent 2's source-only DH inverse selects cube direction `3` over inverse direction `19`.
2. The frozen outside-p28 receiver geometry selects action-count layering `(3,27)` over zero-index `(1,9)`.
3. The same receiver criterion gives exactly one hit across the full 44-transform × five-split family, at READ|OUT.

The result still inherits the architecture caveat from Director #1725: no authenticated Cicada source currently says that a p50 numeral should be interpreted as an LP2 rune offset. This report therefore **does not promote READ OUT to established plaintext**. It turns the receiver geometry into a strong conditional discriminator of the p28 transform and removes the remaining zero-index layer convention inside that conditional architecture.

## Reproduction

- SFT: `sims/lp2_p28_cube_direction_receiver_discriminator_sft.cjs`
- Windows Node22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44435193802
- Exact charged counts: 44 transforms, five split points each, 23 matched receiver windows, six output-mode/origin semantics, one joint hit.
