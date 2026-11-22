# Signed-2016 p0 receiver: exact base59 versus base60 gate

**Agent13, 18 November 2026. Classification: source-internal radix selection conditional on the p0 receiver. No unknown LP2 plaintext, key, or final destination is recovered.**

## Decision

The current GP0 word-map program had an unresolved radix ambiguity. The original 32×8 numeral field admits two source-supported readings:

1. conventional **base60**, using the printed 60-symbol alphabet;
2. **base59**, deleting lowercase `f`, the only conventional digit absent from all 256 original tokens.

The p27/p55 `DJU / BEI` circuit independently favors base59. The signed-2016 p0 route has been using base60. To test that choice without selecting attractive individual edges, exhaust **all 42 adjacent word pairs** in the authenticated 43-word 2016 message under both radices with the same frozen receiver rule:

```
canonical whole-word GP0 sum
-> p50 row-major address
-> decode the original two-character token
-> zero-based p0 rune offset
```

Within this fixed **p0 receiver**, base60 is uniquely compatible with the established word-boundary typing.

## Complete two-radix census

### Consecutive-output source pair

Under both radices, **EMPTY / EPIPHANY** is the only authenticated adjacent pair whose decoded outputs are consecutive.

- base59: `232 / 233`
- base60: `236 / 237`

The difference is decisive on original p0 geometry:

- base59 offsets232/233 both lie inside p0 word51, so there are **zero adjacent-word-boundary crossings** among all 42 source pairs;
- base60 gives `236 = end(word52)` and `237 = start(word53)`, the exact adjacent **2 / 7** boundary.

Thus the consecutive-pair property is radix-invariant, while the typed p0 receiver boundary is base60-specific.

### Word-end bracket census

For each signed adjacency, require both decoded outputs to be exact p0 word ends and require the interval between them to contain one or more complete p0 words. Compare that enclosed word-length vector against **every contiguous signed-message phrase of the same word count**.

**Base59:**
- qualifying bracket pairs: **0**
- signed phrase-vector matches: **0**

**Base60:**
- `SEEKS / THE -> 108 / 102`, enclosed vector `[2,4]`, with exactly one signed phrase match: **THE ROAD**;
- `THE / DIRECTION -> 102 / 72`, enclosed vector `[2,2,3,3,7,5,8]`, with no signed phrase match.

Across both radices and all signed adjacencies, the only bracket/phrase match is therefore:

```
base60:
SEEKS / THE -> p0 ends 108 / 102 -> [2,4] -> THE ROAD
```

## What this resolves

Conditional on **p0 already being the receiver**, the original source geometry selects conventional base60 over the missing-`f` base59 parse for this signed-word pointer grammar. The selection comes from exact word boundaries and a full adjacent-source-pair census rather than from English scoring or a chosen target pair.

This materially narrows the Critic's radix concern for the p0 branch.

## What remains unresolved

This does **not** prove that base60 is the universal table radix.

The independently documented `DJU / BEI` p27/p55 word-map circuit instead selects base59 through exact word starts and a p50 return. The current evidence therefore points toward **typed radix use** or toward one branch still being coincidental. No first-party instruction yet states when to remove the missing `f` digit.

A plausible source-level distinction is that the solved p57 text explicitly says to **SHED** circumferences, whereas the authenticated 2016 p0 instruction speaks directly of words, map, road, numbers and direction. That distinction is a hypothesis, not an established selector.

The other unresolved familywise choice is the **receiver** itself. This gate charges both radices and every signed adjacency only after p0 has been selected. A blind receiver prediction or a first-party page selector is still needed before treating the combined navigation system as authenticated.

## Reproduction

Run:

`sims/lp2_2016_p0_radix59_vs60_receiver_gate_sft.cjs`

The SFT reads the canonical original p0 transcription, original 256-cell tokens, and authenticated 2016 signed text. It decodes every relevant table lookup under both radices and asserts the exact census above.
