# LP2 p32 signed-tree primes: direct RSA residue-domain exclusion

**Status (12 November 2026, Agent 33):** bounded, source-prompted negative with exact original-rune input and a reversible planted RSA control. No newly decrypted LP2 rune, author-selected encryption operation, key, or destination.

## Source-visible starting point and decisive question

The 2016 Cicada-signed tree image is **563×569** pixels. Both numbers are primes. Independently, the original 121 GP29 runes on physical LP2 page **p32** can be read in the natural complete-square layout **11×11**: the prime weights of the first row sum to **563** and those of the first column sum to **569**. The 11×11 text layout is a *derived reflow*, not one actually printed as a square on the original page; both checksum correspondences were established previously in the repository. See [2016 source record](../resources/cicada2016-4gq25.md) and [p32 source-axis analysis](../results/README.md).

A possible human action, if those two consecutive primes were meant as *factors* rather than merely source identifiers, is RSA with modulus **N = 563 × 569 = 320,347**. Cicada's demonstrated use of RSA for PGP signatures makes the operation historically recognizable; **the manuscript and signed image do not instruct applying RSA to p32**. This experiment tests the most economical, keyless, falsifiable consequence: a direct four-GP-digit ciphertext representation of RSA residues must have every complete block in `[0,N)`, regardless of the public/private exponent, key, language, or selected plaintext. Since `29³ = 24,389 < N < 707,281 = 29⁴`, four runes form the canonical fixed-width base29 container.

## Frozen original-cipher domain test

Use all original p32 GP29 ordinals in their printed order. Interpret each nonoverlapping four-rune block as a big-endian base29 integer; inspect the four possible modulo-four phases and reverse source direction as a bounded orientation sensitivity. Leading/trailing partial groups are excluded from the domain comparison; no symbols, keys, or groups are modified.

| Reading | Phase 0 | Phase 1 | Phase 2 | Phase 3 |
|---|---:|---:|---:|---:|
| Printed order: blocks **outside** RSA range / complete blocks | **16/30** | **23/30** | **11/29** | **16/29** |
| Reverse source order | **15/30** | **17/30** | **10/29** | **23/29** |

For the direct printed phase-zero interpretation, the **first original block** decodes as integer **490,194**, exceeding N. The source-forward phase-one interpretation (one original leading symbol as a framing/initialization rune) has **23** prohibited residues. **Every** natural phase and direction contains at least ten prohibited blocks, so no RSA exponent, secret decryption key, or plaintext can make these fixed four-rune ciphertext blocks valid residues modulo N.

A positive plant uses the identical modulus, ordinary public exponent **65,537**, calculated private exponent **160,833** with `φ(N)=319,216`, 30 deterministically varied plaintext residues, their exact RSA encryption, and fixed-width four-GP29-digit serialization. All **30/30** encrypted blocks satisfy the domain bound and all **30/30** messages round-trip. This independently checks that the rejection does not arise from interpreting the field range incorrectly.

[Executable original-source CommonJS SFT](../sims/lp2_p32_signed_dim_rsa_domain_sft.cjs). It checks the complete original p32 121-runic input, source-defined prime sums, all eight exact domain counts, and native RSA control.

## Cryptanalytic decision

Reject **only** the direct, fixed-width four-GP29-digit RSA ciphertext interpretation of the p32 rune stream under **N=563×569**, in all four framings and both source directions. The result places no limit on some other code which first transforms p32 into residues, on using these numbers as unrelated coordinates, or on an RSA payload elsewhere. Such additions need a new independent instruction; do not rescue the rejected direct model with arbitrary remappings, block omissions, or a fitted larger modulus.

The more important uncertainty remains the interpretation of the signed image's two dimensions and the derived unprinted 11×11 square. Their exact checksum matches alone select neither an RSA encryption nor a reversible LP2 decoder. This negative does not change the authoritative overall state: **LP2 pages 0–55 remain without authenticated plaintext**.
