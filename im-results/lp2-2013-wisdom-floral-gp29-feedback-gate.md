# 2013 CicadaOS wisdom/folly as a GP29-feedback key for the LP2 floral chapter

**Agent 20, 14 November 2026. Exact original-source inverse, negative.** The 3,008-rune LP2 physical pp40–53 chapter is not deciphered by the 14 finite key transfers described below. No unknown plaintext, authentic historical key, or destination was recovered. [Windows Node22 source-original run 43579715594](https://github.com/FlareZ123/liber-primus/actions/runs/43579715594) completed successfully, including exact 96-rune solved-page-plus-marker planted recovery.

## Why this particular source-to-recipient transfer

The archived 2013 CicadaOS files `/tmp/wisdom` and `/tmp/folly` are a byte-identical **3,368-byte** high-entropy buffer (source preserved as `resources/historical/cicada-2013-os-wisdom-folly.bin.b64`, SHA256 `7e5ec097728197f5c0dba0729980565658fba486965809ffa25e3910a31c385a`). The independently source-defined later floral chapter p40–53 contains **3,008 ciphertext runes**. Therefore the historical buffer is large enough to provide **one independent byte per rune**, with 360 spare bytes before allowing rejection. The numeric difference is a post-observation capacity coincidence; no source instruction actually assigns that 2013 buffer to the 2014 chapter.

The LP2 ciphertext contains very few equal-successor runes. A previously defined *reversible*, still hypothetical, GF29 multiplicative-feedback decoder explains a rare equality as GP symbol index28 irrespective of key: `C[i] = C[i−1] + K[i]*(P[i]+1) (mod29)`, where the key is any nonzero GF29 unit. Its inverse is `P[i]=inverse(K[i])*(C[i]−C[i−1])−1 (mod29)`. This model was introduced and independently tested with different key sources in [the earlier feedback study](lp2-gf29-multiplicative-feedback-original-gate.md). The present experiment tests the previously untried **actual original 2013 buffer as the entire key supply** in that model, rather than inventing a pseudorandom key or fitting an English crib.

## Frozen decipherment

Retain all 3,008 original GP29 rune indices in physical chapter order. The first is an observed initial ciphertext state; apply the inverse to the remaining **3,007**. Interpret the historical 3,368 bytes in their original order or full reversal. Use the source byte stream from offset0 or the 360-byte capacity remainder. Convert each source byte to a nonzero GP29 multiplier by one of these four deterministic transports:

- `1 + byte % 28`;
- `1 + floor(28*byte/256)`;
- rejection of bytes 252–255, then `1 + byte % 28`;
- `2^(byte % 28) mod29`, using the primitive-root choice 2 (the first GP prime).

This is **16** combinations, with **two** mathematically unable to supply 3,007 multipliers: the offset360/rejection pairing for either byte direction. The **14 complete** decoders are exact and reversible. Their exact original-input tests do not add key phases, tweak byte positions, change page/chapter order, or select a word crib.

## Original ciphertext decision

The unmodified 3,008-runic chapter has GP29 index of coincidence **0.034542627486**. Across all 14 complete inverses, decoded IoC ranges **0.035245549252–0.035424550522**. The best is **full reverse, offset0, rejection**. It consumes 3,068 source bytes to recover 3,007 symbols, with an unreconstructed forty-rune opening `AIPCXLHBEHPSBWPOAEONTHOEXCEEOIARGFUSLHDLDORJNG`. For comparison, the independently clear p57 GP29 PARABLE has IoC **0.062709966405** across 95 runes. All outputs retain near-uniform symbol frequencies and no coherent GP-native plaintext appears.

Even an arbitrary **single stationary secret permutation of the 29 decoded output labels** preserves IoC, so such an alphabet replacement cannot turn any tested entire output into ordinary GP-frequency plaintext. That argument assumes a single fixed bijection and ordinary GP-native language; it does not exclude non-GP binary payloads, evolving/nonbijective alphabets, additional cryptographic layers, different word handling, arbitrary source offsets or external keys.

The positive plant uses **all 95 known clear p57 GP rune indices**, appends one synthetic index28, encrypts all 96 positions using the original 2013 byte-derived rejection key and an explicit initial state, then exactly recovers **96/96** indices. The appended position produces the required same-ciphertext repeat. Every original candidate also re-encrypts all 3,008 source ciphertext runes after preserving the literal first state.

## Research consequence

Retire this **particular archival buffer → fixed GF29 multipliers → floral-chapter feedback** family. An exact 2013 key blob of adequate length was considered under a mechanism that itself explains the visible repeated-rune deficit; all source-order variants have now failed a direct original-cipher inverse. The buffer's capacity alone does not make it an authenticated key. A renewed investigation would need an independently printed instruction choosing a *different* byte consumption rule or a cryptanalytic result on actual original ciphertext, not another phase or modulus search.

[Single runnable CommonJS test](../sims/lp2_2013_wisdom_flower_feedback_sft.cjs) pins the original archive hash, original chapter size, full 14-variant readouts, inverse/forward reconstruction, and a solved-page-plus-rare-marker positive control.
