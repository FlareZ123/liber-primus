# P55 terminal moth quotation: all-affine shortest-recurrence original inversion

**Decision (21 November 2026, Agent44):** An exact reversible order-14 recurrence occurs for only one of 812 secret affine output alphabets when the last 30 original p55 runes are provisionally read as the solved LP1 moth-page quotation. **The unique order-14 fit fails the previously hidden 46-rune p55 prefix as plain GP29 English.** Independently sampled random suffixes yield equal or lower linear complexity in 121/192 cases. No original LP2 plaintext, author-selected key or cipher has been recovered.

## Source and proposed solve path

LP2 physical p55 reuses the original Cicada 3301 emblem that also appeared beside solved LP1 p05's **THE TOTIENT FUNCTION IS SACRED ALL THINGS**. The final seven whole printed words of original p55 have exactly the matching GP29 rune-length signature **[2,7,7,2,6,3,3]** (30 total). This is an appealing and *unverified* historical plaintext crib, not a source-selected statement that those p55 symbols decrypt to the LP1 quotation; the original emblem is also generic Cicada branding. The first 46 source runes are 10 complete p55 word positions with lengths **[1,4,2,2,6,6,2,13,6,4]**, held out of every fit. All p55 runes are taken from the canonical original image transcription.

Hypothesis: p55 uses a reversible **GP29 affine plaintext alphabet**, followed by an additive key stream governed by a short unknown linear recurrence,

`C_i = a·P_i + b + K_i (mod29)`, with unknown `a∈1..28`, `b∈0..28`.

From the assumed last 30 plaintext runes and actual corresponding ciphertext, each of **812** unknown affine pairs forces a different exact 30-rune key-residue suffix. Berlekamp–Massey finds its shortest homogeneous GF29 recurrence, with *all* recurrence coefficients inferred from the terminal 30 rather than prespecified from table patterns. For a nonsingular recurrence, invert it to extrapolate 46 original earlier key values, and attempt to decrypt the held-out prefix. The model is permissive and was selected to find a key if present; no 2014 source explicitly specifies recurrence order 14, an affine layer or resets.

## Exact original output

Across all 812 candidate hidden affine alphabets:

| Shortest recurrence order | Number |
| --- | ---: |
| 14 | **1** |
| 15 | 785 |
| 16 | 26 |
| 13 or less | **0** |

The unique order-14 candidate is `(a,b)=(20,8)`, with connection polynomial coefficients in ascending order:

`[1,22,11,27,25,21,21,21,4,8,26,9,6,3,2]`.

The last coefficient 2 is invertible in GF29, fixing **every earlier key residue** without fitting or guessing any of the 46 unknown plaintext runes. The exact forward reconstruction of all 76 ciphertext runes passes.

The original untouched p55 46-rune prefix then decrypts into ten boundary-preserving GP29 word tokens:

```text
EA  LWFD  JB  MF  NHNIAOOE  ASGEABJ  DTH  EWAETHOEYFGIMAEIAL  FOEEOOEEH  EOUTB
```

These do not form recognizable native English or a compelling historical Cicada phrase. All seven assumed final words replay by construction and cannot count as evidence of recovery. The word-initial singleton p55 segment may continue from earlier text, but the other nine decoded tokens are independent complete p55 words, and the result clearly fails to convey an intelligible continuation.

An entirely independent *positive* GP29 plant encrypts 76 native-orthography runes using an order-14 recurrence with a different frozen nonzero polynomial, then infers the recurrence from **only the final 30** plaintext/ciphertext pairs and reconstructs the first **46/46** withheld runes. It recovers the full **76/76** planted plaintext, demonstrating the experiment could succeed under the proposed mechanism.

### Why order 14 is not evidence

A preregistered-in-code reproducible comparator samples 192 independent 30-rune random ciphertext suffixes using the fixed xorshift32 seed `0x5514a330`. It repeats the *entire 812-affine-pair search* and counts the minimum recurrence order, without selecting any extra cribs. **121/192** independent random suffixes have a minimum at order14, and **71/192** have a minimum at order15 or higher; none at order13 or below. Exactly one order14 alphabet occurred in **66/192** controls. The original observed order14 and one candidate are therefore ordinary familywise outcomes, not cryptanalytic evidence for the source quotation or key architecture.

## Decision and future constraint

This is a complete tested **conditional known-crib inversion** of all stationary-affine, single-homogeneous-recurrence proposals that are allowed to fit the shortest Berlekamp–Massey key suffix. It returns gibberish in an untouched 46-rune region; **do not promote** the order14 solution, original LP1 quotation crib, or p55 plaintext. Other nonlinear/externally keyed/state-resetting mechanisms are untested. Reopen this source route only when an independent image or historical instruction selects an actual key generator, crib origin, cipher polarity or other predictive operation.

**Reproducer:** [SFT](../sims/lp2_p55_moth_crib_affine_bm14_source_sft.cjs) · [Windows 11 Node22 successful run 44959263156](https://github.com/FlareZ123/liber-primus/actions/runs/44959263156). The original-corpus alignment, GP29 quote spelling, full 812 affine enumeration, invertible recurrence, exact original 46-rune holdout, 76/76 forward replay, positive plant and random comparator are asserted in one read-only test.
