# EA109-selected p0 word24: prospective prime-H state packet

**Agent4, 19 November 2026. Classification: prospective content holdout on the already fixed EA-prime receiver. No plaintext is assigned to p0 word24.**

## Frozen selection before content inspection

The local READ OUT / THE ROAD route had already fixed the following chain:

1. solved p57 MUST SHED yields the English coordinate word LEAD;
2. shedding LEAD's outer letters leaves the dedicated GP rune EA;
3. `GP-prime(EA)=109`;
4. offset109 is exactly the start of the next complete p0 word after the conditionally recovered THE ROAD.

Agent5 independently committed the simpler downstream check `EA109 -> p0 word24 GP0=40 -> p50 base60=80`, returning to the READ OUT receiver start.

This report inspects the selected word's two untouched rune values after the 109 receiver was fixed.

## Selected word

p0 word24 is offsets109..110:

`[14,26]`.

Its individual GP-prime weights are:

`[47,103]`.

Apply the same two-input Hadamard form used elsewhere in the route:

`H(x,y)=(x-y,x+y)`.

Before modulus reduction:

`H(47,103)=(-56,150)`.

Modulo29:

`H(47,103) mod29 = [2,5] = [K,g]`

for the independently fixed DH23 state `K=2, g=5`.

The raw magnitudes independently return two already active source states:

- `|47-103|=56 = GP0(MAP)`;
- `47+103=150 = GP-prime(FIND)-1`, the multiplicative-group order for the earlier prime field `p=151`.

The selected ciphertext word itself has:

- `GP0=40 -> p50[40] base60 = 80`, the READ receiver start;
- `GP1=42 -> p50[42] base60 = 28`, physical p28;
- `GP-prime=150`, again the p151 group order.

Thus one prospectively selected two-rune object returns to the current route at four levels: READ-start80, p28, the 56 navigation state, and the DH group-state pair `[K,g]`.

## Exact two-rune census

Across the 55 rune-bearing unknown pages there are **465** complete two-rune words.

Using only the selected word's two prime-weight invariants:

- prime-weight sum150 occurs in 8 words;
- absolute prime-weight difference56 occurs in 9 words;
- satisfying both occurs in **1/465** words.

The sole joint hit is the selected p0 word24 at offsets109..110, with values `[14,26]`, prime weights `[47,103]`, and H mod29 `[2,5]`.

This is an exact corpus count. The receiver offset109 was fixed before the word's contents were inspected in this investigation. The choice to interpret the prime pair through sum/difference and H uses operations already present in the route, while the conjunction should still be treated as a local structural holdout rather than a page-wide decoder.

## BE coordinate continuation

The same prime-H result is `[K,g]=[2,5]`. Reuse the letter-coordinate grammar already fixed by the solved p57 MUST/SHED inversion:

`[2,5] -> row B, column E -> coordinate BE`.

At p50 coordinate BE the printed token is `47`.

The current post-SHED radix is base59. Under that frozen state:

`BE -> 47_base59 = 243`.

Offset243 is exactly the end of p0 word54, the seven-rune word at offsets237..243 previously selected as the conditional **DEVOTED** receiver by the authenticated-2016 navigation work.

The conventional-base60 sibling gives247, which lies inside p0 word56 and is not a word boundary. Thus the carried base59 state is discriminating here.

A whole-family transfer control applies the same operation to every complete two-rune unknown-page word:

1. map both runes to GP-prime weights;
2. apply the fixed ordered H mod29;
3. require the two outputs to form a valid p50 row/column coordinate;
4. evaluate the coordinate under both source-supported radices.

Of 465 two-rune words, 108 produce a valid coordinate. Among those, 49 base59 outputs and55 base60 outputs happen to land on some p0 word boundary. Exact base59 output **243** occurs once, at the already selected p0 word24. Its base60 sibling247 misses a boundary.

This gives a prospective navigation consequence:

`EA109 -> p0 word24 -> prime-H [K,g] -> BE -> p50/base59 -> 243`.

It closes on an independently published p0 target boundary while preserving the radix state selected by MUST -> SHED.

## Decision

Preserve this as a prospective state/navigation consequence of the conditional THE ROAD mechanism:

`LEAD -> shed -> EA -> GP-prime109 -> p0 word24 [14,26]`

then

`prime weights [47,103] -> H_raw [-56,150] -> H29 [K,g]`.

The word also returns through `GP0 -> 80` and `GP1 -> 28`.

Do not assign plaintext to word24 from these values. The source-compatible consumer `[K,g] -> BE -> p50/base59` now predicts endpoint243. A useful next step should pair this endpoint with an independently fixed start boundary or recover the value-changing key for the selected seven-rune receiver.

## Reproduction

`node sims/lp2_p0_ea109_prime_h_holdout_sft.cjs`

The reproducer asserts the EA109 selection, the untouched word content, all state equalities, and the complete two-rune census.
