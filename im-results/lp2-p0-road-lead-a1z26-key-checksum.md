# P0 ROAD candidate: additive key numbers spell LEAD

**Agent4, 19 November 2026. Classification: strong post-discovery semantic/key checksum on the independently selected p0 ROAD receiver. This strengthens ROAD but does not source-select A1Z26 as a general LP2 cipher or complete the ROAD state transition.**

## Frozen local context

The current READ OUT route now reaches original p0 plaintext **THE** at offsets103..104 through a reversible operation independently reported by Agent14:

`READ OUT -> p0 80..102 -> wordwise H packet -> one-based (A,K) indexing -> [a,p]=[6,23] -> THE`.

The immediately following original complete word is p0 word23, offsets105..108:

`cipher = [16,8,25,27]`.

A separate GP0/p50 navigation route had already predicted that this word is **ROAD**, before the observation below. Native GP29 ROAD is:

`[4,3,24,23]`.

The additive key required by that fixed candidate is therefore:

`cipher - ROAD mod29 = [12,5,1,4]`.

Read only as ordinary one-based alphabet numbers, those four integers spell:

`12 5 1 4 = L E A D`.

Forward reconstruction is exact:

`ROAD_GP29 + [12,5,1,4] mod29 = [16,8,25,27]`.

This is the central observation.

## Why LEAD is a meaningful checksum

The authenticated 2016 message says:

`Its words are the map, their meaning is the road, and their numbers are the direction.`

On the independently selected word whose proposed meaning is literally ROAD, the required four numerical shifts spell **LEAD**, a direct English direction/guide verb.

This was noticed after ROAD was proposed, so it is a semantic checksum rather than a prospectively source-selected key.

The same four increments also have the already reported DH factorization:

`[12,5,1,4] = [a*K, g, K*b, b*A] mod29`

for the independently fixed state

`p=23, g=5, a=6, b=15, A=8, B=19, K=2`.

That factorization does not by itself explain why those four products are the state update, but it shows that the LEAD numbers are simultaneously expressible in the current source-derived DH vocabulary.

## Fixed-target placement control

Use the repository's existing source-native English lexicon: TextBlob word-frequency words plus the pinned Gibran, Shakespeare, Emerson and LP1 plaintext controls.

There are **514** complete four-rune words across unknown p0..p55.

Freeze plaintext target ROAD. For each four-rune ciphertext word:

1. compute its additive key relative to ROAD;
2. require all four key values to lie in ordinary A1Z26 range1..26;
3. convert those four values to letters;
4. ask whether the result is a four-letter word in the frozen lexicon.

Only **2/514** placements produce any lexicon word:

- **p0 word23, offset105: LEAD**;
- p5 word45, offset196: GUMS.

Thus the independently selected ROAD receiver is one of only two manuscript placements where ROAD has an English A1Z26 additive-key word, and its key word has the direct semantic relation.

This is a post-discovery family control, not an authorship p-value.

## Fixed-receiver authenticated-word control

At the fixed p0 word23 receiver, take every distinct authenticated 2016 word whose canonical native-GP length is four. There are eight:

`LIES, THEIR, ROAD, SEEK, WILL, GOOD, LUCK, PATHS`.

Charge four simple ordinary alphabet-number conventions:

- A1Z26;
- A0Z25;
- reversed Z1A26;
- reversed Z0A25.

Across the **8 × 4 = 32** target/convention combinations, exactly one yields a four-letter word in the same frozen lexicon:

`ROAD + A1Z26 -> LEAD`.

The nearby alternatives fail:

- LIES -> key includes27 under A1;
- THEIR -> NSOW;
- SEEK -> ASGV;
- WILL -> includes27;
- GOOD -> JEVD;
- LUCK -> YGTV;
- PATHS -> CMWL.

A wider A1Z26 family over all eight authenticated targets and all 514 four-rune manuscript words contains **12** lexicon hits among **4,112** pairs. ROAD/LEAD is one of them; the family count is reported to expose rather than hide the available search freedom.

## LEAD re-enters the established GP0 graph

Canonical GP spelling uses the dedicated EA rune:

`LEAD = [L,EA,D] = [20,28,23]`.

Therefore:

`GP0(LEAD)=71`.

Authenticated **SEEKS** also has:

`GP0(SEEKS)=71`.

Under the established whole-word GP0 -> zero-based p50 address primitive:

`p50[71]=108`.

The equality `GP0(LEAD)=GP0(SEEKS)` means that the new semantic key word enters exactly the same p50 address as the authenticated source word that already participates in the p0 EPIPHANY/DEVOTED navigation. This is an exact collision and a potentially useful continuation, but it does not by itself define whether 108 is a page, offset, key sum, or another typed receiver.

## Negative continuation

Repeating A1Z26 LEAD as a four-rune additive key beyond ROAD does **not** produce readable continuation. The exact key is therefore local under the present evidence. Do not promote LEAD to a repeating p0 Vigenere key or use its 71/108 continuation without an independently fixed output type.

## Decision

The strongest causal statement is now:

- THE at103..104 has an exact source-linked H-packet inverse;
- the adjacent independently predicted ROAD word requires shifts `[12,5,1,4]`;
- those shifts spell **LEAD** under the ordinary one-based alphabet;
- the same vector is expressible as the current DH product tuple `[aK,g,Kb,bA]`;
- at the fixed receiver, ROAD/A1Z26 is the only authenticated four-rune target/convention pair that yields an English key word.

This is substantially stronger than treating ROAD as an unsupported crib. It still lacks the prospective source rule that says "use A1Z26 LEAD here," so classify ROAD as a highly constrained candidate rather than authenticated recovered plaintext.

## Reproduction

Run:

`node sims/lp2_p0_road_lead_a1z26_gate_sft.cjs`

Windows Node22 CI: **PASS 44428627212**.

The SFT reconstructs the ROAD ciphertext/key, exact forward encryption, LEAD GP0/SEEKS collision, DH factorization, the 514-word fixed-target census, the authenticated fixed-receiver convention control, the 4,112-pair wider A1 family, and the negative repeated-LEAD continuation.
