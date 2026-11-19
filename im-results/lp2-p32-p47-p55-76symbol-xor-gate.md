# p32/p47 76-symbol key to p55: direct XOR is negative

**Agent8, 19 November 2026. Classification: bounded negative for one source-motivated direct transfer. No plaintext, key, or complete decipherment recovered.**

## Why this was worth one test

The p32/p47 low-digit route supplies a compact candidate key with a natural target length:

- The source-anchored p50 low-digit cycle is ROAD/PATHS = 54 and FOUND = 36.
- Applying that cycle selector to p32's canonical words selects six words in page order, totaling **42 GP29 runes**. Their GP0 sum is 611 and their GP-prime sum is 2209 = 47².
- The same selector on p47 selects eight words in page order, totaling **32 GP29 runes**. Their GP0 sum is 534 and their GP-prime sum is **2013**.
- Appending the ordered cycle states [54,36] gives **76 key items**, matching the 76 original GP29 runes on corpus page55.

The 2013 prime-sum match and the 76-length alignment are post hoc observations, not authenticated instructions. But a contemporary solver familiar with Cicada's historically demonstrated bytewise XOR could reasonably try this one direct transfer before rejecting it. The original 2013 audio-stage bytewise XOR is independently documented in [the source-original XOR gate](lp2-2013-audio-direct-packed-gp29-original-xor-gate.md); that report does not select this p32/p47 key or p55 receiver.

## Source alignment correction

The canonical corpus has 58 page records, while the transcription has 57 percent-delimited sections. Corpus page50 is an empty placeholder; corpus pages51–57 map to transcription sections50–56. The existing low-digit page-map script indexes sections by page number directly for pages51–55, so those tail-page labels are off by one.

I reran the same all-page dual-square control with the corrected mapping. Every nonempty corpus page then matches its transcription rune count, and the unique dual-square match remains p32:

| Page | Selected words | Selected runes | GP0 sum | GP-prime sum |
|---:|---:|---:|---:|---:|
| 32 | 6 | 42 | 611 | 2209 = 47² |
| 47 | 8 | 32 | 534 | 2013 |

No other page p0–55 satisfies the same GP0 = 13m and prime-sum = m² relation for m≤55. The p32/p47 aggregate survives the corrected source alignment; the published page-map script should nevertheless be corrected by its owner.

## Exact XOR tests

Target: the original 76 GP29 indices on corpus page55 (the corresponding original scan is [72.jpg](../resources/liber-primus/72.jpg)). The p47 key material is drawn from original scan [64.jpg](../resources/liber-primus/64.jpg).

Key order is frozen as p32 selected words in page order, then p47 selected words in page order, then the source-ordered cycle states [54,36]. No offset, reversal, key permutation, or fitted phase is introduced.

### One-byte GP ordinal

Represent each GP29 index as one unsigned byte and the two cycle states as literal bytes. Apply the historically familiar bytewise operation:

`output[i] = ciphertext[i] XOR key[i]`.

Result:

- 76 input and key bytes;
- only **2/76** output bytes are printable ASCII;
- longest printable run: **2**;
- **10/76** values exceed the native GP29 range 0–28;
- output hex:

`120c1b0d161c1e180105170e14110b0e1c0f1e1101100500141c091f1209091813091f031e0d070709160a121e061e091a0b0a0f09121f181607101b0707001a140a130709120f081908242e`

This is neither coherent ASCII nor a valid native GP29 plaintext stream.

### Compact five-bit GP29 packing

As a second natural representation, pack each GP29 index as a five-bit symbol. Since the two appended states are addresses rather than runes, this variant projects them into GP29 as [54 mod29, 36 mod29] = [25,7]. The 76-symbol streams each pack to 48 bytes. XOR the packed byte arrays and unpack exactly 76 symbols.

The operation is reversible, but **8/76** outputs are invalid GP29 codes (30 or31), at zero-based positions 6,18,27,34,36,44,46,54. The decoded transliteration, retaining those invalid codes as markers, is:

`EEOIAPOEEA[30]AUCDXLBJXEAS[30]BUTCFLEAN[31]ENNAMN[31]O[30]PWWNOEIE[30]G[30]NYJISNE[31]AOEWTIAWWFYLIMWNESHAEHJP`

The remaining symbols do not form coherent plaintext. Treating 29–31 as separators or controls would be an additional unselected rule and does not repair the visible nonlinguistic segments.

## Decision

Retire these two direct consumers of the exact 76-item p32/p47 key:

1. one-byte GP ordinal XOR with literal appended state bytes [54,36];
2. five-bit GP29 XOR with appended state residues [25,7].

Do not expand into arbitrary offsets, reversals, key permutations, or invented handling for invalid codes. This does not disprove the p32/p47 navigation hypothesis, the source-derived word selection, or a different independently selected receiver operation. It only rejects the natural direct XOR transfers tested here.

## Reproduction

`node sims/lp2_p32_p47_p55_76symbol_xor_sft.cjs`

The SFT reconstructs the key from canonical source data, checks the corrected page/section alignment and all-page dual-square control, reproduces both XOR outputs, checks 5-bit pack/unpack equivalence, and asserts exact XOR round trips.