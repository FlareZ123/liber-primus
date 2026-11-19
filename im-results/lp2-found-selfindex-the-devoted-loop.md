# FOUND self-index closes on the p0 THE | DEVOTED receiver pair

**Agent2, 19 November 2026. Classification: exploratory word-ordinal interpretation layered on a real prime-H observation. The fixed prime-H operation transfers to the independently selected two-rune receiver and returns authenticated FOUND. Interpreting FOUND's p50 values 53/54 as p0 word ordinals is not currently licensed by the stronger p50 output grammar, which treats decoded numerals as rune offsets. Preserve the arithmetic and phrase-shape coincidence, but do not count the ordinal loop as an authenticated navigation holdout.**

## Independently selected receiver boundary

The existing authenticated-2016 navigation gives:

- `GP0(EMPTY)=92 -> p50[92] base60 = 236`;
- `GP0(EPIPHANY)=121 -> p50[121] base60 = 237`.

On p0:

- word53 spans **235..236** and has two runes;
- word54 spans **237..243** and has seven runes.

Thus EMPTY / EPIPHANY already straddles exactly the physical boundary:

`word53 end236 | word54 start237`.

This receiver was selected before the prime-H transfer below.

## Transfer the fixed prime-H operation to word53

Agent4's EA109 holdout fixed the operation of replacing a selected two-rune word by its two canonical GP-prime weights and applying raw H sum/difference.

Original p0 word53 is:

`[8,5] = [H,C]`.

Its canonical GP-prime weights are:

`[23,13]`.

Raw H is:

`H(23,13) = (10,36)`.

The sum is therefore:

**36**.

Authenticated 2016:

`GP0(FOUND)=36`.

So the already selected original ciphertext word53 independently emits the number of signed word **FOUND** under a value operation fixed elsewhere.

## Exploratory ordinal interpretation of FOUND

Original p50 address36 is token:

`0s`.

Its two source-supported numeral interpretations are:

- drop-f base59: **53**;
- conventional base60: **54**.

Those numbers happen to equal the two p0 receiver word ordinals:

`FOUND36 -> p50[36]=0s -> {53,54}`.

The post-SHED carried radix is base59, so under the route's active state the value is **53**, exactly self-indexing the two-rune source word that emitted FOUND.

The conventional sibling gives **54**, exactly the adjacent seven-rune word.

Critical type caveat: the current familywise-positive p50 receiver grammar uses decoded numerals as **p0 rune offsets**, not word ordinals. Under that established type, offsets53/54 fall at the start/interior of p0 word12 rather than at words53/54. The ordinal reading below is therefore exploratory and must not be promoted without an independent first-party or familywise rule licensing p50 outputs as word ordinals.

## Conditional phrase-shape consequence under the ordinal hypothesis

The selected p0 pair has GP-rune lengths:

`[2,7]`.

Exhaust every adjacent pair in the authenticated 2016 signed message and compare canonical GP-rune lengths.

Exactly one adjacent signed pair has shape `[2,7]`:

**THE DEVOTED**.

Thus the source-only navigation is:

`EMPTY / EPIPHANY -> p0 boundary236|237 -> words53|54`

and independently:

`p0 word53 -> prime-H sum36 -> FOUND -> p50[36]=0s -> word ordinals53|54`

while the receiver's source-visible shape selects:

`[2,7] -> THE DEVOTED`.

This is a compact coincidence conditional on the unlicensed word-ordinal output type. It does not provide the additive or other value-changing key that proves the original p0 runes decrypt to those words.

## Whole-manuscript two-rune census

There are **465** complete two-rune words across the 55 rune-bearing unknown pages.

For every one:

1. map both rune indices to canonical GP-prime weights;
2. take their raw prime sum `S`;
3. if `S<256`, use `S` as a p50 address;
4. decode the p50 token under base59 and base60;
5. ask whether either value equals that source word's one-based ordinal;
6. separately ask whether `S` is GP0 of any authenticated 2016 word.

Results:

- base59 prime-sum self-indexes: **3/465**;
- base60 prime-sum self-indexes: **2/465**;
- with the additional authenticated-word condition, base59 has exactly **1** hit: **p0 word53 -> FOUND -> 53**;
- the base60 authenticated-word sibling is p10 word54 from reversed rune order `[5,8]`.

The active post-SHED base59 state therefore selects the p0 instance uniquely in the signed-word self-index family.

## Authenticated signed-word dual-radix control

Across the **29 distinct authenticated 2016 words**, ask whether that word's GP0 p50 token decodes under base59/base60 to two consecutive valid p0 word ordinals.

Exactly two source words qualify:

- `LIES -> p50[63]=0p -> 50 / 51`, whose p0 word-length shape is `[3,7]`;
- `FOUND -> p50[36]=0s -> 53 / 54`, whose p0 word-length shape is `[2,7]`.

Only the FOUND-selected pair has a shape matching any adjacent signed-message phrase, and `[2,7]` uniquely matches **THE DEVOTED**.

This control charges the possibility that the dual-radix pair was noticed only because the table happens to contain low consecutive values.

## Relation to EA109 endpoint243

Agent4's independent continuation from EA109 gives:

`prime-H [K,g] -> coordinate BE -> p50/base59 243`.

Offset243 is exactly the **end** of p0 word54, the seven-rune half of this pair.

So the same later holdout reaches the pair's terminal boundary while FOUND and EMPTY/EPIPHANY identify its ordinal and internal boundary structure.

These are independent navigation constraints converging on one source object.

## Decision

Preserve the real, typed observation that the independently selected two-rune p0 word53 yields prime-H sum36 = GP0(FOUND). Keep the following word-ordinal loop as **exploratory only** unless a separate source rule authenticates p50 decoded values as word ordinals. Under that hypothesis, three source-facing constraints converge:

1. EMPTY / EPIPHANY selects the exact physical boundary between the two words;
2. transferred prime-H on original word53 emits FOUND, whose p50 token returns the exact receiver ordinals53/54;
3. the source-visible rune lengths `[2,7]` uniquely select adjacent signed phrase THE DEVOTED.

Even under the ordinal hypothesis this does not establish unknown plaintext because the value-changing map from original p0 rune values to THE DEVOTED remains missing. Under the currently stronger rune-offset grammar, FOUND's 53/54 outputs do not select this receiver at all.

The next useful experiment should derive that value operation from an already selected state or instruction, or make a new untouched prediction from the FOUND loop. Do not fit an unconstrained seven-rune key to DEVOTED.

## Reproduction

Run:

`node sims/lp2_p0_found_selfindex_the_devoted_sft.cjs`.

The SFT reconstructs the p0 receiver, verifies EMPTY/EPIPHANY boundary selection, transfers prime-H to word53, checks the FOUND self-index under both radices, exhausts all465 two-rune words, and proves THE DEVOTED is the unique authenticated adjacent phrase with the receiver's `[2,7]` rune shape.
