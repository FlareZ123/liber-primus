# Scroll255 GF4/radix59 word channel: historical digest and totient consumers

**Original-source experiment, Agent11, 22 November 2026.** The underlying 255-word to 255-rune registration and GF4/radix59 correction remain **conditional**; no new unknown LP2 plaintext, selected key or original decipherment operation is recovered. The purpose of this report is to retire one bounded family of directly historical, nonlinear word-to-one-rune digests without reopening the already exhaustive additive codebook tests.

## The source-defined receiver and causal premise

Original physical LP2 p3–p7 has **255 printed complete GP29 words (1,145 runes)**, followed by p8's **255 GP29 runes**. The original final five red p7 whole-word index products `[11,26,8,15,2]` induce a primitive GF4 255-state clock, and p49–p51's 256 printed two-character cells admit the existing speculative radix59 interpretation. With the previously frozen clock and table, `H_i=(p8[i]+table59[GF4state_i]) mod29` produces a full 255-element checksum candidate.

The original three literally repeated scroll-word pairs and the fourth reversed two-rune anagram give exactly four equal corrected values `[[20,20],[8,8],[2,2],[9,9]]`. The fourth pair was recognized during earlier exploration, after key fitting; the original p8 corrected stream has GP29 index of coincidence **0.0372703412**, far below native solved p57's **0.0627099664**. A stationary *order-insensitive* hash of a scroll word is a possible explanation of four corrected equalities, but no manuscript instruction selects such a hash, the alignment, GF4 or radix59. See [the earlier original fourth-pair analysis](lp2-scroll255-gf4-radix59-untrained-anagram-fourth-equality.md) and [the already exhaustive additive-codebook exclusion](../sims/lp2_scroll255_gf4_radix59_secret_wordhash_obstruction_sft.cjs).

**New independent operand question:** historical Cicada source messages demonstrably used cryptographic hashes and its solved LP2 p56 explicitly uses the totient. Can one literal historical digest of an authentic complete source word supply `H_i` for all 255 entries, while preserving anagram equivalence when appropriate?

## Frozen nonlinear digest operation

The [read-only source-rebuilding Windows/Node22 SFT](../sims/lp2_scroll255_gf4_radix59_historical_digests_sft.cjs) tests **48** literal full-register digest functions, the cross product of:

- hash algorithms **SHA-1, SHA-256, SHA-512**;
- source encodings: literal rune UTF-8, canonical GP Latin transliteration, raw GP29 ordinals, published GP prime values; and the same four encodings with glyphs **sorted by GP index**, thus giving an order-insensitive hash;
- output reduction: first digest byte modulo29 or entire digest as a big-endian integer modulo29.

Every model is a *fixed, deterministic whole-word checksum* with no secret salt, fitted offset, partial-word omissions, adaptive key, or changing input alignment. Exactly **0/48** match the **255/255** original corrected values; the best, **SHA-1 on sorted Latin transliteration reduced by first byte modulo29**, matches only **16/255** original values. The script independently reconstructs the authentic original register, asserts all four earlier equalities, tests every original glyph, and successfully encrypts and recovers **255/255** original-length synthetic SHA-256-derived checksums under the same frozen GF4/radix59 pad. Its real Windows GitHub Actions execution passed: [run 45044741518](https://github.com/FlareZ123/liber-primus/actions/runs/45044741518).

A separate exact computation on the same original word and corrected p8 registers examined the explicitly solved-p56-motivated `phi(∏GPprime(word)) mod29` function. It matches **7/255** original values; even fitting every affine `(a·phi+b) mod29`, `a,b∈GP29`, gives at most **19/255**. The plain original-word prime product with the same 841-affine family tops **21/255** (the latter was previously reported). These supplementary deterministic totals are diagnostic, not a new multi-key search.

## Decision and scope

**Retire literal unsalted historical SHA-1/SHA-256/SHA-512 word digests on the eight defined serializations, as full 255-output consumers of this frozen candidate receiver.** The mathematical checks do not exclude a source-derived keyed hash, a hash over the exact arbitrary-precision prime product as a textual serialization, a nonstationary word transform or a different receiver. Each would require an **independent 2014-accessible instruction selecting its full operands and rule** before another original-input sweep. Fitting 251 arbitrary word outputs or expanding untyped salts would reproduce source data without recovering authentic plaintext. No change to `results/README.md` is warranted.
