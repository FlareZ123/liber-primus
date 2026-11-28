# P6 skipped-K2 boundary: source-only SEEK AND selector and p30/p31 receiver shells

**28 November 2026 — Agent1. Classification: provisional source/receiver bridge, not recovered unknown plaintext.**

The p6 source-tail selector already established that the authenticated signed 2016 source interval used by the current corridor begins at index32:

```text
32 YOU 33 WILL 34 BE 35 FOUND 36 GOOD 37 LUCK
38 BEWARE 39 FALSE 40 PATHS 41 VERIFY 42 OPENPGP
```

and that it omits exactly `K=2` immediately preceding words. Those omitted words are:

```text
30 SEEK
31 AND
```

This note asks a narrow question: **does the omitted K=2 boundary itself contain a source-selected relationship to untouched LP2 p30/p31, without searching LP2 language scores?**

The answer is yes at the source/receiver level. Both omitted words participate in unusually compact, manuscript-unique state-shaped receiver selectors. Their exact additive keys also compress to the previously established p6/DH state, but those key-shell orderings were recognized after the known source words were in hand. Therefore the result materially extends the known-source corridor's causal boundary while remaining provisional.

## Physical 11-inside-13 boundary selects the full signed tail

The original p6 ink annotation supplies a held-out boundary relation that was not needed to discover the 11-word core:

```text
p6 red span: start71, length11 runes
red boundary punctuation: 13 dots at offset71 and 13 dots at offset82
p6 state: K=2
```

The authenticated signed message itself has a sentence boundary after `DIRECTION`:

```text
... their numbers are the direction.

Seek and you will be found.
Good luck.
3301
Beware false paths. Verify OpenPGP 7A35090F.
```

Ignoring the numeric `3301` and hexadecimal fingerprint under the repository's canonical alphabetic-word parser, the material after `DIRECTION` contains exactly **13 alphabetic words**, source indices30–42:

```text
SEEK AND YOU WILL BE FOUND GOOD LUCK BEWARE FALSE PATHS VERIFY OPENPGP
```

The p6 selector independently chose the final **11** of those words, indices32–42. Therefore the original p6 geometry has the exact nested count:

```text
11 red runes + K=2 = 13 boundary dots
11 selected source words + K=2 = 13-word signed tail.
```

This makes p30–p42 a source-visible **boundary object** before any p30/p31 key fit: the signed message punctuation fixes where the 13-word tail starts, the p6 13-dot marks give its extent, and the p6 red-span length11 plus K=2 explains the previously omitted `SEEK AND`. It does not by itself prove that the 13 source words are plaintext on same-number LP2 pages, but it removes the earlier appearance that p30/p31 were attached only because their local inverses happened to work.

## Frozen state and source conventions

Use the already established p6/DH state:

```text
q=4, K=2, e=3, g=5, a=6, p=23, b=15, A=8, B=19, F=0
qg=20, Kg=10, aK=12
```

Canonical GP spelling gives:

```text
SEEK = [15,18,18,5], length4, GP0 sum56 ≡ 27 = -K mod29
AND  = [24,9,23],    length3, GP0 sum56 ≡ 27 = -K mod29
```

Across all 42 consecutive pairs in the authenticated 43-word source, **SEEK AND is the sole pair** satisfying all of:

```text
lengths        = [q,e] = [4,3]
GP0 residues   = [-K,-K] = [27,27]
H2(initials)   = [qg,Kg] = [20,10]
initials       = [b,-g] = [15,24]
```

The individual conditions are not all unique: for example `ROAD AND` also has lengths [4,3], and four individual source words have GP0 residue27. Their conjunction selects only source indices30–31. This computation reads no unknown LP2 ciphertext.

## P30: target-blind receiver selected by the skipped pair

Reverse the pair's source-only H2(initials) and append two already fixed source/state fields:

```text
reverse([qg,Kg]) || [SEEK.first,e]
= [Kg,qg,b,e]
= [10,20,15,3].
```

Search every complete four-rune printed word in original LP2 p0–p55 for this exact H4 shell. There is **one hit**:

```text
p30 local word27, start112
cipher = [21,3,12,11]
H4(cipher) = [10,20,15,3] = [Kg,qg,b,e].
```

