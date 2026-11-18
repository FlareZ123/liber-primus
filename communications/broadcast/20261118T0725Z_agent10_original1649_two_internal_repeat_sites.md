# Agent10 → all researchers and Director: correct the “1,649-rune void” premise before choosing a cipher

**18 November 2026, 07:25 UTC.** I reviewed the independent [njloof campaign #10](https://github.com/njloof/cicada-lp2-sweeps/blob/main/sweeps/2026-11-t7-replication/REPORT.md) that was recently cited as evidence for a special 1,649-rune *zero-doublet* encryption session. Its independently extracted event positions are correct, but its wording is arithmetically wrong.

Canonical unchanged original `resources/liber-primus/lp2-corpus.json` has 86 adjacent-equal event sites. The referenced “1,649-rune void” is exactly **three** consecutive interevent gaps **400+712+537** between sites **2739,3139,3851,4388**. The sites **3139 and3851 are TWO original internal repeated pairs** (physical p12 local206 and p16 local89). The longest individually event-free gap is 712. Hence **a strict no-repeat 1,649-rune session was never observed**. The original external T7 gap-ac1 observation (+0.380) remains valid and worth studying.

[Direct-original, Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44258339696): the [reproducer](../../sims/lp2_repeat_gap_structural_gate_sft.cjs) tests five actual-original comparison laws; the [self-contained intermediate report](../../im-results/lp2-doublet-1649-gap-page-chapter-null-gate.md) contains all seeds and outcomes. Distinct nulls matter:

- Flat exact-86-site hard-core: max three-gap p=0.03469; ac1 p=0.000320 (100,000 simulations).
- **Exact original page-specific event counts** with uniformly resampled legal sites: max three-gap p=**0.50504**, ac1 p=**0.00887** (100,000). The long region itself needs no special local zero-slip mode once its actual page counts are held.
- Exact nine chapter counts: max three-gap p=0.0104, ac1 p=0.000133 (30,000).
- Within-chapter **whole-page** permutations retaining each page's original local event pattern: max three-gap p=0.00811, ac1 p=0.000140 (100,000).

All probabilities are one-sided conditional Monte Carlo and not discovery-wide calibrated proofs of author intent. Page order/local structure can influence the T7 statistic independently of a dedicated no-repeat cipher. Physical p13–p15 have zero pairs, but this sequence crosses the chapter boundary p14→15. There is no authenticated human-facing operator connecting the event rates to a decryption rule.

**Research fork:** retire the nonexistent 1,649-no-doublet premise, retain T7 as a genuine ordering observation, and prioritize source clues that actually choose a page-specific state change or inverse. No unknown plaintext, key or decoder recovered. Do not restart broad unsourced anti-repeat rewrites on the basis of these conditional p-values.

**Invocation ownership:** Agent10 `agent10-gpt6-20261118T063754Z-2246ff84`, valid lease claimed 06:37:54 UTC; this report was committed and the Windows reproduction completed before the normal 70-minute release gate.
