# First-release Liber Primus, solved and printed streams, as direct LP2 running keys

**Agent 7, 16 November 2026. Three source-register bounded original-cipher negatives, not decryptions.** A simple puzzle-designer move would be to use the first-release Liber Primus's already recovered GP29 rune text as the running pad for the 2014 second release. The first book itself says its words and numbers are sacred; its cipher pages already teach a 29-rune additive Vigenère inverse. This is a *human-plausible* source choice, though no authenticated instruction is known to select the whole LP1 plaintext as a key.

## Source-fixed experiment

- Key: all **2,799 GP29 runes** in the seven solved original first-release sections of `resources/external/relikd-solved-gp29-native-v1.json`, in the stored print order; punctuation removed. This is a verified-derived transcription of known solved LP1 content, not original JPEG carrier bytes.
- Original untouched ciphertext: all **12,956 GP29 runes** across LP2 physical pp0–55 (physical p50 runeless), `resources/liber-primus/lp2-corpus.json`. The fixed illustrated section starts are `0,729,1874,3603,5506,6527,7960,9640,12648`.
- Receiver: first **729 runes of each of the eight sufficiently long illustrated chapters**; all **308 runes of the ninth**. These are source-visible chapter boundaries, not fitted to a cipher score.
- Fixed cipher: `P[i]=(C[i] ± K[offset+i]) mod29` for both signs. A separately bounded variant treats every *ciphertext* literal rune F (index zero) as transparent `P=F` and advances the source key only on non-F ciphertext, consistent with the known solved-page interrupter idea. Source key offset is granted freely at every contiguous 729- or 308-rune position: 2,071 offsets for each long chapter and 2,492 for the last.
- Selection statistic: native GP29 index of coincidence, optimized over *all* key offsets separately for each chapter, sign and F-bypass variant. This permissive postselection makes the result favor the hypothesis.

| Original chapter | Max IoC, direct ±, no bypass | Max IoC, literal-F skip ± |
| --- | ---: | ---: |
| p0–2 | 0.0361514 | 0.0396675 |
| p3–7 | 0.0367506 | 0.0386537 |
| p8–14 | 0.0362230 | 0.0381374 |
| p15–22 | 0.0363926 | 0.0395205 |
| p23–26 | 0.0359705 | 0.0388798 |
| p27–32 | 0.0361364 | 0.0396298 |
| p33–39 | 0.0359781 | 0.0376023 |
| p40–53 | 0.0360271 | **0.0400895** |
| p54–55 (308 runes) | 0.0394898 | 0.0392360 |

The exact original 2,799-rune LP1 key's **first 729 original plaintext runes** have IoC **0.060273745**. A fully reversible 729-rune synthetic GP29 additive plant with a deliberately selected LP1 offset recovers its **729/729** source plaintext runes exactly. A second source-shaped plant exercising ciphertext-F bypass likewise recovers **729/729**, with accidental ciphertext-F collisions avoided in the encoder. The **largest** of all 36 original-cipher chapter×sign×mask maxima is **0.0400895**. None approaches the positive native GP-English register, despite treating each chapter and key origin independently.

**Exact runnable, read-only CommonJS:** [SFT](../sims/lp2_lp1_plaintext_direct_runningkey_original_sft.cjs). Both original-source computations ran using the exact committed JSON/transcription data through the connected GitHub-source runtime; the updated standalone CJS has not yet been run in a local repository checkout or CI.

## Independent first-release source encoding: printed, not decrypted

The same original-player motivation offers a distinct key: the first book's **printed GP29 glyphs in order**, including the portions still encrypted in print. This avoids using its editor-reconstructed plaintext, and makes no choice between stage-specific first-book ciphers. Read the canonical Wulfic original-scan-derived `resources/transcriptions/lp1_wulfic_canonical.txt` in physical order, remove punctuation/numerals/line breaks and concatenate the **2,797 original printed rune identities**. This is source-derived rather than original JPEG bytes, so it is a different historical key proposal from the solved-cleartext stream above.

Run the same exactly fixed nine chapter openings, both additive signs, both F conditions, and *every* key offset against unchanged LP2 ciphertext. As with the first key, all four sign/F forms are complete receiver definitions before scoring.

| Original chapter | Max IoC, printed LP1 direct ± | Max IoC, printed LP1 literal-F bypass ± |
| --- | ---: | ---: |
| p0–2 | 0.0359856 | **0.0402440** |
| p3–7 | 0.0360195 | 0.0377681 |
| p8–14 | 0.0360874 | 0.0381714 |
| p15–22 | 0.0363587 | 0.0393584 |
| p23–26 | 0.0360158 | 0.0386876 |
| p27–32 | 0.0361213 | 0.0390947 |
| p33–39 | 0.0360045 | 0.0372481 |
| p40–53 | 0.0358688 | 0.0393660 |
| p54–55 (308 runes) | 0.0380304 | 0.0393629 |

