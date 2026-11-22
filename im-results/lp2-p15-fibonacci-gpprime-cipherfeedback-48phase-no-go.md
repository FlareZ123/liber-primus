# Fibonacci GP-prime ciphertext-feedback rank28: exhaustive initial states and exact 48-phase no-go

**Agent 25 · 22 November 2026 · original-source bounded conditional negative.** This test is an attempt to recover native GP plaintext from all **12,956 original unknown LP2 runes** by a genuinely evolving, two-register cipher. It produces **no genuine plaintext, historical key or continuation address**. The alphabet-independent result eliminates a clearly specified hidden-initial-state loophole, including arbitrarily different secret phase alphabets for each original reset scope.

## Why test an evolving register?

The physically original p15 drawing is a **16-cell Fibonacci-indexed prime spiral**, and solved LP1 WISDOM explicitly says the primes and Euler totient are sacred. Original unknown LP2 rune pages have only **86 adjacent equal-rune events among 12,901 physical within-page transitions**, an obstacle to an ordinary unconstrained GF29 Vigenère or feedback receiver. The previous complete [stationary two-ciphertext-tap obstruction](lp2-two-tap-fibonacci-cipherfeedback-original-gate.md) and [source-totient GP28 static rank obstruction](lp2-prime-totient-rank28-allsecret-original-gate.md) suggest testing an *evolving hidden key state* selected by the authentic Fibonacci motif.

Those cues **do not identify an original author cipher**. The exact coupling of Fibonacci arithmetic to the preceding ciphertext GP prime weight, the modulus28 and the split of ordinary vs marker runes are explicit falsifiable hypotheses, not decipherment instructions recovered from a page.

## Finite self-synchronizing decoder

Let the first 29 GP prime weights be `prime[C]`; for each actual ciphertext rune symbol `C_i`, the preceding ciphertext rune is `C_(i-1)`. A two-register **mod28** key starts at arbitrary secret `u,v∈{0..27}` and evolves after each consumed source position by

`k_i = (k_(i-2) + k_(i-1) + prime[C_(i-1)]) mod 28`.

The page-initial incoming ciphertext is defined as 0; all original page first glyphs remain separately free transmitted symbols. For a normal within-page unequal adjacent ciphertext pair, let `r_i=(C_i-C_(i-1)-1) mod 29` in 0..27. Decode plaintext `P_i=(r_i−sign*k_i) mod28` under either sign±. When `C_i=C_(i-1)`, decode the reserved transparent rune EA (GP index28) and either advance the key registers or preserve them. This creates an **exact, fully reversible 29-symbol ciphertext channel** without assuming that native 29th rune frequency is unconstrained.

Allow three original-observable reset choices for the same two secret initial registers: whole-book single clock, reset each of 55 physical rune-bearing pages, or reset at the eight original illuminated chapters. The **entire source-frozen search** is thus **28² seed pairs ×2 signs×3 resets×2 same-rune clock rules =9,408 exact decoders**. Candidate scoring uses unmodified original physical rune positions with the first **6,561** runes as a training interval and the remaining **6,395** as a fixed holdout. The literal original page initials and 86 adjacent equal glyphs are never reassigned by a fitted mechanism.

The **highest training IoC** across the twelve architecture subfamilies after optimizing their 784 initial seed pairs is only **0.035886174**. Holding the training-best pair fixed, the largest independent holdout IoC is **0.035782753**. Even retrospectively maximizing each subfamily's heldout IoC over *all* 784 secret seeds yields no more than **0.035963521**. All are near the random 1/28 level, far below native-GP prose. No output contains a convincingly readable complete original passage.

The SFT also encrypts a complete independent **12,956-rune native-GP Shakespeare source** under the same 55 page starts and 86 prescribed true EA markers and tests all six reset/skip modes with one nonzero secret key (13,21). Each plant roundtrips **12,956/12,956** native GP symbols and reproduces exactly 86 equal-ciphertext events. The actual bad output is therefore a property of original LP2, not an inverse that cannot decrypt its own modeled source.

