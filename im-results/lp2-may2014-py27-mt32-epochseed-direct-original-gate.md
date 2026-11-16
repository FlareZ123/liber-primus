# May 2014 epoch-second seed window: exact original LP2 Python 2.7 MT32 test

**16 November 2026, Agent 7. No unknown plaintext, authentic seed, decipherment rule or destination recovered.**

## Source-constrained finite route

Original LP2's distribution was active in early May 2014 (first preserved public participant transcript dated 11 May 2014). A concrete, easily executable but **unconfirmed** creator habit would be to seed Python 2.7 Mersenne Twister from the POSIX UTC timestamp at image/book generation. Freeze the finite generation window as **2014-05-02 00:00:00 UTC through 2014-05-12 00:00:00 UTC (end exclusive)**, corresponding to seeds **[1,398,988,800, 1,399,852,800)**. This interval has 864,000 candidate seconds. The author did not authenticate a timestamp or the PRNG hypothesis; the window is a bounded historically motivated guess, not proof of method.

Use the established, immutable upstream source-original English-register `grind27` engine from [Dukotah/cicada3301 revision 9087dc3](https://github.com/Dukotah/cicada3301/tree/9087dc36b5aa64c1786428e32180261ab9420c29), specifically the fixed **R36/S2** relation, Python 2.7 MT32 `random29`, exact, original offset zero and keyskip1 algorithm. This is the same already calibrated corpus/scoring architecture as the repository's existing Py27 S2 unswept-bands work. The present independent contribution is the **release-window-restricted exact historical candidate range**, not a new cryptanalytic model.

## Actual exhaustive original run

The [committed manual-only workflow](../.github/workflows/lp2-may2014-timestamp-py27-mt32-s2-manual.yml) compiled and ran the pinned C17 original ciphertext engine on Linux GitHub Actions, requiring its own 64/64 exact reference vector checks, a recovered synthetic true-seed planted control, and a separate frozen 20-seed drill. It passed all three. The published positive control seed 777 obtained **pmax=17.931158509762** and recovered its planted plaintext. The previous frozen drill found seed 2149309687 with **pmax=6.82583546184365**.

On the fixed **864,000 original LP2 candidate seeds**, the [complete run 43787171936](https://github.com/FlareZ123/liber-primus/actions/runs/43787171936) produced:

| Prespecified original metric | Result |
| --- | ---: |
| Exact seeds tested, without skips | **864,000 / 864,000** |
| Original score candidates above `cand_bar=5` | **99** |
| Candidates above calibrated `claim_bar=7.6341931878728095` | **0** |
| Highest original pmax | **6.236763926975537** |
| Exact best-scoring epoch-second seed | **1,399,573,091** |
| Four 216,000-seed worker intervals completed | **4 / 4** |
| Original rune plaintext authenticated | **None** |

The four worker best-score values are **5.775085609830661**, **5.581622398265423**, **6.236763926975537** and **5.848142913560833**. All 99 candidates crossing the broad screen threshold are retained as raw workflow artifacts for independent follow-up. The original scanner asserts **100% seed coverage**, `n_claim_bar_hits=0`, and an empty `flagged_survivors` array. The scoring decision is conditional on the pinned R36/S2 model and its English-register claim threshold; the surviving 99 lower-scoring candidates have not been independently proven nonsensical by a complete downstream word-meaning oracle in this particular workflow.

## Decision

A source-window random-seeded **Python 2.7 MT32, exact S2 keyskip1, offset zero** model fails to recover any convincing original LP2 plaintext from all 864,000 early-May 2014 possible second seeds. It is inappropriate to attribute the best-scoring seed to Cicada or promote the 99 low-scoring candidates to cribs. This does **not** exclude a different seed source/date, an independently secret pad, another PRNG, altered keyskip, a different plaintext register, or another cipher. More exhaustive contiguous seed hunting should first identify a clue selecting one of those changes; no original direct decoder emerged here.
