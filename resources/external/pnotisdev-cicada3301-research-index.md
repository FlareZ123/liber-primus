# Independent Liber Primus research index: pnotisdev/cicada3301

**Snapshot inspected:** 2026-11-15T00:35:42.075Z. Repository HEAD at inspection: `15200c67abee106913ba01ff504c5b6e88d16cc7` (2026-10-24T00:35:39Z).  
**Source:** https://github.com/pnotisdev/cicada3301

This is a separate, substantial research programme. Its latest public status says that LP2 remains unsolved: 56 unknown pages, 12,956 runes, and no recovered plaintext. Its README reports 103 recorded tests (56 excluded, 33 partly excluded, 3 untestable, 8 open). Treat these as that repository's accounting, not as independently audited facts.

## Findings worth retaining

- Its best-fitting structural model, **R4**, combines a sparse within-word lag-6 affine rewrite (T(x)=24-2x\pmod{29}), anti-repeat behaviour, and an extra interior null in a fraction of words. This is a statistical/generative model, **not a decipherment or identified key**.
- The 2026-10-24 laptop review says that R4 decoder power was checked with planted controls; the null's exact location/count and check rule were not identifiable from LP2 statistics. The word-length anomaly persisted in rune spelling but not in letters. The lag-5/lag-9 cells were borderline and unexplained.
- The repo's open proposals include:
  - **H1 / item 47:** R4 outside a short-keyword Vigenère layer, with a structured stream plus keyword and skip/null-aware alignment.
  - **H2 / item 42:** a drift-free non-affine tableau / unknown key-to-row map.
  - Other low-prior R4 extensions: Cicada identifier streams, Anglo-Saxon Rune Poem data, LP1 Gematria sums per line/page, and selected historical numeric objects.
- H1/H2 are proposals, not results. The source-selection problem remains decisive: a stream and keyword must be motivated by an independently visible clue, not selected by a post-hoc language score.

## Relevance to this repository

The current repository already has independent lag-6/R4 work and a p50 remainder-stream inverse gate. Do not repeat the external R4 fit or broad key screens. The external H1/H2 proposal is potentially complementary because the combination of a structured stream, short keyword, and word-local null/repair alignment is distinct from a plain repeating-pad test.

This repository's own bounded p50-plus-short-key pilot is recorded separately in `im-results/lp2-p50-h1-shortkey-no-skip-screen.md`, with a reproduction script at `sims/lp2_p50_h1_shortkey_no_skip_screen.cjs`. It is only a no-skip additive screen, not a rejection of the richer H1 model. Simple known-text numeric streams are also screened in that run's supporting analysis; do not generalize those negatives to every possible transform.
## Recommended use

If a future agent pursues H1, first name the exact source that selects (t_j) and the short keyword (w); then implement the R4 + null + skip decoder with planted positives, null controls, and a frozen original-ciphertext window. Avoid another broad cipher menu. H2 needs an equally specific source for the tableau or row map.

## Primary external references

- Repository overview: https://github.com/pnotisdev/cicada3301/blob/main/README.md
- Hypotheses: https://github.com/pnotisdev/cicada3301/blob/main/docs/HYPOTHESES.md
- Current proposal list/status: https://github.com/pnotisdev/cicada3301/blob/main/work/laptop_review/11_next_100.md
- R4 mechanism: https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase57_mechanism.md
- R4 keyword screen: https://github.com/pnotisdev/cicada3301/blob/main/work/phase59_keywords_r4.py
- Mid-word decoder/plant references: https://github.com/pnotisdev/cicada3301/tree/main/work/chanscreen/v2

No third-party code was copied into this repository; this note paraphrases public findings and links to their original locations.
