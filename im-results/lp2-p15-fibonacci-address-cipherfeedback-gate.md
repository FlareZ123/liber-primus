# p15 Fibonacci-addressed consuming ciphertext autokey: exact original gate

**Agent50, 25 November 2026.** Nonclaiming sibling of Director [#2698](https://github.com/FlareZ123/liber-primus/issues/2698), which investigates plaintext feedback. No unknown plaintext or authentic key recovered.

## Fixed source and inverse

The original p15 image (32.jpg) supplies the 16-number Fibonacci-prime spiral with ordinals 0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987. The tested rival borrows the largest-Fibonacci lag and eight-symbol primer from #2698 and authentic transparent plaintext F. On consuming index j<8, C=P+K[j] mod29 with independent unknown primer symbols. For j>=8, C=P+C[j-L(j)] mod29, where L(j) is the largest positive listed ordinal <=j; the referenced ciphertext is from the consuming history. Plaintext F emits ciphertext zero without advancing that history. No first-party instruction selects this feedback operand or primer length.

This is different from the [earlier two-register Fibonacci ciphertext-feedback recurrence](lp2-p15-fibonacci-cipherfeedback-original-gate.md). Freeze the actual 1,883-rune continuous p15–22 tape beginning at p15 offset20 (first black rune after the second red rubric); the p15 development is 139 runes. Corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165. The black-body start was inspected on the supplied original image.

Every visible zero can hold or consume; nonzero ciphertext must consume. For the first eight consuming positions any hold history has a feasible primer: set K[j]=C[j]-1 mod29, giving nonzero P=1. Later states depend only on the consuming ciphertext, so this existential choice loses no possible primer. Reject a consuming path when C equals its addressed prior ciphertext, forcing forbidden consuming plaintext F. No dictionary, language score, beam, or state cap is involved in the original rejection.

| Physical tape offset (0-based) | Histories remaining |
|---:|---:|
| 7 | 2 |
| 46 | 2 |
| 66 | 4 |
| 76 | 6 |
| 129 | 4 |
| 138 (end of p15) | 2 |
| 194 | 2 |
| 203 | 1 |
| 204 | 0 |

At p15 end the held sets are [7,46,76] and [7,66,76]. At offset203 only [7,46,76,194] remains. At offset204 (66th rune of p16), the active index is 200, lag144, prior active index56 = physical offset58. Both ciphertext values are 8. The inverse forces P=0 (F), but the current ciphertext is nonzero and cannot be a literal F hold. All 29^8 possible primers are therefore excluded for this exact law. Maximum six histories.

## Native controls and decision

Three separately keyed 339-rune plants use rotated repeats of clear p57, with the correct primer supplied to the control decoder. Literal F counts 10/12/11; consuming ciphertext zero counts 10/10/9. The three true histories survive, replaying 1,017/1,017 runes. Final history counts 38/216/3360 show that this is a feasibility control, not blind or unique primer recovery. The fixtures share one solved source text. The original and control enumeration ran in connected JavaScript; [standalone CJS reproducer](../sims/lp2_p15_fibonacci_address_cipherfeedback_sft.cjs). No Windows CI run is claimed.

Retire this direct ciphertext-addressed, additive, phase-zero receiver under the authentic F rule. Do not tune lag, sign or clock after observing failure. The distinct plaintext-addressed #2698 remains open. No new original plaintext, key, or intended operation.
