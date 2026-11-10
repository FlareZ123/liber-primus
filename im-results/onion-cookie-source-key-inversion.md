# Fixed 2013 onion-cookie key material under direct LP2 stream ciphers

**Evidence class:** source-defined candidate-key experiment with exact planted decryption and independent original-page holdout. Agent 13, 2026-11-10. **No recovered plaintext, key, or intended puzzle destination.**

## Independent historical key hypothesis

A preserved [2013 Cicada hints archive](https://github.com/scream314/cicada3301/blob/master/hints_never_used.md) reports two 64-hexadecimal-digit cookie values from the old \`p7amjopgric7dfdi.onion\` server under the labels \`167\` and \`761\`. Each value is exactly **32 bytes**; the labels are decimal digit reversals. The original intended role of the cookies is unknown. Their 256-bit length motivates a narrow test as native AES-256/ChaCha20 keys, without treating a session cookie as authenticated LP2 key material.

Seven source-controlled keys are tested: each cookie as written, each byte-reversed, their bytewise XOR, and SHA-256 of their concatenation in each order. The full test crosses **seven sources × two stream ciphers (AES-256-CTR, ChaCha20) × three clocks × two byte reductions × two directions = 168 models**:

- The clocks are continuous zero-IV across all unsolved pages, zero-IV reset at each page, and page-number-in-IV reset at each page.
- Byte-to-rune mapping is raw byte modulo 29 or \`floor(byte * 29 / 256)\`.
- Both additive inverse directions operate on the actual 29 Gematria Primus indices.

The actual ciphertext input consists of **all 12,956 runes of the 55 rune-bearing unsolved LP2 pages**, from the canonical original-page data. The training set is even physical pages; odd physical pages are untouched holdout. Language screening measures the pooled 29-way index of coincidence of the inverse-decrypted symbols.

## Completed original-ciphertext result

[Successful GitHub Actions run 42789169226](https://github.com/FlareZ123/liber-primus/actions/runs/42789169226) executed the entire fixed model family and the same-family planted control under Node.js 22.23.4.

| Result | Training IoC | Held-out IoC |
| --- | ---: | ---: |
| Original ciphertext, winner selected on training | **0.0346325095** | **0.0344862496** |
| Original ciphertext, *postselected* best held-out candidate | 0.0344402676 | 0.0346191118 |
| Exact synthetic GP-English encrypted with source cookie 167 as AES-256-CTR, page-index IV, byte-mod29 | **0.0553368377** | **0.0559267837** |
| Uniform 29-rune reference | **0.0344827586** | **0.0344827586** |

The fixed original-training winner is **cookie 167, ChaCha20, zero-IV page reset, byte-mod29, positive encryption sign**. The original held-out score is effectively uniform; it does not recover recognizable LP2 English.

The positive control uses a disjoint Shakespeare-derived GP-English passage, the authentic page lengths, an actual chosen 2013 cookie, and **342 deliberately injected adjacent-repeat alterations** at an 81% collision rewrite probability. The exact true key and transformation ranked **first of all 168 models**, retained GP-English concentration on both manuscript halves, and produced a substantial separation from all incorrect models. The visible synthetic forward transform is directly invertible before the optional deliberate overwrite. This demonstrates the test would detect the specified key architecture despite several hundred mutations.

## Interpretation and reproducibility

The two reported 2013 cookie values, the tested concatenation/XOR/reversal constructions, and these direct AES-256-CTR/ChaCha20 additive modulo-29 stream models fail to explain the original LP2 ciphertext. The result does **not** exclude the cookies as an intermediate seed for a different KDF, a word-local transformation, other ciphers or IV schedules, non-English source registers, or unrelated archived keys.

Reproducer: [\`sims/onion_cookie_key_probe.cjs\`](../sims/onion_cookie_key_probe.cjs) reads the original LP2 corpus, generates every byte stream using built-in Node.js cryptography, checks the planted-key rank, and prints all original-training leaders plus the holdout decision. The [manual-only runner](../.github/workflows/onion-cookie-key-manual.yml) invokes this SFT without adding per-commit CI. These source values should not be promoted to established LP2 key material without an independently demonstrated inverse on original ciphertext.