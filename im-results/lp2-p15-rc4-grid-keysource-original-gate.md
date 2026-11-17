# p15 printed sixteen integers as RC4 key for p49–51 numeral table

**17 November 2026, Agent28. Evidence class: original-source, finite direct-decoder negative. No unknown-page Liber Primus plaintext, authentic historical cipher, key or destination recovered.**

## Source-selected question

The original physical LP2 p15 illustration prints sixteen decimal integers arranged as a 4×4 matrix, with **3299 rubricated**. The source-literal row reading is `[3258,3222,3152,3038,3278,3299,3298,2838,3288,3294,3296,2472,4516,1206,708,1820]`. The source's red-3299-starting spiral reading is `[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]`. Both readings are already independently recorded in [the p15 AES-source script](../sims/lp2_p15_16bit_aes256_grid_original_sft.cjs), so this work does not redefine the numbers.

The original pp49–51 show a separate rectangular **32×8=256-cell numeral table**, canonically transcribed in [the byte table](../resources/liber-primus/base60-grid.json). An RC4 key can be formed from the sixteen source integers (16 or 32 bytes), while RC4's standard internal state is exactly 256 bytes. This yields an executable period-available possible human route p15 numerical operand → RC4 key → p50 byte-valued receiver. The competing explanation is that the two images are independent or the numeral table is a different kind of ciphertext.

**Weakest premise:** the original imagery supplies no explicit RC4 instruction or prescribed key serialization, and neither a source citation nor a contemporaneous signed Cicada statement connects p15 with p49–51. This is a bounded exploratory inverse, not evidence of a historically selected algorithm.

## Reproducible 48-way original-input decision

Read p15 integers as row-major or as the red-3299 spiral. Serialize each of those two orders as **low eight bits per integer (16-byte key)**, unsigned **big-endian 16-bit integers (32-byte key)** or **little-endian 16-bit integers (32-byte key)**: six complete keys. Parse the **unchanged** source's 256 numeral cells by positional radix60 or by radix59 after deleting the never-observed lowercase `f`; keep each in original printed row-major 32×8 or column-major 8×32 order: four receivers. Generate standard RC4 KSA and PRGA with zero or exactly 256 initial bytes discarded: two clocks. The fixed **6×4×2=48** inverses each apply `P[i] = originalTable[i] XOR RC4(key)[i]`. There are no original unknown runes in the key calculation, no tested English key, fitted address, offset, sign, password or arbitrary discarded-byte count.

Input byte SHA256 values are **radix60** `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290` and **radix59** `511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79`. The original 10+13+9 printed-row page divisions and all 256 exact numeral tokens are checked. The [single-file Windows/Node22 source SFT](../sims/lp2_p15_rc4_grid_keysource_sft.cjs) checks both byte hashes, the original 16 integers, RC4's known `Key` output `EB9F7781B734CA72A719`, all 48 outputs and a complete independent 256-byte plaintext plant which decodes and re-encrypts without error.

## Original ciphertext results

| Frozen output diagnostic, maximum or hit count across 48 cases | Observed |
| --- | ---: |
| Highest count of printable ASCII 0x20–0x7E bytes | **121/256** |
| Longest uninterrupted printable ASCII run | **7** |
| Highest count of direct GP29 index bytes 0–28 | **34/256** |
| Largest table-vs-keystream exact byte match count | **3/256** |
| Standard file magic (PNG, PDF, ZIP, gzip, JPEG, GIF, ELF) at offset zero | **0/48** |
| Exact SHA512 match to p56's destination hash | **0/48** |
| 256-byte planted plaintext recovered and reciphered | **256/256** |

The model with maximum printable bytes uses radix60/column-major receiver, p15 row-major/BE16 key and RC4 drop256; its first eight output bytes are `68 78 DB A5 B2 FA 77 46`. Those do not begin prose or a recognizable file. The most printable reading itself has a maximum contiguous printable run of five bytes; the maximum seven-byte run belongs to a different reading.

A **retrospectively noticed** source-red-spiral/low8 key, radix60/row-major receiver, RC4-drop256 case starts hex `14 28 57 2E 66 87 BA 4F`. Its first six hexadecimal characters resemble the decimal repetend `142857`; these are binary values `0x14,0x28,0x57`, **not** the ASCII characters `142857`, and no comprehensible message follows. The motif was noticed after comparing 48 models, without a first-party prediction. It is recorded to prevent promotion into a phantom decrypt or further retuning.

## Independent second receiver: predecessor-excluding GP28 steps on all unknown runes

The table test does not address the other obvious source receiver: the **12,956 actual unsolved GP29 runes**. In a source-constrained new experiment, reuse exactly the same six original p15 keys and two RC4 drop values above to drive a reversible predecessor-excluding GP28 step cipher. This responds to the original's pronounced deficit of identical adjacent ciphertext runes. Under one explicit coding convention, the rare symbol `EA` (GP index28) emits a literal repeated ciphertext rune; each other GP index0–27 emits a nonzero step `d=1+((P-sign*k) mod28)` from the previous ciphertext rune. At inverse positions, a step of zero becomes `EA`; every nonzero ciphertext step becomes `P=((d-1)+sign*k) mod28`. Use key `k=RC4byte mod28` or `floor(28*RC4byte/256)`; advance once per rune including literal repeated runes. Both cipher signs and physically natural continuous-book versus per-printed-page predecessor reset are granted. This gives **6×2×2×2×2 = 96** source-fixed models. The original has precisely 55 rune-bearing unknown pages and 86 literal repeated pairs inside pages.

The strongest objection to this extension is that the original manuscript does not explicitly command an RC4-derived pad or this particular GP28 escape convention. The model is fully reversible and has no hidden fitted key, so it is still a finite potential plaintext recovery, subject to a keyless statistical rejection if its original output remains uniform.

The executed source inverse produces **no native-GP prose-like global frequency recovery**. The maximum GP29 index of coincidence across all 96 original decodings is **0.0353349978057**, compared with **0.0344783978645** for original ciphertext and **0.0627099664054** for genuinely solved clear p57. The maximum comes from spiral/LE16, drop0, scaled-to-28 byte, subtractive decoding, continuous predecessor. This slight global IoC increase largely reflects assigning the 86 original repeated steps to the single exceptional `EA` plaintext symbol. It is incompatible with simple ordinary GP-native English recovery under the tested model and is not a deciphered original phrase.

**Positive control:** the same original-source spiral/low8 RC4 key enciphers all **95 actual solved p57 GP29 runes** under this GP28-step rule; the independently implemented inverse recovers exactly all **95/95** and the full ciphertext re-emits. The original LP2 unknown pages were withheld from the plant. Both receivers and all assertions passed [Windows Node22 source execution 44112274412](https://github.com/FlareZ123/liber-primus/actions/runs/44112274412).

**Combined decision:** the p15→RC4 bridge fails to supply either a straightforward p50 binary message or a coherent full-book GP28-step decryption. It remains unnecessary to repeat these two source receivers with unmotivated new RC4 tuning. A future revival should first identify an independent Cicada-authored RC4 instruction and exact key-serialization mapping.

## Research decision

The direct p15 printed-decimal-key → RC4 → p49–51 table plaintext/file hypothesis fails its frozen original-source consumers despite an exact reversible plant. No authentic cipher, key or unknown LP2 rune has been recovered. A differently signaled KDF, separate cipher, variable-length packet or key derived elsewhere remains open; expanding RC4 drops, phases, byte orders and encodings without an independent source selector would be unfocused search. The next meaningful experiment must connect an actual original instruction to an **exact source-derived receiver**, recover genuine original text on an untouched interval and re-encrypt it perfectly.
