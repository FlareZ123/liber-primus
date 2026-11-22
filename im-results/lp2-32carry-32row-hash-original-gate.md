# The 32 LP2 page-carry words do not provide direct eight-byte hash preimages for the 32 numerical rows

**Evidence class, 18 November 2026:** a bounded negative against common unsalted 64-bit word-digest interpretations of the original LP2 table. This is a source-constrained candidate for obtaining word plaintext and a reproducible direct inverse test, rather than a discovered cipher/key. **No original unknown-page plaintext, table key, or final destination has been recovered.**

## Why this exact test is possible

The original 2014 LP2 has 55 unsolved rune-bearing physical pages, one runeless grid page, 12,956 ciphertext GP29 runes and 2,896 printed whole words. The physical typesetting splits **exactly 32 complete rune words** across adjacent page turns. A page turn is not a word delimiter; original hyphen, period and section marks terminate words, while line and page wraps do not. The source text and numerical grid are under `resources/lp2-transcription.txt`, `resources/liber-primus/lp2-corpus.json` and `resources/liber-primus/lp2-grid-256.json`. The table has **32 rows of eight original two-character numbers** (256 cells); conventional base60 produces one byte per cell.

This motivates the specific, falsifiable hypothesis that each 64-bit table row encodes a digest of the **corresponding original cross-page word** or a hidden English plaintext word. A cryptographic digest is a reasonable candidate in a puzzle whose solved p56 explicitly specifies SHA-512, although the manuscript supplies **no instruction** to hash page-carry words or truncate to eight bytes. The matching number 32 was recognized retrospectively and is not proof that the rows are word hashes. An authentic preimage would have yielded a concrete testable word crib.

## Exact original-input tests

The new [standalone standard-library Python SFT](../sims/lp2_32carry_32row_hash_original_sft.py) reconstructs the 32 carried words from the full 2014-layout rune transcript; asserts **2,896** total words and **12,956** unsolved runes; and checks that the table contains 32 eight-byte rows. The script uses these ten fixed historical/common digest algorithms:

`MD5`, `SHA-1`, `SHA-224`, `SHA-256`, `SHA-384`, `SHA-512`, `SHA3-256`, `SHA3-512`, `BLAKE2b`, `BLAKE2s`.

Each digest is tested by its first or last eight bytes, with printed or reversed byte order. The original row index and the reverse row index are each tried as fixed, non-scanned orientations. Ciphertext-word encodings are rune UTF-8 glyphs, upper/lower GP transliteration, numeric GP ordinal bytes, GP prime bytes, comma-separated ordinal decimal text and decimal word-prime sum. **Zero exact matches** were found across all 32 ciphertext words and these representations.

For a more consequential preimage test, the SFT checks the fixed repository `resources/control/english_wordfreq_textblob.txt` lexicon for plausible source English *plaintext* words. It encodes each candidate in seven conventional forms (upper/lower literal English, upper/lower GP transliteration, rune UTF-8, GP ordinal bytes and GP prime bytes), while restricting to the actual GP word lengths of the 32 carried words. **27,558 candidate words** passed this GP-length constraint, yielding **192,906 encodings** and **1,929,060 digest computations**. For this dictionary stage, **any** of the 32 source rows can match a leading/trailing eight-byte digest in either byte order. This more permissive test also returned **zero matching words**. A deliberate `SHA512(PILGRIM)` first-eight-byte positive control passed, demonstrating that the candidate encoding and digest comparison can recover a planted known GP word.

The exact original source SFT passed in [Windows Python 3.11 GitHub Actions run #44335111342](https://github.com/FlareZ123/liber-primus/actions/runs/44335111342) on **18 November 2026**, including all source-size assertions and the planted control. Its minimal [manual workflow](../.github/workflows/lp2-32carry-32row-hash-manual.yml) permits independent reruns.

## Decision and remaining escape routes

The tested eight-byte rows are not straightforward leading/trailing digests of the **32 original ciphertext words**, and the pinned source-English candidate lexicon provides no ordinary plaintext word preimage for any row under the tested encodings. This removes an attractive direct route to 32 authenticated word cribs, without eliminating salted/keyed hashes, other source strings, non-standard compression, a different numerical radix, or alternative uses of the 32×8 grid.

A new attempt should require an independently legible 2014-era author-selected word-to-row operation or candidate preimage. Repeating unsalted digests with more word spelling variants, arbitrary row offsets, salts or unknown high-entropy keys without such an instruction has no clear causal path to recovering an original LP2 paragraph. No claim about the actual cipher architecture follows from this negative.
