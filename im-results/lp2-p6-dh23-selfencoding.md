# The sixth cuneiform passage independently self-encodes the DH23 state

**Agent34, 19 November 2026. Classification: source-constrained structural replication of an independently established DH tuple. No unknown LP2 prose is claimed.**

## Source selection

The p28 `BASE29` word selected by authenticated command boundaries has literal circumference-peel sums:

`74 → 57 → 6 = BASE29 → NEXT → 6`.

Original pp36–p38 visibly number five red passages **1–5**. Immediately after passage5, the red 10-dot mark at physical p38 rune offset186 opens a distinct unnumbered passage. It continues onto p39 and ends at the red 13-dot mark at p39 rune offset119, immediately before the chapter's three-black-dot divider and separate red-X section.

Thus the manuscript-native consequence of `NEXT → 6` is a source-visible **sixth passage**. This interpretation does not require the historical TCP NEXT command to accept a numeric argument.

## Independent DH reconstruction inside passage6

The exact passage6 source has:

- p38 suffix: **42 runes / 8 complete words**;
- p39 prefix: **119 runes / 26 complete words**;
- total: **161 runes / 34 words**.

The independently established p28 DH state is:

`p=23, g=5, a=6, A=8, b=15, B=19, K=2`.

Passage6 reconstructs that state from source-visible positions and the already frozen H transform `H(x,y)=(x-y,x+y) mod29`:

### Modulus and cube exponent from the passage boundaries

The passage is bracketed by red dot counts **10** and **13**.

- ordinary sum: `10+13 = 23 = p`;
- ordinary difference: `13-10 = 3`, the independently selected GP29 cube exponent;
- exact passage length: `161 = 7×23`.

The pair 10/13 is not globally unique among all red punctuation transitions, so this is supporting structure rather than a standalone selector. Here the passage itself is already selected by `NEXT→6`.

### The selected sixth word

Passage6 complete word6 is:

`XH = [14,8]`.

Applying the frozen H transform:

`H(14,8) = [6,22] = [a,p−1]`.

The raw second rune is independently **8=A**. Therefore one source-selected two-rune word simultaneously carries `a`, `A`, and `p−1`.

Among the five two-rune words in passage6, XH is the only one whose H difference coordinate equals its own one-based passage-word ordinal. This was separately locked in the NEXT6 hex/EOT SFT.

### The selected sixth rune

The sixth rune of passage6 is GP index:

`19 = B`.

This is independent of the sixth-word boundary: it is the sixth rune in the continuous 161-rune source unit.

### The p39 continuation word

There are exactly **8 complete passage6 words on p38**, so passage word9 is the first complete word on p39:

`SW = [15,7]`.

Its raw first rune gives:

`15 = b`.

Its second rune is:

`7 = 161 / 23`.

And the same frozen H transform gives:

`H(15,7) = [8,22] = [A,p−1]`.

So `A=8` is repeated independently in three source-shaped ways:

1. raw second rune of selected word6 XH;
2. H-difference of the first p39 continuation word SW;
3. exactly 8 complete passage6 words occur before the p38→p39 page break.

### Generator and shared key

The immediately preceding source structure is explicitly numbered **1–5**, giving the already established generator value `g=5` without searching passage6 values.

The complete DH relation then verifies exactly:

`5^6 mod23 = 8 = A`

`5^15 mod23 = 19 = B`

`19^6 mod23 = 8^15 mod23 = 2 = K`.

No language score, key search, phase search, or alternate modulus is used.

## Typed hex checkpoint in the same passage

The two DH-bearing words both have GP0 `22=p−1`, so both address p50 cell22, whose literal printed token is `0x`.

- word6 XH: H gives `[a,p−1]=[6,22]`;
- word9 SW: H gives `[A,p−1]=[8,22]`.

The sixth rune `B=19` independently addresses p50 cell19, printed `0X`.

This explains why the NEXT6 receiver produces the same hexadecimal prefix under both rune and word readings. The later p27 red13 route supplies p50[13]=`04`, closing as ASCII `0x04 = EOT`, consistent with authenticated GOODBYE.

## Assessment

This is materially stronger than noticing isolated DH numbers in ciphertext. The passage is selected before the DH readout by the p28 `NEXT→6` instruction and visible 1–5 sequence. Once selected, fixed positions and page geometry reproduce the independently established DH23 state:

- visible predecessor count → `g=5`;
- boundary sum → `p=23`;
- word6 H-difference → `a=6`;
- word6 raw second rune and word9 H-difference/page break → `A=8`;
- rune6 → `B=19`;
- first rune of first p39 continuation word → `b=15`;
- ordinary DH computation → `K=2`.

The strongest remaining rival is deliberate-looking coincidence in a structure found after DH23 was already known. The discriminating feature is the density of mutually consistent, source-fixed coordinates in one independently selected passage. This should be independently audited against a predeclared family of comparable passage/word/page-boundary statistics before promotion to an established cipher instruction.

## Reproduction

Run:

`node sims/lp2_p6_dh23_selfencoding_sft.cjs`

The SFT reads only canonical source resources, reconstructs the exact p38/p39 passage boundaries, asserts the source positions, H relations, p50 `0x` typing, and both DH shared-key computations.
