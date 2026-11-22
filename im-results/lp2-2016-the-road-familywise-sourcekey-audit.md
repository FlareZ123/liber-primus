# Signed-2016 family audit: THE is source-keyed at p0 103..104; ROAD remains an unverified continuation

**Agent5, 19 November 2026. Director #1722. Classification: positive source-only recovery for the two-rune word THE, mixed/negative result for the full THE ROAD phrase. This audit does not use READ OUT, MAP, LEAD=82, or English scoring outside the frozen signed-2016 target family.**

## Frozen source family

The authenticated 2016 cleartext has 43 alphabetic words under the canonical native-GP parser.

Among all 42 adjacent signed-word pairs, exactly one has native-GP rune lengths [2,4]:

`THE ROAD`, source words **23/24**.

Physical p0 has exactly one adjacent complete-word pair with lengths [2,4]:

- word22 offsets **103..104**, ciphertext `[8,12]`;
- word23 offsets **105..108**, ciphertext `[16,8,25,27]`.

The preserved 2016 carrier is 563×569. Those are primes #103/#104. Charging forward/reverse dimension order and zero/one-based p0 origin, only the forward zero-based interpretation lands exactly on the complete two-rune word103..104. The one-based interpretation is offsets102..103 and crosses a word boundary.

Thus the source phrase shape and the original image ordinals independently select the same p0 pair before any DH scoring.

## Exact source-only inverse for THE

Canonical native-GP THE is:

`THE = [TH,E] = [2,18]`.

At the selected p0 word:

`cipher - THE = [8,12] - [2,18] mod29 = [6,23]`.

The signed 2016 artifact itself supplies those two numbers without using the p28 DH reconstruction:

- image dimension gap: `569 - 563 = 6`;
- one-based source-word ordinal of this exact THE: **23**.

So the value-changing rule is:

`THE + [dimension gap, signed word number] = [2,18] + [6,23] = [8,12]`.

Forward reconstruction is exact.

The equality to the independently reconstructed DH fields `[a,p]=[6,23]` is therefore a cross-check rather than the source of the key.

## Charge the image-number choice

To avoid selecting the six-pixel gap after seeing the key, charge nine simple numbers available from the same 2016 image:

- width mod29;
- height mod29;
- absolute dimension gap;
- dimension sum mod29;
- width prime ordinal mod29;
- height prime ordinal mod29;
- ordinal gap;
- ordinal sum mod29;
- image-area/product mod29.

Also charge every authenticated two-rune signed word (9 occurrences), every complete two-rune p0 word (7), both component orders, and both additive signs.

This gives **2,268** fixed combinations.

Exactly five relations reconstruct a p0 two-rune ciphertext:

1. signed THE #8 + [width mod29=12, ordinal8] -> p0 word24 at109;
2. signed IS #22 + [width-prime-ordinal mod29=16, ordinal22] -> p0 word15 at73;
3. signed THE #23 + **[dimension gap6, ordinal23]** -> p0 word22 at103;
4. the same #23 relation written with reversed components and the inverse sign;
5. signed THE #23 + [ordinal23, image-product mod29=13] with inverse sign -> p0 word53 at235.

Only relation 3/4 lands on the image-prime-ordinal word103..104, and only that word begins p0's unique adjacent [2,4] pair. The two sign/order forms are the same algebraic equality.

A historical asset control reduces the arbitrariness of choosing a dimension gap: the preserved 2012 Cicada first image is 503×509, also consecutive primes with the same **six-pixel gap**. Its prime ordinals are96/97 and do not select a complete p0 two-rune word, so it does not create a second THE receiver.

## ROAD gate

The same family strongly selects the placement of the adjacent four-rune word as ROAD because THE ROAD is the only signed [2,4] pair and p0 103..108 is the only p0 [2,4] pair.

It still does not provide a source-derived four-residue key for ROAD.

The minimal deterministic continuation of the new two-number key rule was frozen as:

`[dimension gap, ROAD source ordinal] = [6,24]`

repeated across the four-rune word:

`[6,24,6,24]`.

Applied to original ROAD ciphertext `[16,8,25,27]`, it gives:

`[10,13,19,3]`,

not native-GP ROAD `[4,3,24,23]`.

So the source-only THE key is local. It is not a repeating page keystream and does not solve ROAD.

## Decision

This audit materially upgrades **p0 offsets103..104 = THE** as an unknown-plaintext candidate:

- the authenticated source contains the exact target word;
- its source ordinal and image geometry give the exact two-symbol additive key;
- the image prime ordinals select the exact original ciphertext word;
- the mapping forward-reconstructs the ciphertext;
- the independent DH route returns the same key [a,p].

The full phrase **THE ROAD** remains a placement/crib candidate. ROAD has no independently selected inverse yet, so the phrase should not be promoted as recovered plaintext from this issue.

The highest-value next step is the already opened bounded DH-expression/state-update gate for ROAD (#1727), with the target key fixed at [12,5,1,4].

Reproducer: `sims/lp2_2016_the_road_familywise_sourcekey_sft.cjs`.
