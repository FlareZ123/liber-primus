# Source-derived p29/p50 Euclid-23 key with blind anti-repeat clock: original receiver gate

**Agent 15, 21 November 2026. Original-cipher negative, independently recovered plaintext plants. No unknown-page plaintext or authentic cipher key found.**

## Why this key deserves a finite receiver test

The original p29 runic page, exactly **277** GP29 ciphertext runes, and the original p50 256-byte numeric table share a repeated root at 24 in GF29. The p39 red triad fixes the quadratic `G(X)=15(X-24)^2`, established in [the complete original source-factor census](lp2-p29-grid-sole-repeated-root-and-quotient-key-gate.md).

Retain the source's descending polynomial coefficient convention and remove only p50's *physical leading zero mod29*, making its effective degree254. GF29 division of the full original p29 polynomial by that numerical-table polynomial produces an exact **23-symbol first quotient**:

`Q23=[27,20,4,17,16,18,16,11,8,28,18,16,5,23,12,10,8,25,14,14,15,20,17]`.

The original source's width23 matches the independently authenticated 2013 DH prime23. Earlier tests applied Q23 as a direct additive key to two 23-rune source-selected p0 windows, yielding no plaintext ([first quotient result](lp2-p29-p50-euclid23-p0-readout-direct-inverse-gate.md)). The ciphertext's substantial suppression of neighboring equal runes motivates one **independent, reversible** alternative: cycle the fixed Q23 key with a hidden rejection of repeated ciphertext output, as used in the earlier blind decoder for another, prime-totient key schedule.

The author never explicitly prescribed GF29 polynomial division, a repeating Q23 key, or a repeat-rejection rule; this is a bounded source-associated hypothesis. It warrants a complete original-cipher inverse because the original title and 2016 direction clues already select concrete p0 and p32 receivers, without fitting key values or searching passwords.

## Frozen complete inverse

Use `K_i=Q23[i mod23]`. Sender attempts `C_i=(P_i ± K_{clock}) mod29` and, with probability 0.81, rejects an attempted symbol that repeats the previous published ciphertext. Each rejected attempt advances the key pointer while preserving the plaintext rune. An accepted attempt emits one rune and advances the pointer once. The 0.81 value approximates the empirically observed anti-repeat deficit, and remains **unverified as an authored probability**.

The decoder receives **only published ciphertext** and the fixed Q23 key. Beam width128 explores zero to three hidden rejects per original glyph, with the exact consistency rule that every rejected attempt must reproduce the preceding published rune. A source-native GP29 Shakespeare bigram/trigram model scores outputs, and Gibran prose is reserved for independent evaluation. Key starts at Q23 element zero at the start of each tested receiver. Both signs are tested. The 2013 p=23 coincidence is **not** used to alter the key.

The [single CommonJS SFT](../sims/lp2_euclid23_hidden_repeat_skip_receiver_sft.cjs) re-derives Q23 by full GF29 long division of **277 original source runes by all 256 exact table bytes**, checks the 256-byte source SHA-256, and asserts the entire 23-symbol quotient. The original p29 and p50 source bytes are never modified. The script verifies inverse correctness on eight deterministic synthetic carriers using actual solved-p57 GP29 runes (95 symbols) or independently encoded Gibran prose (729 symbols), under both signs and two independent target sizes.

## Original outputs

| Unmodified original receiver | Original length | Key sign | GP29 language score, nats/rune |
| --- | ---: | ---: | ---: |
| Complete p0–2 first chapter | 729 | − | **−4.12830065** |
| Complete p0–2 first chapter | 729 | + | **−4.14327292** |
| Original p32 | 121 | − | **−4.26551364** |
| Original p32 | 121 | + | **−4.28304999** |

The decoder also resets exactly at the two **previously source-selected** p0 23-rune windows, offsets80–102 and166–188, for both signs. Their scores lie **−4.10565 through −4.37425**, and their four complete outputs are gibberish. No local source-selected window yields a coherent phrase.

All **eight larger planted positives** recover **every plaintext symbol**: 95/95 in each of four solved-p57 plants, 729/729 in each of four native-Gibran plants. Their private sender histories include **2–3** rejected rows for 95-rune plants and **21–22** rejected rows for 729-rune plants; the blind decoder infers the exact ending key pointer in each. The **four additional 23-rune source-window control plants** recover **23/23** known solved text, scoring −2.47 to −2.49 compared with original window scores near −4.2. The 729-rune native positive controls score around −2.4 per rune, far better than original page candidates.

The final original run, including the 23-rune windows, passed on a separate [Windows Node22 source runner, Actions run 44951399550](https://github.com/FlareZ123/liber-primus/actions/runs/44951399550); the earlier full-page-only version passed in [run 44951296700](https://github.com/FlareZ123/liber-primus/actions/runs/44951296700). Both runs reproduce without external network or guessed key.

## Cryptanalytic decision

**Retire exactly the original-source Q23 additive, period23 repeating key with optional hidden repeat-rejection clock, key origin zero and both signs**, for the p0 first chapter, the linked p32 page, and both source-selected p0 23-rune windows. The original score gap is large despite complete native plaintext reconstruction on blinded positives.

A secret selector for a different key schedule, non-English intermediate, changing symbol mapping, or separate message segmentation is untouched. The anti-repeat mechanism remains a **capability demonstrated on synthetic true positives**, not an established Cicada feature.

The Euclidean quotient is mathematically real and may still have a framing/checksum role. Repeatedly grafting new timing rules onto this key without a new original clue would replace a failed decipherment with unsupported complexity. Status remains **56 unsolved LP2 physical pages**.
