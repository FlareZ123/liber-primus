# P6 schedule gives target-blind q/F receiver grammar for the exceptional corridor blocks

**Agent14, 28 November 2026. Classification: new target-blind receiver-selection evidence for the p6-scheduled p32–p42 corridor. It identifies the singleton p36 receiver and the terminal p41/p42 receiver pair without using their plaintext rune values. Existing local keys remain partly post-target and are not promoted to a universal decoder.**

## Upstream schedule

The p6 red title is independently fixed as:

~~~text
printed word lengths [4,1,4,2] = [q,1,q,K]
q = 4
1 = 1
K = 2
adjacent large Fehu = F = 0
~~~

A separate source-only selector now uses this exact printed partition to single out authenticated words32..42:

~~~text
[q words]   YOU WILL BE FOUND
[1 word]    GOOD
[q words]   LUCK BEWARE FALSE PATHS
[K words]   VERIFY OPENPGP
~~~

The missing question is whether the non-q blocks also tell us how to choose their manuscript receivers.

They do.

## Singleton block: p36 is the unique index-numbered q-center receiver

For every physical page/source index `i=1..42`, inspect the canonical local complete word whose **one-based local ordinal equals the zero-based source/page index**:

~~~text
p_i / local word_i.
~~~

Do not use the source target, its rune values, or a desired receiver length.

Across the complete charged diagonal, exactly one selected word has an odd-length center equal to the p6 state marker `q=4`:

~~~text
p36 / word36
start169
[2,22,4,1,20]
       ^
       q
~~~

No other `p_i / word_i` receiver through the authenticated range has center q.

The p6 schedule's singleton block is exactly source/page36, so this supplies a target-blind receiver rule:

~~~text
p6 block2 = one page
-> page36
-> index-numbered word36
-> require/check center q
-> remove q
-> [2,22,1,20].
~~~

Only after that receiver is fixed do we compare the source-selected target. The prepared length is four, matching canonical GOOD. The already published exact subtraction key replays:

~~~text
[2,22,1,20]
-
[25,19,27,26]
=
[6,3,3,23]
=
GOOD.
~~~

This materially strengthens p36. The earlier report charged all nine manuscript-wide q-centered five-rune receivers because the local selector was missing. The p6 schedule plus the direct-number convention now narrows that family to the exact p36 object before plaintext scoring.

## Terminal K-block: p41/p42 is the unique consecutive ordinal F-center pair

For every physical page/source index `i=0..42`, inspect the canonical local complete word whose one-based local ordinal is the **source ordinal**:

~~~text
p_i / local word_(i+1).
~~~

Among those ordinal-numbered receivers, only three have odd-length center `F=0`:

~~~text
p12 / word13  start60   length5
p41 / word42  start178  length7
p42 / word43  start206  length3.
~~~

Now apply only the p6 terminal-block width:

~~~text
K = 2.
~~~

Across every consecutive width-2 page block on that diagonal, there is exactly **one** pair whose two selected words both have center F:

~~~text
p41 / word42
[27,12,5,0,17,13,19]

p42 / word43
[16,0,14].
~~~

Thus the p6 schedule independently selects a two-page **F-marked receiver mode** for its final `K=2` block.

This does not use VERIFY or OPENPGP rune values.

## P41: the checked F supplies the receiver transform

On p41, remove the checked center F:

~~~text
[27,12,5,0,17,13,19]
          ^
          F

-> [27,12,5,17,13,19].
~~~

The prepared length is six, exactly the canonical GP length of authenticated source word41 VERIFY.

The already published exact key remains:

~~~text
[26,23,1,7,13,22]
~~~

and subtraction replays VERIFY exactly.

The new evidence is receiver selection: p41 is no longer merely one member of a broad seven-rune center-F family. It is fixed by the p6 terminal-block schedule and the ordinal-numbered diagonal before VERIFY is scored.

## P42: the ordinal F-word is itself the p6-visible [K,1,F] instruction

The selected p42 ordinal word is:

~~~text
word43 start206
[16,0,14].
~~~

Apply the established outside-pair H serialization for three runes:

~~~text
Hpair([16,0,14])
=
[16-14,16+14,0] mod29
=
[2,1,0]
=
[K,1,F].
~~~

Every coordinate is visibly supplied by the p6 schedule packet:

~~~text
K = title length2
1 = singleton title length1
F = adjacent Fehu / GP zero.
~~~

This exact `[K,1,F]` packet is manuscript-unique among canonical complete three-rune unknown words.

Read it literally and locally:

1. advance `K=2` canonical words;
2. inspect rune index `1`;
3. require `F=0`.

The destination is:

~~~text
word45 start211
[10,0,14,1,3,26,8,2]
    ^
    rune1 = F.
~~~

Remove the checked F:

~~~text
[10,14,1,3,26,8,2].
~~~

The result has seven runes, exactly the native GP length of authenticated OPENPGP. The already published subtraction key then replays OPENPGP exactly.

This is the strongest terminal-block evidence: p6 does not merely contain atoms later reused in a fitted key shell. Its visible `K,1,F` fields form the exact operational selector emitted by the target-blind p42 numbered receiver.

## What this changes

Before this result the p6 title selected the source interval and supplied a common state vocabulary, but the page-local receiver grammar remained almost entirely page-specific.

Now two exceptional blocks have a compact authored rule:

~~~text
p6 schedule [q,1,q,K]

block2 length1:
  p36 / word36
  unique index-diagonal center q
  remove q
  -> GOOD candidate

block4 lengthK:
  p41 / word42 and p42 / word43
  unique consecutive ordinal-diagonal F-center pair

  p41: remove F
       -> VERIFY candidate

  p42: Hpair(word43)=[K,1,F]
       -> +K words / rune1 / require F
       -> remove F
       -> OPENPGP candidate.
~~~

This is a substantial reduction in model freedom because receiver choice for p36, p41 and p42 is now target-blind and directly tied to p6 schedule fields.

The remaining hard problem is concentrated in the two q-length ordinary blocks:

~~~text
p32..p35
p37..p40.
~~~

Those eight local candidates still use heterogeneous receiver and key serializers. A genuine next breakthrough is a p6-authored rule that predicts their receiver/key roles before plaintext scoring.

## Evidence boundary

Do not infer a universal "index mode for singleton, ordinal mode for every other block" law from three pages. The two diagonal conventions are empirically fixed here because each produces a unique p6-marker signature on its scheduled block.

Do not promote GOOD / VERIFY / OPENPGP to established unknown plaintext solely from these receiver selectors. Their exact local keys and some shell-role choices were recognized after the authenticated targets were known. This result upgrades the **receiver-selection causal path**, not the full key serializer.

## Reproduction

Run:

~~~text
node sims/lp2_p6_schedule_qF_numbered_receiver_sft.cjs
~~~

The SFT reconstructs p6 `[q,1,q,K]`, enumerates the complete index and ordinal numbered diagonals through source index42, proves the p36 q-center uniqueness and p41/p42 consecutive-F uniqueness, verifies the manuscript-unique p42 `[K,1,F]` selector, and replays the already published GOOD, VERIFY and OPENPGP local inverses.
