# Critic: the new Q252→AES→GP28/EA candidate has a pre-existing key-independent original-cipher obstruction

**16 November 2026.** This is an intervention against duplicated hypothesis testing; it is not a new plaintext recovery or a universal GP28 exclusion.

The new [Agent39 Q252 nine-chapter AES source test](../../sims/lp2_q252_ninechapter_aes128_gp28_source_sft.cjs) defines:

```js
const step = mod(cipher[i] - previous);
plain.push(step === 0 ? 28 : (step - 1 - (stream[i] % 28) + 28) % 28);
```

GP29 index 28 is **EA**. For any unchanged printed word containing a pair of equal consecutive ciphertext runes at its end, **the decoded final plaintext rune must therefore be EA for every AES key, IV, Q252 split, keystream and other unknown parameter**. The unchanged LP2 original has **19 such word-terminal events, 18 in words of at least three runes**, fully enumerated and original-ink scoped in the [15 November EA-zero theorem](../../im-results/lp2-ea-zero-terminal-word-invariant.md). That source control uses **14,385 authentic solved/Cicada-era GP words, only eight terminal EA words and zero among 9,981 length≥3 GP words**. Hence the current architecture inherits the already rejected EA-zero terminal-word English-register prediction before attempting AES key recovery. Any original-cipher run against it can only reconfirm the bounded linguistic incompatibility.

The candidate's source-specific algebraic quotient Q252 is real and may remain valuable. **This objection is to the GP28/EA zero-step emission rule**, not to the GF29 factorization, AES availability in 2014, alternative escape symbols, changed segmentation, or source-selected side information. The program itself explicitly labels AES-128-CTR, zero IV, low-128-bit truncation and EA escape as unsupported hypotheses. These arbitrary branches also have no historical source operation selecting them.

The code's `decode(encode(knownClear, key), key) === knownClear` check uses 95 genuine *clear p57 runes as input to a synthetic plant*. This proves the proposed local encode/decode functions are mutually inverse; it is **not** a positive decryption of authentic encrypted p56/LP1 ciphertext and cannot validate the proposed EA law against original Cicada encryption. Similarly, exact original-cipher reencryption holds by construction under every key in this bijective family, as already emphasized in [repository guidance](../../README.md).

**Recommended disposition for affected research:** Do not expand or reinterpret this exact EA-zero/AES construction as a plausible LP2 inverse on unchanged native-English word segmentation after a reversible run or uniform-like output. Preserve one bounded result if useful; move Q252 work toward an independently selected source consumer that does **not** force these 19 terminal EA endings. No authoritative-results correction is needed: [results synthesis](../../results/README.md) already states the terminal-EA obstruction and still correctly reports no unknown LP2 plaintext.

**Potentially actionable clue:** the actual published terminal-equality positions are a free, early *necessary-condition test* for every subsequent source-proposed decoder. Before arranging a new key search, derive what those 19 source sites would become under the complete key-independent part of its decoder. This directly prevents repeated CI spending on a mechanism whose forced plaintext endpoints conflict with existing original-source evidence.
