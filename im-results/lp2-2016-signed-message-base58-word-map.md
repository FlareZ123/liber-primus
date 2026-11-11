# 2016 signed-message base-58 word map

**Status: provisional source-constrained hypothesis; not a decryption.**

## Hypothesis

The 2016 signed message says:

> Its words are the map. Their meaning is the road, and their numbers are the direction.

The 16 words in that sentence can be treated as book-cipher tokens. For each word:

1. Transliterate it with the repository's canonical `corpus.translit` table.
2. Sum the corresponding Gematria Primus prime weights.
3. Split the sum in base 58:
   - page = remainder (the original LP2 image archive is pages 0–57);
   - word index = quotient (zero-based).

The original 58-page count is source-defined by the 2014 LP2 image set; page 50 remains a page even though it is a table rather than a text page. In the canonical master transcription, those LP2 pages are scans 17–74 (1-based).

This is a candidate interpretation of “words are the map” and “numbers are the direction.” The source does not explicitly state the quotient/remainder order or word-index origin, so those remain assumptions.

## Reproduction

Run from the repository root:

```sh
node sims/lp2_2016_message_base58_word_map.cjs
```

The script reads only:

- `resources/liber-primus/lp2-corpus.json`
- `resources/transcriptions/liber_primus_master.txt`

It asserts the 58-page LP2 slice, every selected address, the unique FOLD token, the p56 END decryption, and the p32 row/column checksum.

## Word-by-word addresses

The canonical corpus transliteration gives these prime sums and zero-based page/word addresses:

| 2016 message word | GP prime sum | LP2 page | Word index | Selected LP2 word |
|---|---:|---:|---:|---|
| Its | 143 | 27 | 2 | `ᛚᛋᚳᛈ` (LSCP) |
| words | 179 | 5 | 3 | `ᛁᛝᚩ` (INGO) |
| are | 175 | 1 | 3 | `ᚳᚱᚦ` (CRTH) |
| the | 72 | 14 | 1 | `ᚠᚩᛚᛞ` (FOLD) |
| map | 211 | 37 | 3 | `ᛏᛠᛈᛉ` (TEAPX) |
| their | 114 | 56 | 1 | `ᛟᛋᚱ` (OSR) |
| meaning | 319 | 29 | 5 | `ᚫᚻᚪ` (AEHA) |
| is | 84 | 26 | 1 | `ᚩᚾᛠᚩ` (ONEO) |
| the | 72 | 14 | 1 | `ᚠᚩᛚᛞ` (FOLD) |
| road | 204 | 30 | 3 | `ᛖᚣᛟᚣ` (EYOY) |
| and | 215 | 41 | 3 | `ᚩᚾᛏᛚ` (ONTL) |
| their | 114 | 56 | 1 | `ᛟᛋᚱ` (OSR) |
| numbers | 295 | 5 | 5 | `ᚷᛞᚹᚪ` (GDWA) |
| are | 175 | 1 | 3 | `ᚳᚱᚦ` (CRTH) |
| the | 72 | 14 | 1 | `ᚠᚩᛚᛞ` (FOLD) |
| direction | 337 | 47 | 5 | `ᛒᛋᛏᚫᚾᚱᛁ` (BSTAENRI) |

All 16 addresses are in bounds. Repeated source words repeat the same destination: “the” maps three times to p14 word 1, and “their” maps twice to p56 word 1.

## Two nontrivial anchors

### “the” → FOLD

`GPsum("the") = 72 = 58 × 1 + 14`, so the address is p14, word index 1. That complete rune word is `ᚠᚩᛚᛞ`, transliterating exactly to **FOLD**.

It is the only occurrence of that complete four-rune word among the 56 unsolved LP2 pages (p0–p55). It is the second word on p14, whose illustration includes a tree and a dragonfly. This is a potentially actionable fold clue, but it is not yet proven plaintext; it could still be a ciphertext coincidence.

### “their” → END

`GPsum("their") = 114 = 58 × 1 + 56`, so the address is p56, word index 1. The selected ciphertext is `ᛟᛋᚱ`.

This is independently checkable against the established p56 totient-prime decryption. The word begins at rune offset 2 (the first word, AN, occupies offsets 0–1). The next three prime values are 5, 7, 11; subtracting their totients 4, 6, 10 from ciphertext GP indices [22, 15, 4] modulo 29 gives [18, 9, 23] = **END**.

Thus the repeated source word “their” maps twice to the verified plaintext word END on the solved p56 page. This is a real positive control, not a proposed decryption of an unsolved page.

## Independent numerical bridge to the 2016 image

The first four words, “Its words are the”, have GP prime sum:

`143 + 179 + 175 + 72 = 569`.

That equals both:

- the 569-pixel dimension of the 2016 signed image; and
- the first-column GP-prime sum of the 11×11 p32 square.

The p32 top-row sum is 563, matching the other 2016 image dimension. This does not prove the book-map rule, but it independently links the 2016 message's word values to the p32/tree geometry.

## Controls and limits

- The mapping is word-by-word. The full 16-word sentence has canonical GP rune count 61 and prime sum 2781; treating the total as one address gives p55 word 47, which is out of bounds because p55 has only 19 words.
- The repository's canonical transliteration uses `IA`, not an `IO` alias. The word “direction” therefore contributes nine runes and prime sum 337. Published 59-rune / 2819 calculations for this sentence require a different, undocumented treatment of the initial capital I and/or IO; this experiment does not rely on that segmentation.
- Zero-based page numbering is supported by the original 0–57 archive labels. Zero-based word indexing is not explicitly stated in the source, but it is the convention that produces the FOLD and END anchors. A one-based word interpretation selects the preceding words instead.
- Neighboring moduli do not reproduce both anchors: with 57, “the” selects p15 word 1 and “their” p0 word 2; with 59, they select p13 word 1 and p55 word 1. The original 58-page count is therefore material to this candidate.
- Most selected words remain opaque ciphertext. Do not call the 16-word output plaintext, and do not promote this to `results/` yet.

## Best next test

The p32 page is an 11×11 rune square and its associated tree is reused in the 2016 signed image. The 2016 sentence has 16 words; the central 5×5 perimeter of p32 has 16 cells. The separate p32 perimeter/file-length coincidence is already under investigation in issue #18.

The new FOLD anchor gives a source-side reason to test a *specific fold* of the p32 map and then compare the 16 ordered outputs with the 16 message words. The next experiment should freeze a fold axis, ordering, and expected output before inspecting the result. A generic search over fold lines or arbitrary permutations would not be persuasive.
