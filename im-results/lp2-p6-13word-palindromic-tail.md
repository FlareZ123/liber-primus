# P6 11-inside-13 geometry selects a palindromic 13-word signed tail

**Agent1, 28 November 2026. Classification: source-only structural selector and schedule extension. This materially strengthens the signed-2016 corridor but does not establish unknown LP2 plaintext. The H5 state shells were recognized after the candidate tail was already known, so the finite charges below measure family selectivity, not a discovery-wide probability.**

## Physical boundary

The original p6 annotation contains exactly one red rune span:

```text
start 71
length 11
```

and large red punctuation at both ends:

```text
offset71: 13 dots
offset82: 13 dots.
```

The established p6/DH packet has `K=2`. **Original-source countercontrol:** p15 also has an 11-rune red span (offsets9–20) bracketed by 13-dot red markers, although its three words have lengths `[4,2,5]` rather than p6's `[4,1,4,2]`. In the complete 18-red-span census, seven have red13 marks at both endpoints and **two** contain 11 runes (p6 and p15). Thus this *numeric bracket equation* is **not unique** and cannot by itself select the signed 13-word tail; the p6 **four-word partition** is the source-distinguishing feature. [Full source-only internal control and script](lp2-p6-red13-bracket-internal-control-gate.md).

The p6 artifact contains the literal count relation:

```text
11 red runes + K=2 = 13 boundary dots.
```

The authenticated signed 2016 message has a real sentence boundary immediately after source word29, `DIRECTION`:

```text
... their numbers are the direction.

Seek and you will be found.
Good luck.
3301
Beware false paths. Verify OpenPGP 7A35090F.
```

Under the repository's canonical alphabetic-word parser, excluding the numeric signature `3301` and hexadecimal OpenPGP fingerprint, exactly **13 alphabetic words** follow that boundary:

```text
30 SEEK
31 AND
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
```

The previously established p6 source selector independently selected the final **11** of those words, indices32–42. Thus the source and original p6 object share the same nested boundary:

```text
p6:     11 red runes + K = 13 dots
source: 11 selected words + K = 13 post-DIRECTION words.
```

This is a plausible human-puzzle-style *prompt* to extend the source object two words left to `SEEK AND`, independently of the p30/p31 ciphertext fits. **It is not an independent uniqueness test on its own**, because p15 exhibits the same 11-red/13-dot bracket count; only the full printed p6 four-word partition and the independently charged signed-source word selection distinguish the proposed p6 schedule.

## The full schedule is palindromic

The established p6 title lengths are:

```text
[q,1,q,K] = [4,1,4,2].
```

Prepending the physically/source-selected omitted `K=2` prefix gives the complete 13-word schedule:

```text
[K,q,1,q,K]
= [2,4,1,4,2].
```

It is an exact palindrome and partitions the signed tail as:

```text
[K=2] SEEK AND
[q=4] YOU WILL BE FOUND
[1]   GOOD
[q=4] LUCK BEWARE FALSE PATHS
[K=2] VERIFY OPENPGP.
```

The new prefix K block is therefore the structural mirror of the already established terminal K block, rather than an unstructured two-word attachment.

## Two independent block aggregates collapse to p6 state

For each of the five blocks, sum canonical GP **rune counts** modulo29. The result is:

```text
[7,14,4,19,13]
= [g+K,-b,q,B,b-K].
```

Apply the repository's frozen outside-in H5 transform:

```text
H5([7,14,4,19,13])
= [23,20,24,4,4]
= [p,qg,-g,q,q].
```

This extends the earlier eleven-word length-block relation by one held-out prefix coordinate: the old core contributed `[-b,q,B,b-K]`; the newly restored prefix has length sum `7=g+K`.

Now independently sum canonical block GP0 residues. The five block sums are:

```text
[25,13,6,18,18].
```

Their frozen H5 image is:

```text
H5([25,13,6,18,18])
= [7,14,24,2,6]
= [g+K,-b,-g,K,a].
```

The length and GP0 channels therefore give two distinct, completely source-side p6/DH state packets on the same five-block tail.

## The 13 word initials form a symmetric H13 state packet

The full 13-word object contains an even sharper source-side structure. Take only the **first canonical GP rune** of each word:

```text
SEEK      b      = 15
AND       -g     = 24
YOU       -e     = 26
WILL      K+g    =  7
BE        K+b    = 17
FOUND     F      =  0
GOOD      a      =  6
LUCK      qg     = 20
BEWARE    K+b    = 17
FALSE     F      =  0
PATHS     b-K    = 13
VERIFY    a-g    =  1
OPENPGP   e      =  3.
```

Thus the source wording itself exposes a 13-coordinate p6/DH sequence before any LP2 ciphertext is considered.

Now apply the same frozen outside-in H serialization used throughout the repository: difference and sum for the outermost pair, then work inward, retaining the odd center. The symmetric word pairs collapse as follows:

```text
SEEK / OPENPGP   H(b,e)       = [aK, B-1] = [12,18]
AND / VERIFY     H(-g,a-g)    = [p, p+K]  = [23,25]
YOU / PATHS      H(-e,b-K)    = [b-K, Kg] = [13,10]
WILL / FALSE     H(K+g,F)     = [K+g,K+g] = [7,7]
BE / BEWARE      H(K+b,K+b)   = [F,g]     = [0,5]
FOUND / LUCK     H(F,qg)      = [-qg,qg]  = [9,20]
GOOD             center       = a         = 6.
```

So the complete H13 shell is:

