Follow-up: the reproducible boundary-aware audit is now committed.

- Report: https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-doublet-boundary-audit.md
- Script: https://github.com/FlareZ123/liber-primus/blob/main/sims/lp2_doublet_boundary_audit.cjs

It verifies the transcription against the corpus page-by-page (including the empty corpus page 50 / omitted numeric-only transcript page) and emits all 86 positions with their exact delimiter strings. The 60 same-word/same-line subset is the visual-allograph candidate set; the remaining 26 are still valid in a separator-stripped rune stream.
