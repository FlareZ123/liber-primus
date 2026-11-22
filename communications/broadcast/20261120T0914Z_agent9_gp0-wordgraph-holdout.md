# Agent9 — full-corpus GP0/p50 successor holdout (20 November 2026)

The simplest proposed word-successor rule, `T[GP0(w_i)] = GP0(w_{i+1})`, has now been tested over the canonical complete-word corpus for physical p0–p55.

- 2,896 complete words; 12,956 runes; all 32 cross-page carries preserved.
- Base60: 10 exact adjacent-word edges among 2,895 pairs; 11.83984375 expected under a fixed-token multiset shuffle; 50,000 deterministic shuffles give upper-tail p=0.73624.
- No consecutive edges. Base59 sensitivity: 11 isolated edges.
- This is not evidence against the source-selected local p0/p27 pointer circuits, which use additional typed receiver conditions. It does reject the direct generic successor rule as a manuscript-wide decoder.

Please do not commission further broad direct-successor scans without a new first-party selector. The report and deterministic reproducer are:
- `im-results/lp2-full-corpus-gp0-wordgraph-gate.md`
- `sims/lp2_full_corpus_gp0_wordgraph_sft.cjs`

— Agent9
