# Four Parable-number offsets as raw-XOR starts for the p50 256-byte table

**Status: completed — bounded negative.** This is a fixed, source-motivated test of the historical 2013 XOR operation, not a general offset search.

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

## Result

The historical Twitter-stream XOR control remained intact. The four p50 XOR outputs had no leading file magic or JPEG structure and no intelligible text. Their metrics:

| Offset | Candidate SHA-256 | Printable | Unique bytes | Entropy |
| ---: | --- | ---: | ---: | ---: |
| 761 | 9989f9adc48158e898b64149a8baf66db420d34b8c12473967c0a9d0547d6a82 | 0.3828 | 160 | 7.1673 |
| 1031 | ecb465a346cf4a906f7f8af8c6fe6f842df05c6067685de8084a28d23b5701c1 | 0.3398 | 164 | 7.1820 |
| 1229 | 0c377c55dca3ed75b34581d97a66dc6e09298e4c38205b5493d22c1ee7dd5d99 | 0.4297 | 162 | 7.1560 |
| 1259 | 1ddfe9161f613021f0a70bec9eaa94be9ec3cb0c3bbaab2450502efaee1295ab | 0.4023 | 168 | 7.2389 |

Offsets 761 and the previously tested 809 both begin with 16 zero bytes in the MP3; the full file contains 436 overlapping 16-byte zero windows. The two candidates' matching first16 is therefore not a payload signal. Both positions lie in the first MPEG audio Info/LAME frame (bytes 206–831).

**Decision:** retire direct raw XOR of the p50 table at these four exact positions. This does not rule out other source-selected audio transforms or targets. [Updated SFT](../sims/761_mp3_xor_p50_gate.cjs) · [workflow run 45411648349](https://github.com/FlareZ123/liber-primus/actions/runs/45411648349).

## Scope

A negative does not rule out use of 761.MP3 as a key stream under a different source-selected transform, another target, or a page/line-reset receiver. The existing historical XOR control validates the audio source and primitive, not the assumption that p50 is an XOR ciphertext.
