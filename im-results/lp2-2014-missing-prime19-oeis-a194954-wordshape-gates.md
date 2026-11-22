# 2014 omitted prime 19: word-position test and source-derived direct-key gate

## Original clue and testable route

The [preserved 2014 signed Cicada stage11 message](../resources/historical/cicada2014-stage11-message.asc) displays prime-length blanks **2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37**, omitting **19**. The 5 is an internal indentation before the onion URL; the other ten values are trailing spaces. **Trailing whitespace is not authenticated** by the OpenPGP cleartext signature. The missing prime 19 is the Gematria Primus prime assigned to **ᚹ (W)**. The earlier [original W-transparent prime/totient decision](lp2-2014-missing-prime19-Wtransparent-original-cipher-gate.md) already proves its fixed p56-style transfer algebraically impossible by p0 rune6, irrespective of plaintext-word frequencies. This complementary test removes the need to assume that particular additive key, prime clock, or cipher family: it checks the unavoidable **word-position consequences of any bijective, boundary-preserving W-transparent encoder**.

If all plaintext W symbols remain W and no other symbol becomes W, word-initial and word-final W frequencies must be inherited from the plaintext. The original transcription's 55 encrypted runic pages p0–p55 (p50 contains no runes) match the canonical 12,956-rune ciphertext exactly. After joining visual line wraps **and the 32 genuine cross-page word continuations** and splitting only at marked punctuation/word-dot separators there are **2,896 complete words**. Splitting mechanically at page boundaries would create 32 artificial word groups and subtly bias terminal-W counts. Nine genuinely solved GP sections have **740** rune-word groups and **2,979** runes.

| Invariant | LP2 unknown ciphertext | Genuine solved GP plaintext |
|---|---:|---:|
| Initial W | 82 / 2,896 = **2.83%** | 79 / 740 = **10.68%** |
| Final W | 98 / 2,896 = **3.38%** | 8 / 740 = **1.08%** |
| All W | 401 / 12,956 = **3.10%** | 98 / 2,979 = **3.29%** |

Exact two-sided Fisher tests give initial-W **p = 1.1566×10⁻¹⁶**, final-W **p = 0.00034776**, and all-position-W **p = 0.59949**. Thus the tempting overall W-frequency agreement conceals severe word-position disagreement. Three separately retained English prose controls support an English-like initial-W rate well above the ciphertext: Shakespeare **6.87%** (55,407 words), Gibran **6.78%** (15,733), and Emerson **6.44%** (77,932); their terminal-W rates are 1.22%, 0.99%, and 1.04% respectively. A synthetic exact GP28 non-W substitution that leaves W untouched correctly preserves all three original GP plaintext W counts and positions.

**Decision:** under the conditional assumptions of preserved printed word segmentation and GP-native English, the historical omitted-19 clue is inconsistent with a universal *transparent W* cipher, even though arbitrary cipher keys are allowed. Other languages, a non-literal separator scheme, a nonbijective W mapping, or an independent text layer can evade this conclusion. This does **not** recover ciphertext plaintext.

Reproducer: [`sims/lp2_2014_missing_w_source_wordshape_sft.cjs`](../sims/lp2_2014_missing_w_source_wordshape_sft.cjs), with exact source flattening and all 32 cross-page complete-word joins and positive W-preserving plant.

## Source-extrapolated A194954 keystream

The above eleven primes equal the start of [OEIS A194954](https://oeis.org/A194954), observed already in a [2015 community inventory](https://github.com/scream314/cicada3301/blob/master/hints_never_used.md#messagetxtasc-2014). The independent recurrence defines a(1)=2, then selects the least larger prime whose difference from the preceding prime is a positive multiple of popcount(n−1). It predicts **43** after 37. It is a **possible** historically visible key stream, without a source-selected deciphering operation; the eleven-term match is not unique evidence of author intent.

The direct A194954-derived family was previously tested at original chapter boundaries with the authentic plaintext-F rule in [the 18 November recurrence decision](lp2-2014-a194954-recursive-prime-original-inverse.md), including the gap and binary-popcount streams. This 30-model extension adds page/global clocks, both additive signs and native-solved positive controls. It **corroborates an existing negative**, rather than identifying a new source-selected candidate cipher.

The first **12,956** terms terminate in a(12956)=**641057**. We tested exactly five recurrence-derived masks (a(n), totient(a(n)), prime gap, gap divided by bitcount(n−1), and bitcount(n)) with both GP29 additive signs, on three clock conventions (continuous, illustrated-chapter reset, page reset). These **30** fixed original-input direct inverses were checked against exact inverse round-trips and a 2,979-rune authentic native-GP plant.

Raw LP2 index of coincidence is **0.03447840**. The authentic solved GP source is **0.06138673**. Across all source-derived inverses the **maximum full-book IoC is 0.03453055** and the largest value on any of four independent contiguous sections (p0–2, p8–14, p16–22, p40–55) is **0.03515868**. No candidate has native-GP frequency structure or readable plaintext.

Reproducer: [`sims/lp2_2014_signed_a194954_direct_inverse_sft.cjs`](../sims/lp2_2014_signed_a194954_direct_inverse_sft.cjs).

## Next research decision

The printed omitted-prime clue is worth remembering, but it does not select a working original decryption under the tested mechanisms. A productive successor needs an **independent instruction specifying the sequence's actual receiver or cipher operation**, or evidence that printed GP boundaries do not correspond to plaintext boundaries. Exhausting more unconstrained phases and masks would not advance that decision. These are conditional intermediate exclusions, with **no plaintext or authentic key recovered**.
