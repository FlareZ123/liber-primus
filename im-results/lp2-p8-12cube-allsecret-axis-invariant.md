# Source-selected 12³ LP2 p8 cube: exact secret-axis difference invariant

**21 November 2026, Agent 5. Status: conditional original-cipher exclusion with complete key independence.** This study recovered no plaintext, key, or full mechanism. It provides a direct no-key decoder gate for one plausible 3D cipher architecture, arising from source artwork rather than an arbitrary grid search.

## Human-visible source selector and alternative readings

Original LP2 physical p8 is image `25.jpg`; its first printed rune is a **dramatically oversized red X**, integrated into the illustrated tree. The canonical p8 header has precisely **12 red runes**. The full red-headed illustrated p8–p14 section, through its visible closing boundary, has precisely **1,729 GP29 runes**. Excluding the **single physically emphasized first rune** leaves **1,728 = 12³** genuine runes in original order. The 12 red title runes could indicate a 12-valued coordinate, although no first-party instruction directs such a use.

The same length also admits **1729=9³+10³=1³+12³**, with the first red word `XIXM` allowing a speculative Roman reading `X|IX|M` = 10|9|1000 (or `XIX|M` =19|1000), and the preceding p0–p2 opening section containing exactly 729=9³ runes. Those coincidences are collected in [the adjacent source-path frontier](../workplace/lp2-p8-xixm-taxicab-two-cube-hypothesis.md). Because the readings were formulated after source inspection, none proves designer intent.

**Original-image control weakens the 12³ clue:** RGB red-ink connected-component measurements on the actual JPEGs show a normal chapter-opening oversized red initial of **497–498 px** height at **all nine original sections** p0, p3, p8, p15, p23, p27, p33, p40, p54 (the p15 heading is lower because of its preceding numeral table). Both independently solved p56 and p57 likewise have oversized red initials, at 498 and 607 px respectively; regular red text glyphs are approximately 113–115 px tall. The supposed "drop the physically marked first rune" convention is therefore a **generic book-design feature**, rather than a distinctive instruction to subtract one specifically at p8. This direct counterexample sharply reduces the credibility of the 12³ layout as intentional despite its exact arithmetic. The measured source contains 11/11 oversized illustrative heading initials, with no author-selected cue for applying the subtraction to p8 but leaving other chapters intact.

## Candidate and exact invariant

The cheapest simple value-changing cube cipher consistent with a 12³ layout is an additive axis mask over `GF(29)`:
```
C[i,j,k] = (a*P[i,j,k] + A[i] + B[j] + D[k]) mod 29,
0 <= i,j,k < 12, a in {1,..,28}.
```
The 36 axis-key symbols `A,B,D` are **completely arbitrary**; no key alphabet, phase or seed is guessed. `a` is an arbitrary unknown nonzero shared scaling value. The simpler purely additive model corresponds to `a=1`. All **48** coordinate-axis permutations/reflections can be allowed, since the statistic below is invariant under those geometric symmetries. We retain the original serial cube order: arbitrary nonlinear position permutations or stateful ciphers are outside the model.

For each coordinate axis `d` and phase `t=0..10`, gather the **144** neighboring symbol differences across that axis at fixed phase over the other two coordinates. The axis masks on the other coordinates cancel. The remaining mask contributes a *single constant shift* of all 144 difference values, while global `a` permutes the 29 residue labels. The index of coincidence of those 144 differences, `sum_v n_v(n_v-1)/(144*143)`, is therefore **exactly key-independent** for all 29^(36) arbitrary additive-axis masks and 28 nonzero global multipliers, including all 48 rigid cube orientations.

Average the 33 phase IoCs (11 phase differences ×3 axes) for one scalar invariant. This statistic does not assume any English text in the secret-axis masks.

## Original-cipher observation and positive controls

On the authentic original p8–p14 ciphertext, excluding the visually oversized first X, the invariant is:

- **0.03490322808504626** on the unaltered **1,728-rune** 12×12×12 receiver.
- **0.03494443267170539** if the alternative last rune is excluded instead. The last-rune alternative is not image-selected, but checking it requires no search.
- An independently selected native-GP solved LP1 passage of length1,728, encrypted under arbitrary nonzero 12-element axis vectors, retains **exactly** the same 33-phase invariant as plaintext. All 48 rigid axis permutations/reflections also preserve the statistic. These are algebraic positive controls.

Using a fixed source-native English-to-GP29 mapping, we tested complete 1,728-symbol contiguous windows of independent pinned corpora at **fixed stride17**. Every corpus minimum exceeds the original **0.03490323**:

| Native-GP reference | Windows | Minimum invariant | Median invariant | At or below original |
|---|---:|---:|---:|---:|
| Gibran, `The Prophet` | 3,575 | 0.03582444 | 0.03755504 | 0 |
| Shakespeare, first300k | 12,670 | 0.03510042 | 0.03713711 | 0 |
| Emerson, essays | 18,800 | 0.03531527 | 0.03731075 | 0 |
| Known LP1 prose | 128 | 0.03640131 | 0.03745791 | 0 |

Total **35,173** overlapping reference windows; their minima are source-conditional empirical baselines, **not independent Bernoulli trials or a universal proof that no possible English plaintext could attain the observed statistic**. With a direct native-GP prose receiver and its ordinary adjacent-runic dependencies, the unchanged original source looks closer to an approximately uniform difference process than to the tested language. No amount of arbitrary secret 3-axis additive key search, global affine scaling, or a rigid cube rotation can alter that observation.

A decoder with per-axis **nonlinear** substitutions, an arbitrary byte/word transposition, time-varying multipliers, transparent runes or other state can violate the invariant and is not excluded.

The reference controls use the project's canonical historical GP29 spellings, including source-linguistic `ING→NG` and `IO→IA`. An earlier control transcription omitted the latter convention; restoring it reduces the frozen 1,728-rune window count from 35,322 to **35,173** and lowers the minimum Shakespeare reference IoC to **0.03510042**, still strictly greater than the original ciphertext's **0.03490323**. This is a scope-sensitive calibration correction, not new plaintext evidence.

## Executable evidence and research decision

- [Complete original-input one-file Node22 CommonJS SFT](../sims/lp2_p8_c12_allsecret_axis_difference_invariant_sft.cjs).
- [Windows Node22 PASS, workflow44954461568](https://github.com/FlareZ123/liber-primus/actions/runs/44954461568). The log identifies the exact SFT path, original 1,729 and derived 1,728 inputs, the controls above, and exact all-secret/ridig-symmetry positives.
- Sources: `resources/liber-primus/lp2-corpus.json`, `lp2-ink-annotations.json`, the physically enlarged original X in `25.jpg`, and checked-in source-native calibration corpora.

**Decision:** the 12³ interpretation now has an independently observed source-selection weakness: *every* major heading has a decorative giant initial. Retire *separable additive 12×12×12 axis masks with a global affine symbol layer* as a direct ordinary-GP-English cipher of this unchanged 1,728-rune section. The **12³ physical-source hypothesis itself remains unproven** and is worth revisiting only if an image-derived coordinate route specifies a genuine nonseparable transformation or key material. The ordinary native-GP prose assumption remains conditional. No plaintext has been recovered.
