# LP2 page 53 red-suffix-derived key experiment

**Classification: bounded negative; no recovered key, plaintext, or destination.** Agent 36, 2026-11-10. The input is the original LP2 page 53, archive `70.jpg`, whose final 50 runes are printed in red immediately after a red upward arrow; the grid is LP2 pp49–51 (`66.jpg`–`68.jpg`). Color segmentation is fixed using the image and the shared numerical corpus, not inferred from a favorable decryption score.

## Attack rationale and frozen inputs

The 50 red runes are a conspicuous, explicitly delimited candidate for a cryptographic secret. Fifty digits in radix 29 carry at most 242.899 bits, close enough to the scale of a 256-bit secret to motivate a finite and direct key-interpretation test. The upward arrow motivates testing reversed order. This is a *hypothesis*, not an established key instruction.

Using the repository's `resources/liber-primus/lp2-corpus.json`, page53 has 179 rune indices; 129 are black and the **last 50** are red. Its 50-rune red suffix in the reproducible alphabet `0123456789ABCDEFGHIJKLMNOPQRS` (index 0 to 28) is:

`D7CF7HC2986B4RNR2OACPEKCSROB842DNBL360CJ58N3G514D9`.

Tested candidate source spans are the last 50, last 53 (the three black runes immediately preceding red included), last 56, and all 129 black runes. For each, test forward/reversed and three 256-bit byte derivations: (a) base-29 integer interpreted big-endian and truncated to its low 256 bits; (b) SHA-256 of raw 0–28 rune indices; (c) SHA-256 of the ASCII alphabet encoding above. This yields **24** keys. No independent key-authentication evidence supports one derivation over another.

## Bounded direct cipher tests

**Periodic additive pad.** Repeat each of the 50-, 53-, and 56-index candidates under both directions, all cyclic phases and both additive signs on concatenated LP2 pages52,54,55 (571 runes). Total **636** configurations; raw ciphertext index of coincidence is **0.03407380096**. The maximum deciphered IoC was **0.03624911666** (56-digit candidate, reversed, phase3, positive sign). There is no English-like concentration or readable recovery.

**AES-256-CTR rune pad.** For each of 24 keys, use six fixed IV choices (all-zero, page number big/little endian, page ordinal, 3301, 2014), two synchronization models (one continuous stream or page reset), three byte-to-GP-index mappings (mod29, reject byte values 232–255 then mod29, or floor(29*b/256)), and two signs. This produces **1,728** settings on the same 571 original ciphertext runes. Highest IoC: **0.03640888561**, using SHA-256 of the reversed 50-character ASCII representation, page-ordinal IV, page reset, scaled-byte mapping, positive sign. No plaintext recovered. The script includes a complete 256-byte AES encryption/decryption positive control.

**Direct AES-256 decryption of the 256-byte base-60 grid.** For each key, five matrix readouts (printed row-major, each row reversed, whole array reversed, column-major, alternating serpentine), five IV choices where relevant (zero, first or last 16 grid bytes, first 16 key bytes, integer 3301), and ECB/CBC/CTR/OFB/CFB decryption give **2,520** configurations. Best candidate yields **120/256** printable ASCII bytes, and a separate maximum of **44/256** low-range GP-index bytes (0–28). Both are consistent with a search over random-like outputs; neither is a legible message, recognizable key structure, or cryptographic authentication.

These tests deliberately do not search altered runic transcriptions, non-AES ciphers, mixed ciphertext/visual steganography, unknown nonlinear outer alphabets, page-specific key derivations, ciphertext-dependent key skipping, or every imaginable format. Since the strongest figures are selected maxima over hundreds/thousands of settings, no nominal significance should be assigned to them.

## Implication

The red suffix currently offers no evidence for **direct** repeated modulo-29 pad use or these particular AES-256 encodings of a nearby manuscript key/table. Treat it as an unproven key clue and redirect attention toward an independently specified readout, cryptographic relation, or actual decrypted interval instead of extending a generic key-serialization grid search.

**Reproduction:** Node.js CommonJS `sims/red_marker_key_probe.cjs`, using the two committed JSON resources. The exact source positions, key variants, AES modes, IVs, mappings, scoring metrics, model counts and top candidates are emitted by the script. Cryptographic primitives use Node's built-in `crypto` implementation.
