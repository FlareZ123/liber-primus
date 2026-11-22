# DH73 as the authentic p56 prime-clock initializer: complete original-input exclusion

**Decision (17 November 2026):** The new p57/2013-parable/table candidate shared secret **73**, treated literally as the first prime in the historically solved **p56 successive-prime totient/F-transparent** cipher, cannot decode the original p55 76-rune ciphertext or the complete p54–55 308-rune chapter. Both additive signs have **zero legal full inverses**, with an exact local first contradiction. No unknown plaintext, creator-authenticated key, or destination is recovered.

## Causal input and exact hypothesis

Agent44's [source-native PARABLE/DH73 construction](../sims/lp2_p57_primeordinal_dh73_source_sft.cjs) derives a provisional **K=73** from the authentic 2013 PARABLE and source p57 body-clause GP-prime ranks [205,173,201]. Interpreted as zero-based p49–51 table cells under an *unselected f-omitting base59* alphabet, they yield [75,115,73]. A stronger direct arithmetic route uses table value **115** at row **21**, and source p57 word `OUR` GP-prime sum **21**, to give **115^21 mod151 = 73** with 151 the source `FIND` GP sum; the earlier b=13 discrete-log parameter is **not needed** to reproduce K73. See Agent44's [corrected contemporaneous handoff](../communications/broadcast/20261117T185133Z_agent44_DH73-row21-no-b13-sourcekey.md). The speculative steps remain the ordinal→zero-based coordinate convention, radix59 instead of conventional radix60, row-as-exponent, and the missing original LP2 receiver. This exact inverse test is independent of which upstream route produced 73.

One short operation is already historical and reversible: the solved p56 ciphertext uses the consecutive-prime key `phi(prime)=prime-1` modulo29, and a plaintext GP **F** (value zero) is transmitted **literally** as F without consuming a prime. This test freezes just one additional interpretation: use candidate 73 as the **starting prime value**, yielding prime sequence 73,79,83,... . The original ciphertext is never changed and page indices are physical LP2 p54/p55, in canonical GP29 order. We test both shift signs, and separately freeze the p55 start and the natural entire p54–55 marked-chapter start. The cipher is treated as **one layer**, no arbitrary resetting, extra alphabet, guessed plaintext or crib.

The legal inverse is exact. At ciphertext rune `C_i` and consumed-prime index `k`, either `P_i=(C_i ± (prime[k]-1)) mod29`, consuming a prime, **provided P_i != F**, or, only if `C_i=F`, `P_i=F` and `k` does not advance. Every possible F branch is retained.

| Original input | Shift sign in inverse | First impossible original rune offset, zero-based | Complete legal paths |
| --- | ---: | ---: | ---: |
| p55 (76) | + | 64 | 0 |
| p55 (76) | − | 32 | 0 |
| p54+p55 (308) | + | 6 | 0 |
| p54+p55 (308) | − | 31 | 0 |

This is an algebraic **F-transparency contradiction**, not a language-model threshold. Once a non-F ciphertext rune necessarily inverse-shifts to F, the alleged original cipher could not have emitted it. For p55 the actual three ciphertext F positions are 15,25,41. Branching over their skip/encrypted meanings cannot repair the later forced contradictions. The two chapter cases fail within p54.

## Positive controls, reproducibility and scope

The [read-only Windows Node22 single-file test](../sims/lp2_dh73_p56_ftransparent_original_gate_sft.cjs) asserts the exact corpus page lengths and all four offsets. For each sign it encrypts the **first 76 authentic clear p57 runes** using the same 73-start F-transparent rule, exhaustively inverts the resulting ciphertext, and confirms full true plaintext recovery 76/76. Both plants pass. [Manual Windows Actions run 44150715377](https://github.com/FlareZ123/liber-primus/actions/runs/44150715377) completed **success**; all original contradictions and positive controls passed.

**Implication:** The recently derived provisional DH73 value does not transfer to p55 through the solved p56 prime-totient operation under this literal start-value convention. A different source-selected serialization or historical receiver might still use 73, but must supply an independent rule and make a plaintext prediction. Do not rescue this failed exact mode with secret F masks, post-hoc prime phases, or a new second layer without first-party evidence.
