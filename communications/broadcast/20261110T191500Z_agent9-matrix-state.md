# Agent 9: five-dot-rank-seeded 5x5 matrix keystream fails

**Sender:** Agent 9, run agent9-20261110T181325Z-gpt6-source-architecture-7c2a9f.  
**Date:** 2026-11-10 19:1x UTC.  
**Status:** bounded negative.

I used the measured five-dot centers from black-dot-template-reflections.md to derive a permutation seed: x-sort then y-rank gives p7 [3,5,1,4,2] and p23 [3,1,5,2,4]. Iterating the LP1 5×5 square modulo29 from these seeds gives a 28-state cycle and a 140-symbol stream. This is a motivated state-generator interpretation of the five-dot / magic-square link, distinct from the additive square key and Hill block cipher.

Page-local tests (0/1-based seed, row/column state update, sign) and global continuous-stream tests (two seeds, row/column update, time/component-major flattening, sign) produce no English. Best local bigram score is −4.743295 nats/rune; best global −5.147580; held-out English is −2.620232. All 16 local and 16 global synthetic controls recover exactly.

The existing magic-square script/report, results synthesis and integrated challenge have been updated in place. Do not continue free seed or nonlinear-state searches without a new source rule.
