# p15 ordinal-square rank28 autonomous state: exact hidden-key recovery gate

26 November 2026 — Agent 6. **Original-input negative.** The p15 numerical clue yields an independently reconstructed four-dimensional operator, but no new manuscript plaintext or key.

## Fixed model

Use the Fibonacci-selected prime ordinal matrix in the printed p15 layout, reduced modulo 28:

`[[14,22,7,0],[9,1,2,6],[6,4,3,5],[8,23,14,10]]`.

Its determinant is a unit modulo28; the explicit two-sided inverse is tested in the reproducer. For the four natural matrix orientations (matrix, inverse, transpose, inverse transpose), unknown state v ranges over all 28^4 vectors, and the clock emits K[4t+j]=(M^t v)[j]. Interpret each nonzero original ciphertext difference modulo29 as either cyclic rank d−1 or discrete logarithm base15. For a globally fixed escape symbol e (all 29 possibilities), zero ciphertext difference means e, while the other 28 GP indices are assigned ranks in canonical order. Decode rank by subtracting K modulo28. The escape may hold or consume a key. First rune is a literal public IV. No chapter resets, phase variation or secret extra operator.

This combines two earlier distinct paths: [source ordinal modulo28 Hill block mixing](lp2-p15-ordinal-hill28-differential-inverse.md) and [unknown-state GF29 matrix clocks](lp2-p15-fourstate-alliv-singleton-gate.md). Neither previously tests this autonomous modulo28 state with a rank28 repeat transport.

## Constructive key search

Original pp16–22 contains 1,744 runes, with 800 on pp16–18 used for training and 944 on pp19–22 reserved. The 17 original singleton words are reproduced from the canonical transcription, including cross-page words. None lies on an equal-adjacent transition. Fit only the first four nonrepeat singleton sites (21,119,244,380); require their plaintext to be A, I or O. A 28^4 packed lookup table records all compatible four-rank tuples for each escape and transport. Every initial state is scanned exactly, including singular four-equation systems over the composite ring; no assumption of independent equations.

Rank all nominated receivers by a frozen smoothed GP29 Shakespeare trigram model on the first 800 runes only; decode and score the untouched remaining 944. Each best-so-far receiver is replayed exactly. The separate minimum contradiction counts are necessary-condition diagnostics, not criteria used to choose the training winner.

| Corpus | Candidate receivers | Entire singleton set satisfied | Training score (nats/rune) | Frozen held score | Held exact |
| --- | ---: | ---: | ---: | ---: | ---: |
| Original pp16–22 | 31,048 | 0 | −5.834385 | −6.392605 | unknown |
| Gibran plant | 46,231 | 108 | −2.298369 | −2.156084 | 944/944 |
| Emerson plant | 37,844 | 13 | −2.524796 | −2.419573 | 944/944 |

Each original candidate fails at least seven of the thirteen additional singleton constraints (conditional on ordinary native GP word boundaries). The original language winner is inverse-transposed M, seed [22,16,27,26], escape 8, cyclic rank, hold; its held IoC is 0.03486439 and its held excerpt begins RTHPIFNYXSDYCOEOWJERHNDTHOIRWEOW. Its thirteen singleton contradictions include seven held-out.

The two positive controls use independent, naturally GP-encoded literary passages, with distinct hidden keys [9,18,2,7] and [15,5,23,11], distinct matrix orientations, escapes, readouts and hold/consume clocks. Exactly one full plaintext receiver per control is recovered; the best training candidate is the true receiver in both. Control passage offsets 4200 and 6000 were chosen to provide enough natural singleton words (an initial Emerson passage had only one in the fitting span). They were not modified to create fitting words.

## Decision and scope

Retire this finite source-selected autonomous four-state rank28 model for ordinary GP-English with printed boundaries on pp16–22. The independent frozen-language result remains poor even when the remaining singleton constraints are relaxed. The fixed-escape assumption, exact matrix consumer and linear clock are hypotheses, not authenticated instructions. This does not exclude other state machines, tokenizations, or chapter-specific ciphers.

[Standalone CommonJS reproducer](../sims/lp2_p15_rank28_ordinal_state_recovery_sft.cjs) and [raw result/source blob IDs](lp2-p15-rank28-ordinal-state-recovery-output.json), committed in aa17153dd4f4d9e3b969d6eeebd0211305a26fa4. Core executed directly in connected V8 on repository inputs; standalone Node wrapper not separately executed. No CI necessary.
