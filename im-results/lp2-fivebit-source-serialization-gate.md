# Source-fixed five-bit GP29 serialization of all original unknown pages

**Agent 49, 11 November 2026. Completed bounded payload test for Director Issue #276.** The two natural original-source encodings below produce high-byte-entropy streams without an authenticated standard file/container payload. No unknown plaintext, key, or decoder was found. This does not exclude ciphertext encoded in five-bit symbols; it retires only the proposed *immediate standard binary payload* reading.

## Frozen source-derived representations

The original manuscript uses 29 canonical rune values and prints 2,896 words over 12,956 unknown runes. A five-bit register can encode the 29 values 0–28, and a word delimiter can be represented as code 29. The authenticated 2013 BASE29 command makes 29-digit arithmetic historically accessible, but does **not** prescribe five-bit packing.

Exactly two representations were declared before decoding:

1. **Runes only:** the 12,956 GP29 indices in the physical original page sequence, with no page/line/word sentinel.
2. **Runes with printed words:** the same indices, adding **one code 29 between each consecutive pair** of the 2,896 canonical words (2,895 separators), with no leading or trailing separator. Printed line breaks and page carries do not themselves create words.

Both use continuous five-bit **MSB-first** values, packed into byte order from the first rune onward, with only final zero pad bits permitted. No alternative bit order, alphabet remap, phase, reset, offset search, XOR, key, or compression guessing is allowed.

The word parser reproduces the existing [canonical original word contract](../sims/lp2_word_pages.cjs): source `resources/lp2-transcription.txt` joined over the 55 rune-bearing unsolved pages, `/` and whitespace as printed wrapping, and nonrune punctuation as word breaks. All concatenated word-rune values match the independent 12,956-value [source corpus](../resources/liber-primus/lp2-corpus.json) exactly.

## Actual fixed outputs

| Measure | Runes only | Runes plus code29 word breaks |
| --- | ---: | ---: |
| Input five-bit symbols | 12,956 | 15,851 |
| Input bits | 64,780 | 79,255 |
| Packed bytes | **8,098** | **9,907** |
| End zero-pad bits | 4 | 1 |
| Distinct output byte values | 255 | 255 |
| Empirical byte entropy (bits) | 7.905847 | 7.878064 |
| Printable-ASCII fraction | 0.400963 | 0.364793 |
| Longest contiguous printable-ASCII run | 9 | 9 |
| Leading 16 bytes (hex) | `7a24334f607ea5528966c81761a44991` | `7a24334f60ebf52a97a259b3d02edd1a` |
| SHA-256 | `18cff7fcdd3b33c8f8c33156e18de8784a8ef7cfce1e74963a1a3e08b59b3591` | `42382165b2a4bdd94c62f90a564354e9c80046aa124c70ecb2ac0c75ff2736e1` |

The bit-exact unpacker recovers the original values from both packed streams and additionally passes a native-GP planted control derived from the authentic solved p57. The digests above were independently computed from the original GitHub corpus/transcription and the fixed bit-packing specification.

Neither stream begins with any checked standard file/container signature (PNG, JPEG, GIF, ZIP, gzip, bzip2, xz, 7zip, PDF, ELF, SQLite, Ogg, RIFF or Zstandard). Both fail checksum-validated wrapped zlib/gzip decoding. The opening byte `0x7a` is not a valid OpenPGP packet tag, and the outputs lack any immediate recognizable self-describing container header. These observations are finite and do not exclude encrypted, custom or nested formats.

## Decision and reopening condition

**No standard binary payload is identified** by either original-source five-bit serialization. The remaining missing input is an original clue specifying a following transform, file format, or key. Searching arbitrary bit offsets, codebooks, compression heuristics, or source pads would turn two motivated tests into unconstrained extraction hunting. Stop this branch unless a new independent source explicitly selects one such operation.

**Reproducer:** [`sims/lp2_fivebit_serialization_sft.cjs`](../sims/lp2_fivebit_serialization_sft.cjs) reads original source datasets, verifies the 2,896-word/12,956-rune contract, validates a solved-p57 native plant, byte-packs/unpacks both fixed streams, checks exact SHA-256, recognized magic bytes and wrapped zlib/gzip, and prints the metrics. It needs only built-in Node.js modules and makes no file changes.
