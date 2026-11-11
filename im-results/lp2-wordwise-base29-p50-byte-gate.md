# LP2 word numbers as a direct byte channel through the 256-cell table

**Decision (11 November 2026):** Both source-natural word-number conventions, base29 integer and GP prime-weight sum, fail as direct ASCII bytes or as indices through the printed 256-cell table. All four mappings pass planted-text controls. This is a **bounded negative** of four direct source-motivated readings, with no recovered plaintext, key, or reversible original-rune cipher. The table's base60 byte interpretation and the word-value modulo operation remain hypotheses.

## Source and prospective human operation

The authentic 26 January 2013 Cicada TCP specification [documents BASE29 numeral conversion](../resources/external/2013-tcp-server-signed-source.md), and LP2 supplies a 29-rune alphabet with printed word delimiters and a visually explicit **32×8 table** across physical pp49–51. The original signed 2016 message also invites treating the manuscript's words as a map and their numbers as directions, although it does not instruct this byte conversion. An economical possible player operation is to read one table address or character for each canonical printed word.

The source does **not** select whether a word is a base29 integer, why its low byte should be retained, or why the p50 numbers should be treated as a byte-substitution table. In particular the source-led logic is a plausible finite trial, not an authorial instruction or an encrypted-text decoding algorithm.

## Fixed test, before original output inspection

- Read the canonical [58-page GP index corpus](../resources/liber-primus/lp2-corpus.json) and [original continuous word transcription](../resources/liber-primus/lp2-transcription.txt) through the established [word parser](../sims/lp2_word_pages.cjs), preserving words that cross original page/line boundaries. Use exactly **2,896** words and **12,956** unknown ciphertext runes; runeless physical p50 is a grid source, not a word-bearing ciphertext page.
- For each original word with GP indices `d_0 … d_(L−1)`, compute its big-endian base29 integer `V = Σ d_i·29^(L−1−i)` using unbounded precision.
- **Word-number rules (two separate hypotheses):** take either `V`, the positional base29 integer, or `S = Σ prime(d_i)`, the exact GP-prime sum which the manuscript explicitly associates with runes.
- **Transport A:** emit the selected word-number modulo 256 as one byte.
- **Transport B:** treat the selected word-number modulo 256 as a zero-based address into the actual source-order **256** base60-decoded table bytes (10+13+9 printed rows). Emit that selected byte.
- Preserve source word order; keep byte offset zero at word zero. No shifted phases, guessed passwords, alphabet relabeling, re-segmentation, rescoring of alternative starts, or arbitrary address operations.
- Use exact positive controls: fresh two-rune base29 words carrying ASCII **HI** decode under Transport A; table-address rune words carrying **THE** decode under Transport B.

All four operations discard upper word-integer or prime-sum information and are intrinsically non-injective. Consequently their failure or success as **secondary byte readouts** cannot by itself establish a lossless LP2 encryption scheme. A full decoder would require independently recoverable source state.

## Original-input result

| Frozen word-number and byte transport | Output bytes | Printable ASCII | Empirical byte entropy | Longest printable run |
| --- | ---: | ---: | ---: | --- |
| Base29 word integer, low byte | 2,896 | 36.3950% | 7.925206 bits | `Z'_]1!&` (7) |
| Base29 word integer, p50 table lookup | 2,896 | 40.5387% | 7.101605 bits | `P*L\\ns4` (7) |
| GP prime-weight word sum, low byte | 2,896 | 39.5028% | 7.906867 bits | `oeZ$nRa` (7) |
| GP prime-weight word sum, p50 table lookup | 2,896 | 39.3301% | 7.109950 bits | ` 8 Tj9EV!` (9) |

**All-secret one-byte alphabet capacity, exact rather than heuristic.** Even if every byte is globally relabeled by a completely unknown bijection, that cannot turn all 2,896 output positions into an unbroken printable-ASCII sentence. Counting each source byte and sorting its 256 frequencies yields a sharp, achievable upper bound: a bijection may map at most the **95** most frequent source symbols to the 95 printable ASCII characters, or at most the **27** most frequent symbols to an uppercase A–Z+space register. No source byte may independently change its mapping with position under this model.

| Source word number and byte mapping | Observed distinct symbols | Maximum printable ASCII under *any* byte permutation | Minimum positions requiring a changed byte | Maximum A–Z+space under any permutation |
| --- | ---: | ---: | ---: | ---: |
| Base29 low byte | **256** | **1,426** | **1,470** | **496** |
| Base29 p50 lookup | **161** | **2,300** | **596** | **991** |
| GP-prime-sum low byte | **256** | **1,481** | **1,415** | **519** |
| GP-prime-sum p50 lookup | **161** | **2,301** | **595** | **967** |

These are exact capacity bounds conditional on **one** output byte per original printed word and a **single global bijective byte renaming**. They exclude readable *all-printable ASCII* under that fixed-bijection family and likewise any continuous 27-symbol A–Z+space message. They cannot exclude an independently justified position-changing key, more than one emitted byte per word, custom encodings, compressed payloads or non-bijective maps applied after the tested output.

None of the four byte streams contains the ASCII trigrams `THE`, `AND`, `ING`, `ION`, `YOU`, `KEY`, or `END`. The lower entropy of the two table lookup outputs follows in part from its non-bijective 256-byte table, which has only **161** distinct values. A higher printable share there is not independent evidence of a plaintext channel. The bounded test does not rule out binary ciphertext, historically justified secret parameters, a richer source-selected map, or a byte channel that is further encrypted. It does not establish such a richer model either.

## Reproduce

[Standalone Node.js SFT](../sims/lp2_wordwise_base29_p50_byte_gate_sft.cjs) requires no third-party dependencies and computes both complete streams directly from committed source artifacts. From the repository root run `node sims/lp2_wordwise_base29_p50_byte_gate_sft.cjs`. It asserts the source lengths, table uniqueness, empirical original-input diagnostics and all four positive text controls.

**Research decision:** retire these four literal byte transports. Reopen only if independent historic or original-page evidence prescribes a specific offset, operation, word-grouping rule, second cipher stage or missing decoding state. Do not promote this bounded negative to an established key/plaintext finding.
