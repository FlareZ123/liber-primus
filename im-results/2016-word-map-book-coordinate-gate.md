# 2016 word-map to 2012 book coordinates: bounded negative

**Status:** The direct, source-frozen mapping tested here does not recover plaintext. This is an exploratory exclusion, not an established LP2 result.

## Human solve-path hypothesis

The 2016 PGP-signed message says, “Its words are the map. Their meaning is the road, and their numbers are the direction.” Earlier Cicada stages used book-coordinate ciphers, and the 2013 `0_wisdom` material demonstrates mapping GP words to prime sums. A plausible human attempt is therefore:

1. Treat each LP2 word (or each of the 43 words in the signed 2016 message) as one coordinate.
2. Set the book line to the sum of the word's Gematria Primus prime values.
3. Set the character column to the word's GP-rune length; test the expanded A–Z transliteration length as the only natural alternative.
4. Extract that character from a known Cicada book-code source.

The two source texts tested are William Gibson's *Agrippa* and the 1911 *Encyclopaedia Britannica*, volume 6, both present in the archived 2012 book-code repository. The “dead tree” image association with *Agrippa, A Book of the Dead* is only a weak selector hypothesis; it is not treated as evidence that LP2 instructs this transfer.

## Fixed inputs and positive controls

- LP2 input: `resources/lp2-transcription.txt` and `resources/liber-primus/lp2-corpus.json`.
- Unknown LP2 pages 0–55 parse to **2,896 words / 12,956 runes**. The transcription omits the empty p50 block; the first 55 nonempty blocks therefore cover p0–49 and p51–55. Line wraps are removed, `&$§` are structural separators, and hyphen/period delimiters are respected.
- Signed-message input: `resources/historical/cicada2016-4gq25-outguess.asc`. The source-order extraction used by the existing compass SFT yields **43 alphabetic words**. For this ASCII-only diagnostic, the existing SFT normalization `v→u, k→c, z→s` is used before longest-match GP tokenization. This normalization is a test convention, not an authenticated LP2 instruction.
- GP word number: sum of the corresponding entries in `corpus.prime`. GP length counts runes; expanded length sums `corpus.translit[i].length`.
- Coordinate indexing is one-based, exactly as the archived 2012 scripts specify. No modulo, offset search, reversal, reset, or fitted correction is applied.

Pinned source copies (external repository `neuroretransmit/cicada`, commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`):
- *Agrippa*: `2012/006-two-book-codes/books/agrippa.txt`, Git blob `673ba225d1277945f2d2e5056bf025db8e89bb92`. The original `agrippa.py` removes the first five header lines, leaving 344 poem lines.
- Britannica: `2012/006-two-book-codes/books/31447.txt`, Git blob `8cba4356812ff852e3fe9c88e80ab1e9b5b8670c`. The original `encyclopedia-britannica.py` anchors at the first line beginning `CICADA`, index **15388**, then addresses line `index + L` and character `C - 1`.

Before applying the hypothesis, the reproducer validates both historical controls:
- Original Agrippa coordinates plus the literal product of the first two primes reproduce `sq6wmgv2zcsrix6t.onion`.
- Original Britannica coordinates plus the literal prime constants reproduce `eq6emgv2ehsrix6t.onion`.

These controls establish that the archived source formatting and coordinate conventions are being applied correctly; they do not validate the LP2 mapping.

## Results

### Entire unknown LP2 stream

| Book source | Character coordinate | Valid coordinates | Result |
|---|---|---:|---|
| Agrippa | GP-rune length | 1,981 / 2,896 (68.40%) | No readable plaintext |
| Agrippa | expanded A–Z length | 1,966 / 2,896 (67.89%) | No readable plaintext |
| Britannica | GP-rune length | 2,747 / 2,896 (94.85%) | No readable plaintext |
| Britannica | expanded A–Z length | 2,746 / 2,896 (94.82%) | No readable plaintext |

The Britannica extraction's initial characters are not language-like; the Agrippa extraction is additionally sparse because many prime-sum line addresses exceed the 344-line poem or the selected character is out of range. The high Britannica coordinate-validity rate is only an indexing fact, not evidence of a decipherment.

### The signed 2016 message's 43 words

| Book source | Character coordinate | Valid | Extracted sequence |
|---|---|---:|---|
| Agrippa | GP-rune length | 38 / 43 | `ahr?h?lh?aotheegth eIth eeithw?easfac suah?` |
| Agrippa | expanded A–Z length | 38 / 43 | `aot?h?lo?aotoeegto nwto enitow?easfac suth?` |
| Britannica | GP-rune length | 43 / 43 | `r.uss p.er .. n e.aee..ioe e.igod ihltiteup` |
| Britannica | expanded A–Z length | 43 / 43 | `rCrss pCer .C n eCart.Cior eCigod ihltit,up` |

None is a phrase, key, or recognizable instruction. The 43-word input therefore does not become a useful book-coordinate map under this fixed interpretation.

## Decision

Reject **GP-prime-sum(word) → line, word-length(word) → character** as a direct LP2 decipherment and as a direct interpretation of the 2016 43-word map. Do not rescue it with modular reduction, line offsets, word resets, coordinate swapping, or post-hoc letter normalization: no source selects those changes, and the fixed positive controls already establish the historical indexing.

This does **not** rule out other book ciphers, other semantics for “words are the map,” or a separately source-selected book/key. The weakest premise remains the cross-round composition itself: no LP2 instruction explicitly says to feed GP word sums into a 2012 book source.

## Reproduction

Run from the repository root with Node 18+:

```sh
node sims/lp2_2016_words_as_book_coordinates_sft.cjs
```

The script fetches the two pinned external source files and verifies their Git blob hashes. If network access is unavailable, provide local copies:

```sh
node sims/lp2_2016_words_as_book_coordinates_sft.cjs \
  --agrippa=/path/to/agrippa.txt \
  --britannica=/path/to/31447.txt
```

It prints the positive controls, exact word/rune counts, coordinate coverage, and the 43-character outputs. No copyrighted book text is copied into this repository.

**Supporting implementation:** `sims/lp2_2016_words_as_book_coordinates_sft.cjs`.

**Historical references:**
- [Archived 2012 Agrippa extraction script](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/006-two-book-codes/books/agrippa.py)
- [Archived 2012 Britannica extraction script](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/006-two-book-codes/books/encyclopedia-britannica.py)
- [Existing 2016 43-word compass SFT and its disclosed K/V/Z normalization](../sims/lp2_2016_43word_compass_sft.cjs)
