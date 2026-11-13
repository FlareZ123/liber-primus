# Original LP2 word-length order as an exact combinatorial binary transport

**13 November 2026, Agent 9. Classification:** independently executable original-input negative for *direct* file/message recovery under a source-motivated numeric side-channel; original word-length permutation capacity established exactly and a planted 991-byte PGP-armor file recovered. **No unknown LP2 plaintext, authentic key, cryptographic mechanism or destination recovered.**

## Cryptanalytic rationale and source-visible input

The independently signed January 2016 Cicada clue says Liber Primus's words are the map, their meaning the road, and their numbers the direction ([verified signed payload](../resources/cicada2016-4gq25.md)). A simple alternate reading is that the *order of printed word lengths itself* holds a binary file, with its almost natural-language length inventory serving as a constrained alphabet. This differs from unsuccessful substitutions of ciphertext rune glyphs. A historical solver could count word lengths and sort the known multiset, but the clue does **not** specify permutation ranking, byte endianness, or the existence of an embedded binary stream. Those are the weakest premises.

The source is the unchanged [Liber Primus master transcription](../resources/transcriptions/liber_primus_master.txt), independently matched **rune-for-rune against all 12,956 unknown GP29 symbols** in the [canonical page corpus](../resources/liber-primus/lp2-corpus.json). The correct parser joins physical-page and printed-line wraps inside words, preserving real hyphen/dot/paragraph delimiters. Its **2,896** original complete words have the following multiset, in GP rune lengths 1 through14:

`[83,448,720,513,317,256,216,156,78,52,32,18,4,3]`.

The nine source-visible chapter cuts at global rune offsets `729,1874,3603,5506,6527,7960,9640,12648,12956` are *all between* complete words. Their word counts are `[158,255,383,437,224,326,378,669,66]` and rune counts are `[729,1145,1729,1903,1021,1433,1680,3008,308]`. This independently reproduces the prior source census ([marginals and word grammar](lp2-wordlength-sidecar-marginal-gate.md)); the new result is an actual, exact permutation-rank decoding of the full original sequence. The whole-book exact permutation entropy is **log₂(W) ≈ 8,791.8759 bits**; its fixed unsigned integer representation requires 8,792 bits, permitting an arbitrary 991-byte payload but not every arbitrary 1,099-byte payload.

## Reversible candidate and untouched outputs

For an observed ordered multiset `x[0..n-1]`, let `c[v]` count each length and `W=n!/product_v(c[v]!)` be the number of possible length orders. Its unambiguous lexicographic rank `R` is obtained by summing the sizes of all lexicographically earlier remaining-prefix blocks. With `n` symbols remaining and `M` remaining permutations, the block under next length `v` has exactly `M*c[v]/n` possibilities. Every arithmetic operation here uses **exact BigInt integer division**; the inverse *unrank* reconstructs every original length identically and preserves all counts.

Serialize `R` at the fixed mathematical width `ceil(bitlength(W−1)/8)`. Test one whole-book stream and each of nine original chapters; for each, use printed or reversed word order, increasing or decreasing original length-label order, and big- or little-endian bytes. This produces exactly **10 × 2 × 2 × 2 = 80** canonical, reversible readings. No guessed byte shift, key, interpolation, reranking around an English target, or altered page boundary is introduced.

| Original source span | Words | Rank width (bits) | Fixed bytes | First 16 bytes, printed/increasing/big endian |
| --- | ---: | ---: | ---: | --- |
| Entire LP2 unknown | 2,896 | **8,792** | **1,099** | `d7758df1640a621ac9d8f75d38a08131` |
| p0–2 | 158 | 461 | 58 | `0f40367a9561dc41afc2146268f67a95` |
| p3–7 | 255 | 734 | 92 | `067083ac4b329748f282edfb7248e175` |
| p8–14 | 383 | 1,136 | 142 | `9794de0724a8ab8911d0c7aa7ddf3d4c` |
| p15–22 | 437 | 1,291 | 162 | `03e4cdde8eb75c6a354b3a235143478a` |
| p23–26 | 224 | 644 | 81 | `01c99d8bb53775b44322856560257bd7` |
| p27–32 | 326 | 958 | 120 | `0fa1c422a2778b539da29bc501c2bfbe` |
| p33–39 | 378 | 1,107 | 139 | `00bc18f9ba3f71f988771d6dd4f958e8` |
| p40–53 | 669 | 1,976 | 247 | `372f5e65297f3fe7e9a5cb0d975d396e` |
| p54–55 | 66 | 181 | 23 | `008025c57ac10b43648fde5f01e7e558` |

**Original outcome: zero recognizable file/messaging headers across all 80 readouts.** The frozen recognizer checks prefixes for PGP clear-sign armor, ZIP, gzip, bzip2, xz, PNG, PDF and Ogg. The principal whole-book candidate's ordinary printable fraction is **0.36488**. Neither the natural original output nor its whole-book reversals looks like an unencrypted file or signed message. The result is precise for **fixed-width direct rank**, never a proof that no compressed, encrypted, framed or different combinatorial sidecar exists.

## Explicit inverse-positive with historically plausible binary payload size

The actual 2014 Cicada three-OutGuess-share XOR reconstruction yields a **991-byte signed message**, so a 991-byte payload is a realistic detection benchmark, without assuming that its original text is carried in the LP2 lengths. Take a fresh 991-byte planted sample beginning with `-----BEGIN PGP SIGNED MESSAGE-----`, followed by a known control body. Interpret the complete 991-byte sample as a nonnegative big-endian integer and apply the **same original 2,896-length multiset** to `unrank`. Then `rank` of that new length order recovers the **original 991/991 bytes exactly**, and the same header detector positively recognizes PGP armor. The planted permutation preserves the full original length histogram. This validates all necessary ranking, decoding, losslessness and format checks, and demonstrates genuine recovery power for this architecture.

The [single-file CommonJS reproducer](../sims/lp2_wordlength_multiset_rank_binary_sft.cjs) asserts original 2,896/12,956 source identity, all nine chapter boundary inventories, 80 completed source readings with zero headers, the original full rank's first16 bytes, and the exact 991-byte reversible positive plant. It passed independently on the original GitHub checkout under Node 22 in [manual GitHub Actions run 43392640268](https://github.com/FlareZ123/liber-primus/actions/runs/43392640268), step “Exact LP2 original-word-length multiset-rank binary gate”.

## Decision and next genuinely different route

**Do not interpret word-order combinatorial entropy itself as proof of hidden data.** An arbitrary shuffle of language-like lengths already has a high-entropy lexicographic rank. This test rules out an uncomplicated fixed-prefix original file under the eight source-native readouts per original visual span. Neither the original 2016 signed message nor the original printed words specify a *combinatorial rank* or a subsequent decryption key, and no unknown ciphertext rune has been deciphered.

Further work should require an independently selected *consumer or framing* for these exact numbers, such as an authenticated instruction to apply a particular existing binary key to the recovered rank. Scanning unrelated offsets, guessed passwords and arbitrary format decompression merely rescues a failed premise. A separate original-linked route could instead treat word lengths as a reordering key for **ciphertext runes**, which this binary-rank test explicitly does not cover and would need its own source-selected traversal plus holdout plaintext.
