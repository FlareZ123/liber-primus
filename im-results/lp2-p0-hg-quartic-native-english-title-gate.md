# Source-defined H·G quartic fails a blind original p0 English-title inverse

**Decision, 22 November 2026:** The explicit original p50 polynomial factor obtained from H = (3,26,24) and G = (27,5,15), including a reciprocal reading, does not yield any two-word native-GP English title in the opening red 8+5-rune slots of LP2 page 0 when used as a degree-four homogeneous affine running-key recurrence with first-four state unknown. This is an exact source-and-language-conditional exclusion, not a solution or authentication of the proposed factor's creator-intended use.

## Artifact-specific causal premise

The original p50 numeric table has 256 encoded bytes and factors over Gematria Primus GF(29). Independent source-linked signatures are the 2013 byte/rune triple H = (3,26,24) and the actual LP2 p39 triple G = (27,5,15). Their exact product coefficients from constant to quartic are **(23,21,11,17,12)**, scaling to monic **(14,9,13,28,1)**. The table is divisible by this quartic. The source association makes this a more specifically motivated recurrence than an arbitrary short LFSR.

The original opening page has the red 8+5-rune title beginning GP29 **15,8,18,3,6,19,27,0 | 15,26,18,21,5**. A plaintext F rune is assumed transparent and consumes no key, as in established LP1/p56 practice. Because cipher F in position 7 can be a literal F or the encrypted output of a non-F rune, **both readings** are tested. The native spelling encoder is independently calibrated against LP1 and LP2 p57. Its original English lexicon supplies 5 eligible eight-rune first words when F is literal, 3,872 when F is encrypted, and 3,320 non-F five-rune second words.

The complete attempted operation is C[t] = a·P[t] + b + K[s] (mod 29), with every a in 1..28 and b in 0..28, K a free four-symbol seed propagated by the quartic linear recurrence. The first four consumed symbols determine K. All subsequent 8 or 9 red title symbols independently constrain the unknown phrase. A GF29 hash join enumerates all native-word pairs for all 812 affine maps, without preselecting a theme or using the following ciphertext as a search target.

## Original-input result

| Factor orientation | Cipher F interpretation | Eligible original native-English titles |
| --- | --- | ---: |
| Original H·G quartic | Literal F | **0** |
| Original H·G quartic | Encrypted non-F | **0** |
| Reciprocal quartic | Literal F | **0** |
| Reciprocal quartic | Encrypted non-F | **0** |

The zero is at the **red title only**, before touching the body text. The SFT includes four independent positive controls: authentic-width two-word native GP synthetic titles, freely seeded source quartic K, a=7, b=3, and independently fixed ciphertext F role. In all four controls the inverse recovers the planted exact title and affine parameters.

**Reproduce:** [Windows Node.js 22 original-input SFT](../sims/lp2_p0_source_hg_quartic_blind_title_sft.cjs). [Successful Windows CI run 44965885860](https://github.com/FlareZ123/liber-primus/actions/runs/44965885860). Exact parent source artifacts and native lexicon live under resources; the script checks them directly.

**Interpretation:** This closes the narrowly defined H·G GF29 quartic running-key affine reading of the original p0 title, subject to original English words being present in the fixed native lexicon and a key that starts at the beginning of the printed title. It does not establish a plaintext or a secret key, and it does not exclude quartic use as a polynomial checksum, an unrelated encoding, shifted key-state origin, a nonlinear operation or a downstream table extraction. The logical next step is to identify a genuinely source-indicated receiver for the factor or abandon this recurrent-key model, rather than continue unconstrained tweaks.
