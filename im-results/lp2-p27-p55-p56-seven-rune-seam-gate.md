# Punctuation-stripped seven-rune p27 ↔ p55/p56 match: two failed known-key transfers

**Agent29, 13 November 2026. Evidence class:** punctuation-stripped ciphertext structural extension and two source-anchored original inverses (32-mask p27 and 8-mask p55). **No unknown LP2 plaintext, authentic unknown-page key, source-selected full decoder, or destination has been recovered.**

## The original-source observation

The known repeated two-word ciphertext formula `DJU BEI` appears once in physical LP2 p27 and once as the last six runes of p55, the last unsolved page. [The prior half-book study](2016-28page-bookend-ratio-inverse.md) already establishes the exact six-rune repetition, page locations, two 28-page halves, and a source-word-shuffle rarity certificate. This study changes that observation in one precise way: **append the first rune of p56 after removing p55's terminal period and original physical page break.**

Original data and source images: `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/44.jpg` (p27), `72.jpg` (p55), and `73.jpg` (p56). The normalized GP29 indices, using the original 29-rune alphabet in the canonical corpus, are:

| Original location | Zero-based start | Seven GP29 indices | Romanized form |
| --- | ---: | --- | --- |
| p27 local rune 28, entirely on p27 | global 6,555 | `[23,11,1,17,18,10,25]` | `DJU BEI AE` |
| p55 local rune 70, crossing to p56 local rune 0 | global 12,950 | `[23,11,1,17,18,10,25]` | `DJU BEI | AE` |

The final `AE` at p56 local0 belongs to the **authentically solved prime-totient-cipher page**; p55 and p27 remain unknown. **Source-layout limitation:** p27 actually prints `ᛞᛄᚢ-ᛒᛖᛁ-ᚫᚠ` (`DJU-BEI-AE-F`) on one line, while p55 ends in `ᛞᛄᚢ-ᛒᛖᛁ.` (`DJU-BEI.`) followed by a page break. P56 begins a red heading whose first **ciphertext** rune is `AE`. The seven-rune match therefore exists only after **removing the period and page boundary** from the original print. The six-rune bookend remains authentic contiguous ciphertext across two words; the seventh rune is a cross-page numerical observation and no authored source instructs this concatenation. It is no demonstrated repeated plaintext.

An exhaustive contiguous GP29 n-gram census on the 12,956 unsolved runes **plus the 85 original p56 ciphertext runes**, **discarding p55's terminal period and the p55→p56 physical page break**, yields:

- Six-symbol repeated windows: exactly **two**, the overlapping `DJUBEI` and `JUBEIAE` windows, both with starts p27/p55 or one position later.
- Seven-symbol repeated windows: exactly **one**, `DJUBEIAE`, at original global offsets **6,555** and **12,950**.
- Eight-symbol repeated windows: **zero**. The next p27 symbol is F while the next p56 symbol is J.

The seven-rune extension was not captured by a census restricted to unsolved pp0–55, since its second copy crosses the solved-page boundary **after discarding punctuation and section markers**. The original images also distinguish this from a false claim that the 85 p56 runes are previously decrypted plaintext: the first p56 `AE` is **ciphertext**, decrypting to `A` under its independently known source key.

**Conditional evaluation:** Once the six-rune repeated formula has been selected, the seventh-symbol match has probability **1/29 (3.45%)** under the simple independent-uniform 29-rune continuation model. The prior manuscript-wide seven-gram birthday calculation addresses a different postselection and is withdrawn. This conditional number is not a calibrated source-prose null, and a punctuation-stripped cross-page continuation is no separately authenticated clue.

## First fixed known-key test: p27 forward from the shared AE

**Upstream premise:** the shared seventh rune may act as a mark pointing from p27 into p56's known decryption operation. **Countermodel:** an exact ciphertext duplicate at a physical seam can arise by chance or mark a different kind of instruction, and p56 may use a unique cipher absent on p27.

Freeze the only alignment selected by the observed seventh rune: **p27 local rune34** is `AE`, the same symbol as p56 local0. At p56 local0, authentic prime-totient decryption begins with prime2, shift `phi(2)=1`, giving plaintext GP `A`. Apply precisely this **p56 position-zero forward clock** to the next 85 original p27 runes (p27 local34..118), with `P=(C-phi(prime_j)) mod29` and the authentic literal-plaintext-F skip rule. The 85-rune length is fixed by solved p56, not selected by scoring. The p27 ciphertext segment contains F at local segment positions **1,20,27,34,77**. Grant the model **all 2^5=32 possible literal-F masks**, starting the prime clock at 2 and advancing it only on nonbypassed runes. No extra phase, sign, secret key, other start, reversed order, or reset is searched.

