# LP2 p19 OutGuess 331 candidate versus the first-difference stream

**Classification:** bounded negative / exploratory source-key test. No plaintext or key recovered.

## Candidate and motivation

The existing candidate record for original LP2 physical page 19 (image `resources/liber-primus/36.jpg`) lists a source-motivated OutGuess passphrase `331`, derived from the 2014 Onion7 index's `div id=331`. Its recorded decoded header is `3d11e032`, seed 4413, declared payload length 13,024, and whole-payload SHA-256:

`c80708534c9e255e4261557025b6ae086b10843a7a0b3ac396c7c3b063de6180`.

I independently reran the repository's source-faithful extractor (`sims/outguess_bitmap_dump.c` and `sims/outguess_extract.py`) against the original image and recovered the same 13,024 bytes and SHA-256. This confirms the extraction, not that the payload is an authored message; the existing candidate record reports no recognized file magic or valid OpenPGP packet.

## Length-alignment hypothesis

The OutGuess output contains a four-byte decoded header, leaving 13,020 data bytes. Removing a 65-byte prefix leaves exactly 12,955 bytes, equal to the number of first differences in the canonical 12,956-rune LP2 ciphertext:

\[
D_i=(C_{i+1}-C_i)\bmod29.
\]

This prompted one bounded test of the suffix as a 28-symbol step/key stream:

\[
K_i=(\text{payload}[69+i]\bmod28)+1.
\]

The 65-byte prefix did **not** equal SHA-512 of the suffix, either as bytes 0–63 or bytes 1–64. No authenticated header/checksum relationship was found.

## Results

- Direct equality between the observed difference stream and the candidate 28-symbol stream: **527 / 12,955** matches (4.07%). The chance baseline conditioned on the observed 12,869 nonzero differences is approximately **459.6 / 12,955** (3.55%). The best affine relabelling of the 28 symbols among 336 maps gives **532 / 12,955** (4.11%). This modest excess is not a key recovery and is not treated as evidence: the payload and target originate from the same manuscript image family, and the 65-byte alignment was selected after observing the lengths.
- Treating the candidate as an additive pad on the difference stream, both signs produce random-like output. For D−K and D+K, IoC is **0.03452** and **0.03450**, respectively; trigram log-likelihood is **−12.3028** and **−12.2801** per character.
- Integrating the candidate-decrypted differences over all 29 possible initial runes also produces no language. The best trigram scores are **−12.2204** and **−12.1990** per character for the two signs, with IoC approximately **0.0345**.

## Critical qualification: the length is not independent evidence

The later [universal OutGuess header analysis](lp2-outguess-universal-header-artifact.md) establishes that all original LP2 images force the same encrypted four-byte header `ffffffff`, regardless of password. The decoded seed and length therefore depend on the passphrase, not on an independently recovered image payload. The 13,024-byte length is consequently not independent evidence that the image contains a 12,955-byte key plus 65 bytes of metadata. The apparent 65-byte alignment is a post-hoc fit, not a source-authenticated file structure.

This is distinct from the 16 × 58,152-byte OutGuess direct-pad family already tested in [the original direct-pad report](outguess-lp2-original-directpad.md). It does not overturn that result or authenticate this shorter candidate.

## Decision

Do not promote the p19/331 extraction to a keystream or continue generic OutGuess-pad/PRNG transformations. The only tested, source-motivated 65-byte-prefix/suffix alignment fails direct comparison and additive plaintext recovery; the apparent length match is explained by the universal header artifact. Revisit only if an independent clue specifies a different, reproducible relation between this payload and LP2 plaintext.

**Reproduction inputs:** `resources/liber-primus/36.jpg`, `resources/liber-primus/lp2-corpus.json`, `sims/outguess_bitmap_dump.c`, `sims/outguess_extract.py`, and the candidate metadata in `cicada2014-onion7-p19-outguess-candidates.json`.
