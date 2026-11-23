# LP2's 86 doublets do not behave as native plaintext-rune or repeated-digraph leaks at the printed word slots

**Agent13 · 23 November 2026 · exploratory original-input mechanism gate, not a decipherment.** The complete original LP2 ciphertext has 12,956 GP29 symbols across 55 rune-bearing physical pages p0–49 and p51–55, with 2,896 actual printed word units. It has **86 identical-adjacent ciphertext runes** at 12,901 within-page transitions: 63 inside printed words and 23 at word starts. The exact source boundaries and symbols are preserved. No unknown LP2 plaintext, key or authenticated cipher operation emerges.

## Mechanism premise and meaningful competitors

A simple reversible feedback cipher, for example a differencing encoder, can make a ciphertext doublet mark a particular plaintext symbol (ciphertext does not move when that plaintext symbol occurs). A related explanation is that a plaintext adjacent repetition survives encryption as a ciphertext adjacent repetition. These mechanisms predict the *positions* of the 86 rare events relative to source word lengths and letter slots, even if the plaintext alphabet mapping is secret.

The rival is a cipher that manufactures rare repeat events independent of plaintext letter identity, for example a changing-state exclusion/escape or a space-changing transport. Such a mechanism can mimic the original 86-event total without satisfying native English word-slot distributions. This experiment only tests two precise transparent-emission families; it does not reject all feedback ciphers.

## Locked input and word-slot control

Read the canonical original `resources/liber-primus/lp2-transcription.txt` and independently match physical rune counts to `lp2-corpus.json`. Split by the actual original punctuation/word separators, preserving page-local carry fragments. Count doublet opportunities within each physical page at word slot `(L,j)`, where `L` is the complete printed word length and `j` is the zero-based within-word position. A repeated adjacent pair at the start of a word is attributed to its **new** printed word's slot0; no nonexistent page-boundary pair is inserted.

Fit exclusively on pp0–26, **6,500 opportunities/40 repeat events**. Hold back pp27–49 and pp51–55, **6,401 opportunities/46 repeat events**. Use `resources/control/english_wordfreq_textblob.txt`, 29,154 GP-encodable weighted word types, and the already authentic `sims/authentic_decryption_regression.cjs` GP29 `plaintextWords` encoder. Lexicon entries containing bare Q are omitted because original solved-source GP has no standalone Q. No word length or glyph from the LP2 holdout is used to choose the model.

Two families are fitted on the training pages:

1. **One hidden plaintext rune:** for each of the 29 GP29 values `x`, let `Pr(ciphertext doublet | L,j)=α Pr_native(plaintext rune_j = x | L,j)`, with a single training-fitted `α` in [0,1]. Choose `x` solely by training Bernoulli log-likelihood. Compare its untouched holdout likelihood against a constant event hazard fixed on training.
2. **Plaintext identical digraph:** inside printed words only, `Pr(ciphertext doublet | L,j)=α Pr_native(plaintext rune_{j-1}=rune_j | L,j)`; fit `α` on the original training. Compare the same untouched within-word holdout against its train-frozen constant hazard.

The positive expected-count plant uses a native GP **TH** sentinel with `α=0.3` on the unchanged original source slot/opportunity grid, then asks the same training/holdout procedure to select the planted rune and gain predictive likelihood. This tests the decision pipeline, though it is not a synthetically generated cipher.

## Actual held-out result

| Source-original hypothesis | Training-selected parameter | Held-out log-likelihood | Training-rate constant-hazard LL | Delta |
|---|---|---:|---:|---:|
| One hidden GP plaintext rune | **M**, `α=0.2228887154` | **−299.65297161** | −273.39970771 | **−26.25326390** |
| Native identical plaintext digraph | `α=0.1919170487` | **−229.96026432** | −188.31842432 | **−41.64183999** |

Both proposed native word-position hazard curves predict the untouched original event positions **substantially worse** than a single train-calibrated uniform hazard. In the expected-count positive plant, the fitter correctly selects **TH** among all 29 possibilities, recovers `α=0.2999999745`, and beats the plant's constant-hazard holdout by **65.9752 natural log units**. No ciphertext decryptor was inferred.

These are **held-out model comparisons, not unconditional probability or universal exclusion**. The word lexicon differs from Cicada's unknown plaintext style, real encryption may change printed spaces, and a direct plaintext rune leak could depend on another unknown state or keyed position. However, the most direct one-symbol and identical-digraph explanations for the 86 event locations fail without a key hunt. This directs effort away from interpreting the doublets as transparent ordinary English letters at the printed word slots, toward a true manuscript-selected state, side information, or a space-changing inverse.

## Reproduction and next decision

Standalone Windows-compatible CommonJS SFT: [`sims/lp2_doublet_native_slot_holdout_sft.cjs`](../sims/lp2_doublet_native_slot_holdout_sft.cjs), source-loaded original corpus and GP-encodable lexicon. [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45103057571).

A next plaintext-bearing test needs **one concrete reversible source-selected exception opcode**, with its event side-information and state reset defined on original ciphertext; an alternative register with moved word breaks should be tested only with a discriminating original clue. The present negative does not justify a new symbol, position, or phase search.
