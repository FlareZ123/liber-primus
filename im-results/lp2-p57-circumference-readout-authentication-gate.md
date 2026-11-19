# Director #1779: p57 circumference grammar does not authenticate the p28 READ OUT power map

**Agent27, 19 November 2026. Decision: negative authentication gate.** Solved p57 strongly compresses the existing p28 `(3,27)` model and uniquely selects the one-based p28 word by source geometry, but it does not uniquely force the action-count convention and the frozen grammar fails a solved, p57-selected same-type transfer.

## Frozen source route

Solved p57 contains:

```text
SHED OUR OWN CIRCUMFERENCES
FIND THE DIVINITY WITHIN
AND EMERGE
```

Under the already established whole-word GP0 -> p50 -> native-base60 register:

```text
DIVINITY -> [K,g]   = [2,5]
THE      -> [e,b]   = [3,15]
AND      -> [A,p-1] = [8,22]
EMERGE   -> [a,B]   = [6,19]
```

and `FIND` has GP0 42 with p50 native-base60 value 28, selecting physical p28.

The DH tuple is independently available from the authenticated 2016 word-position reconstruction, so no p28 output letters are needed to supply `K=2, g=5, e=3`.

## Pre-output object selection

Physical p28 has 269 runes and exact center offset134.

Charge both page-number word origins:

| origin | selected printed word | start | length | starts at center+1? | length=g? | nonempty layers | circumference sheds |
| --- | ---: | ---: | ---: | --- | --- | ---: | ---: |
| one-based | 28 | 135 | 5 | yes | yes | 3=e | 2=K |
| zero-based | 29 | 140 | 2 | no | no | 1 | 1 |

Thus one-based word28 is uniquely selected before transformation by the conjunction already present in the source model:

```text
page-number word
starts immediately after exact page center
length = g = 5
K = 2 sheds reach its center
e = 3 nonempty circumference layers
```

This is real source compression and does not use READ OUT letters.

## The action-count ambiguity remains

Once word28 is selected, the p57 wording itself makes two different counts meaningful:

```text
K=2 circumference-removal actions
e=3 nonempty nested layers, including the divinity within
```

Using the source-derived base exponent `e=3` therefore gives two low-description word exponents before output inspection:

```text
removal-action count: e^K mod28 = 3^2 mod28 = 9
nonempty-layer count: e^e mod28 = 3^3 mod28 = 27
```

Charge additionally:

- singleton center as one nonempty layer or zero-indexed layer;
- forward base `e=3` or inverse cube direction `e^-1 mod28=19`.

Together with the two word origins, this is a **2 x 2 x 2 x 2 = 16** low-description convention family. The p28 geometry rejects the zero-based origin before output, leaving eight action/direction controls on the selected object.

The previously proposed reading is:

```text
word count = nonempty layers
center count = one nonempty layer
direction = forward e

center exponent = 3^1 mod28 = 3
word exponent   = 3^3 mod28 = 27
```

It reproduces the known p28 raw output, while the neighboring `e^K=9` reading remains source-typed and cannot be excluded from the p57 wording alone. “DIVINITY WITHIN” favors the nonempty-layer interpretation semantically, yet it does not mathematically force one exponentiation action per layer.

## Frozen solved transfer

Before opening the transfer output, select a second page through the same solved-p57 register.

The solved p57 word `TUNNELING` has:

```text
GP0(TUNNELING)=94
p50[94] native-base60 value = 56
```

so it selects solved physical p56 independently of p28.

P56 has 85 ciphertext runes, exact center offset42, and a complete two-rune word beginning at offset43. This is a center-singleton plus immediately following whole-word operand of the same structural type.

Freeze the proposed p57 grammar unchanged:

- center singleton: one nonempty layer -> exponent `e^1=3`;
- two-rune following word: one nonempty circumference layer -> exponent `e^1=3`;
- forward `e` direction.

The original p56 ciphertext span is:

```text
[2] + [5,25]
```

and the frozen transform predicts:

```text
[2^3, 5^3, 25^3] mod29
= [8,9,23].
```

The independently known solved p56 plaintext at the same rune offsets is:

```text
[15,16,3].
```

The prediction misses **all three runes**.

## Page-pointer control

Among solved-p57 words whose fixed p50/native-base60 value is a physical LP2 page, the selected pages include 28, 33, 42, 46 and 56. P28 is the only one whose **page-numbered word** begins at an integer center+1. This reinforces p28's local object selection but also explains why there is no second page-number-word replica of the exact p28 geometry.

A manuscript-wide geometry census finds only five pages with an exact rune center immediately followed by a complete word: p3 length4, p17 length4, p25 length4, p28 length5, and p56 length2. **P28 is the only member with an odd-length following word**, hence the only member whose repeated circumference shedding ends on a literal single-rune within. There is therefore no exact same-type odd-word holdout anywhere in LP2.

P56 remains the strongest available solved stress test because TUNNELING source-selects it and its ciphertext has the same center-singleton plus immediately following complete-word shape. Its even two-rune word means it is a nearby operand control rather than an exact odd-circumference replica.

## Independent circumference transfer favors the rival count convention

Concurrent source-selected p39 work supplies an independent use of the solved p57 instruction. The p57 shedding rule is transferred to a red-started p39 body and evaluated at literal shedding depths:

```text
depths [K,e,q,g] = [2,3,4,5]
remaining runes  = [p,a,K,0] = [23,6,2,0]
```

The operation there is explicitly **repeat removal of outer runes by the named depth**. In other words, the independent circumference transfer treats a depth as the number of shedding actions.

Applied back to the p28 five-rune word, that convention identifies the source-typed count as `K=2` removals, which gives:

```text
word exponent = e^K mod28 = 3^2 mod28 = 9,
```

the control that does not produce READ OUT. This does not disprove the local nonempty-layer reading, but it weakens the claim that solved p57 independently selects exponent27: the only transferred circumference semantics presently available favors the competing removal-count convention.

Reproducer for the independent p39 circumference register: `sims/lp2_shed_circumferences_page_pointer_sft.cjs` (Agent45 commit `8312ea661296bb7f86998cc002c37e035a8e6c3d`).

## Decision

Director #1779's positive gate is not met.

Preserve:

- p57 `FIND -> p28`;
- unique one-based p28 word28 center adjacency;
- exact state closure `length=g, sheds=K, nonempty layers=e`;
- p57 circumference grammar as strong **p28-local intended-route compression**;
- Agent16's independent language-free selection of the same raw READ OUT output inside the reversible power-map family.

Do **not** promote the circumference grammar to an authenticated reusable selector:

1. the p57 wording leaves a source-typed `K=2` removals versus `e=3` nonempty-layers action-count fork;
2. the frozen nonempty-layer/forward-e rule fails the p57-selected solved p56 transfer exactly.

A future source clue may still authenticate the p28-local operator class. This issue's tested circumference route should not be extended with new count conventions after the failed holdout.

## Reproduction

```text
node sims/lp2_p57_circumference_readout_authentication_gate_sft.cjs
```

The SFT rebuilds the p57 state/page register, charges all 16 word-origin/action-count/center/direction configurations, reproduces the local `(3,27)` diagnostic only after the family is frozen, executes the solved p56 stress test, and enumerates the complete manuscript center-adjacent geometry family. Windows / Node.js 22 run **44453938095** passed the complete family, transfer, and manuscript geometry census.
