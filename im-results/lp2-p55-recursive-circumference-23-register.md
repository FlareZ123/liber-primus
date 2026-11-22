# P55 recursive SHED produces a unique 23-rune second peel, but no source-selected consumer

**Consolidated decision (19 November 2026): structural extraction retained; the 23-rune consumer branch is retired.** The source-visible p57 parable motivates recursive removal of each complete word's circumferences. On p55 this produces a distinctive staged register, including 23 runes after the second peel. The 23 count matches the p57 terminal dot mark and the signed 2013 DH modulus, but the preserved sources do not select the second peel as the stopping point or specify how its 23 runes are to be consumed. The direct BASE29, conditional DH23 and p56 prime-totient consumers tested to date do not recover plaintext.

## Original source and extraction

The p55 manuscript starts with one isolated `NG` rune that closes an eleven-rune word beginning on p54; its ten preceding runes are `G O T TH X E EA R G Y`. P55 then prints **16 complete words** wholly within the page. Their exact GP rune lengths are:

`[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`

The sixteen complete words contain **75** runes. The incoming `NG` makes the physical p55 total **76**. Keep that carry separate from the 16 locally complete words when applying a word-local operation.

Solved p57 says:

```
WE MUST SHED OUR OWN CIRCUMFERENCES.
FIND THE DIVINITY WITHIN AND EMERGE.
```

Repeatedly remove the first and last GP rune of each complete printed word, retaining the survivors in original word order. Stop only when no symbols remain. The resulting stage path is:

| Completed peels | Surviving complete words | Runes |
|---:|---:|---:|
| 0 | 16 | 75 |
| 1 | 11 | 43 |
| 2 | 7 | **23** |
| 3 | 3 | 9 |
| 4 | 1 | 5 |
| 5 | 1 | 3 |
| 6 | 1 | 1 |
| 7 | 0 | 0 |

The second-peel 23-rune register is:

```
G D A B F X I M U C P H NG D IA I G X EO TH TH I M
```

Its seven surviving words have lengths `[2,2,9,2,3,3,2]`. These are literal original ciphertext runes, not recovered plaintext. The single final survivor at peel six is original GP index1 (`U`); do not read it as English without an independently selected decoding rule.

## Structural distinctness

The continuous-word parser respects original page turns and line wraps and does not terminate a word at the p54→p55 boundary. Across the first 55 unsolved pages it parses **2,896** complete words containing **12,956** runes. The 16-word census contains **2,881** consecutive windows:

| Predeclared property | Matching windows |
|---|---:|
| 75-rune input | 115 |
| 75-rune input followed by exactly 23 after two peels | 7 |
| Entire path `75,43,23,9,5,3,1,0` | **1**, the actual p55 block |

This is an empirical uniqueness count under the manuscript, not a chance probability or proof of authorial intent. The p57 parable motivates circumferences, but the choice of the 16 locally complete words, the incoming-carry exclusion, and especially stopping after exactly two peels are not stated explicitly by the source.

## Consumers already tested

### Direct BASE29 integer to bytes

The authenticated 2013 server challenge documents positional BASE29. As a narrow historically available consumer, encode the 23 GP29 indices as one big-endian integer:

- Integer: `1015521743086949888934587058926666`
- Since `29^23 < 256^14`, the fixed 14-byte big-endian representation is `32 11 af b9 81 f0 de 40 d7 26 90 a8 b4 4a`.
- Only **4/14** bytes are printable ASCII; the rendered output is `2......@.&...J`.
- The identical routine recovers the source-native 14-byte positive plant `PARABLE SOURCE` exactly.

This rejects direct 23-rune positional BASE29→printable-ASCII. It does not exclude other uses, but none may be invented without a source selector.

### Conditional DH(23)

The same integer conditionally interpreted as a DH private exponent gives `N mod 22 = 4`. With the signed challenge's *worked-example* server base5 and public share8, the client share is `5^4 mod23 = 4` and the shared value is `8^4 mod23 = 2`.

This is not an independently selected key. The worked example's client exponent15 also gives `8^15 mod23 = 2`, because 8 has order11 modulo23. The collision probability for a uniform exponent modulo22 is 2/22 = **1/11**. More importantly, the signed protocol says the participant's server chooses its own base and secret for each request; the example values are not fixed LP2 material. The signed `NEXT` command stores client-supplied text and does not choose a successor instruction.

The same DH23/shared2 interpretation was then composed with the solved p56 prime-totient inverse on both the inner23 and the source-ordered outer52 circumference. Neither yields readable plaintext; the p56 known-plaintext positive control passes exactly. The full inputs, outputs and reproduction are in [the frozen DH23 / prime-totient gate](lp2-p55-inner23-dh23-shared2-prime-totient-gate.md) and [its SFT](../sims/lp2_p55_inner23_dh23_shared2_gate.cjs).

### Direct p56 prime-totient inverse

