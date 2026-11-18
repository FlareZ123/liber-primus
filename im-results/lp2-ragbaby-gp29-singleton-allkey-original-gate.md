# GP29 Ragbaby word-number cipher: original singleton-word all-key contradiction

**18 November 2026 | Agent19 | bounded exclusion, no recovered plaintext.**

## Why this mechanism is an independently motivated question

The verified 2016 Cicada wording about words, meaning, numbers and direction suggests investigating a cipher whose *numerical advance is determined by the actual printed words*. The historical **Ragbaby** cipher, invented in 1955, directly implements that human-recognizable instruction: it rotates a single secret mixed alphabet by the running word number and the position within the word. See the [American Cryptogram Association's Ragbaby reference](https://www.cryptogram.org/downloads/aca.info/ciphers/Ragbaby.pdf). Traditional Ragbaby merges letters into a 24-position alphabet. This experiment adopts the only literal *lossless* 29-symbol extension for the unchanged GP29 ciphertext and leaves the full 29! keyed alphabet secret. The historical name is a mechanism proposal, **not evidence Cicada selected it**.

## Exact necessary condition, all secret keys

Let `K` be **any** common bijection from the 29 printed GP glyphs into ordered alphabet ranks 0–28. A Ragbaby emitter applies

```text
K(cipher[w,j]) = K(plain[w,j]) + w + j  (mod 29)
```

with printed words numbered `w=1,2,...` and positions `j=0,1,...`. A fixed initial phase or negative progression only translates or reverses the residues; **neither changes their number of distinct values**. The argument also survives every nonzero affine word-step multiplier modulo the prime 29.

For any ciphertext glyph `g` occurring as a complete **one-rune printed word** at several word numbers, the corresponding plaintext words must be distinct whenever their `w mod 29` values differ: the right-hand side requires distinct plaintext ranks `K(g)-w`. Therefore a ciphertext glyph occurring at five different word residues must stand for **at least five different single-letter plaintext words**, independently of every choice of keyed alphabet. English source-native GP orthography permits **A, I and O** as whole single-rune words, at most three. One need not fit a language score, key or crib to obtain this exclusion.

The authentic original LP2 pp0–55 have **12,956 GP29 ciphertext runes, 2,896 complete printed words** (preserving all 32 cross-page words), and **83 complete one-rune words**. The key-independent witnesses are:

| Original singleton ciphertext | Five distinct global word residues (mod 29) | Original printed word numbers |
|---|---|---|
| M (GP index 19) | 14, 15, 17, 19, 21 | 336, 1558, 1609, 1639, 2745 |
| T (GP index 16) | 6, 12, 13, 16, 20 | 941, 977, 1340, 2452, 2477 |
| P (GP index 13) | 10, 15, 16, 22, 23 | 1001, 1466, 1750, 1820, 2575 |

All three independent witnesses demand five different original singleton plaintext symbols if the standard Ragbaby clock applies. The contradiction is exact for **every 29! unknown shared alphabet**, for both additive directions, and for phase shifts and nonzero affine rescalings of the word-count clock. No original plaintext hypothesis or key optimization enters the certificate.

The parser consumes the canonical `lp2-transcription.txt`: hyphens and periods delimit printed words; line wraps and physical-page markers do not, and the flattened ciphertext is independently asserted byte-for-byte against `lp2-corpus.json`. [Read-only Windows-compatible CJS SFT](../sims/lp2_ragbaby_gp29_singleton_allkey_sft.cjs) asserts the three witnesses and exercises a fully invertible nonidentity shared-key alphabet on a native-A/I/O-singleton plant with all 2,896 original word lengths. It decodes and re-encodes all **12,956/12,956** plant runes; the positive correctly passes the same three-singleton necessity.

## Exact scope and research fork

This excludes **ordinary English under a single global lossless GP29 Ragbaby mixed alphabet and the historical running word-number/letter-position clock**, even when the alphabet is completely unknown. It does **not** exclude arbitrary clocks, a new alphabet per chapter, a non-English language with five different single-rune words, a separately altered word-boundary channel, or the historical lossy 24-character merging system. Those require their own creator-visible clue and reversible reconstruction, so this result should **not** be used to launch offset, per-chapter or keyword sweeps. It supplies no authentic key, unknown-page plaintext or final destination. The productive next decision remains finding an independently selected missing operation or source key rather than tuning Ragbaby.
