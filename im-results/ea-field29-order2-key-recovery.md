# Full second-order Z28 key inversion of an EA-transparent F29 step cipher

**Evidence status (Agent 25, 10 November 2026):** exhaustive explicit original-ciphertext inversion of a short correlated-key family, successful exact solved-LP1 cipher plant, **negative original LP2 heldout**. No authentic unknown plaintext, key, cipher mechanism or destination recovered.

## Source-motivated decoder and finite key class

The independently red-marked GP prime sum435=29×15 on LP2 p40 selects primitive root15 of the 29-element finite field. The p15 red sum638=29×22, where **15²≡22 (mod29)**, supplies an additional visible link. [Agent50's reversible EA-zero-step construction](../sims/ea_zero_step_reversible.cjs) proposes that a rare plaintext EA rune causes exactly the same-rune transitions in the ciphertext. Its 86 visible original repeats are plausible under authentic solved Cicada text **provided ciphertext word boundaries are independent from plaintext word boundaries**. This is a hypothesis, not a decrypted original symbol.

Let Cᵢ∈Z29 denote published ciphertext, ΔCᵢ=Cᵢ−Cᵢ₋₁. A nonzero step yields the exact 28-way field logarithm Xᵢ=log₁₅(ΔCᵢ). A zero step is conditionally assigned plaintext EA (GP index28). Every nonzero step can then be inverted as

    Pᵢ=(Xᵢ−Kⱼ) mod28,
    Kⱼ=(a Kⱼ₋₁ + b Kⱼ₋₂) mod28,

with **a,b,initial K₀,K₁∈0..27** exhausted exactly, and two key clocks: all runes or nonzero steps only. This gives **28⁴×2=1,229,312** explicit hypotheses. The physically sourced (a=15,b=22) possibility is included without privileging it.

The initial **729 original LP2 cipher runes** across physical pages0–2 form a section-continuous input. The first 350 original runes choose the complete key model; the untouched 379-rune remainder determines the heldout score. The fixed 28-symbol GP-English unigram prior is trained only on the first140,000 symbols of independent Shakespeare GP material. Scores are average log likelihood ratios per decoded non-EA rune against a flat 28-symbol prior; true GP-English-like plaintext has a positive average.

## Completed results with source-independent positive

| Evaluation | Training GP log odds / rune | Frozen heldout / rune |
| --- | ---: | ---: |
| **Authentic unsolved LP2 p0–2** | **−0.38894** | **−0.74243** |
| Native solved-LP1 plaintext encrypted under the candidate cipher | **+0.38889** | **+0.36838** |
| 20 shuffled original-rank controls (heldout mean) | — | **−0.80715** |

The actual best training-selected original-LP2 model has **a=27,b=11, seeds10,15, nonzero-only clock**. Its decoded preview begins L E R N S G B Y H U R O O O AE B IA H ..., remains nonlinguistic, and heldout scoring stays below the language-like regime. Four of twenty controls yield equal or better heldout, giving add-one upper-tail **5/21≈0.2381**. The slight null-relative difference does not indicate a decryption.

**Exact positive cipher:** Construct a ciphertext from independently solved historical **LP1 GP plaintext** using ΔC=0 if P=EA, otherwise ΔC=15^((P+K)mod28)mod29. The planted key is the source-derived recurrence **a=15,b=22**, seeds8,13, advancing only on nonzero steps. With the correct planted key, **728/728 postinitial symbols**, including transparent EA positions, exactly decrypt and re-encrypt. The blind solver selects a mathematically equivalent-on-most-draws second-order recurrence whose heldout score is a strongly positive **+0.36838**, but its reported coefficients differ; the source detector recovers language-like plaintext, while uniquely identifying all secret parameters is not demonstrated. The two fitted key sequences differ on one early draw and agree on the other 749 of the first750 draws, an exact recurrence comparison.

**Conclusion:** The original input fails this fully specified short Z28 homogeneous key class under the source-derived EA step map, one continuous 729-rune section, and the fixed GP-English register. Alternative clock functions, nonhomogeneous or higher-order state, an unknown plaintext alphabet, more than one encryption layer or a non-English intermediate remain open.

## Reproduce

[CommonJS exhaustive inversion and exact control](../sims/ea_field29_order2_key_recovery.cjs), successful [manual-only GitHub Actions run 42797446920](https://github.com/FlareZ123/liber-primus/actions/runs/42797446920). An initial run failed solely on a plant diagnostic that compared the compacted nonzero-draw array to every plaintext position without restoring the transparent EA positions. The corrected script passes; the original cipher and search were unchanged.

A new claim requires a concrete source-backed key/state and original heldout plaintext whose exact re-encryption is reproducible. Additional unrestricted coefficient scans would offer diminishing value absent another independently fixed cipher property.
