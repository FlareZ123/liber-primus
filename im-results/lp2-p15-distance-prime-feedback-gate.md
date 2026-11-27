# Finite p15 prime-distance feedback with p56 shift and F hold

**27 November 2026, Agent37, exploratory negative.** No new plaintext, key or destination. The solved p15 plate uses the absolute distance from 3301 to a prime at a Fibonacci-derived index; p56 uses the prime-minus-one additive shift and transparent F. Test one explicit, hypothetical feedback composition: the current state is the zero-based prime ordinal j in 0..3300; the shift is (prime[j]−1) mod29; ordinary non-F plaintext P emits C=(P+shift) mod29, then updates j to (|3301−prime[j]|+GPprime[P]) mod3301. Literal F emits zero and leaves j unchanged. Using the p15 distance as feedback instead of the plate's Fibonacci input and adding GPprime[P] are **investigator choices**, not authenticated source instructions. This is distinct from the earlier p15 recursive extraction permutation, GPprime-product GF3301 state, and plaintext/ciphertext-weighted monotone prime clocks. No word assumption, no tuned parameters.

Every initial state (3301) and all possible transparent F histories are propagated exactly. With C=0 retain the hold; independently compute P=(C−shift) mod29 and accept the consuming transition only for nonzero P. Since all future legality depends only on j, merging equal states is lossless for reachability. No language scores or beam pruning enter the exclusion.

| Chapter | Runes | Longest legal prefix |
|---|---:|---:|
| p0–2 |729|553|
| p3–7 |1145|366|
| p8–14 |1729|275|
| p15–22 |1903|254|
| p23–26 |1021|672|
| p27–32 |1433|536|
| p33–39 |1680|342|
| p40–53 |3008|144|
| p54–55 |308|227|

**All nine fail**, even granting independent starting state per chapter and every F ambiguity. Total original corpus 12,956 runes. Longest legal prefix is the number consumed before the first empty reachable set, not an approximate score.

Controls use the authentic native p57 Parable (95 runes), encrypted synthetically under the fixed model with origins 73,167,987. Bigram Viterbi ranks paths using all other solved sections; freeze the highest-ranked state and history after 65 fit runes and decode 30 withheld runes. The three controls retain 184/118/56 terminal states under unrestricted reachability. Selected seeds 77/171/987; plaintext correct 94/95, 92/95, 95/95 respectively; **30/30 withheld each**, exact re-encryption each. Two seeds are not identified uniquely; the controls do not validate historical use. The original exact result does not rely on the ranking. The same p57 passage is used for all three seeds, so this is not independent-source calibration.

Inputs: corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`; native control blob `1b064ef6d85819b7d96adaff31a82d1ec551598f`. Core execution performed in connected JavaScript; the committed CJS wrapper is not claimed CI-executed. Reproduce with [SFT](../sims/lp2_p15_distance_prime_feedback_sft.cjs). Retire this exact composition; no reason to extend it into more arbitrary feedback laws absent a new source instruction. No change to authoritative solution status.
