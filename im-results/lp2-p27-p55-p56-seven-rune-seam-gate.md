# Seven-rune p27 ↔ p55/p56 seam: an exact source clue and a failed known-key transfer

**Agent29, 13 November 2026. Evidence class:** original-ciphertext structural extension and one source-anchored, 32-mask direct inverse. **No unknown LP2 plaintext, authentic unknown-page key, source-selected full decoder, or destination has been recovered.**

## The original-source observation

The known repeated two-word ciphertext formula `DJU BEI` appears once in physical LP2 p27 and once as the last six runes of p55, the last unsolved page. [The prior half-book study](2016-28page-bookend-ratio-inverse.md) already establishes the exact six-rune repetition, page locations, two 28-page halves, and a source-word-shuffle rarity certificate. This study changes that observation in one precise way: **include the immediately following rune on the original next physical page, p56.**

Original data and source images: `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/44.jpg` (p27), `72.jpg` (p55), and `73.jpg` (p56). The normalized GP29 indices, using the original 29-rune alphabet in the canonical corpus, are:

| Original location | Zero-based start | Seven GP29 indices | Romanized form |
| --- | ---: | --- | --- |
| p27 local rune 28, entirely on p27 | global 6,555 | `[23,11,1,17,18,10,25]` | `DJU BEI AE` |
| p55 local rune 70, crossing to p56 local rune 0 | global 12,950 | `[23,11,1,17,18,10,25]` | `DJU BEI | AE` |

The final `AE` at p56 local0 belongs to the **authentically solved prime-totient-cipher page**; p55 and p27 remain unknown. Thus this is a *ciphertext* match across different physical and cryptanalytic regions, not a demonstrated repeated plaintext phrase.

An exhaustive contiguous GP29 n-gram census on the 12,956 unsolved runes **plus the 85 original p56 ciphertext runes**, preserving the authentic p55→p56 adjacency, yields:

- Six-symbol repeated windows: exactly **two**, the overlapping `DJUBEI` and `JUBEIAE` windows, both with starts p27/p55 or one position later.
- Seven-symbol repeated windows: exactly **one**, `DJUBEIAE`, at original global offsets **6,555** and **12,950**.
- Eight-symbol repeated windows: **zero**. The next p27 symbol is F while the next p56 symbol is J.

The seven-rune extension was not captured by a census restricted to unsolved pp0–55, since its second copy crosses the solved-page boundary. The original images also distinguish this from a false claim that the 85 p56 runes are previously decrypted plaintext: the first p56 `AE` is **ciphertext**, decrypting to `A` under its independently known source key.

A simple stationary 29-rune uniform-output model with observed same-symbol transition rate 86/12,901 gives an approximate birthday expectation of **0.00565** seven-gram collision pairs over 13,041 runes, or approximately **0.56%** chance of at least one. This is an *idealized model calculation*, not a discovery-wide p-value, not an English/text-structure null, and not independent of the already-noticed six-rune bookend. It indicates why a seam-specific operator test is worth doing without attributing it to the authors.

## One fixed known-key test motivated by the seam

**Upstream premise:** the shared seventh rune may act as a mark pointing from p27 into p56's known decryption operation. **Countermodel:** an exact ciphertext duplicate at a physical seam can arise by chance or mark a different kind of instruction, and p56 may use a unique cipher absent on p27.

Freeze the only alignment selected by the observed seventh rune: **p27 local rune34** is `AE`, the same symbol as p56 local0. At p56 local0, authentic prime-totient decryption begins with prime2, shift `phi(2)=1`, giving plaintext GP `A`. Apply precisely this **p56 position-zero forward clock** to the next 85 original p27 runes (p27 local34..118), with `P=(C-phi(prime_j)) mod29` and the authentic literal-plaintext-F skip rule. The 85-rune length is fixed by solved p56, not selected by scoring. The p27 ciphertext segment contains F at local segment positions **1,20,27,34,77**. Grant the model **all 2^5=32 possible literal-F masks**, starting the prime clock at 2 and advancing it only on nonbypassed runes. No extra phase, sign, secret key, other start, reversed order, or reset is searched.

**Positive control:** decrypt actual p56, bypassing the authentic F at p56 local56, to all **85/85** original plaintext runes `AN END WITHIN THE DEEP WEB ... OUT THIS PAGE`; forward encryption exactly reconstructs the 85 original p56 ciphertext runes. Every one of the 32 p27 candidate inverse outputs also forward-reencrypts all its 85 original runes; those round trips alone convey no key authenticity.

| Diagnostic | Original 85-rune p27 anchored test | Authentic solved p56 | Solved p57 clear-GP control |
| --- | ---: | ---: | ---: |
| Best quadgram mean log10 (higher is better) | **−6.919735**, mask14, skips [20,27,34] | **−4.461649** | **−4.420633** |
| Highest GP29 IoC (not same mask) | **0.045378** | **0.070028** | **0.062710** |
| Candidate native-GP prose | **None recovered** | Genuine solved text | Genuine solved text |

The best p27 quadgram candidate begins `AIANMOMBUIAGTEASGJDAEWDWFPHITYEO...` and does not yield a coherent, original word-aligned sentence. The raw 85-rune original p27 segment has quadgram **−7.247339**, IoC **0.033613**. An 85-rune segment is short, and the finite quadgram scorer is an English diagnostic; these numerical contrasts reject only a literal direct transfer as a credible English plaintext candidate. They are no theorem against every alternative register or combination.

## Current interpretation and next decision

The **seam is exact** and strengthens the previously published, highly unusual p27/p55 paired-word bookend. The seventh matching rune lies across the boundary into the solved prime-totient ciphertext. Under the simplest follow-the-known-key reading, the seam should unlock at least a substantial phrase on p27; that explicit original test instead fails. The first `A` is forced by the shared ciphertext and shift1, so a single apparent plaintext `A` is not independent evidence.

Retire **p27 local34 → p56 phase-zero prime-totient key** as an 85-rune direct English inverse. Do **not** search p27 phase offsets, alternate F patches, hidden multipliers, or new clocks from this match alone. A meaningful successor would require an original visible/historical instruction that maps the seven-rune seam to a different *reversible* operation or an independently given key. Preserve the seam for such a route rather than treating a unique repeat as a decryption.

**Exact reproduction:** [`sims/lp2_p27_p55_p56_seam_phi_sft.cjs`](../sims/lp2_p27_p55_p56_seam_phi_sft.cjs) is a standalone Node.js22 CommonJS test. It requires only the canonical original corpus and the already-pinned quadgram control, enumerates all six/seven/eight-gram duplicates, validates the authentic p56 positive control, enumerates the 32 p27 F masks, asserts the original-cipher forward checks and reports the exact observed diagnostics.