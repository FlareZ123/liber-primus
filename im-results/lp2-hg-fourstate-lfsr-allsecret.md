# Signed-2013 / p39 source polynomial: complete four-state additive GP29 inversion

**Agent 26, 11 November 2026. Original-input, all-secret-state negative for a precisely defined reversible cipher.** The [single-file CommonJS reproduction](../sims/lp2_hg_fourstate_lfsr_allsecret_sft.cjs) tests both directions of the exact independently source-linked degree-four polynomial against the original 729-rune opening and nine further original physical-page scopes. The [completed manual full-scope CI run 43037650459](https://github.com/FlareZ123/liber-primus/actions/runs/43037650459) passed **20/20 original-source search assertions plus the full native GP positive control** on Node 22.23.4. **No previously unknown LP2 plaintext, author-selected encryption key, or destination was recovered.**

## Why a contemporary solver could try a four-state register

The authenticated 2013 Cicada TCP-server challenge explicitly teaches base29 representation, and its worked example **3301 = 3QO** gives GP-field coefficient triple \`[3,26,24]\`. The original LP2 p39 red inscription gives the separate triple \`[27,5,15]\`. As already demonstrated in [the historical-source/grid factor report](2013-base29-gf29-grid-factor.md), interpreting both triples in ascending-power order yields polynomials that **exactly divide** the unchanged 256-coefficient printed LP2 table polynomial over GF29. This is the remarkable source relationship from which the present experiment starts. Its interpretation as an LFSR tap selector is still a *hypothesis*; the source does not say to use an LFSR.

Write the two factors as

\[
H(X)=3+26X+24X^2,\qquad G(X)=27+5X+15X^2\pmod {29}.
\]

The product and its monic normalization are

\[
F(X)=23+21X+11X^2+17X^3+12X^4,\quad
F_\mathrm{monic}(X)=14+9X+13X^2+28X^3+X^4.
\]

Previous exact source mathematics establishes that the class of \(X\) modulo \(F\) has multiplicative order **24,360**, enough for a single source-period keystream longer than the 12,956 unsolved GP runes. A four-rune additive running key is an inexpensive, reversible 2014-era operation suggested by that period and the author's known use of base29 arithmetic. Its critical missing premise is that the polynomial factors were intended as *keystream taps*.

## Exhaustively test every possible secret four-rune starting key

Specify the simplest candidate cipher:

\[
C_i=P_i+k_i\pmod {29},\qquad
k_{i+4}=15k_i+20k_{i+1}+16k_{i+2}+k_{i+3}\pmod {29}.
\]

All **\(29^4=707,281\)** initial states \((k_0,k_1,k_2,k_3)\) are searched, so a secret starting state is *not* an escape hatch for this model. The alternative direction of the same known polynomial has reciprocal taps

\[
k_{i+4}=2k_i+27k_{i+1}+26k_{i+2}+18k_{i+3}\pmod {29}.
\]

Every possible initial state is searched for this reciprocal orientation too. Negating a four-state pad simply chooses another of the exhaustively searched seeds; both additive signs are therefore included without doubling the search. The original source images and transcription remain unchanged. Neither original ciphertext, English guesses nor fitted key taps determine any recurrence coefficient.

The fixed **independent language model** is the GP longest-match transliteration of the existing Shakespeare reference \`resources/control/shakespeare_first300k.txt\`. Only the first 150,000 GP runes estimate a smoothed 29-letter unigram distribution. For each source scope and orientation, score **all 707,281 states on only the first 180 original ciphertext runes**. Carry the 100 highest-ranked seeds, frozen, to an unseen **next 240 original runes**; select the highest validation score within that list, then measure its untouched continuation. The first 729 source runes of each scope supply the same length as the positive plant. This is deliberately a source-constrained family test with an explicit selection procedure, not a universal language detector.

The readout is *fully reversible*: the program implements both emit and decode, and checks the model on an independent genuine native-GP positive control.

## Original results and native-English power control

Across the original 729-rune opening pp0–2, the untransformed ciphertext has GP index of coincidence **0.0340825**. Both recurrence directions admit attractive-looking **training** winners after optimizing 707,281 states, but the held-out language gains collapse. The strongest 240-rune validation result among the 100 train-selected seeds is:

| Source and frozen recurrence | Mean GP unigram log score on unseen 240 | Mean on subsequent unseen 309 | Full 729-rune IoC |
| --- | ---: | ---: | ---: |
| LP2 p0–2, original \(F\) | **−4.06099** | **−4.33369** | **0.03496** |
| LP2 p0–2, reciprocal \(F\) | **−3.92728** | **−4.26257** | **0.03466** |
| Independent genuine English encrypted with true original \(F\), blind key recovered | **−2.97660** | **−3.06020** | **0.05905** |

The **independent power test** uses the final 729 GP runes of the same stored Shakespeare file, disjoint from its first-150,000 training runes. Encrypt them with a hidden four-element key \`[1,5,11,24]\` (state number **594,733**). The unmodified all-secret inversion ranks that **true key first of 707,281**, recovers **729/729 authentic original-control GP runes exactly**, and reciphers them exactly. Its first 42 native transliteration characters begin \`HONSINCEWEAREUPINARMSIFNOTTOFIGHTWITHFOREIG\`, corresponding to genuine prose. This is **synthetic model-controlled recovery**, explicitly distinct from decrypting LP2.

Nine more original physical-source scopes were independently tested using the **same frozen scorer and the first 729 runes of each**, with all 707,281 secret seeds per orientation:

| Original rune scope | Original \(F\): validation / untouched | Reciprocal: validation / untouched |
| --- | --- | --- |
| p3–7 | −4.02905 / −4.04207 | −3.99954 / −4.13086 |
| p33–39 | −3.88109 / −4.47879 | −3.94195 / −4.26204 |
| p40–55 | −3.95985 / −4.34946 | −3.98430 / −4.21640 |
| p52–55 | −3.93392 / −4.17155 | −3.99640 / −4.43011 |
| p0–2 after the 13-red-rune heading (716 runes) | −4.00231 / −4.08953 | −3.90622 / −4.10487 |
| p8–14 | −4.02556 / −4.17360 | −4.03430 / −4.29947 |
| p15–22 | −3.95829 / −4.39649 | −3.95011 / −4.34216 |
| p23–26 | −3.85312 / −4.19656 | −3.90629 / −4.11416 |
| p27–32 | −3.90080 / −4.11098 | −4.00036 / −4.26131 |

All original recovered IoCs are **0.0343–0.0358**, broadly consistent with rune-like random data; none approaches the independent native control. Each scope is first-key optimized from scratch, giving the hypothesis considerable latitude. These extra scopes are not statistically independent from one another and should not be counted as separate evidential confirmations.

**Full execution:** [Successful 20-case manual CI run, 11 November 2026](https://github.com/FlareZ123/liber-primus/actions/runs/43037650459). The program asserts the source-polynomial product and original printed-grid divisibility, tests all 707,281 states for both orientations on every one of the 10 physical-page scopes, and ranks the correct independent English-plant seed first. It reports **zero original native-like outputs** under its predeclared GP-score/IoC gate. Only the existing, deliberately unrelated original scopes overlap; those repeated windows are never misrepresented as independent p-values.

**Run details:** [manual-only reproducible workflow](../.github/workflows/lp2-hg-fourstate-allsecret-manual.yml), [original numerical grid](../resources/liber-primus/lp2-grid-256.json), [original LP2 rune corpus](../resources/liber-primus/lp2-corpus.json), [source-linked 2013 factor derivation](2013-base29-gf29-grid-factor.md), [full grid polynomial factorization](lp2-grid-complete-gf29-factorization.md).

## Decision and limitation

**Retire the direct additive GP29 LFSR interpretation of the actual \(H\,G\) grid factors, even with an arbitrary four-rune secret starting state, under the declared section starts, both reciprocal orientations and the native GP-English readout.** This is a materially stronger negative than another fixed-seed search because it eliminates *every possible secret key* for this specific source-derived recurrence. The model-controlled English ciphertext is fully recovered with the correct secret at rank one by the same algorithm; the genuine original ciphertext remains nonlinguistic on independent validation.

The experiment does not exclude a plaintext-dependent clock, a nonlinear field register, a different cipher alphabet or inner binary codec, an external missing input, alternate section framing, or an entirely different role for the genuine 2013/p39 source factors. The exact factor pair is valuable mathematical material, but **neither the factorization nor any examined original illustration selects the necessary output/key operation**. Further arbitrary four-state phases or unrelated tap polynomials would undermine this experiment's source constraint without making a plausible human solve path. Preserve the tested original-input conclusion, and move attention to independent source-selected operations that can genuinely recover plaintext.
