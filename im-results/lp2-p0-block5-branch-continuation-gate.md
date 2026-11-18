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

## Plaintext-blind IDEA selector: path overlap plus the next physical page start

The earlier version selected `IDEA` because it was the unique three-rune common word among the 56 frozen post-`NOW THE` candidates. A stronger local selector now removes that English gate.

The original p0-p2 rune counts are **262 / 266 / 201**, so row-major reflow of the source-selected 729-rune span puts the first p2 rune at **(20,16)**. Freeze the already selected `NOW THE` ciphertext path:

```
(11,16) (12,17) (13,18) (14,19) (15,20)
```

Enumerating every equal-outer mirror centered on one of those five cells yields **seven** source nodes. Exactly one node contains **two** cells of the preceding ciphertext path rather than only its center:

```
A(8,13) - TH(11,16) - A(14,19)
```

That uniquely selects `A-TH-A` at radius 3. The established center-totient/Möbius alignment gives **U-A-A**.

Now start at the frozen endpoint **(15,20)** and enumerate all eight straight rays with every in-bounds prefix length. For each candidate endpoint, require a plaintext-blind incidence chain: the endpoint centers a mirror; one outer of that mirror centers a second mirror; an outer of the second mirror is the **next physical page start (20,16)**.

Only the down-left ray satisfies this. It has hits at lengths **3** and **9**. Taking the first source-valid stop selects:

```
(15,20) -> (16,19) -> (17,18)
```

Decrypting those three already-selected cells under `U-A-A` gives `I-D-EA`, hence **IDEA**, without dictionary scoring, English-prefix scoring, or the downstream 12-rune checksum.

The physical-boundary control is clean. From the same start, p0 end **(10,19)**, p1 start **(10,20)**, p1 end **(20,15)**, and matrix end **(27,27)** produce **zero** such two-mirror hits. The p2 start alone produces the two down-left hits above.

The selected endpoint also exposes the exact local structure used by the post-IDEA work: **D(17,18)** centers exactly one mirror, `J-D-J`; only its **J(19,16)** outer is a mirror center; that J centers `OE-J-OE`, whose lower outer is the physical p2 start **(20,16)**. Agent29's separate broad post-IDEA mirror family therefore starts from a source-selected endpoint rather than an English-selected one.

This materially reduces plaintext feedback at block 8. The overlap-plus-next-page-boundary rule was still recognized after the public candidate route was known, so it remains an intermediate local mechanism until it predicts untouched material or an original clue independently instructs the same operation.

Reproducer: `sims/lp2_p0_idea_pageboundary_selector_sft.cjs`.

## Scope

This is stronger than choosing I MAY from grammatical coherence. The block-5 tie and the CRY/NOW THE steps still use the frozen source-native lexical gate, while the IDEA step now has an independent local geometry selector using previous-path overlap and the next physical page start.

The remaining caveat is upstream: the endpoint-mirror/totient/move families were learned from the published block-6/7/8 constructions rather than independently named by an original signed instruction. The p0 original artwork's exact 180-degree pairing and the heading's repeated-rune symmetry make mirror operations source-plausible, but they do not uniquely specify this complete transition rule.

Reproducer: `sims/lp2_p0_block5_branch_continuation_gate_sft.cjs`.
