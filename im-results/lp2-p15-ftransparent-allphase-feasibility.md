# Source-visible p15 key families: exact historical F-bypass impossibility on two original page families

**13 November 2026, Agent25. Result: source-anchored, exact ciphertext-level exclusions with complete historical plaintext-F ambiguity.** Eight p15/BASE29 periodic keys fail all 320 signs/phases on original pp16–22. The wider *all-affine* source-key test fails **67,200 of 67,280** configurations across five 16-value source lists: its 80 surviving aliases are the same vacuous zero-shift plaintext-is-ciphertext identity. Independently, p15 Fibonacci prime-ordinal starts paired with the *authentic* solved-p56 prime-totient operation fail on seven floral-bordered pages p40–55 despite granting each page all starting ranks and both signs. No unknown plaintext or authenticated LP2 cipher has been recovered.

## Causal solve path and independent inputs

The original p15 4×4 numeric page supplies exactly 16 source-selected values. Its established Fibonacci-indexed-prime reconstruction makes available three related lists: its printed values, the underlying primes and their distinct Fibonacci ordinals. An original 2013 Cicada command also explicitly demonstrates BASE29 numerical conversion, making the base29 digit expansions of the printed/primal values and 3301 itself an independently motivated alternative. A human solver might treat one such list as a GP29 repeating key. The 2014 solved LP1 cipher and solved p56 already establish a genuine **plaintext-F passthrough**: F emits a literal ciphertext F and **does not consume a key symbol**. Non-F plaintext consumes a key and is added modulo29.

Earlier p15 fixed-key tests generally assumed a positional clock and scored the output as noise. The more generous all-secret phase16 coincidence gate in this invocation excludes a different model **only if its clock is fixed**. Plaintext-F bypass destroys that fixed clock because a ciphertext F can mean either literal F or an ordinary encrypted non-F. This gate therefore tests that historically authenticated escape branch *directly*, with no estimated English language model, no guessed F mask and no no-repeat assumption.

The unedited physical LP2 original pp16–22 have exact page rune lengths **[267,273,260,271,269,273,131]**, totaling **1,744 source symbols and 65 ciphertext Fs**. These are the seven pages immediately following physical p15 inside its visual chapter p15–22. Restricting the target to these pages avoids assuming p23 belongs to the same chapter. Cyclic key phase is granted **every** possible offset, absorbing unknown cipher text or literal-F clock consumption on p15 itself.

## Exact cipher-level state sieve

Write an arbitrary candidate key sequence as K, candidate encryption sign s in {-1,+1}, cyclic phase offset o and consumed-key count k. The historically solved rule has only these allowed inverse transitions:

- If source ciphertext C equals GP rune F/index0, plaintext **may** equal F/index0 with k unchanged.
- Otherwise, or as an alternative when C is F, candidate plaintext is P = (C − s*K[(k+o) mod len(K)]) mod29 and k advances by one, **provided P is not F**. A key-consuming transition that would decode to F is historically forbidden because its true encryption must bypass the key.

Initialize the set of possible consumed counts to {0}. After every unmodified ciphertext rune, expand **both** permitted transitions and deduplicate equal clock states. No language score, beam cutoff, assumed plaintext identity or unknown F-mask pruning occurs. If the state set becomes empty, *every* F-bypass assignment for that exact key, phase and sign is impossible. Resetting this state independently on each original page makes the test more permissive than one continuous chapter clock. Granting each page its own independently chosen sign and phase is even more permissive; one entirely infeasible page still excludes that stronger relaxation.

The eight frozen candidate keys (all integers taken modulo29) are:

| Key | Length | Sign × all cyclic phases | Maximum continuous valid prefix | Feasible phase/sign choices on p16,p17,p18,p19,p20,p21,p22 |
| --- | ---: | ---: | ---: | --- |
| 16 printed spiral values | 16 | 32 | 272 | **1,0,0,0,0,1,6** |
| 16 recovered Fibonacci-indexed primes | 16 | 32 | 145 | **0,0,0,0,1,0,2** |
| Their 16 prime totients p−1 | 16 | 32 | 187 | **0,1,1,0,0,0,3** |
| 16 distinct Fibonacci indices | 16 | 32 | 186 | **0,0,1,3,0,0,1** |
| Their one-based prime ordinals | 16 | 32 | 161 | **0,0,0,5,0,0,4** |
| BASE29 digits of 16 printed values | 47 | 94 | 403 | **1,0,0,0,0,0,10** |
| BASE29 digits of 16 underlying primes | 30 | 60 | 176 | **0,0,2,0,0,0,6** |
| 2013 BASE29(3301) = digit values [3,26,24] | 3 | 6 | 13 | **0,0,0,0,0,0,1** |

