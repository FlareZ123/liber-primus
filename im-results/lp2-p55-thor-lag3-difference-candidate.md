# P55's three-step ciphertext difference: an independent, provisional lead

**Agent21, 14 November 2026.** The independently observed p57 interior prime factorization `385=5×7×11` reads **TH–O–R**, a three-GP-rune candidate keyword. One classical single-layer use of a three-symbol seed is *ciphertext-autokey*: after the seed, each symbol is subtracted from the ciphertext symbol three positions earlier, modulo29. The original source p55 yields an unusual distribution. This is a potential mechanism clue, **not a decipherment**.

## Fixed operation on the original 76-rune p55

For consecutive original physical p55 GP indices `C[0..75]`, define `D[i] = (C[i]−C[i−3]) mod29` for i from3 to75. Exact source-shape outcomes:

| Original material | GP index of coincidence |
| --- | ---: |
| Untreated p55, 76 symbols | 0.037894736842 |
| **P55 lag-three difference, 73 symbols** | **0.052511415525** |
| Standard ciphertext-autokey p55 plaintext candidate with seed THOR indices [2,3,4], 76 symbols | 0.050526315789 |

The 17 original printed-word boundaries remain fixed when reading the direct THOR-seeded candidate:

```
M / OESEJ / AEW / WR / IAIATHMM / GAEEABWG / MEA /
TNGAEYJMTADWTWR / IAAJHIAG / MAEOB / RG / DGNGWAEAEN /
RNYPTGP / FR / MYBXGR / RGT / DWN
```

The output is **not readable GP-native prose**. The p55 word of length13 remains a highly constrained nonlexical symbol pattern under a simple substitution. The elevated IoC alone does not identify a key, alphabet permutation or authenticated original mechanism.

## Original-data counterexamples

Holding the **lag 3** and **76-source-rune window** frozen, enumerate every 76-contiguous-rune window entirely inside the other 55 physical encrypted pages p0–54 (excluding runeless p50). There are **8,839** windows. **Exactly one** has a lag-three difference IoC at least as high as p55: physical **p30, zero-based source window112**, with 0.053272450533. Most p55-sized starting windows are appreciably lower; even the maximum first-76-rune window outside p55 has 0.043759512938 (p52).

This is **a conditional rank, not a p-value**. These 8,839 windows overlap, the p55 segment and THOR source key were examined during many previous investigations, and a different lag family might also show large peaks. The original visual image and p57 language do not explicitly prescribe a lag-three ciphertext subtraction.

The independently known p56 original 85-rune ciphertext yields lag3 IoC0.038843721771, and clear p57's 95 runes yield 0.033444816054. These are different-length controls; none authorizes a p55 decoder.

## Decipherment decision

This fixed three-step difference is structurally unusual on the terminal p55 source and could be revisited if an independent instruction or a recoverable key selects a ciphertext-feedback inversion. **No page was decrypted;** unselected substitution layers or alternative seeds must not be introduced to rescue the coincidence. Earlier THOR historical strict-F and OutGuess password tests were negative: [source-key report](lp2-p57-interior-thor-key-gate.md).

**Reproduce:** `node sims/lp2_p55_thor_lag3_source_sft.cjs` from repository root. The standalone Node22 CommonJS file reads canonical original 29-symbol arrays, verifies the exact 76-rune source, recomputes all original candidate windows, and prints the full unchanged-boundary word readout.
