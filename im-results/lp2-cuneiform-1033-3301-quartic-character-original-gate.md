# Cuneiform 1033/3301 as a quartic-character hexadecimal homophone carrier

**23 November 2026, Agent41. Classification: original-source direct receiver negative and fixed-codebook cardinality obstruction. No unknown LP2 plaintext, authentic cipher key, or final destination.**

## Mechanism that a 2014 player might try

Original LP2 p33–p39 prints two repeatedly paired cuneiform numbers, **1033 and 3301**. Both numbers are primes congruent to **1 mod 4**. Each of the 29 Gematria Primus runes has a known assigned *prime* `q`, beginning with F=2 and ending with EA=109. For each original modulus `p∈{1033,3301}`, compute a literal fourth-power-residue character `q^((p−1)/4) mod p`. This equals one of `{1,i,−1,−i}`, with the least positive square roots of −1 fixed as **i1033=355**, **i3301=1212**. Encode the ordered residue as one of `0,1,2,3`. The two printed moduli therefore supply a classical **four-bit hexadecimal label per rune**, allowing a hypothesized direct covertext channel, independently of an additive GP29 cipher.

This is a finite, source-bounded hypothesis: no original or signed historical instruction says to use quartic residues or name an ASCII/byte receiver. The same chapter was separately tested for ordinary quadratic-character bits, which did not decode plaintext ([one-/two-bit source gate](lp2-cuneiform-1033-3301-legendre-two-bit-original-gate.md)). This analysis considers a mathematically different order-four pair, including the count of representable hexadecimal symbols, rather than searching for yet another guessed arithmetic key.

## Exact full-alphabet cardinality obstruction

The original **29 GP rune types** partition into four quartic classes under 1033 with sizes `[3,5,9,12]` and under 3301 with sizes `[5,10,10,4]`. When the classes are combined in source order as `4·χ4_1033+χ4_3301`, their exact 16-entry occupancy is:

```text
hex class: 0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F
rune count:0  2  0  1  0  1  2  2  1  4  3  1  4  3  5  0
```

Thus **only 12/16 hexadecimal labels can ever occur in any GP29 ciphertext** under this pair of characters. Any secret but *stationary* mapping of the four-bit output to some other nibble values still has **at most 12 distinct outputs**, regardless of its unknown contents. In contrast, the authentic, independently solved physical p57 parable, transliterated as its actual 100 native Latin letters, uses **14 distinct ASCII low-nibble values** `[0,1,2,3,4,5,6,7,8,9,12,13,14,15]`. Therefore no fixed, memoryless 1033×3301 quartic-character-to-ASCII-low-nibble codebook, even an unconstrained secret one, can represent that reference page verbatim.

This is an **exact codebook-capacity test**, with a limited conclusion. It does not rule out unknown plaintext using only twelve low nibbles; different languages, compression, variable-length codes, position-dependent mappings, private state, or an additional transform might still use quartic-class bits. The authentic text control establishes why this simple fixed mapping is a poor candidate for normal Cicada-like prose. The missing hex labels also make *all* 16-byte possible byte values unreachable under a fixed pair interpretation.

## Complete original data, fixed binary receivers

The original data are `resources/liber-primus/lp2-corpus.json`, using all **12,956** unknown runes from pp0–55, the source-marked active cuneiform p33–39 chapter of **1,589** original runes, and the source-authored five red-numbered p36–38 passage units **139/91/98/96/129**, totaling **553** runes. No original rune, page, or source-number mark is changed.

For each of these three scopes test the two one-modulus two-bit interpretations and the combined four-bit interpretation. Permit the natural four-way rotations/reflections of each quartic residue class, both source modulus orders, two original page/unit/global clocks, both byte-endian packing directions and every phase 0–3 (single-modulus two-bit) or 0–1 (joint four-bit). This yields **1,280 literal source-typed candidates per scope, 3,840 total**, with no unknown symbol dictionary, extra key, arbitrary byte offset, or original-plaintext model fitting.

Original quartic class totals:

| Original source scope | 1033 class counts 0,1,2,3 | 3301 class counts 0,1,2,3 |
|---|---|---|
| p33–39 active 1,589 | 142, 263, 506, 678 | 286, 540, 556, 207 |
| Five numbered 553 | 50, 95, 162, 246 | 94, 188, 201, 70 |
| Full unknown 12,956 | 1,309, 2,241, 4,043, 5,363 | 2,328, 4,498, 4,382, 1,748 |

| Original recipient | Maximum printable ASCII (over all original candidate variants) | Longest contiguous printable run |
|---|---:|---:|
| p33–39 active chapter | **538/793 = 67.844%** | **22** |
| Five red-numbered units | **189/273 = 69.231%** | **24** |
| Full 12,956-rune unknown corpus | **4,255/6,462 = 65.846%** | **22** |

The top scores occur under independently offset/reflected quartic classes, with clearly nonprose hex prefixes; for p33–39 the maximizing 793-byte output starts `64 23 b6 02 43 7d 72 76 46 d7 32 46 9f 3e 6b d4`. A typical longest printable run is nonsense resembling `Fii.rb>7KfFF96$dg-rk4#`, rather than recognizable words. **None of the 3,840 candidate streams begins with a historically common BZip2, gzip, ZIP, PNG or PDF file signature**. The source does not provide a framing rule for untyped binary data, so this is a direct-text/header exclusion, not an argument that no secret binary payload can exist.

### Genuine solved-source positive and validation

The [read-only CommonJS Node22 reproduction](../sims/lp2_cuneiform_1033_3301_quartic16_original_gate_sft.cjs) asserts the source primeness and fourth-power classes, the actual 12-of-16 occupancy, the authentic p57 14-low-nibble control, and all 3,840 original decode candidates with full printed-page and red-numbered boundaries. A separate deterministic native solved-text positive encodes **3,239 ASCII bytes** of repeated genuine p57 parable transliteration into **12,956** fake GP29 covertext runes using just the 1033 quartic two-bit class; it avoids identical adjacent rune pairs and recovers all **3,239/3,239 bytes exactly**. This validates the receiver as an actual workable direct covertext encoding when given its intended code, and is **not claimed to decipher original unknown-page ciphertext**.

[Windows Node22 source-input CI PASS 45094039498](https://github.com/FlareZ123/liber-primus/actions/runs/45094039498). **Decision:** The exact classical quartic receiver, including all natural rotations and byte packing choices, does not recover plaintext or a recognizable byte object from the actual pages. More elaborate source-number residue remappings need an independently authored reason, an actual ciphertext receiver and a blind original-page prediction. Preserve the finite output-capacity bound; do not treat a short ASCII streak or the existence of source prime numbers as recovered plaintext.
