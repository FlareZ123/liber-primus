# GOOD36 H shell routes to the repeated IS pair and THE ROAD corridor

**Agent3, 19 November 2026. Classification: source-selected routing packet / structural advance.** The authenticated 2016 source word `GOOD` at zero-based index36 selects physical LP2 page36 and, under the already active source-number/page-fragment convention, one-based local fragment37. Before assigning any plaintext to that fragment, the frozen outside-in H transform produces a five-value source-index packet whose two difference channels are the two authenticated occurrences of `IS`, whose two sum channels are the consecutive authenticated words `THE ROAD`, and whose center is `EMPTY`.

This result does not recover new body plaintext. It supplies an independent first-party selector for the already-developed p11/p21 `IS` pair and p22/p23 `THE ROAD` corridor.

## Receiver fixed by the numbered route

The authenticated source has:

```text
zero-based index36 = GOOD
```

The active numbered route uses the source index as physical page and the corresponding one-based ordinal inside that physical page. Page-local physical fragments preserve printed `/` line wraps but terminate at a physical `%` page boundary. This is the same convention that yields the existing p28 THE receiver and p30 SEEK packet.

Thus:

```text
GOOD36
 -> physical p36
 -> one-based local fragment37
 -> offsets169..173
 -> C = [2,22,4,1,20]
```

This wording is deliberately **page-local fragment**, not canonical whole word. A canonical word can continue across a physical page boundary, while the numbered route itself is page-local.

## Frozen H readout

For an odd five-rune vector, use the established outside-in pair operation

```text
H(x,y) = (x-y, x+y) mod29
```

and keep the center literal:

```text
C = [2,22,4,1,20]

differences = [2-20, 22-1] mod29 = [11,21]
sums        = [2+20, 22+1] mod29 = [22,23]
center      = 4
```

The authenticated zero-based signed-source positions are:

```text
11 IS
21 IS
22 THE
23 ROAD
 4 EMPTY
```

So the channel-aware readout is exactly:

```text
differences -> IS / IS
sums        -> THE / ROAD
center      -> EMPTY
```

The interleaved H serialization is therefore:

```text
[11,22,21,23,4]
 = [IS,THE,IS,ROAD,EMPTY]
```

The channel structure matters more than the interleaved lexical phrase: the two differences select the repeated `IS` source positions, while the two sums select the consecutive `THE ROAD` positions.

## Complete five-rune fragment control

Charge every five-rune page-local fragment on the 55 rune-bearing unsolved pages. There are **318**.

Use a broader structural predicate that does not name `IS`, `THE`, or `ROAD` in advance:

1. the two H-difference values must index the same authenticated lexical source word;
2. the two H-sum values must be consecutive authenticated source indices;
3. the odd center must be source index4, `EMPTY`.

Exactly one of the 318 five-rune fragments satisfies all three conditions:

```text
p36 fragment37 offsets169..173
C = [2,22,4,1,20]
differences = [11,21] -> IS / IS
sums        = [22,23] -> THE / ROAD
center      = 4       -> EMPTY
```

The exact H packet `[11,22,21,23,4]` itself also occurs once among all 318 five-rune page fragments.

## Numbered-diagonal control

Apply the unchanged source-number/page-fragment rule to all authenticated source indices0..42:

```text
source index i
 -> physical page i
 -> one-based local fragment i+1
```

Forty-two objects exist. The sole absent direct coordinate is the already known `YOU32` case. Within those 42 extant diagonal objects, GOOD36 is again the only object satisfying the broad structural predicate above.

This control conditions on the actual route family rather than searching arbitrary page positions for the desired vocabulary.

## Independent branch closure

The output numbers already have source-selected consumers elsewhere in the repository.

The two differences:

```text
11 IS
21 IS
```

are exactly the repeated authenticated `IS` pair whose same-index pages p11 and p21 independently carry unique IS-state receivers and a paired H2D state object.

The two sums:

```text
22 THE
23 ROAD
```

are exactly the terminal two pages of the independently developed `IS THE ROAD` corridor p21-p23. P22 has the prospectively selected Bob-state receiver and local THEIR inverse; p23 exposes the compatible state checkpoint.

The center:

```text
4 EMPTY
```

has no five-rune/GP0(EMPTY) state receiver on p4 under the same page-fragment census, so it is currently best treated as a sentinel or separator rather than a fifth routed plaintext page.

Thus GOOD36 supplies a compact human-facing router:

```text
GOOD36 numbered object
 -> H differences: both IS branches
 -> H sums: THE ROAD corridor
 -> center: EMPTY sentinel
```

## Evidence boundary

Preserve this as a strong routing/operation-selection result.

Strong points:

- GOOD36 fixes the receiver before its H output is interpreted;
- the H operation and channel order predate this result;
- the broad five-rune control is a manuscript-wide singleton without fixing IS/THE/ROAD;
- the output numbers land on independently developed source-number routes;
- the route uses the same physical page-fragment convention already required by p28 THE and p30 SEEK.

Caveats:

- the route's local objects are physical-page fragments, not canonical whole manuscript words;
- interpreting `EMPTY` as a sentinel is semantic and remains provisional;
- this does not decrypt the p36 fragment to GOOD or recover a general LP2 cipher.

Do not replace the page-fragment convention with canonical cross-page word counting inside this route without re-deriving p28 THE and the later numbered packets.

## Reproduction

Run:

```text
node sims/lp2_good36_hshell_is_road_router_sft.cjs
```

The SFT reconstructs the authenticated source, the page-local fragment diagonal, the GOOD36 receiver, the H channels, the complete 318-fragment structural control, exact-packet uniqueness, and the diagonal singleton.
