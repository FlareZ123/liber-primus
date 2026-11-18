# The solved p56 prime-totient cipher cannot cover original p0 with any one fixed transparent rune

**Decision (Agent7, 18 November 2026): bounded all-29 algebraic exclusion. No LP2 unknown plaintext, historical new key, or solution recovered.** The known p56 source cipher uses the Euler-totient sequence of ascending primes, modulo 29, plus a special literal plaintext **F** which emits unchanged and does not consume the prime clock. This experiment grants the same transparency privilege to **any fixed one of the 29 Gematria Primus symbols** and preserves every possible hidden skip state.

Both original p0 intervals fail for **all 29 possible transparent runes**: the complete 262-rune physical page and its independent 249-rune black body after the 13-rune red heading. Each begins its key clock at the first prime 2, the same source-start rule as p56. This is a necessary-cipher contradiction, not a language score or a fitted result. It rejects *this exact* direct transfer of the p56 mechanism under both natural p0 reading starts; it does not exclude other key clocks, page-dependent keys, layered systems, altered ciphertext, or a nontransparent stateful cipher.

## Motivated mechanism and immutable inputs

The creator actually used one distinctive plaintext-symbol exception on solved LP2 p56. An untested rescue of its direct use on p0 would assert that the unknown pages treat a **different GP rune** as the exception. Rather than guessing or fitting the exception from ciphertext, test *all 29* source-native possibilities in one exhaustive inverse.

- Original data: `resources/liber-primus/lp2-corpus.json`, physical pp0, 19, 55, 56 and the clear p57 GP source. Assert p0=262, p19=271, p55=76, p56=85, p57=95 rune indices and p0's first six original indices `[15,8,18,3,6,19]`.
- Fixed clock: primes 2, 3, 5, 7, ...; each consumed rune uses the shift `φ(prime)=prime−1 mod29`. Page/body starts reset to prime2. This uses the exact p56 forward sign, with no compensating phase search.
- Candidate symbol `R`: for each ciphertext `C_i` and every reachable consumed-prime count `k`, grant a **literal skip** when `C_i=R` (then `P_i=R`, and `k` is unchanged). Independently grant a **consuming inverse** `P_i=(C_i−φ(prime_k)) mod29` when that inferred plaintext is *not* `R`, advancing `k` to `k+1`. Retain both branches when both are feasible. The test declares failure only when **all** legal prime-clock states are exhausted.

This exact dynamic program permits arbitrary plaintext and *all* competing transparent skip histories; therefore a complete contradiction is stronger than a poor plaintext score.

## Frozen original outcomes

| Original interval, prime2 reset | Rune length | Markers yielding complete legal plaintext | Last first-impossible offset among all 29 |
| --- | ---: | ---: | ---: |
| Physical p0 including red13 | 262 | **0 / 29** | **243** (TH) |
| p0 black body alone, from physical offset13 | 249 | **0 / 29** | **205** (P) |
| p55 separately, exploratory control | 76 | **6 / 29** | Not applicable |
| p56 genuine known-positive | 85 | **7 / 29**, including F | Not applicable |

All first-impossible offsets are zero-based within the named interval. On p0 the authentic **F** marker survives until offset235, original 2014 missing-prime19 **W** only until offset5; the most persistent candidate **TH** fails at offset243. Under the red13-excluded body start, F fails already at offset43 while P lasts until offset205. The six complete p55 *feasibility-only* markers are TH, C, I, X, M and NG. The seven complete p56 feasibility-only markers are F, H, J, L, NG, AE and IA; the known solved plaintext independently selects F. **Feasibility is not evidence of a new decoded message**, as the multiple p56 survivors demonstrate.

## One reversed-page apparent survivor fails independent continuation

The p0 double-cross art also admits a low-cost opposite-reading control. Reading p0 ciphertext runes **in reverse physical order** while keeping exactly the same prime2-start φ clock and enumerating all 29 transparent markers leaves **NG as the only algebraically feasible marker** on both full p0 and its reversed black-only body. The complete reversed p0 has just two final legal consumed-prime clock states, **253 and 254**. This is a *post-selected structural survivor*, not source-authored key recovery. The resulting candidate index streams transliterate to nonsensical text (for example, they begin `GTHSEPNBUOUMSBDUNFPAEENG...`), and the same reversed-page NG rule fails the **independent physical p1** at zero-based rune offset **37** of 266. Therefore the reversed exception does not supply a reusable first-chapter or multi-page cipher and should not be promoted to unknown plaintext. The updated SFT locks all four observations.

## Correctness of the complete inverse

The [standalone Node.js 22 CommonJS SFT](../sims/lp2_p56_phi_all29_transparent_original_sft.cjs) prints the exact first-impossible offset for all 29 markers on four original physical pages and the black-only p0 body. For every marker, it encrypts an **original-source GP plaintext** (p57 repeated to the exact 262-rune p0 length) under a full deterministic lossless forward encoder and verifies that the inverse retains its true consumed-prime count after the complete message (**29/29 positive plants**). The authentic F choice on original p56 must remain feasible over all 85 runes, separately from the source-positive [85/85 actual p56 forward reconstruction](lp2-2014-missing-prime19-Wtransparent-original-cipher-gate.md). The script requires no dependencies or file writes.

## Research consequence

This removes all **29 fixed special-rune rescue choices** for transferring the unchanged p56 prime2-reset totient clock to the original p0 first chapter, including starting the clock only after its 13-rune rubric. Pursuing another marker alone cannot restore the complete inverse, regardless of word segmentation or secret skip history. A new attempt needs independent first-party evidence for a genuinely different clock, cipher layer or role of the written red heading, or an externally authenticated crib. The page55 surviving markers should not be upgraded to plaintext without that selector. This is intermediate research evidence and does not resolve Liber Primus.
