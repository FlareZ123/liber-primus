# Exact p56 prime/totient physical-line reset transfer

**Status: bounded negative**  
**Issue:** [#1527](https://github.com/FlareZ123/liber-primus/issues/1527)  
**Reproducer:** [sims/lp2_p56_phi_physical_line_reset_sft.cjs](../sims/lp2_p56_phi_physical_line_reset_sft.cjs)  
**Source selector:** [finite prime_echo terminal-boundary result](./lp2-primeecho-terminal-duplicate-mapline.md)

## Frozen operation

This tests exactly one source-motivated transfer: reuse the solved p56 cipher on p0–55, resetting its prime cursor to the solved-p56 initial state at the first rune of every original physical printed line.

- Forward rule: \(C=P+\varphi(p_j)\pmod{29}\).
- The authentic p56 prime sequence starts at \(p_0=2\).
- Plaintext GP rune F (index 0) is transparent: it emits ciphertext F and consumes no prime.
- Every non-F plaintext rune consumes the next prime.
- Inverse handling of ciphertext F considers both possibilities: literal transparent F, or a consumed key step only if it produces a non-F plaintext rune.
- No alternate start, sign, F rule, reversed line, page/chapter carry, phase scan, or second layer is admitted.

The transcription is split at its original % page separators and physical newlines. Every p0–55 page is checked against the canonical corpus rune sequence before line-level analysis; no rune order or line boundary is inferred from a language model.

## Positive controls

1. **Solved p56, continuous sequence:** the known 85-rune plaintext forward-encrypts to the original 85-rune p56 ciphertext exactly. The five ciphertext-F positions are zero-based [35,47,51,56,74]; the known inverse uses transparent mask 8 and consumes 84 prime values. This is the original solved-p56 behavior, not a line-reset variant.
2. **Source-shaped multi-line plant:** the same known plaintext is repeated to 170 runes and split using p56's original physical line lengths [20,19,6,22,18] twice. With a fresh p56 start state at each of the ten lines, the inverse recovers all 170 runes and forward-reencrypts each line exactly. The plant exercises both literal-F transparency and non-F plaintext that encrypts to ciphertext F.

These controls establish that the frozen implementation handles the known p56 cipher and the proposed line-reset rule when that rule is actually used.

## Original p0–55 result

| Measure | Result |
| --- | ---: |
| Original unknown runes | 12,956 |
| Rune-bearing physical lines | 594 |
| Lines with at least one legal inverse path | 351 |
| Lines with no legal inverse path | **243** |
| Total legal per-line paths across the corpus | 626 |
| First impossible line | p0, rune-bearing line 10 |

A line is legal only if at least one complete assignment of the ciphertext-F transparent/consumed branches produces a plaintext that obeys the exact p56 rule. Every accepted path is checked by forward re-encryption. There is no scoring, key fitting, or plaintext guess in this test.

### Direct obstruction at the source-selected p55 boundary

The p55 rune-bearing line 3 is the physical line immediately before the line3/line4 boundary selected by the finite prime_echo analysis. It has 22 runes and **zero ciphertext-F positions**, so there is no transparent-branch ambiguity anywhere on this line.

At its fifth rune:

- ciphertext GP index \(C_5=10\);
- the fifth prime is \(p_5=11\);
- \(\varphi(11)=10\);
- the inverse therefore gives \(P_5=10-10\equiv0\pmod{29}\), plaintext F.

That is impossible: plaintext F must be emitted as ciphertext F without consuming a prime, but the observed fifth ciphertext rune is index 10. The exact line-reset model therefore fails on the very p55 line that precedes the source-selected boundary. Across all p0–55 pages, 243 of 594 lines have the same kind of complete-path obstruction.

## Decision

**Reject only the exact every-physical-line reset transfer of the solved p56 prime/totient cipher.** The finite prime_echo source still selects a real p55 physical line boundary, but that boundary does not make this particular p56 consumer viable. The negative does not decide whether some other source-authenticated operation uses the boundary; it supplies no plaintext or key.

Do not rescue this family with new cursor starts, signs, F semantics, reversed lines, page resets, or fitted phases. Any different operation requires an independent source selector and a separately frozen test.
