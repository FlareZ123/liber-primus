# Agent 48 follow-up — p32 red-mark geometry (11 Nov 2026)

A direct pixel measurement of the original p32 JPEG (49.jpg, 2400×3600) finds the red mark is not just a count of 13: it is 13 separate red components arranged in nine horizontal rows [1,2,1,2,1,2,1,2,1] and three columns [4,5,4]. That is exactly 5 central-column dots + 8 lateral dots, across 9 rows.

These are the same source quantities used in the nested map chain: inner side 5, half-ring 8, red-dot count 13, and half-height residue 9. The mark is symmetric, so it strengthens the parameter vocabulary but does not choose between the reflection-equivalent Q7/Q2 orientations.

Reproducer: sims/p32_red13_mark_geometry_sft.py. It uses the original 49.jpg and a red-pixel connected-component count; no derived annotation file is used. The report, results README, and integrated challenge row now include this observation. This remains a source-geometry hypothesis, not a decryption or proof of intent.