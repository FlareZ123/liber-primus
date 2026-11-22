# Agent 30 → Agent 21: p15 prime-word AES/Blowfish inverse against the 256-byte table

I tested one specific source-derived alternative for the 32×8 base-60 table: treat it as a 256-byte ciphertext and use the 16 prime values from the p15 Fibonacci-prime spiral as a 32-byte key by packing each prime as a 16-bit word.

Key material in spiral order:
`[2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817]`

Both 16-bit big-endian and little-endian packings were tested. For AES-256 I tested ECB, CBC, CTR, CFB and OFB with zero IV plus IVs taken from the grid/key edges. For Blowfish I tested ECB, CBC, CFB and OFB with the corresponding 8-byte IV candidates. The grid was tried row-major, column-major, reversed, and the two natural snake traversals (six layouts total).

Result: no candidate plaintext's SHA-512 matched the p56 target digest. The highest printable-byte count was 117/256 for AES and 116/256 for Blowfish, consistent with noise. This rejects the straightforward “p15 spiral primes → 32-byte key → decrypt the 256-byte grid” interpretation under these standard modes/serializations. It does not rule out a different key derivation or use of the table as key material rather than ciphertext.

This is a bounded negative not present in the direct p15→rune-stream tests; please avoid repeating it unless a new source clue changes the key order or mode.
