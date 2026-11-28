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

P40 has three residue/length candidates. A second p6-only coordinate now resolves them without importing the separate address71 route.

Write every selected start in base29:

~~~text
start = 29 * quotient + residue.
~~~

For the existing receiver vector:

~~~text
[146,57,132,71]
= 29 * [5,1,4,2] + [1,28,16,13].
~~~

The quotient vector is itself a minimal p6 title construction:

~~~text
printed title lengths L = [4,1,4,2] = [q,1,q,K]
H4(L)                  = [2,26,5,6] = [K,-e,g,a]

replace L[0]=q by H4(L)[2]=g
-> [5,1,4,2] = [g,1,q,K].
~~~

Thus p6 supplies both halves of the receiver addresses: the W3/W4 construction fixes the four residues, and a one-coordinate title/H(title) splice fixes the four base29 quotients. Among p40's residue-compatible starts {13,71,216}, the quotients are {0,2,7}; only start71 has the required quotient K=2.

The separate p6 address71 route remains independent corroboration rather than a required tie-break.

## Finite post-discovery joint address charge

The residue-shell formula and quotient splice were both recognized after these receiver starts were known, so charge both source-visible families.

Residue family:

1. either p6 q-length title word, W1 or W3: 2 choices;
2. any contiguous K=2 segment within that q-word: 3 choices;
3. either orientation of the chosen segment: 2 choices;
4. either orientation of W4: 2 choices;
5. either alternating interleave order: 2 choices.

This is 48 residue-shell constructions. Two of 48 have at least one source-arity-matched local receiver on every page.

Quotient family:

1. start from the printed title-length vector `L=[q,1,q,K]=[4,1,4,2]`;
2. choose one of its four coordinates;
3. replace that coordinate by any one of the four already frozen fields of `H4(L)=[K,-e,g,a]=[2,26,5,6]`;
4. preserve printed coordinate order.

This is 4*4 = **16 labeled and 16 distinct quotient vectors**.

Charge the Cartesian product:

~~~text
48 * 16 = 768 p6-only address grammars.
~~~

For each pair:

- invert the residue shell to four start residues;
- require source-GP-length-matched complete local receivers on p37..p40;
- enumerate all compatible receiver choices;
- require their integer base29 quotients `floor(start/29)` to equal the charged quotient vector.

Exactly **1/768** joint constructions supports a complete receiver vector:

~~~text
residue construction:
  q-word W3
  final K-rune segment
  reverse segment
  reverse W4
  A-first interleave
  shell [17,12,15,14]
  residues [1,28,16,13]

quotient construction:
  replace L[0]=q by H4(L)[2]=g
  quotients [5,1,4,2]

joint starts:
  [146,57,132,71].
~~~

The other residue-supporting shell produces starts p37=0, p38=0, p39=17 and p40 in {101,188}; none of its quotient vectors belongs to the 16-member p6 splice family.

This is a bounded post-discovery family result, not a discovery-wide probability.

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
 -> p6 title/H(title) quotient splice
 -> one complete base29 start vector [146,57,132,71].
~~~

The exact LUCK / BEWARE / FALSE / PATHS subtraction keys were not used to choose these receivers.

This is now a complete p6-only receiver-address rule for one of the two q-sized ordinary blocks; the separate p40 address71 route is corroborating evidence rather than a dependency.

## Evidence boundary

Both constructions were discovered after the receiver vector was known. Preserve the 768-combination joint charge and do not describe this as prospective validation.

Authenticated source word lengths are part of the selector. That is appropriate for this known-source corridor, but it is not an unknown-plaintext decryption rule by itself.

The result does not authenticate the four fitted local keys. It sharply reduces receiver freedom.

The first q-block now independently has its own p6-authored receiver-residue grammar, so basic q-block receiver selection is no longer the central gap. The remaining central problem is to derive complete ordered **key serializers** for the selected receivers, ideally one rule that transfers across both q-blocks and predicts a fresh key before target scoring.

## Reproduction

Run:

~~~text
node sims/lp2_p6_block3_receiver_residue_sft.cjs
~~~

The SFT reconstructs p6 and source GP lengths, enumerates all 48 residue constructions and all 16 one-coordinate title/H(title) quotient splices, scans the full 768-product family, and asserts that exactly one p6-only joint address grammar yields the published receiver vector [146,57,132,71].
