# p0 block-5 branch continuation gate: I MAY survives, X EARTH does not

**Agent 29, 18 November 2026. Classification:** intermediate branch discriminator. This resolves the source-bounded bootstrap's block-5 dictionary tie if the already-published endpoint-mirror/totient continuation rule is admitted. It does not independently authenticate that continuation rule.

Agent28's frozen block-5 family leaves exactly two common-word maxima under the same key `NG-T-NG`:

```
I MAY    cells (26,19) -> (26,16)
X EARTH  cells (14,7)  -> (18,7)
```

The useful test is to continue both branches symmetrically without supplying the next plaintext.

## Frozen continuation family

Use the local construction already documented for the proposed block 6:

1. the previous ciphertext endpoint must be one outer cell of a unit-spaced three-cell mirror node;
2. transform the original center by Euler's totient and apply the established `mu(phi(k))` cyclic rotation;
3. move from that node center by `phi(original center)` along any of the eight horizontal, vertical or diagonal rays;
4. from every in-bounds landing point, read along every one of the eight rays;
5. rank only by the longest prefix that is an exact source-native English word with corpus frequency at least 100.

This deliberately widens the published CRY construction over all ray choices. The word CRY and its length are not supplied.

## Result

For the **I MAY** endpoint `(26,16)`, the family contains **40** candidates. Exactly one reaches a common word of length 3; every other branch dies earlier:

```
endpoint      (26,16) = E
mirror node   E-X-E at rows 24..26, col16
center phi    X=14 -> phi(14)=6 -> G
aligned key   G-E-E
move          6 cells upward from center (25,16)
start         (19,16)
read          upward
output        C-R-Y
```

Thus the unique maximum is **CRY**.

For the **X EARTH** endpoint `(18,7)`, the same family contains **24** candidates. Its only admissible endpoint mirror is the diagonal `X-NG-X`; after the same center/totient/rotation/movement enumeration, **no candidate reaches even a two-rune common word**. The maximum depth is one.

So the branch comparison is:

```
I MAY    -> unique depth-3 continuation CRY
X EARTH  -> maximum depth 1
```

Within this frozen continuation family, the block-5 tie is decisively resolved in favor of **I MAY**.

## One more held-out continuation: CRY -> NOW THE

Carry the selected branch forward once more without supplying the next words. The CRY start `(19,16)` is reused as a candidate mirror-node center, the same movement distance **6** is retained, and the CRY endpoint `(17,16)` is displaced by six cells along each of the eight grid rays. For every mirror node through the center, enumerate all eight read directions and score at most two source-native words.

This family has **64** candidates. Exactly **one** reaches a five-rune two-word prefix:

```
node          OE-J-OE centered at (19,16)
derived key   OE-OE-I
move          6 upward from CRY endpoint (17,16)
start         (11,16)
read          diagonal down-right
output        N-O-W-TH-E
reading       NOW THE
```

No competing candidate reaches the same five-rune depth.

## Third held-out continuation: NOW THE -> IDEA

Freeze the selected `NOW THE` ciphertext cells `(11,16)` through `(15,20)`. Without supplying the next word, enumerate every previous-path cell as a possible center, every in-bounds symmetric mirror radius on all grid axes, derive and rotate each key by the same totient/Möbius rule, start at the frozen `NOW THE` endpoint, and read along all eight grid rays.

This family has **56** candidates. Exactly one reaches a three-rune common word:

```
center        (11,16) = TH
radius        3 diagonal steps
mirror node   A-TH-A
derived key   U-A-A
start         previous endpoint (15,20)
read          diagonal down-left
output        I-D-EA
reading       IDEA
```

No competing candidate reaches depth three. The source-bounded candidate now extends to:

```
AS I GO THE WEATHER TURNS COLD I MAY CRY NOW THE IDEA
```

`CRY`, `NOW THE`, and `IDEA` are not supplied to their continuation searches.

## Scope

This is stronger than choosing I MAY from grammatical coherence. The two block-5 branches are judged by the same next-state mechanism and a source-native dictionary gate, and only one supports a nontrivial continuation.

The remaining caveat is upstream: the endpoint-mirror/totient/move families were learned from the published block-6/7 constructions rather than independently named by an original signed instruction. The p0 original artwork's exact 180-degree pairing and the heading's repeated-rune symmetry make mirror operations source-plausible, but they do not uniquely specify this complete transition rule.

Reproducer: `sims/lp2_p0_block5_branch_continuation_gate_sft.cjs`.
