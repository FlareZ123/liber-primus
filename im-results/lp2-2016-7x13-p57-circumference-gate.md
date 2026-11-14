# LP2 2016 7×13 circumference gate

**Status:** bounded negative for this 7×13 perimeter route; no plaintext recovered.

## Question

Could the 91-rune interior stream produced by the provisional 2016 signed-message word map be the intended 7×13 object, and could p57's instruction to shed circumferences identify its useful interior?

This is a bounded test, not an assertion that the 2016 word-map hypothesis is established.

## Source-constrained construction

Inputs:

- The signed 2016 message at resources/historical/cicada2016-4gq25-outguess.asc.
- The printed-word segmentation in resources/lp2-transcription.txt.
- The canonical Gematria Primus encoding and page rune indices in resources/liber-primus/lp2-corpus.json.
- The original p32 image and its 13-dot marker.

The existing provisional word-map rule encodes each of the 43 signed-message words with GP prime weights, then uses sum modulo 58 as the LP2 page and floor(sum / 58) as the word index. It yields 42 rune-bearing targets; the remaining word addresses the p50 numeric table. Removing the first and last rune from each of the 42 target words yields 91 GP symbols.

The signed message has seven paragraph units, and p32 has a 13-dot marker. Thus 7×13 is a motivated layout for the 91-symbol stream. It remains a structural hypothesis, not proof of intended matrix dimensions.

## Reproduction

Run from the repository root:

**node sims/lp2_2016_7x13_p57_circumference_gate.cjs**

The script reproduces the word map, exact 91-symbol stream, 7×13 grid, concentric ring sizes, p50/p32 diagnostic route, and direct p55 key test.

## Results

The 7×13 grid in source order is:

| Row | GP tokens |
|---:|---|
| 1 | IA R F E I O L OE E AE O B O |
| 2 | L X IA R F E I R U N EA O L |
| 3 | S C NG R TH O L EA P S H N EA |
| 4 | O L Y OE N T S D W R TH O L |
| 5 | S T AE N R D NG N T M I O TH |
| 6 | E TH EO G G F N IA C TH R T TH |
| 7 | H B E G IA P EA U AE M P S A |

Repeatedly removing rectangular perimeters gives ring sizes **36, 28, 20, 7**. One perimeter peel leaves a 5×11 interior of 55 symbols:

| Row | Interior GP tokens |
|---:|---|
| 1 | X IA R F E I R U N EA O |
| 2 | C NG R TH O L EA P S H N |
| 3 | L Y OE N T S D W R TH O |
| 4 | T AE N R D NG N T M I O |
| 5 | TH EO G G F N IA C TH R T |

The central seven symbols are OE, N, T, S, D, W, R. Neither the 55-symbol interior nor the seven-symbol center is readable plaintext.

Using the 55-symbol interior as a repeating additive/subtractive GP29 key against p55 does not decrypt it. The raw p55 IoC is 0.037895; both direct signs produce 0.033684. This rejects the simplest direct-key interpretation, not every possible use of the extracted stream.

The ring sizes, read centre-out as one-based positions in the 2016 message, select words 7, 20, 28 and 36: **seeks, their, are, found**. This is not a coherent instruction. Their GP prime sums are 253, 114, 175 and 130; the corresponding p50 table bytes are 36, 197, 18 and 86. Reusing the existing p50-byte compass convention on p32 from zero-based index 33 gives rune output **NG L EA R** at zero-based indices 77, 108, 99 and 100. It does not reach a recognizable marker or plaintext. This is a diagnostic reuse of a provisional compass rule, not independent confirmation of that rule.

## Decision

Retire this specific chain as a decryption route:

1. 2016 word map → 91-symbol stream.
2. Seven paragraphs × thirteen-dot marker → 7×13 layout.
3. p57 circumference instruction → rectangular perimeter peel.
4. 55-symbol interior as a direct additive/subtractive key for p55.
5. Ring sizes as 2016 word positions → p50 bytes → p32 compass walk.

It produces no plaintext, no coherent word instruction, and no useful p32 endpoint. Do not extend it with arbitrary rotations, offsets, coordinate reductions, or additional cipher layers.

The separate p55 length selector is consolidated in the p55 fold report (im-results/lp2-2016-p55-fold-circumference-keys.md); it should not be inferred from this failed 7×13 route.