This receiver also has an independent address coincidence: its one-based local ordinal is **27**, exactly `GP0(SEEK) mod29 = -K`. Among same-number authenticated four-rune source/page cases for which the GP0 residue points to a length-compatible local word, the other candidates are THEIR19, MEANING20, ROAD23, WILL33 and LUCK37; none has the frozen receiver shell.

The authenticated source word has its own compact state shell:

```text
H4(SEEK) = [10,0,7,20]
         = [Kg,F,g+K,qg].
```

Exact subtraction is:

```text
[21,3,12,11] - [6,14,23,6]
= [15,18,18,5]
= SEEK.
```

The required key has:

```text
H4(key) = [0,20,8,12]
        = [F,qg,A,aK].
```

The inverse H4 transform reconstructs the exact key and forward addition reproduces the original ciphertext. With that exact key frozen, testing both additive signs over every complete four-rune manuscript word and every authenticated four-rune source occurrence gives **one hit**, p30→SEEK.

The important evidentiary split is that the **receiver** is selected without reading its ciphertext values, whereas the exact key-shell ordering `[F,qg,A,aK]` was recognized after the known target was available. Exact replay therefore remains an implementation invariant, not plaintext authentication.

## P31: second manuscript-unique state receiver at the corridor boundary

The following direct state shell:

```text
[b-q,p,b-K] = [11,23,13]
```

occurs as H3 of exactly one complete three-rune manuscript word:

```text
p31 local word32, start126
cipher = [12,23,1]
H3(cipher) = [11,23,13].
```

Its local ordinal **32** is exactly the source index where the p6-selected eleven-word corridor begins. This supplies a second boundary address independent of p31 ciphertext values.

For the authenticated `AND=[24,9,23]`:

```text
[12,23,1] - [17,14,7]
= [24,9,23]
= AND
```

and:

```text
H3(key) = [10,14,24]
        = [Kg,-b,-g].
```

Again the H3 inverse reconstructs the exact key and forward addition replays the original ciphertext.

A necessary caution is stronger here: the **key alone is not manuscript-unique**. The same three-rune key also maps p33 start116 to authenticated `YOU`; the two `AND` source occurrences at indices24 and31 are text-identical and both match the p31 receiver. The evidence is therefore the manuscript-unique receiver shell plus its source-boundary ordinal, not uniqueness of the key.

## Page-blind p6 receiver/key family leaves one joint decode

The receiver formulas can also be charged without fixing p30, p31, SEEK or AND. Let `T=H4([q,1,q,K])=[K,-e,g,a]` and use the literal runes of W3, the q-word in the unique adjacent [q,K] title pair.

A deliberately broader four-rune receiver family allows:

```text
- [q,K] or [K,q] length orientation;
- any signed T field as multiplier of both lengths;
- any literal W3 rune as coordinate3;
- any signed T field as coordinate4.
```

This produces **512 distinct H4 shells**. Across every complete four-rune manuscript word, only two occurrences land in the family:

```text
p30 word27/start112  H4=[10,20,15,3]
p40 word21/start92   H4=[12,24,27,6].
```

The successful shell is the compact p6 rule:

```text
g * [K,q] || [b,e] = [Kg,qg,b,e].
```

For three-rune receivers, allow either [q,K] orientation, any literal W3 rune, and any signed T field in the middle:

```text
[W3.rune - L0, signed(Tj), W3.rune - L1].
```

This gives **64 distinct H3 shells** and exactly two complete manuscript occurrences:

```text
p11 word55/start270  H3=[13,24,15]
p31 word32/start126  H3=[11,23,13].
```

The successful shell is:

```text
[b-q,p,b-K].
```

Now remove page and target conditioning completely inside this family: cross the two four-rune receiver occurrences, two three-rune receiver occurrences, all **31×66** layout-derived key pairs, both signs independently, and the only two authenticated consecutive [4,3] source pairs. That is **65,472 full configurations**. Exactly one survives:

```text
p30 word27 + [6,14,23,6], subtraction -> SEEK
p31 word32 + [17,14,7],    subtraction -> AND
source indices30–31.
```

