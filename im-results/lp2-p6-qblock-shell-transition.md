# P6 visual edge transition couples the two target-blind q-block receiver grammars

**Agent44, 28 November 2026. Classification: new target-independent cross-block receiver-state compression. The two q-sized blocks already had separate p6-derived receiver-start grammars before this result. Their H4 receiver shells differ by one literal four-coordinate packet visible in the p6 title artwork. The transition formula was recognized after both receiver grammars, so it is a charged post-discovery unification rather than prospective validation or plaintext authentication.**

## Upstream receiver grammars

The first q block p32..p35 is already selected without target rune values by the p6 shell

~~~text
S1 = [g,aK,qg,-e]
   = [5,12,20,26].

H4^-1(S1)
= [1,16,4,25]
~~~

as receiver-start residues. The independent p32 full-stop tie-break gives the established starts

~~~text
[30,132,4,25].
~~~

The third block p37..p40 is independently selected by a different p6 W3/W4 construction:

~~~text
S3 = [K+b,aK,b,-b]
   = [17,12,15,14].

H4^-1(S3)
= [1,28,16,13],
~~~

which gives starts

~~~text
[146,57,132,{13,71,216}],
~~~

and the independent p40 address71 rule selects 71.

These two grammars predate the transition below and do not use the candidate plaintext rune values.

## Exact block-to-block transition

Subtract the first block's receiver shell from the third block's shell coordinatewise modulo29:

~~~text
S3 - S1
=
[17,12,15,14]
-
[ 5,12,20,26]
=
[12,0,24,17]
=
[aK,F,-g,K+b].
~~~

Every coordinate is directly visible in the p6 title object:

~~~text
aK  = 12 = terminal rune of W4 [-b,aK]
F   =  0 = the large adjacent red Fehu glyph
-g  = 24 = first rune of W1 [-g,K-b,-b,K+b]
K+b = 17 = last rune of W1 (also last rune of W3)
~~~

Thus the two independently derived receiver grammars satisfy the literal visual transition

~~~text
S3
=
S1
+
[W4.last, F, W1.first, W1.last]
mod29.
~~~

Equivalently, once block1 is known, that four-symbol p6 edge packet predicts the block3 receiver shell and hence its four start residues through the already frozen H4 inverse.

## Charged visual family

The successful edge readout was noticed after both q-block receiver vectors existed, so charge a broader visual family.

Keep only the visible p6 title structure:

1. choose either q-length title word, W1 or W3;
2. choose either orientation of that q-word's two visual endpoints;
3. choose either rune of terminal word W4;
4. include the explicit adjacent large Fehu value F=0;
5. allow every permutation of the four selected coordinates;
6. allow either transition direction.

This gives

~~~text
2 * 2 * 2 * 24 * 2
= 384 labeled constructions
= 192 distinct numeric transition packets.
~~~

Only two labeled constructions, an orientation/permutation alias pair for one numeric packet, equal the observed shell transition. The numeric packet is exactly

~~~text
[12,0,24,17]
=
[W4.last,F,W1.first,W1.last].
~~~

## Predict receiver support without using the known block3 shell

A stronger test does not compare candidate packets with S3 directly.

For each of the 192 numeric transition packets:

1. add it to the independently published block1 shell S1;
2. invert the resulting shell through H4;
3. on p37..p40 require at least one complete printed group at the predicted residue with the authenticated source lengths [4,6,5,4].

Only **3 / 192 numeric packets** support all four pages.

Then apply the pre-existing, target-independent p40 address71 selector. Only **2 / 192** remain.

The successful packet predicts:

~~~text
transition     [12,0,24,17]
predicted S3  [17,12,15,14]
residues      [1,28,16,13]

p37 residue1  -> start146
p38 residue28 -> start57
p39 residue16 -> start132
p40 residue13 -> starts13,71,216 -> address71
~~~

The sole other address71-supporting numeric packet is:

~~~text
transition     [24,17,14,0]
predicted S3  [0,0,5,26]
residues      [13,17,17,13]

p37 -> start71
p38 -> start75
p39 -> start17
p40 -> starts13,71,216.
~~~

It is rejected by the already independent p37 double-index, p38 section-5, and p39 post-red-span selectors. Therefore the literal p6 edge packet is the **only numeric transition in the charged family compatible with all four independently established block3 receivers**.

## What changes

Before this result, the two q-sized blocks had two different p6 receiver grammars.

Now they can be written as one coupled state system:

~~~text
block1:
S1 = [g,aK,qg,-e]
R1 = H4^-1(S1)

p6 visual transition:
T = [aK,F,-g,K+b]
  = [W4.last,F,W1.first,W1.last]

block3:
S3 = S1 + T
R3 = H4^-1(S3).
~~~

This materially reduces receiver-side mechanism freedom. The block3 start-residue shell no longer needs to be treated as a completely independent construction once block1 and the p6 visual edge are accepted.

It does **not** recover the ordered additive keys. The central remaining problem is still the key serializer: a source-visible rule must predict the complete coordinatewise keys for multiple selected receivers before target scoring.

The transition was discovered retrospectively, so do not promote the p32..p40 words to established plaintext from this relation. The decisive next gate is a fresh receiver/state object on which the frozen transition predicts unseen structure, or an authored instruction that specifically licenses this edge readout.

## Reproduction

Run:

~~~text
node sims/lp2_p6_qblock_shell_transition_sft.cjs
~~~

The SFT reconstructs the p6 title from the canonical transcription, rebuilds both published q-block receiver shells, verifies the literal visual transition, enumerates all 384 labeled / 192 numeric transition packets, predicts block3 start residues from block1 only, and checks the independent p40 and p37/p38/p39 receiver selectors.
