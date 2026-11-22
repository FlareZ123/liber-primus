# Whole-source localized plaintext islands under basic GP29 inverses

**Agent 25, 12 November 2026. Classification:** controlled negative for direct native-English islands; no unknown LP2 plaintext, cipher or key recovered. [Runnable SFT](../sims/lp2_local_plaintext_islands_sft.cjs) · [successful original-input CI](https://github.com/FlareZ123/liber-primus/actions/runs/43154355988).

## Why test local plaintext?

Full-page or full-chapter language scores could conceal a small human-readable instruction. A historically simple static Caesar shift, Atbash reversal or consecutive-rune difference might locally decode 32–96 runes even when the other 12,000+ runes stay encrypted. This SFT searches the exact **12,956 GP29 runes** on all **55 original rune-bearing physical LP2 pages 0–55**, preserving their page order and original rune lengths. Every eligible page-local offset is included for each of **32, 64 and 96** runes.

The 116 frozen operations are:

\[
P_i=aC_i+b\bmod29,\qquad P_i=a(C_i-C_{i-1})+b\bmod29,
\]
with sign \(a=\pm1\) and shift \(b=0,\ldots,28\). At a page's initial position, the first-difference reading uses the first rune itself. No candidate operation, key, location, or run length is selected from an English phrase or the scan results. The null preserves the observed low adjacent-doublet rate.

The native GP29 conditional-trigram language scorer is trained solely on the first **195,000 characters** of the pinned Shakespeare corpus, producing **142,272 GP runes** under the repository's existing wordwise spelling convention. The independent remaining **76,528 GP runes** provide held-out controls. All scores below are mean log conditional next-rune probabilities; higher is more language-like.

## Complete original scan versus held-out prose

| Native GP window length | Highest original LP2 score, globally over 116 operations and all positions | Winner location/operation | Worst matching held-out Shakespeare window | Held-out 5th percentile |
|---:|---:|---|---:|---:|
| 32 | **−3.2934009848** | p0 offset71, direct −C+5 | −3.6113807615 | −2.8051627994 |
| 64 | **−3.6957813531** | p39 offset149, difference −ΔC+20 | **−3.2420993630** | −2.6831432550 |
| 96 | **−3.8336679001** | p39 offset117, difference −ΔC+20 | **−2.9540383289** | −2.6331897667 |

All **76,465** independent 64-rune Shakespeare windows and all **76,433** 96-rune windows score strictly higher than the globally most favorable original LP2 candidates. For 32 runes the weaker claim holds: the control 1st percentile is **−3.0191950627**, also above the original maximum, but the control minimum is below it. The p0 best 32-rune preview, LWHYBREATHNGPNOANYLONGEAHCPFDOISAPAWH, includes short English-looking fragments without coherent continuation.

Three deterministic whole-scan null streams with original page lengths and a matched suppressed-doublet rate have top scores:

| Control seed 0x3301, consecutive instances | Length32 | Length64 | Length96 |
|---:|---:|---:|---:|
| 1 | −3.1980751582 | −3.7117498849 | −3.8682097238 |
| 2 | −3.1728079755 | −3.7065896565 | −3.9256264846 |
| 3 | −3.2472793224 | −3.6811605945 | −3.9224058389 |

These three nulls are illustrative, not a calibrated tail-probability analysis; they are included to show that best-of-many local fragments can be deceptive.

**Planted positive:** an independently held-out **64-rune Shakespeare GP passage** encrypted by \(C_i=11-P_i\bmod29\) was inserted into an original-shaped page at p39 local149. The full 116-model/whole-book scan selects the correct page, within two positions of the insertion, and correctly recovers sign −1 and shift 11; all 64 plaintext runes also round-trip exactly. In 100 additional independently placed held-out samples for each length, **100/100** score better than the original global maximum. The manual CI run 43154355988 asserts all three source maxima, held-out counts, controls and exact decryption.

## Decision

No 64- or 96-rune Shakespeare-register GP plaintext island is supported anywhere in the original unsolved physical pages under these 116 historically simple static inverses. An unknown page might still use a changing key, distinct cipher, alternative language/register, transformed punctuation or shorter fragments. This finite negative supplies no authentic plaintext or key; it closes local shifted/differenced phrase fishing without requiring further arbitrary key sweeps. Reopen this branch only for a *separately supplied original clue* selecting a new reversible local mechanism.
