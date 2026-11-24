# Source-motivated root-15 repeat-delimited radix gate

**Status:** intermediate negative. The receiver is fully reversible and uses a source-derived value, but it does not recover native prose from the original.

## Source selector and exact operation

The red-span triangle analysis derives q_A=15; 15 is a primitive root modulo 29, so its powers enumerate the 28 nonzero residues of F29. This gives a concrete source-motivated order for the 28 nonrepeat transitions. The red-span triangle is itself a derived structural hypothesis, and it does not explicitly instruct a discrete-log cipher; transferring q_A into this receiver is therefore a testable interpretation, not an authenticated key.

Freeze the receiver:

1. The first original ciphertext rune is the seed and is not emitted.
2. For each later rune, compute dᵢ=(Cᵢ−Cᵢ₋₁) mod29.
3. If dᵢ=0, use the repeated ciphertext rune as a block delimiter.
4. Otherwise set eᵢ=log₁₅(dᵢ), a digit in 0…27.
5. Convert each big-endian base-28 digit block to base-29 positional digits, preserving leading-zero count. Carry continuously across page boundaries; F is ordinary output data, with no transparent-F clock, key, salt or side channel.

The exact inverse converts each plaintext block base29→base28 with the same leading-zero rule, maps each digit e to 15ᵉ mod29, accumulates the resulting nonzero differences from the prior ciphertext rune, and inserts an equal ciphertext rune between blocks. The forward encoder is therefore explicit.

This is distinct from the already-tested GP-prime rank28 running-clock model that uses 15 as a clock. It is also distinct from the direct ordinal rank and from the auxiliary g=2 primitive-root control in the companion report.

## Original and native-control results

The inverse exactly re-encrypts all 12,956 original runes: seed GP15, 86 repeated-transition delimiters, 87 blocks, and 12,756 decoded candidate runes.

| Frozen original region | Complete blocks | Candidate runes | IoC | Native-GP trigram nats/rune | 128 within-block shuffle nulls ≥ actual |
|---|---:|---:|---:|---:|---:|
| p0–p2 | 4 | 642 | 0.03481223 | −3.43233768 | 55/128 |
| p16–p21 | 8 | 1,388 | 0.03420918 | −3.42278823 | 18/128 |
| Full unknown tape | 87 | 12,756 | 0.03448960 | −3.42830707 | — |

The trigram model is trained on seven of nine solved GP29 source sections, holding out WELCOME and the second KOAN. The shuffle null independently permutes the frozen discrete-log digits within each original block, preserving that block's digit multiset and length, then applies the same base-28→base-29 conversion; xorshift32 seed 3301 fixes the 128 shuffles.

The p0–p2 output is not distinguished from its null (55/128 shuffles score at least as well). The disjoint p16–p21 output is modestly above the null mean (−3.42279 versus −3.43143), but 18/128 shuffles still score at least as well. That is not a significant result, and the score remains far below the held-out native plaintext scores (WELCOME −2.77893; second KOAN −2.64870). Its first 120 transliterated p16–p21 symbols are UTISUIHSIAIAIJNGPRTMTDNUNMUYTHNGDWHSWYEOUMANGDEOHTHAESIAMAEDSXDIAEOIPTEORJBCBEOBTCEOAEYPWIJSTHXYFDPNGJAYUEOMSNGAAEWSBTHGXIWNGWJXUOEHRDIAYADIJEACGICR, not plausible prose.

The 515-rune WELCOME and 319-rune second KOAN native controls were each split into fixed 128-rune plaintext blocks, encoded with distinct public test seeds, then decoded and re-encoded exactly. Recovery is 515/515 and 319/319; the synthetic ciphertexts contain four and two repeat delimiters. This validates the inverse, not its historical use.

The g=2 least-primitive-root control is recorded separately: p0–p2 scores −3.42981087 with 43/128 shuffles at least as good; p16–p21 scores −3.43971625 with 113/128 at least as good. It also fails.

## Decision

Reject this root-15 discrete-log/base-conversion receiver. The p16–p21 enrichment is too weak to be a plaintext signal, and no natural language is visible. Do not test further primitive roots, signs, or radix permutations without a new independent source selector.

This does not close the wider enumerative issue. Fixed-length exact-repeat-mask coding needs 446 side-information bits, while the red/special-mark ceiling is at most 275 bits; however, word-boundary positions have 9,638 bits of combinatorial capacity. The remaining obstacle is a source-selected reversible mapping from those positions to the missing information, or an authenticated external sidecar. See the [root-2 control and original mark-carrier audit](lp2-repeat-delimited-primitive-root-radix-gate.md), and the [red-span triangle derivation](red-span-triangle.md).

## Reproduction

- node sims/lp2_repeat_delimited_root15_radix_sft.cjs
