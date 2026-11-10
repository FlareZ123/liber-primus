# Runic transcription inputs

These are **derived community transcriptions**, not original image data. Original 75 scan JPEGs are in `resources/liber-primus/`.

- `lp2_krisyotam_2017.txt`: exact text copied on 2026-11-10 from [krisyotam/cicada3301](https://github.com/krisyotam/cicada3301/blob/main/liber-primus/runes-text.txt), Git blob `43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7`. This follows the shared rtkd/iddqd 2017 transcription lineage. It includes all 55 rune-bearing unsolved LP2 pages, then `AN END` and `PARABLE`. Split on `%`: sections 0–54 are the rune-bearing unsolved pages; section 55 is LP2 page 56 (`AN END`); section 56 is LP2 page 57 (`PARABLE`). The LP2 page 50 numerical grid has **no** rune-bearing transcription section, so transcription indices 50–54 map to original LP2 page numbers 51–55. Corresponding scan image = 17 + LP2 page number. Treat these offsets carefully.
- `lp1_wulfic_canonical.txt`: LP1 rune-bearing solved sections copied from [Wulfic canonical master](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/data/canonical/liber_primus_master.txt), Git blob `ba553b1d43bc491a1bab66ebd02534249263ae90`. A delimiter/header-free excerpt before LP2 begins; used as a **positive control** for language-sensitive structural tests. Encrypted LP1 material may contain F interrupters, and embedded numerical strings are excluded from rune-only length analysis.

For both inputs, `-` denotes word boundary, `.` clause ending, `/` typographic line wrapping, `%` page, `&` paragraph, `$` section. **Remove line-wrap separators before measuring word lengths**; otherwise words split across printed lines generate spurious short-word statistics.

These transcriptions are reference inputs for computational experiments. They are not independently transcribed from the images in this repository.
