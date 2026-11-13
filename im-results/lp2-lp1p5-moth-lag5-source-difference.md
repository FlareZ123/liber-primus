# Source-moth 5-step GP29 difference-key inverse: original p55 and 81-rune composite

**13 November 2026, Agent 16. Outcome:** both original-source candidate decryptions remain random-like and do not reveal any unverified Liber Primus plaintext, authentic key, destination or reproducible historical decoder. This is a new, finite **source-difference** test that directly attempts plaintext recovery, with an independently recovered known-plaintext plant. It is not a general exclusion of additive ciphers.

## Why this specific inverse is worth one test

The solved *first-release* Liber Primus p5 contains **exactly 81 printed GP29 runes** from the heading `SOME WISDOM` to the 5×5 numerical square. Its prose explicitly calls the **totient function sacred**. The moth illustration on that page recurs in unknown second-release pp53/55, which offers a genuine image-derived reason to examine p5 as a cipher source. The original unknown physical p55 has **76 runes**, exactly `81−5`. As documented in the independent [moth source alignment](lp2-p55-moth-p5-terminal-sevenword-crib.md), the original red p53 tail has **51 runes** and p55's last seven printed words have **30** runes, yielding a separate source-shaped **81-rune** target.

A possible human operation is to take **differences separated by five GP runes**, suggested by the *source's* 5×5 square and the exact 81→76 length reduction. Let `K[0..80]` be the literal solved LP1 p5 runes and `C` the original unknown LP2 runes, all under their unchanged GP29 indices.

1. For the **whole physical p55 page**, use the 76-length nonwrapping key `D[i]=(K[i+5]−K[i]) mod29`, for `i=0..75`.
2. For the **p53 red51 followed by p55 terminal30**, use the 81-length circular key `D[i]=(K[(i+5) mod81]−K[i]) mod29`, for `i=0..80`, because the source-selected composite has the same length as K.

Apply the independently historically attested GP29 arithmetic `P[i]=(C[i]−D[i]) mod29`, with opposite sign recorded as a separate bounded diagnostic. The targets' original **source order and rune positions** are fixed, with no offsets, period/key fitting, skipped ciphertext F, word-boundary edits, or rescoring to select a cipher. In particular **p55's first rune is the real p54 carry**, not an independent new one-rune word; this test uses all 76 physical runes without pretending a new semantic word starts at that glyph.

**Weakest premise:** neither the historical LP1 p5 square nor the repeated emblem expressly instructs differentiating its plaintext rune stream by five, joining material from nonadjacent LP2 pages, or adopting wraparound. The 81/76 and 51+30 coincidences were noticed during modern research and might be accidental. This is a falsifiable direct consumer of these clues, not a Cicada-authorized operation.

## Executed unchanged original-cipher results

| Frozen target and key | Rune count | Raw ciphertext GP29 IoC | Subtractive candidate IoC | Opposite-sign candidate IoC | Exact ciphertext/key coincidences |
| --- | ---: | ---: | ---: | ---: | ---: |
| p55 physical, nonwrapping lag5 | **76** | **0.037894736842** | **0.034385964912** | 0.031578947368 | **1/76** |
| p53 red51 + p55 last30, circular lag5 | **81** | **0.033333333333** | **0.036419753086** | 0.031172839506 | **6/81** |

The subtractive p55 candidate begins `YPSAEADXAEAAGNGJTHUUSWCUEAYRTSNGTHMHNGFBUAEONGWOEBXONGXNYEOOEOCEOSMEXNIROE...`. The 81-rune combined candidate begins `NGUOIAOSXOEUELGNPRAUOEXIEOBWWFXCTJSLEOEOSNGCIAEATHLHEOFFHCSBFJNGDJBUUGYFUYUSDDHEOYODUYNBEACFIE`. All outputs remain nonlinguistic, approximately uniform among the 29 GP symbols. Ordinary source-native English GP language controls commonly produce IoC near **0.06**; no complete original word or instruction has emerged. The 81-rune count of source-cipher equality with the differential key is merely an additional exact input statistic, not a plaintext score.

### Exact all-source cyclic-difference obstruction to the literal 81-rune source plaintext

A stronger key-independent necessary condition applies if one interprets the 81-rune moth composite as an **enciphered repetition of the exact solved LP1 p5 81-rune text**. For any possible hidden 81-symbol source stream `X` and **any** circular lag `d`, the GP29 difference key `D[i]=X[(i+d) mod81]−X[i]` has `sum_i D[i]=0 (mod29)` by telescoping. Consequently additive or subtractive encryption using **any such cyclic-difference key** preserves the **total GP29 rune-index sum modulo29** from plaintext to ciphertext, independently of an unknown key or which lag was selected.

The original literal p5 **plaintext** has source index sum **1 mod29**; the original p53-red51+p55-terminal30 **ciphertext** has sum **13 mod29**. They differ by **12 mod29**, so this proposed *literal plaintext reuse* is **algebraically impossible under every circular finite-difference additive pad of length81, for any key and any lag**, including the source K and lag5 tested above. This is a conditional all-key exclusion of a precise plaintext placement, unlike the ordinary GP29 IoC diagnostics. The original manuscript has never established that its 81-symbol composite should be the same literal LP1 p5 text, so the invariant must not be generalized to other unknown plaintexts or to arbitrary non-difference keystreams. The SFT asserts both sums and the key telescoping identity on the exact original arrays.

Both sources are independently inspectable: the literal [solved LP1 p5 transcription](../resources/transcriptions/lp1_wulfic_canonical.txt), original [GP29 ciphertext index corpus](../resources/liber-primus/lp2-corpus.json), and [original red-runic interval annotation](../resources/liber-primus/lp2-ink-annotations.json). The script asserts the **entire 81-rune p5 key**, precise p53 red bounds 128–178, and original 76-rune p55 and p57 source lengths. An original solved p57 GP29 plaintext plant encrypted with each source-derived key is recovered **exactly at all 76/81 positions** and both signs, with all authentic ciphertexts also reencrypted identically. Positive forward/inverse identity validates correct arithmetic, rather than authenticating either candidate cipher.

**Reproduce:** [one-file Node.js 22 CommonJS SFT](../sims/lp2_lp1p5_moth_lag5_difference_sft.cjs), `node sims/lp2_lp1p5_moth_lag5_difference_sft.cjs`; source and output are read-only. The identical original-array arithmetic was executed independently in the connected JavaScript runtime before this report.

## Decision

The printed 5×5 square, 81 original p5 key runes, and 76/81 source-shaped LP2 targets lead to two very specific reversible operations. **Neither yields plaintext.** Retire these **two source-differentiated keys** unless a separate original clue alters the operation or supplies an independently checkable unknown plaintext sentence. The existing [corrected direct p5 Vigenere test](lp1p5-moth-2014-source81-textguide.md) is a different, previously negative consumer: it subtracts the **literal K** instead of the **lag-five difference D**. Neither failure excludes a key elsewhere in original images, stateful transformation, encrypted intermediate, or genuinely missing historical material.

This is a support-level negative; it should not be promoted as a solved page in `results/README.md` or used as a reason to fit more arbitrary lags, signs, phases, or PRNG stages.