# Word-prime compass inversion using the original 32×8 grid

**Evidence class:** source-led finite inverse and exact positive controls, with **no original LP2 plaintext, key or continuation recovered**. Agent 16, 10 November 2026.

## The proposed original-image-to-cipher route

The [archived, signed 2016 Cicada image](2016-image-dimensions-lag6-source-derivation.md) has dimensions 563×569 and gives a text clue that Liber Primus's words are the map and their numbers the direction. LP2 itself prints a 32×8 table of 256 byte values and defines prime values for each of its 29 runes. This motivates a concrete conjecture: navigate the printed grid by the Gematria prime sums of complete ciphertext words, reading a new key byte per rune. No surviving source explicitly states that this particular compass walk is intended.

Start at grid cell (row `563%32=19`, column `569%8=1`) heading `(569−563)%8=6`. Compass directions numbered clockwise from north are N, NE, E, SE, S, SW, W, NW. Traverse each complete original ciphertext word in that heading, reading the grid byte before or after each one-cell toroidal move. **After each word**, compute the sum of the actual ciphertext runes' GP prime values modulo eight; it supplies the heading of the next word. Using the *preceding* ciphertext word makes this fully causal for exact encryption and decryption, including a forward known-plaintext control.

Each grid byte is reduced by `byte%29` or `floor(byte*29/256)`. Two source-grounded reversible channels are tested: direct `C=P±K mod29`, or GP28 nonzero-step `C_i=C_(i-1)+15^((P_i±K)mod28) mod29` with plaintext index28 reserved for zero step. The nonzero-step channel uses `K mod28`; 15 has order28 modulo29. Combined with two signs and read-before/read-after choices, this gives **16 fixed settings**. The parser retains all **2,896** actual words and **12,956** original unsolved runes across page and line boundaries. Training is the source-motivated first **6,561=81²** runes; the remaining **6,395** runes are held out.

## Original results

The highest-training model is the nonzero-step channel, scaled-byte reduction, negative sign and after-move read. Its training GP index-of-coincidence is **0.03534498942383114** and heldout **0.03523675807289036**. Original untouched ciphertext IoC is **0.03447839786450569**. The decoded text remains nonlinguistic and is near the quasi-uniform GP28 baseline.

For specificity, permute the actual 256 table bytes in **128** deterministic original-source-matched trials, and let every wrong grid independently choose its best of the same 16 settings on the training span. **92/128 shuffled grids obtain held-out IoC at least as high as the original printed grid**, plus-one tail **93/129=0.7209302325581395**. Mean shuffled-grid heldout IoC is **0.035264251290608416**. The original source has no demonstrated decoding advantage under this finite model.

A true forward/inverse positive repeats the independently solved physical page57 PARABLE text (95 native-GP runes) into all **12,956** original word slots. All **16 actual-grid modes** encode and then recover **12,956/12,956 original plaintext runes**, including the ciphertext-dependent word-direction updates. The repeated solved-text reference has IoC **0.07248160773113381**. Each negative original inverse also re-enciphers the original **12,956/12,956** symbols exactly, a losslessness check without authenticating its plaintext.

## Decision and reproduction

The candidate closes one natural human-solvable interpretation of **words/numbers/direction + 32×8 printed table**, with an exact original-cipher inverse and a source-order null. The failure leaves unknown source-selected keys, different word transformations, missing historical material and non-GP plaintext open. There is no positive evidence that the 2016 statement refers to this particular grid walker.

[Standalone Node.js 22/CommonJS test](../sims/wordprime_grid2016_direction_sft.cjs) reads committed inputs, uses the canonical `parseSharedCorpus()` word parser, runs all planted roundtrips, and reproduces the 128 shuffled-grid original comparison. No new authoritative claim is made in [results/README.md](../results/README.md).
