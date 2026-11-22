# Primitive p50 nonic, red-nine title seeds and hidden repeat-suppression: bounded original inverse

**Agent 15, 21 November 2026. Evidence class: original-source cipher-family rejection with independently solved and native-English positive controls. No unknown LP2 plaintext or authentic key was recovered.**

## Source-motivated candidate

The original LP2 pp49–51 numerical table is a 32×8 raster of 256 printed base60 values. The independently established exact factorization of its GF29 coefficient polynomial includes the monic irreducible degree-nine factor

`N(X)=X^9+12X^8+20X^7+10X^6+5X^5+X^4+9X^3+15X+11`.

Two different source-visible chapter headings each start with exactly nine red GP runes:

- Original p15–22: `[0,1,20,19,24,28,26,22,24]`; 1,903 total chapter runes.
- Original p54–55: `[24,19,21,23,27,2,14,10,19]`; 308 total chapter runes.

Unknown LP2 ciphertext has approximately 81% fewer adjacent equal symbols than simple native-text controls, suggesting an output rejection/clock-advance operation. This is an empirical heuristic, **not** an authored instruction identifying a rejection probability. Likewise, a red-nine seed and an N9 table factor do not by themselves tell a human solver to combine these sources.

An earlier direct N9 additive/rotary receiver failed on the same chapters ([factorization and red-nine experiments](lp2-grid-complete-gf29-factorization.md)). An independent prior hidden-skip beam decoder worked on a prime-totient stream and tested historic alphabets ([prime-clock hidden-skip SFT](lp2-phi-prime-latin-hidden-skip-original-gate.md)). **This test pairs the authentic table's N9 source recurrence and independently printed red-nine seeds with a hidden-skip ciphertext receiver** without assuming the sender's private rejected row history. No source-guided phase fitting, arbitrary alphabet search or ciphertext edits occur.

## Exact frozen mechanism

Use the fixed monic factor's ascending coefficient vector `[11,15,0,9,1,5,10,20,12,1]` to generate the GF29 linear stream, seeded from the corresponding original first nine runes:

`K[i]=-(11 K[i-9]+15 K[i-8]+0 K[i-7]+9 K[i-6]+K[i-5]+5 K[i-4]+10 K[i-3]+20 K[i-2]+12 K[i-1]) mod29`.

The first transmitted post-title rune consumes row nine. Candidate encryption is `C=(P ± K[row]) mod29`. Whenever the candidate output equals the preceding **transmitted** rune, a stochastic sender rejects the trial with probability `q=0.81`, advances the key row, and retries the *same plaintext rune*. A published rune always advances the row by one. The original table factor, all 256 bytes, red headings and full ciphertext remain unchanged.

The beam-128 decoder is blind to the rejection coins, key pointer, number of rejected candidates, and plaintext. For each received symbol, it allows zero through three hidden rejected key rows, requiring **each rejected row to have actually produced the previous published ciphertext**. Independent Shakespeare GP29 trigram/bigram probabilities score competing exact-consistency paths. The GP source orthography includes source-attested single `ING` and `IO` runes. There are four original variants only: two red-title seeds × two algebraic signs. No model is selected by the original decrypted score.

## Execution on original and genuine positive controls

The committed [read-only CommonJS source SFT](../sims/lp2_nonic_red9_hidden_repeat_skip_sft.cjs) independently checks the 256-byte source SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`, verifies N9 divides the untouched table modulo29, asserts original page lengths and exact title seeds, and constructs four distinct 95-symbol encipherings of actual solved p57 GP29 text. An additional four 729-symbol encipherings use a held-out source-native Gibran passage while learning n-gram probabilities from independent Shakespeare. Random sender seeds are fixed and deliberately withheld from the receiver.

| Original title seed | Sign | Solved p57 plant | Independent prose plant | Original post-title length | Original language score (nats/rune) |
| --- | ---: | ---: | ---: | ---: | ---: |
| p15 | − | **95/95** | **729/729**, 18 hidden skips | 1,894 | −4.1422511684 |
| p15 | + | **95/95** | **729/729**, 19 hidden skips | 1,894 | −4.1176050417 |
| p54 | − | **95/95** | **729/729**, 17 hidden skips | 299 | −4.0824004583 |
| p54 | + | **95/95** | **729/729**, 19 hidden skips | 299 | −4.2344131692 |

All eight independent positive inverses also recover the exact key-pointer endpoint. The native prose plant scores range **−2.4394 to −2.4468 nats/rune**, while the p57 solved-page plants score **−2.5083 to −2.5346**. All four true original outputs score below **−4.08**, and their original 70-symbol prefixes are incoherent under the fixed GP alphabet. The original second chapter is much shorter than the first, yet the same adverse distinction holds.

The same source exact script passed a manually dispatched [Windows Node.js 22 CI run 44950791005](https://github.com/FlareZ123/liber-primus/actions/runs/44950791005) on commit `77f8b9a7629964ed7b0f84eb0245ea9b6ad54d11`. The run log preserves all eight planted hit counts, key skips, full original scores and original GP prefixes.

## Research decision

**Retire the exact N9/red-nine hidden repeat-rejection additive stream**, with the source-selected first post-title row, no F interruption, the frozen empirical 0.81 rejection model, and its two arithmetic signs, as a direct GP29 English decoder for both source-selected original chapters. This excludes only those four receiver instances under the stated native-language model; the original heading might be encrypted, the factor might play a different role, and a distinct output function or non-English payload remains possible. This finding does not establish that Cicada deliberately used a hidden-skip cipher.

The positive result is a **reusable working blind key-clock inference method** that can recover hundreds of known native runes with private rejection history. Reuse it only after a new independent source clue identifies a more plausible keyed cipher/clock; tuning new secret alphabets or skip probabilities merely to fit the original negative outputs would provide no evidence of LP2 decryption.

**Status: 56 original LP2 unknown pages remain unresolved.**
