# All-key first-order mixed consuming feedback with transparent F — exact reduction

24 November 2026, Agent 5, draw 3. **No unknown plaintext or key recovered.** This is a bounded negative on the original GP29 sequence, not a claim about all feedback ciphers.

## Model and proof

For plaintext P=0 emit C=0 and hold both state registers. Otherwise put X=uP (mod 29), where u is nonzero, and emit C=X+aXprev+bCprev+d (mod 29); update (Xprev,Cprev)=(X,C). The initial two registers are arbitrary. Nonzero ciphertext necessarily consumes; zero ciphertext may be consuming or holding. This extends [the earlier ordinary mixed-feedback test](lp2-hg-original-mixed-feedback-spectrum-gate.md) to actual latent F behavior and all stationary coefficients, rather than its source triads. No source authenticates this recurrence as the LP2 cipher.

Within any nonzero ciphertext run, X_i=-a X_(i-1)+C_i-b C_(i-1)-d. Write X_i=A_i X_0+B_i. Start with all 28 nonzero X_0; each i forbids exactly one root when A_i is nonzero, or rejects the run if both A_i and B_i vanish. Bitmask intersection gives the exact legal first-symbol set without guessing F holds, primers or plaintext.

On all 12,956 original p0–55 runes (455 runs, max 217), every one of the 29^3=24,389 normalized triples is tested, covering 682,892 tuples including u. The only 29 survivors satisfy b=-a and d=0. For each nonzero a, at least one run uniquely forces X_0=C_0. Then delta=Xprev-Cprev obeys delta'=-a delta on consumption and is unchanged on holds. Nonzero a makes this reversible in both directions; therefore delta=0 everywhere for any globally legal path. At zero ciphertext a consuming transition would require X=0, which is forbidden. Hence every zero is a hold and P=u^-1 C for every rune. The a=0 survivor is immediately the same static substitution. Conversely every u admits an exact inverse with initial delta=0. Original IoC 0.03447839786450569, p16–21 0.03454946549360884, both invariant under static bijective relabeling.

The union of 503 within-page runs gives the same 29 shared-coefficient survivors, even if primers reset at physical page boundaries. For each surviving a, at least one run on p7 forces cancellation (or a=0 directly), so p7 cannot obtain a nonstatic decoding from any shared-coefficient model. This is NOT a proof for independently chosen page coefficients: p7 alone retains 1,133 normalized triples (1,104 noncancellation).

## Planted native controls

The exact Viterbi decoder keeps previous consuming X,C and previous physical plaintext, with all 841 possible initial register pairs. It branches on both possible zero emissions when legal. A smoothed unigram/bigram mixture is trained only on native sections outside the target sections. Given a,b,d, fit u from the first half of ciphertext, then use that fixed u for full decoding. Full decoding may use future ciphertext; no held-out plaintext participates in key selection. The two plants use WELCOME+KOAN 1 and LOSS OF DIVINITY+jpg107–167+jpg229, respectively.

| Plant | u,a,b,d | Runes | Prefix-selected u | Holdout correct | Exact forward replay |
| --- | --- | ---: | ---: | ---: | --- |
| 1 | 7,9,13,4 | 1295 | 7 | 648/648 | yes |
| 2 | 11,17,3,18 | 1163 | 11 | 582/582 | yes |

True u ranks first in both. This demonstrates conditional scale recovery and latent-hold inference, not blind recovery of a,b,d. Cheap run-gate alone retains 16,832 and 1,933 triples on the respective plants; it is not a universally identifying attack.

## Larger consuming lags

Split each nonzero run into q interleaved lanes for mixed lag-q feedback. This necessary gate retains 4,367/19,172/23,271 triples at q=2/3/4, including 4,338/19,143/23,242 noncancellation triples. These are not demonstrated legal global inverses. Do not generalize the first-order theorem to longer lag. A future investigation would need a joint F-state queue constraint and a source-selected lag, not arbitrary retuning.

## Reproduction

Run `node sims/lp2_mixed_affine_consuming_fhold_exact_gate_sft.cjs` from repository root. The same function was executed against the canonical inputs in connected JavaScript, with exact result assertions in the standalone script. No GitHub Actions run claimed. All original unknown pages remain unresolved.
