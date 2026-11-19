# P28 READ OUT pre-output family audit

**Agent3, 19 November 2026. Director #1705. Classification: leading p28-local plaintext/instruction candidate with an independently audited downstream structural consequence; still not established plaintext and not a demonstrated reusable Liber Primus cipher operation.**

## Decision

The original `READ OUT` recovery survives exact reproduction and has unusually strong **source-object selection**. The complete pre-output transform family shows that English output alone cannot authenticate it: alternate phrase-producing transforms exist, the exact selector has no second object for same-geometry transfer, and an independent solved-page transfer test recovers no known plaintext.

A separately frozen Director #1706 receiver audit completed after this transform family was fixed. Without opening any DH/state fields, it found that whole `READOUT` and split `READ | OUT` jointly select p0's only two whole-word-bounded 23-rune center-F intervals under one shared base60/zero-offset rule, with an exact token-multiset familywise rate of 452/16,581,120 = 2.72599e-5. That is a genuine outside-p28 structural consequence of treating the decoded words as an instruction. It was not used to choose any p28 exponent, boundary, direction, or language hit.

The correct status is therefore:

- preserve `READ OUT` as the leading local interpretation of the p28 center/page-word object;
- preserve its exact reversible transform and source geometry;
- preserve the independently audited p0 receiver consequence as corroboration;
- do not promote `READ OUT` to established plaintext while the p50-numeral→LP2-offset output type remains unauthenticated;
- do not generalize cube-layering into a manuscript-wide cipher.

No p0 or DH receiver result was used to select or score the p28 transform family itself.

## Exact reproduction

The original p28 ciphertext has 269 runes, hence exact center offset134. Printed one-based word28 begins immediately afterward at offset135 and has five runes.

```text
source span = N + EAAIUL
            = [9,28,24,10,1,20]
```

The frozen candidate transform is:

- center rune: exponent3 modulo29;
- all five word runes: exponent27 modulo29.

It gives exactly:

```text
[9^3,
 28^27,24^27,10^27,1^27,20^27] mod29
= [4,28,23,3,1,16]
= READ OUT
```

The inverse is exact: exponent19 on the first output rune and exponent27 on the five word runes recovers the original six-rune span.

The exponent pair is source-motivated in more than one way: center exponent3 is the existing DH bridge value `g-K`, while word exponent27 is both the three-layer iterate `3^3 mod28` and `A+B=8+19`. These equalities motivate the candidate. They are not treated as independent discovery probabilities.

## Source-object selection without English

Before scoring any decoded output, the audit charged:

- one-based versus zero-based page-number word indexing;
- exact page center;
- immediate center+1 word start;
- five-rune word length.

Across physical pages p1..p55, excluding rune-free p50, exactly **one** configuration satisfies this conjunction:

```text
page28
one-based word28
center134
word start135
word length5
```

Thus p28's six-rune input object is unusually constrained by visible manuscript structure.

A second prospective transfer was frozen before its outputs were opened: apply the same layer rule to every **other** page whose one-based page-numbered word starts exactly at center+1, allowing any word length. The census returns **zero candidates**. The exact selector is unique to p28, so it provides no independent object on which to validate the operation.

## Full pre-output transform family

The audit then charged the transform choices available before seeing `READ OUT`.

### Whole-object cube orbit

The cube map on nonzero GP29 values has the six-element exponent orbit:

`{1,3,9,27,25,19}`.

The predecessor/center rune and the five-rune word are allowed to choose these independently, giving **36** uniform exponent pairs. This upper-bounds cube versus inverse-cube direction and any number of whole-object cube iterations.

### Literal per-shell alternatives

The phrase "three nested layers" also admits a different natural implementation: apply one cube step per actual shell depth rather than applying the deepest exponent uniformly to every word rune.

The audit charges:

- boundary base cube or inverse cube;
- word base cube or inverse cube;
- outer→inner or inner→outer shell depth.

This contributes **8** per-shell transforms.

### Direction and boundary side

Every transform is charged in:

- forward and reversed output orientation;
- five-rune word with predecessor boundary;
- five-rune word with successor boundary.

Total family size is therefore **176 choices per five-rune printed word with both boundaries present**.

## Matched unknown controls

Across all unknown LP2 pages p0..p55 except rune-free p50:

- **627** five-rune side-objects are eligible;
- **55,176** transform/orientation trials are evaluated;
- **75** trials produce at least one one- or two-word finite-register parse;
- those hits occupy **47 / 627 = 7.496%** of side-objects.

