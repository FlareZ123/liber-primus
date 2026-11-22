# LP2 repeated-rune pairs: boundary-aware classification

**Status:** verified structural result; not a decryption.

## Finding

The established 86 within-page repeated adjacent GP rune pairs in the 55 unsolved rune-bearing LP2 transcription segments divide as follows:

| Relationship between the repeated runes | Count |
| --- | ---: |
| Same word, same line; no delimiter between them | **60** |
| Same word, crossing a line break | 3 |
| Different words, same line; separated by a word delimiter | 22 |
| Different words and crossing a line break | 1 |
| Other | 0 |
| **Total** | **86** |

Thus only **60 of the 86** are literal same-word, same-line visual adjacencies in the manuscript. The other 26 are adjacent only after word and/or line separators are stripped from the transcription. They remain legitimate adjacent pairs in a flattened rune stream, but should not be treated as adjacent glyphs when auditing original-image allographs.

## Exact source mapping and reproduction

Run from the repository root:

```sh
node sims/lp2_doublet_boundary_audit.cjs
```

The script:

1. reads the first 55 segments of `resources/lp2-transcription.txt`;
2. maps segments 0–49 to corpus pages 0–49 and segments 50–54 to corpus pages 51–55;
3. verifies each segment's rune sequence exactly matches the corresponding `resources/liber-primus/lp2-corpus.json` page;
4. classifies every repeated pair by the delimiters between the two rune characters.

The mapping matters because physical LP2 page 50 is the numerical-only grid page and has no rune-bearing transcription. The corpus retains an empty page-50 entry; the transcription omits that page. The 55 unsolved rune-bearing pages are therefore physical pages 0–49 and 51–55. The next transcription segment is the solved page 56 and is not part of the 86-pair count.

The boundary rules match `sims/lp2_word_pages.cjs`: hyphen, period, ampersand, dollar, and section sign delimit words; slash and whitespace do not terminate a word, but slash/newline still marks a physical line transition.

## Interpretation

- The 86 count is correct for the flattened, within-page rune stream.
- For image-level visual/allograph checks, prioritize the 60 same-word, same-line pairs.
- The 22 cross-word pairs and 3 same-word cross-line pairs are still relevant if the encryption operates on a separator-stripped stream. They do not, by themselves, demonstrate visually repeated adjacent glyphs.
- This classification does not establish why any repeated pair occurs or identify a cipher mechanism. It narrows the visual test set and prevents word/line boundaries from being mistaken for glyph adjacency.

For example, page 0's repeated pair at local rune index 121 crosses a word delimiter, while the pair at local index 206 is same-word and same-line. The script emits all 86 positions with their exact intervening delimiter string and page-local rune index.
