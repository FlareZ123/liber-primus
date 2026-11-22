# Original LP2 page-carry 32-byte packet as AES-256 key: finite original-input gate

**Agent14, 14 November 2026.** Original-input negative. No recovered unknown plaintext/key. This tests an unexamined consumer for the [new 32-word/32-row source address](lp2-pagecarry-grid32-source-packet.md), rather than inventing another 32-byte key from arbitrary table columns.

## Physically selected candidate and exact inverse

Source: 32 genuine rune words cross physical page edges; their right-side fragments have 1–7 runes. The original pp49–51 table has 32×8 printed alphanumeric cells. For carried word i, row i and column (right-fragment-length−1) select exactly one cell. The original provisional base60 byte interpretation yields 32 bytes:

```text
61f9cac6505456feff728edc483f49ed780ad221c0f0839c007f063b446a1671
```

Because 32 bytes are the exact AES-256 key size, a restricted possible full-book decoder is worth a single direct test. This is **not** an original Cicada instruction to use AES, nor is a nonce or byte→GP29 conversion source-selected. Frozen mechanism: Node crypto AES-256-CTR, one zero 128-bit IV, continuous keystream beginning at original physical p0; one separate zero-IV restart at original chapter pp54–55. Keystream bytes map to GP29 shifts via either byte modulo29 or scaled floor(29·byte/256). Test both additive directions, with no adjusted phase/IV/key. Independently decrypt all 256 printed table bytes via AES-256-ECB and the same key, with no padding.

## Authenticated original-input experiment and controls

The [CommonJS SFT](../sims/lp2_pagecarry_grid32_aes256_ctr_sft.cjs) derives the 32-byte key from untouched original word fragments and original numeric cells, asserts the key exactly, tests all **12,956 unknown GP29 runes** and the original final **308-rune pp54–55** chapter, and checks mathematical reciphering. As a meaningful control it encrypts the genuinely clear **95 GP29 p57 runes** using the identical selected key and four byte/sign rules, and blindly recovers **95/95** original runes in all four plants. [Successful Node22.23.4 CI run 43568883849](https://github.com/FlareZ123/liber-primus/actions/runs/43568883849).

| Original register | Cipher IoC | CTR mod29 − | CTR mod29 + | CTR scale − | CTR scale + |
| --- | ---: | ---: | ---: | ---: | ---: |
| **All 12,956 unknown runes** | **0.034478398** | 0.034465064 | 0.034464742 | 0.034488491 | 0.034511524 |
| **Original pp54–55, 308 runes** | **0.033821228** | 0.033715470 | 0.033334743 | 0.035069165 | 0.035936376 |

Every full-book output retains nearly uniform 29-symbol collisions (random baseline **1/29=0.034482759**) and lacks credible contiguous GP prose. With this key, AES-256-ECB decryption of the original table starts `31f2c4194767ec5a2bbd2a9a4e016f79`, with **100/256** printable/newline/tab bytes, no identifiable signature or linguistic text. The unchanged table has 103/256 strictly printable bytes. No original payload has been recovered. Both byte-to-rune conversions are declared assumptions; the source establishes only the lengths and cell coordinates, not AES or the derived key's purpose.

## Operational decision

Retire the **zero-IV AES-256-CTR additive GP29 use of this exact 32-byte packet**, and its direct AES-256-ECB table interpretation. Other independent uses of the source-shaped 32 bytes remain open, provided a period-original instruction identifies the operation, nonce and target. Do not treat passing synthetic plants or a hexadecimal 256-bit output as evidence of an authentic Cicada key. The earlier 32-word address extraction remains a provisional but fully reproducible input, not a decryption.
