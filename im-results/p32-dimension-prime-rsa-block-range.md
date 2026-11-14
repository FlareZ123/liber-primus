# p32 source-selected dimension primes: direct RSA ciphertext range gate

**Decision (14 November 2026):** The 2016 signed-tree image's 563×569 dimensions, matched by the first row and column GP-prime sums of original physical LP2 p32, provide a concrete reason to consider an RSA modulus. Both dimensions are prime: \(563\cdot569=320347\), with \(\varphi(N)=319216\). Nevertheless, **the 121 original p32 runes cannot be 30 textbook-RSA ciphertext residues serialized directly as four GP29 runes**, under any of sixteen ordinary matrix traversals and packing conventions tested here. Every convention has at least fifteen blocks outside \([0,N)\). The historical source does not explicitly say RSA; no plaintext, author key or decryption has been recovered.

## Independent input and discriminating rule

1. Original signed 2016 tree-image dimensions: **563 by 569 pixels**. Physical p32 is a **121-rune** tape that can be reshaped into an **11×11** GP29 array. Its first row and first column have exact rune-prime sums **563** and **569** respectively (original-input transcription in \`resources/liber-primus/lp2-corpus.json\`). The original signed image supplies a navigation clue; RSA is an independently proposed mathematical interpretation.
2. For \(N=563\cdot569=320347\), base29 needs exactly **four digits** to represent arbitrary ciphertext residues: \(29^3=24389<N<29^4=707281\). Standard modular RSA ciphertext always satisfies \(0\le c<N\), regardless of the exponent, plaintext or private key.
3. Removing one possible framing rune from a 121-rune tape leaves exactly 120 runes, i.e. 30 four-rune blocks. We checked row/column traversal, forward/reverse tape direction, omission of first/last rune, and big-/little-endian base29 order. These choices include all source-obvious orientations without fitting a key.

| Traversal | Omitted rune | Invalid blocks, big endian | Invalid blocks, little endian |
| --- | --- | ---: | ---: |
| Row-major forward | First | 23/30 | 15/30 |
| Row-major forward | Last | 16/30 | 17/30 |
| Row-major reverse | First | 17/30 | 16/30 |
| Row-major reverse | Last | 15/30 | 23/30 |
| Column-major forward | First | 17/30 | 15/30 |
| Column-major forward | Last | 16/30 | 23/30 |
| Column-major reverse | First | 23/30 | 16/30 |
| Column-major reverse | Last | 15/30 | 17/30 |

These are **logical range failures**, not language-score failures. Since each putative ciphertext block must be less than \(N\), a single invalid block suffices. An arbitrary RSA exponent such as 3301 or 65537 cannot repair the inequality. The six planted numeric controls \(0,1,29,3301,24388,320346\) each round-trip exactly through the four-digit base29 codec. The code also verifies the two original p32 axis sums, primality and table geometry directly from the canonical corpus.

**Reproduce:** \`node sims/p32_rsa_563_569_block_range_sft.cjs\`. The script asserts source properties and emits all sixteen original-input cases. Its generator uses standard CommonJS and Node built-ins.

## Scope and next decision

Retire **only** this very specific RSA interpretation: p32 itself consisting of directly encoded fixed-width textbook-RSA ciphertext under the dimension-prime modulus. It remains logically possible that the dimensions index another page, supply a different key/state, or authorize RSA with a **separately specified** byte stream, packing convention or transform. Such a proposal requires an independently indicated source mechanism; brute-force reserializations would simply tune an unconstrained hypothesis. This bounded negative does not alter the established-state synthesis in \`results/README.md\`.
