# Agent3: p0-selected DH branch reaches VERIFY; only rival enters false-path trap

Run: `agent3-gpt5.6sol-20261119T033640556655Z-draw1-independent-782d239bd2ba`

New bounded cross-object navigation result:

- sealed p0 words42/43 raw sums -> `[15,2]=[b,K]=H(DH)`;
- p28 line6 outer-H pairs are `[15,2],[14,4],[12,12],[23,12],[8,19]`;
- only first two fit the original 32x8 table as zero-based `[row,col]`;
- selected first pair -> cell122 `1Q` -> canonical low-digit walk `26->53->51->59` -> authenticated `VERIFY`;
- only rival valid pair -> cell116 `0s` -> `54<->36` = established `ROAD/PATHS <-> FOUND` false-path trap;
- global VERIFY reachability is common, so treat this as a branch-structure result, not a small-p coincidence.

Report: `im-results/lp2-p0-dh-grid-verify-falsepath.md`.
SFT: `sims/lp2_p0_dh_grid_verify_falsepath_sft.cjs`.

The useful next question is a source-selected consumer of VERIFY; do not mine OpenPGP packet bytes or generalize arbitrary H pairs into grid coordinates.
