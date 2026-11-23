# P0–p2 Orthodox crosses and GOST 28147-89: source-paired original receiver

**Agent 8, 23 November 2026. Classification: a new, conditional, creator-era cipher-family receiver with a source-independent known-answer test and original LP2 negative. No decrypted unknown plaintext, independently authenticated cipher opcode, or confirmed destination.** This is a narrow test, not a mandate to vary subkeys, clocks or word boundaries to rescue a negative.

## What made this a motivated, distinct test

The original LP2 p0–p2 JPEGs (physical scans 17–19) visibly repeat **Eastern/Russian Orthodox three-bar crosses**, with a source-measured 180° orientation reversal. The [existing original-art gate](lp2-p0-p2-orthodox-cross-source-plate-gate.md) already establishes the iconography and rules out a literal Russian native-word-length explanation; it had not tested a particular *Russian cryptographic standard*. A technically literate pre-2014 solver might plausibly infer a Russian cipher rather than a Russian plaintext.

Independent manuscript inputs already exist before this hypothesis:

* The complete p0 first 13 **red heading runes** are a signed-era-attested BASE29 numeral `4b1cde6f9c9af1e1`, exactly **8 bytes**. Their authenticated source positions and p0 black-body onset are fixed by the p0 [physical ink adjudication](lp2-p0-red13-13dot-blackbody-original-source-adjudication.md).
* A [separate original p0 arithmetic/cross-page route](lp2-p0-red331-crosspage-fifth-p50-source-route.md) and an earlier [missing-4C fifth-column selection](lp2-p50-missing-l-secp256k1-address.md) nominate the same p50 32-row×8-column table's **fifth, top-to-bottom column**. Read in the already-described radix60 byte register, its exact **32 bytes** are `61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4`.

The GOST 28147-89 block cipher is a Russian standard predating 2014, with **256-bit key** and **64-bit IV** in its CNT/CFB modes. The *size pairing* is exact. The CryptoPro-A parameter set and standard 64-bit gamma output provide a finite, reproducible consumer. This selection has a strong rival: the crosses are repeated ornamental religious art, and many stream algorithms accept 32-byte keys and 8-byte nonces. **No Cicada first-party source actually names GOST, its S-box, CNT, CFB, or a GP29 byte map.** Hence a failure does not invalidate the real source identities; a match would need independent holdout.

## Frozen operator and test register

Original GP29 alphabet and physical page indices come directly from `resources/liber-primus/lp2-corpus.json`; the 256 original grid tokens from `resources/liber-primus/lp2-grid-256.json`. The 13 p0 red heading digits are *not* ciphertext for this test. The remaining **249 p0 body runes** plus untouched **266 p1** and **201 p2** runes give a continuous, fixed **716-rune** original receiver, with a **467-rune p1–p2 independent holdout**. No cyclic reset, IV tuning, selected word, red-key clock, unknown private key or arbitrary source subset.

The standard CryptoPro-A S-box and little-endian 32-round GOST encryption are fixed. The original 8-byte header is used as the IV as written, the 32-byte source column is the key, and the CNT mode produces exactly **one byte per stream position**. Because the tested span is shorter than 1,024 bytes, there is no GOST CryptoPro key-meshing event. Gamma begins:

```text
b83e4fddca4ed2dc8bae2b70cc4850cee4f5ed7ac5963cfdc2f15b312db9f651
```

As two **predeclared** GP29 reducers, either (a) take each gamma byte modulo 29 or (b) consume only bytes below232, then reduce modulo29 for unbiased digit frequencies. Both use the genuine 2014 `P=(C-K) mod29` subtractive alphabet. No plaintext-F holding is permitted in this experiment; a transparent-F version is a *different* opcode and would need an independent first-party cue. All original symbols reconstruct exactly by adding the same known gamma digits.

Independent *cipher* known-answer check: for CryptoPro-A, the published 32-byte key `00112233445566778899aabbccddeeff102132435465768798a9bacbdcedf0e1` encrypts block `1020304050607080` to `2685b30ddb497d05`; the reproducer requires this exact vector. It also encrypts/decrypts a genuine solved-p57 **95-rune** native GP source plant with the same fixed gamma to prove correct rune arithmetic. This positive proves implementation behavior, not creator intent.

## Exact original results

| Original test | P0 black249 GP29 IoC | Independent p1–p2 GP29 IoC | Combined716 GP29 IoC |
|---|---:|---:|---:|
| CNT, byte mod29, subtract | **0.03390983288** | **0.03469318359** | **0.03435949525** |
| CNT, reject byte≥232, mod29, subtract | **0.03426609664** | **0.03408662727** | **0.03448841661** |

Both plaintext candidates remain approximately uniform GP29 and have no coherent, contiguous source-native English. The first 35 GP index values render (with the standard GP chart) as nonlinguistic runs beginning `NGWXWULSSSTHAOEGOTHEOYEACSWRDXMOERY...`. Isolated common-looking digraphs within random-like output are not a decryption. The values are far below authentic connected GP English IoC of roughly .06, and crucially the independent p1–p2 holdout is no improvement.

A separate **binary** receiver, not another GP29 key fit, interprets only the original p0 black **249 runes** as one canonical big-endian BASE29 integer, encoded to **151 minimal big-endian bytes**. The same exact source key/IV yield:

| Fixed standard binary consumer | First 16 decoded byte values, hexadecimal | Printable ASCII/control-whitespace bytes |
|---|---|---:|
| GOST CNT XOR gamma | `f9b1e751f509e83de1991b864d8d3dd4` | **51/151** |
| GOST 64-bit CFB decode | `16c3e14a53663fc3e1b62ad00c327c90` | **53/151** |

Neither begins with recognizable English, image/document/compressed-file header, or a meaningful independent instruction. The CFB option is a **specified GOST receiver**, not a newly selected key schedule. The p0 packet is a fixed, author-visible chapter unit; no byte offsets or selective output snippets are tuned.

## Decision and next causal fork

**Retire this exact Orthodox-cross + source-paired GOST CryptoPro-A CNT GP29 and p0-binary CNT/CFB interpretation.** The source-based two-input key/nonce pairing is real and reproducible, but this standard receiver gives no connected unknown-page plaintext. Another S-box, key endianness, feedback mode, magic IV, key-meshing offset, private clock or novel GP reducer would be unlicensed model fitting absent a genuinely independent source instruction. The original 2014 crosses and p0/p50 source selector remain valid source features; no claim is made about every possible GOST-based compound cipher.

If an authenticated historical clue specifically names a Russian cryptographic mode/parameter set, one source-frozen new test could be justified; without that, prioritize a different independently motivated operation that reveals substantial unknown plaintext and predicts disjoint untouched runes.

**Reproduce:** `node sims/lp2_p0_orthodox_gost28147_sft.cjs` (read-only, dependency-free Node 22; full original source, KAT and p57 plant assertions). Sources for the period-standard cipher: [RFC 4357](https://www.rfc-editor.org/rfc/rfc4357), [RFC 5830](https://www.rfc-editor.org/rfc/rfc5830). The Russian crosses' visual classification is documented in the cited original-art study. No claim of native GitHub Actions execution is made until an execution is recorded.
