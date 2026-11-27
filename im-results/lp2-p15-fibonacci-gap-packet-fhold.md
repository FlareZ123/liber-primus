# p15 Fibonacci ordinal gaps: packet framing and prime-cursor strides

**Current decision (27 November 2026): both fixed interpretations of the recovered gaps fail under canonical GP29 and authentic F-hold semantics; the cyclic gap-stride ordinary-consuming family is also exactly excluded against three finite native prose registers even with two arbitrary alphabet permutations. A collapsed latent-clock receiver passes four hidden-key controls, and a distinct word-position-conditioned continuous-clock receiver passes two length-conditioned word-order-free controls exactly; the source-literal red rank1/phase0 original has zero strict fitting paths among 33 structured seeds in each receiver.** #2630's constant-shift packet inverse dies at p15 black-body rune index 36; the distinct cyclic gap-stride prime cursor fails every one of 480 tested rank/phase/sign combinations on both p15 black-body–p22 and p16–22, despite recovering two concealed control keys. No unknown plaintext/key. These are scoped negatives, not an exclusion of all Fibonacci-selected clocks.

## #2630 — literal consuming packet lengths (Agent2, 24 November)

### Fixed source rule

The independently established [p15 grid](../results/lp2-p15-fibonacci-prime-spiral.md) equals abs(3301-prime(F+1)) in the red-origin spiral. Its sixteen distinct Fibonacci values are 0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987. Freeze the one-based prime ordinals o=F+1. For packet i=0..14, consume exactly o[i+1]-o[i] non-F plaintext symbols under a single constant shift (prime(o[i])-1) mod29. Plaintext F is emitted literally and does not consume; encrypted non-F may emit ciphertext F. The fifteen packets total 987 consuming symbols. Stop on the 987th consumption, without extrapolating or repeating.

| Ordinal | Packet length | Shift GP0 |
| ---: | ---: | ---: |
| 1 | 1 | 1 |
| 2 | 1 | 2 |
| 3 | 1 | 4 |
| 4 | 2 | 6 |
| 6 | 3 | 12 |
| 9 | 5 | 22 |
| 14 | 8 | 13 |
| 22 | 13 | 20 |
| 35 | 21 | 3 |
| 56 | 34 | 1 |
| 90 | 55 | 27 |
| 145 | 89 | 16 |
| 234 | 144 | 1 |
| 378 | 233 | 11 |
| 611 | 377 | 11 |

The 16-cell grid is reproduced exactly before use. The source does not independently authenticate interpreting its gaps as packets. Start at p15 local rune offset20, first black rune after lower rubric, through p22; 1883 original runes available. Inputs pinned: corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, ink 0614aca67969a14ae006e0c1ae6dcd8136e6, external solved reference 1b064ef6d85819b7d96adaff31a82d1ec551598f.

## Exact inverse

Maintain every reachable consuming count j and its BigInt number of paths. At ciphertext c=0, allow literal F with unchanged j. Independently, allow consuming p=(c-k[j]) mod29 if p is nonzero; increment j. A transition to j=987 records a terminal physical prefix. No path cap, lexical restriction, reset or fitted phase enters.

Original after body index35: exactly one state, j=35 with multiplicity1. At index36, c=3 (GP O) and k[35]=3, hence the consuming inverse would yield p=0, which must bypass and emit 0. Literal F is also impossible because c=3. No path survives. This is p15 local index56, 37th body rune. No terminal 987-consumption candidate exists.

Authentic control: sequential prime-minus-one (not the new packets) plus the same F semantics reproduces all 85 p56 ciphertext runes, 84 consuming shifts. Two constructed packet controls use concatenated native solved reference sections 0..4 and 4..8 respectively. They consume all 987 key digits and exactly replay 1007 and 997 physical runes (20 and 10 F holds). Their true endpoint is reachable; its multiplicity is 2426283980516271075 and 143652619110 respectively. Thus the inverse correctly preserves latent-F ambiguity; it does not identify a unique plaintext on these plants. A single nonzero original symbol with no legal inverse is sufficient to reject independently of any language model.

## Reproduction and next decision

`node sims/lp2_p15_fibonacci_gap_packet_fhold_sft.cjs` reconstructs the original grid, confirms authentic p56 and both native plants, and prints the exact dying trace. Core executed on pinned inputs in JS tool runtime; standalone wrapper supplied. Retire this packet framing. Do not shift packet endpoints, cycle the sequence, change signs or substitute new packet values absent a new independent source instruction. No later original interval was fitted or used to select a different schedule.

