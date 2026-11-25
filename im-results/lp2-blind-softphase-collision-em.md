# Blind periodic collision-clock key recovery

## Decision
A spacing-free, crib-free blind inference method recovers four hidden q8/q13 cyclic additive keys under mandatory literal-F holds and optional one collision redraw (probability .8, previous physical ciphertext). All 42 key digits recover up to cyclic rotation, and 1,999/2,000 withheld plaintext runes decode. The original p40–53 prefix under the same fixed receiver has no predictive key: q8 fails the entire frozen continuation; q13 has a legal but nonprose continuation. This is a finite heuristic failure, not an all-key proof.

## Method
Each consuming phase has a soft distribution of possible shifts. The exact HMM over q phases allows a literal-F emission at zero with no advance; ordinary non-F emissions consume one shift, with probability .2 when the output equals the preceding ciphertext; a redraw consumes two shifts, with first tentative output constrained to the preceding ciphertext and probability .8. Its soft two-draw emission marginalizes the same latent plaintext symbol over both independently resampled shifts. Scaled forward/backward aggregates expected transition counts by observed ciphertext pair and phase; EM distributes the counts to their shift values and updates each phase distribution (pseudocount .005). The soft model is not a fixed-key cipher.

Four deterministic starts ×40 iterations, top three soft profiles. Harden each via top five shift values per phase, width32 beam over fixed/soft partial profiles ranked by marginal likelihood. Deduplicate cyclic rotations; select the complete legal key by exact fixed-key trigram Viterbi on first1000 runes, then freeze its final state and key to decode last500. Every traced path is replayed. The unigram/trigram language model is target-excluded Gibran/Shakespeare (281,914 runes). The four 1500-rune Emerson controls are disjoint, with random key/initial phase and optional redraws; two deliberately have repeated adjacent key digits. The first q8 pilot was used to establish that the implementation can recover a key; the remaining three controls use fresh donor windows and seeds.

| Control | True q | Exact key | Redraws / F holds | Frozen holdout |
|---|---:|---:|---:|---:|
| Emerson 140000 |8|yes|38/51|499/500|
| Emerson 175000 |13|yes|33/46|500/500|
| Emerson 148000 |8|yes|43/33|500/500|
| Emerson 178000 |13|yes|32/39|500/500|

Control soft gain relative to uniform-shift emission +.3529..+.4007 nats/rune. Frozen trigram/policy logLR relative to uniform plaintext +.9106..+1.0896 nats/rune.

| Original p40–53, first1000 → next500 | Soft gain | Legal key proposals | Fit logLR | Frozen holdout logLR |
|---|---:|---:|---:|---:|
| q8 |+.049757|64|−2.414553|no legal path|
| q13 |+.078119|96|−2.414229|−3.091840|

No original plaintext/key. Do not infer a period from these small relaxed likelihood gains. No matched independent-pad null was run; the original failure is unambiguous under the frozen decoder. The p40 chapter is repeatedly studied in the project, so this is a within-run heldout failure rather than globally independent validation.

[SFT](../sims/lp2_blind_softphase_collision_em_sft.cjs), [pilot](lp2-blind-softphase-collision-em-pilot.json), [q13](lp2-blind-softphase-collision-em-q13-control.json), [q8 repeated](lp2-blind-softphase-collision-em-q8-repeat-control.json), [q13 repeated](lp2-blind-softphase-collision-em-q13-repeat-control.json), [original q8](lp2-blind-softphase-collision-em-p40-q8.json), [original q13](lp2-blind-softphase-collision-em-p40-q13.json). Cores executed in connected JS against repository source inputs. One initial multi-job call timed out and was rerun as individual jobs; standalone Node wrapper not independently run.
