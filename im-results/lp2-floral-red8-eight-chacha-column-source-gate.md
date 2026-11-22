# Eight independently keyed ChaCha20 lanes for the floral3000 chapter

**Agent12 · 22 November 2026. Original-input negative.** The original p40–53 body has **3,000 runes = 375 × 8**, after its red **eight-rune heading**. The printed p49–51 table has **32 rows × eight columns** of 256 interpreted bytes. Every table column supplies exactly **32 key bytes**, sufficient for a 256-bit ChaCha20 key, and the heading supplies **eight nonce bytes**. This selects an unusually complete, source-shaped eight-stream construction with no unknown key material. ChaCha20 was available before the 2014 puzzle, but no original manuscript passage explicitly names this algorithm, byte codec or eight-lane operation. Decorative and coincidental dimension matching remain credible rivals.

This differs from the existing [full-body single-column ChaCha test](../sims/lp2_p40_red8_chacha_nonce_sft.cjs), which independently decrypts the **whole 3,000-runic ciphertext once per key**. The present test instead gives each of eight interleaved runic columns its **own** independent stateful ChaCha keystream, so all 256 original table bytes are active simultaneously.

## Frozen lossless inverse

Read the p40 red heading GP indices in source order as exactly `[0,9,19,26,6,23,25,8]`, treated as the 64-bit ChaCha20 nonce. For each column c in 0..7, take the 32 source table bytes at original table positions `8*r+c` for rows r in 0..31 as a 256-bit key. Initialize the original 64-bit-counter ChaCha20 variant at zero, independently in every column. Generate 375 keystream bytes per column. Decode the black rune in original row r, column c as:

`P[8*r+c] = (C[8*r+c] ± (ChaCha20(key_c,red8)[r] mod29)) mod29`.

The test permits the two ordinary additive directions, never varies keys, byte order, phase, nonce, page reset, initial counter, cipher strength or original rune order. The original has 3,000 source runes and no skip over the p50 numeric page. The original table byte-vector SHA256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

## Exact original-cipher and controls

| Direction | Full 3,000-rune decoded IoC | Untouched middle p45–46 IoC | Untouched final p52–53 IoC |
|---|---:|---:|---:|
| minus ChaCha stream | **0.0345268423** | **0.0354359926** | **0.0346600179** |
| plus ChaCha stream | **0.0344812715** | **0.0345770631** | **0.0344240260** |

Original unchanged chapter IoC is 0.0345444037. The candidate inverse is essentially uniform on GP29 labels in both directions, and the source first 64 transliterated tokens are nonlinguistic. Authentic clear p57 native-GP runes repeated to the same 3,000-symbol length were **exactly recovered 3,000/3,000 in both encrypted positives** using the identical source keys and nonce. All 3,000 original ciphertext runes also reencrypt exactly, a mere invertibility check. Every source assertion and positive control passed [Windows Node22 run 44992750861](https://github.com/FlareZ123/liber-primus/actions/runs/44992750861).

**Decision:** The single source-complete, independently keyed **eight-column ChaCha20/256** hypothesis does not decrypt the original floral chapter into native GP English, including its untouched original tail. The original source does not specify ChaCha itself; an arbitrary algorithm, reordered key, or new nonce should not be substituted merely to rescue this output. No unknown plaintext, creator key, final destination or authenticated cipher instruction was recovered.

[Read-only original-source CommonJS SFT](../sims/lp2_floral_red8_eight_chacha_columns_sft.cjs).