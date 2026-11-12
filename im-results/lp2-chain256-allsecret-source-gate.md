# Original LP2 chain-step / period-256 all-secret gate

**12 November 2026, Agent 13.** An independent original-input test of a concrete reversible candidate: the 256 source-visible bytes printed across LP2 physical pp49–51, combined with the 28-step nonzero ciphertext-difference alphabet. **No unknown LP2 plaintext or authentic historical key was recovered.** This report excludes a source-motivated cipher *family*, rather than another guess at a specific key.

## Original-source operation and key-independent prediction

The manuscript's 256 numerical cells form 32 rows of eight two-character tokens. Their conventional base60 reading supplies a candidate 256-byte key; that parse remains conditional. Under the separately proposed primitive GP29 multiplier 15, let C be the 12,956 original GP29 rune indexes from physical p0–55, with C before the first rune taken as 0. Compute D[i] = (C[i]-C[i-1]) mod29, and let E[i] = log_15(D[i]) in 0..27 for nonzero D. For D=0, emit reserved GP symbol EA/28 and do **not** consume the key clock. Exactly **86** zero steps occur. The generator 15 has exact order 28 in the nonzero residue group mod29. Neither the zero-step interpretation nor the log mapping is established as the historical cipher.

An attractive first consumer, now rejected, repeats the printed row-major 256 bytes (B) as a 28-way additive key on *only* nonzero steps: P[i]=(E[i] ± (B[keyClock mod256] mod28)) mod28, while zero steps emit EA. Both signs are nonlinguistic; output whole-book rune IoCs are approximately 0.03527 versus approximately 0.03448 for the original ciphertext. This is only a fixed specific key, so the main test below grants **every possible unknown phase-specific 28-symbol bijection**.

Suppose instead that each nonzero position at clock phase t mod256 is encoded by an arbitrary *bijective* substitution f_t:P→E, and that EA uses the zero-step escape. For two positions in the same phase, P_i=P_j if and only if E_i=E_j. Consequently the total same-phase equal-pair count, after removing EA and using the exact reset segmentation, is a **key-independent necessary condition** for *every* one of the (28!)^256 phase-key combinations. This does not rely on guessing a key or on any language model.

The source-native English controls are the same GP29 mapping used elsewhere in the repository: case-fold, replace V→U/K→C/Z→S/Q→C, greedy-longest GP tokenization (including TH, EO, NG, OE, AE, IA and EA), and remove only nonletters. We take all complete length-12,956 windows at fixed stride 6,000 from pinned Shakespeare and Emerson texts, and at stride 3,000 from pinned Gibran. The 104 windows are independent of the source-ciphertext key.

| Clock contract | Original equal/pair | Original equality rate | Lowest of 104 GP-English controls | Controls below or equal to original |
| --- | ---: | ---: | ---: | ---: |
| Whole book, no reset | 11,634/317,100 | 0.036688742 | 0.058890995 | 0/104 |
| Nine original visual chapters, phase reset per chapter | 1,459/39,134 | 0.037282159 | 0.058104054 | 0/104 |

The nine-image chapter boundaries, in global rune offsets, are **0,729,1874,3603,5506,6527,7960,9640,12648,12956**. Native controls have their *own* EA counts (44–163), and the statistic recomputes the non-EA phase clock separately for each window. It does not impose original repeated-ciphertext positions on the controls. The original has 86 EA/zero markers.

A complete plant generates 256 secret random 28-symbol permutations, encodes a 12,956-rune source-native GP-English window by adding 15 raised to each phase-mapped GP symbol to the previous ciphertext rune, then decodes via the inverse permutations and checks exact forward re-encryption. **12,956/12,956 symbols recover** for each of the two clock contracts, and the keyless same-phase equal-pair counts remain exactly invariant.

## Decision and limits

**Reject direct GP29 native-English plaintext behind any fixed 256-phase bijection of nonzero chain steps** for either tested reset contract, conditionally on the zero-step EA convention. The observed equality rates are well separated from every sampled normal GP-English window, before any key selection. The original exact source grid modulo28 Vigenère consumer is a strict subfamily and need not be retried with different phase permutations.

This excludes neither a cipher with state that evolves when the same key phase recurs, nor alternate plaintext alphabets, a changed zero-step meaning, insertions/erasures, different key clocks, or an independently selected 256-byte stream-cipher expansion. It also does not prove that the original 256 cells were intended as a repeating key. Any proposed descendant should specify **which source instruction changes one of these assumptions**; searching all 256-phase keys would otherwise be unproductive.

**Reproduce:** [single-file CJS original-input test](../sims/lp2_chain256_phase_bijection_sft.cjs), with corpus [LP2 GP29](../resources/liber-primus/lp2-corpus.json), [original grid](../resources/liber-primus/base60-grid.json), and pinned control texts under [resources/control](../resources/control).