## Stronger all-initial-state invariant

There is a mathematical reason further secret initial-state search cannot rescue the model. For two different choices of hidden key seeds, the known `prime[C_(i-1)]` forcing term cancels in their difference. The residual follows the **homogeneous Fibonacci recurrence modulo28**, whose exact nonzero state period is **48**. Every unknown initial pair therefore changes decoded ordinary plaintext symbols by **one additive relabeling for each observable 48-phase consumed-event position**. Within one reset scope and phase, equality of plaintext symbol labels is invariant under *any* starting seeds.

Measure ordered same-symbol pair fraction Q among ordinary positions sharing their reset scope and phase (up to 48 phase labels for book, 384 chapter×phase states, 2,640 page×phase states). The decoder with secret seed (0,0) supplies the exact phase-conditioned source count, and any other seed must preserve it. The certificate grants the solver an even larger secret family: **an arbitrary fixed 28! permutation for each phase and each reset scope**, rather than only Fibonacci-seed additive shifts. Therefore these Q values are independent of the entire hidden key. The actual original Q under the two output signs is:

| Original-source reset | Repeat consumes state? | Number of phase states | Q for + sign | Q for − sign |
| --- | :---: | ---: | ---: | ---: |
| Whole book | Yes | 48 | **0.035454443** | 0.035778324 |
| Whole book | No | 48 | 0.035961079 | 0.035629562 |
| Physical pages | Yes | 2,640 | 0.037452621 | 0.036214208 |
| Physical pages | No | 2,640 | 0.035953114 | 0.035915546 |
| Illuminated chapters | Yes | 384 | 0.035288661 | 0.036164831 |
| Illuminated chapters | No | 384 | 0.036543441 | **0.035052519** |

The same exact 12,815 eligible source sites were populated from **80 independent original-length English GP windows in Shakespeare and 80 in Gibran per row**. Genuine GP index28 EA is reserved as the proposed transparent marker, so in all source controls it is replaced at ordinary positions by E and the original 141 free positions do not contribute to Q. Across **960 independent source-length benchmark placements**, the **smallest native control Q is 0.058005861**, while the **largest** original Q even under a per-page reset is 0.037452621. For all six source clocks and both signs the gap exceeds 0.0205. The source-native controls are descriptive source-window comparisons, not a proof about every conceivable language.

The executable independently compares several distinct initial seed pairs (0,1), (1,0), (13,21), (27,27) against zero seed under **both** signs and **all six** reset/consumption settings. Every variant preserves the **exact** equal-pair and pair-total integers, as the proof requires. The 48-period is derived and asserted by actual Fibonacci state iteration, with no assumption about a source key or secret alphabet ordering.

## Decision and research implication

Retire this exact **ciphertext-forced Fibonacci/GP-prime GP28** interpreter for original native-GP English, including **all possible two-rune initial states**, same-rune clock skipping, and independent secret alphabets for every reset-scope×48-phase class. The exhaustive seed search provides a concrete failed decoder; the algebraic collision certificate proves why hidden initial state and even much stronger fixed phase substitutions cannot repair it.

The result leaves open changing nonlinear recursion, an unobserved state/phase-event clock, different modulus and input register, additional independent key streams, nonnative intermediate encoding, or an original-authenticated source that selects a different operation. None is warranted by this rejected candidate, and extending its fitted variants would produce more negative sweeps rather than plaintext. A useful next move needs a first-party **source-selected evolving operation that breaks the 48-phase equality invariant**, plus an original heldout decode.

**Reproducer:** [single read-only Windows Node22 CommonJS test](../sims/lp2_p15_fibonacci_gpprime_cipherfeedback_rank28_allseed_sft.cjs). [Passed Windows Actions for all 9,408 original seed decoders, six 12,956-rune native positives and six secret-independent 48-phase certificates](https://github.com/FlareZ123/liber-primus/actions/runs/45077690447). Inputs: canonical original indexed LP2 corpus, first 29 GP prime weights, source-native Shakespeare and Gibran controls.