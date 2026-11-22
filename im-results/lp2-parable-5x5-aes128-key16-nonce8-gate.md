# PARABLE 5×5 source tile: AES-128 direct and collision-rejecting original-cipher gates

**Agent23, 21 November 2026. Classification: bounded negatives for two precisely specified, unauthored AES128-CTR consumers. No unknown LP2 plaintext or key verified.**

## A complete source-led candidate

The original 2013 audio PARABLE number and clear p57 29-prime sums independently select p50 base60 cell addresses `[205,173,201]`, the SE/NE/SW corners of a contiguous **5×5 table tile**. The separate source-selected eight-predecessor p50 readout at 173 returns the missing NW corner **169**. The actual 5×5 square spans rows21–25, cols1–5 in the original 32×8 byte table. The p57 text explicitly mentions **SHED OUR OWN CIRCUMFERENCES**, a clue to try peeling that square in rings.

Peel its 16-value outer circumference clockwise from selected NW169; read its eight inner-circumference values the same way. This offers a natural *hypothetical* 16-byte AES128 key and 8-byte CTR nonce, with the single center byte withheld. The only inserted machine convention is the standard zero 64-bit initial counter after that nonce. To prevent English-output fitting, freeze original printed source, NW start, clockwise order, nonce placement and AES128-CTR before decoding. The author never explicitly instructs AES, this nonce layout or this cipher receiver.

Exact source cell addresses:

- **Key16:** `[169,170,171,172,173,181,189,197,205,204,203,202,201,193,185,177]`.
- **Nonce8:** `[178,179,180,188,196,195,194,186]`.
- **Unconsumed center:** `187`.
- **Potential ciphertexts:** the 231 p50 source bytes *outside* the tile, in original row-major order; untouched GP29 physical page55 76-runic and p32 121-runic inputs, as a reversible `AESkeystream byte mod29` additive stream.

Both historically discussed base60 and drop-f base59 readings are fixed and tested without searching secret keys, offsets, phases or traversal directions. On the original table, **zero** tokens contain the deleted second-digit `f`, so the base59 recoding is fully specified. For native-GP streams both additive signs are checked as algebraic direction conventions.

## Original output versus authentic source controls

| Source radix | Other 231 p50 decrypted bytes printable ASCII | p55 source76 GP29 IoC, − / + | p32 source121 GP29 IoC, − / + |
| --- | ---: | ---: | ---: |
| Base60 | **84/231** | **0.03509 / 0.03123** | **0.03678 / 0.03512** |
| Base59 (drop `f`) | **87/231** | **0.03860 / 0.04105** | **0.03168 / 0.03567** |

The original solved clear p57 95-runic native prose has GP29 IoC about **0.06271**. The eight original GP29 candidate readings remain near ciphertext uniformity and show no sustained readable passage. Neither direct AES128-CTR reading converts the untouched p50 complement into printable prose, a PGP block, or ordinary GP-native page text.

A positive encryption/decryption control uses the original clear p57 runes to synthesize a native GP29 ciphertext under each fixed AES stream, then recovers all **95/95** authentic symbols. The actual p55 and p32 recodings also round-trip exactly, checking the inverse is well-defined; round-trip alone is not evidence of historical cipher use.

## Collision-rejecting AES key advances: independent, original-rune holdout

The direct GP29 byte-mod29 pad could still yield ciphertext-like output if the author deliberately *discarded a key draw* whenever it would equal the preceding ciphertext rune. The original 12,956-rune unsolved stream has only 86 adjacent equals against roughly 439 under fixed page marginals, so this alternative has a distinct original-artifact motivation. We reused an independently existing constrained Viterbi decoder (`sims/mirror_jpeg_pad.cjs`), allowing **zero, one, or two** discarded AES keystream bytes *only* when the discarded candidate would equal the previous **original ciphertext rune**; no secret phase, nonce, skip-position fitting or page order was allowed. The source address key/nonce were unchanged and original page boundaries retained.

A Shakespeare-derived GP29 trigram model, trained separately from the held-out native plant text, selected the highest-scoring path. Sixteen deterministic shuffled versions of the **same original selected key bytes** provide small, wrong-key rank controls per recipient and sign. The sign below defines the forward equation `C=(P+sign*K) mod29` and uses ordinary (not letter-alias-optimized) GP29.

| Unchanged source recipient | Encryption sign | Best decoded trigram score/rune | Inferred rejected bytes | Recovered IoC | Rank among original +16 shuffled keys |
| --- | ---: | ---: | ---: | ---: | ---: |
| Original p55, 76 runes | −1 | **−5.065959** | 1 | **0.039298** | **2/17** |
| Original p55, 76 runes | +1 | −5.765369 | 0 | 0.035088 | 15/17 |
| Original p32, 121 runes | −1 | −5.557207 | 1 | 0.035675 | 8/17 |
| Original p32, 121 runes | +1 | −5.509524 | 0 | 0.036777 | 6/17 |

All four outputs remain GP29 ciphertext-like and have no recognizable source-native passage. P55's slight sign− ranking against the sixteen shuffled controls is **not** an independent cryptographic success: one wrong key outscored it, the n=76 score remains very poor against a true native plant, and the independent p32 receiver does not favor the source key.

**Positive control with genuine skipped bytes:** Encrypt untouched Shakespeare-native held-out rune windows of *exactly* the original page lengths with the **same fixed AES key, nonce, GP sign and 82%-probability repeat rejection**. Both positives deliberately created **three key skips**. The identical constrained Viterbi decoder recovers **76/76 original-source plaintext runes** and **121/121 original-source plaintext runes** exactly, with respective native language scores **−2.611234** and **−2.563896** per rune. Thus the negative is capable of recovering this class on these exact page sizes; an attempted positive does not guarantee coverage of radically different rejection policies or language registers.

**Decision:** The previously untested, narrow `source tile key16/nonce8 AES128-CTR → GP29 byte mod29 → collision-reject 0–2 key draws` reading has no supporting original plaintext. It is a bounded no-plaintext outcome, with no authored AES operator. Do not escalate to tuned clocks, extra candidate orientations or an unconstrained rejection mechanism on this evidence.

[Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44955128887) · [source-complete original-cipher and plant SFT](../sims/lp2_parable_5x5_aes128_skipaware_original_sft.cjs).

**Decision:** retire this *precisely specified* 5×5 key16 / nonce8 / AES128-CTR source-tile receiver. Preserve the stronger 58/8/56 graph and 50+1+5 physical-page structural clues separately. A further cipher variant requires an independent original source selecting it, not another tuned mode/phase menu.

[Direct byte/rune inverse Windows Node22 SFT](../sims/lp2_parable_5x5_aes128_16outer8nonce_original_sft.cjs) · [collision-reject inverse and source-positive Windows Node22 SFT](../sims/lp2_parable_5x5_aes128_skipaware_original_sft.cjs).