This is the strongest charge in this report because neither page number nor target word participates in receiver or key selection inside the charged family. The remaining caveat is discovery order: the receiver-family grammar and layout-key grammar were formulated after the successful local inverses were observed. Treat the 1/65,472 count as finite family selectivity, **not** a calibrated probability of accidental discovery.

## Original-layout geometry produces both exact keys

The exact raw keys admit a more restrictive description tied to the original p6 title layout rather than a bag of state scalars. The four red title words are:

```text
W1 [24,16,14,17]  length q
W2 [19]           length 1
W3 [6,27,15,17]   length q
W4 [14,12]        length K
```

W3/W4 is the **unique adjacent [q,K] pair** in the title; W1 is the other q-length word. The original image also shows the large red Fehu `F=0` adjacent to the title (the normalized ink annotation does not encode that large glyph, so the SFT keeps `F=0` explicit).

The two keys can then be written directly from endpoints and the already frozen H operation:

```text
p30 key
= [W3.first, W4.first] || H(F, W3.first)
= [6,14] || H(0,6)
= [6,14,23,6]
= [a,-b,-a,a]

p31 key
= [W3.last, W4.first, H(W1.first,W1.last).difference]
= [17,14, H(24,17)[0]]
= [17,14,7]
= [K+b,-b,K+g].
```

To charge the freedom in this geometry instead of keeping the successful endpoint choices fixed, the reproducer allows:

- either endpoint of W3 and either endpoint of W4;
- both H operand orientations;
- both endpoint read directions and both concatenation block orders for the four-rune p30 key;
- H difference or sum from either W1 circumference orientation and every three-coordinate permutation for p31.

That gives **31 unique p30 geometry keys** and **66 unique p31 geometry keys** after deduplication. Cross them, test both additive directions independently, and test the only two authenticated consecutive [4,3] source pairs (`ROAD AND`, `SEEK AND`): **16,368 configurations, one hit**. The sole survivor is the exact p30/p31 geometry above, subtraction/subtraction, `SEEK AND`.

This is again a post-discovery finite charge, not a calibrated discovery probability. Its significance is causal compression: the successful serializer sits at a unique point in a family generated from literal endpoints, the unique [q,K] adjacency, the visible zero glyph and the existing H primitive. It no longer requires selecting arbitrary GP29 state expressions coordinate by coordinate.

## Joint p6-only serializer charge

The two exact raw keys have a simpler shared source description than their H-shells first suggest:

```text
p30 key = [6,14,23,6]
        = [a,-b,-a,a]
        = [a,-b,p,a]

p31 key = [17,14,7]
        = [K+b,-b,K+g].
```

Both can be serialized directly from the already visible p6 title packet. Let:

```text
W1 = [-g,K-b,-b,K+b] = [24,16,14,17]
H4(title lengths) = [K,-e,g,a] = [2,26,5,6]
H4(W1) = [K+g,K,a-g,aK] = [7,2,1,12].
```

A conservative coupled family was charged after recognizing this pattern:

- choose signed `x` from the four H4(title-length) coordinates (8 choices);
- choose distinct literal `u,v` from W1 in ordered positions (12 choices);
- choose `w` from H4(W1) (4 choices);
- use `key30=[x,v,-x,x]` and `key31=[u,v,w]`;
- charge both additive directions independently;
- test every consecutive authenticated source pair whose GP lengths are [4,3]. There are exactly two: `ROAD AND` and `SEEK AND`.

This is 384 source-only serializers and **3,072 charged serializer/direction/target-pair configurations**. Exactly one joint hit survives:

```text
x = H4(title lengths)[3] = a = 6
u = W1[3] = K+b = 17
v = W1[2] = -b = 14
w = H4(W1)[0] = K+g = 7

key30 = [a,-b,-a,a] = [6,14,23,6]
key31 = [K+b,-b,K+g] = [17,14,7]
directions = subtraction, subtraction
target pair = SEEK AND at source indices30-31.
```

This finite charge is **not** a discovery-wide probability: the serializer skeleton was formulated after the local inverses were noticed. Its value is mechanistic compression. The two pages no longer require unrelated fitted key vectors; one small p6-only family contains a unique coupled serializer for the already source-selected omitted pair.

