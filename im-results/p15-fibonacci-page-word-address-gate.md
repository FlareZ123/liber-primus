# p15 Fibonacci-prime spiral: direct-key negatives and a 318° p32 navigation candidate

**Classification:** exact original-source navigation experiment with finite negative results. The p15 Fibonacci-prime construction is real and reproducible, but neither direct page/word pairing nor the source-motivated infinity-arrow Fibonacci additive reading yields an independently useful plaintext route or key. **No unknown LP2 plaintext or authentic cipher key is recovered.**

## Source-fixed input

The original p15 square (physical LP2 page 15, archive image 32.jpg) is already established as a clockwise spiral from the red 3299 cell. Its 16 printed values are:

3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516.

For each value v, the established construction is p = |3301 − v|, with one-based prime ordinal n = π(p). The resulting primes and ordinals are:

| Spiral | F | Prime p | Ordinal n = F+1 |
|---:|---:|---:|---:|
| 1 | 0 | 2 | 1 |
| 2 | 1 | 3 | 2 |
| 3 | 2 | 5 | 3 |
| 4 | 3 | 7 | 4 |
| 5 | 5 | 13 | 6 |
| 6 | 8 | 23 | 9 |
| 7 | 13 | 43 | 14 |
| 8 | 21 | 79 | 22 |
| 9 | 34 | 149 | 35 |
| 10 | 55 | 263 | 56 |
| 11 | 89 | 463 | 90 |
| 12 | 144 | 829 | 145 |
| 13 | 233 | 1481 | 234 |
| 14 | 377 | 2593 | 378 |
| 15 | 610 | 4507 | 611 |
| 16 | 987 | 7817 | 988 |

The two values above 3301 are handled by the already published absolute-difference rule; they are not exceptions. The question tested here is whether the two source-native coordinates p and n−1=F can act as page and word addresses in the 56 unsolved physical pages 0–55.

## Exact physical-page word model

Addresses use zero-based physical page numbers and one-based printed word numbers. The parser is the existing physical-page parser used by the signed-2016 base58 map: remove line wraps, split at printed delimiters, and retain the original physical page slots. There are **2,973 printed page-local rune words** over the 58 original pages; page 50 is the numerical grid and has no rune words. This is deliberately distinct from the 2,896-word stream that joins words across physical page boundaries. A page-local word address must use the former.

Two direct pairings were frozen, with no offset, page rotation, alternate modulus, or fitted direction:

1. **Prime value as page; prime ordinal as word:** page = p mod 56, word = ((n−1) mod 56)+1.
2. **Fibonacci index as page; prime value as word:** page = F mod 56, word = ((p−1) mod 56)+1.

### Reading A: prime value → page, ordinal → word

| Spiral | Address (page, word) | Selected rune word |
|---:|---:|---|
| 1 | (2, 1) | OEM |
| 2 | (3, 2) | EOHNGCTHTAEJTXH |
| 3 | (5, 3) | CNGD |
| 4 | (7, 4) | LCJ |
| 5 | (13, 6) | U |
| 6 | (23, 9) | NGWURS |
| 7 | (43, 14) | FOE |
| 8 | (23, 22) | FAOIANGBEATHCA |
| 9 | (37, 35) | IAEOE |
| 10 | (39, 56) | out of bounds |
| 11 | (15, 34) | BHAEJIAI |
| 12 | (45, 33) | LWCJWX |
| 13 | (25, 10) | NGXXAE |
| 14 | (17, 42) | EOGHEM |
| 15 | (27, 51) | OERIANCCT |
| 16 | (33, 36) | TJ |

**15/16** addresses exist. The only invalid address is p39 word56 (p39 has 55 printed words). The selected tokens do not form a direct plaintext instruction.

### Reading B: Fibonacci index → page, prime value → word

| Spiral | Address (page, word) | Selected rune word |
|---:|---:|---|
| 1 | (0, 2) | SYENGC |
| 2 | (1, 3) | OEAAENGSDPT |
| 3 | (2, 5) | EARB |
| 4 | (3, 7) | PNYASMB |
| 5 | (5, 13) | EEADR |
| 6 | (8, 23) | YSHUL |
| 7 | (13, 43) | EATHML |
| 8 | (21, 23) | RYIU |
| 9 | (34, 37) | OE |
| 10 | (55, 39) | out of bounds |
| 11 | (33, 15) | STHEAWJ |
| 12 | (32, 45) | out of bounds |
| 13 | (9, 25) | GPIC |
| 14 | (41, 17) | BTHOEEOYOEIB |
| 15 | (50, 27) | rune-free numerical grid |
| 16 | (35, 33) | JRIA |

