# The p39-root GF29 five-back state cannot decode the original p40–53 chapter as native GP prose

**17 November 2026 · Agent 3 · original-input, all-secret reversible-state gate for Director #1422.** This is a bounded rejection of one clue-motivated nonlinear state machine, including a complete search over all 29 initial states and arbitrary independent **29! secret symbol permutations per state**. Granting **up to three arbitrary additional complete rekeys at authentic physical-page boundaries** still cannot reproduce the fixed independent 3,008-rune Latin-GP control frequency profiles. One arbitrary new key after the p50 numerical table also fails. The machine itself is not authenticated as a Cicada operation. **No original unknown LP2 plaintext, authentic key, or destination was recovered.**

[Passing Windows/Node22 all-source test](https://github.com/FlareZ123/liber-primus/actions/runs/44198166040) · [standalone CommonJS reproducer](../sims/lp2_p39_gstate_fiveback_allsecret_sft.cjs).

## Why this particular nonperiodic model

The original **p39**, imaged as [56.jpg](../resources/liber-primus/56.jpg), prints a three-rune red span at local offset119. The ink annotations and untouched rune stream agree on its GP29 values **[27,5,15]**. In ascending polynomial order these give

\[
G(x)=27+5x+15x^2=15(x-24)^2\pmod {29}.
\]

The independently documented signed-2013 BASE29 example supplies **3301 mod29 = 24**, one plausible seed for this polynomial. The separate original LP2 signal has a word-conditioned five-back equality excess, particularly the repeated **S = 15** at lag five. Thus G, its root, and the lag-five tap are original clue candidates worth a small reversible test. **A creator-selected instruction combining those observations into this state machine has never been found.** The arithmetic clues motivate a hypothesis; they do not prove it.

Start immediately after the p39 chapter with the entire physical pp40–53 ciphertext, including the p40 colored heading and the physically uninterrupted pre/post-table text. Original physical p50 contains numbers but no GP rune, yielding **3,008 exact source ciphertext runes**. For zero-based chapter position \(i\ge5\), define

\[
s_5\in\mathrm{GF}(29),\qquad
s_{i+1}=G(s_i)+C_i-C_{i-5}\pmod {29},\qquad
P_i=\pi_{e(i),s_i}(C_i).
\]

The counterfactual decryptor is *extremely permissive*: \(\pi_{e,s}\) is any bijection of all 29 GP symbols, wholly unknown and independently chosen for each internal state \(s\) and each optional page-key epoch \(e\). The first five plaintext runes are arbitrary and counted as free. The ciphertext itself uniquely determines every later state for a chosen \(s_5\), so one can test every possible secret alphabet without guessing a key. Across every word wrap and physical page boundary, the five-back tap continues unchanged. An optional **new secret alphabet** may be placed at actual page boundaries, while the state continues; this is deliberately more generous than the single-key model.

The mapping is strictly lossless: an encryptor given a known \(\pi\) and \(s_i\) computes \(C_i=\pi^{-1}_{e,s_i}(P_i)\), then updates the state from that ciphertext. The SFT tests this exact forward/inverse equation with a full 3,008-rune native-Latin GP plant under 29 independently keyed state alphabets.

## Exact key-independent plaintext capacity

For each fixed page-key epoch and state, count \(h_{e,s}(c)\), the original emitted ciphertext occurrences of every GP symbol \(c\). Any secret permutation preserves the **29 entry counts** in that row. Consequently, for every \(k\), the total count of the \(k\) most common plaintext symbols in the *entire chapter* obeys the exact upper bound

\[
M_k \le 5+
\sum_{\mathrm{epochs}\ e}\sum_{s=0}^{28}
\sum_{j=1}^k \operatorname{sort}_{\downarrow}
 \bigl(h_{e,s}(0),\ldots,h_{e,s}(28)\bigr)_j.
\]

The five unrestricted initials are conservatively added to *every* \(k\). This inequality holds against **all** \(29!\) row permutations, including unknown non-affine secret tables. There is no fitting to English words or selection of convenient initial states. On the actual 3,008-runic p40–53 source, all 29 candidate state seeds **synchronize after the original 133-rune chapter prefix**; even before that synchronization, every state seed is evaluated separately.

The first Latin control is the independently retained GP-contracted Vulgate New Testament ([source whole-word file](../resources/control/latin-vulgate-gp-wholewords.txt)), yielding 204,802 native GP runes in its fixed source order and **68 disjoint complete 3,008-rune windows**. A second independently solved Cicada-native English control has [2,979 authentic GP runes](../resources/external/relikd-solved-gp29-native-v1.json). The Latin column below is the *minimum* top-k count across all 68 windows, a conservative comparison.

| Source condition and all 29 seed candidates | Top 1 | Top 2 | Top 3 | Top 5 | Top 9 | Top 14 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| **Original p40–53, single state-alphabet epoch: maximum possible** | **233** | **424** | **602** | **925** | **1,487** | **2,060** |
| One rekey at *best* of 12 physical-page cuts: maximum | 302 | 545 | 762 | 1,136 | 1,747 | 2,327 |
| Two rekeys at *best* original-page cuts: maximum | 348 | **627** | 868 | 1,280 | 1,927 | 2,500 |
| Three rekeys at *best* original-page cuts: maximum | 393 | 702 | 965 | **1,414** | 2,075 | 2,646 |
| **Exactly one rekey at the p49→p50-table→p51 seam: maximum** | **284** | 522 | 737 | 1,096 | 1,684 | 2,253 |
| **Minimum** across 68 independent native-Latin 3,008-rune windows | **328** | **635** | **933** | **1,438** | **2,201** | **2,743** |
| The already-solved Cicada-English 2,979-runic control (descriptive) | 380 | 636 | 853 | 1,248 | 1,958 | 2,488 |

Each row of the first five entries is an **independent per-k upper envelope** over all choices of the zero to three rekey cuts and all 29 seeds. This is generous: the optimal positions for different k values need not be the same. Nevertheless, every 0-, 1-, 2- and 3-rekey model necessarily fails **at least one** Latin profile coordinate. For two rekeys, even the greatest possible two-most-common-symbol count, **627**, is below the least native control value, **635**. For three rekeys, the analogous five-most-common-symbol deficit is **1,414 versus 1,438**. Under this specific machine, **at least four independent secret-alphabet rekeys at authentic page boundaries are required to pass these reference-profile necessary conditions**; four are not known to suffice, and none is independently selected by the source.

The **literal numeric p50-table seam**, positioned exactly 2,474 GP runes into this chapter, has its own source-driven check. A completely unrestricted new set of 29 secret permutations at that single seam still permits at most **284** occurrences of the most frequent plaintext rune in the entire original chapter. That is below each 3,008-rune Latin control's minimum **328**, and below the 2,979-rune already-solved English control's **380**. Any claimed use of the p50 table as *only a rekey for this exact state-and-row architecture* therefore misses the original-language register even under completely secret rekey values.


## Independent source-calibrated GP29 English controls

The initial native-language gate uses a separately sourced Latin-GP corpus. An additional test invokes the repository's pre-existing [source-calibrated English-to-GP29 encoder](../sims/lp2_native_gp_source_orthography_sft.cjs), calibrated against **181 original solved LP1 word spellings** and **all 95 original solved LP2 p57 runes**. Its ING and IO spellings reproduce authenticated sources rather than using naive Roman digraphs. Three independently pinned English texts were then converted without consulting the unknown LP2 ciphertext and split into **complete disjoint 3,008-rune windows**. Each is tested with the same all-secret six-coordinate histogram capacity, across all 29 initial states and all permitted page-boundary secret rekeys.

| Source | Windows | Excluded, 0 rekeys | Excluded, 1 rekey | Excluded, 2 rekeys | Excluded, 3 rekeys |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shakespeare, first 300,000 characters | 72 | 72 | 72 | 63 | 3 |
| Gibran, The Prophet | 20 | 20 | 20 | 19 | 0 |
| Emerson, essays | 106 | 106 | 106 | 106 | 12 |
| **Total** | **198** | **198** | **198** | **188** | **15** |

Every one of **198 native-English control windows** fails the zero-rekey or single-rekey necessary condition, despite allowing any original page boundary for that single rekey. **188/198** fail even when two arbitrary complete state-alphabet rekeys can be placed at source page boundaries. With three rekeys, only 15/198 fail: the other 183 are **not thereby deciphered or positively identified as possible original plaintext**. The Latin and English profiles differ, so the universal three-rekey rejection over all 68 pinned Latin windows does not extend to all source-English windows. These controls preserve source passage order and exact rune count; they do not assume or reproduce the original 2,896 printed-word lengths.

This independent English-language extension narrows a plausible intended-GP29-prose cipher architecture without relying on any guessed secret permutation, ciphertext-fitted language, or outside keys. No actual unknown LP2 plaintext was recovered.


## A source-word-clock variant

The manuscript's fifth-back anomaly is concentrated **inside printed words**. To address that physical clue directly, an independently frozen variant uses the same p39 red polynomial G and one continuously updated 29-state register, but counts the fifth-back tap from the beginning of each printed word. For rune j of a word, define delta as the ciphertext rune itself when j is 0–4, and as the current ciphertext minus that word's rune j−5 for j≥5. Update the state as G(state)+delta modulo29; output plaintext through any secret 29-symbol permutation independently assigned to each state. Retain the original source word boundaries, including joins across physical page wraps, and optionally allow completely new unknown secret permutations at the actual p50 numeric-table seam.

The unchanged p40–53 source yields exactly **669 joined printed word segments and 3,008 ciphertext runes**. Across all 29 initial states, every possible choice of the 29! state alphabets obeys maximum top-{1,2,3,5,9,14} plaintext-frequency capacities **[232,436,615,942,1503,2070]** with one alphabet epoch, or **[283,520,729,1092,1684,2267]** when a completely new alphabet set is freely granted after the real p50 table (position2,474). The top-one bounds are below the minimum top-one original-spelling GP count for every disjoint Shakespeare, Gibran and Emerson 3,008-rune window: **[296,314,318]**, respectively. They also fall below the 68 native-Latin window minimum **328**. Thus the single continuous register with a word-local fifth-back tap cannot produce *any of those fixed native-control windows*, even if rekeyed at the table.

The same standalone SFT asserts byte-for-byte original rune and printed-word reconstruction; it additionally performs a full **3,008/3,008** source-shaped native GP encryption/decryption plant under this variant's own update equation. This variant is a separate bounded rejection of a source-plausible five-clock. It does not reject an unobserved page-dependent state reset, a different cipher state, word-by-word rekeying, a missing external key or a non-GP source register. **No original mystery plaintext is recovered.**

## Correctness control and evidentiary scope

The [single Windows Node22 SFT](../sims/lp2_p39_gstate_fiveback_allsecret_sft.cjs) loads the untouched physical p39 red span, all physical pp40–53 source runes, the separate solved-Cicada GP fixture, and the independently GP-coded Latin whole-word reference. It pins all source counts, the 29-source-seed capacity envelopes, the 133-rune synchronization, the 2,474-rune table seam, and the Latin minima.

For a **positive cipher control**, it constructs 29 nonzero-affine secret alphabet permutations indexed by this *same* nonlinear state and actually encrypts all 3,008 GP runes of a previously fixed Latin window. The inverse recovers **3,008/3,008** planted plaintext runes exactly, and the same histogram bound correctly contains every one of the planted text's six top-k frequencies. Thus the original failure is a genuine key-independent property of the untouched ciphertext rather than a broken inverse or a wrong language encoder.

**Scope:** This is a theorem about the stated one-register, fixed-five-tap, source-polynomial, history-derived reversible family, with at most three *independent page-boundary rekeys* and native-GP reference-frequency tests. It does **not** reject other nonlinear cipher state updates, unknown key material, arbitrary word-level rekeys, table-driven changes to the *state* itself, source symbols outside GP29, homophonic/non-bijective mappings, alternative output ordering, unusual natural-language frequency registers, or nonlinguistic typed data. The original manuscript does not authenticate the chosen recurrence or 2013-seed interpretation.

**Director decision:** With the independently calibrated English controls, retire this specific p39-G five-back single-state cipher and every simple original-page rekey rescue of size 0–3. The broad stateful decoding question in #1422 remains open. A successor should first acquire a *new original source-selected operation or external key* that changes the computational model, rather than adding a fourth guessed page rekey or another secret-alphabet sweep. No actual LP2 page was decoded by this test.
