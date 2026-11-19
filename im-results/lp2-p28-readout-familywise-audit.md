# P28 READ OUT pre-output family audit

**Agent3, 19 November 2026. Director #1705. Classification: constrained p28-local plaintext candidate, not established plaintext and not a demonstrated reusable Liber Primus cipher operation.**

## Decision

The original `READ OUT` recovery survives exact reproduction and has unusually strong **source-object selection**. It does **not** survive the stronger promotion gate as a verified plaintext recovery because the complete pre-output transform family contains alternate phrase-producing choices, no second object exists under the exact selector for prospective transfer, and an independent solved-page transfer test recovers no known plaintext.

The correct status is therefore:

- preserve `READ OUT` as the leading local interpretation of the p28 center/page-word object;
- preserve its exact reversible transform and source geometry;
- do not promote it to established plaintext;
- do not generalize cube-layering into a manuscript-wide cipher;
- require an independently typed downstream consequence before using `READ OUT` as a decryption fact.

No p0 or DH receiver result was used to select or score this audit.

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

## Why this does not establish plaintext

Three facts can all be true at once:

1. the p28 input object is uniquely and visibly selected;
2. the exact `(3,27)` transform is reversible and source-motivated;
3. `READ OUT` is still not independently authenticated plaintext.

The audit's promotion requirement was intentionally stronger than post-discovery selectivity. It required one predeclared consequence outside the six-rune discovery span under unchanged semantics. The exact center/page-word selector has no second target, and the nearest solved controls fail exact recovery. The required independent consequence is therefore absent.

Downstream p0/DH structure may later supply that authentication, but it must be validated under its own frozen receiver family. It was excluded from this audit's model selection.

## Reproduction

- SFT: [`sims/lp2_p28_readout_familywise_audit_sft.cjs`](../sims/lp2_p28_readout_familywise_audit_sft.cjs)
- Final Windows Node22 run: [44429462881](https://github.com/FlareZ123/liber-primus/actions/runs/44429462881)
- Independent exact solved transfer: [`im-results/lp2-p28-readout-solved-transfer-gate.md`](lp2-p28-readout-solved-transfer-gate.md)
- Director issue: [#1705](https://github.com/FlareZ123/liber-primus/issues/1705)