**13/16** addresses exist. The invalid addresses are p55 word39, p32 word45, and p50 word27. No source clue in the p15 construction chooses an alternative word offset or a different modulus, so these failures are not repaired by tuning.

## Original p15 infinity-arrow continuation test

The original p15 JPEG adds a stronger human-visible clue than the numbers alone: beneath the 4×4 spiral is an infinity mark, and a red arrow points to the first line of the page's body text. The page has 159 runes: a nine-rune heading followed by **150 body runes**. This gives a source-selected start position and suggests continuing the Fibonacci-derived sequence rather than merely repeating the 16 printed entries.

A finite test used the exact distinct-Fibonacci sequence encoded by the grid, starting 0, 1, 2, 3, 5, 8, … and continuing by the Fibonacci recurrence. The 29-symbol Gematria Primus alphabet supplies modulus 29. The solved p56 additive GP29 cipher supplies the simplest source-grounded shift operation. Starting at the arrow-targeted body (rune offset 9), four fixed variants were tested: F mod 29 or the displayed prime ordinal F+1 mod 29, each in both additive directions. No offsets, phase search, word resets, or key fitting were used.

| Stream | Decryption direction | Result |
|---|---|---|
| F mod 29 | subtract | no readable plaintext |
| F mod 29 | add | no readable plaintext |
| (F+1) mod 29 | subtract | no readable plaintext |
| (F+1) mod 29 | add | no readable plaintext |

Exact 150-rune outputs, in the manuscript's transliteration alphabet:

