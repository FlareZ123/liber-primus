# Retired base-59 TINY/TEA false-path test

**Status: retired as a likely false path.** The arithmetic is reproducible only under noncanonical tokenization and a manually selected segmentation; it is not a source-authenticated route. No plaintext or TEA key was recovered. Preserve this as a bounded negative, not an active hypothesis.

## Why this branch exists

This was an exploratory post-selection prompted by a four-letter output. It manually split the signed 2016 body into three sections and used the noncanonical aliases `IO→IA`, `K→C`, and `V→U` to obtain 59-symbol counts. The canonical 2016 word-map analysis instead uses `IA` and obtains 61 symbols / prime sum 2781 for the complete 16-word instruction sentence. The source does not explicitly select this three-section split or a base-59 page/offset operation. The later 2017 warning has 45 GP symbols, so reusing 59 is an additional unsupported choice.

The selected rune names have initials **T-I-N-Y**. This is a striking possible pointer to the **Tiny Encryption Algorithm (TEA)**, but the inference depends on using rune-name initials rather than GP transliterations, and on carrying base 59 from the 2016 message into the 2017 message.

## Reproducible coordinate calculation

Use the existing GP mapping in `resources/liber-primus/lp2-corpus.json`, with the same tokenization conventions as `sims/2016_message_prime_layers.py`:

- `ING` maps to the GP `NG` rune;
- `IO` maps to the GP `IA` rune;
- `K` maps to `C`;
- `V` maps to `U`;
- ignore punctuation, spaces, and digits.

The raw (unadjusted) section sums are:

| Signed source section | GP symbols | Prime-weight sum | Base-59 coordinate |
|---|---:|---:|---|
| 2016, section 1 | 59 | 2999 | page 50, offset 49 |
| 2016, section 2 | 59 | 2819 | page 47, offset 46 |
| 2016, section 3 | 59 | 2581 | page 43, offset 44 |
| 2017 warning | 45 | 2131 | page 36, offset 7 |

The first three divisions are exact:
- `2999 = 50*59 + 49`
- `2819 = 47*59 + 46`
- `2581 = 43*59 + 44`

Reusing the 2016-established base for the 2017 warning gives:
- `2131 = 36*59 + 7`

Read the resulting LP2 coordinates using zero-based page and symbol offsets (consistent with the archived page numbering and corpus indexing):

| Source | LP2 page | Offset | Extracted item | GP index | Rune name |
|---|---:|---:|---|---:|---|
| 2016 §1 | 50 | 49 | byte 16 in the numeric table; maps directly to GP index 16 | 16 | Tir |
| 2016 §2 | 47 | 46 | GP rune | 27 | Ior |
| 2016 §3 | 43 | 44 | GP rune | 9 | Nyd |
| 2017 warning | 36 | 7 | GP rune | 26 | Yr |

The rune-name initials spell **TINY**. The direct GP transliterations instead read **T-IA-N-Y** (often rendered as “TIANY”), so the acronym interpretation is not forced by the transliteration alone.

The page-50 value is from `resources/liber-primus/base60-grid.json` at flattened byte offset 49 (row 6, column 1), whose value is 16. Pages 47, 43, and 36 are read from `resources/lp2-transcription.txt` / the corpus.

## Important ambiguity and counterevidence

1. **The 2017 base is not independently determined.** The warning contains 45 GP symbols. Dividing its sum by its own length gives `2131 = 47*45 + 16`, which points to page 47 offset 16 (Is), not page 36 offset 7 (Yr). The TINY reading specifically reuses the 2016 section length 59 as a shared radix.
2. **The rune-name initials are an interpretation.** The raw transliteration output is T-IA-N-Y, not an unambiguous English word. “Meaning is the road” could motivate rune names/meanings, but it does not explicitly say to take their initials.
3. **The 2014 signed stage-11 message is a mixed control.** Removing its onion URL (which contains Q, outside the GP alphabet) gives a GP sum of 2593; base 59 maps this to page 43 offset 56 (Ethel). The sum 2593 is also one of the p15 Fibonacci-prime values. This is a cross-round convergence, but the URL exclusion makes it unsuitable as a clean validation.
4. **A meaningful four-letter output is not itself a decryption.** The 2016 message warns against false paths; numerical coincidences and post-selected interpretations remain a serious risk.

## TEA test prompted by TINY

The TEA hypothesis has a plausible structural fit:

- LP2 page 50 is a 256-byte table arranged as 32 rows of 8 bytes: exactly 32 64-bit blocks.
- The p15 Fibonacci-prime spiral is a 4x4, 16-cell structure: the same byte count as a 128-bit TEA key.
- TEA's delta constant is derived from the golden ratio, while p15 is explicitly Fibonacci-prime material.

The existing `im-results/grid-tea-xtea-allkey-state-trace-exclusion.md` rejects the interpretation of the table as a literal TEA/XTEA round-state trace; it does not by itself reject the table as ciphertext.

I tested standard TEA and XTEA decryption of the 256 p50 bytes in natural row-major 8-byte blocks, with big- and little-endian word interpretations, using these source-derived candidate keys:

- the four raw 2016/2017 GP sums: `[2999, 2819, 2581, 2131]`;
- the F-adjusted 2016 sums plus 2017 sum: `[3001, 2819, 2579, 2131]`;
- the corresponding prime indices: `[431, 410, 376, 321]`;
- p15 displayed values, Fibonacci-prime values, and Fibonacci ranks reduced modulo 256 (spiral and matrix orderings);
- p15 row/column-sum keys;
- 2014 magic constants, the PGP key ID/fingerprint-derived keys, and first/last 16-byte halves of the two documented 2013 onion-cookie hashes.

I also tried a limited CBC set with message-sum keys and p15-derived IV candidates, plus four-word candidates derived from the Fibonacci-gap primes `[79, 149, 263, 2593]` and their ranks `[22, 35, 56, 378]`. None produced a recognizable header, readable plaintext, or a language-like output. These tests reject those direct key constructions, not every possible TEA-derived construction.

## Current decision

Retire this branch. The noncanonical tokenization, manual section split, 2017 radix reuse, and rune-name-initial extraction are not source-selected; the direct TEA key candidates also failed. Do not spend further compute on TEA or this coordinate mapping unless an independent original clue fixes the segmentation, radix, rune-name operation, and key/IV. The direct candidate keys above have already failed.
