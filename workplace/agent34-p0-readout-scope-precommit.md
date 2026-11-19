# Agent34 precommit: Director #1804 p0 READ OUT scope family

**Frozen before opening the selected p0 endpoint values. Date: 19 November 2026.**

## Upstream route

Use only the already frozen source route:

```text
p35 FOUND -> p28 -> p0
p28 -> READ OUT
```

P0 is therefore the first downstream unknown page reached after the instruction. This precommit does not use p0 candidate plaintext, prior p0 DH-packet interpretations, or language scoring.

The original p0 scan is used only for visible segmentation. It has 12 nonempty physical rune lines, 59 canonical printed words, a visibly red opening line/span, and ordinary page-edge geometry.

## Fixed operation family

The inherited reversible pair map is

```text
H(x,y) = (x-y, x+y) mod29.
```

For every admitted scope, charge these four operation conventions explicitly:

1. source order left->right, H;
2. source order right->left, H;
3. source order left->right, H^-1;
4. source order right->left, H^-1.

They are family accounting only. The frozen consumer below is chosen before reveal and will not be replaced by another family member after a miss.

## Predeclared source-visible scopes

Ranked before opening any selected rune values:

1. **Whole-page outer rune pair.** First rune and last rune of p0. This is the maximally literal reading of READ OUT and requires no p0-local selector.
2. **Opening physical-line outer pair.** First and last rune of the first nonempty printed line.
3. **Closing physical-line outer pair.** First and last rune of the last nonempty printed line.
4. **Red opening-span outer pair.** First and last rune of the visibly red runic span on the opening line.
5. **First canonical word outer pair.** First and last rune of printed word1.

No scope is defined by ciphertext values, English output, state matches, or a minimum word length. The terminal singleton word is deliberately not replaced by a hand-selected earlier word.

Total charged family: 5 scopes x 2 orientations x 2 reversible H directions = **20 configurations**.

## Frozen consumer

Open **scope 1 only**:

```text
p0 first rune = L
p0 last rune  = R

output = H(L,R)
```

where L/R here mean geometric left/first and right/last operands, not GP letters.

Use source order exactly as printed, left-to-right. Use forward H, because forward H is the inherited outer-shell polarity on the p28 READ OUT -> HERE route. Do not inspect the other 19 family outputs if this misses.

## Independently fixed success register

This is a typed-state test, not an English search.

Before reveal, accept success only if the ordered two-value output equals one of the two core-DH pairs already read directly from the source-selected p28 literal-DH H stream:

```text
[b,K] = [15,2]
[A,B] = [8,19]
```

These two ordered pairs are fixed upstream. Reversal, sign changes, derived expressions, other DH-field pairs, p50 lookups, source-word indices, and English transliteration are not accepted after reveal.

If neither exact pair appears, #1804's frozen whole-page outer-pair consumer is a miss. Stop this branch rather than moving to scopes2-5.

## Reproduction target after reveal

The post-reveal SFT must:
- parse canonical p0 from repository resources;
- assert the visible structural counts above;
- extract only the first and last p0 rune for the selected consumer;
- compute the frozen left-to-right forward H result;
- compare it exactly with the two predeclared state pairs;
- report PASS for correct execution even when the cryptanalytic gate is negative.
