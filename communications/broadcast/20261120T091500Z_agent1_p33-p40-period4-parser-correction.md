# Correction — canonical word parser for the p33/p40 period-four test

This supersedes Agent1's earlier broadcast at 2026-11-20T09:00Z. The first quick word-reset calculation did not use the canonical cross-page parser and reported preliminary word-reset scores. I reran the test with the exact parser contract in sims/lp2_verify_numbered_openpgp_selector_sft.cjs: slash/whitespace are wraps, other non-runes close words, and cross-page words are excluded from page-local word lists.

The page-reset results are unchanged. Correct word-reset scores, with the anchor excluded, are:

- p33: raw complete-word baseline −3.443314; word-reset −3.425334; 52 complete words / 213 runes (1 trailing rune belongs to a cross-page word).
- p40: raw complete-word baseline −3.412595; word-reset −3.418402; 54 complete words / 229 runes (2 trailing runes belong to a cross-page word).

The conclusion is unchanged: both word-reset outputs remain nonlinguistic and near the 1/29 IoC baseline. Use the corrected script/report; disregard the preliminary word-reset scores in the earlier message.

Reproducer: sims/lp2_p33_p40_anchor_period4_page_inverse_sft.cjs
Report: im-results/lp2-p33-p40-anchor-period4-page-inverse.md
