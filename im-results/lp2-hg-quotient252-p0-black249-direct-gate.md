# Original H×G quotient252 as a p0 249-rune page-local key: finite negative

**Agent4, 22 November 2026. Classification: source-constrained reversible original-cipher test, negative for all eight predeclared direct GP29 pad readings. No new plaintext or source-authored cipher.**

## A new independently meaningful recipient

The entire **256-cell** physical p49–51 numeric table is an exact GF29 polynomial multiple of the product of two source-authenticated objects: the historical 2013 Cicada signed BASE29 example H and physical p39 red three-rune G. With high-to-low coefficients they are

```text
H = [24,26,3]                  (2013 3QO, ascending [3,26,24])
G = [15,5,27]                  (original p39 red, ascending [27,5,15])
HG = [12,17,11,21,23], degree4
P[0..255] = table's 256 source base60 bytes modulo29
P mod HG = 0
Q = P / HG, exactly 252 GP29 coefficients
```

The quotient's 252 length is established independently of any p0 ciphertext. A separately image-adjudicated source object, physical p0's 13-rune red heading followed by **249 complete black-body runes**, gives **252 = 249 + 3**. The three spare coefficients offer a potential match to the manuscript's original 3-rune red inscriptions (p3 and p39) and signed BASE29 H's three source coefficients. This is a **proposed recipient and three-field interpretation**, not an authenticated original instruction.

The direct, low-cost plaintext test is therefore to take the entire 249-rune p0 black body as ciphertext, and the original quotient's first249 or last249 GP29 coefficients as one unmodified page-local additive key. The alternative spare-three placement is exact; no source warrants moving the boundary elsewhere. Permit only the conventional two source directions and both additive signs, giving **2×2×2=8 whole-body, reversible inverses**.

## Original, no-fitted-key result

All eight outputs are 249 runes; their keys are fully determined before examining source p0 symbols. They exactly reconstruct the original ciphertext on forward reencryption. They also each pass a **95/95 genuine solved-p57** encrypt/decrypt plant under their own key bytes.

| Q252 used as 249-key | Key order | GP29 sign | Output IoC |
|---|---|---:|---:|
| First249, spare last3 | Normal | Subtract | 0.03335924 |
| First249, spare last3 | Normal | Add | 0.03216090 |
| First249, spare last3 | Reversed | Subtract | 0.03471952 |
| First249, spare last3 | Reversed | Add | 0.03358596 |
| Last249, spare first3 | Normal | Subtract | 0.03504340 |
| Last249, spare first3 | Normal | Add | 0.03426610 |
| Last249, spare first3 | Reversed | Subtract | 0.03390983 |
| Last249, spare first3 | Reversed | Add | 0.03468714 |

The untouched p0 black ciphertext's GP29 IoC is **0.03436326**, while authentic solved p57 GP29 prose has **0.06270997**. Every proposed output remains near the uniform 29-symbol rate **1/29**; all eight full beginning excerpts are printed by the reproducer and none forms coherent GP-native prose.

Exact source polynomial division and forward multiplication both hold without external libraries; the quotient's pinned 20-coefficient prefix agrees with the previous independent source construction. This is an original-cipher negative rather than an arithmetic nonfit or tuning failure.

## Research decision

The quotient252 to p0 black249 fit is **a possible physical-key coupling**, but its simplest completely specified additive consumer fails. The historical BASE29/H and manuscript G polynomial factors remain exact; this test neither questions them nor turns them into plaintext. The 252/249/3 relationship by itself cannot justify guessing coefficient rotations, nonlinear paddings, other receivers or additional cipher layers. Continue only if the original artifact provides a missing, *selective and reversible* quotient-to-rune transform that would decode an untouched passage.

**Reproduction:** [Windows Node22 CJS](../sims/lp2_q252_p0_black249_gp29_pad_sft.cjs), [PASS 44965632620](https://github.com/FlareZ123/liber-primus/actions/runs/44965632620). Inputs: canonical original numeric grid, original p0 GP29 corpus and image-backed physical p0 red13 ink override, plus known solved p57 control. Prior independent source factorizations: [full p50 polynomial](lp2-grid-complete-gf29-factorization.md), [4-node graph/HG parity bridge](lp2-p50-graph-basin4-hg-parity-reconstruction.md).
