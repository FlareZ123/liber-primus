# Agent 18: authentic inversion controls

Claimed 2026-11-10T02:46:49Z, run 722901a9664237e49ea84df4.
The Critic 02:38Z broadcast identifies a missing actual-cipher end-to-end
benchmark; Agent 18 took this task.

## Established during this incarnation

- Added sims/solved_cipher_regression.cjs and
  im-results/solved-cipher-regression.md. The script was executed against
  the current canonical master via the JS evaluator: all asserts passed.
- From original LP1 A WARNING ciphertext, reverse GP produces 184 readable
  runes (45/45 published English words).
- From authentic LP2 p56 AN END ciphertext, prime-minus-one mod29 produces
  all 85 plaintext runes with one historical F interrupter at 0-based offset 56.
  All 25 English words match. Of all 32 subsets of 5 ciphertext F symbols,
  {56} is the unique exact match; without skip, 17/25 match.
- Exact re-encryption of LP2 p56 recovers the input. All original transcription
  section lengths and the 15,933-rune corpus total are asserted. The derived
  word parser ignores physical page and line breaks for word splitting.
- No claim of decrypting unsolved LP2 pages 0–55.

## Next research

Develop a bounded inversion with genuine GP word probabilities, exact original
word boundaries, and a held-out plaintext/key test; compare against the
synthetic same-key controls and evidence from independent LP2 page pairs.
Avoid repeating short affine feedback and already exhausted simple pad families.

See the report and source file for parameters and independent provenance.

## Follow-on: page28/page42 factor-four test, 2026-11-10

Authored and executed sims/relative_key_word_overlap.cjs with the actual
numeric corpus and original word boundaries. A 5,002-unique-word GP Shakespeare
training lexicon can satisfy only 2 of 24 simultaneous four-plus-rune
word-overlaps under a shared factor-four mod29 key at same rune offsets.
400 true shared-key heldout English controls with 81% simulated doublet
suppression have mean 14.0875 supported, min5, median14, max21; mean
13.33 word tokens absent from training lexicon; 0/400 as low as real.
The exact per-model tail fraction is 1/401, conditional on the model and
lexicon, and the pair/model were discovered on these pages. Therefore the
simple English interpretation of the statistical anomaly is weakened,
not independently disproved for an unknown language/encoding.
Consolidated im-results/page28-page42-relative-key-anomaly.md accordingly.

## New original image artifact: LP1 scan05

Owner-provided original ZIP contains original `05.jpg` SHA-256
`2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7`.
Exactly 673,066 bytes = 336,353-byte complete JPEG + 360-byte center +
reverse of the first 336,353 bytes. Center = 0A0A + 358 ASCII hex chars;
reverse *all* 358 hex characters, hex-decode ASCII -> 179-character
5x5 magic square of 25 numeric values. Every row/column/diagonal sums1033.
Agent13 prior mirrored-image report incorrectly identified last occurrence
of FF D9 as final JPEG end (thus treated first600366 as valid JPEG and
72,700 trailing bytes); new consolidation corrects actual structure without
invalidating its declared byte-window negative searches.
Script sims/jpeg05_palindromic_magic.cjs and documentation at
im-results/jpeg05-palindromic-magic-square.md, results/README.md.
