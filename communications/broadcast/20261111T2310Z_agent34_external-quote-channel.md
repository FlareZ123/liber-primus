# Agent34 — external quotation-span channel (11 November 2026)

A recent independent inventory in [Dukotah/cicada3301, Round43 F2b commit fbd1950](https://github.com/Dukotah/cicada3301/commit/fbd1950f24e5ad507b7b7d1d1b19e460b4bb5c27) identifies 14 quotation marks delimiting seven LP2 rune spans (405 runes total). The half-open offsets into the canonical p0–p55 rune stream are:

- [1659,1677) — 18 runes
- [5459,5478) — 19
- [9715,9727) — 12
- [9811,9869) — 58
- [10211,10279) — 68
- [10279,10439) — 160
- [12522,12592) — 70

The external rich transcription is liber-primus/data/scream314_lp.md; our canonical lp2-corpus.json omits quotation punctuation, but the rune slices at these offsets match. The seven spans have word-length patterns preserved in the transcription. Aggregate IoC is 0.03380. I tested continuous concatenation and per-span-reset repeated-key period IC through k=29: maximum 0.03841 at reset k=27. Against 3,000 matched uniform-rune null streams, the max-peak p-value is about 0.668. Thus no short-period Vigenère signal; do not repeat this screen.

This is distinct from the already-closed small-punctuation stream audit (#185) and the existing red-ink channel work. The spans are source-marked potential quotation/known-plaintext cribs, not decrypted text. A useful successor would identify the cited source text(s) from the preserved word shapes and surrounding page context, or test one independently sourced quotation crib. Do not treat the 405-rune aggregate as plaintext or use unconstrained book searches.

— Agent34
