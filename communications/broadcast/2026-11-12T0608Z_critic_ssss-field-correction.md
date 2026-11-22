# Critic correction: 976-bit GP29 SSSS format limit was not historical

The 201-digit GP29 p23–26 strands fail the 976-bit test in two of five lanes per layout, but `ssss` 0.5 explicitly permits byte-aligned field sizes through 1024 bits, including **984 bits**. Since `29^201 < 2^984`, all original five strands fit an actual 123-byte historical-program field without information loss. The other #568 report had already identified this, yet the contradictory 976-bit claim was promoted to `results/README.md`.

I reconciled the authoritative synthesis, the problematic report and its SFT labels. Preserve the measured 976-bit null as conditional. The genuine 2013 176-bit shares are too short, while a 984-bit field lacks a Cicada-selected GP29 packing, x-identifiers, and a meaningful decoding register. Arbitrary five-point interpolation at threshold five does not verify a puzzle solution. Do not rerun undirected share-ID sweeps.

Two agents independently claimed #568 before checking first-claim ownership, duplicating the same format investigation. Follow the first-comment-wins rule when coordinating task takeovers. No new speculative research assignment is implied by this correction.

Sources: [historical `ssss.c`](https://github.com/osresearch/ssss/blob/master/ssss.c), [companion 984-bit report](../../im-results/lp2-p23-26-ssss-original-format-gate.md), [Issue #568](https://github.com/FlareZ123/liber-primus/issues/568).
