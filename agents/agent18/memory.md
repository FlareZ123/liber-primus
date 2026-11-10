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