Here the maximum valid prefix is a rune count before the **first exact impossible rune**, optimized over all signs/phases, not a language fitness score. A row such as the printed-key row has zero feasible p17 phase/sign options even if the solver is allowed to rephase the key independently at each printed page. The p16–22 continuous result is **0/320** viable candidate/sign/phase combinations; per-page reset with a fixed phase is also **0/320**, and **every one of the eight keys has at least one entirely phase-impossible original page**, defeating an arbitrary separate phase/sign for each page.

## Every affine re-scaling and offset of the five source 16-value lists

A natural rebuttal to the failed literal keys is that the p15 numbers might require a secret *linear remapping* to GP29 values: a scaled source value plus a constant shift. That is a mathematically explicit, more generous cipher family, and does not require fitting an English scoring model. Grant all **a,b∈GF29** and every cyclic phase **phi∈{0,...,15}** for the five independent source-visible 16-value series:

- Sixteen printed absolute prime differences in spiral order.
- Sixteen reconstructed Fibonacci-indexed primes.
- Those primes' Euler totients (prime minus one).
- Sixteen distinct Fibonacci arguments.
- Their sixteen one-based prime-index ordinals.

The complete candidate GP29 key is **K[j]=(a×source[j]+b) mod29**; inverse uses the *historically correct plaintext-F bypass state machine*. This includes every ± sign, reflection, additive offset and nonzero rescaling; a=0 is deliberately retained to detect degenerate constant streams. There are **29×29×16=13,456 configurations per series**, **67,280 across five**. Test every candidate directly on the complete original pp16–22 ciphertext, including every possible source F-mask selection. Every finite state holds only the number of key symbols actually consumed.

| Source sixteen-value list | All-affine configurations | Survive original forward-encryption constraint | Longest initial original rune prefix for a failing key |
| --- | ---: | ---: | ---: |
| Printed spiral values | 13,456 | 16 | 634 |
| Underlying primes | 13,456 | 16 | 617 |
| Prime totients | 13,456 | 16 | 617 |
| Distinct Fibonacci indices | 13,456 | 16 | 617 |
| Prime one-based ordinals | 13,456 | 16 | 617 |
| **Total** | **67,280** | **80** | |

**All 80 survivors have a=b=0**: there are 16 redundant cyclic phase labels for each of five series, but every one describes the **single constant zero-shift operation**, C=P. The original unsolved ciphertext is empirically near-uniform, and treating it as the plaintext does not explain its rune structure or recover its meaning. **Every nontrivial affine source key fails exactly:** 67,200 source-key/phase configurations have no plaintext-F branch sequence which could produce the original source ciphertext. This is an algebraic finite-family result, independent of letter-frequency expectations. A zero-slope nonzero offset is included and fails. A representative nonzero affine transform for each source list successfully encrypts source-native English under authentic F transparency and is accepted by the same inverse, in addition to the existing 320 literal-source plants and genuine solved p56 control.

This closes further *offset/rescaling* searches of these five p15 source streams under historical repeating-key GP29 addition. It **does not** rule out a differently sourced secret key, nonlinear or evolving operation, word-dependent reset, external one-time pad, extra cipher layer, or new preprocessing of the source square. It does not prove that Cicada chose any of these tested transformations.

## Independent p15-to-floral-border prime-totient consumer

The original chapter after p15 is one plausible consumer of its 16 numbers. Another concrete visual route is the **exactly sixteen matching floral-bordered physical pages p40–55**, including the numerical-only p50. The previously executed [literal prime-totient gate](lp2-p15-16value-to-floral16-prime-totient-gate.md) mapped each p15 Fibonacci prime ordinal to its corresponding page and applied **the historically genuine p56 totient stream** with the simplistic assumption that every ciphertext rune consumes the key. Since true p56 encryption transparently skips *plaintext* F, that earlier fixed-position negative was insufficient to exclude this authentic-algorithm alternative.

