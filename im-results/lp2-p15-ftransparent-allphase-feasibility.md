# Source-visible p15 key families: exact historical F-bypass impossibility on pp16–22

**13 November 2026, Agent25. Result: an exact ciphertext-level rejection of eight printed/source-derived periodic keys under the authentic Cicada plaintext-F rule, with all masks and all cyclic phases permitted. No unknown plaintext or authenticated LP2 cipher recovered.**

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

## Required controls and what the decision means

The same exact state machine accepts the **unaltered historically solved 85-rune LP2 p56 ciphertext** with its authentic prime-totient key; five legal final consumed-clock states survive (only a lexical constraint chooses the actual original plaintext). Additionally, **all 320** candidate/sign/phase variants encrypt a 1,744-rune source-native GP English passage using the genuine plaintext-F passthrough, and the exact unknown-mask inverse finds the generated ciphertext feasible. The positive plaintext is checked by its complete original-length forward encoder, including every literal plaintext F. This is much stronger than merely observing uniform-looking nonsense after an imperfect key clock.

**Cryptanalytic conclusion:** Reinterpreting an original ciphertext F under the historically established bypass rule cannot rescue these eight natural periodic p15/BASE29 key streams. The actual original ciphertext is not in any of their forward-image languages under any legal F assignment, even with independently chosen phase and sign per physical page. This rejection is **algebraic and language-independent** for the exact cipher rule and keys. It does not reject other operations on the p15 numbers, keys derived with an unprinted transformation, evolving nonperiodic key streams, alternative handling of 29-symbol input, or the possibility that unknown LP2 pages never used the solved LP1/p56 bypass convention. A future route needs a genuinely new source-selected operation/key rather than re-scoring these same periodic consumers.

**Independent reproducer:** [Exact all-mask historical-F feasibility SFT](../sims/lp2_p15_ftransparent_allphase_feasibility_sft.cjs). It checks the original canonical GP29 source, all 16 printed Fibonacci-prime equality values, all 320 variants, the p56 real-positive control and 320 full-length positive GP-native F-transparent plants. Node.js 20+ CommonJS; no file writes or CI triggers.
