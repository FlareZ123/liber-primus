# Post-SHED missing-f branch gives an EMERGE exit candidate to p0

**Agent13, 18 November 2026. Classification: source-constrained radix-state exit candidate. The arithmetic is exact; the instruction that EMERGE restores the shed digit remains interpretive. No unknown p0 plaintext is decrypted here.**

## The post-SHED branch identifies the digit that was removed

The established p57/p50 route selects a numeral-state transition at the solved phrase **WE MUST SHED**:

- the original printed numeral alphabet has60 symbols;
- lowercase `f` is the unique alphabet symbol absent from all256 original p50 tokens;
- `MUST` gives the ordered state change60 ->59;
- `SHED` therefore selects the unique order-preserving alphabet obtained by removing `f`.

The old zero-based position of `f` in the printed 60-symbol alphabet is:

```
0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx
                                         ^
                                         f = index41
```

Now continue the already selected solved-word GP0 -> p50 grammar.

Before SHED, conventional base60 gives:

```
PARABLE GP0=120
p50[120]=0g
base60(0g)=42=GP0(FIND)
```

After SHED, the same token has the drop-`f` base59 value:

```
base59(0g)=41
```

That is **exactly the old position of the digit that was shed**.

The state then immediately names the next instruction:

```
p50[41]=1O
base59(1O)=83=GP0(EMERGE)
```

The base60 control gives84 rather than EMERGE.

So the source-selected radix state branches at the same PARABLE cell:

```
base60: PARABLE -> 42 -> FIND
base59: PARABLE -> 41 = old f-position -> EMERGE
```

The value41 was already known to be prime #13 in the prior route. Its identity as the exact position of the uniquely shed digit supplies a more direct semantic relation to the immediately preceding SHED transition.

## EMERGE reaches the base59 attractor in its own rune count

The existing EMERGE pointer closure starts from its GP-prime sum modulo the visible table size:

```
GP-prime(EMERGE)=300
300 mod256=44
```

EMERGE has six runes. Following the already selected base59 pointer map for exactly six edges gives:

```
44 -> 226 -> 72 -> 161 -> 214 -> 247 -> 189
```

Address189 is:

```
23*8+5 = (DH modulus23, table width8, generator5)
```

and original cell189 is token `3C`.

Under the shed state:

```
base59(3C)=189
```

so the route is now trapped at a fixed point. Staying base59 cannot continue.

## SURFACE labels the exact radix-sensitive root token

The solved parable itself now supplies a numeric cue for the missing state reset.

The clear word **SURFACE** is p57 word8 and has:

```
GP0(SURFACE)=67
p50[67]=3C
```

That is the **same original token** as the EMERGE root:

```
p50[189]=3C
```

The token is exactly state-sensitive in the required direction:

```
base59(3C)=189   // the shed-state fixed point
base60(3C)=192   // the restored-state exit
p50[192]=00 -> 0
```

Within the complete 20-word p57 title+body, **SURFACE alone** has a GP0 address whose p50 token equals the root token `3C`. The clear word order is also fixed:

```
SURFACE -> WE MUST SHED -> ... -> EMERGE
```

So the same source word that describes the pre-SHED exterior state numerically names the exact token on which the post-SHED walk becomes trapped. Before `MUST SHED`, conventional base60 is independently the active state; after SHED, the same `3C` token is the base59 fixed point. When the six-rune EMERGE walk later reaches that point, returning to **SURFACE** selects the pre-SHED interpretation of the same token and exposes192.

This is materially stronger than a free semantic radix switch at189: the parable now labels the switch token itself. The remaining inference is narrower: **EMERGE returns from the shed/within state to the already numerically identified SURFACE state.**

There are four `3C` cells in the table (67,162,189,247), so the token is not globally unique. The charged fact is that the solved word `SURFACE` fixes address67 through the already established GP0→p50 primitive, and p57 contains no other direct word hit on that root-token class.

The complete four-copy class supplies an additional manuscript-state check. With the visible width8, the copies are:

| address | row | column | authenticated 2016 zero-based row label |
|---:|---:|---:|---|
|67|8|3|DEVOTED|
|162|20|2|MEANING|
|189|23|5|ROAD|
|247|30|7|SEEK|

Their complete column set is exactly:

```
{2,3,5,7} = {K,e,g,g+K}
```

for the independently reconstructed state `K=2,e=3,g=5`. Exhausting every original p50 token class leaves **3C as the only token whose complete occurrence-column set is exactly `{K,e,g,g+K}`**.

Two copies are exact state coordinates without any lexical fitting:

```
67  = A*8 + e = 8*8 + 3
189 = p*8 + g = 23*8 + 5
```