```text
[aK,B-1,p,p+K,b-K,Kg,K+g,K+g,F,g,-qg,qg,a]
=
[12,18,23,25,13,10,7,7,0,5,9,20,6].
```

This is not merely “state expressibility” coordinate by coordinate. The **fixed symmetric pairing imposed by the 13-word palindrome** produces the ordered packet.

Scan every possible contiguous 13-word window of the authenticated 43-word source. Exactly **one of 31** has this exact H13 first-rune shell: source30–42. Relax the coordinate order completely and require only the same 13-value H-shell multiset; it is still **one of 31**, the same tail.

The sequence was recognized after the tail was already under investigation, so this is again a source-side finite charge rather than calibrated discovery odds. Its causal importance is much greater than a fitted LP2 key label: the signed prose itself was authored so that the first GP runes of six symmetric word pairs plus the center collapse under the pre-existing H operation to compact p6/DH state.

## The same H13 fold closes on word lengths and GP0

The initial-rune packet is not the only word-resolution channel. Apply the same outside-in H13 fold to the 13 canonical GP **word lengths**:

```text
raw lengths
[4,3,3,4,2,5,4,4,6,5,4,6,7]

H13(lengths)
=
[-e,b-q,-e,-qg,-1,K+g,-1,-qg,-q,A,a-g,-qg,q]
=
[26,11,26,9,28,7,28,9,25,8,1,9,4].
```

Apply it independently to the 13 canonical **GP0 residues**:

```text
raw GP0
[27,27,1,28,6,7,6,2,1,19,25,1,17]

H13(GP0)
=
[Kg,b,-e,-1,g,-e,-qg,B-1,g,K+g,g,-qg,a]
=
[10,15,26,28,5,26,9,18,5,7,5,9,6].
```

Thus the same p6 13-unit fold converts three different per-word source features into compact p6/DH-role sequences:

1. first GP rune;
2. GP rune count;
3. GP0 residue.

A complete scan of all **31** contiguous 13-word windows gives the same result in every channel:

```text
initial H13 exact hits:   [30]
initial H13 multiset:     [30]

length H13 exact hits:    [30]
length H13 multiset:      [30]

GP0 H13 exact hits:       [30]
GP0 H13 multiset:         [30]

all three exact jointly:  [30]
all three multisets:      [30].
```

The multiset controls remove coordinate order from each shell separately. The post-DIRECTION tail remains the sole window even under that relaxation.

These are correlated views of the same signed words and the role labels were recognized retrospectively; they must not be multiplied into a probability. The substantive point is structural: a physically motivated 13-unit source fold simultaneously closes under three canonical GP statistics.

## Finite source-only charge

Charge every possible contiguous 13-word interval in the authenticated 43-word signed source:

```text
31 source windows.
```

For each window, charge every distinct permutation of the multiset:

```text
[K,q,1,q,K] = [2,4,1,4,2].
```

There are **30** distinct width orders, for:

```text
31 × 30 = 930 configurations.
```

For each configuration compute both five block-aggregate vectors and frozen H5 shells.

Exact-shell results:

```text
length-H5 shell [p,qg,-g,q,q]:
  1 / 930 configurations

GP0-H5 shell [g+K,-b,-g,K,a]:
  2 / 930 configurations

both simultaneously:
  1 / 930 configurations.
```

The sole joint survivor is:

```text
source start30
layout [2,4,1,4,2]
SEEK AND | YOU WILL BE FOUND | GOOD |
LUCK BEWARE FALSE PATHS | VERIFY OPENPGP.
```

The result does not depend on preserving the successful state-field order. Relax each H5 target to **any coordinate permutation of the same multiset**:

```text
length shell: 60 distinct permutations
GP0 shell:    120 distinct permutations.
```

Across the same 930 source-window/layout configurations, the multiset tests still leave:

```text
length multiset: 1
GP0 multiset:    2
joint multiset:  1,
```

with the same source30 / palindromic-layout survivor.

This remains a post-discovery family charge because the successful state multisets were noticed after the tail was known. Its important evidentiary property is that **no LP2 ciphertext, fitted local key, receiver, page number, or language score participates**.

## Relation to the p30/p31 inverse

This source-only result strengthens the separate p30/p31 mechanism in `im-results/lp2-p6-skipped-k2-seek-and-boundary.md`.

Before this result, `SEEK AND` could be described as the exact K=2 prefix omitted by the eleven-word selector, with unusually selective p30/p31 local inverses.

Now the causal order is tighter:

1. the signed message's punctuation fixes the beginning of a 13-word post-DIRECTION tail;
2. p6's 11-rune / 13-dot geometry and K=2 reproduce the 11-inside-13 source nesting;
3. the resulting five-block schedule is the symmetric `[K,q,1,q,K]`;
4. both independent block aggregates collapse to compact p6/DH H5 state shells;
5. the 930-way source-only charge uniquely reselects source30 in the palindromic order;
6. only after that source boundary is fixed do the page-blind p6 receiver/key families on p30/p31 return `SEEK AND`.

That still does not prove the source words are unknown LP2 plaintext: the source selector and p30/p31 inverse grammars were discovered retrospectively. But it materially reduces the largest objection to the new prefix—there is now a first-party source/layout reason to put `SEEK AND` in the same 13-unit object as the eleven-word core.

## Reproduction

Run:

```text
node sims/lp2_p6_13word_palindromic_tail_sft.cjs
```

The SFT reconstructs the authenticated source, p6 ink geometry, all 30 schedule permutations, all 31 source windows, exact and coordinate-order-relaxed H5 charges, and asserts the sole joint survivor.
