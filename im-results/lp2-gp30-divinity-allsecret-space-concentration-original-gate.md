# GP30 SPACE-changing original inverse: source-named DIVINITY, F bypass and all-secret family bounds

**Agent 10, 22 November 2026 | Verified original-cipher negatives, native-GP controls, no recovered unknown plaintext.** This record consolidates the complete source-typed inverses and genuinely key-independent exclusions for 30-symbol SPACE-moving ciphers. It covers a *different register* from earlier BASE29→BASE30 whole-word numeral conversion, stationary GP29 lookup, and fixed within-word GP29 alphabets. No first-party Cicada instruction selecting a 30th ciphertext symbol is known; each conclusion is conditional on this declared model.

## 1. Source-authentic tokenization and what the human solver would see

The source material has **12,956 ciphertext GP runes, 2,896 true printed complete words and 32 genuine cross-page word carries** in unknown LP2 physical p0–55. The original transcript also has six dashes immediately following standalone **Arabic list numbers 7,1,2,3,4,5** (on original physical p10, p36–38). These six structural list-head dashes have no preceding GP word. They are preserved *unchanged* as noncipher typography, alongside original line, paragraph, section, page and numeral marks. Periods and hyphens that actually terminate a GP word, on the other hand, are hypothesized to be ciphertext digit29 **SPACE**. Thus the primary, source-typed cipher channel contains exactly **12,956 GP runes + 2,896 genuine GP word/period marks = 15,852 full30-symbol tokens**. Original page owners are read from canonical per-page rune indices, so rune-free p50 never shifts the physical numbering.

This corrects an earlier *all-hyphens* variant that included the six non-GP list dashes as cipher symbols: that earlier version had 15,858 tokens. Both variants were computed and give the same negative decisions, but the source-typed channel is the coherent primary model. Corrected scripts preserve every excluded mark, all 32 carried original words and the entire source transcript byte-for-byte after reencryption. The six source dashes are **not** cryptographic evidence for or against using a GP30 alphabet.

The source-visible motivation is narrow. Genuine solved LP1 p03–04 uses the 8-GP-token repeating key **DIVINITY**. The clear LP2 p57 **PARABLE** says **FIND THE DIVINITY WITHIN**, and the historic GP chart has 29 runes plus a blank cell. These make a speculative GP29+SPACE extension human-conceivable. Neither the chart nor the words supplies a GP30 opcode, secret key schedule for LP2 or independent state selection.

Two independent original *solved source* controls determine realistic plaintext conditions. The 755-rune unenciphered LP1 **THE LOSS OF DIVINITY / INSTRUCTION** text, with its two Arabic enumerator dashes preserved as markup, has **181 legitimate GP word/period marks in 936 full30 tokens**, SPACE rate **19.338%**, and 320/755 = **42.384%** of its runes occupy its five most frequent GP values. Clear LP2 p57 has **95 GP runes + 20 legitimate word/period events**, SPACE rate **17.391%**, and top-five GP fraction 46/95 = **48.421%**. These are empirical native-language controls, not universal minimum statistics for every possible English/Latin ciphertext plaintext.

## 2. Frozen DIVINITY full30 inverse: original and held-out failure

With each actual source rune as GP index0–28 and each of 2,896 true source GP separators as symbol29, the explicit proposed inverse is

\[
P_i=(C_i-K_{i\bmod8})\bmod30,\qquad
K=\operatorname{GP}(\mathrm{DIVINITY})=(23,10,1,10,9,10,16,26).
\]

Clock zero starts at the first unknown LP2 GP30 token, advances through all genuine GP word marks and continues across real physical page seams. No key fitting, rescored phase, page reset or posthoc plaintext spacing is permitted. The exact forward inverse is \(C_i=(P_i+K_{i\bmod8})\bmod30\). Source-punctuation spelling and page/line/section layout reside in an immutable sidecar.

| Exact source span | GP30 source tokens | Plain decoded SPACE tokens | Fraction | Decoded nonspace GP IoC |
| --- | ---: | ---: | ---: | ---: |
| Entire original p0–55 | **15,852** | **475** | **2.996%** | **0.0387668** |
| Development physical p16–21, global clock carried | **1,985** (1,613 GP source runes) | **61** | **3.073%** | **0.0387302** |
| Independent physical p40–53, global clock carried | **3,677** (3,008 GP source runes) | **116** | **3.155%** | **0.0383990** |
| Authentic clear GP p57 benchmark (no decryption attempted) | **115** (95 runes) | **20** | **17.391%** | **0.0627100** |

No contiguous authentic unknown plaintext was recovered. Every source rune and all typography reencrypt exactly. The 95-rune p57 positive can be genuinely GP30-enciphered and decoded without losing source-native words. This rejects **this fixed source-named full30 DIVINITY inversion** for comparably word-spaced native GP prose. [Exact original full-channel SFT](../sims/lp2_divinity_gp30_space_vigenere_original_sft.cjs).

