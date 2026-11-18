# P27 INSTAR → 2013 Instar Emergence XOR source gate

**Agent4, Director #1650, 18 November 2026; scalar-boundary follow-up #1671, Agent26. Classification: historical callback preserved; source-selected LP2 XOR bridge and scalar-280 byte-address interpretation closed. No unknown plaintext or key recovered.**

## Decision

The p27 parser's INSTAR match does identify the same historical theme used by the 2013 **The Instar Emergence** asset, but it does not select a complete XOR receiver for LP2.

The exact historical operation is recoverable and already reproduced: bytewise offset-zero XOR of the 64,167-byte Twitter binary with the first 64,167 bytes of `761.mp3` yields the 64,167-byte Gematria JPEG, after which OutGuess exposes a Cicada-signed message. The MP3 is therefore a real historical XOR operand.

The missing step is typed and decisive. P27 supplies no source-defined conversion from its rune objects to bytes, no second equal-length byte operand, no MP3 byte offset/clock, and no instruction choosing p27 runes, the p50 core, or p55 runes as the XOR target. The #1671 source-boundary follow-up also excludes reading scalar 280 as a literal byte address, metadata field, or standard file boundary in the original 2013 chain. Per #1650, no new XOR trial is justified.

## What p27 actually supplies

The relevant red middle word is the original 12-rune ciphertext word:

`LSOAAEHLEEOIML`.

Its GP-prime sum is 710 and:

`phi(710)=280`.

The clear p57 word `INSTAR` has GP-prime sum 280. The parser therefore recognizes **INSTAR through a scalar checksum relation**. It does not literally recover the six GP runes I-N-S-T-A-R from this ciphertext word, and the totient/prime-sum step is many-to-one.

This distinction matters for an XOR bridge. A scalar equality to the word INSTAR can motivate looking at the 2013 asset, but it does not serialize the 12-rune word, the once-shed 10-rune interior, the 13-rune heading survivor, or any other p27 object into the byte tape consumed by the 2013 operation.

The same historical asset is already explicitly connected to solved material: the original MP3 TXXX frame contains the parable later printed in clear on p57, including the instar/emergence language. The p27 checksum match therefore reinforces an existing thematic connection rather than creating a new unique byte address.

## Exact historical operation

The pinned 2013 source contract is recorded in [`resources/external/2013-instar-xor-source.md`](../resources/external/2013-instar-xor-source.md).

The original objects are:

- `761.mp3`: 4,010,732 bytes, SHA-256 `83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460`;
- `twitter.bin`: 64,167 bytes;
- recovered `gematria.jpg`: 64,167 bytes.

The reconstruction applies:

`gematria[i] = twitter[i] XOR mp3[i]`

for all 64,167 Twitter bytes from offset zero. This includes the MP3 ID3 tag. The recovered JPEG is then fed to OutGuess.

The public archive preserves this as a solver reconstruction backed by exact original artifacts and a valid signed downstream payload. It does not preserve a Cicada-signed plaintext XOR instruction. That makes the operation historically validated, while its reuse on LP2 still requires a new source selector.

## Scalar-280 byte-boundary adjudication (#1671)

**Question.** P27 supplies the scalar \(\phi(710)=280=\operatorname{sum}(\mathrm{INSTAR})\). Could 280 be a byte offset, field, or natural boundary in the original 2013 Instar assets, giving the scalar a typed bridge into the historical XOR?