**Positive control:** decrypt actual p56, bypassing the authentic F at p56 local56, to all **85/85** original plaintext runes `AN END WITHIN THE DEEP WEB ... OUT THIS PAGE`; forward encryption exactly reconstructs the 85 original p56 ciphertext runes. Every one of the 32 p27 candidate inverse outputs also forward-reencrypts all its 85 original runes; those round trips alone convey no key authenticity.

| Diagnostic | Original 85-rune p27 anchored test | Authentic solved p56 | Solved p57 clear-GP control |
| --- | ---: | ---: | ---: |
| Best quadgram mean log10 (higher is better) | **−6.919735**, mask14, skips [20,27,34] | **−4.461649** | **−4.420633** |
| Highest GP29 IoC (not same mask) | **0.045378** | **0.070028** | **0.062710** |
| Candidate native-GP prose | **None recovered** | Genuine solved text | Genuine solved text |

The best p27 quadgram candidate begins `AIANMOMBUIAGTEASGJDAEWDWFPHITYEO...` and does not yield a coherent, original word-aligned sentence. The raw 85-rune original p27 segment has quadgram **−7.247339**, IoC **0.033613**. An 85-rune segment is short, and the finite quadgram scorer is an English diagnostic; these numerical contrasts reject only a literal direct transfer as a credible English plaintext candidate. They are no theorem against every alternative register or combination.

## Second fixed known-key test: p55 backwards around the solved p56 prime clock

The same seam directly touches the **last unknown p55 runes**. A separate simple hypothesis is to use the genuine **84 prime-totient key shifts consumed by solved p56** as a cyclic sequence, so the final p55 cipher rune uses the last shift (phase83) just before solved p56 begins at its authentic phase0. This makes the predicted operation deterministic from **the p55→p56 source boundary**, with no tunable starting phase, polarity or cipher. The textual image-associated phrase on solved p57, `SHED OUR OWN CIRCUMFERENCES`, offers a *possible* rationale for a circle, but the author **never explicitly instructs cycling p56's key backwards**. The direct hypothesis is therefore exploratory, not key authentication.

Original target: **all 76 p55 runes**, processed from local rune75 back to0, subtracting `phi(prime)` in reverse phase order and wrapping modulo the genuine 84-step consumed solved-p56 key. p55 ciphertext has F at local positions **15,25,41**. Allow all **eight** literal-plaintext-F bypass selections; the reverse key phase advances only for nonbypassed runes. Every candidate exactly forward-reencrypts the authentic p55 ciphertext, and a **76/76 genuine solved-p57 GP plaintext plant** independently survives the same cyclic forward/inverse operation.

| Whole-p55 diagnostic | Best of the eight frozen bypass variants | Solved GP p57 reference |
| --- | ---: | ---: |
| Quadgram mean log10 (higher is better) | **−7.278849**, mask6, skips [25,41] | **−4.420633** |
| Highest GP29 IoC (different mask) | **0.036140**, mask4 | **0.062710** |
| Last six recovered GP characters (all masks) | `FNEODP` | Not applicable |

No original p55 sentence, cryptographic instruction or identifiable format appears. All eight variants are strongly ciphertext-like against this English diagnostic. This retires **the exact backwards cyclic p56-totient-key continuation to p55**, with its page-boundary clock frozen by the seven-rune seam; it does not rule out other external key material, nonperiodic state or unselected rotations.

## Current interpretation and next decision

The **stripped-rune extension is exact**, but its full stop, page break and red heading make it weak as an original author-facing instruction. The seventh matching rune lies across this editorial boundary into solved prime-totient ciphertext. Two source-anchored uses of p56's authentic key, one forward from the matching p27 AE and one cyclically backward through p55, fail on original language diagnostics. The first `A` is forced by the shared ciphertext and shift1, so a single apparent plaintext `A` is not independent evidence.

Retire **p27 local34 → p56 phase-zero prime-totient key** as an 85-rune direct English inverse, and **p55 reverse 84-step p56-key circumference** as a complete 76-rune inverse. Do **not** search p27 phase offsets, alternate F patches, hidden multipliers, or new clocks from this match alone. A meaningful successor would require an original visible/historical instruction that maps the seven-rune seam to a different *reversible* operation or an independently given key. Preserve the seam for such a route rather than treating a unique repeat as a decryption.

**Exact reproduction:** [`sims/lp2_p27_p55_p56_seam_phi_sft.cjs`](../sims/lp2_p27_p55_p56_seam_phi_sft.cjs) is a standalone Node.js22 CommonJS test. It requires only the canonical original corpus and the already-pinned quadgram control, enumerates all six/seven/eight-gram duplicates, validates the authentic p56 positive control, enumerates the 32 p27 F masks and eight p55 cyclic F masks, asserts the original-cipher forward checks and reports the exact observed diagnostics.