## 3. Historical literal-F bypass: ALL possible hidden skip masks

The actual solved-LP1 DIVINITY method has an important historical exception: ciphertext **F=0** sometimes represents literal plaintext F and **does not advance the key**. In original solved LP1 515-rune p03–04 regression, **eleven** true literal Fs bypass; a normally keyed letter can also encrypt to ciphertext F. This makes F transparent *ambiguous to a ciphertext-only reader* ([historical solved positive](../sims/authentic_lp1_p03_p04_vigenere_recovery.cjs)). Extending the real GP29 exception to a GP30 symbol stream is again a declared speculative hypothesis.

Give every one of the **458 original LP2 ciphertext F tokens** a completely free private bit: choose either literal plaintext F and keep the DIVINITY phase unchanged, or ordinary modulo30 decoding and advance. An exact 8-state max-plus dynamic program solves the maximum output SPACE count **over all \(2^{458}\) F masks**, retains an explicit optimum mask, and verifies exact full source reencryption. Every mask is allowed; no decoder can beat these bounds for the supplied eight-key GP30 hypothesis.

| Allowed source clock and independent F-bypass freedom | Exact maximum decoded SPACEs |
| --- | ---: |
| Entire original, continuous initial phase0 | **759 / 15,852 = 4.788%** |
| Entire original, one freely selected initial phase | **762 / 15,852 = 4.807%** |
| Eight original sections, freely selected independent initial phases | **770 / 15,852 = 4.857%** |
| All 55 rune-bearing physical pages, freely selected independent initial phases | **827 / 15,852 = 5.217%** |
| Original p16–21, independently optimized phase and all F decisions | **96 / 1,985 = 4.836%** |
| Untouched p40–53, independently optimized phase and all F decisions | **192 / 3,677 = 5.222%** |

The authentic p57 PARABLE and the exact 755-rune solved LP1 source (181 true spaces and periods) both successfully encrypt/decrypt with correct literal F skips, including ordinary encryption that happens to yield ciphertext F. The max-space bound admits both source-native positives. On the original unknown pages even arbitrary F decisions plus independently chosen page phases cannot reproduce their word-space density. The binary bypass mask itself is not supplied by the unknown ciphertext, making this an **optimistic capacity obstruction**; it is not a standalone source-recoverable inverse. [Exact all-F-mask dynamic programming SFT](../sims/lp2_divinity_gp30_all_fskip_space_capacity_sft.cjs).

## 4. Stronger theorem: ANY independent secret 30-symbol alphabet, periodic or word-geometry keyed

The fixed historical key could fail while some other secret GP30 key worked. A genuinely key-independent exclusion can instead allow a **completely arbitrary 30! bijection in EACH state**, assigning each possible ciphertext symbol to exactly one plaintext GP rune or SPACE. Each key state has exactly one ciphertext class mapped to SPACE. All thirty choices are optimized away.

Let \(h_g(c)\) be the observed count of original ciphertext class \(c\) in a state \(g\). Let \(L_5(h_g\setminus c)\) denote the sum of the five largest source-class counts among the other 29 input classes. For any decoded plaintext with \(N\) full30 symbols, \(S\) spaces and \(T_5\) occurrences of its five most common **nonspace** runes, a required native language threshold \(T_5/(N-S)\ge q\) implies the necessary lower inequality \(T_5+qS\ge qN\). Every independent collection of secret bijections also satisfies the *optimistic* upper inequality

\[
T_5+qS\ \leq\
U(q):=\sum_g\max_{0\leq c<30}
\left[L_5(h_g\setminus c)+q\,h_g(c)\right].
\]

Thus **\(U(q)<qN\) is an exact proof of impossibility for every secret key in the declared state family**. The upper bound is deliberately generous because it even permits the identity of the five preferred plaintext rune labels to vary *independently in every state*. Reproducers multiply out the exact rational numerator/denominator, so there is no floating point threshold issue.

### 4a. Full30 period-keyed secret alphabets

A state is GP30 token position modulo an unknown period. Allow one fully secret periodic alphabet over the entire 15,852-token original, or entirely independent period alphabets within each of the eight actual source sections, or even private periods on each of the 55 actual rune-bearing pages. The latter permits unprinted key resets in 32 originally carried words, making the exclusion broader than the plausible author's model.

| Real native GP concentration required | All global periods excluded | All 8-section-private periods excluded | All 55-page-private periods excluded |
| --- | ---: | ---: | ---: |
| **Long solved LP1, 320/755 = 42.384%** | **1–152** | **1–19** | **1–2** |
| **Clear solved LP2 p57, 46/95 = 48.421%** | **1–317** | **1–40** | **1–5** |
| **More permissive illustrative threshold, 2/5 = 40%** | **1–101** | **1–13** | **1** |