A synthetic 729-rune source-LP1 plaintext encrypted under the printed stream at a secret offset is recovered **729/729** by the same tested inverse. The strongest of the **216** combined original chapter×source×sign×F-offset sweeps is **0.0402440**, with no recognizable native GP-English key recovery. This narrows an obvious creator-plausible historical source reuse without implying anything about source-key KDFs, stateful skip paths, ciphertext word order, or other ciphers.

## Original-koan spelling correction and exact solved register

The candidate *solved* LP1 source has a recoverable **two-word editorial discrepancy**. In `resources/external/relikd-solved-gp29-native-v1.json`, solved `0_koan_1` is **780 runes**, whereas the four original koan pages of `resources/transcriptions/lp1_wulfic_canonical.txt` contain **778 runes**. The original encryption's known GP29 Atbash/reversed+3 decoder is `P=(31−C) mod29`. Its exact application to those 778 printed ciphertext runes aligns against the derived solved text with just two local word replacements:

- Original koan offsets **140–142** read **WHO** (`ᚹᚻᚩ`) in “THAT IS NOT WHO YOU ARE”; the derived relikd solved version reads **WHAT** (`ᚹᚻᚪᛏ`).
- Original koan offsets **276–278** again read **WHO** in “THAT IS WHAT YOU DO NOT WHO YOU ARE”; the derived relikd version again reads **WHAT**.

These corrections come from known LP1 plaintext, not any unknown LP2 decryption. Preserve the independent external reference as published. For key research, rebuild the **2,797-rune source-corrected solved-LP1 key** by replacing only the `0_koan_1` part with the original printed GP29 ciphertext's exact historical inverse.

All 36 source-corrected chapter×sign×F-mask LP2 searches, each with every possible source offset, were executed. Its maximum IoC **0.0400895** (pp40–53, negative sign, literal-F bypass) again fails to recover native GP plaintext. A 729-rune source-shaped synthetic additive plant recovers **729/729** under this corrected key. In total the three-source study comprises **108** original-input combinations, with combined maximum **0.0402440** (original *printed* key, p0 section).

## Historical GP prime numbers as the first-release key alphabet

The solved first-release WISDOM explicitly says **“THE PRIMES ARE SACRED.”** This supplies a concrete second, source-authored numerical reading of any first-release GP rune beyond its 0–28 index: **its corresponding GP prime number, reduced modulo29**. No invented KDF or fitted residue table is required: `K[i] = resources/liber-primus/lp2-corpus.json.prime[LP1Rune[i]] mod29`. The alternate prime-minus-one/totient-of-prime expression differs by a global Caesar shift; its IoC is the same and does not require a separate search.

The three original-order LP1 source registers were each transformed using this exact source-defined prime mapping. Repeat the identical nine original LP2 chapter windows, both ± additive directions, literal ciphertext-F skip on/off, and every contiguous source offset. This adds **108** separate prime-encoded original-input scans to the 108 index-encoded scans. Their maxima are **0.0395280** (published solved LP1), **0.0397202** (original-source-corrected solved LP1), and **0.0398370** (first-release printed LP1). The best original offset is **72** in the first LP2 visual chapter under printed-LP1 prime values, positive addition, ciphertext-F bypass; output remains nonlinguistic. Fully controlled source-GP29 additive plants invert **729/729** with the same prime mapping. Across **216** original-input conditions, the greatest IoC is still **0.0402440**, well below the native first-release register 0.060274.

This retires only the **parameter-free direct GP29 additive reuse** of LP1 as indices or the source's prime values. It does not warrant another fitted prime gap, nonlinear key table or arbitrary source-key clock.

## Decision

The **edited solved LP1 plaintext**, the **source-corrected solved LP1 plaintext**, and the **original first-release printed rune sequence**, encoded as **rune indices or their first-party GP primes**, used as **contiguous direct GP29 additive running keys**, fail to recover native-looking GP prose from the start of **any** of the nine illustrated unknown chapters. Allowing either additive direction, every source offset, and the two stated F masks does not improve it. This retires **this direct and transparent-F-only source-to-key transfer**, which is distinct from a cryptographic running-key decoder with changing key pointer, undisclosed key alphabet, different page or section clocks, or a book-code lookup. An independently authored instruction would be needed to justify those new assumptions. No unknown LP2 plaintext, historical LP2 key, complete inverse, or destination was recovered.