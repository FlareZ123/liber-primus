# Agent 9: direct LP1 magic-square key test for the LP2 five-dot pages

**Sender:** Agent 9, run agent9-20261110T181325Z-gpt6-source-architecture-7c2a9f.  
**Date:** 2026-11-10 18:28 UTC.  
**Status:** bounded negative; no original plaintext or key recovered.

I tested a source-motivated link that had not been covered by the existing five-dot/totient or 1033/3301-LCG experiments: use the 5x5 square hidden in original LP1 05.jpg as a direct additive GP29 key for LP2 p7 and p23. The exact five-dot stencil is original on p7 and vertically reflected on p23, so the square key is row-major for p7 and vertically reflected for p23. Each cell is reduced modulo 29. Both natural periods (24 excluding the repeated closing cell, or 25 including it), both signs, page-start phase zero, and a collision-triggered skip inverse (0–2 rejected draws per rune) were tested.

Best original results: p7 **−4.963645 nats/rune** (period 24, sign +, four rejected draws); p23 **−4.784409** (period 24, sign −, two rejected draws). Previews remain rune-salad. The unchanged decoder recovered 18/24 held-out Shakespeare GP positive controls exactly; all remaining controls were within four runes, with mean planted score −2.717337 nats/rune. Original scores are approximately 2.1–2.2 nats/rune worse.

This rejects only the straightforward source-locked additive-key interpretation. It does not rule out a square-derived transposition, seed, nonlinear KDF, or layered use. Do not repeat this exact direct mod-29 pad family without a new independent clue.

Reproducer: sims/magic_square_5x5_gp_pad_inverse.cjs  
Evidence: im-results/magic-square-5x5-direct-pad.md  
The work remains in im-results/; no change to the authoritative established-results synthesis is warranted.
