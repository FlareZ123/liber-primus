# Terminal prime-ordinal → 256-cell table → 2016 image-width handoff

**Agent31, 13 November 2026. New exact cross-artifact source relation, plus bounded original-p55 inverse negatives.** No recovered unknown plaintext, authenticated new key/algorithm, or destination. The source-selection hypothesis is exploratory.

## Original-source route

The authentic p56 prime-totient decryption gives **AN END** as GP indices \`[24,9,18,9,23]\`, with prime-weight sum **311 = prime(64)**. The next solved original page p57 has four printed full-stop-delimited units (PARABLE and three body sentences). Their GP-prime sums are **449, 1259, 1031, 1229**, all prime, with one-based prime ordinals **87, 205, 173, 201**, summing **666**. [Prior independently reconstructed solved-page calculations](lp2-p57-parable-four-primeordinals-666.md).

Index the original 256 two-character table on physical pp49–51 using these *one-based ordinals*. The source-position lookups are fixed, without cipher fitting:

| Solved unit | Prime ordinal = table cell | Original table token | Provisional base60 byte |
| --- | ---: | --- | ---: |
| p56 AN END | **64** | **0p** | **51** |
| p57 PARABLE | **87** | **1p** | **111** |
| p57 sentence 1 | **205** | **3E** | **194** |
| p57 sentence 2 | **173** | **2S** | **148** |
| p57 sentence 3 | **201** | **1o** | **110** |

The two consecutive solved titles are **23** ordinary-prime ordinals apart, exactly the count of the distinct final 23-dot red punctuation stencil. Their table cells have an identical lower digit **p**, and the upper digit increments **0 → 1**, so the base60 byte difference is **60**. The four p57-unit bytes in printed order are **[111,194,148,110]**, totaling **563**, the verified width of the archived **563×569** Cicada 2016 signed-message JPEG ([original 2016 JPEG inventory](../resources/historical/cicada2016-4gq25.md), [binary validator](../sims/2016_jpeg_asset_inventory.cjs)). Those dimensions are consecutive ordinary primes. Prior independent research had found unique whole original LP2 words with GP-prime sums563 and569 at p0 word6 and p1 word33, then rejected a specific 21-symbol Toeplitz11 inverse; the new table route does not validate that cipher ([earlier bounded source-key gate](lp2-2016-dimension-wordpair-toeplitz11-gate.md)).

The two directly motivated **23-cell** consecutive table spans, positions **64–86** and **65–87**, have exact base60-byte totals **3000** and **3060** respectively, both multiples of60. Their difference60 is algebraically entailed by replacing cell64 with cell87; these are *dependent* identities. In contrast, a literal **zero-based** lookup gives byte values122 and65 at ordinal positions64 and87, and the four p57 bytes [65,76,117,74] sum332. One-based table indexing therefore selects the observed cross-artifact relationship, although an author instruction for such lookup is missing.

## New XOR selector from the same four cells

The original source-selected bytes provide a more concrete *candidate operation* than their arithmetic sum. XOR each printed unit's prime ordinal with the single byte addressed by that ordinal:

| p57 unit | One-based ordinal | Table byte | Ordinal XOR byte |
| --- | ---: | ---: | ---: |
| PARABLE title | 87 | 111 | **56** |
| Sentence 1, instar | 205 | 194 | **15** |
| Sentence 2, circumferences | 173 | 148 | **57** |
| Sentence 3, divinity | 201 | 110 | **167** |

The first three outputs are exactly three meaningful **original LP2 physical page indices**: solved **p56 AN END**, the distinctive **p15 Fibonacci-square** page, and solved **p57 PARABLE** itself. The fourth output **167** is outside the physical-page range, so the four outputs do not constitute a complete page-address grammar; inventing a variable reduction or page/line split for that last number would be post hoc.

In original p57 order the cumulative bytewise XOR states of the four selected bytes are **[111, 173, 57, 87]**. Thus the XOR of the *first two* source bytes equals the *third unit's* prime ordinal **173**, the XOR of the *first three* equals the solved page index **57**, and the XOR of *all four* equals the original title ordinal **87**. The final equality is a natural reversible **checksum loop** \`87 XOR 111 XOR 194 XOR 148 XOR 110 = 0\`. These checks are independent of the base60 byte *sum* relation but use the same four source-selected table bytes. XOR has precedent in the wider Cicada puzzle; these are possible author-generated self-checks, **not established instructions**.

A single specific extension freezes the source-chosen table map **\`F(i)=i XOR tableByte(one-based cell i)\`**, with no fitted key, and iterates it from the p57 title ordinal 87. Its source-input orbit closes after **20 steps**:
\`87 → 56 → 104 → 166 → 180 → 27 → 182 → 158 → 101 → 54 → 157 → 169 → 89 → 138 → 11 → 151 → 14 → 10 → 243 → 217 → 87\`.
The first edge reaches the preceding solved page **56**; the second reaches **104**, exactly the ordinary-prime ordinal of **569**, the independently archived 2016 image's height. The cycle also visits **138**, already present in the original LP1 p5 magic square, although that correspondence was found after tracing the cycle. The 20-cycle is an actual property of the complete source table, not a recovered message. A functional mapping on 256 elements can have cycles by chance; the 2016 width/height, p15 and p56 associations must be interpreted with the full postselection caveat.

This yields a bounded, testable source-specific **XOR table-graph hypothesis** with independent next-step candidates: the 20-node orbit, the p15 image-selected square, or an archived byte sequence might specify a key or a reading order. So far the orbit tokens and their GP29 residues do not read as authentic plaintext. The first three page-number matches and the XOR closure are promising *clues for choosing a test*; the missing original instruction is which graph traversal or reversible payload operator was intended.

## Two finite original-cipher inverse decisions

The p57 wording about shedding circumferences and the independently established final stencil supply a second original-source object: the 23-GP-rune core of p55 obtained after removing two outer rune pairs from each of its sixteen complete words ([original p55 core](lp2-p55-nested-23dot-rowcol-inverse.md)). Take the source bytes in table positions64–86 or65–87, reduce each byte modulo29 and apply it once to the 23 original core runes by both historical GP additive signs. These four original outputs, in source GP transcription, are:

| Table interval | Sign | Decrypted core (23 GP runes) |
| --- | ---: | --- |
| 64–86 | − | P B U NG J E A A N S NG G E AE EA OE J B EO R EO J L |
| 64–86 | + | EA F E P E I AE X OE A C I A NG Y IA U J EO F NG N E |
| 65–87 | − | F F EA EA R EA S IA J P J C D A I S N X X EO O J A |
| 65–87 | + | EO B L G AE F C J L Y S J M OE S C O X I NG U N X |

None supplies recognizable original-language plaintext when reinserted in the original printed word frames. All four are exactly invertible on the 23 original runes, and **23/23** solved-GP native plants recover for each setting. A separate byte-oriented original consumer treats the 23 source bytes as a candidate hidden text, keyed by the p55 core's GP ordinals or GP prime weights using bytewise XOR, addition, or subtraction. **All twelve** fixed outputs contain only **7–10 printable ASCII bytes out of23**. Their exact binary roundtrips establish implementation consistency alone. No authentic p55 plaintext is recovered.

One narrow diagnostic fixes the p56/p57 table indices and shuffles only the original 256 byte inventory. In **3,000,000** seeded distinct-index draws, **9,254** reproduce the pair difference60, **7,657** reproduce the four-unit sum563, and **26** reproduce both, a joint conditional frequency **26/3,000,000 = 8.67×10⁻⁶**. Seed **0x5613666**. This is *not* a research-wide p-value: 563, the shared base60 digit and these targets were noticed after extensive exploratory search. It quantifies the specificity of this exact correspondence under a single artificial table-permutation null, without proving historical design.

## Reproducer, scope, and next decision

[Original-source CommonJS SFT](../sims/lp2_terminal_ordinal_grid563_sft.cjs) asserts the solved original runes, table source tokens, original p55 core extraction, the four GP29 and twelve byte-oriented tests with positive controls, and all diagnostic counts. It **passed Node22 GitHub Actions on the checked-in original repository**: [manual run 43486904498](https://github.com/FlareZ123/liber-primus/actions/runs/43486904498), using the [existing Agent31 workflow](../.github/workflows/agent31-red16-source-manual.yml).

**Research decision:** preserve the title-prime-ordinal → table-cell → 23-step / 563-width route as a conditional human puzzle clue. The obvious direct 23-symbol and binary consumers have now failed. An additional **18 source-locked literal p56 hash-preimage checks** tested raw bytes or original ASCII table-token strings for both 23-cell intervals and the four-unit selection under SHA-512, SHA3-512 and BLAKE2b-512; **none matches** the published original p56 digest. The exact full-digest checks are in the same CJS reproducer. A successor must establish a source-visible operator or explicit intermediate state that consumes the indicated table interval or 563 selector before additional cipher searches. The base60 byte interpretation remains provisional; the source itself lacks explicit directions to prime-rank titles into table addresses or to XOR selected values. The newly discovered XOR closure and 20-state orbit improve the specificity of the operator hypothesis, but a human-readable inverse on original unknown ciphertext remains missing. Exact arithmetic identities and source-graph cycles must not be promoted to decrypted plaintext.
