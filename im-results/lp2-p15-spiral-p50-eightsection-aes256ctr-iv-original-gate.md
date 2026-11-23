# P15 printed spiral as AES counter IV for eight P50 keys: all original ciphertext

**23 November 2026, Agent27. Bounded original-cipher negative, no recovered plaintext or historical key.**

## Causal source route

Original physical p15 has a red-origin 4x4 Fibonacci-prime spiral of 16 visible decimal integers. Physical pp49-51 print exactly 32x8 ordinary numeric bytes, which can be grouped as eight 32-byte AES256 keys. Original p0-55 has eight marked manuscript sections containing exactly 12,956 GP29 runes. The earlier p50 eight-column AES256-CTR attack used a zero IV; this test supplies the missing 16-byte counter IV using the original p15 integers, each reduced to its low eight bits. Source does not instruct AES, low-byte packing, CTR, or a particular byte orientation, so this remains a conditional human-readable decoding hypothesis.

Two fixed p15 IVs:

- Red-origin original Fibonacci spiral: e3e2e0ded8ceba9650de16a81cc4b6a4
- Printed p15 rows: ba9650decee3e216d8dee0a8a4b6c41c

Two source-derived AES256 keys layouts: eight physical columns of 32 bytes, and eight row-major consecutive chunks of 32 bytes. For each section initialize the same p15 IV, encrypt a zero stream under that section's 32-byte key in AES256-CTR mode, reduce every stream byte modulo29, then add or subtract it from every source rune modulo29. Two IVs x two key layouts x two signs = exactly eight whole-manuscript decodings, no tuned phase, missing ciphertext symbols, altered page break or omitted body. The complete original GP29 rune tape is consumed in its printed order.

## Windows original source results

Original GP29 ciphertext index of coincidence: **0.03447839786450569**. Independent authentic solved p57 GP29 IoC: **0.06270996640537514**. Every complete decode remains near uniform, with aggregate IoC ranging from **0.03446421 to 0.03451517**. The largest individual section IoC across 64 section/model combinations is only **0.03509163**, and no complete section prefix is native GP29 prose.

| p50 32-byte layout | p15 IV | Cipher sign | Overall IoC | Max of eight sections |
| --- | --- | --- | ---: | ---: |
| Consecutive chunks | printed rows | + | 0.03451517 | 0.03468131 |
| Consecutive chunks | red spiral | + | 0.03450023 | 0.03509163 |
| Original columns | red spiral | + | 0.03448695 | 0.03493420 |
| Consecutive chunks | red spiral | - | 0.03448014 | 0.03452669 |
| Original columns | red spiral | - | 0.03447814 | 0.03461538 |
| Original columns | printed rows | + | 0.03446932 | 0.03486357 |
| Original columns | printed rows | - | 0.03446859 | 0.03473070 |
| Consecutive chunks | printed rows | - | 0.03446421 | 0.03484288 |

All eight original 12,956-symbol output streams exactly forward-reencrypt to their original input. On eight model variants and eight section keys, independently original solved p57 95-rune positives encrypt and recover **95/95**, all **64/64** planted controls. This is a test of a genuine reversible cipher, while self-roundtripping is not plaintext evidence. Exact numeric source grid SHA256: 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290.

**Reproduction:** [read-only Windows Node22 CommonJS one-file SFT](../sims/lp2_p15_spiral_iv_p50_eight_aes256_original_sft.cjs), independently **passed on [GitHub Actions 45120353556](https://github.com/FlareZ123/liber-primus/actions/runs/45120353556)**, reads three original reference files and asserts p15 source values, p50 SHA256, all original runes, IV and key sizes, exact original reencryptions and native-GP positive plants.

## Decision

Retire this precisely typed, source-visible 16-byte p15 IV plus eight-section p50 AES256-CTR GP29 additive cipher. It adds the genuine p15 IV operand missing in the prior zero-IV trial, yet produces no original native plaintext on any complete section. This does not exclude every historical cipher mode, changed section key derivation, full-byte message, or external source-selected input. With no first-party AES opcode, retuning other IV formats or offsets is unconstrained search.
