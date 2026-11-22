# Exact Viterbi search for literal-F masks under authentic LP1 Vigenere keys

**Classification: bounded negative for direct LP1-key reuse on LP2; positive algorithmic control.** This study uses the known LP1 keys DIVINITY and FIRFUMFERENFE and explicitly optimizes the unknown positions where ciphertext F is a literal interrupter rather than a Vigenere symbol.

## Motivation and source basis

The repository has authentic known-plaintext recoveries for two LP1 Vigenere operations:

- LP1 section 1 uses the GP29 key DIVINITY (indices [23,10,1,10,9,10,16,26]) and literal-F interruptions.
- LP1 section 5 uses FIRFUMFERENFE (indices [0,10,4,0,1,19,0,18,4,18,9,0,18]) and literal-F interruptions; the source associates this operation with prime-numbered LP1 pages.

The keys, ciphertext passages, and known plaintext vectors are present in [sims/authentic_decryption_regression.cjs](../sims/authentic_decryption_regression.cjs), [sims/authentic_lp1_p03_p04_vigenere_recovery.cjs](../sims/authentic_lp1_p03_p04_vigenere_recovery.cjs), and [resources/transcriptions/lp1_wulfic_canonical.txt](../resources/transcriptions/lp1_wulfic_canonical.txt). Direct transfer of DIVINITY with only all-F-skip/all-F-consume policies had already failed; this follow-up removes that restrictive assumption and lets the decoder choose a separate skip decision at every ciphertext F.

## Algorithm

The key phase and previous plaintext rune form the Viterbi state. For a non-F ciphertext rune, the only transition is ordinary Vigenere subtraction followed by key advancement. At ciphertext F (GP index 0), the decoder branches:

1. Emit literal F and leave the key phase unchanged.
2. Apply Vigenere subtraction with the current key symbol and advance the key phase.

The state count is 30 times the key length (390 for FIRFUMFERENFE). The objective is a smoothed GP29 bigram log-likelihood trained on the first 240,000 characters of the pinned Shakespeare control. Page boundaries reset the language-model context while preserving global key phase. The resulting plaintext is evaluated independently with the repository's smoothed GP29 trigram model.

This is an exact dynamic program, not a brute-force enumeration of the exponentially many possible F masks.

## Positive controls

The DP is first run on the authentic LP1 ciphertext sections with their known keys and expected plaintext. It recovers both the complete plaintext and the exact literal-F skip positions:

| LP1 source control | Cipher runes | Key | Exact skipped F positions |
|---|---:|---|---|
| Section 1 | 116 | DIVINITY | [48, 74, 84] |
| Section 5 | 110 | FIRFUMFERENFE | [49, 58] |

Both plaintext assertions and both skip-mask assertions pass. This establishes that the DP implements the source's key-phase/interrupt behavior correctly on the known examples.

## LP2 transfer

The original input is all 55 rune-bearing unsolved LP2 pages 0–55 (12,956 runes). The source-aligned test starts each global stream at key phase 0. A 0–keyLength-1 start-phase sweep is also run as a sensitivity check.

For FIRFUMFERENFE, the same global-phase DP is additionally applied to physical LP2 page indices [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53], testing the natural prime-page transfer suggested by the LP1 source. The prime subset is concatenated in page order; phase continues across selected prime pages, and language context resets at each selected page.

A wrong-key control increments the first key symbol by one modulo 29 and runs the same DP. This is a simple specificity control, not an exhaustive random-key null.

### Results

| Key | LP2 subset | Source phase-0 trigram score | Source phase-0 F skips | Perturbed-key trigram score | Best all-page phase and score |
|---|---|---:|---:|---:|---:|
| DIVINITY | All pages | −5.8548 | 233 | −5.8456 | phase 4: −5.8502 |
| DIVINITY | Prime pages | −5.7999 | 66 | −5.8325 | phase 4: −5.7998 |
| FIRFUMFERENFE | All pages | −5.8031 | 248 | −5.7898 | phase 4: −5.7992 |
| FIRFUMFERENFE | Prime pages | −5.7659 | 61 | −5.8140 | phase 4: −5.7613 |

The decoded LP2 output is not recognizable English. The best whole-corpus scores are far below the known LP2 plaintext controls (page 56: −3.4739; page 57: −2.4203). The one-symbol-perturbed key is comparable to, and on the all-page runs slightly better than, the authentic key.

**Important scoring limitation:** the Viterbi algorithm chooses the F-skip mask using the complete LP2 stream, so these are optimistic maximum-likelihood fits, not independent holdout scores. The DP is intentionally given every opportunity to exploit the ciphertext. Despite this flexibility, the output remains nonlinguistic and does not show meaningful key specificity. The prime-page subset does not change that conclusion.

## Conclusion and scope

The authentic LP1 DIVINITY and FIRFUMFERENFE Vigenere keys are not supported as direct LP2 keys, even when the unknown literal-F mask is optimized exactly. The DP is useful reusable infrastructure for other known-key ciphers with literal interrupters; its positive controls show it recovers the original LP1 masks exactly.

This does not rule out a different role for either keyword, a different cipher layer, or a key derived from a separate LP2 clue. Such hypotheses need their own source-constrained mechanism rather than another unconstrained phase or mask sweep.

## Reproduction

Run from the repository root:

    node sims/lp2_historical_vigenere_skip_viterbi.cjs

The script reads pinned repository resources, hashes its source inputs, asserts exact LP1 plaintext and skip-mask recovery, tests all key start phases on LP2, includes a one-symbol-perturbed-key control, and emits compact page-level summaries.
