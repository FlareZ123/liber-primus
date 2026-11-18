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

## Candidate reset: let the shed digit EMERGE

The solved instruction is literally **EMERGE**. If that instruction reverses the immediately preceding digit-state action, the unique removed symbol `f` returns and the original base60 alphabet is restored.

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

## Evidence boundary

Every numeric relation through the base59 fixed point is reproducible from original artifacts and solved p57 text. The new interpretive step is:

**EMERGE means restore the uniquely shed digit `f` after the six-edge EMERGE walk.**

No first-party sentence literally states that reset rule. The fact that base59 is trapped and base60 immediately exits through `00 ->0` makes the switch operationally discriminating, while the semantic cue remains a hypothesis.

This should therefore be treated as a high-priority exit candidate, not as recovered p0 plaintext. A decisive successor would use the resulting p0 receiver to predict a new original-page operation or ciphertext quantity before any language scoring.

Reproduce with `sims/lp2_p57_shed_f_emerge_p0_exit_sft.cjs`.
