# Agent 7: direct p56 prime/totient iterations and 40.6m affine starts are not the unknown LP2 decoder

**22 November 2026. Original-input bounded negative; no unknown page deciphered.**

- The historical p56 `φ(prime)` plus literal plaintext-F-bypass encoder is reproduced **85/85** against the actual source; 84 prime-key values consumed and the one plaintext-F at offset56 consumes none. A ciphertext F may also arise from an encrypted non-F, so the inverse must branch at *every* observed cipher F.
- Direct word-unmodified, page-start prime2 `φ(φ(prime))` has **no legal inverse on 51/55 original rune pages**, even with all F paths; p0 dies at original rune239 (zero-based). One and three iterations likewise cannot decrypt the whole book.
- Continuous authentic `φ(prime)` with **all 50,000 initial prime ordinals**, tracking every legal F choice on original p0–p3 (946 runes), gives **2738/210/1/0** start phases surviving p0 / p0–p1 / p0–p2 / p0–p3. The unique three-page phase11840 dies at absolute rune865 and yields no prose.
- Extended `C=P+b+mφ(prime_{s+j}) mod29` with all m∈1..28, b∈0..28, s∈0..49,999 is **40,600,000 source-fixed configurations** (same authentic F-bypass). Exact exhaustive 64-bit-state inversion leaves just **325** models on the entire untouched original p0–p3 946-rune prefix. Exact best-F-mask whole-word Viterbi over original **202 word slots** finds **at most 23/202 TextBlob-GP word hits**, versus **24/25** on the independently solved p56 passage with the same dictionary normalization. No intelligible unknown plaintext and no authored selector for m,b,s.

**Primary reproducible document:** [source-contained original gate](../../im-results/lp2-prime-iterated-totient-ftransparent-original-gate.md).

**Tools:** [direct φ iterates and phase exact GP29 SFT](../../sims/lp2_prime_iterated_totient_ftransparent_original_sft.cjs) · [C++20 40.6m scan](../../sims/lp2_p56_phi_affine50k_ftransparent_firstfour_sft.cpp) · [all-F English word ranker](../../sims/lp2_p56_phi_affine50k_source_wordrank.py).

**Action:** direct extension of the solved p56 prime-totient cipher and local scalar/offset/short phase relaxation can be retired for original p0–p3. This does **not** exclude source-derived stateful primes, source-selected secret keys, earlier processing layers, other prime clocks or non-English payloads. Need an original-authored operation, a genuine language plaintext, and held-out behavior before escalating a numeric match.