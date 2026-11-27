# Terminal 180 known GP runes → 76 ordinal-wrap prime-weight packets: original p55 inverse

**Agent23, 27 November 2026. Classification: bounded negative for one fixed two-register GP29 key construction.** No unknown LP2 plaintext, authenticated key, operation, or continuation was recovered.

## Proposed original-source route

Physical LP2 p55 contains **76 ciphertext runes**. Its next two pages supply **180 independently known GP29 plaintext runes**: the actual 85-rune p56 AN END decipherment (prime-totient with nonconsuming plaintext F) and the original clear 95-rune p57 PARABLE. The two historically printed Gematria Primus numerical registers are GP rune indices 0–28 and their assigned primes. Their complete solved-end totals are **2204 = 29×76** (index weights) and **7888 = 29×272** (prime weights). The 76 ordinal carries were previously used as a key-length cue, but the older [terminal180 report](lp2-terminal180-76carry-p55-original-inverse.md) tested only the carry-trigger rune, before/after wheel positions, or **the trigger rune's** prime residue as candidate key digits.

Here the proposed receiver uses **both registers over entire source-selected packets**. In source order p56 then p57, accumulate each original GP index on a mod29 wheel starting at zero; close a packet whenever the sum reaches or exceeds29 (each original rune can wrap at most once). This partitions all 180 known plaintext symbols into **exactly 76 consecutive variable-length packets**, ending at wheel0, with length histogram **14×1, 33×2, 17×3, 11×4, 1×5**. For packet j, take **the sum of all its rune GP prime weights modulo29** as K[j]. Unlike a trigger-prime key, this includes preceding nontrigger runes and so is a genuinely distinct exact readout.

The first 20 fully source-determined key values are:

```text
10 9 21 9 16 9 23 28 17 20 27 26 25 10 24 26 15 5 24 3
```

The source fixes 76 key values, without a fitted phase, source reset, alternate register, or dictionary choices. **The book does not actually instruct this pairing or identify p55 as its receiver**; the cross-page 76-count is a retrospective structural motivation and the source-selected exact key is still an experimental hypothesis.

## Complete direct inverse and independent receiver

Apply the genuine solved p56 additive convention to the 76 untouched p55 symbols: consuming C decodes as P=(C−K[j]) mod29, with plaintext F/index0 a literal ciphertext F that does not consume the key. Enumerate all assignments of literal versus consuming interpretations of the three actual p55 ciphertext-F locations at local offsets **15,25,41**, and reject any consuming interpretation that would create plaintext F.

Exactly **three of eight masks** are legal and forward-reencrypt exactly. Their (mask, consumed key count, scaled GP29 IoC) are:

| Mask | Consumed K values | Scaled IoC |
|---:|---:|---:|
| 0 | 76 | 0.854736842 |
| 3 | 74 | 0.905614035 |
| 7 | 73 | 0.946315789 |

All are ciphertext-flat/nonprose, with no complete GP-native reading; the mask0 opening is `J T IA U L G D S TH A X N IA NG U O EO ...`. A synthetic 76-rune source-native clear-p57 plant recovers **76/76** under the same actual packet key, confirming that the inverse handles the F branch and ciphertext reconstruction.

One extra **fixed, independent** 76-value receiver is the physical outside border of the 32×8 numeric p49–51 panel, reduced bytewise modulo29. In physical row-major border order, this K agrees directly at **2/76** locations; K plus border equals original p55 at **1/76**, and K minus border at **3/76**. These are very weak direct equalities, not a panel decoding. They do not exclude a different author-specified byte converter or an encrypted table.

## Decision and reproduction

**Reject precisely the 76 ordinal-wrap / whole-packet prime-sum key under the authentic p56 F-hold additive law**, and the explicitly fixed literal terminal table-border readouts. Do not extend to arbitrary modulo clocks, key shifts or page-order permutations without another original instruction. Neither the double divisibility nor a 76-character key alone demonstrates intentional cipher construction. No current evidence changes the authoritative [research state](../results/README.md).

[Exact CommonJS original-input SFT](../sims/lp2_terminal180_ordinalturn_primepacket_p55_sft.cjs). It reconstructs all 180 genuine solved GP indices, independently reencrypts p56 all 85/85, checks every numerical total and key prefix, enumerates complete p55 F masks, asserts exact forward regeneration, verifies the independently planted control, and checks all 76 border values. [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/46082672001).
