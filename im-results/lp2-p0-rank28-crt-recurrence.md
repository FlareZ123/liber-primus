# Opening-title constrained successor-rank recurrence over Z/28Z

**Agent 6, 26 November 2026.** Conditional calibrated original-cipher negative; no unknown plaintext or authenticated key. This tests a nonperiodic successor-rank key, distinct from the earlier repeated 12/13-symbol key and additive GF29 recurrence.

## Receiver

Physical p0 has the red 8+5 title and 13-dot mark. The signed 2016 EPIPHANY SEEKS phrase has that native GP29 length; it is a conjectural crib. The 86 adjacent equalities motivate a successor-exclusion transport; the solved p15 Fibonacci-prime spiral motivates short recurrence exploration. No author instruction selects the combined receiver.

Use the canonical p0–2 tape (262+266+201=729 runes), first ciphertext rune as public IV and its presumed plaintext E. Let d=(C[i]-C[i-1]) mod29. A zero difference emits one fixed unknown plaintext escape e; otherwise q=(d-1-K[t]) mod28 and P is canonical GP29 rank q after removing e. Encryption adds 1+((rank(P)+K[t]) mod28) to previous C mod29; e emits previous C. Test both key consumption and key hold at e. The title has no ciphertext equalities; each of the 20 escape symbols absent from the title determines an exact 12-digit shift prefix.

Key recurrence K[t]=sum(a[j]*K[t-1-j]) mod28, all coefficients 0..27 and orders1–7. Solve all prefix equations over GF7 and GF2, lift every mod2 solution x to x+2y mod4 by A*y=(b-A*x)/2 mod2, combine by CRT. Independently substitute each coefficient vector; order1/2 toy systems agree with brute force. Z/28Z is not treated as a field.

Select the highest smoothed Shakespeare GP29 trigram score on the 249 black p0 runes. Freeze the receiver and report the 467-rune p1–2 continuation. Ignore printed separators; no phase/sign tuning. The separate all-candidate best-held score is explicitly a hindsight diagnostic.

## Original result

| Order | Compatible vectors over all escape choices |
|---:|---:|
| 1–5 | 0 each |
| 6 | 22 |
| 7 | 11,760 |

Both clocks yield 23,564 receiver evaluations, including equivalent parameterizations. The best-p0 receiver e=IA (27), order7 coefficients [4,18,20,7,2,23,6], hold, prefix [8,27,0,22,16,26,3,27,20,2,25,25] scores -5.626613 p0 and -5.909629 held (nats/rune, higher better); held IoC .03505160. Even the hindsight-best held score is -5.734657. Frozen output begins CYISNEOEAEAREACLEAOEEACHWNGFOEGOENGYOAWFLSWOEYJTNJBLNGNGTHEOIDENIEONGLEOAEEFWSAROBSBPGEATHROOENGULMPDNTHDPTNGAEXMMEOMNDBOEHEEOEAO. NG (21) has no order1–7 compatible vector; EA (28) has 784 order7 vectors, all tested. Each best-so-far receiver replays the source exactly, and every candidate reproduces the imposed title by construction.

## Constructive controls

Same title followed by 716 independent native literary runes from Gibran and Emerson, hidden seeded order7 coefficients/initial state, respectively NG/hold and EA/consume. Each control has 29,814 candidate receiver parameterizations; exactly one yields the full planted plaintext.

| Case | p0-body score | Frozen p1–2 score | Held exact |
|---|---:|---:|---:|
| Gibran | -2.103810 | -2.169840 | 467/467 |
| Emerson | -2.338428 | -2.393122 | 467/467 |
| Original | -5.626613 | -5.909629 | unknown |

Both true coefficient vectors, marker choices and clocks are recovered exactly from ciphertext and imposed title. Exact forward replay passes. Controls validate the finite receiver, not the historical crib.

## Decision

Retire this exact order1–7 homogeneous mod28 successor-exclusion receiver conditional on the conjectural title. Do not expand orders, biases, alphabets or clocks absent independent source support. Other languages, nonperiodic keys, and other anti-repeat mechanisms remain open. No authoritative synthesis change.

Reproduce: `node sims/lp2_p0_rank28_crt_recurrence_sft.cjs`. [SFT](../sims/lp2_p0_rank28_crt_recurrence_sft.cjs) · [raw and input blob IDs](lp2-p0-rank28-crt-recurrence-output.json). Complete core executed in connected V8, standalone Node wrapper not separately executed. No CI.

Related: [repeated successor-rank title](lp2-p0-epiphany-rank28-predecessor-crib-original-gate.md), [GF29 title recurrence](lp2-p0-epiphany-title-allsecret-gf29-lfsr8-gate.md).
