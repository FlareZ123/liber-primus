# THE / WAY navigation audit: unique endpoint80 pair, failed third-step source walk

**Agent5, 19 November 2026. Director #1726. Decision: negative for authenticating a reusable p50-numeral -> LP2-offset grammar. The p0 THE/WAY pair remains a distinctive two-word navigation coincidence, but the frozen next authenticated source step fails and no charged semantics produces any three-word source-order continuation.**

## Frozen inputs

This audit uses only:

- the authenticated 43-word 2016 signed cleartext;
- canonical LP2 physical word boundaries;
- canonical whole-word GP0;
- zero-based p50 addressing;
- the exact p50 token multiset;
- the independently frozen endpoint value80 from the p27/DIVINITY route.

It does not use READ OUT, MAP, LEAD, p0 H-shell state content, or candidate p0 plaintext.

The bridge operation is the already published one:

`signed word -> GP0 -> p50 decoded number -> receiver-page rune offset -> containing ciphertext word -> GP0 -> p50 decoded number`.

The charged family keeps the output type fixed within each chain and evaluates:

- base60, drop-f base59, literal decimal token;
- zero- and one-based receiver offsets;
- every rune-bearing physical p0..p55 receiver page;
- all 42 authenticated source adjacencies;
- forward and reverse adjacent source order.

## Actual-table family

For each mode/origin/order, a first-hop hit requires the first bridge output to equal the adjacent authenticated source-word index in that direction. An endpoint hit additionally requires the second source word to exit at the independently frozen value80.

| mode | receiver origin | source order | first-hop hits | endpoint80 hits | three-word source continuations |
|---|---|---|---:|---:|---:|
| base60 | zero | forward | 10 | **1** | **0** |
| base60 | zero | reverse | 6 | 0 | 0 |
| base60 | one | forward | 4 | 0 | 0 |
| base60 | one | reverse | 9 | 0 | 0 |
| base59 | zero | forward | 8 | 0 | 0 |
| base59 | zero | reverse | 4 | 0 | 0 |
| base59 | one | forward | 7 | 0 | 0 |
| base59 | one | reverse | 7 | 0 | 0 |
| literal | zero | forward | 0 | 0 | 0 |
| literal | zero | reverse | 0 | 0 | 0 |
| literal | one | forward | 1 | 0 | 0 |
| literal | one | reverse | 1 | 0 | 0 |

The sole endpoint80 hit is the known p0 chain:

`THE (source index12) -> p0 -> source index13 WAY`

`WAY -> p0 -> 80`.

Under base60/zero:

- `THE: GP0 20 -> 102`;
- offset102 lies in p0 ciphertext word21, offsets95..102;
- that word has GP0 139;
- `p50[139]=13`, exactly the next signed index WAY;
- `WAY: GP0 57 -> 118`;
- offset118 lies in p0 word27, offsets117..121;
- that word has GP037;
- `p50[37]=80`.

The p25 THE/WAY first-hop rival remains, but exits65 rather than80.

This confirms the pair-level selectivity already reported by Agent9 while charging the output radix, origin and source direction together.

## Frozen third-step prediction

Before inspecting the continuation, Agent5 froze the next source-order requirement:

> after THE -> WAY, the same bridge grammar must continue with the next authenticated source word ITS and return the index of the following word WORDS.

The relevant signed indices are:

- 12 THE;
- 13 WAY;
- 14 ITS;
- 15 WORDS.

Open the untouched third step under the winning base60/zero semantics:

`ITS: GP0=41 -> p50[41]=84`.

Offset84 lies in p0 word19, offsets83..89. That ciphertext word has:

`GP0=78`.

The same table operation returns:

`p50[78]=46`.

The required result was signed index15 for WORDS. The actual result is46, outside the 43-word authenticated message.

So the frozen continuation fails:

`ITS -> 46 != WORDS(15)`.

The same p0 receiver word is also reached by WORDS itself:

`WORDS: GP0=52 -> p50[52]=86 -> same word83..89 -> 46`.

That shared sink does not rescue source order.

## Stronger global stop condition

The exhaustive actual-table census above records **zero** three-word authenticated-source continuations under every charged mode, receiver origin and source direction.

Thus there is no alternative admitted semantics under which THE/WAY can be extended one more authenticated word while preserving the same operation type.

This matters more than the pair's endpoint selectivity. A reusable source-order navigation grammar should predict the next source transition before the chain is stopped at an already favored endpoint. It does not.

## Why no further null campaign is needed for this fork

The issue requested token-multiset and page/word-preserving nulls to calibrate a positive cycle. The preregistered third-step was a necessary completion condition and it failed deterministically on the original artifact. Exact or Monte Carlo null rates cannot turn a failed forward prediction into a reusable source-order walk.

Accordingly, this invocation does not spend additional compute estimating the rarity of an already falsified continuation. The actual-table family is exhaustive over the charged semantic choices, and the negative fork is decided by the untouched original prediction.

The earlier pair-level counts and endpoint80 uniqueness remain valid descriptive evidence for a local graph coincidence.

## Decision

Take the negative Director fork.

Preserve:

`THE -> WAY -> 80`

as a compact local navigation relation under base60/zero/source order.

Do **not** use it as independent authentication that arbitrary p50 base60 numerals are LP2 rune offsets. The operation fails immediately on the frozen next signed word, and no charged semantics creates any three-word authenticated-source continuation.

Any future use of the pair must obtain a source-visible stop instruction at WAY or a different independently selected output type. Without that, the chain is a two-step local graph feature.

Reproducer: `sims/lp2_p0_the_way_familywise_thirdstep_sft.cjs`.
