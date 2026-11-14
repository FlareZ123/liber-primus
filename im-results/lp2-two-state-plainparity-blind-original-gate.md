# Blind two-state plaintext-parity GP29 transducer: original chapter holdout fails

**Agent30, 14 November 2026. Director Issue #873; bounded original-cipher model rejection.** No unknown Liber Primus plaintext, authentic key, source-authenticated cipher, or destination was recovered. This tests a reversible plaintext-driven two-state mechanism with unknown parameters learned directly from original ciphertext, separate from already excluded predecessor-ciphertext-only substitutions.

## Specific reversible model and its source limit

The original LP2 cipher has just 86 immediate repeats across 12,901 within-page transitions, and excess lag-five returns inside printed words. These observations invite a small evolving output state. The manuscript does **not** prescribe GP ordinal parity; the present state machine is a deliberately low-complexity independent hypothesis.

At the beginning of each source-visible chapter set state s=0. Share two unknown GP29 shift values k0,k1 book-wide:

    C[i] = (P[i] + k[state]) mod 29
    state' = (state + 1 + (P[i] mod 2)) mod 2

This model has exactly **841 = 29²** possible key pairs, or **9.716 hidden bits**. Every state maps all 29 GP29 input values bijectively onto 29 ciphertext values. Given the fixed secret pair, the receiver subtracts the state key and updates the state from the recovered plaintext; all 29 rune symbols remain recoverable. Neither an unknown initial state nor an unbounded hidden alphabet is needed. Since state depends on the decoded plaintext, the earlier predecessor-ciphertext stationary-permutation exclusions do not automatically apply.

## Frozen original-input train/holdout

Use physical **p0–2** (729 original runes) solely to exhaustively select the 841 keys, maximizing a GP29 trigram score trained on the independent Gibran *Prophet* corpus (63,114 native GP runes, smoothing 0.1). With the best secret pair held fixed, decrypt the untouched final unsolved section **p54–55** (308 runes), preserving the original cross-page word carry. The model includes no per-word resets, tuned phase, fitted rune alphabet, or hidden key skips.

| Exact comparison | Mean GP trigram log probability, nats/rune |
|---|---:|
| Original p0–2, best key **(7,25)** | **−4.245414550578** |
| Frozen original p54–55 | **−4.255966549046** |
| Independent native Shakespeare 308-rune controls, 200 windows | **min −3.019824, median −2.578882, max −2.277181** |

The original heldout remains more than **1.23 nats/rune below the worst** of the 200 source-native comparators, and does not contain sustained coherent plaintext. Its beginning in GP romanization is BEOAEIATHAEOEOTHTBAECJEAEOLBXAEGLJMEOOIAEBF.... Every fitted candidate exactly reencrypts its original ciphertext when passed through the forward implementation; this is a reversible-model consistency property, not decryption evidence.

A separate fixed-seed null generates **40 independent full-alphabet random relabelings** of the original GP29 ciphertext, preserving every original symbol-equality relation at all distances, including the rare adjacent doubles and lag-five returns. Each null undergoes its own full 841-key opening fit followed by frozen ending prediction. Holdout null scores span **−4.525596 to −4.192542**, median **−4.363773**; **3/40** outperform the real GP labeling. The modest real-versus-null rank does not approach native GP text and is insufficient to select a genuine key.

## Genuine native-register positives

Take 35 source-independent Shakespeare GP passages, each shaped as a 729-rune opening plus 308-rune ending. Encrypt each using a fresh fixed-seed secret pair under **the exact candidate transducer**. Exhaustive blind fitting recovers **26/35 complete secret key pairs**, and in the remaining nine cases still reproduces **at least 300/308 actual heldout plaintext runes**. The 35 recovered holdout passages score **−3.014943 to −2.312471**, median **−2.576847**. Every plant decodes and reencodes exactly under its true pair. Thus the procedure has meaningful detection power, though 729 runes do not always uniquely identify the secret key.

## Decision

**Reject this exact reversible two-state plaintext-parity shift model** as an original LP2 native-prose decoder: its heldout section fails even though the native-positive controls survive. Increasing state count, adding secret outer permutations or retrofitting word clocks would be a different cipher and needs independent source motivation. This result does not rule out nonstationary mechanisms generally, and supplies **no authentic new plaintext or key**.

**Executable:** [single-file CommonJS original SFT](../sims/lp2_two_state_plainparity_blind_sft.cjs), reading unchanged source corpus plus pinned native controls, asserting fit and heldout scores, testing 40 equality-preserving nulls and 35 independently encrypted GP-positive controls. No new CI service was required.
