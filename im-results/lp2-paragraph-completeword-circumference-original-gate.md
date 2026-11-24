# Complete-word “circumferences” on original LP2: shell, ordering and key-clock gates

**17–24 November 2026 · Agent27 original shell test, Agent42 marked-block word-order extension, Agent48 chapter-level key-clock test · Director [#1279](https://github.com/FlareZ123/liber-primus/issues/1279), [#1323](https://github.com/FlareZ123/liber-primus/issues/1323), and [#2553](https://github.com/FlareZ123/liber-primus/issues/2553).** Three source-readable interpretations of the clear p57 PARABLE instruction have now been tested against untouched original LP2 word objects: literal shell removal, outside-in ordering within marked blocks, and an outside-in word-key clock across source-defined chapters. **None recovers unknown-page plaintext, an authentic unknown-page key, or a complete cipher.** These are distinct operations with distinct negative scopes.

## Common original source and section structure

The clear p57 PARABLE says to “shed our own circumferences” and “find the divinity within.” A reader might peel the exterior printed words of a paragraph or read complete word objects from its two ends toward its center. These interpretations use actual printed words rather than changing values of the 29 GP rune symbols or altering guessed word breaks. They compete with geometric ring interpretations of the p32 matrix and p55 word edges; neither instruction explicitly selects one of these mechanisms.

The exact sources are `resources/liber-primus/lp2-corpus.json`, `lp2-transcription.txt`, and `lp2-ink-annotations.json`. The two independently executable SFTs assert all **13,136 original runes**, including **12,956 unsolved runes in 2,896 words** and 180 solved runes in 45 words; they retain **32 true physical-page-carry words** as whole tokens. Word delimiters are printed hyphens/full stops and source punctuation; line breaks and page boundaries are not word cuts. The original ink file supplies **36 large marks**: 31 thirteen-dot, four ten-dot and one 23-dot. Duplicate marks at the same rune offset become a single paragraph cut. They partition the source into **34 nonempty sections**: three one-word sections, six two-word sections, and 25 longer sections. All large cuts occur between complete words. The first p0 large mark is **after the two red words containing 8+5 runes**, at rune offset 13. No retracted red8/marker8/black5 interpretation is used.

### Gate A: literal first/last-word shell removal (#1279)

Freeze the first and last complete printed words of each marked section as the exterior shell, keeping singleton words only once. Read the interior complete words in their original order. Preserve ordinal positions and every page/line/punctuation separator for exact original restoration. No key or supplementary cipher is supplied.

| Frozen source interval | Original runes | Interior runes | GP IoC original → interior |
| --- | ---: | ---: | ---: |
| Unknown **pp0–2** | 729 | **703** | 0.03408252 → **0.03410293** |
| Unknown **pp40–53** | 3,008 | **2,994** | 0.03454263 → **0.03455000** |
| Known-clear **p57 body** | 88 | **78** | 0.06556949 → **0.06160506** |

The pp0–2 interior begins **FJOE ONTH NEWBASOEEOINGU NAEGITH HBNIA PBN EOJTH ANGYX ...**; pp40–53 begins **YGDAEH APXYH EOEAOE TNGEA LITTHF MACE DC ...**. Neither is intelligible GP prose. Their removed exterior word pairs are also nonprose. In contrast the clear p57 positive preserves all 17 grammatical interior body words: **THE INSTAR TUNNELNG TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIUINITY WITHIN AND**. The one-word PARABLE heading correctly yields no interior. The true p57 body's original enclosing words are LICE (LIKE) and EMERGE. Literal shell removal itself is therefore excluded as a direct plaintext decoder.

### Gate B: deterministic complete-word order within marked sections (#1323)

A different reading of the same original phrase is to **traverse intact printed word objects from their section circumferences inward**. Freeze the 36 physical marks above as section boundaries before inspecting candidate plaintext. For each consecutive section word array `[w0,...,w(n-1)]`, the exterior-pair traversal is `w0,w(n-1),w1,w(n-2),...`. Test that permutation and its **single exact inverse convention**. Both reverse one another and have typed no-padding inverses for every section size, including singletons. The complete source framing holds all rune identities, page carries, line breaks, end punctuation and the position of every large mark; applying the inverse reconstructs the **entire original transcription byte-for-byte**. This is implementation correctness, not cipher authentication.

A naked permutation leaves the GP29 rune frequencies and IoC unchanged, so the one independently nominated value-changing receiver is the **historically authentic p56 prime-totient cipher with literal plaintext-F transparency**: prime stream `φ(2),φ(3),φ(5),...` modulo 29; a literal F emits F without consuming key, and an encrypted non-F may also emit ciphertext F. A complete DP accounts for every possible F skip history. Besides the source-selected start at prime 2, the test grants **all 5,000 starting-prime positions 0–4,999 separately per original illustrated chapter**, a much stronger negative criterion than one chosen start. No other symbol-changing operation, guessed secret alphabet, language-optimized word order or key schedule is introduced.

| Original chapter | Runes | Exterior-pair: max legally reached / viable prime starts | Inverse-pair: max reached / viable starts |
| --- | ---: | --- | --- |
| pp0–2 | 729 | 643 / **0** | 591 / **0** |
| pp3–7 | 1,145 | 557 / **0** | 571 / **0** |
| pp8–14 | 1,729 | 286 / **0** | 604 / **0** |
| pp15–22 | 1,903 | 429 / **0** | 759 / **0** |
| pp23–26 | 1,021 | 472 / **0** | 502 / **0** |
| pp27–32 | 1,433 | 656 / **0** | 420 / **0** |
| pp33–39 | 1,680 | 548 / **0** | 501 / **0** |
| pp40–53 | 3,008 | 554 / **0** | 765 / **0** |
| pp54–55 | 308 | 308 / **3** (545, 547, 2983) | 308 / **3** (1459, 4522, 4523) |

Every combination on the first **eight complete unknown chapters** produces a forbidden attempted encryption of plaintext F at some original position. The final 308-rune chapter retains three logically possible prime starts per direction, but nothing in the original source selects those starts, determines the F ambiguity or authenticates any plaintext. An inverse under an arbitrary wrong key is not a solution.

**Controls:** the standalone authentic p56 plaintext `AN END WITHIN THE DEEP WEB ...` is correctly re-encrypted to **all 85 original p56 ciphertext runes** with the true plaintext-F rule. The clear p57 95-rune word sequence, plus the p56 85-rune word sequence, both survive exterior/inverse word-permutation round trips. The full original 2,941-word transcription including every page carry is also recovered exactly by each pair of operations. This separates a functioning decoder/permutation from a failed historical hypothesis. [Successful Windows Node22 manual SFT run](https://github.com/FlareZ123/liber-primus/actions/runs/43997855032) · [exact source-native CJS](../sims/lp2_largepunct_wordunit_inout_phi_sft.cjs).

### Gate C: signed words/numbers/direction as a source-prime Josephus circle (Agent42, 17 November)

The separately signed 2016 Cicada instruction says that the manuscript's **words** are a map and their **numbers** provide direction. Together with the source-clear p57 “shed our own circumferences,” it could motivate **counting around a circle of complete printed words**. This is a genuinely different word-order hypothesis from outermost-pair reading, although the signed 2016 words do **not actually say “Josephus,” fix a starting word or instruct a phi(prime) receiver**. Only two physically natural directions were frozen here, with the first printed word of every chapter as start. No loop parameter was fitted:

1. Treat every printed complete word as an immutable object containing its actual runes, preserved page carries and exact *sum of Gematria prime values*; these sums are the visible word “numbers.”
2. For each of the **nine original image-marked chapters**, lay its printed word objects in their actual physical order around a circle. Select and remove the **first** word. From its successor, advance **the removed word's prime sum** as a one-based Josephus count, select and remove the next word, and repeat. In the reversed-circle model, the same first original word starts and the remaining objects are mirrored.
3. Test **one historically demonstrated rune-value receiver**, the authentic p56 phi(prime) cipher with plaintext-F nonconsuming bypass, over all 5,000 starting prime positions per original chapter, separately in the two directions. The DP preserves all possible ciphertext-F collisions rather than greedily deleting F.

Both traversals are deterministic permutations of **all 2,896 intact unknown-page words, all 32 page-carry words and all 12,956 genuine rune identities**. Inverses recover every original word object and its original slot without loss. A known p56 source-text control re-encrypts **85/85** original cipher runes. Both directions were fully checked against the authentic original; no new words, symbols or fuzzy word cuts are invented.

| Original unknown chapter | Whole runes | Clockwise max legal prefix / valid prime starts | Reverse circle max legal prefix / valid starts |
| --- | ---: | --- | --- |
| pp0–2 | 729 | **729 / 2** (1088,1089) | 672 / 0 |
| pp3–7 | 1,145 | 403 / 0 | 491 / 0 |
| pp8–14 | 1,729 | 825 / 0 | 282 / 0 |
| pp15–22 | 1,903 | 512 / 0 | 572 / 0 |
| pp23–26 | 1,021 | 590 / 0 | 389 / 0 |
| pp27–32 | 1,433 | 503 / 0 | 888 / 0 |
| pp33–39 | 1,680 | 368 / 0 | 424 / 0 |
| pp40–53 | 3,008 | 445 / 0 | 419 / 0 |
| pp54–55 | 308 | **308 / 4** (678,1189,4628,4629) | **308 / 4** (27,28,2875,3682) |

The **seven complete central chapters**, across 11,919 authentic source runes, cannot be inverted to any plaintext under this specific receiver, at any of the 5,000 starts. The few legally decryptable pp0–2 and pp54–55 combinations retain **near-uniform GP29 IoCs** and are not intelligible prose. The true prime-two start has zero valid complete chapters.

**Independent word-order discriminator:** retaining original word boundaries, compare the binned native-GP word-length-adjacency mutual information (bins 1–8, ≥9). The untouched source gives **0.01229969288 nats**, per-chapter clockwise Josephus **0.01113449147**, and reversed-circle Josephus **0.01153877172**. The two new orders **reduce** native word-length dependence. For an English reference control, the same repository's authenticated GP orthographic encoder (successfully checked on 181 source LP1 words and p57's 95 clear runes) is run on **every contiguous 2,896-word window** of three independent native-text corpora. Of **140,387 windows**, the minima are **0.03406063** (12,838 Gibran windows), **0.01797760** (52,512 Shakespeare windows), and **0.03054963** (75,037 Emerson windows). Both word orders, as well as the untouched original, sit below **every single control window**. This is a reference-class discriminator, not a universal proof against compressed prose, non-English registers or further cipher layers.

**Decision:** The source-locked Josephus word-order traversal + authentic p56 value-change cipher does not solve the unknown chapters; a generic “count the prime sums” instruction would still require an independently evidenced operand/receiver. No further free starting-word, reset, segment or step-function sweep follows from this negative. [Executable original-source CJS](../sims/lp2_wordsmap_gpprime_josephus_phi_sft.cjs) · [passing Windows Node22 CI run](https://github.com/FlareZ123/liber-primus/actions/runs/44001706671).

### Gate D: continuous period-8 outside-in chapter key clock (#2553, Agent48, 24 November 2026)

This is a separate scope from Gate B's traversal within 34 large-punctuation blocks. Freeze the nine source-defined chapter ranges **pp0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53, 54–55**. Within each chapter, traverse complete printed words in the single lossless order **first, last, second, penultimate, ...**. The key clock follows that transformed word order continuously from p0 through p55; after decryption, every plaintext word is restored to its original printed position. No word, boundary symbol or rune is deleted; there is no chapter reset, alternate order, period sweep or postselected p55 partition.

**Key-independent collision gate.** For period 8, an exact all-subset DP allows every ciphertext F to be either a transparent plaintext-F hold or a consumed non-F symbol. It bounds same-phase rune and adjacent-bigram collisions at lags 8, 16 and 24 over every such path. Each control is a maximum of 32 exact-rune-length windows of complete native words, subjected to the same outside-in permutation before scoring. Controls comprise Shakespeare, Emerson and Gibran rendered in GP29 plus the available solved native GP29 sections. Only one source-defined chapter has any joint collision support: **p54–55**, with bounds **24–34 rune collisions** and **1–2 bigram collisions**; exactly **one of 32** windows from native section `0_loss_of_divinity` falls inside both bounds. All other chapter/control comparisons have zero joint passes. This is a weak selector, not a key result.

**Disjoint native control.** A separate solved LP1 `0_koan_1` text (208 words, 780 runes) was used as a *planted* positive control. Its complete words were outside-in reordered and synthetically encrypted with the independently recovered authentic LP1 period-8 key `DIVINITY` (GP29 `DIUINITY`) under the exact transparent-F rule. Fitting only the first **139 words / 520 runes** recovered the unique key and unique path in one CSP node; the withheld **69 words / 260 runes** were predicted exactly and forward-replayed. This validates the exact word-relation CSP, F-hold clock and restoration implementation. It is not an observed LP2 ciphertext and is not evidence that LP2 uses this mechanism.

**Original LP2 test.** The selected p54–55 chapter contains **66 complete words / 308 runes**. Freeze the maximal whole-word two-thirds prefix (**42 words / 204 runes**) and withhold the remaining **24 words / 104 runes**. All **2,830 preceding p0–53 words** enter only as ciphertext-only wildcard constraints, preserving one global clock from p0. The dictionary contains **29,081 unique GP29 words** from the fixed TextBlob word-frequency list and solved native sections; no target plaintext is supplied. The exact word-relation CSP starts with 79,084 rows, makes 41,913 row visits in one propagation pass / one search node, and returns **zero keys**, with exhaustive completion and no search-limit exhaustion. The withheld continuation is never used in fitting and therefore has no prediction. The fixed `DIVINITY` transfer baseline also has no legal path: with phase 0 at p0 it fails at transformed position **77** of pp0–2.

**Decision.** The single `0_loss_of_divinity` collision-window match does not survive exact word-level key constraints. Retire this exact **continuous period-8 additive/F-hold, chapter-level outside-in word-clock** interpretation. The result is conditional on the declared GP29 word dictionary and does not exclude unusual out-of-vocabulary text, a different period or cipher family, or other source-instructed word-order operations. Do not repeat this same order with phase rotations, alternate splits or an expanded key pool. [Reproducer](../sims/lp2_chapter_outsidein_period8_fhold_csp_sft.cjs) · [passing Node 22 CI run 45365718895](https://github.com/FlareZ123/liber-primus/actions/runs/45365718895).

## Decision and next causal prerequisite

The visual p57 sentence does not itself choose **shell removal versus word reordering**, the exterior-pair traversal versus its inverse, or a symbol-changing receiver. The literal shell, marked-block permutation and chapter-level period-8 outside-in clock are reproducible but fail on original unknown ciphertext under their declared receivers. The new chapter-level test specifically retires one continuous additive/F-hold realization; it does **not** exclude every independently instructed word-order operation, another period or a different cipher family. Do not revive this exact branch with phase rotations or postselected splits. The original word grammar and anti-repeat constraints remain unexplained.

Original Gate A: [source-locked CJS](../sims/lp2_paragraph_completeword_circumference_sft.cjs) · [passing Windows Node22 run 43918204625](https://github.com/FlareZ123/liber-primus/actions/runs/43918204625). The two tests are exact original-input finite negatives, **not** decrypted LP2 prose.
