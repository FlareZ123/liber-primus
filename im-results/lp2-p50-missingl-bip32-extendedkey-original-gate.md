# P50 missing-L scalar as a BIP32 extended key: complete original-page inverse gate

**Agent 50, 23 November 2026. Classification:** a previously untested, 2012-era standard Bitcoin hierarchical key schedule is reproducibly applied to all 56 unknown LP2 pages. The resulting 16 fixed source-derived original decryptions reveal **no original unknown plaintext, author-specified operation, key schedule, or destination**. This distinguishes this bounded result from existing direct Bitcoin scalar/pad, ECDH, image-mean and original steganography gates.

## Plausible physical key route and its critical missing premise

The original physical LP2 pp49–51 print a 32×8 table of two-glyph base60 numbers. Its 256 literal bytes admit **eight source-ordered, full 32-byte columns**, naturally divisible into four adjacent 64-byte column pairs. A separately established high-band run **HIJK[L]MNO** contains a missing `4C` ASCII L and conditionally selects the fifth column (zero-based column4), whose unchanged private scalar is:

`61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4`

Standard Bitcoin compressed P2PKH encoding maps this exact scalar to `1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK`. The conspicuous address is a conditional source value previously discovered and tested by other agents [here](lp2-p50-missing-l-secp256k1-address.md). It motivates asking whether the **adjacent fifth/sixth table columns**, L and M, were an extended private key consisting of 32-byte private scalar and 32-byte BIP32 *chain code*. That representation and BIP32 hierarchical derivation existed by 2012 and could give separate deterministic page keys. The immediate left K column is a weaker symmetry control, since it is adjacent without respecting left-to-right pairing.

**Strongest objection:** no original runic phrase, 2014 signed instruction, or source table header identifies Bitcoin, BIP32, an extended private key, any page-number derivation index, or the GP29 inverse. Even the mean-PNG interpretation of the vanity address remains post-recognition speculation. Therefore this is a *finite candidate decoding mechanism*, not an authenticated cipher.

## Exact historical key schedule and 16 frozen receivers

The original source table is verified in its conventional base60 reading by full SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Freeze the missing-L column4 as the secp256k1 parent private scalar. Use either original adjacent column3 (K) or column5 (M) as the exact 32-byte chain code. Derive each page's immediate BIP32 child private scalar using `CKDpriv(parent, physical-page-index)`; test normal indices 0–55 or hardened indices `0x80000000 + page-index`. The mechanism uses the BIP32 HMAC-SHA512 and secp256k1 standard without tuning a seed, key phase or key stream from ciphertext.

For each resulting physical page, serialize its derived child private key into 32 big-endian bytes and repeat those bytes modulo29 across that *page's original rune positions*. Test exactly two reversible GP29 cipher receivers, each with either sign:

- **Direct:** `P[i] = (C[i] ± key[i mod32]) mod29`.
- **Chained step:** `P[i] = ((C[i]−C[i−1]) ± key[i mod32]) mod29`, taking `C[−1]=0` at each page start.

There are **2 physical adjacent chain-code choices × 2 historical BIP32 child classes × 2 original inverse receivers × 2 signs = 16 full-book candidates**. The chained-step version addresses the original near-absence of identical consecutive runes without assuming it is truly this cipher. No arbitrary English keywords, untethered cipher layers, nonce search, phase sweeps, image transformations, or hidden skips are added.

The script first reproduces two *published official BIP-0032 test vector 1* serialized `xprv` strings at `m/0'` and `m/0'/1`, and the original table-derived `1Meanpng` P2PKH address. All 16 variants exactly reencrypt **all 12,956** original unknown ciphertext runes. Each variant also encrypts and decrypts the independent native-GP 95-rune authentic solved p57 sample exactly. These positive controls verify the declared machine, not the LP2 cipher hypothesis.

## Original result

| Register | Observed 29-symbol index of coincidence |
| --- | ---: |
| Original unsolved pp0–55, 12,956 runes | **0.0344783979** |
| Best among 16 complete BIP32 inverses | **0.0345130846** |
| Worst among 16 complete BIP32 inverses | **0.0344462730** |
| Opening physical pp0–2 (729 runes), across all 16 | **0.0341353–0.0352997** |
| Terminal pp54–55 (308 runes), across all 16 | **0.0335463–0.0355133** |
| Solved original p57 native-GP English (95 runes) | **0.0627099664** |

The best full-book score uses the **right-adjacent M column chain code, hardened children, chained-step GP29 receiver and plus sign**. Its first40 output runes have GP0 indices `[15,13,10,18,4,27,12,5,7,14,19,4,5,9,26,23,20,21,12,26,0,23,18,4,21,20,8,28,20,8,21,3,11,0,8,20,11,18,25,9]`; they contain no readable GP-native original opening, and its complete ciphertext register remains chance-like. The entire opening and terminal sample likewise remain close to the uniform GP29 baseline `1/29 ≈ 0.03448276`. No hidden original page has been decrypted.

The source-only first three BIP32 child addresses under that leading case are `15Tn4TugaQNukWx6FpaMhMpi8dyzEX6AJR`, `154RvyNKJ7mue76A7Vx3K1K5xG8PLZpT8b`, `1AFodXNoE1pXTFmYGMRcDPQpBMcjDEXK2g`. Unlike the established parent `1Meanpng` prefix, these supply no obvious typed continuation.

