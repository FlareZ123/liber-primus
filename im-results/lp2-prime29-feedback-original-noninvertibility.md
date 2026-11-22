# Original GP29 prime-residue delta: exact all-secret noninjectivity

**22 November 2026, Agent45. Classification: exact finite mathematical obstruction to one cryptographic mechanism, plus authentic original-corpus control. No original unknown plaintext or creator key.**

## Cipher family and independent original clue

The original Gematria Primus chart assigns 29 runes the consecutive primes 2 through 109. Solved LP1 emphasizes primes, and the later p56 decryption makes a modulo29 prime/totient cipher historically plausible. One candidate low-state transducer could attempt the direct source-prime encoding

```text
C[-1] = 0
C[i] = C[i-1] + a[i] * prime(P[i]) (mod 29)
```

where every `a[i]` is an **arbitrary private nonzero element of GF(29)**. This gives more freedom than a normal keyed stream. No author source specifically prescribes this operation; its purpose is a finite all-secret decision, not blind key fitting.

### Exact collision obstruction

Published GP29 primes reduce modulo29 to **only 24 distinct outputs**. The four complete collision classes are:

| residue mod29 | source GP29 runes |
| ---: | --- |
| 2 | F (prime2), I (prime31), D (prime89) |
| 3 | U (prime3), B (prime61) |
| 13 | C (prime13), M (prime71) |
| 14 | P (prime43), AE (prime101) |

The five residues 4, 6, 26, 27, 28 have no preimage. Only native GP **N**, whose weight is prime29, maps to zero.

Multiplying by **any** nonzero private `a[i]` permutes residues, retaining all four collisions. Therefore even if *every* private coefficient and the entire preceding ciphertext were available, the per-rune map is **not injective**, and the source GP29 plaintext cannot in general be uniquely reconstructed. For a direct constructive witness, plaintexts FFFFFFF and IIIIIII both encrypt to `[2,6,12,22,9,6,19]` under exact same secret coefficients `[1,2,3,5,8,13,21]`, with seven different original GP runes yielding identical complete ciphertext. This is a mathematical exclusion of the standalone cipher family across **all 28^12956 coefficient streams** (given the original target length), independent of English language models or fitted keys.

A decoder would require **separately source-recoverable disambiguation information**, a different bijective prime operator, or a preprocessing layer changing the alphabet. None is supplied by this finite model.

### Original-language necessary condition, secondary to noninjectivity

Because prime29 for N alone has zero residue, in this model `C[i]=C[i-1]` if and only if `P[i]=N`, regardless of private nonzero coefficients. The untouched original p0–55 manuscript has exactly **86 adjacent equal ciphertext pairs among 12,955 edges**. A corresponding direct plaintext would have exactly86 native N runes after the first position. The genuinely printed-clear original LP1 material p3, p8–p11 and p14 contains **64 N in 1,001 GP runes**, or ~6.39%; on a 12,956-rune comparably written native GP text that rate would give ~829 N. This large discrepancy is descriptive, not a universal impossibility for atypical prose; the complete noninjectivity proof already excludes standalone reversible source-GP29 coding.

The separately computed word-length-matched Shakespeare/Gibran/Emerson controls reported in [Issue #2083](https://github.com/FlareZ123/liber-primus/issues/2083) place N frequencies in original-length 12,956-rune registers at 742–1,014 across 1,500 source-authored samples, none anywhere near86. Only the exact source-prime collapse constitutes the rigorous all-key theorem.

## Reproducer and scope

Read-only, no network, CommonJS Node22 [SFT](../sims/lp2_prime29_feedback_injectivity_original_sft.cjs) reads canonical `resources/liber-primus/lp2-corpus.json` and `resources/transcriptions/lp1_wulfic_canonical.txt`, asserts all 29 published original rune weights, the four precise collisions, all five missing residues, every one of 28 nonzero multiplier values, the original ciphertext 12,956/86 count, original solved LP1 control 1,001/64, and the explicitly colliding seven-rune positive. The exact committed CJS source was retrieved from GitHub and directly executed against the original GitHub file bytes; **all assertions passed**, with full printed witness. [Discussion and correction to earlier overstated invertibility](https://github.com/FlareZ123/liber-primus/issues/2083#issuecomment-7081699059).

**Decision:** Retire direct prime-value-mod29 predecessor feedback as a self-contained reversible cipher. The ordinal-based `P+1` variant has a different bijective operation and therefore does not inherit this noninjectivity; its predicted plaintext EA placement was separately tested and found linguistically problematic, but is not mathematically excluded solely by this argument. No new LP2 plaintext, authentic key, or decrypted destination was found.
