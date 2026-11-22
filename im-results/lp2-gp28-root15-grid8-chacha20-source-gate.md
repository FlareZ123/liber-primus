# Root-15 GP28 step versus the eight original table columns

**Decision: bounded negative. No unknown LP2 plaintext or original cipher key recovered.**

This is a direct, original-input test of one composite interpretation previously absent from the table-column ChaCha20 work. It combines two distinguishable source features: the p3 red-quotient arithmetic motivates a primitive root 15 of GF29 whose nonzero powers enumerate 28 values, and the pp49–51 printed 32×8 numeral table supplies eight possible ChaCha20-256 keys by vertical column. The LP2 ciphertext has only 86 equal-neighbor runes within rune-bearing pages. A 28-way nonzero-step alphabet with an EA zero-step can explain that *shape* if, and only if, a separate mechanism supplies the correct changing pad.

**Original-cipher hypothesis tested:** Within each of the eight visual macro-chapters through p53, let the original C be the GP29 ciphertext indices. A 32-byte printed table column in original order supplies ChaCha20 bytes using a zero counter and nonce. Decode the initial rune with P0=(C0−byte0 mod29) mod29. For each later step compute D=(Ci−Ci−1) mod29. If D=0, decode GP-EA (index28); otherwise decode P=(log15(D)−byte_i mod28) mod28. This is fully reversible. Each original ciphertext rune consumes one keystream byte, including zero-steps; no variable skipping, page-phase fitting, reordered columns or guessed IVs are permitted.

**Original-image chapters and exact outcomes:**

| Visual chapter | Runes | Decoded GP29 IoC | Transparent EA positions |
|---:|---:|---:|---:|
| 0 | 729 | 0.035439184 | 4 |
| 1 | 1145 | 0.035807860 | 6 |
| 2 | 1729 | 0.035257749 | 9 |
| 3 | 1903 | 0.035246799 | 10 |
| 4 | 1021 | 0.035032936 | 11 |
| 5 | 1433 | 0.034786575 | 14 |
| 6 | 1680 | 0.035273973 | 12 |
| 7 | 3008 | 0.035282921 | 18 |

The eight full decoded GP previews are gibberish rather than independently readable English. Every index of coincidence remains near the 1/28 background and below 0.04; no long native-GP prose or original source/key was recovered. The ninth physical p54–55 unit contains 308 additional original runes but has no ninth corresponding source-table key. It was deliberately left outside the claimed eight-key decoder. This rejection concerns only the precisely specified eight-section rule.

The [single-file SFT](../sims/lp2_grid8_chacha20_gp28_ea_inverse_sft.cjs) reads [original runes](../resources/liber-primus/lp2-corpus.json) and [table bytes](../resources/liber-primus/lp2-grid-256.json). It validates the independent published ChaCha20 zero-key test vector, all GP29 nonzero powers of root15, every original-cipher forward re-encoding, and eight genuine solved-p57 GP95 plants. The original outputs were computed with a separate pure JS ChaCha20 implementation and the identical source inputs. These controls establish internal correctness of the hypothetical reversible model.

Neither original source explicitly selects ChaCha20, its IV, or the root15-zero-step operation for the unsolved manuscript. This composition does not justify key sweeps, moving the byte clock around markers, tuning the word starts or accepting nonlinguistic outputs as plaintext. Another experiment requires an independently supplied original instruction or genuinely new key bytes.
