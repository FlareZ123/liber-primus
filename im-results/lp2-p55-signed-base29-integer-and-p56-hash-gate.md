# P55 original BASE29 integer conversion and p56 direct hash gate

**Decision (Agent28 and Agent20, 12 November 2026):** Four fixed, source-visible p55 GP29 numeral registers decode to well-defined 47-, 46-, 27-, and 20-byte integers. None is the direct SHA-512 preimage of the 128-hex target printed on solved p56, nor does one begin with the tested file signatures. A separate direct SHA-1 integrity interpretation of the complete 33-exterior/43-interior split also fails byte-exactly. No unknown original plaintext, key, cryptographic mechanism, packet or destination was recovered.

## Source-motivated operation and limits

The signed 2013 TCP source defines integer `BASE29`, with `3301 -> 3QO` in the alphabet `0123456789ABCDEFGHIJKLMNOPQRS`. The p56 solved prose refers to a deep-web page that hashes to its exact printed digest, while solved p57 says to shed the circumferences and find the divinity within. These support one cheap test of a base29 *integer-to-bytes* consumer on physical p55, not an authenticated instruction to do so. Its 76 original physical-page runes start `LPJA7FHE` under the historical digit alphabet, but its first rune NG completes a word inherited from p54. The page has sixteen complete printed words after that carry; their strict interiors contain 43 runes, the complementary positions 33. The words do not directly specify a hash algorithm, byte order or serialization.

Freeze four registers before digest testing: (1) all 76 p55 page-local digits, (2) the 75-rune complete-word body, (3) the 43 strict interiors preserving original order and (4) the 33 complementary exteriors. For each, interpret its digits as one unsigned most-significant-first base29 integer; encode as minimal nonempty big-endian bytes. Preserve digit width for the exact inverse, including leading zero digits. There are **no fitted offsets, secret alphabets, IVs, phase shifts, byte paddings, word permutations or alternative endian choices**. Direct UTF-8 ASCII digit emission, a different model, was previously supplied in [p56 factorization/UDP hypothesis](p56-factorization-udp-endpoint-hypothesis.md); the manuscript-wide BASE29 integer conversion was previously tested in [whole-stream integer gate](lp2-whole-stream-base29-byte-gate.md). This report isolates four distinct source-shaped short inputs.

## Actual p55 original-input inversion

| Register | GP digits | Minimal bytes | Hex prefix (16 bytes) | SHA-512 prefix (8 bytes) |
| --- | ---: | ---: | --- | --- |
| Physical page | 76 | **47** | `01bddc70abe922301b15ddc26fe5f0d5` | `75c1ba3f2c6234c6` |
| Body after p54 carry | 75 | **46** | `1208186d45908c0295580334de97f691` | `135bfc09621dd80a` |
| All strict interiors | 43 | **27** | `013d669f55a697d6b56275a7974c8245` | `4ae0dade98356205` |
| All complementary exteriors | 33 | **20** | `efe89bff1c7eff588ec80605c99a3640` | `c89f0ee48fc27742` |

Each exact integer re-encodes every original digit, including zero-value runes. Each complete SHA-512 digest is independently different from the source p56 printed target `36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`. All four byte strings have zero prefix matches among gzip, ZIP, PNG, PDF, bzip2, XZ, 7z, JPEG and ASCII-armored PGP signatures. Absence of these headers does not prove the bytes are unstructured or unencrypted. The source is not explicit about SHA-512; a 128-hex digest merely makes it a natural predeclared choice.

The exact reproducer confirms the signed 2013 `3QO` example; it round-trips each entire original digit stream; and it plants an independently valid gzip byte stream encoded in exactly 43 base29 digits, recovering the original gzip and its plaintext with the identical integer-to-byte inverse. Original nonmatches are therefore distinguishable from a broken encoding implementation. The planted gzip is a synthetic test, not an LP2 file.

## Independent 33-exterior / 43-interior SHA-1 integrity check (Agent20)

The original 16 printed complete words on physical p55 have **32 outer endpoint runes**, plus one incoming p54 carry, versus **43 strict interior runes**. In the signed 2013 BASE29 digit alphabet, the 33 outer digits represent exactly **20 bytes** (160 bits), and the 43 inner digits represent **27 bytes**. In-period Cicada material uses SHA-1 for signed-message digests. Taken literally, this suggests a keyless and source-geometry-selected integrity rule: **outer integer = SHA-1(inner integer's minimal big-endian bytes)**. No manuscript instruction actually selects SHA-1, and the digest might instead cover an unknown plaintext; the finite test is restricted to this unkeyed original-ciphertext reading.

On the unchanged 75-rune complete-word body and one incoming carried rune, the **original 33-digit outer integer** serializes to `efe89bff1c7eff588ec80605c99a364067960320`. The SHA-1 of the **exact 27-byte interior integer** (hex `013d669f55a697d6b56275a7974c8245639c8c8e09d48f70e92368`) is **`eddad4828e992391bb68e4e22a7673071f033420`**. They differ, so this full-length, no-key integrity equation fails. This comparison is distinct from the already-tested **signed-2016 SHA-1 digest as an encrypted exterior crib** in [the 33/43 shared-pad gate](p55-2016-sha1-exterior-crib-inner-gate.md).

The existing CommonJS SFT now asserts both complete original byte strings, calculates the inner SHA-1, rejects equality, and tests a positive carrier by encoding that actual digest in exactly 33 GP29 digits, recovering the same 20 bytes. It also validates SHA-1 against the independent standard `abc` vector. This rules out only direct SHA-1 checksum presentation by the original exteriors; a keyed MAC, decrypted interior, alternate message serialization, or separate target remains untested without a source instruction.

## Decision for downstream work

Do not pursue a plain direct BASE29 integer rendition of these four p55 registers as the p56 SHA-512 preimage or a file with the listed literal magic bytes. A further cipher, different serialization, historical deep-web page, or source-selected key could still exist. The only useful reopening event is a puzzle-authenticated **format/byte-order/key directive** or independent original output validation; testing arbitrary p55 offsets and word permutations would create unbounded false discoveries.

**Reproducer:** [`sims/lp2_p55_base29_integer_sha512_gate.cjs`](../sims/lp2_p55_base29_integer_sha512_gate.cjs), CommonJS Node 22, reads the original `resources/liber-primus/lp2-corpus.json`. Full original-repository SFT passed [manual GitHub Actions run 43274646188](https://github.com/FlareZ123/liber-primus/actions/runs/43274646188) on Node 22; the independent local exact-string fixture also passed.
