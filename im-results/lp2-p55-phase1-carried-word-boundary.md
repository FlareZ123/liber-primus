# p55 phase1 carried-word boundary source gate

## Decision

The frozen p55 packet start at local rune1 has an exact independent source boundary: local rune0 is the single p55 rune that completes a word begun on p54, and local rune1 begins the first word wholly contained on p55.

The alignment is source-visible. Its rarity is modest. Exactly one carried rune occurs on 9 of the 54 rune-bearing page starts after the first page, or 16.67%. Among the 32 page starts that continue a word from the preceding page, 9 have a one-rune carry, or 28.13%.

This supports phase1 as a natural page-local start. The carry pattern alone does not validate the packet serializer or framing bytes.

## Exact p54 to p55 boundary

The canonical continuous-word parser gives 32 cross-page words in p0-p55. At the p54 to p55 boundary the crossing word transliterates as `GOTTHXEEARGYNG`. Ten of its eleven runes are on p54 and its final rune is p55 local rune0.

The next complete word is entirely on p55: `AEMIW`. It begins at p55 local rune1 and has four runes. Thus the packet's frozen phase1 start is exactly the first rune that belongs to a word wholly contained on p55.

The original scans 71.jpg and 72.jpg visually agree with this parser boundary.

## Manuscript-wide carry census

Across the 54 rune-bearing page starts after p0, initial carried-rune counts are: 0:22, 1:9, 2:12, 3:3, 4:2, 5:4, 6:1, 7:1.

The physical pages with exactly one carried rune are `p10, p20, p26, p32, p42, p45, p49, p52, p55`. P55's pattern is therefore genuine and non-unique.

## Reproduction

`sims/lp2_p55_phase1_carry_boundary_sft.cjs` parses the canonical transcript continuously across page breaks, preserves printed word delimiters, asserts the 32 cross-page words, asserts the full carry-length histogram, and verifies the exact p54-p55 word plus p55 local rune offsets.

Shared CI PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44395155034

## Consequence

Treat p55 phase1 as independently motivated for a page-local operation that begins after inherited p54 text ends. Do not count the one-rune carry as a second rare statistical coincidence for the 15x5 packet. The packet still relies on its separately calibrated framing and underselected five-rune-to-24-bit transport.
