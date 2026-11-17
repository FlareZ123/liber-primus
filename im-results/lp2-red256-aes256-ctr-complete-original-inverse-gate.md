# Chronological red256 events as AES-256-CTR keys: complete original GP29 inverse

**Agent43, 17 November 2026. Original-input bounded negative; two native Windows/Node22 CI PASS executions. No unknown-page Liber Primus plaintext, authentic creator key, decipherment opcode, or final destination was recovered.**

## Plausible source cue and independent starting evidence

The original Liber Primus has 225 red Gematria Primus runes and 31 thirteen-dot marks. Their established chronological A-class event tape has exactly **256 elements**, a plausible human cue to derive a 256-bit cryptographic key. The separate 32×8 numeric table on physical pp49–51 contains 256 cells. AES-256, available in 2014, admits an exact reversible stream-cipher consumption through CTR mode. The artifact never explicitly names this key packing, cipher, counter IV or GP29 reduction. Other equally source-visible 256-event inventories also exist; the selection tested here remains conditional.

**Prior distinct work:** the A-class event bitkeys had been used only for AES-ECB/CBC decryption of the printed **256 table bytes** and direct ink/table masks ([prior test](lp2-ink256-table-direct-aes-byte-mask-gate.md)). A separate AES-CTR GP29 original-input test derived **different keys from case bits on the numeral table** ([prior test](lp2-p50-case-bitplane-aes256-source-gate.md)). Neither had tested **red-event bitkeys under AES-CTR directly against all original unknown rune ciphertext**, the distinct test here.

## Exactly declared original-cipher inverse

Reconstruct chronological events directly from the original GP29 corpus and the established page-local red/punctuation annotations, with marker preceding rune at the same offset. Asserts **225 genuine red runes +31 thirteen-dot marks=256**. Four source bit projections and their exact 256-bit hex keys were previously frozen and are recomputed by the SFT:

| Rune bit | Mark bit | Original-derived AES-256 key (hex) |
| --- | ---: | --- |
| GP rune ordinal parity | 1 | 969e9985ec6e7c78636fa82fe7b244f3413f22709fd99b92e10a3e36dde3eb89 |
| GP rune ordinal parity | 0 | 96989984606e0c78436e280fe4b244334139221087199b92e10a3e36d9e26888 |
| GP rune ordinal at least 15 | 1 | a6f7134baf6e7b42e2439ff457524deed9e704705dcda280e95c142507e3db5f |
| GP rune ordinal at least 15 | 0 | a6f1134a236e0b42c2421fd454524d2ed9e10410450da280e95c142503e2585e |

Use either literal zero AES counter-IV or the separately printed first16 numeral-table bytes **cbe7a7ba61ed7eb75cf99cdef704b7d4**. Transform CTR output bytes to GP29 key shifts by (a) byte mod29, (b) floor(29*byte/256), or (c) rejection of bytes >=232 followed by byte mod29. Invert the original GP29 ciphertext using both arithmetic signs. Reset the AES clock either once for the whole book, at 55 rune-bearing physical page starts, or at source-visible nine visual chapter starts **p0, p3, p8, p15, p23, p28, p32, p40, p54**. No key/nonce offsets, alphabet substitutions, plaintext guesses, IV alterations or score-based parameter fitting.

This yields **4 keys ×2 IVs ×3 byte projections ×2 signs ×3 clocks =144 exact complete-book GP29 inverse candidates**, each tested on **all 12,956 unmodified unknown original runes**. Every candidate reencrypts its complete original ciphertext exactly. Each configuration also encrypts and exactly deciphers **all 95 original clear p57 runes** as an independently solved-source positive; all **144/144** positive controls passed.

## Original ciphertext outcome

| Receiver | Original rune count | Maximum IoC after 144 complete original inverses |
| --- | ---: | ---: |
| Full unknown pp0–55 | 12,956 | **0.03453764300844744** |
| Opening chapter pp0–2 | 729 | **0.03513393328208143** |
| Original dense section pp40–53 | 3,008 | **0.03476816506166463** |
| Terminal page p55 | 76 | **0.04736842105263158** |

The unchanged full manuscript itself measures **0.03447839786450569**; a uniform GP29 stream has 1/29 approximately **0.03448276**; the authentic solved p57 text measures **0.06270996640537514**. The 144-case maximum over the entire unknown manuscript stays extremely close to uniform. The relatively large maximum on only 76 terminal runes is postselected across 144 variants and has no accompanying decoded passage or reproducible original key. **No candidate yields an ordinary native-GP English manuscript or authenticated unknown plaintext.**

### Stronger complete opening under authentic plaintext-F bypass

The original independently solved LP1/p56 cipher uses **transparent plaintext F**, without consuming key whenever the plaintext symbol is GP index0. A ciphertext F can itself be an encrypted non-F, so the decoder must enumerate **both possible key-consumption branches** at every such glyph. Exact dynamic programming retains every possible current key position; any branch that decrypts a non-F ciphertext rune to plaintext F is forbidden.

Perform this separately for all 144 original source models on the **entire opening pp0–2, 729 runes**, including the authentic physical-page reset for the page-clock variants. **0/144 models has any full legal inverse** under this historically solved cipher behavior. The furthest surviving original prefix is **534/729** runes for a chapter/book-continuous clock, versus a maximum **329/729** for page-reset clocks. Although 18/144 configurations can traverse the first complete 262-rune p0, every one necessarily contradicts the transparent-F equation later within the opening. No English scoring, skip mask fitting, or unknown key branch pruning participates in this exact obstruction.

Every variant passes an additional **genuine p57 plaintext-F transparent encryption positive**: it recovers **95/95 clear p57 runes** without supplying the true transparent F locations. This rules out decoder error as the reason for the original opening contradiction and bounds the exclusion to the exact keys, IVs, reductions, signs and clocks used.

## Reproduction, decision, and limits

- [Standalone Node.js 22 CJS original-source inverse](../sims/lp2_red256_ink_aes_ctr_full_original_sft.cjs), source inputs original gp corpus, original red/dot annotations and original 256 numeric bytes, deterministic and read-only
- [Native Windows manual workflow](../.github/workflows/agent43-red256-original-manual.yml)
- [PASS first complete 144-case original-cipher run](https://github.com/FlareZ123/liber-primus/actions/runs/44075255635)
- [PASS complete 729-rune F-bypass original-cipher extension](https://github.com/FlareZ123/liber-primus/actions/runs/44075819247)

**Retire exactly these 144 red-event-bitkey AES-CTR GP29 consumer configurations as direct original plaintext routes.** Their bare inverses have near-uniform source outputs; if the authenticated solved plaintext-F bypass applies, none can even represent the complete first manuscript chapter. This cannot rule out a future independently sourced key, IV, alternative original A/B/C event inventory, an encrypted binary payload, new key schedule or different source-selected cipher. Further ad hoc bit offsets/IVs without first-party instruction would be an unfounded expansion. The open research need is a creator-selected operator/key that deciphers and reencrypts meaningful contiguous unknown-page runes or authentic recovered historical material specifying one.
