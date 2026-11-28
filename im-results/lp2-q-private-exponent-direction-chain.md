# Plain-Q private-exponent direction chain: p27 -> p6 -> p15 -> p23/p8

**Agent9, 28 November 2026. Classification: post-discovery source-licensed navigation/state cross-lock with a complete nonzero-scalar charge. It materially extends the current Q/DH route upstream, but it does not decrypt unknown body text or establish a general page-number opcode.**

## Decision

The current p3 route fixes the field relation u²=3u+8 and the quotient element Q=[17,24]. Independent solved-page and whole-red-class controls now select **plain multiplication by Q** over the competing Frobenius/Q operations. Separately, the p27/cell254 route reconstructs the ordinary DH state, including the private exponents

    a = 6
    b = 15

without using the Q page-direction chain below.

Apply the already-fixed plain Q map to three source-selected complete red objects:

| source object | Q output | signed-2016 words | red-bearing page directions |
| --- | --- | --- | --- |
| p27 red19 | [10,6] | PRIMUS / SEEKS | **6** only |
| p6 red11 | [1,15] | THE / WORDS | **15** only |
| p15 first red9 | [23,8] | ROAD / DEVOTED | **23 and 8** |

The signed 2016 source explicitly says that the words are the map and **their numbers are the direction**. Reading the fixed numeric outputs literally as physical LP2 page numbers therefore gives the deterministic source-typed chain

    p27 --a=6--> p6 --b=15--> p15-first --[p,A]=[23,8]--> p23 and p8.

This is not merely a chain through arbitrary red pages. The intermediate page numbers are the independently reconstructed DH private exponents a and b, while the terminal pair is the public tuple p,A. P23 and p8 were independently established before this route as unusually complete manuscript DH-state receivers.

The p15 operand is not selected by choosing the terminal hit: the pre-existing Q-orbit red-cycle result independently selects p15's **first** red span before its plain-Q product is read.

## Complete nonzero-scalar charge

The source field has 29²-1 = 840 nonzero elements and Q is primitive, so Q^s for s=0..839 enumerates every nonzero scalar multiplier exactly once.

Define the first two gates without fitting p or A:

1. on p27, exactly one output coordinate is a physical red-bearing page below29, and it is the independently known private exponent page a=6;
2. on p6, exactly one output coordinate is a physical red-bearing page below29, and it is the independently known private exponent page b=15.

The physical red-bearing page set below29 is fixed from the ink annotations:

    {0,3,6,7,8,15,23}.

Exactly **4 / 840** multipliers pass both private-exponent direction gates:

| exponent s | p27 output | p6 output | p15-first output | p15 red-page landings |
| ---: | --- | --- | --- | --- |
| **1 = Q** | [10,6] | [1,15] | **[23,8]** | **[23,8]** |
| 257 | [11,6] | [15,26] | [5,8] | [8] |
| 378 | [6,18] | [15,13] | [8,24] | [8] |
| 825 | [6,2] | [28,15] | [8,22] | [8] |

Now apply only a source-typed structural terminal gate: **both** coordinates of the already-selected p15-first output must themselves be red-bearing physical pages. Do not specify the desired terminal values.

Only **Q** survives. Revealing its terminal pair gives exactly

    [23,8] = [p,A],

and those are precisely the two previously established DH receiver pages.

This is a finite competitor count, not a discovery-adjusted probability. Q was already known before this route was noticed. The value of the charge is that the private-exponent page path and dual-red terminal property are not generic consequences of multiplying by an arbitrary field scalar.

## Signed-word reading

The same three fixed outputs read in the authenticated zero-based signed register as

    p27: PRIMUS SEEKS
    p6:  THE WORDS
    p15: ROAD DEVOTED

The first two pairs make the page directions unusually legible: the number of SEEKS is6 and lands on p6; the number of WORDS is15 and lands on p15. This semantic readability is a human-solve-path aid, not a separate statistical factor.

The p15 pair was already independently meaningful in three namespaces:

    [23,8] = [ROAD,DEVOTED] = canonical GP "DH" = [p,A].

This report adds the source-typed upstream path that reaches that known p15 direction packet from the independently important p27 state.

## Secondary interval consequence

Ignoring direction and treating the p6/p15 outputs as inclusive signed-word intervals gives

    p6       [1,15]
    p15-first[8,23]

whose union is exactly source indices **1..23**, from THE through ROAD, and whose overlap has exactly **8** entries, equal to A.

Across all840 nonzero scalars, six make these two intervals form exactly the connected union1..23. Only Q among those six has overlap8. This is recorded as a secondary post-discovery cross-check and is **not** used to select the route.

## What this changes

The Q/DH route now has a low-freedom state-number navigation before the previously known p15 -> p23/p8 handoff:

    independently reconstructed p27 DH state
        -> private exponent a=6
        -> physical p6
        -> private exponent b=15
        -> physical p15 first-red
        -> public tuple [p,A]=[23,8]
        -> physical p23 and p8
        -> independent manuscript DH-state reconstructions.

That materially strengthens the interpretation of plain Q as navigation/state machinery rather than a bulk body key. It also gives a human-plausible reason for the private exponents to appear as page numbers: the signed source literally assigns direction to word numbers.

The chain remains post-discovery and shares the same signed-word/Q machinery as the existing route. Do not multiply its components into independent significance estimates.

## Boundary and next gate

Established by exact source computation:

- Q*p27 = [10,6] and only6 is a red-bearing page below29;
- Q*p6 = [1,15] and only15 is a red-bearing page below29;
- the independently reconstructed DH values are a=6 and b=15;
- the already-selected p15-first span maps to [23,8];
- both23 and8 are red-bearing pages and independently established DH receivers;
- the complete 840-scalar charge leaves four multipliers after the two private-exponent gates and Q alone after the terminal dual-red gate.

Not established:

- that every signed word number globally addresses the same-numbered LP2 page;
- that the route supplies a body cipher, KDF, or black-text receiver;
- that the semantic word readings are plaintext;
- any unknown LP2 plaintext.

The immediate black-successor use of Q on p23/p8 remains a preregistered negative. A distinct source-visible receiver has now succeeded: Q's p23/p8 numbers direct to four physical pages whose complete rune counts mod29 reconstruct the same DH state in two branches. See [Q-directed page rune-count DH reconstruction](lp2-q-directed-page-rune-count-dh-reconstruction.md). The remaining gap is how that recovered state acts on black ciphertext or selects the next non-state artifact.

Reproducer: ../sims/lp2_q_private_exponent_direction_chain_sft.cjs

Upstream evidence:
- p27/cell254 DH reconstruction: lp2-p27-p50-base29-pointer-state-tape.md
- p15-first selection: lp2-qmap-red-cycle-p15-dh-selector.md
- p15 -> p23/p8 handoff: lp2-p3-q-direction-p23-p8-crosslock.md
- plain-Q operation selection / global box: lp2-p3-q-direction-operation-adjudication.md and lp2-q-plain-red-wordbox.md
