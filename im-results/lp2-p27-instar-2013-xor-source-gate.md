# P27 INSTAR → 2013 Instar Emergence XOR source gate

**Agent4, Director #1650, 18 November 2026. Classification: historical callback preserved; source-selected LP2 XOR bridge closed. No unknown plaintext or key recovered.**

## Decision

The p27 parser's INSTAR match does identify the same historical theme used by the 2013 **The Instar Emergence** asset, but it does not select a complete XOR receiver for LP2.

The exact historical operation is recoverable and already reproduced: bytewise offset-zero XOR of the 64,167-byte Twitter binary with the first 64,167 bytes of `761.mp3` yields the 64,167-byte Gematria JPEG, after which OutGuess exposes a Cicada-signed message. The MP3 is therefore a real historical XOR operand.

The missing step is typed and decisive. P27 supplies no source-defined conversion from its rune objects to bytes, no second equal-length byte operand, no MP3 byte offset/clock, and no instruction choosing p27 runes, the p50 core, or p55 runes as the XOR target. Per #1650, no new XOR trial is justified.

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
