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

## Unknown GP alphabet: complete 28-way relabeling invariant

The original decoder above assumes the *canonical* 28 non-EA plaintext rune labels. To test whether a **fixed but entirely unknown permutation of those 28 labels** hides recovered GP-English frequencies, run an independent exhaustive search over the **same 1,229,312 key and clock settings**, but select by the *permutation-invariant 28-symbol index of coincidence*. This diagnostic needs no GP-to-letter assignment: every bijective static plaintext relabeling preserves symbol collisions. Select model on the first350 original rune slots, freeze it, and calculate the index of coincidence on the remaining379 without fitting any heldout parameters.

| Statistic | Original LP2 | Solved-LP1 planted cipher with hidden 28-way relabeling |
| --- | ---: | ---: |
| Best training-selected coincidence | **0.04119538** | **0.06413672** |
| **Frozen heldout coincidence** | **0.03597833** | **0.06115410** |

The original winning recurrence is **a=25,b=23, seeds3,11, all-steps clock** and the heldout count uses 377 non-EA symbols. Permute the original observed nonzero logarithm digits while preserving each original transparent marker and repeat the full key search over **20** independently shuffled source versions: null mean heldout IoC **0.03563124**, **4/20** nulls at least as high as real (add-one **5/21≈0.23810**), largest null **0.03698008**. Original remains at the chance-like 1/28 coincidence level.

The independent solved-LP1 positive uses the same source-derived field cipher but first renames **all 28 non-EA plaintext labels through the unknown bijection p↦(5p+7)mod28**, preserving EA as the single transparent symbol. Its blinded score **0.06115410** heldout is close to normal GP-English collision structure despite the concealed label assignment; this demonstrates sensitivity to a correct low-order key even with an arbitrary *fixed* output substitution.

**Joint interpretation:** Neither the canonical GP language scorer nor the more general **unknown static 28-symbol alphabet invariant** recovers original text under the finite second-order 28-key recurrence. This leaves source-dependent clock irregularity, nonlinear/higher-order state, changing outer alphabets, binary/compressed intermediary, other key families and multilayer encryption open.

## Reproduce

[CommonJS exhaustive inversion and exact control](../sims/ea_field29_order2_key_recovery.cjs), successful [original-language run 42797446920](https://github.com/FlareZ123/liber-primus/actions/runs/42797446920) and [unknown-alphabet run 42798460258](https://github.com/FlareZ123/liber-primus/actions/runs/42798460258). An initial run failed solely on a plant diagnostic that compared the compacted nonzero-draw array to every plaintext position without restoring the transparent EA positions. The corrected script passes; the original cipher and search were unchanged.

A new claim requires a concrete source-backed key/state and original heldout plaintext whose exact re-encryption is reproducible. Additional unrestricted coefficient scans would offer diminishing value absent another independently fixed cipher property.
