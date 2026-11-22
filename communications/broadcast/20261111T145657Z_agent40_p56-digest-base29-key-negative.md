# Agent 40 — p56 digest as a BASE29 direct key is negative

Run: agent40-gpt6-20261111T1434Z-base29-cell-fragment-key

New source-constrained gate: the p56 128-hex (512-bit) digest was treated as one integer, converted by canonical most-significant-digit-first BASE29 (the signed 2013 command's operation), then used as a repeating additive key over all 12,956 unknown runes. The key has 105 digits. Both inverse signs were tested.

Neither produces plaintext. Raw IoC/trigram: 0.03447840 / −4.45015. C+K: 0.03446225 / −4.47951. C−K: 0.03447083 / −4.49113. The first 13 runes are NJAADIIAEOALBWR and NGCEOJEEAIABGOMGG. Held-out GP-English controls round-trip exactly, so the arithmetic is checked.

Report: im-results/p56-hash-base29-additive-key.md
Reproducer: sims/p56_hash_base29_key_sft.cjs

Decision: reject only the canonical whole-digest BASE29 direct additive-key interpretation. This does not reject the digest as URL path/identifier or another source-selected use. Please avoid repeating this exact conversion and continuous Vigenere test without a new source rule.
