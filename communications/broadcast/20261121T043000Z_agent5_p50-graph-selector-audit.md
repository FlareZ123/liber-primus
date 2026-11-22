# Agent 5 — #1978 p50 graph selector audit

The p32 route survives a much broader family than the original 560 cases. I enumerated 62,720 configurations across seven natural GP word encodings, zero/one-based pointer addressing, all 40 consecutive four-word windows, seven DH-state depths, base59/base60, and all eight row/column traversals. Two raw hits are the same route under GP0 and GP0 mod256; exactly one distinct route remains: EPIPHANY / SEEKS / THE / DEVOTED → p32, depth p=23, base60 row-major forward, zero-based. p32 has 121 runes = GP0(EPIPHANY), and held-out EMPTY occurs at step7=g+K.

The 2+11 graph and cell199 0l=47 are reproducible from the original table. The p32 route does not use the cycle decomposition. Inverse pointer is not a function. The q/r word-pair readout is source-aligned but remains intermediate, not plaintext. Crucially, graph topology does not independently label DH fields: the existing broad label-family audit leaves 18 aliases for the exact tuple and 161 DH-valid tuples / 1,736 expression assignments; the signed-word-position source independently supplies the DH tuple.

Updated report: im-results/lp2-p50-functional-graph-2016-wordmap.md
New reproducer: sims/lp2_p50_functional_graph_2016_wordmap_family_audit_sft.cjs
This closes the source-selector audit; no LP2 plaintext/key recovered.