## Independent complete 192-byte original-table receiver

A second original-byte consumer asks whether **the two adjacent 32-byte columns L/M are an unencrypted extended-key header** and the other **six original columns (192 bytes)** constitute a short encrypted file. This keeps all 256 table cells accounted for without assuming any unknown plaintext or repeated source byte. It has a distinct possible human solve-path: historical Cicada used XOR on binary operands in 2013, and BIP32 defines exactly a 32-byte child private scalar.

Freeze L at original column4 as the private parent and M at column5 as the 32-byte chain. The unchanged ordered ciphertext columns are `[0,1,2,3,6,7]`; derive **six standard BIP32 child scalars** at `m/0,…,m/5`, concatenate their fixed32-byte encodings and XOR the six ciphertext columns positionwise. As a bounded alternative, use the six standard hardened children `m/0',…,m/5'` with the same prescribed XOR. No missing data, language score, byte offsets, 32-byte phase, trial passwords or arbitrary source variants.

| Complete 192-byte unchanged table XOR | Printable ASCII | ASCII letters or spaces | Exact first 32 recovered bytes |
| --- | ---: | ---: | --- |
| Unhardened m/0..5 | **80/192 = 41.67%** | **47/192 = 24.48%** | `2777d9c9ce4cd9b2565a79aec94b5085fbf80936a63f16773aa2917e746778a1` |
| Hardened m/0'..5' | **76/192 = 39.58%** | **44/192 = 22.92%** | `00a0e8366decf930b94f687cecfa027c5b8f944783de66d4ba18959bea6b7a9c` |

The unchanged source-derived outputs remain binary-looking, with **no conventional plaintext ASCII file header**. Both exactly replay all192 original bytes by forward XOR. An independent original 192-byte genuine readable-ASCII plant XOR-encrypts and then recovers all192 bytes under each identical pad; these are implementation controls. This finite interpretation does not produce a hidden message, file signature, LP2 key or location. It cannot rule out a different author-selected BIP32 receiver or compressed/encrypted payload, since there is **no original BIP32 or XOR opcode** selecting this operation. The added complete test passed in [Windows Node22 run 45237440098](https://github.com/FlareZ123/liber-primus/actions/runs/45237440098).

## Complete original I/l printed-case robustness, 23 November

The source's fifth (missing-L) scalar column4 is *unambiguous*, and so is left-adjacent K column3. **Right-adjacent M column5 contains two genuine source-case-sensitive cells**: printed grid row5 `1l` (canonical byte107, uppercase alternative78) and row20 `0I` (canonical byte18, lowercase alternative47). These two byte changes are exactly ±29, so they are invisible to the published GP29 residue stream but radically change BIP32 HMAC.

The later SFT explicitly exhausts all four original I/l source-case assignments in M, keeping the sole K chain case. It runs **5 chain variants × 2 hardening modes × 2 original rune receivers × 2 signs = 40 complete original 12,956-rune decodes**. All40 exactly reencrypt and pass native solved-p57 plants and the official BIP32 vectors. Their *whole-book* IoC spans **0.0344444737–0.0345585671**, original pp0–2 IoC **0.0338413301–0.0352997483**, original pp54–55 **0.0329540167–0.0359998308**. None reveals sustained authentic native GP text. This strengthens the bounded negative without inventing visual certainty about upper/lower glyphs.

The source's **other six payload columns** in the proposed binary-file consumer contain eight additional I/l-sensitive bytes, so the canonical 192-byte ASCII count is not a full case-invariant file proof. Instead the four exhaustive *chain-code* masks give bytewise XOR ASCII printable counts, before changing those eight payload positions, of **62–80 out of192** across all eight child classes. At most eight source-byte alterations can change ASCII printability, so under **every one of all 4×2^8 input-case assignments, at most88/192 bytes** can be printable. Thus the entire authentic source-glyph case universe is excluded as **ordinary uncompressed printable-ASCII plaintext under this specific BIP32 direct-byte XOR receiver**, without enumerating the payload case bits. This is not an exclusion of encrypted, compressed or non-ASCII binary payloads.

[Complete source-case exhaustive Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45239974733) · [same updated original-source SFT](../sims/lp2_p50_missingl_bip32_child_scalar_original_sft.cjs).

## Reproduction, decision and next meaningful input

- [Complete read-only CommonJS/Node22 SFT](../sims/lp2_p50_missingl_bip32_child_scalar_original_sft.cjs), consuming the current canonical numerical table and all 58 LP2 page records.
- [Source-original Windows Node22 GitHub Actions PASS, including later binary receiver](https://github.com/FlareZ123/liber-primus/actions/runs/45237440098); full result includes 16 exact inverse outputs, source table SHA, Bitcoin parent address, two official BIP32 child test vectors and source-native positive controls.
- [Normative pre-2014 BIP32 specification and test vectors](https://bips.dev/32/).

**Retire the tested complete BIP32 immediate-child scalar GP29 additive/first-difference pad family and the six-column direct-XOR byte-file consumer**. The experiment leaves open a distinct, *author-selected* BIP32 consumer, e.g. a named child public key, signed destination, or separate original encrypted asset requiring one particular extended key. Further arbitrary key-stream derivations from the table would provide little discriminating evidence without a first-party instruction. The strongest remaining decision is whether an original author clue establishes a Bitcoin-style recipient at all; none has been recovered here.