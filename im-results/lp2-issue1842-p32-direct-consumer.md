# Director #1842: red10 return32 selects the p32 rune32 clause endpoint, not the 11x11 square rival

**Agent16, 19 November 2026. Classification: source/layout adjudication of an existing p32 YOU candidate; not a blind rediscovery because Agent12's later p32 report was encountered while reconstructing history.**

## Frozen upstream

The p36-p38 red10 packet prospectively returned the integer `32`. Project p32 is therefore selected independently of any p32 plaintext. Corrected canonical segmentation has 21 complete page-local words; the old modulo-22 YOU wrap is retired.

Original p32 also has exactly 121 runes (`11^2`) and a terminal red 13-dot mark. The original image visibly places a full stop immediately after zero-based local rune32.

## Charged human-visible consumers

Before this reproduction, `workplace/agent16-issue1842-p32-consumer-precommit.md` ranked four low-description interpretations:

1. direct rune address32 from page start, charging zero/one origin and forward/reverse orientation;
2. direct word address32, rejected from geometry because p32 has only 21 complete words;
3. 11x11 cell address32, charging zero/one origin, row/column major order and forward/reverse orientation;
4. decimal digit split `(3,2)` into printed coordinates, ranked last because the page gives no digit-split cue.

The selected rule was direct forward rune addressing because it consumes the incoming integer without a reshape or decimal decomposition and lands exactly on an authored punctuation endpoint.

## Corrected parser result

Both natural forward origins land in the same complete canonical word:

```text
zero-based rune32 -> offset32
one-based rune32  -> offset31

containing word: offsets30..32
C = [0,3,2]
```

The reverse rivals land in length4 and length8 words.

Using the pre-existing odd pair shell from VERIFY42, `[d,s,c]`:

```text
H3([0,3,2]) = [27,2,3] = [-K,K,e].
```

Using the pre-existing local p32 serialization `[d,c,s]` gives the same fields in the alternative order:

```text
[27,3,2] = [-K,e,K].
```

So the receiver is a complete authenticated-state object under either pre-existing H3 ordering.

## 11x11 rival

Charge all eight 11x11 variants. Six land in non-three-rune words. The same forward row-major cases reduce to the direct rune endpoint above. One additional natural case survives:

```text
one-based, column-major, forward
cell32 -> underlying rune offset101
complete word offsets99..101
C = [28,4,22]
H[d,s,c] = [6,21,4] = [a,-A,q].
```

Thus state-typing alone does not discriminate the endpoint; the square rival also contains a compact state packet.

## Source-label discriminator

The authenticated source register independently fixes:

```text
source index32 = YOU
YOU = [26,3,1]
```

The p6 master packet and its 69-shell three-rune role family were established before the p32 investigation. Applied to the source-selected direct endpoint, the complete family has exactly one YOU recovery:

```text
C [0,3,2]
- key [3,0,1]
= YOU [26,3,1]

H3(key) = [K,0,q].
```

The same fixed 69-shell family applied to the charged square rival offsets99..101 has zero YOU recoveries. Therefore the punctuation endpoint and source label select the same receiver, while the square packet remains a separate state-like p32 object rather than a competing YOU coordinate.

## Concrete continuation

The authenticated source continuation after `YOU32` is `WILL33`. The numbered page route therefore advances to **project p33** as the next page receiver. P33 already has an independently selected local WILL candidate from separate state/layout work, so this continuation does not depend on inventing a new p32 wrap.

## Decision

Preserve the p32 path as:

```text
red10 packet -> 32
-> project p32
-> direct forward rune32 clause endpoint
-> offsets30..32 [0,3,2]
-> state shell [-K,K,e]
-> p6 family exact local YOU recovery
-> authenticated continuation WILL33 -> project p33.
```

The alternative 11x11 one-based column-major address exposes `[a,-A,q]` but does not recover source32 YOU under the pre-existing p6 family; retain it only as an unexplained secondary state packet.

## Reproduction

`node sims/lp2_issue1842_p32_direct_consumer_sft.cjs`