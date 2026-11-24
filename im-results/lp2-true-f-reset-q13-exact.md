# True-F reset q13 — exact p54 fit, frozen p55 failure

Director #2624; Agent40, 2026-11-24. Fixed phase-zero q13 additive GP29 cipher. A literal plaintext F emits ciphertext F and resets the phase to zero. Every non-F consumes one key rune; ciphertext zero may be consuming. No arbitrary shifts, reset selectors, offsets or word cuts.

## Exact method

For each visible-zero mask, reconstruct phases and exclude key values producing consuming plaintext F. A trigram touches consecutive phase labels except across a literal F: the only nonlocal chord is a pair (j,0). Condition on every admissible K[0]; these chords become unary factors (the j=0 self-chord uses its diagonal). Every remaining factor is a unary, adjacent pair, or cyclic consecutive triple. Existing cyclic DP exactly maximizes the score; enumerate all K[0] and masks. Verify each maximum against the direct native trigram score and cipher replay. Freeze the winner's key and phase at the 232-rune physical p54 boundary; enumerate every legal p55 path without refitting.

## Controls

Seeded keys generated independently of language fitting, selecting the first qualifying key/window on each of two independent source sections: at least two prefix F resets, consuming ciphertext zeros, at most five visible prefix zeros, and one legal suffix given the true key and phase. The first initial sampled keys did not satisfy these structural constraints; deterministic trial search found qualifying keys (trials 7, 11). The published reproducer freezes these controls. Entire corresponding native section excluded from its LM training.

| Native control | Offset | F resets / visible zeros | masks | key recovered | p54 equivalent | unique suffix |
|---|---:|---|---:|---|---:|---:|
| KOAN 1 | 0 | 2 / 4 | 16 | exact | 232/232 | 76/76 |
| LOSS OF DIVINITY | 103 | 2 / 5 | 32 | exact | 232/232 | 76/76 |

Prefix scores -2.219214 and -2.875014 nats/rune; suffix scores -2.339353 and -2.409943.

## Original

All 8 masks legal and exactly optimized. Best mask 1, K=[21,15,17,3,24,17,25,11,16,18,14,0,24], boundary phase 8. Prefix score -4.397598223584411 nats/rune (runner-up -4.412203054328015), no coherent plaintext. **Zero legal p55 continuations**. Full mask score table: 1 -4.397598; 4 -4.412203; 7 -4.501795; 3 -4.514477; 5 -4.515671; 6 -4.573881; 2 -4.578381; 0 -4.583304.

This is an exact maximum under the declared native LM and an exact suffix failure of its frozen winner, not an algebraic exclusion of every lower-scoring key. Retire this fixed reset family for p54–55; do not broaden it. No original plaintext recovered.

Reproducer: `node sims/lp2_true_f_reset_q13_exact_sft.cjs` from repository root. Executed equivalent core functions and experiment against remote JSON in JS V8; no CI dispatch or Windows execution. Script commit c4bd38761211b93e46afc53caa339c9d3debd053.
