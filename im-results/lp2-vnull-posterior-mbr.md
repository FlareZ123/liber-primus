# Exact V-NULL minimum-risk alignment: rune and lexical receivers

## Decision

The revised [external C9 V-NULL sender](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/challenges/c9_rejection_loops.py) discards each rejected key symbol and emits a uniform nonrepeat null; one key digit advances per ciphertext rune. The pending plaintext is retained until a real event. The [exact event-DAG report](lp2-vnull-exact-event-dag.md) establishes the complete legal event edges, including consecutive nulls. This is an exploratory mechanism; no original LP2 source establishes it or supplies its key.

The strongest current local receiver is the lexical semi-Markov minimum-risk inverse. It materially reduces null-placement errors, but the fully blind receiver remains register-sensitive. The explicit length-conditioned mode exceeds the C9 positional threshold in all three local registers; actual unknown LP2 plaintext length is not supplied. Neither the local language score nor the local random-key plants certify the external C9 checker. No new LP2 plaintext or key.

## Exact inference

For an event start i, either emit P=C[i]-K[i] (acceptance factor 1-supp on a doublet), or if C[i] differs from C[i-1], retain P=C[i-1]-K[i] and consume one null at probability supp/28. Every consecutive null must preserve this P, and the first genuine emission must equal P+K[j] mod29. Thus there is an ordinary edge and at most one terminating null-chain edge at each start, with exact sender probability and replay.

The previous rune prior augments the DAG with the last three runes and emitted length. Forward/backward log-sum-exp obtains a posterior marginal at every plaintext position; a second legal-path maximization gives the maximum expected positional match. The earlier variable-length controls (80 native + 40 Gibran, overlapping windows) obtained:

| Prior | Blind ≥85% | Actual-length oracle ≥85% |
| --- | ---: | ---: |
| Rune order-4 MAP | 69/120 | — |
| Rune order-4 MBR | 74/120 | 93/120 |

Details: native MBR 51/80, known-length 61/80; Gibran 23/40 and 32/40. Mean blind positional recovery 0.7940, mean edit distance 0.8500, 58/120 exact. [Prior JSON](lp2-vnull-posterior-mbr.json), [prior SFT](../sims/lp2_vnull_posterior_mbr.cjs).

### Lexical extension (#2969)

Replace the rune-context state with a latent word boundary and build a semi-Markov lattice: every event-DAG path of 1–20 plaintext runes is a possible word edge, with exact event probability and a smoothed word likelihood. The 32,254-entry native-rune lexicon is a .65/.35 mixture of Shakespeare/Emerson empirical word frequencies and TextBlob word frequencies, with .03 OOV mass assigned to a geometric length model and order-4 interpolated within-word rune prior. The first and last words can be truncated: suffix probabilities are normalized over possible starting positions, and prefix probabilities marginalize over word completion. This allows arbitrary windows and does not trust printed starts. Forward/backward states are (cipher endpoint, emitted plaintext length); posterior word edges distribute their mass to each rune position. A second event-DAG DP maximizes the sum of positional marginals over legal paths. Every returned event path replays; no language model can override the event constraints.

Frozen local seed 0x296947c9, 40 240-rune windows per register, independent pseudorandom keys and wrong keys, exact supp=1-.664/3.448. Windows can overlap; native records and Gibran had appeared in earlier instrument work, and Orthodox is an additional register, not a sealed independent external review. The length-conditioned arm receives 240 explicitly; the blind arm receives only ciphertext and key. These local keys are uniform pseudorandom draws, not the external SHA-256-counter generator.

| Register | Raw positional ≥.85 | Blind ≥.85 | Blind exact | Blind mean positional | Known-length ≥.85 | Known-length exact |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Gibran | 0/40 | 35/40 | 34/40 | .940521 | 38/40 | 36/40 |
| Orthodox prayers | 0/40 | 25/40 | 25/40 | .810833 | 35/40 | 34/40 |
| Native solved GP29 | 0/40 | 34/40 | 32/40 | .898333 | 40/40 | 39/40 |
| Total | 0/120 | 94/120 | 91/120 | .883229 | 113/120 | 109/120 |

The raw mean positional is .2071/.1522/.2098. Blind edit distance means .225/.600/.225; known-length .200/.350/.050. All 120 wrong keys have local lexical log evidence per ciphertext rune below -5.61, while the worst correct blind evidence is -2.213803. A local threshold -4 separates them; it is not the external quadgram scale, and the official wrong-key requirement is still unmeasured. Model, thresholds and known-length use must not be conflated. The 3% OOV and mixture weights are design choices, not inferred Cicada parameters.

Reproduce: `node sims/lp2_vnull_lexical_posterior_sft.cjs`. [Reusable factory and test](../sims/lp2_vnull_lexical_posterior_sft.cjs) · [all raw rows and pinned source blobs](lp2-vnull-lexical-posterior-output.json). The exact V8 experiment body ran twice with identical aggregates before the factory extraction; the standalone wrapper is not yet independently Node-CI certified. The [official-checker adapter](../sims/lp2_vnull_c9_checker_adapter.py) selects between blind lexical candidate and public C3 skip beam using only explicit C,K,sign and candidate scores; [development harness](../sims/lp2_vnull_c9_development_sft.py) pins the external checker at fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb, uses public development seed 2969472026 and Mill/Frankenstein text, and runs isolated C3 plus the 40 scored V-NULL plants. [CI run 45825089829](https://github.com/FlareZ123/liber-primus/actions/runs/45825089829) queued at the time of this checkpoint. No claim of sealed reviewer seed, 7/7 C3, or C9 qualification.

## Original-input decision

No independently source-selected V-NULL key with a positive original detection has been identified. The previously tested p55 perimeter keys, historical keywords/prime shifts and all-key periodic capacities are already documented in the [perimeter inverse](../sims/lp2_p55_perimeter_vnull_lexical_sft.cjs), [event-DAG report](lp2-vnull-exact-event-dag.md), and [periodic capacity report](lp2-vnull-periodic-allkey-capacity.md); those are not new positive key candidates. Do not repeat their searches. The improvement is a known-key recovery instrument, not a key nomination or a change to the established plaintext frontier. A new authenticated key selector or flagged original candidate is the missing prerequisite.