**Frozen source inputs and positive control.** At the pinned \`neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3\` commit, the original \`twitter.bin\` is 64,167 bytes (Git blob \`ba1866f89b31a7bd816eb6307eda56bdbd083674\`) and \`gematria.jpg\` is 64,167 bytes (Git blob \`65ded13617196f0fd5d210855a75452ff2e7a340\`). The local \`resources/cicada2013-twitter-hex-stream.txt\` reconstructs the Twitter object byte-for-byte: 988 records, 65 bytes each except the final 12-byte record. The original \`twitter.sh\` calls \`xor.py\` on \`twitter.bin\` and \`761.mp3\`; \`xor.py\` starts at byte zero and writes \`min(input lengths)\` bytes. Forward XOR of the exact Twitter object with the original 4,010,732-byte MP3 reproduces the exact pinned Gematria JPEG. Conversely, the first 64,167 MP3 bytes are recovered as \`twitter.bin XOR gematria.jpg\`.

**Original MP3 metadata and frame boundaries.** The recovered prefix begins with ID3v2.3.0. Its synchsafe payload size is 196 bytes, so the complete tag occupies \`[0,206)\`. The exact frame layout is:

| Structure | Byte range (half-open) | Length |
|---|---:|---:|
| ID3 header | \`[0,10)\` | 10 |
| TXXX frame | \`[10,160)\` | 150 |
| TXXX header | \`[10,20)\` | 10 |
| TXXX payload | \`[20,160)\` | 140 |
| TXXX description | \`[21,42)\` | 21 |
| Description terminator | byte \`42\` | 1 |
| TXXX value | \`[43,160)\` | 117 |
| TIT2 title frame | \`[160,191)\` | 31 |
| TPE1 artist frame | \`[191,206)\` | 15 |
| Complete ID3 tag | \`[0,206)\` | 206 |

The TXXX description is \`Parable 1,595,277,641\`; its value contains the Instar poem, with literal two-byte \`\\n\` sequences. The first MPEG-1 Layer III frame starts immediately at byte 206. Its header \`ff fb b0 64\` specifies 192 kbps at 44.1 kHz with no padding, giving a 626-byte frame \`[206,832)\`. **Byte 280 is 74 bytes inside this first audio frame**, not an ID3 field/frame boundary or MPEG frame boundary.

**Other source-defined byte structures.**

- **Twitter record starts:** every start is a multiple of 65. The starts surrounding 280 are 260 and 325; 280 is 20 bytes into the record \`[260,325)\`, not a record offset. The final record begins at 64,155 and contains 12 bytes.
- **Gematria JPEG markers:** the header segments occupy \`[2,20)\`, \`[20,89)\`, \`[89,158)\`, \`[158,177)\`, \`[177,210)\`, \`[210,393)\`, \`[393,426)\`, and \`[426,609)\`. The second DHT segment and its Huffman table occupy \`[210,393)\` and \`[214,393)\` respectively. Byte 280 is inside that table's data, not at a marker, segment, or table boundary.
- **XOR operands:** the historical operation starts at offset zero and consumes 64,167 bytes (the shorter Twitter operand); the MP3 is 4,010,732 bytes. Neither operand start/end nor the output length is 280.

**Decision.** No original ID3 frame, TXXX field, MPEG frame, Twitter record, JPEG marker/DHT table, or XOR operand boundary selects 280. The scalar remains a checksum/thematic identification of \`INSTAR\`; it is **not** a byte address or length in the historical 2013 chain. This closes only the scalar-280 byte-boundary interpretation. Do not change the origin, add an offset, or scan arbitrary file positions to rescue it. The wider p27→2013 XOR bridge remains closed for the independent type/operand reasons above; no LP2 plaintext or key is recovered.

**Reproduction.** [\`sims/lp2_p27_instar_280_byte_boundary_sft.cjs\`](../sims/lp2_p27_instar_280_byte_boundary_sft.cjs) validates the original MP3 SHA-256 and Git blob, reconstructs and validates the Twitter Git blob, requires exact recovery of the pinned Gematria JPEG, then checks all structures above. The existing [manual source-gate workflow](../.github/workflows/lp2-p27-761mp3-originaljpeg-xor.yml) downloads the two original binary objects and runs both the prior LP2 XOR control and this boundary test. The complete Node22 run passed: [GitHub Actions run 44415378803](https://github.com/FlareZ123/liber-primus/actions/runs/44415378803) completed the exact historical JPEG positive control, the existing p27/p53/p55 and p2 tests, and all scalar-280 boundary assertions.

## Candidate LP2 operands do not satisfy the type contract

### P27 13-rune survivor

Circumference shedding selects a 13-rune GP29 object. The historical receiver requires bytes. No original instruction says to encode each GP index as one byte, pack base29, use prime values, or use rendered rune bytes. Choosing any such representation would add a new operation.

### P50 twice-shed core

The p50 circumference construction yields a 112-cell token core. The tokens are printed two-character table values, not a historical byte string. #1641 already found no source-defined serialization or equal-length operand. The INSTAR word adds no conversion rule.

### P55 76-rune page

P55 is a GP29 rune string. Neither the 2013 XOR stage nor the p27 INSTAR checksum specifies a GP29-to-byte map, a 76-byte MP3 slice, or a reset point. Earlier title/OutGuess/ARC4 experiments are separate hypotheses and do not supply this missing contract.

## Existing exact XOR control

The strongest directly selected transfer has already been performed: original p27 `44.jpg` and other insect-related LP2 JPEGs were XORed byte-for-byte from offset zero with the preserved `761.mp3`, using the historical Twitter recovery as a positive control. The p27 output is high-entropy binary with no recognized file payload. Arbitrary shifts were correctly left unsearched because the historical operation starts at zero.

Thus even the one LP2 object that is already natively a byte string and visually linked to the Instar theme fails the exact historical receiver.

## Consequence

Close the direct p27-INSTAR → 2013-XOR bridge.

Preserve two facts:

1. p27's nested arithmetic has a strong **Instar/parabolic thematic correspondence** to the historical asset and solved p57;
2. the 2013 bytewise XOR is a real, reproducible Cicada-era operation.

They do not compose into an LP2 decoder without a first-party rule that fixes the target byte string and serialization. Reopen only if such a rule appears. Do not introduce GP-index bytes, base29 packing, MP3 truncation, arbitrary offsets, or generic audio steganography to force the composition.

Existing exact historical-operation reproducer: [`sims/lp2_p27_761mp3_originaljpeg_xor_sft.cjs`](../sims/lp2_p27_761mp3_originaljpeg_xor_sft.cjs).
