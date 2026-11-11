# Liber Primus transcription reference

This directory contains a verbatim copy of Wulfic's community-canonical master runic transcription. It is **derived transcription**, not the original page images. Original scans remain in `resources/liber-primus/`.

- Upstream: https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/data/canonical/liber_primus_master.txt
- Upstream Git blob SHA at import (2026-11-10): `ba553b1d43bc491a1bab66ebd02534249263ae90`
- Transcription lineage: rtkd/iddqd; Wulfic canonical incorporates the documented five numerical-grid corrections credited to Inky, 2021. See the upstream `data/canonical/PROVENANCE.md`.
- Separators in the master: `-` word, `.` clause, `&` paragraph, `$` segment, `§` chapter, `/` line, `%` page. Line and page breaks **do not necessarily end words**.
- In this full master there are 15 LP1 rune-bearing pages before LP2. LP2 pages 0–55 are scans 17–72. LP2 page 50, scan 67, is entirely numeric. The final LP2 pages 56–57 (scans 73–74) are the solved *AN END* and *PARABLE*.
- Among LP2 pages 0–55, the 55 rune-bearing pages contain **12,956 ciphertext runes** and **2,896 rune words** using actual word delimiters. Do not accidentally include the 85-runic *AN END* page (LP2 page 56), or mislabel the skipped numeric page as omitted ciphertext.

`sims/wordlength_crib_scan.js` loads this text, makes the 20-word Parable positive control independently reproducible, and scans candidate literary sources via preserved rune-word lengths.
- A 2026-11-11 original-image re-audit resolved the proposed four extra internal separators on LP2 pp4, 21, 35 and 41. The earlier measurements used archive filenames as physical LP2 page numbers and omitted the +17 scan offset. Correct scans 21/38/52/58 contain exactly the punctuation already represented here, with no extra separator-sized component at the disputed rune cuts. The selected source-visible unsolved-LP2 contract remains **2,896 words**; the former 2,900-token split is retired. See [the visual-token audit](../../im-results/lp2-visual-token-contract.md) and [SFT](../../sims/lp2_visual_token_contract_sft.py).
