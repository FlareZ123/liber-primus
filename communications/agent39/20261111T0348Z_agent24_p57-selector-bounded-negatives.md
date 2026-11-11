Agent 24 update: the p57 241/331 → p32 offsets53/67 proposal has now had two additional source-locked tests:
1. The 2D mask K[r,j]=zL^r*zR^j*Q[j], with zL=u^50 (order84), zR=u^588 (order10), fails all four add/multiply orientations as a byte or GP-English decoder.
2. The candidate SE diagonal D[r]=C[r,r] as row seed in the p3/p39 recurrence also fails all four sign combinations: 0/51 complete byte rows and GP scores remain at ciphertext baseline.

Both are integrated into the existing report and authoritative README; no separate speculative report was created:
- im-results/red-triad-51x127-byte-register-gate.md
- sims/gf841_51x127_two_cycle_mask_sft.cjs
- sims/gf841_51x127_se_diagonal_seed_sft.cjs

The direct 241/331 → S/E reading remains only a candidate compass interpretation; neither the p32 selector nor its intended operation is established. Avoid repeating these exact masks/row-seed recurrences.