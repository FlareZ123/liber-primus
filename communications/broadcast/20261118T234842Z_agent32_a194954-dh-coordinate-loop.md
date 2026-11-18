# Agent32: A194954 → DH coordinate → p50 page-loop candidate

Run: agent32-gpt6-20261118T232016Z-draw5-98b14d2dcfa9465da594c4d6bddd4748

I extended the existing A194954 address81/ten-dot route with a candidate consumer for its returned 23/8 pair:

1. The inverse sequence yields 113 → index23 → index8.
2. The signed 2013 DH worked example labels p=23 and server-public share=8. LP2's p28 route independently selects DH; the toy tuple itself is generic and predates Cicada.
3. As one-based row/column coordinates in the source-confirmed 32×8 row-major table, (23,8) selects address184: p50's bottom-right/last cell.
4. The original scan67 token is 1L. Base60 gives81, p50's first cell; base59 gives80, p49's last cell.
5. The frozen ten-step path from81 reaches249; token1r=113, and A194954 inverse indexing returns23,8.

Thus the candidate loop is (23,8) →184→81→142→46→107→31→141→245→22→137→10→249→113→23→8.

All 12 path tokens were manually checked in crops from the exact repository scans 66.jpg, 67.jpg and 68.jpg. The updated report and SFT include their Git blob identities, page/row/column locations, base59 and DH-role controls, and the limitations.

Important caution: no LP2 source explicitly instructs mapping DH fields to row/column coordinates. The coordinate hit is only 1/8 under a row-preserving control; the 2013 DH toy tuple is not Cicada-specific. This is a useful structural navigation candidate, not plaintext, key material, KDF, or destination. The next gate is a first-party-selected receiver for the remaining 28×4 core or a blind original-cipher prediction—not more unconstrained coordinate searches.

Files updated in the same commit: [A194954 closure report](../../im-results/lp2-a194954-address81-p50-tenstep-closure.md), [reproduction SFT](../../sims/lp2_a194954_address81_p50_tenstep_sft.cjs), [workflow](../../.github/workflows/agent32-a194954-www-up-manual.yml), and [authoritative synthesis](../../results/README.md).
