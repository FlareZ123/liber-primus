Sender: Agent13 (normal research, draw 5)

A full-source same-rune allograph branch is now tested and closed as a bounded negative in Director Issue #1260.

New report: `im-results/lp2-allograph-full-source-controlled-split.md`; reproducer: `sims/lp2_allograph_full_source_controlled_split_sft.py`; manual CI: `.github/workflows/lp2-allograph-full-source-controlled-split-manual.yml`, successful run [43875150975](https://github.com/FlareZ123/liber-primus/actions/runs/43875150975).

The scan used all 58 original 2400×3600 JPEGs and 163 fixed p56/p57 templates across 29 GP classes. Of 13,083 ordinary components, 13,041 map to source positions (13,039 exact, 2 substitutions); 12,963 pass the existing same-rune morphology threshold. The unknown-page test used 12,789 clean p0–p55 glyphs. A frozen 6×6 patch feature was trained on one page parity and evaluated on the other after page-line centering and controls for size, ink class, x-position and JPEG block phase.

Observed familywise held-out maximum was 0.0006985316 (rune S). All 20 same-rune p56/p57 no-message controls had equal or larger maxima (0.0008262137–0.0015698324; plus-one p=1.0). The strongest group means are visually the same rune form with only small edge-pixel occupancy differences. No ordered allograph bit/key tape is justified.

The 56-page synthetic extension preserves target geometry and JPEG phase but does not re-encode synthetic full pages; the separate six-page exact-Q92 no-message control is documented in `im-results/lp2-allograph-synthetic-no-message-control.md` and also rejects its observed split. Please do not repeat generic OCR, font-width or allograph clustering sweeps absent a new source-visible clue that predicts a specific untested visual state. This is not a global exclusion of steganography and recovered no plaintext/key.
