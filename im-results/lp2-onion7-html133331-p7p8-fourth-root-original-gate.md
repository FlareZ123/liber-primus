# Original onion7 HTML 133/331 supplies the p8 red reciprocal fourth-root pair

**Agent44, 22 November 2026. Classification: original-source exact relation plus a finite original-cipher negative. No recovered unknown LP2 plaintext or decipherment.**

## First-party-era inputs and the unanticipated cross-source equality

The archived 2014 onion7 stage index (`resources/historical/cicada2014-onion7-original-index.html`) contains literal `<title>133</title>` and `<div id="331">`. Its historical three community mirrors agree at the byte level, though the HTML itself has no verified independent Cicada PGP signature. Neither value was inferred by ciphertext fitting. Read the numbers in the already-authored **Gematria Primus field GF29**, without choosing a numerical offset:

- `133 mod29 = 17`, `331 mod29 = 12`.
- `17+12 = 29`, `17·12 ≡ 1 (mod29)`, `17² ≡ 12² ≡ −1 (mod29)`. They are precisely the **two primitive fourth roots of unity in GF29**.
- On the unmodified original physical **p8** source, the entire initial **12-rune red heading has GP-index product12**, and its **terminal red rune is GP index17**. In the ink annotation's census of **18 complete red spans**, p8 is the only span with product12 and the only span ending in index17. This uniqueness is a descriptive census, not a discovery-wide probability.
- Independently, the already-reported p7 five-red-word polynomial `P(x)=11+26x+8x²+15x³+2x⁴ (mod29)`, whose coefficients are original red *whole-word GP products*, yields `P(19)=12` and `P'(4)=17`. The original p8 title starts the literal Roman `XIX` and then GP-index19 `M`, and its first red word has **4 runes**. Thus both numeric residues arise again in a specifically visible p7→p8 relation.

Unlike an isolated pair of original rune residues, this cross includes a dated archived distribution-page metadata pair and the manuscript's source-physical red heading. The natural, human-legible conjecture is an **order-four reciprocal/quarter-turn field operation**, with the initial p8 red word of four runes identifying a four-register input. **It is conjectural:** no original page explicitly says to apply modulo29 to the HTML metadata, use a discrete Fourier transform, or interpret its heading as a cryptographic IV and key. The HTML values are the nonzero digits of 3301 and its reversal, so source-author motives might be unrelated to p8. A sizeable menu of previously explored GP products/operators also creates postselection risk.

## Reversible decoder test on the actual original p8→p14 receiver

Physical p8 contains the following **source-correct, whole-register packet**:

- First **4 red runes**, GP indices `[14,10,14,19]`, as a provisional four-vector IV.
- Second **8 red runes**, GP indices `[1,14,19,5,2,13,3,17]`, as a provisional alternating pair of four-vector keys.
- First **243 original black p8 runes plus the five black p9 runes completing the carried six-rune word**, making **248 black runes** exactly. Thus the eight red key and the full 248-body packet are **256 symbols**, with the separate four-rune header giving 260 original glyphs overall.

For `ω∈{12,17}`, the invertible length-four GF29 DFT is `F_ω(X)[k]=Σ_{j=0}³ X[j]ω^(jk)`; its exact inverse uses `4⁻¹=22` and `ω⁻¹`. Standard before-transform CBC is `C_t=F_ω(P_t+s·K_{t mod2}+C_(t−1))`. Standard after-transform CBC is `C_t=F_ω(P_t+s·K_{t mod2})+C_(t−1)`. The initial `C_(−1)` is the original four-rune IV and `s∈{−1,+1}`. These are **eight fully specified exact reversible candidate inverses**, using only the printed 4/8 source keys and the external 12/17 roots.

**Result on original ciphertext:**

- The first **248 original black runes** yield whole-rune index of coincidence between **0.03359671 and 0.03529450**, no sustained native GP29 prose.
- Continuing the **same eight frozen rules** across the first **1,716 black runes of p8–p14** yields whole-IoC between **0.03418214 and 0.03457087**, again random-like without decrypted natural text.
- All eight cases have exact ciphertext forward replay. They also recover **248/248 authentic solved-p57 GP29 runes** from corresponding independently constructed source-IV/branch-compatible planted ciphertext.

[Original-corpus read-only SFT](../sims/lp2_p8_onion133331_dft4_cbc_original_sft.cjs) · [Windows Node22 CI PASS 45056213744](https://github.com/FlareZ123/liber-primus/actions/runs/45056213744).

## Decision and next experiment worth funding

The **GF29 residue / fourth-root pair is an exact, source-independent cross-artifact arithmetic observation**, which may help choose a human puzzle operation, although its intentionality is currently unproved. A historically recognizable **DFT4-plus-two-four-rune-key CBC** receiver has now been rejected against nearly the whole original botanical section, without fitting keys or choosing a beneficial clock offset. Neither this exact numeric pair nor the older p7 polynomial turns into an unknown plaintext/key through this test.

A future path must identify a **first-party instruction selecting a specific reversible operation** or an authentic additional key. A new arbitrary nonlinear 4-state family is **not** supported solely by the visual/numeric coincidences. Keep this clue provisional in `im-results/` until a frozen independent plaintext-bearing original receiver changes the assessment.
