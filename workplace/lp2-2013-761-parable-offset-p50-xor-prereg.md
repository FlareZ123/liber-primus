# Four Parable-number offsets as raw-XOR starts for the p50 256-byte table

**Status: preregistered, pending execution.** This is a fixed, source-motivated test of the historical 2013 XOR operation, not a general offset search.

## Source and hypothesis

The 2013 761.MP3 ID3 TXXX field gives the Parable number 1,595,277,641 = 1259×1031×1229. These three primes are the GP-prime sums of the three body clauses on solved LP2 p57. The audio title THE INSTAR EMERGENCE has GP-prime sum 761. The original 2013 puzzle demonstrably used the raw 761.MP3 byte stream as an XOR operand to recover the Twitter-stream JPEG.

Hypothesis: one of these four source-derived values is a literal zero-based byte offset into the complete MP3, and the same raw XOR primitive may expose a second payload from the 256-byte p50 table.

## Fixed experiment

- Cipher input: canonical 256-byte p50 table, resources/liber-primus/lp2-grid-256.json.
- Pad: original 761.MP3, complete file including ID3; 4,010,732 bytes; SHA-256 83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460.
- Operation: p50[i] XOR MP3[offset+i].
- Exact offsets: 761, 1031, 1229, 1259; zero-based from the beginning of the full file.
- Preserve the historical Twitter-stream XOR positive control and the already tested offset-0, ID3-payload and p22-derived-809 comparisons.
- Evaluate the four outputs for recognized file signatures/JPEG structure, printable text, byte uniqueness, entropy and exact bytes. Also report whether any candidate begins with an all-zero 16-byte pad run and count such runs across the full MP3; this is a structural diagnostic only, not an extra key-selection rule.
- No one-based variants, neighboring offsets, arbitrary phase search, additional reducers or fitted transformations.

## Decision rule

A meaningful positive requires a recognized file object, independently intelligible plaintext, or a reproducible structured payload with a source-supported next operation. A high-entropy/random-looking 256-byte result, printable fragments or numerical coincidences are not a positive. If all four outputs lack such structure, retire only this direct raw-XOR p50 receiver for these four exact positions. Do not expand to adjacent offsets.

## Scope

A negative does not rule out use of 761.MP3 as a key stream under a different source-selected transform, another target, or a page/line-reset receiver. The existing historical XOR control validates the audio source and primitive, not the assumption that p50 is an XOR ciphertext.
