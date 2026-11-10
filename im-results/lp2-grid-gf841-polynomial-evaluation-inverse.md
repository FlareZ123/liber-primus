# Full numerical-grid polynomial evaluated on the original red-triad GF(29²) clock

**Status (10 November 2026):** Completed original-input, nonlinear source-key hypothesis and an independently planted native-language inverse. **No unknown LP2 plaintext, authentic key, encryption instruction, or destination recovered.** The concrete model is now a bounded negative; it should not be expanded into unconstrained source-register sweeps.

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
| Fully known, heldout Shakespeare GP text under planted correct field key | **0.066330479470** | correct source phase360 |

For the concrete source-anchored phase360 and the field trace under a global clock, the actual GP28 inverse yields **0.035283700472** (minus sign) or **0.035285178026** (plus sign). The actual GP29 inverses yield **0.034465910151** and **0.034463705736**, respectively. All remain at the near-uniform ciphertext level, with no coherent GP text.

The source-native positive uses the already committed Shakespeare control, encoded into 12,956 GP runes and encrypted with exactly the proposed nonlinear grid-evaluation trace, GP28 successor register, phase360, continuous clock and plus sign. **The inverse recovers every one of 12,956 planted source runes exactly**, restores its 0.066330479470 IoC and exactly reencrpyts the original-input best GP29 and GP28 inverse outputs. Decoding the true plant using wrong phase361 gives IoC **0.035813486945**, displaying clear key discrimination. Synthetic roundtrips alone cannot authenticate a candidate, so the failure to recover actual original linguistic structure is the decision criterion.

## Interpretation and remaining attack surface

The result disfavours direct native-GP prose under this **full-table nonlinear GF(29²) evaluation clock**, including every initial phase, both source coordinate projections, field trace/norm, three declared discrete-log reductions, physical-page and book clocks, and both exact additive/differential emissions. Earlier studies had eliminated the simpler homogeneous primitive-state trace, direct grid polynomial convolution and direct 127-pair serialization. Together these remove the most literal source-field transfer routes without requiring another sweep of arbitrary key offsets.

This is **not** a universal exclusion of the p3/p39/grid crosslink. The source might instead fix an independent plaintext-dependent state, a nonlinear two-symbol register, a compression step, a different phase update dictated by visible punctuation, or a cryptographic key obtained elsewhere. Reopen this lane only when a source instruction fixes that additional operation and leads to predicted original plaintext.

**Reproduction:** [single-file original-source SFT](../sims/lp2_red_triad_polynomial_eval_inverse.cjs), Node 22 CommonJS, reusing the repository's native-GP control converter. [Successful manual CI run 42915590861](https://github.com/FlareZ123/liber-primus/actions/runs/42915590861) executed the original-input exhaustive search and full positive, along with the prior primitive-root regression. No repository source images or reference data were modified.
