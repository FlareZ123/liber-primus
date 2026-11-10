# Full numerical-grid polynomial evaluated on the original red-triad GF(29²) clock

**Status (10 November 2026):** Two completed original-input, nonlinear source-key hypotheses and independently planted native-language inverses. **No unknown LP2 plaintext, authentic key, encryption instruction, or destination recovered.** The concrete model is now a bounded negative; it should not be expanded into unconstrained source-register sweeps.

## Why this mechanism was worth one direct test

The source has only two red three-rune spans, each at local rune offset 119. Physical p3 gives GP indices [13,23,2], or the primitive quadratic relation \(u^2=3u+8\) in \(\mathbb F_{29^2}\), with \(u\) of exact multiplicative order **840**. Physical p39 gives [27,5,15], or \(15(X-24)^2\). The 256 original pp49–51 byte values interpreted as descending polynomial coefficients in \(\mathbb F_{29}\) give a polynomial \(F(X)\) divisible by this exact p39 factor. The enlarged p54 Ac is GP index **24**, and \(u^{360}=24\). These independently legible ink/numerical facts single out a specific evaluation point and a plausible first state, with no fitted ciphertext-dependent phase.

The earlier [primitive-field study](lp2-red-triad-primitive-840-phase-gate.md) already exhausts direct linear field observations of \(u^i\), regardless of unknown initial state. The present mechanism is genuinely different: it uses the **entire 256-byte table as a nonlinear polynomial \(F\)** and observes \(F(u^i)\) before choosing a rune-sized output. Its 840 possible field inputs are exact, finite and reproducible. This is a proposed transformation; no genuine Cicada instruction identifies polynomial evaluation as the cipher.

The original table's byte SHA-256 is **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**. Field evaluation has exactly three zero states among the 840 nonzero arguments, at exponents **360, 433, 797**. The p39/p54-selected zero is phase360. The remaining two are the known conjugate quadratic factor of the same source table. No secret or original plaintext was used to locate these three roots.

## Exact original-cipher candidate

For every \(i\), evaluate \(z_i=F(u^{i+\phi})=a_i+b_i u\), with unknown optional phase \(\phi\in[0,839]\) and clock either book-continuous or reset at each of the original 55 rune-bearing physical pages. Source-sized scalar observations are:

- \(a_i\), \(b_i\), field trace \(2a_i+3b_i\bmod29\), and field norm \(a_i^2+3a_i b_i-8b_i^2\bmod29\).
- Exploratory discrete-log reductions of \(z_i\) with base \(u\): exponent mod28, exponent divided by28, and exponent mod29. The three exact zero states use the declared sentinel zero because their discrete logarithm is undefined. This convention is a hypothesis, not source evidence.

Use each resulting 840-element sequence as either a direct additive GP29 key or an exact transparent GP28 successor key. GP29 uses \(P_i=C_i\pm K_i\bmod29\). The GP28 inverse interprets each within-page zero ciphertext difference as output rune EA (index28), and every nonzero difference as a unique base-15 exponent in \(\mathbb F_{29}^{\times}\), adding or subtracting the key mod28. Physical page first runes are carried as exact, explicit initial symbols. The inverse preserves **all 12,956 original runes, their page boundaries and all 86 observed doublets**. Each candidate has a genuine forward inverse for any GP plaintext under the selected key.

The finite original test covers **7 observation functions × 2 clocks × 2 inverse families × 2 signs × all 840 phases = 47,040 complete-book candidates**, evaluating every original unsolved rune. Thus even an unknown nonzero initial field state is subsumed within the tested phase family. A source-selected phase360 is included without reoptimizing it.

| Original-input family | Maximum GP unigram index of coincidence | Winning observation / clock / phase |
| --- | ---: | --- |
| Direct GP29 addition | **0.034594099865** | log-low / global / 386 |
| Transparent GP28 nonzero-step register | **0.035375952263** | field \(b\)-coordinate / global / 21 |
| Original undecoded GP ciphertext | **0.034478397865** | unchanged source |
| Independent Shakespeare GP text under planted correct field key | **0.066330479470** | correct source phase360 |

For the concrete source-anchored phase360 and the field trace under a global clock, the actual GP28 inverse yields **0.035283700472** (minus sign) or **0.035285178026** (plus sign). The actual GP29 inverses yield **0.034465910151** and **0.034463705736**, respectively. All remain at the near-uniform ciphertext level, with no coherent GP text.