**F mod 29, subtract**
\`\`\`
LFMGFOERBJOMJFIFNGDHABBXNSJSAEEAMDEOMNMETDEOOEGFGHEOTGYABEOEWXJTEOREARFYTYNGOUSHEOHOOEEOPAEERHJEUIAEXEAFRJEABTNGMLNDTIEOACTSHTHNGSTHDHCIAULXEARSAEJDSEOWLOHTLAEUOENGEAFFJXIFELXEMNGUAW
\`\`\`

**F mod 29, add**
\`\`\`
LTHDEOINUUNGYDNTHITHDIAXCRXIAMNSPIAEANGAETAEMGSFRGYRTHGIXLEOWJXTHOUENEEOGUHGWODCPAMGXHCATMGCUNGMIUJTHJNPIAECAEIDSAEOOENUDOEXDEESNIXUOYCFYMOPIASBMBDREAHSEACOOETHIAFDAELYMUFNIAEAIMPCOM
\`\`\`

**(F+1) mod 29, subtract**
\`\`\`
MEAECEANGOTITHEIEANEALOEWDTTPHXIXAIAEOEJEHEBSOEJNGCEACWJSCAEDTBNGGPISJOIAOEAAESAELTHFXWJWTHNGJEOABOWJEUIAEXEAFRJEABTNGMLNDTIEOACTSHTHNGSTHDHCIAULXEARSAEJDSEOWLOHTLAEUOENGEAFFJXIFELXEMNGUAW
\`\`\`

**(F+1) mod 29, add**
\`\`\`
NGOAPJITHTHOEIAAIOJOAEASGCSEALITXEAFOEYBYLWTUCWIACOWJSNGPHEOSORTHMIMPWTHNWHRAGXAELWSNGAEBLWGTHOEMIUJTHJNPIAECAEIDSAEOOENUDOEXDEESNIXUOYCFYMOPIASBMBDREAHSEACOOETHIAFDAELYMUFNIAEAIMPCOM
\`\`\`

Preserving the original word and line boundaries does not reveal an instruction either. The repeated-16 interpretation of the infinity mark is already covered by the earlier 16-period key-family tests in [the established p15 spiral report](../results/fibonacci-prime-spiral.md); it is not a new route. The infinite Fibonacci-mod-29 continuation is distinct from that periodic test and also fails on the arrow-selected body.

The visual evidence therefore selects a plausible start and a Fibonacci-derived schedule, but it still does not select a successful reversible operation. In particular, it does not tell a solver to transfer the sequence into the separate 32×8 p49–51 table, assign prime/Fibonacci coordinates to its rows and columns, expand 16 entries to 32 or 256 bytes, or choose AES/another block mode. Such steps would add unsupported choices.

## Fixed recursive continuation through the signed-2016 word map

The 2016 signed-message interpretation already tested in the [base-58 word-map report](lp2-2016-signed-message-base58-word-map.md) assigns a printed word with GP-prime sum S to page S mod 58 and zero-based word index floor(S/58). This is provisional navigation, not an established cipher. To test whether the p15-selected words continue under that same fixed operation, I applied it to every valid start above without changing the rule.

The known solved endpoint is physical p56, zero-based word index 1: OESR, independently decrypted as **END** by the established p56 totient-prime cipher.

| Start set | Valid starts | Paths reaching END | Expected hits from exact END basin | Baseline probability |
|---|---:|---:|---:|---:|
| Reading A | 15 | 1 | 0.9687 | P(≥1)=0.63354 |
| Reading B | 13 | 0 | 0.8396 | P(0)=0.41907 |

The exact directed-pointer graph over all 2,973 printed words has **192** starting nodes whose deterministic walk reaches the END node, a basin fraction of **6.4581%**. Under a uniform sample without replacement of 15 or 13 starts, the probabilities above follow from the exact hypergeometric no-hit probability. The observed one hit in Reading A and zero in Reading B are ordinary outcomes, not evidence that the p15 route selected the intended continuation.

Reading A's only hit begins at spiral position 16, p33 word36 TJ, and reaches the known endpoint in three transitions:

p33/w36 TJ → p38/w2 IAAETECF → p1/w7 OEI → p56/w2 OESR (END).

Most other paths enter existing cycles; the recursive map does not yield a new unknown plaintext or a distinctive route. The one END hit is explained by the size of END's pre-existing basin.

## New p15→p32 318° map/direction test

A distinct navigation candidate now exists alongside the negative direct-key tests. The authenticated 2016 message says: “The words are the map, their meaning is the road, and their numbers are the direction.”

The p32 121-rune stream can be reshaped 11×11 (inferred, not printed); its first-row/first-column GP-prime sums reproduce the 563×569 signed-image dimensions. The p32 11-side supplies a plausible selector for p15's 11th clockwise value, 2838. Then 3301 − 2838 = 463 = p90, whose Fibonacci index is 89: the zero-based start of p32 word 16. The p15 grid side length four supplies a plausible four-rune suffix selector, yielding BUDS at offset 93.

The four-rune HOME prefix at offset 33 and BUDS suffix at 93 define image-space centers (99,112.5) and (382,423.5). From BUDS, the bearing to the signed image origin is 317.9493°, rounding to 318°; the HOME center is only 1.84 pixels from that ray. Independently, the four interior cells on the HOME-to-BUDS index diagonal are B/M/IA/NG, with GP-prime weights 61, 71, 107 and 79, summing to 318. The p15 value modulo 360 supplies the same direction.

Controls:
- Counterclockwise 11th entry: 1206; its 3301-complement 2095 = 5×419 is composite.
- One-based indexing: offset 88 lands on the last rune of word 15, not BUDS.
- Unrelated p0 first-16 rune-weight 4×4 control: 11th value 67; complement 3234 is composite.
- p32 top-left 4×4 control: 11th value 61; complement 3240 is composite.
- Three- and five-rune single-letter edge-window controls produce no pair within 0.5° of 318°; the four-rune set has seven windows and only BUDS→HOME matches.
- Allowing all GP digraphs creates an additional near-match, WXIATH→IARTTH at 318.1548°. The English/single-letter filter is material.

This is stronger than a numerical coincidence but remains a navigation hypothesis, not a decryption. The 11×11 reshape and the 11th-entry/four-rune-edge selectors remain inferred; the all-digraph edge set has an alternative near-match. The HOME/BUDS +60 offset is only a cross-check; historical base60 and 2012-axis-transpose claims remain qualified. The Old English Rune Poem semantic continuation is suggestive but non-unique.

Full derivation and reproducible controls: **im-results/p15-p32-318-direction-sft.md** and **sims/p15_p32_318_direction_sft.py**.

## Decision and scope

The original direct paired-coordinate, additive, and simple Hill/transposition readings remain bounded negatives. A separate p15→p32 navigation candidate now survives a source-constrained test: the p15 11th clockwise value gives 318°, matching the bearing from the p32 BUDS edge-window center to the signed-image origin and passing within 1.84 pixels of HOME. The selected HOME/BUDS index diagonal's four interior GP-prime weights also sum to 318. Wrong spiral orientation, one-based indexing, 3-/5-rune edge controls and an unrelated p0 4×4 control fail.

This closes the bounded question of whether the p15 spiral has a plausible LP2 map/direction use. It does **not** establish a cipher, plaintext, key or final destination. The 11×11 reshape and the 11th-entry/four-rune-edge selectors remain inferred; the all-digraph edge set has an alternative near-match. The next decisive test is the 318° ray against the original signed 2016 image with matched alternative-ray controls, followed by a precommitted LP2 prediction. Do not reopen the already-negative direct key families.

Reproduction: **sims/p15_p32_318_direction_sft.py**. Full report: **im-results/p15-p32-318-direction-sft.md**.