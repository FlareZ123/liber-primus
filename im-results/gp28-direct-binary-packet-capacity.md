# The direct GP28-to-binary packet hypothesis has a secret-alphabet-independent capacity obstruction

**Classification:** exact, original-ciphertext, key-independent finite exclusion of two natural fixed-width binary transports. **No original LP2 plaintext, authentic key, or historical encoding method has been recovered.** This study investigates a distinct, narrower architecture than the existing 79/78 radix-conversion proof.

## The source-fixed 5-symbol opportunity

The canonical unsolved LP2 source has **12,956 runes** across 55 rune-bearing physical pages. When each page's initial rune is treated as an IV and the **86 actual equal-adjacent ciphertext steps** are treated as separate non-payload markers, exactly

```text
12,956 − 55 − 86 = 12,815 = 2,563 × 5
```

nonzero consecutive GP29 steps remain. Each nonzero step has exactly 28 possible values, and those can be mapped to radix-28 digits. The divisibility makes five digits per **three raw bytes** a mathematically natural, source-shaped candidate: `28^5 = 17,210,368` is slightly larger than `256^3 = 16,777,216`. Similarly ten digits have enough capacity for six bytes: `28^10 = 296,196,766,695,424` versus `256^6 = 281,474,976,710,656`.

**Assumption being tested:** take the complete original nonzero-step stream, assign each of its 28 possible labels to a different digit 0–27 by *any fixed, unknown 28-symbol permutation*, group into radix-28 integers of five or ten digits, and require each full packet to directly encode every possible 24-bit or 48-bit byte block in its usual nonnegative integer range. Consider both digit directions and every fixed global packet phase. Also let that same selected phase restart at each of nine printed manuscript sections or each physical rune page.

The 55 initial rune values and 86 doublets are explicitly excluded as assumed side-channel markers. Remaining terminal incomplete packets may be ignored. The hypothesis allows a completely secret 28! permutation, with no GP-native symbol-order assumption.

## Exact necessary conditions

For five-digit packets, the largest possible three-byte value is `2^24−1`. Its first radix-28 digit may be 27, **only when its second digit is in 0–8**. Thus whichever ciphertext step label is mapped to secret top digit27 must have **at most nine distinct observed following labels** among all packet-leading occurrences. This is an order-independent necessary condition: those nine or fewer followers are the only labels that could receive digit values 0–8.

For ten-digit packets, every six-byte value has first radix-28 digit **at most 26**. The label mapped to digit27 must therefore be entirely absent at packet starts. If **all 28 labels appear at packet starts**, the model is mathematically impossible under every secret permutation.

Both observations are exact consequences of numerical capacity. No language model, prime arithmetic, brute-force key fitting, or independence approximation is used.

## Results on original ciphertext

| Packet framing | Five-to-three, minimum observed distinct followers for *any* candidate top label | Ten-to-six, distinct packet-leading labels | Original input variants excluded |
| --- | ---: | ---: | ---: |
| One continuous stream | **23** | **28 of 28** | 30 / 30 |
| Restart at nine sections | **24** | **28 of 28** | 30 / 30 |
| Restart at every rune-bearing page | **23** | **28 of 28** | 30 / 30 |
| **Total** | All minima exceed 9 | All possible forbidden leaders occur | **90 / 90** |

Each five-to-three mode has five tested phases and two directions, while each ten-to-six mode has ten phases and two directions. Counts are over full packets. The original exact global starting phase yields **2,563 five-digit groups**, and no direct binary assignment is possible even if the 28-symbol alphabet is completely secret.

## Detection-power and exact inversion

[`sims/gp28_direct_binary_packet_gate.cjs`](../sims/gp28_direct_binary_packet_gate.cjs) creates two independently generated **unrestricted random byte streams**, each with a hidden deterministic 28-way permutation. The 3-byte plant contains **7,689 bytes in 2,563 packets**, and the 6-byte plant contains **7,686 bytes in 1,281 packets**. It encodes those byte blocks into radix28, maps the digits through the hidden permutation, synthesizes **all 12,956 ciphertext runes** with 55 IVs, and preserves the original **86 exact marked positions** by replacing only those steps with zero. In both plants, the key-independent necessary-condition gate **survives**, and the full original byte streams are **exactly decoded** from the ciphertext using the known synthetic inverse. All program assertions passed against the committed original LP2 data.

This is a powered test of this specific direct binary interpretation. It does not establish that GP28 step labels are encrypted binary or that doubled runes carry a plaintext escape symbol.

## Interpretation and boundary

The exact 12,815-divisibility by five is a genuine source-coordinate observation, but could easily be coincidental. The capacity theorem **excludes direct fixed-width, unrestricted 24-bit/48-bit binary integers** under a *single fixed whole-book 28-symbol order* and any one of the 90 declared phase, direction, and reset modes. These exclusions cannot be rescued by tuning or concealing the 28-symbol order.

The conclusion **does not cover** arbitrary independently chosen packet phases per page or section, a secret position-dependent permutation, additional whitening or cryptographic encryption of the digits, variable-length framing, restricted codebooks, hidden data in repeat/IV sites, or other binary-to-rune constructions. There is no statistical or cryptographic assertion that those alternatives are the historical LP2 cipher. The original ciphertext has yielded no raw file bytes or key.

## Reproduction

Run `node sims/gp28_direct_binary_packet_gate.cjs` against the repository's canonical `resources/liber-primus/lp2-corpus.json`. It checks all **90 exact variants**, asserts they are eliminated under every secret fixed rune order, regenerates both full manuscript-shaped ciphertext plants, and verifies the **7,689** and **7,686** planted bytes by exact inverse. Node 18+ built-in modules only. The exact committed implementation was executed using the authentic checked-in original source and passed all original-source and positive-plant assertions.