Give *each* floral page an independently chosen start from **all 16 p15 source prime ranks [1,2,3,4,6,9,14,22,35,56,90,145,234,378,611,988]**, and **either encryption sign**. Thus any permutation of the 16 starts between pages, either spiral direction, and independent pagewise sign choices is covered. For a chosen starting ordinal s, a consumed key index k uses the literal source-derived term phi(prime_(s+k)) = prime_(s+k)−1 modulo29. The exact same historical-F state machine tests all possible F-bypass decisions, page by page, without an English model.

The original **3,316 GP runes** in these sixteen physical pages include a **runeless p50**, which is deliberately retained as a freely compatible page. The exact number of feasible start/sign combinations among **32** for each untouched original page is:

| Physical page | p40 | p41 | p42 | p43 | p44 | p45 | p46 | p47 | p48 | p49 | p50 | p51 | p52 | p53 | p54 | p55 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Feasible of 32 | **0** | 1 | **0** | 5 | **0** | **0** | 1 | **0** | **0** | 4 | 32 | 6 | 2 | 2 | **0** | 6 |

In particular p40, p42, p44, p45, p47, p48 and p54 have **zero feasible inverse paths under every one of the 16 source prime starts and both signs**. The original fixed clockwise p15 start-to-page pairing with the authentic plus encryption sign is feasible for only **3/16 pages: p43, p49 and runeless p50**; the other 13 fail without needing language scores. Because seven page rows have no edges at all, **no global matching, secret permutation or reordering of the sixteen source seed ranks can rescue the original floral chapter under this exact cipher consumer**.

**Positive:** All **512** sign/start/page combinations pass the exact feasibility decoder when the same original page lengths are filled with independently encoded source-native Gibran GP text and the historically correct plaintext-F bypass is applied in the forward direction. The authentic untouched 85-rune p56 is separately accepted with its real prime-totient key. These controls explicitly support the stronger all-secret assignment exclusion for the chosen authentic primitive.

This is a **source-constrained cryptanalytic decision**, stronger than the earlier no-F, fixed-p15-page-order unigram score. It does not exclude a different mathematical consumer, a cryptographic hash/KDF applied to the printed numbers, hidden independent page keys, a nonperiodic stream not fixed to these ordinal starts, or the possibility that unknown pages deliberately abandon the historical plaintext-F rule.

## Required controls and what the decision means

The same exact state machine accepts the **unaltered historically solved 85-rune LP2 p56 ciphertext** with its authentic prime-totient key; five legal final consumed-clock states survive (only a lexical constraint chooses the actual original plaintext). Additionally, **all 320** p16–22 candidate/sign/phase variants encrypt a 1,744-rune source-native GP English passage using the genuine plaintext-F passthrough, and the exact unknown-mask inverse finds the generated ciphertext feasible. The positive plaintext is checked by its complete original-length forward encoder, including every literal plaintext F. This is much stronger than merely observing uniform-looking nonsense after an imperfect key clock.

**Cryptanalytic conclusion:** Reinterpreting an original ciphertext F under the historically established bypass rule cannot rescue these eight natural periodic p15/BASE29 key streams. The actual original ciphertext is not in any of their forward-image languages under any legal F assignment, even with independently chosen phase and sign per physical page. All three exact source-key rejections are **algebraic and language-independent** for the stated candidate-key families and the authenticated cipher rule. It does not reject other operations on the p15 numbers, keys derived with an unprinted transformation, evolving nonperiodic key streams, alternative handling of 29-symbol input, or the possibility that unknown LP2 pages never used the solved LP1/p56 bypass convention. A future route needs a genuinely new source-selected operation/key rather than re-scoring these same periodic consumers.

**Independent reproducer:** [Exact all-mask historical-F feasibility SFT](../sims/lp2_p15_ftransparent_allphase_feasibility_sft.cjs). It checks the original canonical GP29 source, all 16 printed Fibonacci-prime equality values, all 320 periodic-key variants, all 67,280 affine-key configurations, all 512 floral page/start/sign combinations, the p56 real-positive control, and 837 independently configured original-length positive GP-native F-transparent plants. Node.js 20+ CommonJS; no file writes or automatic CI triggers. [Passing original-input manual Actions run 43440839029](https://github.com/FlareZ123/liber-primus/actions/runs/43440839029) exercised the full p15 F-bypass source/key test and independent historical solved-cipher controls on Node.js 22.
