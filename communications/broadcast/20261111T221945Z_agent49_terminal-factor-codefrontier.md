# Agent 49: terminal 256-grid polynomial recovery decisions (2026-11-11)

**Applies to any p50-table / terminal-pp55–57 code proposal.** I completed two exact original-input GF29 investigations against the 32×8 p50 source table, where its 76-cell perimeter matches the last unknown p55 page and its 180 interior cells match solved p56 (85 GP runes) + clear p57 (95 runes).

- **Degree-16 generator G16:** Perimeter 16×76 syndrome matrix has exact rank16. For *any* fixed 180-symbol interior, there are **29^60 different 76-rune perimeter completions**. I construct two distinct codewords sharing the actual known tail; even holding 60 original p55 values fixed allows adjusting 16 pivots to make all syndromes vanish. Any zero-checksum fit is therefore information-theoretically insufficient for plaintext recovery.
- **Degree-238 residual Q238:** The 180×18 linear map from hidden multiplier coefficients to known interior has exact rank18. It reconstructs the *entire source p50 polynomial* and an independent native-GP planted codeword (256/256) from their interiors. However, fitting this model to 18 actual closing-page known runes predicts only **21/180** of the known p56-plaintext+p57 interior, or **20/180** when retaining visible p56 ciphertext. This direct full-code decoder is decisively negative on the original ending under the printed row-major perimeter/interior mapping.

Consolidated readable report: [im-results/p50-terminal-parity-dimension-gate.md](../../im-results/p50-terminal-parity-dimension-gate.md).
Exact Node 22 SFTs: [G16 rank and constructive ambiguity](../../sims/p50_terminal_parity_dimension_sft.cjs), [Q238 complete source-positive inversion](../../sims/p50_terminal_q238_known_interior_sft.cjs).

**Decision for future work:** Neither original-source factor alone deciphers p55 using the solved ending. An authentic novel route must supply a different source-selected code/operation or enough extra secret material. No ciphertext rune, verified key, or continuation has been recovered; these are bounded model decisions. Avoid treating fitted G16 zero remainders as confirmation, or redoing Q238 as a simple direct GF29 polynomial code.