## Prospective homologous ROAD AND transfer fails before decryption

The only other consecutive authenticated source pair with GP lengths `[q,e]=[4,3]` is `ROAD AND` at indices23–24. Before inspecting the corresponding receiver shells, `workplace/agent1-p6-qe-road-and-holdout-precommit.md` froze a literal transfer of the SEEK AND source-to-receiver grammar:

```text
ROAD/AND initials = [4,24]
H2(initials) = [9,28]

left H4 receiver shell
= [H2.sum,H2.diff,ROAD.first,e]
= [28,9,4,3]

right H3 receiver shell
= [ROAD.first-q,p,ROAD.first-K]
= [0,23,2].
```

Both frozen shells have **zero complete-word hits anywhere in the manuscript**. The transfer therefore fails before page23/page24, rune values, keys, or language are considered. Under the precommit there is no nearby-shell or alternate-address repair.

This clean negative narrows the interpretation of the positive result: the p30/p31 receiver grammar is tied to the independently source-selected `SEEK AND` boundary object. It is not a general decoder for every signed-source [q,e] pair.

## Prospective receiver-address extrapolation fails

After the p30/p31 receiver addresses were frozen as ordinals27 and32, their difference `32-27=5=g` suggested one cheap prospective test. Before inspecting the predicted receiver, `workplace/agent1-p30p31-ordinal-g-step-p29-precommit.md` froze the one-step backward continuation:

```text
p29 predicted ordinal = 27-g = 22
source target index29 = DIRECTION, GP length8.
```

The canonical p29 word22 exists at local start85 but has **length2**, so it fails the gate before any rune value or key is considered. The simple ordinal arithmetic progression is rejected. No ordinal21/23, wrap, alternate step, or reverse-direction repair is permitted under this test.

This negative matters because it prevents the new p30/p31 boundary from being overextended into an unsupported page-address scheduler. The surviving result is the source-selected omitted pair, its two manuscript-unique receiver shells, and the charged joint p6 serializer—not a general `+g` receiver recurrence.

## Why this changes the frontier

Before this check, p6's source-only selector treated `SEEK AND` mainly as the exact `K=2` prefix omitted from the selected p32–p42 interval. The omitted pair is now itself highly structured:

1. It is uniquely selected inside the signed source by three independent source/state descriptions: `[q,e]` lengths, two `-K` GP0 residues, and H2(initials) `[qg,Kg]`.
2. Its p30 receiver is the sole manuscript H4 match to a shell directly constructed from that pair and the already fixed state, and its ordinal independently equals `-K`.
3. Its p31 receiver is the sole manuscript H3 match to `[b-q,p,b-K]`, and its ordinal is exactly the p6-selected corridor start index32.
4. Both exact known-source inverses have compact p6/DH-state key shells and exact forward replay.

This is enough to expand the **research corridor** from an isolated p32–p42 packet to a candidate p30–p42 boundary object. It is not enough to call SEEK or AND recovered LP2 plaintext. The receiver-shell formulas and especially the key-shell orders were recognized during post-discovery analysis, and the existing state-expression saturation results show how easy it is to name GP29 coordinates after the fact.

## Decision / next discriminating test

Preserve p30/p31 as **source-selected receiver candidates** attached to the p6 corridor boundary. Do not promote their plaintexts until a single authored or prospectively frozen serialization rule predicts the complete key/operation on a fresh receiver.

The highest-value follow-up is now narrower than another state-expression search: find an original clue that orders the state fields used in the p30/p31 key shells, or derive a common serializer whose next output is locked before opening another receiver. Arbitrary signed-field permutations, pairwise arithmetic, or language-score tuning would only re-enter the already demonstrated identifiability problem.

## Reproduction

Standalone source test:

```text
sims/lp2_p6_skipped_k2_seek_and_sft.cjs
```

It reconstructs the signed source and canonical LP2 printed words from repository resources, proves the source-pair uniqueness, checks manuscript-wide receiver-shell uniqueness, verifies H inverses and exact forward replay, and records the p31 key collision control.

No unknown plaintext, authenticated unknown-page key, complete original-cipher mechanism, or continuation endpoint is claimed here.
