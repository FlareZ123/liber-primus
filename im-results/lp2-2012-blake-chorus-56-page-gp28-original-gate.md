# 2012 signed Blake chorus as 56 page-local GP28 keys: original-source inverse gate

**12 November 2026, Agent 37. Classification: finite source-derived key allocation, hypothetical rank consumer, original-cipher negative. No unknown LP2 plaintext, authentic key, cipher, or destination recovered.**

## Why a 2014 player might try this

The PGP-verified 2012 Cicada email instructs, “Let the Chorus be your guide to the depths.” Its accompanying Blake chorus contains exactly **56 printed words** ([original witness](../resources/control/cicada2012_blake_chorus.txt)). The 2014 LP2 manuscript has exactly **56 unknown physical pages p0–55**, including the numeric-only p50. Associating chorus word number j with page j gives a key assignment without inspecting unknown ciphertext, fitting permutations or guessing offsets. The 2012 statement actually guided a MIDI stage: it does **not** authenticate a 2014 cipher key. The participant-archive MIDI binary is separately preserved and is not independently signed.

The original LP2 12,956-rune ciphertext has only **86 equal adjacent rune pairs** within physical pages. This motivates a bounded reversible GP28 consumer: 28 output choices excluding the preceding ciphertext rune, with a reserved repeat output for plain GP index28 (EA). That mechanism is **hypothesized**, never supplied by the verified 2012 source. The previous [56-word base56 coordinate gate](lp2-2012-chorus-base56-wordmap-gate.md) used GP-prime sums as page/word addresses and is a distinct test; this proposal instead uses each word's **literal GP rune sequence** as a page-specific repeat key.

## Source-frozen complete inverse

The inputs are the 56 words between BEGIN SOURCE TEXT and END SOURCE TEXT in [the signed chorus transcript](../resources/control/cicada2012_blake_chorus.txt) and original LP2 page indices from [the full canonical corpus](../resources/liber-primus/lp2-corpus.json). Preserve the historical “letchery” and “every thing” spellings. GP29 transliteration uses exact deterministic QU→CW, V→U, K→C, Z→S, ING→NG and longest-match GP tokens, as in the repository's established English controls. Page p50 has no runes, so its aligned word is unused.

For each rune-bearing physical page, let C be ciphertext GP indices and K the page's chorus-word GP indices. Start the page-local key at original phase zero or one. At position zero decrypt as P0 = C0 + sign*K[phase] (mod29). For every subsequent position i, let x = C[i−1]. If C[i]=x, the proposed plaintext is GP index28 (EA). Otherwise form one of two **28-way ranks**: sorted rank r=C[i]−1[C[i]>x], or cyclic rank r=(C[i]−x−1) mod29. Decrypt as Pi = r + sign*K[(i+phase) mod |K|] (mod28). Sign is ±1, the two ranks and two phases yield exactly **eight frozen models**. The forward map is the algebraic inverse; the repeated ciphertext symbol represents only the reserved EA. The key advances by the **absolute position** through repeats, with no hidden skip.

The self-contained CommonJS [reproducer](../sims/lp2_2012_chorus_56page_gp28_rank_sft.cjs) asserts the exact 56 source words, 55 rune-bearing pages, 12,956 original cipher symbols, and 86 within-page doublets. For all eight models it decodes and exactly **re-encrypts all 12,956 original ciphertext symbols**. Independent positive controls encode 12,956 runes of native GP Shakespeare under each same operation, decode them and require 12,956/12,956 exact matches with the original source passage. Their post-decode IoC is 0.06098952736.

## Actual results

The untransformed original whole-book IoC is **0.03447839786**, close to uniform 1/29. All eight candidate GP plaintexts remain ciphertext-like:

| 28-choice rank | Sign | Key phase | Original decoded IoC |
| --- | ---: | ---: | ---: |
| Sorted | −1 | 0 | 0.03525479285 |
| Sorted | −1 | 1 | 0.03525153984 |
| Sorted | +1 | 0 | 0.03527690849 |
| Sorted | +1 | 1 | 0.03524238854 |
| Cyclic | −1 | 0 | 0.03531861364 |
| Cyclic | −1 | 1 | 0.03525702109 |
| Cyclic | +1 | 0 | 0.03528146031 |
| Cyclic | +1 | 1 | 0.03529600 |

The numerically largest IoC candidate begins AONGNGEOASJYETHXLWLOFSELNGPOETIANGXUEYHOETBIABPRPERAEASFEOJIAONEOYX and is not legible source GP English. All candidates remain well below the true native-GP source control, so no plaintext or key is recovered. The 2012 source-key alignment by itself does not authenticate the 28-choice opcode.

**Reproduced on original GitHub input:** [successful Node.js 22 workflow run 43274058995](https://github.com/FlareZ123/liber-primus/actions/runs/43274058995), commit d3144c75efabc2457c9d1b12bc75fb578bfb1ab9. The [workflow](../.github/workflows/lp2-2012-chorus-56page-gp28-manual.yml) is manual-only and ran eight whole-book original forward/reverse controls plus eight native English planted controls.

## Cryptanalytic decision

Retire the exact 56-page Blake-word key assignment coupled with **this** previous-cipher exclusion-rank GP28 cipher. The original 2012 signed instruction did not specify that reversible mechanism, and the original LP2 output fails the independent readable-language diagnostic. Other source-selected uses of the chorus remain open. A successor needs a historically indicated **precise key consumer or complete reversible operation** yielding actual original plaintext and testable independent predictions. Avoid rescoring arbitrary phases, altered source words and newly invented cipher layers around this negative.
