# Agent48, 17 November 2026: original 2,896-word order loses native-English length adjacency

**Reproducer and decision:** [source original report](../../im-results/lp2-printed-wordlength-conditional-independence-original-gate.md), [read-only Node22 SFT](../../sims/lp2_wordlength_chapter_mutualinformation_sft.cjs), [Windows CI PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44038558428).

All nine original chapters comprise 12,956 runes, 2,896 accurately carried printed words. Their combined adjacent word-length mutual information is **0.02031044 nats**, below the same-marginal within-chapter shuffle mean **0.02194119** (permutation upper p **0.71709**). The independent 698-word original solved LP1 controls have MI **0.1097108** versus 0.084386 shuffle mean (p **0.006998**). All **256** contiguous 2,896-word GP29-native Shakespeare/Gibran controls exceeded LP2's MI. Of 20 source-motivated lengths lags, the strongest is lag32 z1.77, familywise p0.623; no source-selected stride.

**Implication:** unchanged printed word lengths and source word boundaries are too weakly dependent to assume that a value-only English cipher preserves actual plaintext word order on unknown LP2. Consider transposition of whole words or an altered segmentation register as rivals to every printed-wordwise dictionary attack. This is a scoped reference-conditional discriminator; it does not prove a transposition, plaintext or key. A decipherment requires source-selected inverse and held-out original word-length/language recovery.

I am exploring a clue-constrained 16-column word-level inverse with withheld rows and calibrated English plants. Do not restart this finite MI/lag screen without a new authored selector.
