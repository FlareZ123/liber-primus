# P6 adjacent-H word-length schedule predicts the p23 red rubric

## Classification

**Source-only structural prediction; no unknown plaintext and no cipher receiver.**

The original p6 red four-word rubric has printed lengths `[4,1,4,2]`. Applying the already recurring forward adjacent transform

`H(x,y)=[x-y,x+y] mod29`

to its two adjacent word pairs gives

`[3,5,2,6]=[e,g,K,a]`.

Those labels are independently fixed by the authenticated DH23 state and p7 literal: `e=3, g=5, K=2, a=6`.

The original p23 red four-word rubric then has raw printed lengths

`[2,6,3,5]=[K,a,e,g]`,

which is exactly a swap of the two H-output pairs:

`pairSwap(H([4,1],[4,2])) = [[K,a],[e,g]] = [2,6,3,5]`.

No rune values, language model, expected plaintext or p50 coordinates enter this bridge.

## Exact source facts

Correct physical-page parsing handles the rune-free p50 omission in `resources/lp2-transcription.txt` and asserts every page count against `lp2-corpus.json`.

Across all p0–p57 red spans, p6 and p23 are the only spans containing exactly four complete printed words.

For p6:
- source lengths: `[4,1,4,2]`
- adjacent H: `[3,5,2,6]`
- authenticated state reading: `[e,g,K,a]`

For p23:
- source lengths: `[2,6,3,5]`
- state reading: `[K,a,e,g]`
- this is the two-pair swap of the p6 H result.

This is distinct from the outside-pair H4 reading of the same p6 lengths recorded elsewhere. Here the operation is strictly adjacent-pair H, the same orientation already used in p23 serializer work.

## Finite convention charge

After adjacent H produces two ordered pairs, allow the complete small family consisting of:
- keep or swap the two pairs;
- independently keep or reverse each pair.

That is `2×2×2 = 8` output conventions. Exactly one gives the p23 vector: swap the pairs and preserve both within-pair orientations.

## Manuscript-wide controls

There are **2,802** page-local consecutive four-word windows across physical p0–p57.

- Exact adjacent-H length output `[3,5,2,6]` occurs **once**, at p6 offset71.
- Even granting all eight pair-order/orientation variants of that state schedule, only p6 produces any member of the family as an H-length output.
- Exact raw length vector `[2,6,3,5]` occurs **once**, at p23 offset0.
- Ten raw four-word windows use some member of the broader eight-vector pair family, so the important claim is the exact p6-H → p23-raw relation, not that the multiset `{2,3,5,6}` never appears elsewhere.

These are exact corpus counts rather than discovery probabilities.

## Why this advances the solve path

The p6 page now supplies a literal source-only operator schedule:
`word lengths → adjacent H → [e,g,K,a]`.
A separate marked rubric at p23 physically instantiates those four outputs in a fixed pair-swapped order before any ciphertext decoding is attempted.

That is the kind of held-out structural consequence requested by the p6 schedule line of research: the p6 layout predicts another original manuscript object rather than merely fitting a plaintext label.

The remaining gap is operational. Nothing here proves whether `[e,g,K,a]` is a key schedule, address, opcode tuple or only a checksum/state echo. A successor should keep the exact schedule and pair-swap fixed and demand a new prospective consequence on a receiver not used to discover this bridge.

Reproducer: `node sims/lp2_p6_adjacent_h_length_schedule_p23_sft.cjs`.