and the authenticated source indexes at those rows are independently `DEVOTED8=A` and `ROAD23=p`. The remaining copies are `MEANING20/K` and `SEEK30/(g+K)`, so the same token class also lands on two central navigation words from the signed 2016 instruction.

This geometry does not by itself prove a decoder. It does show that the exact token singled out by both SURFACE and the EMERGE fixed point is uniquely organized by the already recovered state rather than being an arbitrary duplicate.

The EMERGE walk supplies a stronger completion rule. Its seven visited table columns are:

```
[4,2,0,1,6,7,5]
```

They are all distinct and omit exactly **3=e**. The SURFACE cell67 is in column3. Adding SURFACE therefore completes all eight table columns exactly once.

Charge the whole p57 word family under the frozen operation already used by EMERGE: `GP-prime(word) mod256` start, then exactly the word's rune length in base59 pointer edges. Require a fixed endpoint, then ask whether that endpoint's printed token has a duplicate in an unvisited column whose address is itself a p57 GP0 word address. Across all **20** p57 words, there is exactly one result:

```
EMERGE -> fixed 3C at189
missing column e=3
same-token copy in missing column -> address67
GP0(SURFACE)=67
```

So EMERGE→SURFACE is no longer chosen from a menu of same-token copies. It is the unique p57 completion under the frozen path rule.

A solved-corpus control is semantically revealing without adding parameters. Among **65** six-rune words in the pinned solved GP-native corpus, only four occurrences have a seven-distinct-column walk missing e and ending at the fixed root: two **EMERGE** occurrences and two **INSIDE** occurrences. Both lexical forms have GP-prime sum300 and therefore share the exact path. This is consistent with the solved Cicada language linking going within/inside to emerging, while the cryptographic claim remains the exact path equivalence and column completion.

## Candidate reset: let the shed digit EMERGE

The solved instruction is literally **EMERGE**. With the new SURFACE holdout, the proposed reversal is source-linked rather than an arbitrary escape: EMERGE reaches the token numerically named by SURFACE, and the original pre-SHED base60 state is the only one of the two established numeral states that leaves the base59 trap.

At the same fixed-point token:

```
base59(3C)=189   // trapped
base60(3C)=192   // exits
```

Original cell192 is the literal token `00`, which decodes to0 under either radix.

The already recovered DH shared value is2. Taking exactly two pointer edges in the restored state gives:

```
189 -> 192 -> 0
```

Thus the sequence uses two independently fixed counts:

- EMERGE length6 drives the six-edge base59 walk into the root;
- DH shared2 drives the two-edge restored-state exit to0.

The route therefore supplies a plausible source-authored escape from the closed p27/p28/p50/p57 navigation network.

## The two literal `00` cells are independently saturated

The original p50 table contains exactly two literal `00` tokens, at addresses **192** and **229**.

The earlier p27 serializer route independently recovers literal3301 and then uses the frozen 256-cell reduction:

```
3301 mod256 = 229
p50[229] = 00
00 -> 0
```

The new EMERGE reset selects the **other** literal-zero cell:

```
base60(p50[189]=3C) = 192
p50[192] = 00
00 -> 0
```

So two materially different source routes land on the complete two-element set of original `00` cells and both converge to value0. This does not prove the page receiver by itself, while it makes the 192 stopping point substantially less arbitrary.

## Why value0 is a typed receiver candidate

The same solved grammar already establishes a page-number receiver:

```
FIND GP0=42 -> p50[42]=0S -> 28 -> physical p28
```

Under that receiver type, the exit value0 naturally selects **physical p0**, an unsolved LP2 page.

That target is independently interesting because the authenticated 2016 signed-word map has its strongest current boundary structure on p0, including the conditional `EPIPHANY SEEKS`, `THE ROAD`, and `THE DEVOTED` placements. This new route does not authenticate those plaintext candidates, though it gives p0 a causal position downstream of the DH/SHED state machine.

## Conditional recovery of the p0 opening phrase

The restored-state exit contains one further locked value before the page number:

```
189 -> 192 -> 0
      ^     ^
      |     physical p0
      candidate phrase number
```

The intermediate **192** is exactly:

`GP0(EPIPHANY SEEKS) = 192`.

Charge that value against the complete authenticated 2016 signed message. It has43 canonical words and42 adjacent word pairs. Exactly **one** adjacent pair has combined GP0 sum192:

```
EPIPHANY SEEKS
```

Its GP rune lengths are exactly **8,5**.

Now charge that shape against the original LP2 pages. Among all55 physical rune pages in p0..p55, excluding the p50 numeral table, **p0 alone** begins with words of lengths8 and5.

So the exit candidate makes a two-part typed prediction without using p0 rune values as a language score:

1. intermediate value192 uniquely selects authenticated phrase **EPIPHANY SEEKS**;
2. terminal value0 selects physical **p0**, whose unique opening geometry is **8,5**.

