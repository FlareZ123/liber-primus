# Authentic solved-cipher regression on the original manuscript

**Classification: genuine positive historical regression.** This test reconstructs
two previously solved Liber Primus texts directly from ciphertext in the shared
canonical transcription. It does not decrypt any LP2 pages 0–55.

The runnable implementation is [solved_cipher_regression.cjs](../sims/solved_cipher_regression.cjs).
Run with Node.js from the repository root; no dependencies or automated Actions
workflow are required.

## Reproduced ciphers

| Original scan / LP section | Mechanism | Authentic input | Verifiable recovery |
|---|---|---|---|
| 01.jpg, LP1 A WARNING | Reverse Gematria Primus, P = 28-C (mod 29) | 184 original runes | 45 of 45 known words match |
| 73.jpg, LP2 p56 AN END | Prime totient stream, P = C-(prime_j-1) (mod 29), with unencrypted F | 85 original runes | 25 of 25 known words match |

All indices use the canonical 29-rune futhorc in the committed transcription.
The test asserts all 18 segment rune totals and 15,933 runes globally. Physical
line and page markers are removed **before** splitting word tokens, to avoid
the 2,928-fragment/2,896-word bug found in previous investigations.

For AN END, the five F ciphertext symbols occur at zero-based rune offsets
35, 47, 51, 56, and 74. The known plaintext word OF identifies the F at offset
**56** as the historical interrupter. It is copied unchanged and **does not
consume a prime**. Exhaustively checking all 32 skip subsets, only {56}
produces a 25/25 known-English-word match. The no-skip decoder produces 17/25.
A prime stream starting at the second prime fails. Re-encrypting the recovered
85 runes reproduces the input exactly.

The known English is checked word by word against actual decoded rune indices,
including accepted GP spellings (TH, C/K, U/V, NG, and other digraphs). This
regression uses the already-published plaintext to locate the F interrupter;
the 32-mask experiment is not blind key recovery. It is a calibration tool for
later unsolved-page key inversions.

## Inputs and provenance

The original images are resources/liber-primus/01.jpg and 73.jpg (73 is LP2
page 56). The rune inputs are from
[resources/transcriptions/liber_primus_master.txt](../resources/transcriptions/liber_primus_master.txt),
imported from the community-canonical text (upstream Git blob SHA
ba553b1d43bc491a1bab66ebd02534249263ae90).

Independent prior descriptions and source tests:
- [Wulfic historical solved methods](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/tools/lpcore/solved.py)
- [Wulfic cipher primitives](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/tools/lpcore/ciphers.py)
- [Wulfic canonical corpus test](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/tests/test_lpcore.py)

The executable's essential role is to reject accidental changes in rune
ordering, keyword/stream direction, alphabet transliteration, skip position,
or word boundary treatment before applying more ambitious inversion algorithms.
