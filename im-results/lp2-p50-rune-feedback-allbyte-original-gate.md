# Original p50 byte table with rune-driven nonlinear feedback: all 256 seeds

**Decision (21 November 2026, Agent44):** A literal reversible table-feedback decoder with a full original 8-bit state and raw GP29 ciphertext/plaintext feedback fails to recover authentic native GP-English from any of the **55 unsolved rune-bearing LP2 pages**. The 256-state table is used as an actual nonlinear lookup, and the state update is driven by each original rune, avoiding the short cycles of a standalone fixed pointer walk. Eight concise source-derived receiver branches, with **all 256 possible initialization states each**, yielded no plausible plaintext. The source does not explicitly instruct this particular feedback operation; this is a negative original-cipher test of those branches only.

## Human-source hypothesis and exact receiver

The original manuscript prints a **32×8 table of 256 byte values** on physical pp49–51. The authenticated 2016 instruction says the words are the map and their numbers the direction. A human solver might interpret each byte as a lookup state and let an observed rune move to a new state. Because directly following a fixed table pointer enters cycles of length ≤11, feeding the current rune into the transition supplies a genuinely nonperiodic nonlinear receiver without external secret state beyond a starting byte.

Fix each original physical page as a separate receiver; take all original runes in scan/source order (word boundaries never create artificial letters). Let the current state be `s∈0..255`, the authentic original ciphertext rune be `c∈0..28`, `B[0..255]` the exact source byte table, and `k = s mod29` or `k = B[s] mod29`. All modes use the historically demonstrated GP29 subtractive decoding `p=(c−k) mod29`. The four update rules, independently for each key readout, are:

- `s' = B[(s+c) mod256]`
- `s' = B[(s+p) mod256]`
- `s' = (B[s]+c) mod256`
- `s' = (B[s]+p) mod256`

The source leaves these update choices and starting state unspecified. The experiment exhausts their compact finite union, rather than optimizing a secret seed from English. Every branch is **uniquely reversible** by applying the corresponding forward GP29 operation at the same current state.

## Exact original result

From the original 12,956 ciphertext runes, 55 independently processed physical pages, 8 registered update/readout modes and 256 exhaustive initial states, the SFT evaluates **112,640 complete page decryptions**. Each is scored under the independently pinned 3,510-rune solved LP1 source-native GP29 trigram model. Its reference log-scores per trigram are:

| Reference | Native GP trigram mean |
| --- | ---: |
| Source-native solved LP1 training | −2.260728 |
| Untouched solved LP2 p57 | **−2.468145** |
| Best of 112,640 original unknown-page attempts (p55, 76 runes) | **−3.330897** |
| Best p0 attempt (262 runes) | −3.365441 |
| Best p32 attempt (121 runes) | −3.366584 |

The top p55 candidate (mode byte/key with state-plus-plaintext table index, seed31) opens as uninterpretable transliteration `RLRSXMFEUOEEOBMTEORUXEOYAETHITIIOPG...`, at native score −3.330897. None of the scored original outputs is remotely close to the authentic source-native register; no source-authored word/phrase or key emerges. A low numerical score is a strong obstacle to direct native-GP English, though it does not exclude non-English, highly compressed or further-layered plaintext.

A fixed xorshift-32 shuffle preserves **the exact source rune inventory within each of three independent sample pages**, while breaking rune order. For each of 40 controls per selected page, the identical 8×256 full-seed model search was rerun, including winner selection. The null comparison is:

| Physical page | Original best | Shuffled median winner | Shuffled max winner | Shuffles at least as good as original |
| --- | ---: | ---: | ---: | ---: |
| p0 | −3.365441 | −3.374953 | −3.346052 | 7/40 |
| p32 | −3.366584 | −3.348215 | −3.320946 | 37/40 |
| p55 | −3.330897 | −3.325682 | −3.277067 | 25/40 |

These rank-selected originals are not unusually strong against same-inventory random controls. On the other hand, **eight genuine, independent forward-encrypted GP-native p57 plants**, with original lookup bytes and frozen secret seed201, decode exactly under their true inverse. Repeating the full 256-seed language search on each plant produces a best candidate score at least as favorable as the real plaintext score −2.468145. The gate is therefore sensitive to a real native-GP solution in the named family.

## Research decision

This excludes the eight concrete **page-reset, additive GP29, eight-bit p50 byte-lookup rune-feedback** inverses with arbitrary initial byte. It adds a genuine nonlinear ciphertext-driven test to earlier static pointer-cycle and additive stream probes. The negative result supplies **no authenticated LP2 plaintext, historical key, or destination**. Other state machines, word-boundary updates, source-selected clocks, nonadditive outputs, or external keys remain outside this experiment. A new variation needs a specific original clue identifying its state update/readout before extending this search.

**Reproducer:** [read-only Node22/CommonJS SFT](../sims/lp2_p50_rune_feedback_allbyte_source_sft.cjs); [successful Windows GitHub Actions run 44960304070](https://github.com/FlareZ123/liber-primus/actions/runs/44960304070). Original GP29 and 256 byte source are pinned in `resources/liber-primus/lp2-corpus.json` and `resources/liber-primus/lp2-grid-256.json`. All original output scores, top candidate texts, per-page winners, native positive-plant scores, exact inverse tests and matched shuffles are emitted by the one test.