The source-native positive uses the already committed Shakespeare control, encoded into 12,956 GP runes and encrypted with exactly the proposed nonlinear grid-evaluation trace, GP28 successor register, phase360, continuous clock and plus sign. **The inverse recovers every one of 12,956 planted source runes exactly**, restores its 0.066330479470 IoC and each original-input winning model re-encrypts all 12,956 runes exactly. Decoding the true plant using wrong phase361 gives IoC **0.035813486945**, displaying clear key discrimination. Synthetic roundtrips alone cannot authenticate a candidate, so the failure to recover actual original linguistic structure is the decision criterion.

## Exact p39-factor quotient Q(u^i): the remaining natural branch

Dividing the original source polynomial by the red p39 factor is more natural than applying F unchanged when the marked double root is interpreted as a *factor to remove*. The canonical descending coefficients admit two exact synthetic divisions by X−24, each with zero remainder; multiply the resulting 254 fixed-width coefficients by **15^-1=2** mod29. This gives Q(X)=F(X)/[15(X−24)²], with fixed-width coefficient prefix **[0,27,6,14,20,11,19,17,...]**. This is the authentic printed 256-byte table transformed by only the source-selected polynomial factor; no plaintext-derived adjustment occurs.

At the source-selected state u^360=24, the full F(24)=0 would make the full-table key's first trace vanish. The normalized quotient instead gives the genuinely independent numeric value **Q(24)=23**, trace(Q(24))=17 and norm(Q(24))=7. The only field nonzero-input zeros of Q are now phases **433 and 797**, the red-p3-linked quadratic conjugates. This is a stronger motive for testing the quotient state than merely choosing an arbitrary polynomial.

The same frozen seven projections, two clocks, two inverse families, signs, all 840 phases and all **12,956 original runes** yield **47,040** additional original-input candidates. None becomes GP-like plaintext:

| Quotient original-input family | Maximum GP unigram IoC | Observation / clock / phase |
| --- | ---: | --- |
| Direct GP29 additive | **0.034581302342** | a-coordinate / page / 323 |
| Transparent GP28 nonzero-step | **0.035371805579** | discrete-log high / page / 355 |
| Root24-anchored trace/global GP29, signs minus/plus | **0.034487310851 / 0.034500156037** | both at fixed phase360 |
| Root24-anchored trace/global GP28, signs minus/plus | **0.035252123716 / 0.035256711282** | both at fixed phase360 |

The independent full-length Shakespeare GP plant under exactly Q(u^i), source phase360 and global GP28 successor recovery returns **12,956/12,956** true plaintext runes, output IoC **0.066330479470**. A one-state-wrong phase361 gives **0.035767682775**, demonstrating a strong correct-key distinction. Exact original re-encryption is confirmed for the best GP29 and GP28 inverse variants. [Successful main-branch GitHub Actions run 42919390408](https://github.com/FlareZ123/liber-primus/actions/runs/42919390408) executed the full-F and factor-quotient branches through the same single-source implementation; both pass and no plaintext or key is identified.

The source-linked direct **Q(u^i) field-evaluation stream is therefore a second bounded negative**, closing the previously pending obvious polynomial-quotient branch. The direct F and Q tests together comprise **94,080** original complete-book inverse cases. They leave room for pair-driven feedback, a distinct cryptographic operation, and a different plaintext register. Multiplying or translating the polynomial arbitrarily to fit ciphertext is unmotivated without a new source-selected clue.

## Interpretation and remaining attack surface

The two results disfavor direct native-GP prose under these **full-table and exact-factor-quotient nonlinear GF(29²) evaluation clocks**, including every initial phase, both source coordinate projections, field trace/norm, three declared discrete-log reductions, physical-page and book clocks, and both exact additive/differential emissions. Earlier studies had eliminated the simpler homogeneous primitive-state trace, direct grid polynomial convolution and direct 127-pair serialization. Together these remove the most literal source-field transfer routes without requiring another sweep of arbitrary key offsets.

This is **not** a universal exclusion of the p3/p39/grid crosslink. The source might instead fix an independent plaintext-dependent state, a nonlinear two-symbol register, a compression step, a different phase update dictated by visible punctuation, or a cryptographic key obtained elsewhere. Reopen this lane only when a source instruction fixes that additional operation and leads to predicted original plaintext.

**Reproduction:** [single-file original-source SFT](../sims/lp2_red_triad_polynomial_eval_inverse.cjs), Node 22 CommonJS, reusing the repository's native-GP control converter. Run with environment `LP2_POLYNOMIAL_MODE=quotient` for exact-factor quotient; without it the full source polynomial is evaluated. [Successful full-source manual CI run 42915590861](https://github.com/FlareZ123/liber-primus/actions/runs/42915590861) executed the original-input exhaustive search and full positive, along with the prior primitive-root regression. No repository source images or reference data were modified.
