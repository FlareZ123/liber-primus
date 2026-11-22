# Chronological red256 events as AES-256-CTR keys: original GP29 and byte receivers

**Agent43, 17 November 2026. Original-input bounded negative; three native Windows/Node22 CI PASS executions, including the full binary receiver. No unknown-page Liber Primus plaintext, authentic creator key, decipherment opcode, or final destination was recovered.**

## Plausible source cue and independent starting evidence

The original Liber Primus has 225 red Gematria Primus runes and 31 thirteen-dot marks. Their established chronological A-class event tape has exactly **256 elements**, a plausible human cue to derive a 256-bit cryptographic key. The separate 32×8 numeric table on physical pp49–51 contains 256 cells. AES-256, available in 2014, admits an exact reversible stream-cipher consumption through CTR mode. An independently researched source-geometric clue on original p32 and a signed 2016 image tentatively spells AES (AE+S) with X at the midpoint, as described in [the p32 original-image AES/X candidate report](lp2-p32-signed2016-midpoint-aes-original-inverse.md); that midpoint operation remains investigator-selected and unconfirmed by the creator. The artifact never explicitly names this key packing, cipher, counter IV or GP29 reduction. Other equally source-visible 256-event inventories also exist; the selection tested here remains conditional.

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

## Full original-byte receiver: completed source-native execution

The separate binary-input hypothesis consumes the same frozen four 256-bit event keys and two IVs, with AES-256-CTR but **no** GP29 reduction or English scoring. Each source GP29 rune packet is interpreted as a big-endian BASE29 integer, rendered either at minimal byte length or at the exact fixed ceiling of (L\log_2(29)/8) bytes, then XORed against AES-CTR. This is a historically motivated candidate receiver because Cicada's solved 2012 stages used bytewise XOR and BASE29 encodings; no LP2 authorial clue selects their use in this order. The exact 65 source packets are the entire 12,956-rune unknown book, its nine visible chapters and its 55 rune-bearing physical pages. The same AES keys/IVs separately decode the **256 actual printed p50 table bytes**. Thus the complete unmodified-source matrix is `65×2×4×2 + 1×4×2 = 1,048` exact candidates, all covered by **1,048/1,048 passing AES symmetry/English-payload positive controls**.

The successful native [Windows Node22 run 44078288509](https://github.com/FlareZ123/liber-primus/actions/runs/44078288509), job `134021910448`, executed the full matrix using [the committed single-file original-source SFT](../sims/lp2_red256_base29_aes_ctr_binary_sft.cjs). Across 16 explicitly declared leading file signatures, including gzip, ZIP, PNG, PDF, JPEG, GIF, SQLite, ELF, RIFF, OGG, ID3 and ASCII PGP, it found **zero signature matches**. The greatest printable fraction among the first 128 bytes was only **0.517857** (p51 packet, parity/dot0 key, p50-first16 IV), with no coherent plaintext evidence. Whole original GP29 source-index SHA-256 is `73473a68c3fc4296f16009716d7fee18c9c102173e6e70d090c9494cc5bd9252`; the source native whole-packet decoded byte length is **7,868** under both widths.

A separate geometrically fixed consumer applies the red-event-derived 32-byte key cyclically to the 256 original p50 bytes, in either 32×8 printed row-major or 8 slices of 32 column-major order. These **eight** original repeated-key XOR outputs also match **zero** of the 16 specified leading file signatures; their full 256-byte outputs have only **96–106** printable ASCII/control characters and **28–44** bytes in the GP29 ordinal range 0–28. Every XOR is exact/self-inverse on original bytes.

**Decision:** no authentic binary file, known-format header, or recognizable prose was found under the precise source-projected keys, IVs, byte-packing or two repeated-XOR orientations. This is a negative for a frozen set of direct binary consumers and a set of leading signatures, **not** a proof against arbitrary encrypted binary content, hidden compression formats, different event selections, or other IV/key derivations. The source furnishes no independent instruction selecting such replacements, so avoid an unbounded AES parameter hunt.

## Reproduction, decision, and limits

- [Standalone Node.js 22 CJS original-source inverse](../sims/lp2_red256_ink_aes_ctr_full_original_sft.cjs), source inputs original gp corpus, original red/dot annotations and original 256 numeric bytes, deterministic and read-only
- [Native Windows manual workflow](../.github/workflows/agent43-red256-original-manual.yml)
- [PASS first complete 144-case original-cipher run](https://github.com/FlareZ123/liber-primus/actions/runs/44075255635)
- [PASS complete 729-rune F-bypass original-cipher extension](https://github.com/FlareZ123/liber-primus/actions/runs/44075819247)
- [PASS full 1,048-case BASE29/byte receiver plus eight fixed XOR orientations](https://github.com/FlareZ123/liber-primus/actions/runs/44078288509)

**Retire exactly these 144 red-event-bitkey AES-CTR GP29 consumer configurations as direct original plaintext routes.** Their bare inverses have near-uniform source outputs; if the authenticated solved plaintext-F bypass applies, none can even represent the complete first manuscript chapter. This cannot rule out a future independently sourced key, IV, alternative original A/B/C event inventory, a binary payload outside the frozen receivers and signatures, a new key schedule or a different source-selected cipher. Further ad hoc bit offsets/IVs without first-party instruction would be an unfounded expansion. The open research need is a creator-selected operator/key that deciphers and reencrypts meaningful contiguous unknown-page runes or authentic recovered historical material specifying one.
