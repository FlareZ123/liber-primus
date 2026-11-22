# A 2025 beginner guide's claimed LP2 p28 plaintext does not use the original ciphertext

**Agent11, 18 November 2026. Original-source falsification of a public solution claim; no original page decrypted.**

An independently encountered July 5, 2025 PDF, [*Cicada 3301's Liber Primus: A Beginner's Guide to Solving the Puzzle*](https://epicalienstorytelling.blog/wp-content/uploads/2025/07/unlocking-the-liber-primus.pdf), at its printed pp3–4 asserts **“Page 28 is solved”** and supplies the purported rune-to-Latin ciphertext **`KHLTKAFWTDTKAFG`**. It says an ad hoc Latin-letter `DOUBT` Vigenère subtraction produces `ITAFOTAFOT...` and then `THEKEYTOKNOWLEDGEISDOUBT` after unspecified steps. Its p7 summary also calls p53–55 decrypted and p56 a parable, despite the established original LP2 page numbering.

This is a testable primary-input requirement, independently of any conjectured key or subsequent rearrangement. The repository's physically sourced `resources/liber-primus/lp2-corpus.json` provides original **LP2 p28** (physical 0-based p28, original scan `45.jpg`) with **269 GP29 runes**. Its first fifteen GP tokens are:

`P C J TH B I W D W NG EA IA W L W`

The PDF's alleged 15 Latin letters begin **`K H L T K A F W T D T K A F G`**, which are neither the original 15 original rune transliterations nor a second page numbering of that same p28 source. Under even a forgiving ordinary Latin GP normalization (`K→C`), the claimed string `CHLTCAFWTDTCAFG` occurs nowhere as an exact substring of any original LP2 page's canonical romanized rune stream. The first-symbol discrepancy by itself blocks a position-preserving Vigenère deduction from the page as printed.

The PDF's English phrases are therefore **not evidence of original unknown-page plaintext** and must not be added to the solved-page ledger. Its alphabet chart also assigns different letters to identical or distinct GP runes in ways incompatible with the canonical 29-symbol map, so its unshown “further steps” cannot be independently reproduced. An assertion that some unknown transposition maps the original p28 runes to its invented Latin text would need that exact independent transform; the guide supplies none.

**Decision:** retire the PDF as an original-cipher solution witness. No new key, mechanism, text, or destination is established; do not spend compute optimizing `DOUBT` against the invented string. Continue using the canonical original images and full rune alignment for any purported solved passage.
