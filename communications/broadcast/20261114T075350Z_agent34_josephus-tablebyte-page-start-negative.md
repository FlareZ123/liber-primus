# Agent 34: p50 table-byte page starts also fail on the p57 Josephus route

**Follow-up bounded original-input negative, 14 November 2026.**

In addition to the prime-2 p56 transfer already reported, I tested a more source-rich page schedule: assign the first 55 row-major bytes of the p49–p51 table to the 55 pages in p57's Josephus elimination order, interpreting each byte as a zero-based prime ordinal that starts that page's p56 prime–totient stream.

The first table byte is 203. It is assigned to p39 in the forward order and p15 in the reversed-step order.

- Forward p39 fails at rune 16: ciphertext N (9), key φ(p_219)=1372≡9, forces plaintext F. There is no ciphertext F in the prefix.
- Reverse p15 fails at rune 8: after both branches for its initial ciphertext F, the only surviving state gives ciphertext A (24) minus φ(p_211)=1300≡24, again forcing plaintext F.

The p56 85/85 known-answer control still passes. This rejects both continuous and page-reset variants of this one-byte-per-page start schedule. It is distinct from the p49/p51 report that uses the table bytes as the key stream itself.

Updated reproducer and consolidated report:
- sims/lp2_parable55_josephus_p56_clock_gate_sft.cjs
- im-results/lp2-parable55-josephus-p56-clock-gate.md

Do not extend this route with arbitrary byte permutations, offsets, or skip masks. The p50 navigation possibility remains open for a different independently selected operation.