## Cyclic gap-stride prime cursor (Agent10, 27 November)

The source p15 spiral independently fixes one-based ranks [1,2,3,4,6,9,14,22,35,56,90,145,234,378,611,988]. Its successive rank differences are `[1,1,1,2,3,5,8,13,21,34,55,89,144,233,377]`. This test uses each gap as a **cursor increment**, not a packet length, fixed decimation stride (#2653), shift value, or plaintext-addressed increment (#2775). The p56 prime-minus-one convention supplies the shift at the current rank. Repetition of the finite gap tape is motivated by the infinity mark but is not authenticated; ordinary continuous prime clocks and decorative artwork remain plausible rivals.

For each of the 16 printed source-derived ranks, each of 15 gap phases, and both arithmetic signs, use `k_j=sign*(prime(r_j)-1) mod29; r_(j+1)=r_j+gap[(phase+j) mod15]`. Each *consuming* plaintext symbol advances the cursor once, while literal F emits 0 and leaves it unchanged. The exact inverse retains the complete reachable set of consuming indices at every original rune. At c=0 both hold and consuming branches are considered, provided the latter gives non-F. No path cap, dictionary, or word order constraint. The 480 configurations include the literal red rank1/phase0 forward start plus an explicit finite relaxation; no origins beyond the 16 source-derived ranks are claimed excluded.

| Original span | Runes | Legal complete candidates | Latest first impossible offset (0-based) | Last-surviving configuration |
|---|---:|---:|---:|---|
| p15 black body through p22 | 1883 | 0/480 | 574 | rank611, phase14, sign−1 |
| p16 through p22 | 1744 | 0/480 | 408 | rank2, phase0, sign−1 |

The native positive checks include authentic p56 85/85, 84 consumed successive primes; the *new* clock is separately calibrated on two constructed controls with disjoint native donor sections and concealed rank/phase/sign. The exact 400-rune fit feasibility gate leaves two and three candidates respectively, retaining truth in both. Rank those survivors using a GP29 add-0.5 bigram Viterbi score fitted on the seven other native reference sections; freeze the highest fit scorer before decoding the continuation. Correct keys selected 2/2, 800/800 fit runes and 735/735 withheld runes recovered, exact full forward replay. Full-interval Viterbi can resolve ambiguous prefix path state after the key is frozen; this is not a strictly causal prefix-state freeze. Exact feasibility alone does not identify the control key (a phase-successor alias survives in each full control), and the small number of controls does not establish universal statistical discrimination.

Without F holds, score all 480 ordinary inverses on p15–19 or p16–19 and freeze the top training candidate for p20–22 (673 runes). Held scores are −3.828959 and −3.826287 nats/rune respectively, compared with disjoint known-native control held scores −2.717681 and −2.775779; even postselected best held scores are only −3.749345 and −3.735341. These are heuristic nonprose diagnostics, not exact ordinary-cipher impossibility. The full fit-selected original tapes are retained in the raw output.

**Decision:** retire this finite gap-stride clock family. It gives no authenticated plaintext/key and no reason to tune more Fibonacci strides absent an independent source-selected clock. No change to the established research frontier. The new evidence extends the related gap-use record without contradicting the original constant-shift packet result.

Reproduction: [single-file CJS](../sims/lp2_p15_fibonacci_gap_stride_prime_sft.cjs) (final code commit dce61c097838f466b4532bb303d731e4fba14737), [raw output](lp2-p15-fibonacci-gap-stride-prime-output.json) (afa82e64f627507e37bb7cd0854fffe36174f982). Core executed in connected V8 on corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 and native reference blob 1b064ef6d85819b7d96adaff31a82d1ec551598f; standalone Node wrapper not independently run.


## Arbitrary GP29 alphabets on the same gap-stride clock (Agent10, 27 November, second invocation)

This is a stronger conditional ordinary-consuming decision for the **same** 480 schedules, not a new stride search. Let `A` map ciphertext glyphs to field labels and `B` map plaintext glyphs to field labels, both independently arbitrary permutations. For ordinary consumption, `A(C_i) = B(P_i) + K_i (mod 29)`. For each fixed schedule construct `H[c,k] = count(i: C_i=c, K_i=k)`. For a candidate set `S` of `m` inner plaintext labels the count is exactly

```
sum_c sum_(s in S) H[c, (A(c)-s) mod29].
```

Maximizing over every possible outer alphabet is one 29×29 maximum-weight assignment. For `m=1`, common translation makes `S={0}` WLOG. For `m=2`, translation and unordered-pair symmetry reduce all 406 possible pairs to `S={0,d}`, d=1..14. Thus the two caps are **exact maxima over both arbitrary alphabets**, even though the inner alphabet is entirely unidentified. Negation of both label maps converts positive to negative schedules with identical caps. The code evaluates every positive rank/phase and represents both signs by that proved symmetry; it checks the symmetry on controls and matches the assignment optimizer against 100 exhaustive small-alphabet matrices.

| Original receiver | GP runes | Max top-1 | Max top-2 | Smallest top-2 among every matched-length donor window | Schedules surviving both |
|---|---:|---:|---:|---:|---:|
| p15 black body→p22 | 1883 | 168 | 272 | 312 | 0/480 |
| p16→p22 | 1744 | 162 | 262 | 288 | 0/480 |

The respective donor minima are Shakespeare 312/288, Gibran 339/314 and Emerson 338/312. Window counts are 215,224/215,363, 60,610/60,749 and 319,445/319,584. Each overlapping window is a finite reference, not an independent statistical trial. The exact top-1 gate alone leaves 80/306 signed cases; all fail the top-2 gate. The calculation has no word-boundary or language-order assumption, and includes the source-literal red rank1/phase0. It **does not** cover arbitrary F-hold histories; the earlier canonical-alphabet F-hold rejection is a different scope.

Six native literary plants with independent secret alphabet pairs pass both exact caps. The training-only alternating-assignment/unigram initialization recovers all 29 outer entries up to common translation in all six. Refining the frozen residual-rank permutation by a separately trained Gibran bigram model (20 pair-swap annealing restarts) recovers 6842/6843 fit runes and 4030/4038 held runes, with individual held counts 673, 673, 672, 672, 671 and 669 of 673. Every recovered pair reencrypts exactly. The schedule is supplied, the inner permutation is fitted exclusively on the prefix, and the rare or absent labels need not be uniquely identifiable. Four donor windows are new; the second original donor's random alphabet changes because the expanded first fit advances the shared PRNG. The original bounds remain unchanged. This is near-exact blind alphabet recovery on controls, not recovery of an original LP2 key or unknown schedule.

Reused the existing [spectral pooled literal-F receiver](../sims/lp2_p56_primeclock_spectral_pool_sft.cjs) on the source-literal rank1/phase0 clock with one 1883-rune scope and a fixed 75% fit. In two independently keyed hidden controls, Shakespeare (98 visible F, 26 literal) yields no strict legal candidate among 22 seeds; Gibran (106 visible F, 46 literal) recovers 1410/1412 fit and 469/471 held, exactly matching its oracle and replaying all runes. Its outer map is translated by +11 relative to truth, with 25/29 inner labels similarly translated (F and rare labels prevent literal complete key equivalence). The oracle control0 gives 1412/1412 and 471/471. The inherited receiver's ≥90%-on-both-controls gate therefore **failed**, and no original F-hold candidate was fitted in that experiment. The replacement initialization below resolves that control failure and tests the original source-literal schedule. The exact branch used to call the shared receiver and its pinned blob are retained in the calibration artifact.

[Assignment SFT](../sims/lp2_p15_gap_stride_twoalphabet_assignment_sft.cjs) · [all 480 caps and controls](lp2-p15-gap-stride-twoalphabet-assignment-output.json) · [F-hold calibration raw](lp2-p15-gap-stride-twoalphabet-fhold-calibration.json). Executed in connected V8; standalone Node wrapper not separately run. No unknown plaintext/key or established frontier change. Do not add more gap schedules. The genuine latent-clock improvement below is the follow-up to this calibration failure.


## Collapsed clock beam initialization for the literal-F receiver (Agent10, 27 November, third invocation)

The failed Shakespeare control above exposes an initialization defect rather than a defect in the exact posterior or Viterbi inverse. Replace the unconstrained emission-profile EM initialization with a single-scope **count-conditioned collapsed beam**. The full beam state stores the cumulative number of literal holds h and the 29×29 histogram H[c,k] of consuming observations, where the shift at emitted offset i is K[i−h]. It does not know either alphabet. Use independent symmetric Dirichlet(0.7) priors for the categorical emission distribution at each shift, and literal-hold prior 0.025. A consuming transition increments H[c,k] and receives log(0.975)+log(H[c,k]+0.7)−log(sum_c H[c,k]+20.3), using counts before the increment. A hold is possible only at visible F, advances h, and receives log(0.025). Reject a candidate if any ciphertext glyph has already consumed at all 29 shift residues (no permissible outer label remains). At each visible F, retain the 32 highest scoring complete prefix histories **per h**. Use the best histogram from each of the top three distinct h values to initialize the existing spectral seeds, structured EM, and bigram inverse. This is a heuristic beam, not exhaustive; the collapsed emission model is relaxed and does not assert a true independently drawn emission distribution for each shift.

Development diagnostics at width32 on the previously failed Shakespeare control: the best collapsed path has six wrong hold decisions out of 77 opportunities; a top100 path has two errors. The exact truth drops from the beam after opportunity66. The Gibran truth stays in the beam; a top100 candidate equals it. Thus approximate histories suffice for initialization; do not mistake the relaxed top path for a uniquely decoded plaintext.

Freeze width32, alpha0.7, hold prior0.025, three distinct endpoint counts, previous spectral/structured EM and bigram parameters before fresh controls. The schedule is the literal red rank1, gap phase0, positive prime-minus-one clock, not a new schedule search. Training uses 1,412 runes, continuation 471; alphabets are fitted only on the training prefix and frozen. Controls 0/1 reproduce the old donor windows (GP offsets30,000), while controls 2/3 are disjoint GP offset10,000 windows with independent keys and seeds. Oracle keys are used for generating controls and measuring accuracy, never supplied to the receiver.

| Control | Visible F / true literal F | Strict legal seeds | Fit / 1412 | Held / 471 |
|---|---:|---:|---:|---:|
| Shakespeare old failure | 98 / 26 | 9 | 1412 | 471 |
| Gibran old | 106 / 46 | 13 | 1410 | 469 |
| Shakespeare fresh | 101 / 44 | 11 | 1408 | 471 |
| Gibran fresh | 112 / 49 | 12 | 1410 | 469 |
| Original p15 body→p22 | 70 / unknown | 0 / 33 | — | — |

All four control candidates exactly replay their full ciphertexts and equal their respective oracle accuracy: 5,640/5,648 fit, 1,880/1,884 held. The ≥90% on both parts of every control gate passes; the original is then tested without changing the beam parameters. **Zero of 33 structured original seeds has a legal fitting path**. No original held text or key is recovered. This is a calibrated search negative for the source-literal clock with two arbitrary alphabets, not an all-key theorem, nor a test of the other 479 relaxed gap clocks. The original has fewer visible Fs than all four controls; this difference is disclosed, not used as an independent rejection or proof of equivalent calibration. As in the inherited decoder, fit score uses the best training-only path, while frozen-key continuation can retain multiple legal prefix-end states.

The algorithmic advance is a materially improved initializer for the known-schedule, latent-F, independent-alphabet inverse, especially for a single long scope where unconstrained EM can lose the cursor. It can be reused when a new source-selected schedule becomes available. Do not repeat generic Fibonacci stride searches or promote the negative result to the established frontier.

Reproduction: [CJS adapter](../sims/lp2_p15_gap_stride_fhold_clockbeam_sft.cjs), [complete records and input blob pins](lp2-p15-gap-stride-fhold-clockbeam-output.json). The adapter pins baseline blob 13e5d15cbd6f7aa40981cedda42a108c17b24a18 and changes only the initialization and fixed job entry point; the connected V8 executed the remotely fetched adapter and baseline. Standalone Node wrapper was not separately executed. Code commit 7be558b8561d89ae2de6766ae2d2c2b9ea40254e; output commit bcab48d679baa577dba1eaa6f8a750c9385a892a.


## Continuous word-position-conditioned F-hold inverse (Agent10, 27 November fourth invocation)

The prior collapsed-beam model uses a single global plaintext unigram profile and a continuous-rune language objective. Under H-shuffle, printed groups can be genuine words while their order is permuted; within-word letter-position distributions remain informative even when inter-word grammar does not. This follow-up retains the **same literal red rank1/phase0 positive gap-stride clock** and the same global consuming index; it does not add a stride, reset or key search. It uses the 432 complete original printed words spanning global rune offsets [3623,5506), whose concatenation matches the original p15 black-body→p22 tape. The 75% training cut is moved to the last complete word (334 words, 1,409 runes); 98 held words, 474 runes.

Train fifteen GP29 letter distributions on the independently pinned Emerson words: each position of lengths 1–4 gets its own class (10 total), and lengths ≥5 have start, second, interior, penultimate and final classes. Each class gets 100 pseudocounts distributed according to the global GP unigram. The exact forward/backward recursion over cumulative literal-F holds uses the actual class-conditioned emission probabilities and accumulates expected G[class,cipher,shift] counts. Given inner A, maximize over outer B by Hungarian assignment using the summed class-conditioned log likelihood. Given B, maximize over inner A with a second Hungarian assignment on the class-conditioned expected residual counts, enforcing A(F)=0. Unlike the previous global-rank sort, this uses all within-word positional evidence.

Initialization retains the width32 collapsed count-conditioned beam, replacing the fixed .025 hold prior with the trained class-specific F probability. For the three leading distinct endpoint hold counts, infer Fourier/assignment seeds and run 24 structured class-conditioned EM steps with an annealed forbidden rank. Strict scoring uses exactly zero consuming-F probability. Candidate A refinement uses only within-word first/bigram/last distributions; Viterbi preserves the **continuous** F clock across word boundaries but resets the language-model context at each printed word. Keys are fitted on the prefix, frozen, and all legal prefix-end states can be considered for the continuation; the jointly selected prefix hold path may therefore use held ciphertext, not held plaintext. Replay checks every original/control glyph but is not independently identifying.

Two independently keyed controls use the exact original length inventory with words sampled independently from Shakespeare or Gibran conditional on length; no donor sentence order or inter-word bigram is used. The old continuous-prose controls are not reused.

| Receiver | Visible F / literal holds | Strictly legal seeds | Fit runes | Held runes |
|---|---:|---:|---:|---:|
| Shakespeare length-conditioned | 97 / 28 | 4/4 | 1409/1409 | 474/474 |
| Gibran length-conditioned | 106 / 46 | 5/7 | 1409/1409 | 474/474 |
| Original | 70 / unknown | 0/33 | — | — |

Both controls exactly replay and reach their known-key oracle's full-text accuracy; the second has a translated observed action rather than a literally identical full permutation. Only after the ≥90% fit and held gate passes is original data fitted. **None of the 33 structured original seeds has any legal training path.** This adds a calibrated H-shuffle-aware negative to the fixed original clock, not an exhaustive all-alphabet impossibility or a rejection of every word-order hypothesis. Visible F counts remain lower in the original. No original plaintext or authentic key is recovered.

[Standalone CJS](../sims/lp2_p15_gap_stride_word_position_fhold_sft.cjs), [raw results with input pins](lp2-p15-gap-stride-word-position-fhold-output.json), commits 20d0e0f1b0f3a66279771e9c2015eca30698cc0e and 7a8538081419ba126c250a4580dafb8d4ff483eb. Connected V8 core executed in 48.209 s; Node CLI wrapper not separately executed. This receiver is a useful conditional extension when an independently specified continuous K[t] exists; no additional Fibonacci stride search is justified.


### General supplied-clock interface

The continuous receiver now exposes `study(data,{CWords,K,fitWords,seed})`. CWords contains nonempty GP29 integer arrays for complete printed words; K contains the independently supplied consuming shifts from origin zero and must cover every possible consuming index; fitWords selects a strict nonempty prefix of whole words. Seed is a positive uint32. The API fits only that prefix, freezes alphabets and returns the full joint inverse/replay and separate held scores, or no legal solution. The prior no-request p15 experiment remains the default.

A separate blind API calibration uses Gibran GP words [1100,1532), 1,641 runes, a synthetic nonperiodic unsigned-multiply shift schedule unrelated to the p15 candidate, independently generated alphabet permutations, 330 fitting words. The custom request returns 1,234/1,236 fit and **405/405 held**, exact replay; 7/7 seeds legal. The actual original LP2 is not fitted in this custom call. This is an integration control, not new source evidence. Its executable body ran in connected V8; the separately committed Node wrapper was not executed. Receiver commit f4adf2a8542f8cf37cdd0fab70b506f33b255650; [API calibration wrapper](../sims/lp2_continuous_word_position_request_control_sft.cjs) 03d10a51de9179036883cb47c3690e39317d327e.
