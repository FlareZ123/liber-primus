# P6 title layout uniquely selects the p32–p42 signed-tail corridor from source word lengths

**Agent14, 28 November 2026. Classification: new source-only corridor selector and authored-schedule evidence. It uses the independently established p6 packet, the authenticated 2016 message, canonical GP spelling lengths, and no unknown LP2 ciphertext. The exact packet-role readout was recognized after the p32–p42 corridor was known, so the result is a finite post-discovery selector rather than a blind plaintext discovery.**

## Result

The p6 red title is already independently established as the globally unique four-word packet

~~~text
starts  [71,75,76,80]
lengths [ 4, 1, 4, 2] = [q,1,q,K]

W1 = [24,16,14,17] = [-g,K-b,-b,K+b]
W2 = [19]          = [B]
~~~

Its four printed lengths sum to **11**.

The authenticated 2016 source contains 43 alphabetic words. For every contiguous 11-word window, partition canonical GP-rune lengths by the p6 title layout `[4,1,4,2]` and sum each block modulo29.

Exactly one window has block sums

~~~text
[W1[2], q, W2, -W1[1]]
=
[14,4,19,13]
=
[-b,q,B,b-K].
~~~

It is:

~~~text
32 YOU
33 WILL
34 BE
35 FOUND

36 GOOD

37 LUCK
38 BEWARE
39 FALSE
40 PATHS

41 VERIFY
42 OPENPGP
~~~

So the p6 title's **printed word boundaries independently select the exact same eleven-word interval that now has local reversible candidates on physical p32–p42.**

No LP2 unknown rune values, local corridor keys, or target plaintext comparisons enter this selector.

## Finite role/layout charge

The successful packet-role formula was noticed after the corridor, so do not score only that one expression.

Keep only the visibly privileged p6 pieces:

- first coordinate: either sign of any W1 rune;
- second coordinate: fixed printed maximum/repeated length `q=4`;
- third coordinate: the singleton W2 rune `B=19`;
- fourth coordinate: either sign of a **different** W1 rune.

This gives:

~~~text
4 choices * 2 signs * 3 distinct choices * 2 signs
= 48 role/sign vectors.
~~~

Also charge every distinct permutation of the visible p6 word-length multiset `[4,1,4,2]`:

~~~text
4! / 2! = 12 layouts.
~~~

The authenticated 43-word source has 33 contiguous 11-word windows. The complete charge is therefore:

~~~text
33 windows * 12 layouts * 48 role/sign vectors
= 19,008 configurations.
~~~

There is exactly **one** hit:

~~~text
window 32..42
layout [4,1,4,2] in printed order
roles  [W1[2],q,W2,-W1[1]]
sums   [14,4,19,13].
~~~

No other 11-word window and no other permutation of the p6 layout satisfies any member of the charged 48-vector family.

This is a finite family result. It is not a discovery-wide probability because the broad role family itself was motivated after the corridor existed.

## State closure

The selected block sums are already direct authenticated-state values:

~~~text
[14,4,19,13]
=
[-b,q,B,b-K].
~~~

Applying the repository's frozen four-coordinate H orientation gives:

~~~text
H4([14,4,19,13])
=
[1,14,23,27]
=
[a-g,-b,p,-K].
~~~

Thus both the raw block totals and their fixed H image stay entirely inside the independently reconstructed source state.

This strengthens the interpretation of the p6 title as a **schedule packet**, rather than merely a bag of state scalars.

## DIRECTION-fold alignment

The source-side DIRECTION construction already fixes word29 as the GP modulus and folds the final 13 source words onto residues1..13:

~~~text
30 SEEK      -> residue1
31 AND       -> residue2
32 YOU       -> residue3
...
42 OPENPGP   -> residue13.
~~~

The new selector chooses residues3..13.

Two independent p6/DH values agree with the boundary after the selector is fixed:

~~~text
leading omitted words = 2 = K
selected start residue = 3 = e.
~~~

So the human-facing source route can now be stated more tightly:

~~~text
DIRECTION=29
-> 13-word trailing fold
-> p6 schedule [q,1,q,K] has 11 slots
-> exact p6 role/length charge selects the final 11 slots
-> YOU ... OPENPGP
-> same source indices align with physical p32..p42.
~~~

The `K/e` boundary agreement is a consequence of the selected window, not an extra search condition in the 19,008-case charge.

## Relation to the corridor receiver modes

The p6 partition also matches a striking current receiver-mode run:

~~~text
p32..p35  four direct/no-rune-deletion local candidates
p36       one q-center deletion
p37..p40  four direct/no-rune-deletion local candidates
p41..p42  two F-deletion local candidates
~~~

giving run lengths:

~~~text
[4,1,4,2] = [q,1,q,K].
~~~

The final two pages are especially notable: p41 and p42 were independently extended on 28 November and both require a checked/removable `F=0` marker, while p6 visibly carries the adjacent large Fehu/F marker. This alignment was **not preregistered**, so preserve it as structural convergence rather than a prospective validation.

The source-only length selector above is the stronger result because it does not depend on classifying local decoder details.

## What changes

Before this result, p6 supplied state/key vocabulary to the eleven local candidates but did not explain why those exact eleven authenticated source words should be treated as one corridor.

Now p6 supplies an independent source-only interval selector:

~~~text
p6 printed layout + p6 visible roles
+ authenticated source GP lengths
-> unique source words32..42
-> YOU WILL BE FOUND GOOD LUCK BEWARE FALSE PATHS VERIFY OPENPGP.
~~~

This materially reduces the remaining serializer problem. The next question is no longer whether p32–p42 is an arbitrary same-index crib corridor; the p6 packet itself independently singles out that source interval under a bounded family. The unresolved step is how each p6-selected block determines the page-local receiver/key serialization.

Do **not** promote the eleven local words to established unknown plaintext solely from this source selector. Their local key-role choices remain heterogeneous and partly post-target. A prospective block-specific receiver/key rule is still required.

## Reproduction

Run:

~~~text
node sims/lp2_p6_source_tail_corridor_selector_sft.cjs
~~~

The SFT:

- reconstructs the p6 title directly from the canonical transcription;
- parses the authenticated signed message to the 43-word register;
- recomputes canonical GP lengths;
- charges all 12 p6-layout permutations and all 48 W1/q/W2 role/sign vectors;
- checks all 33 contiguous 11-word windows;
- asserts the sole hit at words32..42;
- verifies the `[-b,q,B,b-K]` raw state and `[a-g,-b,p,-K]` H4 closure;
- verifies the held-out boundary consistencies `K=2` and `e=3`.
