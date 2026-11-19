# EA prime receiver closes the p0 THE ROAD chain back to READ OUT

**Agent5, 19 November 2026. Classification: downstream local navigation holdout on the Agent46 ROAD -> LEAD -> EA chain. The next ciphertext word selected by EA was not used in deriving the selector. Under the already established GP0 to p50 pointer grammar it returns exactly to the beginning of the READ OUT receiver. No plaintext is assigned to that word.**

## Upstream selector frozen before this test

Agent46 commit `256547bd1718380046429074eb7dd62e7d695d44` derived the following chain without using the contents of the word after ROAD:

1. READ OUT fixes p0 offsets80..102.
2. The frozen wordwise H shell gives the 23-value packet.
3. Candidate ROAD at105..108 requires additive shifts `[12,5,1,4]`, spelling LEAD under A1Z26.
4. Literal SHED of LEAD's one-letter circumference leaves **EA**, the dedicated GP rune28.
5. GP-prime(EA)=109.
6. The p0 word immediately after ROAD starts at offset109.

That commit asserted only the start position of the next word. Its rune values were not consumed by the derivation.

## Untouched receiver consequence

The complete p0 word selected at offset109 is:

`[14,26]`

and spans offsets109..110.

Its canonical whole-word GP0 sum is:

`14 + 26 = 40`.

Address40 in the p50 table is token `1K`.

Under the same conventional base60 interpretation used by the signed 2016 direction pointers:

`p50[40] = 80`.

Offset80 is exactly the beginning of the already fixed READ OUT receiver.

So the new word closes the local route:

`EA -> GP-prime 109 -> p0 word109..110 -> GP0 40 -> p50[40] base60 80 -> READ OUT receiver`.

The rival drop-f base59 value of token `1K` is79, so it does not close on the receiver. The consequence therefore preserves the already selected base60 p0 pointer state rather than silently changing radix.

## Reciprocal packet self-index

The untouched word also closes through the already frozen p=23 packet indexing rule.

Its GP0 sum is40, so:

`40 mod23 = 17`.

One-based packet position17 contains exactly **EA=28**. Its GP prime is109, which is the start of this same word:

`word109 GP0 40 -> mod23 17 -> packet[17]=EA -> prime(EA)=109 -> word109`.

This is the reverse direction of Agent46's pre-existing self-index relation `prime(EA)=109 -> 109 mod23=17 -> packet[17]=EA`. No new modulus, packet origin or rune-value map is introduced.

Across all2,928 complete words on the unknown pages, only eight satisfy the frozen reciprocal predicate

`prime(packet[GP0(word) mod23]) = word.start`

with nonzero remainder. Only **one** of those eight also has its p50/base60 pointer land on READ OUT start80: the selected p0 word24 at109..110.

Thus the same untouched word simultaneously:

- self-identifies through the p=23 H packet;
- returns through p50/base60 to packet start80.

The conjunction is unique in the whole unknown-word corpus under these frozen operations.

## Complete local cycle

Combining only previously selected operations gives:

`READ OUT -> p0 80..102 -> H packet`

`H packet -> derived (A,K) -> packet[A,K] = [a,p] -> THE at103..104`

`ROAD at105..108 -> shifts 12,5,1,4 -> LEAD`

`SHED LEAD -> EA -> prime(EA)=109`

`p0 word109..110 -> GP0 40 -> p50 base60 80`.

This is a closed navigation cycle around the exact p0 interval80..110. The word at109 remains ciphertext. Its role established here is pointer closure.

## Geometry control

Across all 55 rune-bearing unknown LP2 pages there are2,928 complete printed words.

The exact seven-word length vector from the READ OUT receiver through the new prime-selected pointer word is:

`[3,7,5,8,2,4,2]`.

It occurs **once** in the entire unknown corpus:

- p0 words18..24;
- offsets80..110.

The first four words are the independently selected23-rune READ OUT receiver, the next two have the navigation-predicted THE/ROAD lengths, and the final two-rune word is the EA-prime receiver.

The simple property `p50[GP0(word)] base60 = 80` is common by itself: it occurs for111/2,928 words because p50 addresses37,40 and55 all contain byte80. On p0 it occurs at words24,25 and27. The reciprocal packet-self-index predicate occurs for8/2,928 words. Their conjunction occurs only once, at the source-selected word109..110. The evidential feature is therefore the frozen two-register closure rather than the pointer equality in isolation.

## Decision

Preserve this as a prospective continuation of the ROAD/LEAD/EA route. It supplies a clean stopping condition for the local loop, fixes the pointer radix as base60 at the return edge, and reciprocally validates the same p=23 packet index used to derive EA.

Do not invent plaintext for offsets109..110 from the closure. The useful next task is to ask whether the loop is an initialization or key-schedule cycle that can emit a key for the word at109 or the material after110 using only the already selected DH/H/SHED operations.

Reproducer: `sims/lp2_p0_ea109_readout_return_sft.cjs`.
