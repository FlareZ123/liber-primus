# p32 word-centre compass route into the 2014 7×7 square

**Classification:** provisional, source-constrained route hypothesis. It is not an LP2 decryption, an authenticated cipher key, or a recovered destination. Do not promote it to `results/README.md`.

## Why this route is worth testing

The signed 2016 message says that Liber Primus's words are a map, their meaning is the road, and their numbers are the direction. The image-selected physical p32 is a 121-rune, 11×11 page. Its first punctuation-delimited clause contains exactly seven printed words, all odd length:

- word lengths: **[1, 3, 5, 11, 5, 5, 3]** (33 runes total);
- one unambiguous middle rune per word: **ᛚ ᚫ ᛈ ᛗ ᚦ ᛏ ᚩ**;
- corresponding GP ordinals: **[20, 25, 13, 19, 2, 16, 3]**;
- corresponding GP prime weights: **[73, 101, 43, 71, 5, 59, 7]**.

The solved p57 PARABLE explicitly says “WE MUST SHED OUR OWN CIRCUMFERENCES” and “FIND THE DIVINITY WITHIN”. The 2014 Onion7 archive selects the middle of three OpenPuff squares: the 7×7 square whose centre is **331**. That gives a human-visible reason to take the centre rune of each odd-length p32 word and to start at the 7×7 square's centre. The relevant source record is [the consolidated Onion7/Parable report](onion7-magic-center-source-prime-gate.md); inputs are [the original transcription](../resources/lp2-transcription.txt), [the GP corpus](../resources/liber-primus/lp2-corpus.json), and [the three historical squares](../resources/cicada2014-openpuff-magic-squares.txt).

## One source-fixed route hypothesis

Use each middle rune's prime weight modulo 8 to select a cardinal direction in clockwise order:

- residue 1 → north;
- residue 3 → east;
- residue 5 → south;
- residue 7 → west.

Use half the word length, (length−1)/2, as the step distance. Start at the 7×7 square's centre, zero-based cell (3,3), value 331. This is a compact interpretation of “divinity within” plus “numbers are the direction”; the exact mod-8-to-compass convention is still an inference, not an authenticated instruction.

| Word | Length | Centre rune | GP prime | mod 8 | Direction | Distance | End cell (r,c) | Square value |
|---:|---:|---|---:|---:|---|---:|---:|---:|
| 1 | 1 | ᛚ | 73 | 1 | N | 0 | (3,3) | 331 |
| 2 | 3 | ᚫ | 101 | 5 | S | 1 | (4,3) | 114 |
| 3 | 5 | ᛈ | 43 | 3 | E | 2 | (4,5) | 232 |
| 4 | 11 | ᛗ | 71 | 7 | W | 5 | (4,0) | 15 |
| 5 | 5 | ᚦ | 5 | 5 | S | 2 | (6,0) | 181 |
| 6 | 5 | ᛏ | 59 | 3 | E | 2 | (6,2) | 27 |
| 7 | 3 | ᚩ | 7 | 7 | W | 1 | (6,1) | 17 |

The seven visited values are **[331, 114, 232, 15, 181, 27, 17]**. Their sum is **917 = 7×131**, and 131 is the 32nd prime, matching physical page p32. The route stays inside the 7×7 square without wrapping.

The historical 7×7 square is a true normal magic square: every row, column, and main diagonal sums **1033**. The route therefore leaves **1033−917=116=4×29**, exactly four cardinal directions times the 29-symbol GP alphabet. This is a notably specific cross-check between the route construction and the source square/alphabet.

Testing the eight natural rotations/reflections of the four cardinal assignments gives sums **[917, 1944, 917, 1944, 845, 1542, 845, 1542]**. Only the two 180°-equivalent readings satisfy the **1033−sum=4×29** check; central symmetry makes them produce the same value sequence. The checksum narrows the four distinct value sequences to one, but it does not prove that the creator intended the mod-8 compass convention; the route remains provisional.

## Related exact arithmetic and limits

The seven centre ordinals sum to **98 = 2×49**; their prime weights sum to **359 = 331+28**, where 28 is the count of nonzero GP symbols. Independently, the p32 first clause's prime sum is **1467** and the central 5×5 perimeter of the p32 11×11 prime matrix sums to **1136**, giving **1467−1136=331**. The 2016 archived signed payload is also 1,136 bytes. These are source-derived arithmetic correspondences, not separate independent confirmations of a cipher.

A further exact but unused alignment: the 2016 ASCII-armored payload's 29-character “BEGIN PGP SIGNATURE” header begins at byte offset 317; its central character is the space at offset **331**. This is compatible with the 29-symbol alphabet and the 331 centre, but it may be a post-hoc coincidence and does not determine a key.

Applying the same word-centre directions and half-length distances to the p32 11×11 rune matrix itself, starting at its centre, selects GP transliteration **WABXNGMO**. That is not plaintext. Direct GP29 Vigenère tests also reject the most obvious key readings:

- route values modulo 29: **[12, 27, 0, 15, 7, 27, 17]**;
- centre-rune ordinals: **[20, 25, 13, 19, 2, 16, 3]**.

Both keys were tested with both additive signs and with book-global versus physical-page-reset phase over all 12,956 unknown runes. The original-cipher baseline GP-trigram score was **−6.237756** (IoC 0.034478); native GP-English control was **−2.228338** (IoC 0.059501). The tested candidates remained at **−6.271 to −6.194** with IoC around **0.0345**, i.e. ciphertext-like, not recovered language. The trigram model used the first 240,000 characters of `resources/control/shakespeare_first300k.txt` with the GP mapping used in `sims/lp2_historical_vigenere_skip_viterbi.cjs`.

## Assessment and next useful question

This is a plausible human solve-path hypothesis: the odd-word centres supply direction residues, half-word lengths supply distances, and the Parable-selected square supplies the origin. It produces a page-specific checksum, but it has not recovered plaintext or a destination. The next useful question is whether this exact seven-cell route has a source-fixed interpretation in the signed 2016 tree image or another original Cicada artifact. Do not broaden into arbitrary periodic keys, offsets, or compass remappings. If no independent source specifies the next operation, retain this as an intermediate clue and stop extending it.

Reproduce the route and all source arithmetic with:

`node sims/p32_wordcenter_compass_route_sft.cjs`

