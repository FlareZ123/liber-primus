# LP2 exact and two-edit word-length literary crib scan (2026-11-10)

**Status: intermediate negative. No LP2 plaintext or key recovered.**

## Hypothesis and design

Word (`-`), clause (`.`), and section (`$`) boundaries survive the apparent rune cipher. Consequently each rune-word length is a potential cleartext fingerprint: a direct quotation from a known text can be detected without first recovering the keystream. The source is the Wulfic/rtkd master transcription checked into `resources/transcriptions/liber_primus_master.txt`; LP2 pages 0–55 hold **12,956 runes, 2,896 words**, with one numeric-only page (LP2 page 50). Do not split words at line (`/`) or page (`%`) wraps.

The trial English-to-GP length encoder uses two-letter runes `TH, EO, OE, AE, IA, EA, NG`, handles `ING` as one NG rune (as in PARABLE), and maps `V→U`, `K→C`, `Z→S`, `QU→CW`. It is **one specific spelling policy**, potentially incomplete for unsolved plaintext. Source texts are tokenized into A–Z words and Gutenberg front/back boilerplate is cropped using its BEGIN/END markers when present. Text retained within the BEGIN/END boundaries may still include transcription credits or editor notes.

Calibration: the solved *PARABLE* page (LP2 page 57) yields all **20/20 English-word lengths exactly** using the independently entered English transcription `PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE`. A 20-word positive control with two deliberately altered rune lengths is recovered by the two-mismatch scanner (20 words, exactly two errors).

The exact matching algorithm indexes every 6-word length window in the LP2 corpus and looks for matches in the literary sources, extending each matching seed to the right. For a full 18-word alignment with at most two **length substitutions** (no insertions or deletions), the pigeonhole principle guarantees one intact run of at least 6 words: 16 matching positions divided by three runs. Thus the seeded two-mismatch scanner is exhaustive for proposed alignments **18 words or longer**, even if its reported shorter best matches are merely lower bounds.

## Results

| Literature source | Source words after crop | Longest exact match | Best up-to-two-errors candidate (6-seed filtered) | Git blob SHA |
|---|---:|---:|---:|---|
| Emerson — Essays, First Series | 74,866 | 9 | 14 | `a92be8ba5b3511a003a22ba31523c14397aaa83a` |
| Blake — The Marriage of Heaven and Hell | 4,680 | 8 | 11 | `44149cc32fa8a46501a95059283526a8a3429705` |
| Gibran — The Prophet | 12,572 | 9 | 13 | `df260a07d56bf5998d40a6360b6132c35c252d10` |
| Hesse — Siddhartha | 39,793 | 9 | 16 | `b93c2c989fb0e4b14b8887622456bf60f1736635` |

Zero exact matches span 10 words, and **zero 18-word spans align with two or fewer altered lengths**, among these specific editions under this source encoder. The longest approximate candidates are short and compatible with coincidence. Do not interpret them as recovered plaintext.

Pinned source paths (Git blob identifiers above):
- Emerson — Essays, First Series: https://github.com/GITenberg/Essays---First-Series_2944/blob/master/2944.txt
- Blake — The Marriage of Heaven and Hell: https://github.com/GITenberg/The-Marriage-of-Heaven-and-Hell_45315/blob/master/45315.txt
- Gibran — The Prophet: https://github.com/GITenberg/The-Prophet_58585/blob/master/58585-0.txt
- Hesse — Siddhartha: https://github.com/GITenberg/Siddhartha_2500/blob/master/2500.txt

## Interpretation and limitations

The tested sources provide **no direct, long, verbatim quotation** recoverable from the surviving word lengths using the trial phonetic spelling rule. This cannot exclude non-verbatim adaptation, ordinary original prose, a shifted or split quotation, other writings, or alternative transcription and spelling conventions. Matching length alone would not prove plaintext without independent cryptographic confirmation. False positives from the look-elsewhere search must be calibrated before promoting any candidate.

Reproduce using the pure CommonJS module `sims/wordlength_crib_scan.js` and the test `sims/test_wordlength_crib_scan.js`, with source data tied to the listed Git blob hashes. The module performs no automatic downloads or disk writes; supply each book's text to `scanText(makeIndex(parseMaster(master).cipherLengths), bookText)`.