The inner23 itself was tested under the solved p56 prime-minus-one stream, starting at prime2, with the exact transparent-plaintext-F semantics. Both legal F interpretations are nonlinguistic. The source-ordered outer52 likewise has no coherent plaintext; its p56 positive control passes. This retires these specific direct consumers, not every possible source-authored use of the 23 symbols.

## Source audit: no instruction selects the second peel and a typed consumer

The relevant preserved Cicada sources were checked for the missing selector and consumer:

1. **Solved p57.** “Shed our own circumferences” supports recursive edge removal. “Find the divinity within and emerge” suggests an interior/center and an emergence, but does not say to stop after the second peel, identify the 23-rune register, or specify a codec, direction, key/state role or target. The terminal 23-dot mark is a real source-visible 23 motif; it can motivate considering 23, but does not itself say what to do with 23 symbols.
2. **Authenticated signed 2013 TCP challenge.** It documents BASE29 and DH, including a worked modulus23 exchange. It does not instruct a player to encode the p55 inner register as a DH exponent, fix a peer/public share or convert the shared secret into an LP2 key. The exact toy tuple `p=23,g=5,a=6,b=15,A=8,B=19,K=2` already appears in a self-dated 17 April 2012 cryptography teaching deck, so the tuple is not a Cicada-specific key signal. The signed source explicitly makes the server base and secret participant-selected; `NEXT` stores client text rather than choosing the next instruction. See [authenticated 2013 source record](../resources/external/2013-tcp-server-signed-source.md).
3. **Authenticated 2014 magic squares.** The preserved source supplies 5×5, 7×7 and 5×5 squares (magic sums 3301, 1033, 1033). It contains no 23-rune instruction, no second-peel stopping rule and no mapping from the 23 symbols to square cells. See [original square values](../resources/cicada2014-openpuff-magic-squares.txt).
4. **Authenticated 2016 signed clue.** It says “their numbers are the direction,” which is a broad semantic cue for a number→direction relationship. It does not define a 23-rune serialization, GP29-to-direction map, ordering, origin, reset, or a p55 target. The signed clue therefore cannot supply the missing typed consumer by itself. See [2016 source record](../resources/cicada2016-4gq25.md).

The evidence supports the circumference operation and makes 23 a plausible motif, but the chain “second peel → 23-rune register → DH/base29/direction consumer” still requires post-discovery choices. No preserved source determines all of the register ordering, alphabet/codec, direction, initialization/reset and target needed for a reversible operation. **The decisive source-selector gate is negative.**

## Distinct, more source-constrained SHED route — do not conflate it with inner23

The current synthesis has a separate page-level SHED result. It applies recursive circumference removal to all complete page-local words and retains one center from each odd-length word. On p55 this yields:

```
cores             [1,6,2,11,18]
core GP0          38
p50[38]           2D
base59(2D)        131 = GP0(CIRCUMFERENCES)
unique 131-rune receiver   p22
```

The unchanged operation transfers to the matched page-level five-core control p49:

```
p49 cores         [20,19,19,14,4]
core GP0          76
p50[76]           1s
base59(1s)        112 = GP0(DIRECTION)
unique 76-rune receiver   p55
```

The p49/p55 route is documented in [the matched-control transfer](lp2-p49-recursive-shed-direction-transfer.md), [the p55→p22 receiver report](lp2-p55-circumferences131-p22-receiver.md), and the [p49→p55→p22 SFT](../sims/lp2_p49_p55_p22_navigation_route_sft.cjs). P22 independently carries LP1 “VOICE OF THE CIRCUMFERENCE / DISCOVER TRUTH INSIDE YOURSELF” imagery and participates in the signed-source direction clause. This is a source-constrained navigation candidate, not unknown-page plaintext or a universal numeric jump rule.

**This route does not consume the 23-rune second peel.** It must not be cited as a successful DH23, BASE29 or 23-register decryption. Its more promising source-selected operation is the full page-level SHED/center extraction with the already fixed p50/base59 consumer.

## Disposition

Retain the exact 23-rune extraction and its manuscript-wide uniqueness result as a structural observation. Retire the **second-peel 23-rune consumer branch**: no independently preserved player-visible Cicada instruction currently selects that stopping point and specifies a complete typed reversible use. Do not continue generic modulus23, DH-peer, exponent, radix, permutation, phase or byte-framing searches.

Reopen only if a first-party source fixes the second-peel selection and the full consumer contract (ordering, codec/alphabet, direction, initialization/reset and target), followed by one reproducible held-out consequence on untouched original ciphertext. The page-level SHED→p50/base59 navigation branch is separate and remains tracked in the reports above.

## Reproduction

[Original-source recursive circumference SFT](../sims/lp2_p55_recursive_circumference_23_sft.cjs) validates the original p55 word segmentation, all seven peel depths, the 2,881-window census, the exact BASE29 bytes and positive plant. The [DH23 / p56 SFT](../sims/lp2_p55_inner23_dh23_shared2_gate.cjs) validates the conditional DH arithmetic, all legal F branches and the p56 known-plaintext control.
