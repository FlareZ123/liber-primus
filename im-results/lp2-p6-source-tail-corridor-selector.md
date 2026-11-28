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

## Independent GP0-block charge

The same printed p6 partition also selects the corridor when the source statistic is changed from GP-rune **length** to canonical **GP0**.

For the selected window, sum each p6-defined block's word GP0 values modulo29:

~~~text
YOU WILL BE FOUND       -> 13 = b-K
GOOD                    ->  6 = a
LUCK BEWARE FALSE PATHS -> 18 = p-g
VERIFY OPENPGP          -> 18 = p-g

raw GP0 block sums = [13,6,18,18].
~~~

Apply the already frozen H4 orientation:

~~~text
H4([13,6,18,18])
=
[24,17,24,2]
=
[-g,K+b,-g,K].
~~~

Every output is directly visible from p6: `-g` and `K+b` are W1 fields, while `K` is the first coordinate of `H4(titleLengths)=[K,-e,g,a]`.

Again charge roles rather than keeping this successful shell fixed. Use the p6-visible family:

~~~text
[signed W1[i],
 signed W1[j] with j != i,
 repeat first coordinate,
 signed H4(titleLengths)[k]]
~~~

with all four W1 choices, both signs, three distinct second-W1 choices, both signs, four title-H choices, and both signs:

~~~text
4 * 2 * 3 * 2 * 4 * 2
= 384 H-shells.
~~~

Across all 33 source windows and all 12 permutations of the p6 layout:

~~~text
33 * 12 * 384
= 152,064 configurations.
~~~

There is again exactly **one** hit:

~~~text
window 32..42
layout [4,1,4,2]
GP0 block sums [13,6,18,18]
H4 shell [24,17,24,2]
roles [W1[0],W1[3],W1[0],H4(lengths)[0]]
      = [-g,K+b,-g,K].
~~~

No other source window or p6-layout permutation matches any member of this 384-shell family.

The length and GP0 charges are not independent discovery-wide probabilities: they use the same authenticated words and both role families were formulated after the corridor was known. They are, however, **different canonical source statistics** that independently reduce to p6-visible state and single out the same printed-order interval.

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


## Conditional paired-word permutation calibration (Critic, 28 November 2026)

A second audit of the **already-defined** two selector families asks how unusual it is for both families to fire at the *same source window and same printed-layout permutation*. The null shuffles authenticated word tokens while keeping each token's **paired** canonical GP-rune length and GP0 statistics intact, preserving the observed 43-word multiset. The role sets remain fixed at the 48 length vectors and 384 GP0 H-shells above; no fitted LP2 plaintext, receiver or key is used.

The original signed source has exactly one hit in **each** family, at word indices32..42 in layout [4,1,4,2], and one joint hit. Deterministic 30,000-trial conditional controls (xorshift32 seed 0xC1CA3301, Fisher–Yates) yield:

| Event among 30,000 shuffles | Shuffle all 43 words | Shuffle only last 13 DIRECTION-fold words; fix first 30 |
| --- | ---: | ---: |
| At least one length-family match anywhere (33 windows × 12 layouts) | 3,918 | 1,010 |
| At least one GP0-family match anywhere | 5,859 | 1,344 |
| Both families match somewhere, not necessarily together | 779 | 38 |
| Both match the same window, allowing different layouts | 29 | 7 |
| **Both match the same window and the same layout** | **4** | **2** |
| Exactly one hit per family, jointly at that same window/layout | 2 | 1 |
| Joint match at the postselected original position32 and original layout | 0 | 0 |

Thus the **conditional** anywhere/same-layout joint event appeared 4/30,000 (0.0133%) in the full shuffle and 2/30,000 (0.0067%) in the 13-word tail shuffle. These small Monte Carlo numerators have substantial sampling uncertainty; the zeros at the specific observed position/layout are *not* evidence of zero probability. The trailing-13 experiment is relevant because the independent DIRECTION=29 construction fixes the tail before the p6 length readout, but randomly rearranging signed prose is still only a structural control, not a realistic generator for signed messages.

**Critical inferential boundary:** These are *not* calibrated discovery-wide odds. Both p6 role families, the choice of source statistics, and the corridor itself were assembled after seeing an apparent alignment; no charge is made for alternative source texts, packet sites, role grammars, target intervals or researcher exploration. The length and GP0 tests use the same words and are correlated, not independent probabilities to multiply. What this audit contributes is a reproducible **conditional co-selection diagnostic**, showing that the overlap is less trivial than either family individually under two exact multiset-preserving controls. It does not recover unknown plaintext, authenticate any page-local serializer, or permit promotion of the eleven fitted keys.

Reproduce with node sims/critic_p6_source_permutation_null.cjs from repository root. The script asserts all observed and simulated counts before printing its JSON summary. Continue to require an authored, prospective receiver/key rule on original LP2 ciphertext.

## Page-by-page arity and paired q-block edge packet

Agent44's follow-up resolves more of the schedule before touching unknown-page plaintext. The selected source interval's complete GP-rune length vector is

~~~text
[e,q,K,g | q | q,a,g,q | a,g+K]
= [3,4,2,5 | 4 | 4,6,5,4 | 6,7].
~~~

Charging every within-block permutation gives 576 schedules per source window and leaves only source32..42. A broader 456,192-case charge that also permutes the four labeled block roles leaves only two hits, both on source32..42; printed p6 order resolves the sole GOOD/PATHS boundary ambiguity.

P6 also exposes the literal physical edge packet `E=[q,K,aK,p-1]=[4,2,12,22]`. For independently selected p37..p40 receivers, GP0 is `[9,1,18,25]`; subtracting E predicts first-q-block GP0 `[5,28,6,3]`. Across all p6-arity-compatible complete-group sequences on p32..p35 this leaves starts `[1 or 30], [132], [4 or 249], [25]`: p33/p35 unique, with p32/p34 resolved independently by the full-stop and THEIR-RISE gates.

All 24 edge-coordinate permutations and both q-block directions were charged. Forty-six of 48 fail structurally; the only alternative survivor predicts p33 start185 and p34 start105, contradicting independent selectors. The literal printed edge order is therefore the only charged orientation compatible with the full current q-block route.

The GP0-difference operation was discovered after the corridor, so this is **provisional coupling evidence rather than an authenticated serializer**. Seek an authored paired-lane GP0 instruction or a fresh prediction under the frozen packet before inventing further independent local key shells. See [the coupled q-block report](lp2-p6-qblock-edge-gp0-coupling.md) and `sims/lp2_p6_qblock_edge_gp0_coupling_sft.cjs`.

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
- charges all 12 p6-layout permutations and all 48 W1/q/W2 length-role/sign vectors;
- independently charges all 384 p6-visible GP0 H-shells under the same 12 layouts;
- checks all 33 contiguous 11-word windows for both canonical source statistics;
- asserts that both finite families have their sole hit at words32..42 in printed p6 order;
- verifies length-state closure `[-b,q,B,b-K] -> [a-g,-b,p,-K]`;
- verifies GP0-state closure `[b-K,a,p-g,p-g] -> [-g,K+b,-g,K]`;
- verifies the held-out boundary consistencies `K=2` and `e=3`.
