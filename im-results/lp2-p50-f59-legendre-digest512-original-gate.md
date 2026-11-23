# Base59 quadratic-character p50 numeral glyphs do not encode the solved p56 digest

**Original-source conditional negative, 23 November 2026.** The unchanged 32×8 printed two-glyph numerical table spans LP2 pp49–51, supplying exactly **512 visible digit glyphs**. The independently solved p56 contains a **512-bit hash** of an unknown deep-web page. A *specific finite-field suggestion* makes these two widths directly compatible: delete the unprinted lowercase `f` from the conventional 60-character numeral alphabet, leaving **59 digit symbols**, and use the canonical quadratic character in `GF(59)`. Since **59−1=2×29**, the group of nonzero squares has exactly **29 elements**, matching the Gematria Primus rune alphabet size. These exact facts motivate one arithmetic operation that is different from the previously tested low-digit two-bit planes ([#868](https://github.com/FlareZ123/liber-primus/issues/868)).

This does **not** establish that the creator intended base59, finite-field arithmetic, a hash transport, or that the separate p56 digest is calculated from any manuscript material. The rival explanation is an unrelated original table and a hash of inaccessible external bytes.

## Frozen original-input experiment

Use the 256 exact printed two-character cells in source row-major order, first glyph then second glyph. The proposed codebook is exactly `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx` (base60 with lowercase `f` deleted). For each of the 512 printed **digit indices** `d∈0..58`, output a single bit **1 if `d` is a nonzero quadratic residue modulo59** and **0 otherwise**, including for `d=0`. Serialize these bits in physical glyph order against the complete already-solved p56 hex digest, standard hex MSB-first. No alternate direction, phase, rotation, complements, key, low-bit selection, or plaintext fitting is allowed.

The 512-bit target is the established p56 digest:

```text
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

## Entire source result

The rule extracts **512 bits** from all 256 unaltered source tokens. **259 bits are ones**. They agree with exactly **254/512** target bits and disagree at **258/512**, the first disagreement at offset0. Consequently this exact one-bit-per-glyph original transport is **not** p56's 512-bit digest. The score is essentially chance under an independent-bit comparison; it cannot be used to claim an intermediate header or key.

A positive full-length control creates 256 legal two-glyph base59 cells using digit1 for a residue bit and digit2 for a nonresidue bit; the same decoder recovers all **512/512** predeclared target bits. Each planted cell remains a legal unsigned-byte codeword, so the original failure cannot be ascribed to a wrong bit order in the implementation or an impossible planted format.

**Read-only complete source reproducer:** [CommonJS SFT](../sims/lp2_p50_f59_legendre_digest512_source_sft.cjs). It asserts original row counts, the conventional-base60 corpus byte digest, all source codewords' validity under radix59, original solved p56 rune count, target digest, the 29 square residues and full planted invertibility.

**Research decision:** reject this literal 59-field quadratic-character **table→p56-digest** channel, without extending it to a permutation/complement/feedback search. The equality `59−1=2×29` remains a mathematical possibility for a different 29-symbol source interface, but no first-party opcode or independently authenticated typed receiver selects it. No unknown LP2 rune was decrypted.