Conditional on the EMERGE radix-reset interpretation, this recovers the p0 opening phrase as **EPIPHANY SEEKS** from independent source material and page geometry. The original p0 first13 ciphertext runes themselves are not used to choose the phrase, except for the already visible two-word boundary lengths.

This also strengthens the pre-existing p0 title crib enough to use it as a fixed cryptanalytic holdout. It still does not identify the reversible cipher that maps those plaintext runes to the original p0 ciphertext.

### Original-ciphertext additive checksum holdout

The first two printed p0 words are a period-delimited 13-rune opening. Under the source-selected candidate `EPIPHANY SEEKS`, subtract the candidate GP29 runes from the original ciphertext runes modulo29. The exact residual is:

```
[26,24,8,19,27,24,18,3,0,8,0,16,19]
```

Its ordinary integer sum is:

```
192
```

which is simultaneously the already selected EMERGE exit value and `GP0(EPIPHANY SEEKS)=192`.

The same residual has a second manuscript-native checksum:

```
GP-prime(residual) = 729
```

The original p0, p1, and p2 rune counts are `262+266+201=729=27^2`, exactly the independently rubrication-selected p0-title-to-next-red13 square span. The residual length is13, matching the physical red-title/delimiter count that selects that span.

This was charged against every ordered pair of authenticated 2016 source words whose combined GP rune length is13. There are **52** such ordered pairs. Forward subtraction gives two prime-sum729 candidates, `EPIPHANY HELLO` and `EPIPHANY SEEKS`; only **EPIPHANY SEEKS** also has residual integer sum192. The separate self-check

```
sum((cipher - candidate) mod29) = GP0(candidate)
```

also leaves only **EPIPHANY SEEKS**. Reversing the subtraction sign gives no self-sum hit; a direct both-sign control finds no reverse-sign prime729 hit either.

The older direct-Latin `SECUENDI RATIO` red-title candidate does not share these closures: its forward additive residual has GP0=112 and GP-prime=384. That comparison does not invalidate its separate geometric derivation, while it makes the authenticated `EPIPHANY SEEKS` phrase the stronger source-linked candidate for the same physical 13-rune title.

This is a value-sensitive original-ciphertext holdout rather than another word-length match. It does not yet establish a reusable cipher because no source-selected rule explains the 13 residual symbols or predicts a second independent ciphertext interval. Treat it as a strong check on the conditional opening, below authenticated plaintext.

## Evidence boundary

Every numeric relation through the base59 fixed point is reproducible from original artifacts and solved p57 text. The reset now has a first-party numeric cue: `GP0(SURFACE)=67 -> p50[67]=3C`, exactly the root token, with base59 returning to189 and base60 exiting to192. Within p57, SURFACE is the sole direct GP0 hit on that root-token class.

The destination step is now source-selected within the frozen p57 family: EMERGE uniquely completes to SURFACE by the missing-column duplicate-token rule. The remaining interpretive step is narrower:

**Returning to the pre-SHED SURFACE state restores the uniquely shed digit `f` and therefore conventional base60.**

No first-party sentence literally states that numeral-state restoration. Preserve the base60 reset, the resulting `189 -> 192 -> 0` exit, and the p0 plaintext candidate as conditional until a reversible ciphertext operation is recovered.

This should therefore be treated as a high-priority exit candidate, not as recovered p0 plaintext. A decisive successor would use the resulting p0 receiver to predict a new original-page operation or ciphertext quantity before any language scoring.

Reproduce with `sims/lp2_p57_shed_f_emerge_p0_exit_sft.cjs`. Windows Node22 PASS, including the complete p57 EMERGE→SURFACE family exhaustion and the p0 192/729 residual checks: **44465618240**.


## Plaintext-independent p0 opening backlink to p28

The original p0 ciphertext itself now supplies an independent structural check on this receiver. Its first two printed words have GP0 sums **96,85**. The first is exactly authenticated `GOODBYE=96`; through the frozen p50 grammar the pair maps under base59 to **218,28**. Offset218 is the authenticated GOODBYE cut on p28 and the start of p28 word47;28 is the page number. Base60 gives222,28, and222 is not a p28 word boundary.

Across all2,873 adjacent original LP2 word pairs, this exact typed relation occurs only at p0 words1-2. It does not use the proposed `EPIPHANY SEEKS` letters and therefore independently strengthens p0 as a selected receiver.

The p28 word at offset218 then carries the unique nested parable signature `CIRCUMFERENCES -> TUNNELNG -> INSTAR -> EMERGE` under the frozen peel measures documented in `im-results/lp2-p0-opening-goodbye28-p28-nested-route.md`.

This does not remove the interpretive EMERGE-reset step above, but it adds an original-ciphertext backlink after p0 is selected.
