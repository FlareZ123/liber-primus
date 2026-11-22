# Agent20: external chain-difference analysis and local cross-check

## External work worth integrating

Two independently maintained public research projects contain relevant 2026 work:

- [Leo-Y-Zhang/LiberPrimusAnalysis — REPORT.md](https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/blob/main/docs/REPORT.md), session 6–7 September 2026, reports that the 12,956 unsolved runes have 86 zero first-differences and a nearly flat distribution over the 28 nonzero differences. It proposes the representation cᵢ = cᵢ₋₁ + sᵢ, with an aperiodic 28-symbol step stream, but reports no recovered key or plaintext.
- [Dukotah/cicada3301 — MEASURED-CEILING.md](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/MEASURED-CEILING.md) and [Round 44 plan](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/analysis/round44/CAMPAIGN-PLAN.md) describe a broader controlled attack ledger and a November 2026 pivot toward physical-page channels. The July 2026 FINAL-SYNTHESIS is older; use the dated measured-ceiling/round documents instead.

These are external results, not yet adopted as authoritative conclusions in this repository.

## Local reproduction

Using the current repository's canonical corpus, flattening pages 0–55 gives 12,956 runes and 12,955 adjacent differences. The exact counts for Δᵢ = (Cᵢ − Cᵢ₋₁) mod 29 are:

[86, 459, 504, 440, 438, 446, 430, 470, 426, 510, 497, 455, 449, 504, 474, 470, 449, 404, 434, 474, 467, 463, 421, 486, 468, 467, 457, 476, 431]

The zero bin is 86 (the known doublet deficit). The 28 nonzero bins have mean 459.61 and χ² = 41.38 on 27 degrees of freedom (p ≈ 0.0378). Thus the nonzero distribution is broadly flat but not exactly uniform at the nominal 5% threshold; avoid claiming perfect uniformity. This independently reproduces the external histogram on the local corpus.

**Interpretation caution:** taking first differences is a bijective re-expression of the ciphertext once an initial symbol is fixed. The 86 zero steps are exactly the already-known adjacent-equal deficit; the difference histogram by itself does not prove that the creator used a chain cipher, nor does it recover plaintext. A chain-cipher model and an anti-repeat filter remain competing explanations for the same observable feature.

## One source-derived key check

I tested the p32 43-cell compass-path glyph sequence as a period-43 GP29 key in the difference domain, not only against raw ciphertext: direct step-stream subtraction and cumulative-integration variants, both signs, book-global and page-reset clocks, using rune ordinals and prime residues. The best trigram score was −6.174 versus raw −6.236, with no coherent plaintext. This rejects only those fixed-key/simple-chain interpretations, not the wider chain/OTP class.

The path key and source route are in sims/lp2_2016_43word_compass_sft.cjs and im-results/lp2-grid-byte-pointer-11cycle.md. The p50/p55 43-unit source-selector gate remains closed as a bounded negative in im-results/lp2-2016-p50-p55-43unit-source-selector-gate.md.

## Suggested use

Before creating another key-search lane, compare the external round ledger against this repository's existing tests and identify any genuinely unrepresented physical/source channel. Do not rerun the 43-period path-key test or treat the chain representation as a decryption.
