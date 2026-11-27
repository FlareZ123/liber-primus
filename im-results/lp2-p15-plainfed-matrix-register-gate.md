# p15 plaintext-fed four-rune matrix register: exact original inverse gate

**Agent35, 27 November 2026. No authenticated unknown-page plaintext or key.** The literal printed p15 matrix and the signed reconstruction both fail a distinct plaintext-fed state mechanism on the full following original pp16–22. With authentic transparent-F semantics, **all 707,281 initial states per matrix have zero complete legal paths**, independently of language scoring.

## Fixed source and reversible receiver

The original p15 4×4 numerical square supplies the literal row-major matrix M (mod 29):

    10  3 20 22
     1 22 21 25
    11 17 19  7
    21 17 12 22

The previously reconstructed signed form substitutes 8,12 for the first two last-row entries. Both are fixed before decipherment. See [p15 arithmetic and signed reconstruction](lp2-p15-p39-signed-matrix-eigen-crosslink.md). The immediately following original p16–22 contains [267,273,260,271,269,273,131] = 1,744 runes, exactly 436 ordinary four-rune blocks. No proof identifies this matrix as an encryption operator. The investigated hypothesis is that it updates a four-rune key register fed by recovered plaintext, rather than directly encrypting each plaintext block or generating an autonomous pad.

For four successive consuming plaintext runes P_b, let v_b be the current secret four-vector:

    C_b = P_b + v_b (mod 29)
    v_(b+1) = M v_b + P_b (mod 29)

Consequently the inverse state update is exactly:

    P_b = C_b - v_b
    v_(b+1) = (M-I) v_b + C_b.

All 29^4 initial vectors are enumerated. No IV, phase or reset is fitted outside this source-fixed start; no matrix is inferred from plaintext. For the authentic-F variant, P=F/index0 is emitted unchanged and neither fills a block slot nor updates the register. At C=0, retain the hold branch and any consuming nonzero plaintext branch. At C!=0, consuming P=0 is impossible. Advance the register only when four consuming runes have filled the block. The final partial block need not update. DFS carries the exact state, slot, partial ciphertext block, previous plaintext rune and path; no beam, lexical restriction or path merging. A finite node cap reports incompleteness if hit; no cap was hit in the reported final runs.

This differs from [p15 direct input/output CBC](lp2-p15-cbc4-source-difference-gate.md) and [autonomous signed-M state generators](lp2-p15-signed-matrix-allstate-original-gate.md). Earlier negatives do not subsume this driven recurrence.

## Exact key-recovery attack and held-out original

Train a fixed GP29 conditional bigram table on seven of the nine tracked solved sections, half-count smoothing, rounded log probabilities ×1000. The two excluded sections (native first KOAN, 780 runes, and LOSS OF DIVINITY, 755 runes) are independent plaintext controls, with hidden states [3,5,7,11] and [19,2,23,14]. Encrypt them independently using the forward recurrence, then rank every initial state and every legal training F history on the first 267 runes. Freeze the best prefix and terminal state; rank legal held continuations with the same fixed scorer. This is a held-out ciphertext test, with F ambiguity still resolved by language scoring, not an independently predetermined F mask.

| Matrix | Ordinary original best fit NLL | Held NLL | Held IoC | Best IV (packed little-endian base29) |
|---|---:|---:|---:|---:|
| Literal | 3.59844 | 3.84091 | .0343148 | 114211 |
| Signed | 3.58499 | 3.85136 | .0347294 | 567882 |

Both ordinary searches completely rank all 707,281 states on p16, then independently decode p17–22. Neither yields readable native GP prose; exact re-encryption is merely the arithmetic invariant. Across both matrices and both clocks all eight independent-law control trials recover the exact hidden key uniquely at the training optimum, all 267 training runes, and every withheld rune (513/488 respectively). Native training NLL 2.55699/2.80215, held 2.66804/2.77411 and held IoC .0634061/.0594893. The same two donor sections are reused across the four variants, so these are eight control trials on two distinct native passages, not eight independent texts. The first 500M-node literal-F KOAN pilot was incomplete; the rerun with 2.5B cap completed (592,861,658 nodes). The report uses the completed rerun only.

## Stronger full-cipher exact exclusion, with every legal F interpretation

| Matrix | All initial states | p16 legal states | p16 legal paths | Full original DFS nodes | Longest legal original prefix | Full legal paths |
|---|---:|---:|---:|---:|---:|---:|
| Literal | 707,281 | 9,890 | 72,760 | 46,986,707 | 1,403 | **0** |
| Signed | 707,281 | 9,841 | 74,173 | 47,336,211 | 1,591 | **0** |

There is no legal plaintext for the entire original in this exact family, even a non-English one. The literal best scoring prefix (state 180973, NLL 3.61091) has no continuation; neither does the signed winner (321245, NLL 3.63829). More importantly, the full DFS exhausts all other initial states and all F choices, rather than relying on the prefix language winner.

## Scope and next decision

Retire this exact matrix plaintext-fed register at the declared p16 origin, canonical GP29 alphabet, and continuous four-consuming-symbol state update. The ordinary-clock rejection is empirical native-register scoring; the F-hold rejection is exact ciphertext feasibility. No new key or unknown text; neither matrix has been authenticated as a cipher instruction. This does not cover private alphabet, nonlinear update, or independently source-selected different framing. Do not launch parameter expansion from the rejected model.

Reproduce with [Python runner](../sims/lp2_p15_plainfed_matrix_sft.py) and [C++17 exhaustive core](../sims/lp2_p15_plainfed_matrix_sft.cpp). Local g++ execution used the exact 1,744-rune source and nine native sequences exported from repository blobs 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 and 1b064ef6d85819b7d96adaff31a82d1ec551598f. The runner reconstructs the exported input (SHA256 1470d018c26e27ca2e5c6b5ab71e33fd55309077c843d3a9ef37de1fbb22231d); the standalone Python runner itself has not been executed in a complete checkout. No Windows CI run claimed.
