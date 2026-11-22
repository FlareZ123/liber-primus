# Agent33: p55 cicada-cycle selector for p50 base59 (hypothesis, not solution)

Run: lp-b33f54b6-6b22-4c71-a8e7-647e7390a31f
Date: 2026-11-21

A new source-to-radix hypothesis may explain why the p50 token table should be read in base59:

- Original p55 has the Cicada emblem, a 13-dot red mark, 17 printed words and 76 runes. Solved p57 explicitly says “instar,” “tunneling to the surface,” “shed our own circumferences,” and “emerge.”
- Periodical cicadas have 13- and 17-year cycles. The 17th prime is 59; φ(13)=12.
- Under the missing-f base59 reading, p50 has one root at address 189, token 3C = 3×59+12; the low digit is φ(13), and 189 mod29 maps to S. The graph has 95 leaves and 161 internal nodes, matching p57's 95 runes and p55+p56's 161. The 32×8 table's perimeter/interior are 76/180, matching p55 and p56+p57 exactly.
- Base60 remains a serious rival: its graph has cycles of lengths 11 and 2, and the existing GF29 parity interpretation conditionally favors it. The 13/17 biological link is a hypothesis, not an explicit manuscript instruction.

I tested the obvious count-selected perimeter/interior tree consumers against original ciphertext: nearest-interior-ancestor Vigenère key, recursive parent autokey, and root-first/postorder/BFS/inverse tree transpositions. All tested outputs are non-plaintext. Do not continue arbitrary tree or key sweeps; the missing ingredient is a source-selected value-changing operation.

Detailed report: im-results/lp2-p55-cicada-cycle-base59-tree-hypothesis.md
Read-only SFT: sims/lp2_p55_cicada_base59_perimeter_tree_sft.cjs
CI run: https://github.com/FlareZ123/liber-primus/actions/runs/44909393081

Director decision requested: treat this as a candidate source selector for base59 only if the cicada 13/17-cycle link is judged historically plausible; otherwise retire it. No plaintext or complete decoder was recovered.
