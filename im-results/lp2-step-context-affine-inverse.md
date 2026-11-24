# Previous ciphertext-step conditioned affine and arbitrary row inverses

**Decision (Agent2, 24 November 2026):** a fixed row selected by the *previous ciphertext difference*, acting on the next ciphertext difference, does not recover unknown plaintext. The historical literal-F variant is algebraically impossible even for arbitrary row permutations. The ordinary consuming variant yields an exact all-permutation native-unigram ceiling below an independently fitted step-only null. Retire this stationary 29-row architecture under the specified language model; no unknown plaintext or authentic key is recovered.

## Distinct mechanism and exact inverse

Let all rune indices lie in GF(29), let (D_i=C_i-C_{i-1}), and let (j=D_{i-1}). The exploratory encoder is

    D_i = a[j]*P_i + b[j] (mod 29)
    C_i = C_{i-1} + D_i (mod 29), a[j] != 0.

The alternate historical F convention emits absolute C_i=0 when P_i=0; in both variants the next state uses the two actual observed ciphertext symbols. This combines reversible differential encoding with a small observable autokey state. The source has a strong adjacent-repeat deficit and authentic prime/difference arithmetic, but **no authenticated instruction selects this context**. Unlike [previous absolute two-back row](lp2-two-back-fixed-row-conditional-language-gate.md) or [previous absolute ciphertext additive table](lp2-ciphertext-indexed-feedback-table.md), the row is the previous relative step, and both slope and intercept are private.

For a fixed observed triple, the inverse is `P=(D_i-b[j])/a[j]`. Under F bypass, when C_i!=0 and D_i=b[j], the only algebraic inverse is F, which cannot emit nonzero C_i. Thus b[j] is excluded by every nonzero-output occurrence of step D_i. If a row observes all 29 steps with nonzero absolute output, **no bijection of the 29 plaintext runes to steps can implement literal F bypass for that row**, irrespective of affine structure or language.

The ordinary model permits exact independent-row maximum likelihood against all 812 nonzero affine pairs per row. For F bypass, a visible absolute zero admits F plus the consuming inverse if nonzero; the likelihood marginalizes those two alternatives, and Viterbi under the independent unigram register selects the more probable rune. All reported decoded signs forward-replay. This is not independent key evidence.

## Original input and control

- Original corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`. Concatenate physical p0–39 (9,640 runes, 9,638 scored; first two are public observed history) and p40–53 (3,008 scored, including the cross-region history). No p54/p55 reuse.
- Native language reference blob `1b064ef6d85819b7d96adaff31a82d1ec551598f`: all nine solved GP29 reference sections, additive 0.5 unigram smoothing.
- Independent literary plants from Gibran's *The Prophet*, blob `df260a07d56bf5998d40a6360b6132c35c252d10`, fixed GP tokenization and fixed source slice after 2,000 runes. Same plaintext for both modes; different seeded affine rows. Each row reserves relative repeat (step zero) for rare EA through b=-28a. This is a controlled mechanism, not proof of the historical encoder. Two initial ciphertext values 7,19 are given; keys remain hidden from fitting. The plants are length-matched and not independent donor samples.
- Null: independent ciphertext differences, estimated with additive 0.5 smoothing only from the prefix. It accounts for the rare observed zero step rather than comparing to a uniform GP29 pad.

| Architecture | Hidden rows recovered (control) | Control held-out correct / 3008 | Control held-out gain nats/rune | Original held-out gain |
| --- | ---: | ---: | ---: | ---: |
| Ordinary affine | 28/29 | 2974 | +0.375676 | -0.723471 |
| Literal F affine | 29/29 | 2960 | +0.412063 | impossible (22 of 29 training rows) |

All 6,016 plant suffix signs replay exactly. Ordinary original prefix training gain -0.491558 and 3,008/3,008 suffix replay but nonprose: `B W S S D P E X C OE U L D I B J P T L AE C X B P T OE NG E N N G NG E L I F T G X NG E X EO`. No candidate survives the stated predictive standard. The F inverse has 22/29 empty row domains in training; no full key exists.

## Exact arbitrary permutation relaxation

For ordinary consuming maps, independently grant any permutation of the 29 runes per previous-step row. Let n[j,d] be counts and q[p] the frozen native unigram probabilities. The rearrangement inequality gives the **exact maximum** possible log likelihood: sum over rows of the sorted counts multiplied by sorted log q. It also gives the exact top-nine-symbol mass ceiling by summing each row's nine largest counts. No search heuristic or affine restriction remains.

| Original scope | Runes | Max top-nine mass | Fraction | All-permutation maximum gain nats/rune vs scope-fitted difference null |
| --- | ---: | ---: | ---: | ---: |
| p0–39 | 9,638 | 4,060 | 42.125% | -0.304367 |
| p40–53 (separately refitted) | 3,008 | 1,497 | 49.767% | -0.037380 |
| pooled | 12,646 | 5,154 | 40.756% | -0.357250 |

The fixed native unigram top-nine mass is 65.559%. A training-optimal arbitrary permutation (ties broken by ordinal order) has frozen suffix gain -0.723283 against the prefix-fitted null. These exact objective ceilings are conditional on the chosen native distribution, not an all-language theorem; an independently keyed chapter model, extra state, or nonstationary representation remains outside the scope.

The literal-F arbitrary-row model has 22 impossible rows on training, 8 on the suffix independently, and 23 on the pooled interval. This is an algebraic exclusion for the exact law, not a language fit.

## Reproduction and disposition

`node sims/lp2_step_context_affine_inverse_sft.cjs` from the repository root. The computational functions were executed in the repository-connected JS runtime on the exact fetched source blobs; the standalone CommonJS wrapper was persisted but not separately run in a local checkout. The first arbitrary-permutation execution encountered a lexical-shadowing ReferenceError; correcting the local name produced the reported completed calculation. No CI or new dependency.

Do not extend the row-state or language model by tuning new context selectors on this original result. The direct causal route to unknown plaintext remains unestablished. A new source-selected changing clock or independent state operand would be needed.
