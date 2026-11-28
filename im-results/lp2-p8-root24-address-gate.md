# P8 characteristic root24 is state metadata, not a source-selected address

**Agent1, 28 November 2026. Classification: bounded original-source address gate for Director issue #3440. Root `λ=24=-g` is frozen from the p8 characteristic-polynomial result before any destination content is consulted. No unknown plaintext or continuation is claimed.**

## Decision

The p8 root `24=-g` is a strong algebraic state match. It does **not** identify a next receiver under the natural address family requested by #3440.

The charged interpretations are:

| frozen interpretation | typed receiver before opening | result |
| --- | --- | --- |
| zero-based physical LP2 page24 | whole original p24 / its ordinary page-local objects | no address cue; p24 has no red-ink annotation entry and does not instantiate the established red→first-black chapter-node type |
| authenticated 2016 source index24 | signed-message word24 | `and`, duplicated again at index31 |
| one-based source word24 | signed-message word24 under human ordinal origin | `road`; but the same token is zero-based index23, so the attractive reading is exactly an origin switch `23↔24` |
| GP29 state/rune value24 | every rune equal to24 | 489 occurrences across 57 of the 58 rune-bearing LP2 pages; p24 alone contains nine |
| established chapter/object index24 | an already typed route node numbered24 | none; the current five chapter-route nodes are p0,p8,p27,p54,p40 |

None provides a unique typed receiver plus a source-side reason to privilege that interpretation.

## Frozen source fact

The established 7×7 p8 fragment-length matrix has characteristic factorization

```text
(x+g)(x^3+g x^2-q x+a)(x^3-q x^2+x+A^-1)
```

over GF(29), and **only the linear factor has a root in the native field**. Hence the unique native-field characteristic root is

```text
λ=-g=24.
```

That root is exact and remains useful as p8 state evidence. This experiment asks a narrower question: after the root is known, does the scalar itself tell a player where to go?

## Candidate A — physical p24

Under the repository's established zero-based LP2 numbering, scalar24 names original p24 (scan `41.jpg`).

The receiver was typed before opening as **the whole original page and its ordinary source-visible objects**. After opening:

- p24 is a black-rune body page framed by two mirrored winged/insect-like illustrations;
- the canonical ink annotation file has **no p24 entry**, hence no red span or large red punctuation to supply the chapter route's established red→first-black operand type;
- p24 contains nine ordinary rune-value24 occurrences, so even combining the page number with the state value does not select a unique local coordinate.

The currently established five-node chapter route is

```text
p0, p8, p27, p54, p40
```

and its strengthened local source type after p8 is a red rubric followed by a selected first black word. P24 does not instantiate that object class. Pointing at the entire page would therefore require a new receiver type after seeing the destination.

There is also an unavoidable origin control: if “page24” is taken as the 24th LP2 page in ordinary human ordinal language, it is canonical zero-based p23. The manuscript prints no page number on p24 that selects one origin convention over the other.

**Decision:** physical-page addressing is non-identifying.

## Candidate B — authenticated 2016 source word index24

Use the preserved 43-word signed-message register and keep the project's established zero-based source indexing.

The relevant source positions are:

```text
23 ROAD
24 AND
...
31 AND
```

Thus zero-based index24 selects **AND**, a generic conjunction that occurs again at index31.

The tempting alternative is one-based word24, which selects **ROAD**. That is semantically attractive because the signed message says “their meaning is the road, and their numbers are the direction.” But it fails the origin control:

```text
ROAD = zero-based index23 = one-based word24.
```

So state `p=23` and state `-g=24` can both be made to “select ROAD” merely by switching index origin. The target word itself cannot decide which state value was the pointer.

No p8 source feature independently says “use one-based signed-message word positions” at this step.

**Decision:** source-word addressing is origin-dependent and non-identifying.

## Candidate C — GP29 value24

Treating the root as a rune/state value rather than an integer address is even less selective.

Across the canonical LP2 corpus:

```text
rune value24 occurrences = 489
pages containing value24 = 57
p24 occurrences          = 9
```

Only the runeless p50 numerical table lacks ordinary rune24 occurrences because it has no rune stream. Therefore `24=-g` as a raw GP29 value points essentially everywhere.

The equality `24=-g` is still exactly meaningful inside the p8 state packet. It simply does not become an address without an additional coordinate selector.

**Decision:** state-value interpretation is metadata, not navigation.

## Candidate D — established chapter/object index

The current chapter-route object class has five page nodes:

```text
p0 -> p8 -> p27 -> p54 -> p40
```

No node, chapter-state slot or already typed route object numbered24 is established in that grammar. Introducing a new “object24” class only after the root appears would be post-target interpretation.

**Decision:** no existing typed object24 receiver is available.

## Matched controls

The two strongest apparent positives both fail natural controls:

1. **ROAD control:** one-based24 gives ROAD, but zero-based23 gives the same ROAD. This is exactly the adjacent state pair `p=23`, `-g=24`; the semantic hit does not distinguish them.
2. **physical-page control:** zero-based p24 is a legitimate page, but human ordinal “page24” means canonical p23. Neither p8 nor p24 prints a page index or origin marker.

The GP29 census is a stronger global control: value24 occurs on 57 pages, so a state-value address without a separately authored coordinate law has no resolving power.

## Consequence for the p8 branch

Preserve:

```text
unique native characteristic root λ=-g=24
```

as exact p8 algebra/state evidence.

Do **not** promote `24` into a continuation pointer. The next p8 advance must come from a source-visible consumer that types an address space and origin **before** reading the target—e.g. an explicit page/word/coordinate opcode or a held-out route relation. Root24 alone does not supply one.

This is useful because it prevents the p8 state branch from spawning arbitrary page24, word24 or rune24 searches while preserving the actual algebraic discovery.

## Reproduction

Run:

```text
node sims/lp2_p8_root24_address_gate_sft.cjs
```

The SFT verifies `-g=24`, parses the authenticated 43-word signed-message register, asserts `ROAD`/`AND` origin behavior, counts all 489 GP29 value24 occurrences across 57 pages, verifies nine on p24, checks p24 has no red-ink annotation entry, and confirms24 is absent from the established five-node chapter route.