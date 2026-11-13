# LP2 lag-11 recurrence: a real local deficit, no identified 11-key inverse

**Agent 30 · 13 November 2026. Classification:** bounded original-ciphertext architecture gate and failed clue-constrained decryption consumer. **No unknown LP2 plaintext, authentic key, cipher or external destination has been recovered.** It is not a new established mechanism. The actionable decision is **do not pursue an eleven-period key from the physical p32 square unless another independent original instruction selects an operation**.

## New observation and human-clue candidate

The unchanged 55 rune-bearing unsolved physical LP2 pages contain **12,956 GP29 runes**. Only **363/12,351** valid within-page pairs at separation **11** are identical. This is less than the ~420 predicted by a model preserving the pages' complete original one-step directed rune-pair frequencies. The immediately neighboring original lags are less unusual: lag10 **425/12,406**, lag12 **413/12,296**. Lag21 has **369/11,801**. The independent original source's physical **p32 has an 11×11 rune square**, so a reader could plausibly examine a period/rail width of eleven; however the particular lag was noticed during a scan across many possibilities, so that source fact **does not retroactively remove multiple-testing selection**.

A postselected local observation is especially sharp: physical **p29 has zero lag-11 equalities in 266 pairs**, although its one-step transition multigraph would usually produce about nine. No legend on p29 marks an eleven-step arithmetic operation. In the actual source the 11-step deficiency is spread across both p0–39 (277/9,200) and p40–55 (86/3,151); page29 is only one contributor. It has no known plaintext implication.

## Exact directed-edge-preserving control

The [standalone CommonJS SFT](../sims/lp2_lag11_edge_preserving_sft.cjs) randomizes the original **directed 29×29 one-step transition multigraph independently within every physical page**, including the exact page start and end runes, via randomly shuffled outgoing edge orders and a complete Eulerian traversal. The script verifies the entire original per-page directed bigram histogram against one randomized copy. This is a stricter matched null than simply drawing fresh uniform characters: **every source rune count, every page length and all 86 adjacent-equal pairs are preserved exactly in every surrogate.** Thus a lag-11 anomaly cannot arise merely from the earlier-known adjacent-doublet suppression or first-order symbol preferences.

Using unbiased rejection-sampled xorshift32 choices, seed `0x20261113`, **2,000** full 55-page null manuscripts and the **predeclared scanned family of lags 2–30**, the exact executed results are:

| Quantity | Original | Null / calibrated interpretation |
| --- | ---: | --- |
| lag11 equality events | **363** | mean **420.234**, sd **20.308846**, standardized **−2.81818**, fixed-lag lower tail **7/2,001 = 0.003498** |
| lag21 equality events | **369** | mean **403.7815**, fixed-lag lower tail **72/2,001 = 0.035982** |
| most negative standardized lag among 2–30 | **lag11** | **132/2,000** surrogate minima at least as extreme; corrected **133/2,001 = 0.066467** |
| p29 lag11 zero events, separately randomized | **0/266** | **2/20,000** exact p29 edge-preserving nulls have zero; original local postselection gives uncorrected **3/20,001 = 0.000150** |

This finite, original-data result provides a **possible lag-11 secondary constraint**, but the corrected global lag-family result does **not** clear a conventional 5% statistical gate; page29 was independently chosen for follow-up *after* seeing its zero. Do not claim a cryptographic recurrence, an authored eleven-clock, or a decryption from either number.

## Source-constrained consumer: p32 eleven-element axis sums as Vigenere keys

To ask whether the author-visible 11×11 square could actually supply the missing operand, freeze exactly four **11-element keys** from physical p32: the sums of each row or column, using either GP ordinal indices or GP prime weights, reduced modulo29. Repeat each key from phase zero independently over each physical page of the preceding p27–31 visual chapter. The two reversible Vigenere signs give **eight** original-cipher candidates, with no phase, permutation, skip mask or English-model optimization.

Every candidate remains at ciphertext-level GP29 coincidence of symbols. The best of eight is **row-prime-sum addition**, whose original pp27–31 decoded IoC is only **0.03498423285**, close to uniform **1/29 = 0.03448276**; its corresponding p29 IoC is **0.0354471**. An authentic readable native GP-English solution would require substantially more than a tiny unvalidated statistic change and coherent actual words. The SFT confirms exact round-trip on the independent solved p57 rune stream for each key and sign. This bounded consumer is **negative**. It does not cover nonlinear square-derived keys, undiscovered external data or a different source-specified operation.

## Decision and reproduction

**Retire direct lag-11 differences (tested ± C[i−1], ± C[i−11] and their combinations; all original whole-book IoCs 0.03444–0.03532), and the eight p32 axis-key Vigenere consumers.** The shortfall of lag11 equalities warrants preservation as a *provisional structural observation* only. Before more time or CI is spent, demand an independently legible human clue selecting a precise 11-tap operation **and** an authentic original-cipher inverse that yields held-out language.

Run `node sims/lp2_lag11_edge_preserving_sft.cjs` from the repository root with Node.js 22. Input is the pinned [source GP corpus](../resources/liber-primus/lp2-corpus.json). A complete **Windows Node22 original-source execution passed**, [Actions run 43440135117](https://github.com/FlareZ123/liber-primus/actions/runs/43440135117), asserting original counts, preservation of every page's directed edges, null counts and all eight planted inverses. This supporting result is intentionally **not** promoted to `results/README.md` because it neither identifies the actual cipher nor changes the established global solution state.
