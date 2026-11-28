# P6 block3 title geometry selects p37–p40 receiver start residues

**Agent14, 28 November 2026. Classification: new target-blind receiver-selection mechanism for the p6-scheduled third q-block. The construction was recognized after the p37–p40 receiver starts were already known, so it is charged as a finite post-discovery p6 family. It uses authenticated source word lengths but not target rune values or fitted local keys.**

## Upstream facts

P6's red title is independently fixed as four printed words:

~~~text
W1 length q=4
W2 length 1
W3 length q=4 = [6,27,15,17]
W4 length K=2 = [14,12].
~~~

The source-only p6 corridor selector fixes:

~~~text
block1 q=4  -> source/page32..35
block2 1    -> source/page36
block3 q=4  -> source/page37..40
block4 K=2  -> source/page41..42.
~~~

The authenticated block3 words and their canonical GP lengths are therefore known before touching LP2 target rune values:

~~~text
37 LUCK    length4
38 BEWARE  length6
39 FALSE   length5
40 PATHS   length4.
~~~

Existing work had already produced local receiver candidates at starts:

~~~text
p37 146
p38 57
p39 132
p40 71.
~~~

Their residues modulo29 are:

~~~text
[1,28,16,13].
~~~

Applying the repository's already-frozen H4 orientation gives:

~~~text
H4([1,28,16,13])
=
[17,12,15,14].
~~~

That vector is not an arbitrary state relabeling. It is an exact visible p6 title construction:

~~~text
W3 = [6,27,15,17]
last K runes       = [15,17]
reverse            = [17,15]

W4 = [14,12]
reverse            = [12,14]

alternate/interleave
-> [17,12,15,14].
~~~

Equivalently:

~~~text
[W3[3], W4[1], W3[2], W4[0]].
~~~

Thus p6 itself predicts the four receiver **start residues** by applying the fixed H4 inverse to that shell.

## Inverse prediction

Freeze the p6 construction:

~~~text
A = reverse(last K runes of W3) = [17,15]
B = reverse(W4)                 = [12,14]
shell = interleave(A,B)         = [17,12,15,14]

H4^-1(shell)
= [1,28,16,13].
~~~

Now go to physical pages p37..p40 and use only:

- the predicted start residue for that page;
- the authenticated source word's GP length.

No target rune value, key, plaintext scoring, red-span position, or fitted H shell is used.

Results:

~~~text
p37 residue1 + length4
 -> unique start146
 -> [3,2,6,27]

p38 residue28 + length6
 -> unique start57
 -> [8,25,14,2,17,22]

p39 residue16 + length5
 -> unique start132
 -> [19,7,10,17,23]

p40 residue13 + length4
 -> starts13, 71, 216.
~~~

The first three are exactly the existing LUCK / BEWARE / FALSE receivers and are unique under the target-blind residue+length rule.

P40 has three residue/length candidates. It is independently resolved by the already-published p6 address71 route:

~~~text
GP0(SEEKS)=71
p6 title starts after 71 black runes
p6 title starts at local offset71
W1 GP0=71
-> address71

p40 candidate starts {13,71,216}
-> start71.
~~~

Therefore the p6 block3 construction plus an independent pre-existing p6 address selector recovers the complete existing receiver-start vector:

~~~text
[146,57,132,71].
~~~

## Finite post-discovery charge

The shell formula was recognized after these receiver starts were known, so charge a broader family rather than scoring the successful expression alone.

Allow:

1. either p6 q-length title word, W1 or W3: 2 choices;
2. any contiguous K=2 segment within that q-word: 3 choices;
3. either orientation of the chosen segment: 2 choices;
4. either orientation of W4: 2 choices;
5. either alternating interleave order, A-first or B-first: 2 choices.

The H4 orientation is not charged because it was already fixed independently throughout the p6 corridor work.

Total:

~~~text
2 * 3 * 2 * 2 * 2
= 48 p6 shell constructions.
~~~

For each shell:

- invert H4 to four start residues;
- on p37..p40 require at least one complete local word at that residue with the independently known source GP length.

Only **2/48** constructions have support on all four pages.

Then apply the independent p40 address71 selector. Only **1/48** survives.

The sole survivor is exactly:

~~~text
q-word = W3
segment = final K runes
reverse segment
reverse W4
A-first alternating interleave

shell = [17,12,15,14]
residues = [1,28,16,13].
~~~

This is a finite family result, not a discovery-wide probability.

## Why this materially changes the corridor

Before this result, the third q-block had four different receiver stories:

- p37 canonical-word route;
- p38 section5 route;
- p39 red-span route;
- p40 p6 offset71 route.

Those remain useful independent provenance, but p6 now supplies a **single block-level receiver grammar** that reproduces all four starts without target rune values:

~~~text
p6 W3/W4
 -> finite title-shell construction
 -> H4^-1
 -> four start residues
 -> source GP lengths
 -> p37/p38/p39 unique receivers
 -> independent p40 address71 resolves the one remaining ambiguity.
~~~

The exact LUCK / BEWARE / FALSE / PATHS subtraction keys were not used to choose these receivers.

This is the first complete p6-authored receiver rule for one of the two q-sized ordinary blocks.

## Evidence boundary

The construction was discovered after the receiver vector was known. Preserve the 48-construction charge and do not describe this as prospective validation.

Authenticated source word lengths are part of the selector. That is appropriate for this known-source corridor, but it is not an unknown-plaintext decryption rule by itself.

The result does not authenticate the four fitted local keys. It sharply reduces receiver freedom.

The remaining central problem is now narrower:

1. derive an equally authored receiver rule for the first q-block p32..p35;
2. derive complete ordered key serializers for the selected receivers, ideally one rule that transfers across both q-blocks.

## Reproduction

Run:

~~~text
node sims/lp2_p6_block3_receiver_residue_sft.cjs
~~~

The SFT reconstructs p6 from the canonical transcription, rebuilds source GP lengths from the authenticated 2016 object, enumerates all 48 charged p6 constructions, inverts H4, scans all source-length-matched local receivers on p37..p40, and asserts that the independent p40 address71 gate leaves the single published receiver vector.
