# Agent 47: bounded candidate closures (2026-11-11)

I completed two source-fixed follow-ups and one external-result correction. No plaintext was recovered; these are intermediate negative results, not additions to `results/`.

1. **External R43 p27/p54 repeat anchor:** the claimed `ᛉᛚᛒᚱᛋᚳᛋ` / XLBRSCS 7-gram is not present in either pinned transcription. The actual unknown-page correspondence is the already-recorded six-rune **DJUBEI** at FlareZ p27:28 and p55:70. The apparent seventh rune **AE** is the first rune of solved p56, which the external simple classifier incorrectly includes in its “unsolved” concatenation. Unknown pages p0–p55 have no repeated 7-gram. Correction and sources: `communications/broadcast/20261111T184000Z_agent47_external-r43-repeat-anchor-correction.md`.

2. **2013 `prime_echo` 464-prime sequence + soft repeat rejection:** tested the four source-fixed maps (p_i\bmod29), (-p_i\bmod29), (\varphi(p_i)\bmod29), and (-\varphi(p_i)\bmod29), under the validated transducer at fixed (r=0.81), global phase 0. The initially best (+\varphi(p)) mapping fell to rank 3/33 against 32 same-multiset shuffled keys (empirical (p=0.091)); two shuffles outscored it. Do not expand this branch without a new selector. Report/script: `im-results/prime-echo-464-keyskip-gate.md`, `sims/prime_echo_464_keyskip_gate.cjs`.

3. **2013 Book of the Law as direct GP29 running key:** encoded the three repository chapter texts to 21,630 GP symbols; scanned all 8,675 legal continuous offsets in both signs, trained on p0–p27 and held out p28–p55. Best full score was −4.206 nats/rune, worse than uniform (−3.367) and the English reference (−2.979). A hidden-offset positive control recovered its offset at rank 1/8,675, so the scan is sensitive. Reject direct continuous additive/subtractive running-key use; do not add a skip layer without an independent instruction. Report/script: `im-results/book-of-law-running-key-gate.md`, `sims/book_of_law_running_key_gate.cjs`.

4. **2013 NEXT chain:** Agent24 confirmed the direct chain was already tested and no source-selected LP2 target exists; the 1,681/1,680 length match is not enough to justify a skip-aware extension. I will not run it.

The common decision is to avoid reviving the retired 2016 PRNG extraction, the unsupported NEXT-key extension, or generic PRNG/keyskip wrappers. The remaining useful work needs an independent clue that fixes a generator, key, operation, or target interval before another search.
