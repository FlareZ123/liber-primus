# Blind two-alphabet prime collision-retry inverse

**27 November 2026 — Agent 10.** Constructive full-key recovery on independent original-length literary controls; predictive negative on original. No authentic unknown key or plaintext.

## Why this model

The authenticated p56 cipher uses consecutive prime-minus-one GP29 shifts. Unknown LP2 has 86 adjacent equalities over 12,955 continuous transitions (within nine illustrated scopes, count differs at boundaries). A simple reversible attempt to explain the suppression is to retry a draw only if it repeats the previous emitted ciphertext glyph. Earlier native-alphabet prime collision-skip and intact-word arbitrary-inner-alphabet gates did not recover text. Here both input and output permutations are arbitrary common secret GP29 bijections. No source independently selects this combined architecture, chapter reset or .81 collision coin.

At each illustrated chapter start, initialize the cursor j=0 and predecessor absent. Every plaintext symbol, including F, consumes a shift. First candidate is beta^-1(alpha(P)+K[j]) modulo 29. If it equals the previous output, retry once with probability rho=.81 and consume the next prime for that same plaintext. Repeats remain legal (retry declined or same shift residue on retry). All other first candidates must be accepted. The actual emitted glyph becomes predecessor. This model has no literal-F hold, inserted null, printed-word boundary, arbitrary skip, or chapter-private map.

## Constructive inference

Use a cumulative number h of retries. At output index i, initial draw cursor i+h; retry increments h by one. For known beta, retry is possible exactly when beta(C_i)-beta(C_(i-1)) equals K[i+h+1]-K[i+h] mod29. Direct and retry likelihoods use the native rune frequency and the declared collision coin. The approximate pre-beta stage marginalizes the equality constraint over an unknown output permutation: a nonzero residue difference matches a nonrepeat with probability 1/28; same shift residue can retry only to the same glyph. A free conditional emission matrix is fit with exact scaled forward/backward and prefix curriculum 64/128/256/512/1024/full fitting prefix. Fourier row phase and common cyclic profile alignment initialize beta. A softened retry equality is annealed; expected skip-pair counts provide pairwise difference rewards in the beta assignment objective, optimized by Hungarian initialization and exact pair-swap deltas. Sorted rank frequency and native bigram refinement infer alpha.

A strict fixed-key Viterbi uses only h as its state: after emitting i with h cumulative retries, the last plaintext is alpha^-1(beta(C_i)-K[i+h]), independent of the last event type. It records a concrete retry trace; forward replay asserts every retry was a genuine collision and every original glyph matches. Search caps h at ceil(.08*n)+15 or n (whichever lower), so this is a finite predictive receiver, not exhaustive over all paths or permutations. Fit only the first 75% of each chapter; freeze both alphabet maps, then decode the full chapter with fixed keys (the suffix may select among prefix cursor paths, but never refits keys). A candidate is selected by training score alone.

## Independent controls and original

Two fresh hidden-key native Shakespeare/Gibran plants use the actual nine chapter lengths (12,956 total), independent arbitrary input/output maps, different seeds, and the fixed collision coin. Their adjacent repeat counts are 98 and 80, similar to the original. The true retry counts by chapter total 375 and 379. The criterion fixed before original scoring is >=90% fit and heldout rune accuracy on both controls.

| Tape | Fit correct / 9713 | Held correct / 3243 | Gauge-aligned key labels /58 | Fit / held native bigram nats/rune |
|---|---:|---:|---:|---:|
| Control 0, Shakespeare | 9710 | 3239 | 58 | -2.646 / -2.653 |
| Control 1, Gibran | 9700 | 3240 | 58 | -2.576 / -2.579 |
| Original | — | — | — | -4.541 / -4.635 |

Both controls attain their true-key Viterbi oracle, recover both full alphabets modulo simultaneous translation, and exactly replay the entire plant. Original five distinct Fourier seeds produce legal fitted keys; the frozen winner's 247 retries reproduce every original rune, but both fitted and heldout tape are nonlinguistic. The first decoded runes start `OE X L AE B EO D B M EO AE R P N U J R J H J F OE A L F R S N O L U E I IA E S A F G T G F D O OE EO`. Exact replay is a correctness invariant, not evidence the fitted key is authentic.

Retire this **fixed zero-origin shared chapter-reset, one-retry, ordinary-consuming, two-alphabet receiver** as a calibrated predictive negative. Independent origins, continuous state, alternative reset framing, optional literal-F holds, and another retry process are outside scope. No new evidence selects them; avoid repetitive random-restart sweeps.

[Executable SFT](../sims/lp2_prime_collision_retry_two_alphabet_spectral_sft.cjs) (88dacaff, frozen before controls). [Control0](lp2-prime-collision-retry-two-alphabet-control0.json), [control1](lp2-prime-collision-retry-two-alphabet-control1.json), [original](lp2-prime-collision-retry-two-alphabet-original.json), including exact alphabet pairs, retry traces for original, metrics, and source blob IDs. Connected V8 executed the committed core separately per job; times 31.134 s, 30.4 s, 89.877 s. Node wrapper and CI not separately run. Reproduce with `node sims/lp2_prime_collision_retry_two_alphabet_spectral_sft.cjs`.

## Common nonzero prime-origin extension (27 November, Agent10)

A cross-fold conditional-shift screen of all 3,302 common chapter origins (0..3301) used a binomial approximation to retry displacement and fit prefixes only. Four separately keyed literary plants with hidden origins 137, 911, 1703, 3200 were all ranked first at width 512, with true scores 17.445, 23.589, 23.107, 17.639 respectively. Original max 9.326 at origin 1654; the same candidate led width 256. The shorter width 128 led origin 37 (13.352). This screen is approximate, not a proof of exclusion.

The predeclared long-width leading candidate 1654 was passed to the existing blind inverse with no additional origin tuning. A nonzero-origin Gibran control (3200) recovered both complete alphabets modulo gauge (58/58), 9701/9713 fitting runes and 3243/3243 held runes, equal to the oracle, and replayed exactly. Original candidate 1654 returned a legal nonlinguistic inverse, fit score -4.533178, frozen-key held score -4.625615 nats/rune, 285 retries, exact replay. Control held score -2.60429 nats/rune. No unknown plaintext/key. This is a predictive negative for the strongest screened origin, not an exhaustive alphabet/origin theorem.

Reproducers: [screen](../sims/lp2_prime_collision_retry_unknown_origin_crossfold_sft.cjs), [receiver](../sims/lp2_prime_collision_retry_two_alphabet_spectral_sft.cjs), raw [original screen](lp2-prime-collision-retry-origin-prefilter-original.json), [selected control](lp2-prime-collision-retry-origin-selected-control3200.json), [selected original](lp2-prime-collision-retry-origin-selected-original1654.json). Four screening-control JSONs are named lp2-prime-collision-retry-origin-prefilter-control0..3.json. All cores executed connected V8; no standalone wrapper/CI claim. The receiver parameterization is d9868cc6.
