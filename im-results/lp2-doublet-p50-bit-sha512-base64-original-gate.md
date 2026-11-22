# 86 original equal-rune events and the known SHA-512: p50-bit Base64 channel obstruction

**Agent33, 22 November 2026. Classification: exact original-input, source-constrained negative. No recovered unknown LP2 plaintext, author-selected key, or continuation.** The [read-only CommonJS reproducer](../sims/lp2_doublet_p50_bit_sha512_base64_sft.cjs) passed [Windows Node.js 22 run 45019109544](https://github.com/FlareZ123/liber-primus/actions/runs/45019109544).

## A typed candidate with three separately visible inputs

The **55 original rune-bearing unsolved pages** (physical p0–55; runeless p50 retained in physical ordering) contain **12,956** GP29 ciphertext runes and exactly **86** equal-adjacent within-page rune events. The numeric p50 field contains **256** printed two-character tokens, of which **60** begin with a literal `0`. Under the previously studied continuous global rune clock, **33** of the 86 original event positions sit at a first-digit-zero table cell. The *independently solved* p56 `AN END` prints a SHA-512 digest of **64 bytes**, whose ordinary Base64 representation contains **86 actual sextets** followed by two `=` padding characters.

This suggests a particularly sharp, falsifiable side-channel hypothesis: perhaps each printed doubled rune supplies a GP29 value 0–28 and the p50 table supplies the extra binary value. Their product alphabet has **58** possible symbols, suitable for a secret stationary symbol encoder into Base64's 64 sextets. Freeze original events in printed order, assign the pair's second-rune global position `g`, and read

`r = GP29(C[g]); b = 1 if printed p50 token[(g−1) mod 256] begins with '0', else 0`.

Test both ordinary embeddings `s=r+29b` and `s=2r+b`, with an otherwise completely unrestricted unknown stationary mapping `f(s)` to Base64 sextets. This grants all possible secret 58→64 dictionaries, including lossy maps. The hypothesis is **not** an authenticated historical command: the 86/86 length equality is only a candidate selector, and prior work has found no author-fixed instruction to export repeats as bytes.

## Exact obstruction, independent of guessed cipher keys

| Frozen property | Original source and known target |
| --- | ---: |
| Original rune-bearing pages / runes | 55 / **12,956** |
| Genuine repeated-rune events | **86** |
| Events with the literal p50 first-digit-zero bit | **33** |
| **Distinct observed (rune,bit) source symbols** | **44** |
| **Distinct sextet values in the authentic p56 digest** | **46** |
| Original events contradicting their first same-symbol output assignment | **42** |
| Original events in matching control plant recovered and forward inverted | **86/86** |

Every stationary function on 44 distinct input states can emit at most 44 distinct outputs. The authenticated digest requires **46 distinct** Base64 sextets, so no 58→64 symbol map exists under *any* secret alphabet assignment or event permutation. This independently rules out even posthoc reordering of the 86 events for the stated stationary codebook.

A two-event explicit contradiction also holds in original printed order. At original global rune offsets **909** (physical p3 offset180) and **1591** (p6 offset121), the repeated glyph is GP index **25 (AE)** and the p50 first-digit-zero bit is **0** at both events. They would require **the same** output under any stationary codebook, but the corresponding ordinary Base64 sextets of the known SHA-512 are **58** and **3**. The alternate `2r+b` digit arrangement preserves this contradiction exactly. The contradiction is independent of unrelated ciphertext positions, source-language assumptions, and key magnitude.

The SFT independently reads the canonical original runes, original 256 printed tokens, and known p56 digest from the repository, asserts 86 events and 33 table-bit hits, constructs the actual Base64 sextets, and checks both embedding obstructions. A separate injective **secret** planted encoding `f(s)=(7s+3) mod64` maps all 86 original source event symbols to synthetic sextets, then the inverse recovers all 86, establishing that the test detects a genuine stationary codebook.

## Research decision

**Retire this exact 86-event, one-p50-bit-per-event stationary Base64 reconstruction of the known `AN END` SHA-512.** The original 44-to-46 distinct-symbol obstruction is stronger than the ordered two-event mismatch; fitting an arbitrary 58-way permutation, changing event reading direction, or reshuffling the 86 symbols cannot repair it. The source may still contain a different, explicitly changing-state or separately keyed channel, or a payload unrelated to the solved digest; those require a new author-supported reader and untouched original receiver. No unknown LP2 runes have been decrypted.

Prior distinct gates: [direct doublet Base64 digest channels without the p50 bit](../sims/doublet_base64_anend_gate.cjs) and [p50-bit readout as raw 86-bit sequence or Base58Check](lp2-p50-zero-doublet-direct-binary-read.md). This result tests the previously uncombined **`GP29 doublet value × p50 literal bit`** candidate against independently authenticated 86-sextet bytes.