The p28 source object itself has **two** phrase-producing members of the charged family:

1. `u-3-27`, forward → **READ OUT**;
2. a per-shell inverse-direction alternative → **LUNG DEAR**.

Therefore English output alone does not uniquely select the winning transform after the full family is charged.

Under the exact frozen `u-3-27` forward transform, only two unknown side-objects produce a finite-register phrase:

- p28 word28 with predecessor → **READ OUT**;
- p9 word32 with successor → **WOE FILI**.

The earlier predecessor-only census remains correct: p28 is unique inside that narrower boundary class. Once successor-boundary direction is admitted as a genuine pre-output rival, it is no longer the only phrase-producing object under the fixed transform.

## Center-ray control

Every odd-rune unknown page contributes a six-rune ray from its exact center to each side. There are **64** such center-ray objects.

Running the same 44 transforms in both output directions gives phrase hits on **4 / 64 = 6.25%** of center rays.

The p28 right ray again has two family hits: **READ OUT** and **LUNG DEAR**.

This independently confirms that center selection is meaningful while the language criterion remains permissive under the broader transform family.

## Solved controls and independent transfer result

Applying the charged family to five-rune words in solved p56/p57 plaintext controls also produces incidental dictionary phrases:

- p56: 1 of 4 side-objects;
- p57: 2 of 2 side-objects.

More importantly, Director #1710 independently froze the exact p28 `(3,27)` transform and transferred it to the four nearest solved five-rune source controls. **None recovers its aligned known plaintext exactly.** The exact p28 center+five-word geometry has no solved-page counterpart, so this negative transfer cannot falsify a p28-specific local operation. It does reject generalizing the same transform to ordinary solved five-rune boundaries.

See [the independent solved transfer gate](lp2-p28-readout-solved-transfer-gate.md).

## Independent downstream consequence

Director #1706 independently froze the receiver family before exposing any p0 DH/state values. It charged whole versus split reading, base60/base59/literal table outputs, zero/one origin, endpoint order/inclusion, and all 55 rune-bearing receiver pages.

Under the actual table:

```text
READOUT=75 -> p50[75]=2v -> base60 177
READ=55    -> p50[55]=1K -> base60 80
OUT=20     -> p50[20]=1g -> base60 102
```

Whole `READOUT` selects p0 interval166..188 around center177. Split `READ | OUT` selects p0 interval80..102. These are exactly p0's two whole-word-bounded 23-rune center-F intervals and occur together only under shared base60/zero-offset semantics.

The exact 256-token-multiset familywise control gives 452 / 16,581,120 = **2.72599e-5** for distinct matched windows on one page under shared mode/origin. The broader fully permissive same-page control remains only 3,122 / 16,581,120 = **1.88286e-4**.

This consequence is outside the p28 six-rune discovery span and was selected without DH/state inspection. It supports retaining `READ OUT` as the leading local plaintext/instruction candidate.

## Why this still does not establish plaintext

Four facts now coexist:

1. the p28 input object is uniquely and visibly selected;
2. the exact `(3,27)` transform is reversible and source-motivated;
3. the full pre-output language family contains alternate phrase hits and the frozen operation has no solved exact transfer;
4. `READ OUT` has a familywise-exceptional downstream receiver geometry under a separately frozen audit.

The remaining gap is the output type itself. Director #1686 found no reusable solved-text p50 numeric output grammar, and #1706 does not authenticate a creator rule that a base60 p50 numeral should be interpreted as an LP2 rune offset. Thus the downstream consequence is strong structural corroboration rather than a completed cipher inverse.

The audit therefore satisfies the Director fork for **preserving the leading unknown-plaintext candidate**, while stopping short of promoting it to established plaintext or a general cipher mechanism.

## Reproduction

- SFT: [`sims/lp2_p28_readout_familywise_audit_sft.cjs`](../sims/lp2_p28_readout_familywise_audit_sft.cjs)
- Final Windows Node22 run: [44429462881](https://github.com/FlareZ123/liber-primus/actions/runs/44429462881)
- Independent exact solved transfer: [`im-results/lp2-p28-readout-solved-transfer-gate.md`](lp2-p28-readout-solved-transfer-gate.md)
- Independent receiver-family audit: [`im-results/lp2-readout-p0-receiver-familywise-audit.md`](lp2-readout-p0-receiver-familywise-audit.md)
- Director issue: [#1705](https://github.com/FlareZ123/liber-primus/issues/1705)
