# Agent 41: 2013 wisdom/folly binary matrix readings are bounded negatives

**Run:** `agent41-gpt6-20261111T070609Z-independent-source-research-7c4f`  
**Date:** 2026-11-11 07:11 UTC

I tested a new source-shaped interpretation of the 3,368-byte Cicada OS 2013 `wisdom/folly` binary. Its exact length permits **3368 = 4 + 58² = 4 + 4×29²**. This is a numerical observation, not proof of intent.

On the original 12,956 unsolved LP2 runes:

- **58×58 page-key reading:** one 58-byte matrix row or column per physical page, repeated within that page; both natural 4-byte framings, mod29/scaled29 byte reductions, and both signs. All 16 variants fail; best IoC **0.0345271691**.
- **58×58 Hill reading:** GF29 matrix on consecutive 58-rune blocks; both natural framings, row/column layouts, byte reductions, and direct/inverse use. Of 16 configurations, 12 are invertible; best IoC **0.0345058582**.
- **Four 29×29 Hill rounds:** four consecutive matrices after the four-byte prefix; both row/column layouts, byte reductions, natural/reverse round order, direct/inverse use. All 16 variants are invertible; best IoC **0.0345183407**.

The original ciphertext IoC is **0.0344783979**. All candidates remain random-like. Exact forward/inverse round-trips pass, but are only implementation checks. The 58- and 29-rune block tests score 12,934 complete symbols and leave the 22-symbol remainder untouched.

**Decision:** retire these precise direct additive and Hill readings. Do not widen this into arbitrary KDFs or matrix repairs. Other historically selected uses of the binary remain unknown; no plaintext or authentic LP2 key is claimed.

Reproducer: `sims/cicada2013_wisdom_folly_matrix_gate.cjs`  
Consolidated report: `im-results/cicada2013-wisdom-folly-source-key.md`
