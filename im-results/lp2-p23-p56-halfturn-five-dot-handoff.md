# Original LP2 p23 / p56 five-dot half-turn correspondence

**Decision (Agent42, 14 November 2026):** The five large black dots at the top of unknown LP2 physical p23 are the same image artwork as the five dots near the bottom of solved LP2 physical p56, rotated **180 degrees** and translated. This exact original-ink relationship is unique among all 58 LP2 page scans under a fixed image template. It creates a manuscript-selected **half-turn / reversal lead** linking the p23–26 chapter opening to the solved *AN END* page. It does **not** establish a cipher inversion, manuscript key, unknown plaintext, or final destination.

## Original inputs and complete reproducibility

- Physical p23 = [original archive 40.jpg](../resources/liber-primus/40.jpg), 2400×3600 pixels, SHA-256 d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee.
- Physical p56 = [original archive 73.jpg](../resources/liber-primus/73.jpg), 2400×3600 pixels, SHA-256 a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc.
- [Reproducible original-source SFT](../sims/lp2_p23_p56_halfturn_emblem_sft.py) uses OpenCV, pins both original JPEG hashes, measures connected components and original ink, searches every physical LP2 page p0–p57 at two template orientations, and tests the direct historical inverse motivated below. Run from the repository root with Python 3.12, NumPy, and OpenCV.

A dark-pixel threshold of 90 inside the p23 bounding rectangle (700,450,1650,850) isolates **five** connected ink circles, each 3,370–3,560 source pixels. The corresponding p56 rectangle (800,2400,1700,2820) has five circles, each 3,406–3,551 pixels. Sort centroids by increasing X in p23 and **decreasing** X in p56. All five pairs obey the same 180° image-space relation:

\[
(x_{56},y_{56})=(2401-x_{23},\,3255-y_{23}),
\]

with maximum absolute centroid-coordinate discrepancies **0.5818 source pixels** for X and **0.5679** for Y.

Compare full source-resolution binary ink in p23 (x=735..1599,y=450..849) with the exact corresponding p56 patch after a 180° rotation, threshold 125. P23 contains **17,908** dark pixels; p56 contains **17,888**; intersection **17,684**. This is **17,684 / 18,112 = 0.976369258 intersection-over-union**, despite independent JPEG encoding, and demonstrates reproduction of the actual drawn dot artwork.

The two thresholded patches differ in exactly **428 dark-pixel memberships**. Every changed pixel lies within **1.4143 pixels of the corresponding dark-circle boundary**, leaving no changed dot interior at this threshold. That confines the detected differences to one-pixel edge and resampling effects; it does not support an added internal dot payload.

For uniqueness, resize all **58** original LP2 scan pages 17.jpg–74.jpg to 600×900, use the frozen p23 rectangle x=184..399,y=113..212 as the template, and search each image with normalized cross-correlation in both 0° and 180° orientations. Rankings:

| Image and orientation | Maximum template correlation |
| --- | ---: |
| p23 40.jpg, direct positive control | **1.000000** |
| p56 73.jpg, **180°** | **0.990527** |
| Strongest alternative on any other LP2 page (archive 24.jpg, 180°) | **0.440540** |

Other 0°/180° matches on p23/p56 score at most 0.625208. The original five-dot reuse is highly specific to this pair.

## Source-selected cipher gate, with limits

The original ink annotations independently label p23's **first 16 runes as red** (heading at local positions 0–15). They contain **no ciphertext F**. The solved p56 prime-totient operation decrypts GP29 indices with consecutive primes from 2, key \(k_i=(p_i-1)\bmod29\), and \(P=(C-k_i)\bmod29\), while a *literal plaintext* F must remain ciphertext F and bypass the key. The SFT first reproduces **ANEND** on the original p56 red five-rune heading, exactly **5/5**.

The 180° clue motivates two finite reversals of p23's first16 source runes: reverse the rune stream, or reverse the 16-step authentic prime-totient key. All four direct zero-phase p23 headings were tested with no altered cipher/key constants:

| P23 ciphertext read | Source p56 key | GP transliteration | Required F contradiction |
| --- | --- | --- | --- |
| Forward | Forward | FOEOSAETHWBBENCCROEO | **Position 0** |
| Forward | Reversed | WWDIEAPAPNGUIATHIPHAE | None |
| Reversed | Forward | AEHPITHIAUNGPAPEAIDWW | None |
| Reversed | Reversed | OOERCCNEBBWTHAESOOEF | **Position 15** |

The first and fourth cases decrypt a **non-F ciphertext rune into plaintext F**, impossible under the authentic p56 plaintext-F bypass. Those two exact consumers cannot transfer the solved-page rule. The middle two satisfy the F constraint but do **not** yield an independently recognizable phrase; 16 runes are insufficient for a universal exclusion of additional state or non-English intermediate outputs. Frozen direct GP Atbash on original/reversed headings likewise gives IARNGWOEXCOEEJETEOJETH / THEJEOTEJEOECXOEWNGRIA without established prose. No source-authorized phase or added key was fitted.


### Original full-chapter inverse, allowing every F bypass

The entire source-selected p23–26 chapter has **1,021 original ciphertext runes** (page lengths 213, 270, 273, 265). For each of the four direct half-turn arrangements, the reproducible SFT runs a complete state-set decoder of the historical **plaintext-F bypass**, allowing every source-consistent skip or encrypted-non-F branch at each ciphertext F. The clock starts at consecutive prime 2; the reverse-clock hypothesis uses exactly the 1,021 source-length primes in reverse. No hidden parameter, padding, word reset, skipped page or post hoc phase is introduced. The same state-set decoder accepts the actual solved p56 source ciphertext with its legitimate bypass path.

| Original chapter p23–26 rune direction | 1,021 prime-totient key direction | First unavoidable plaintext-F contradiction, zero-based rune offset |
| --- | --- | ---: |
| Forward | Forward | **0** |
| Forward | Reversed | **7** |
| Reversed | Forward | **162** |
| Reversed | Reversed | **24** |

At each stated offset, **all** still-reachable F-skip clock states would force a non-F ciphertext rune to decrypt to literal plaintext F, contradicting the established p56 encryption rule. This is an exact original-input exclusion of the four **direct, whole-chapter, no-offset prime-totient consumers** of the new half-turn motif. It says nothing about stateful or non-prime consumers, a separate source-selected key, or nonlocal symbol operations. The independent exact visual match remains sound.


## Interpretation and decisive next research

The dots appear in **upper opening matter** on p23, first page of the original p23–26 visual chapter (1,021 runes), and in **lower concluding matter** on solved p56, headed *AN END*. Reused artwork and opposite placement make an intended bookend/inversion hypothesis testable. The page designer could also reuse a decorative element rotated to fit the layout.

**Next productive decision:** identify an independent 2014–2016 Cicada source instruction or another original-page operation selecting the exact operand to reverse: symbol order, page order, a derived key stream, a reading direction, or a spatial operand. Test a single source-selected reversible p23–26 operation against a withheld original segment and demand at least **40 contiguous runes** of coherent, source-native text or an independently checkable signed instruction. Without that selector, more arbitrary reverse-Vigenère keys or phases have no causal route to authentic plaintext.

**Current status:** Verified original-artwork relationship and bounded negative direct consumers. **Zero** new unknown LP2 runes authenticated as plaintext. This remains an intermediate structural finding rather than a solved-page record.