Each range is a complete original-input mathematical exclusion across **all hidden keys**. The next period is merely the first mathematically inconclusive one, not a discovered valid key. Period behavior is nonmonotone: at q=46/95, continuous period318 is inconclusive, but320 is excluded. Both original solved LP1 and p57 encode/decode correctly under true period8 full30 DIVINITY plants and are rightly **not excluded** by the capacity theorem. [All-secret periodic CJS source](../sims/lp2_gp30_allsecret_periodic_space_fiveconcentration_sft.cjs).

### 4b. All-secret printed-WORD geometry, a distinct authored-clue candidate

The signed 2016 instruction says **its words are the map**. A natural finite interpretation is to use the actual **ciphertext** printed word length \(L\) and its rune offset \(j\) as a secret alphabet-state selector. All 32 cross-page words are joined in their original order; each source gap/period is input SPACE29 at terminal position \(j=L\). The original complete words have \(1\leq L\leq14\). With all six structural list dashes excluded, the full original has **2,896 words and exactly 119 distinct (L,j) states**. Give EACH state any of its own 30! secret bijections; its output may replace, move or delete source word boundaries.

| Independently secret source-visible alphabet selection | Number of 30! tables | Upper-bound ratio to required native LP1 320/755 | Native LP1 GP possible? |
| --- | ---: | ---: | --- |
| Original word length L | 14 | **0.79723** | Excluded |
| Original within-word offset j | 15 | **0.80326** | Excluded |
| (L, j modulo2) | 28 | **0.87140** | Excluded |
| (L, j modulo3) | 41 | **0.90867** | Excluded |
| (L, j modulo5) | 64 | **0.94682** | Excluded |
| Full exact pair **(L, j)** | **119** | **0.99055** | **Excluded** |

Every row also fails the higher 46/95 concentration of the actual clear LP2 p57, and the first four rows fail even the weaker 40% example. The full 119-table result is only a **0.945% relative margin** against the long solved-LP1 benchmark, so it is a precise conditional family exclusion, not a language-independent theorem. Any additional secret input-word-history state, source-section rekey, nonbijective code, other alphabet/register or output retaining non-GP data escapes its scope.

For *true* source-native positives, genuine original LP1 p10–13 and LP2 p57 are each used in two exact reversible encodings: the identity GP30 alphabet and a real **Caesar+1 modulo30** encoder that moves their true plain SPACE positions to other ciphertext positions. The secret alphabet can trivially be the same Caesar map in every (L,j) table, while the reader's (L,j) groups are taken from the **resulting ciphertext word boundaries**, satisfying the model fully. The bound rightly accepts both source-native controls in ALL six source-geometry state families. [Exact original all-secret word-geometry SFT](../sims/lp2_gp30_wordgeometry_allsecret_source_criterion_sft.cjs).

## 5. Robustness, decision and what would enable real plaintext

An earlier all-mark grammar consumed the six dashes attached to Arabic numerals as if they were ordinary GP word marks, giving **15,858** source tokens. This less faithful, explicitly alternative encoding also fails: a fixed-key DIVINITY inverse produces only **444** decoded spaces; unrestricted historical F bypass plus page-private phases yields at most **825**; and the arbitrary-secret global GP30 bijection theorem excludes periods **1–147** at native 320/755 and **1–314** at native46/95. Preserving them as noncipher numbering strengthens rather than reverses the substantive conclusions.

**Verified execution:** All four standalone CommonJS source-data tests pass on Windows Node22 in [Actions run 45061014119](https://github.com/FlareZ123/liber-primus/actions/runs/45061014119), with the exact manual [test workflow](../.github/workflows/agent10-divinity-gp30-space-original-manual.yml). Tested artifacts are the actual immutable original-rune and transcription resources; no plaintext fitting, guessed secret table or randomized p-value contributes to any bound.

**Decision:** Original-source, printed SPACE as a true 30th ciphertext symbol + source-visible DIVINITY and even every literal-F skip cannot give a word-spaced native-GP paragraph. Far more permissive, completely unknown short-period GP30 alphabets and 119 independently secret word-length/position GP30 alphabets cannot produce the actual solved-GP top-five concentration over full LP2. This excludes the **specific, mathematically defined full30 one-to-one register models**; it does not decode any of the 56 unknown LP2 pages, determine Cicada's actual key or recover the p56 hidden-service target.

A breakthrough must provide an *author-authenticated* word-boundary code or nonce/transducer with additional internal state, a plaintext under a different register, or original external key/container bytes. Work without an independently readable opcode should not compound free source parameters or declare a dense short fit a decryption. The next useful experiment is a complete, source-typed **nonbijective or length-changing** inverse with an independently predicted original holdout.
