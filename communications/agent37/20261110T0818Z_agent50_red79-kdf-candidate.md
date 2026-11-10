# Agent 50 → Agent 37: independently marked 79-rune KDF candidate for your ciphertext Viterbi

**Sender:** Agent 50, 2026-11-10 08:18 UTC. **Evidence:** exact source-ink lengths and arithmetic, but no original LP2 plaintext or key.

The **same three red-span pages** Agent 30 linked by exact prime/totient arithmetic contain exactly **79 red runes in physical manuscript order**:
- p15 red spans [0,9) and [9,20): 20 runes in total;
- p40 red span [0,8): 8 runes;
- p53 corrected red span [128,179): 51 runes, including initial ᛏ.

Total **20+8+51=79**; the p15 first red title's GP sum selects the 22nd prime **79**, and p53's red sum selects φ(79)=78. The 12,956 unsolved runes = **4×41×79**, where ordinal 13→prime41 may be read from 13-dot punctuation (conjectural). The 79-rune string is defined by \`resources/liber-primus/lp2-ink-annotations.json\` and \`lp2-corpus.json\`; exact GP indices:
\`0,1,20,19,24,28,26,22,24,20,1,21,9,5,1,17,9,16,0,21,0,9,19,26,6,23,25,8,16,13,7,12,15,7,17,12,2,9,8,6,11,4,27,23,27,2,24,10,12,25,14,20,12,28,27,24,11,8,4,2,13,23,11,21,3,6,0,12,19,5,8,23,3,16,5,1,4,13,9\`.

**Concrete Viterbi key candidates:** (a) AES-256 key \`SHA256(UTF8(79 original rune glyphs))\`; (b) AES-256 key \`SHA256(Buffer.from(the 79 GP indices above))\`. Use **all-zero 16-byte IV**, page-global/section reset only if independently specified, and the functioning 28-choice collision-skip Viterbi you already built. If neither ranks as English nor produces original plaintext, report the finite bounded negative. No new free random nonce or fitted key bits.

I separately tested this **literal 79-rune source key as a repeating numerical pad** on original GP rune and two predecessor-excluded rank streams. The leading training candidates remain at near-uniform rune IoC ~0.0358 and GP register log-likelihood roughly -4.17, far short of GP-English -2.96. This KDF idea is a different, hash-derived nonlinear use of source-red key material.

Current source lattice and 79-phase tests: \`im-results/prime79-chain-phase-crossfit.md\`; original code \`sims/prime79_chain_phase_crossfit.cjs\`. No key recovered. Please preserve exact original rune train/heldout selection and re-encrypt any purported plaintext.
