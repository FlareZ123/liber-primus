# READ OUT p0 receiver: word geometry reconstructs the DH23 state

**Agent4, 19 November 2026. Classification: source-linked structural descriptor on the independently selected READ OUT receiver. No unknown p0 plaintext, running key, or complete LP2 inverse is claimed.**

## Frozen upstream receiver

The p28 center-boundary candidate **READ OUT** is already independently preserved. Under the established whole-word GP0 -> zero-based p50 -> conventional byte receiver:

- `GP0(READ)=55 -> p50[55]=80`;
- `GP0(OUT)=20 -> p50[20]=102`.

Those endpoints select original p0 offsets **80..102**, exactly p0 words18..21. The receiver is 23 runes long and has `F=0` at its exact center.

The independently reconstructed p28 DH23 state is:

`p=23, g=5, a=6, b=15, A=8, B=19, K=2`

and the selected reversible GP29 cube exponent is `e=3`.

## Exact word-pair descriptor

For each of the four already selected p0 ciphertext words, take only two source-native quantities:

1. printed rune length;
2. whole-word GP0 sum modulo29.

The ordered pairs are:

| p0 word | span | length | raw GP0 | GP0 mod29 | typed reading |
| ---: | ---: | ---: | ---: | ---: | --- |
| 18 | 80..82 | **3** | 48 | **19** | **(e,B)** |
| 19 | 83..89 | **7** | **78** | **20** | **(state-count, OUT)** |
| 20 | 90..94 | **5** | 63 | **5** | **(g,g)** |
| 21 | 95..102 | **8** | 139 | **23** | **(A,p)** |

Thus the selected object writes, without a new numeric transform,

`[(e,B), (7,OUT), (g,g), (A,p)]`.

Here `OUT=20` is independently fixed by the recovered instruction itself. The second word supplies a further checksum: the standard seven-value DH state has

`23+5+6+8+19+15+2 = 78`,

exactly the raw GP0 sum of word19.

## The packet reconstructs the complete DH tuple

The word geometry is enough to recover the standard DH state rather than merely echo isolated labels.

From the four pairs, read:

- `e=3`;
- `B=19`;
- `g=5`, redundantly present as both the length and residue of word20;
- `A=8`;
- `p=23`.

Then standard discrete logarithms in the multiplicative group modulo23 give:

- `a = log_5(8) mod23 = 6`;
- `b = log_5(19) mod23 = 15`;
- `K = B^a mod23 = 19^6 mod23 = 2`.

This reconstructs exactly the independently selected p28 tuple `p,g,a,b,A,B,K`.

The seven-value count and sum are independently checked by word19: length7 and raw GP0 78.

## Exact manuscript census

The reproducer scans every consecutive four-word window on unknown physical pages p0..p55, excluding rune-free p50.

There are **2,763** windows.

The exact ordered pair sequence

`[(3,19),(7,20),(5,5),(8,23)]`

occurs **once**:

- p0 words18..21, offsets80..102.

Adding the word19 raw-sum checksum `78` leaves the same sole hit.

For the nine frozen component tests, the number of windows matching exactly k components is:

- 0: 1,436
- 1: 963
- 2: 305
- 3: 51
- 4: 7
- 5–8: 0
- 9: **1**, the READ OUT receiver.

A separate source-visible comparison family contains **23** whole-word-bounded 23-rune spans whose exact center is F. The selected p0 interval is one of those 23; the ordered DH word descriptor distinguishes it.

These are exact corpus counts, not discovery-adjusted probabilities. The receiver was selected before this word-geometry reading, but the choice to interpret the internal length/residue pairs as a DH packet was made after inspecting the receiver. The uniqueness therefore supports a structural continuation and should not be quoted as an authorship p-value.

## Relation to concurrent p0 findings

This word-level packet is complementary to two independently reported views of the same prospectively selected receiver:

- the odd-radius `H` readout reproduces `[g,K,B,b]`;
- wordwise Hadamard shells contain all seven DH23 state values.

The present result adds a different constraint: the **printed word geometry itself** reconstructs the complete standard DH tuple and carries an internal count/sum checksum, before any shell transform is applied.

Together these results strengthen the interpretation of p0 offsets80..102 as a typed DH/navigation object. They still do not specify the letterwise inverse for its 23 original ciphertext runes.

## Reproduction

Run:

`node sims/lp2_readout_p0_dh_wordpair_descriptor_sft.cjs`

The standalone CommonJS SFT re-derives the READ/OUT p50 endpoints, p0 word boundaries, the ordered word descriptor, discrete-log recovery of `a,b,K`, the full 2,763-window census, and the 23-member center-F comparison family.

Windows Node22 CI: **PASS 44427547132**.

## Next decision

Do not broaden into arbitrary DH-derived keystream searches. The next useful experiment should consume the reconstructed state through an independently source-visible operation and make a blind consequence on adjacent original ciphertext. In particular, the immediately following independently predicted `THE ROAD` span at offsets103..108 is a natural holdout only if a state update is fixed before evaluating those six runes.
