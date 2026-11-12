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

## Stronger result: eliminate *all* stationary secret page/chorus-word phase alphabets

The exact 56-word source sequence also fixes **56 short key periods**, independently of whether the key letters themselves are used: in GP29 rune lengths, there are **14 periods of 2, 13 of 3, 10 of 4, 10 of 5, 3 of 6, 2 of 7, 2 of 8, and 2 of 9**. A considerably broader original-cipher hypothesis now permits an **arbitrary, wholly secret 29-way bijection for every (physical page, chorus-key phase)**. The mapping need not be alphabetically related to the source word, affine, additive, or the same on two pages. If ordinary GP-English plaintext is encoded with that *stationary* key per phase, the equality of two plaintext runes in the same page/phase is necessarily the equality of their ciphertext outputs. No secret-key recovery is needed.

Partition all original page symbols by their page-local index modulo that page's 2012 chorus-word GP length. This gives **218 active (page,phase) groups**. For each group of size n and alphabet counts h, accumulate `sum h(h−1)` equal ordered pairs and `n(n−1)` ordered pairs, then divide pooled totals. Page p50 is empty. Phase rotation changes only the *names of groups* and cannot affect this invariant.

For the original **direct GP29 29-way alphabet**: **33,568 / 976,600 = 0.0343723121**. Native GP-English Shakespeare, Gibran and Emerson samples of exactly the same 12,956 rune length, split into identical physical pages and phases, yield respectively **0.0619004710**, **0.0620724964**, and **0.0640180217**. A constructive secret-key plant applies separate invertible maps `x↦7x+b(page,phase) mod29`; in every corpus it reproduces the full native equality numerator and denominator exactly despite the hidden alphabet offsets.

The prior GP28 exclusion-rank proposal admits a separate all-secret test. Discard each page's first rune and the **same 86 actual adjacent-repeat sites**, leaving **12,815** eligible rank observations. Compute the 28-way *sorted* or *cyclic* predecessor-exclusion rank of every eligible source rune. An independently arbitrary 28-symbol bijection can be used at **each (page,phase) group** before the rank-to-cipher step; equality is again invariant under any such key. For these two rank interpretations:

| Rank/GP register | Original equal pairs / eligible pairs | Original conditional equality | Shakespeare positive | Gibran positive | Emerson positive |
| --- | --- | ---: | ---: | ---: | ---: |
| Direct GP29, arbitrary independent 29-alphabet per group | 33,568 / 976,600 | **0.03437231** | 0.06190047 | 0.06207250 | 0.06401802 |
| Sorted predecessor-exclusion GP28 | 33,944 / 955,226 | **0.03553505** | 0.06226171 | 0.06251714 | 0.06444339 |
| Cyclic predecessor-exclusion GP28 | 34,518 / 955,226 | **0.03613595** | 0.06226171 | 0.06251714 | 0.06444339 |

For each rank order and each authentic reference source, the positive plant uses independent phase-keyed bijections `x↦5x+b(page,phase) mod28`, applies the real reversible predecessor-exclusion encoder, and forces the *actual original 86 ciphertext-doublet sites* as explicit erasures. The all-secret invariant then recovers the underlying native conditional equality counts **exactly** on all nonerased positions. This demonstrates sensitivity to a genuinely secret short-period GP28 English cipher, without granting a mechanism for the 86 exception sites. Across all three references, the original corpus's phase equality is near uniform; genuine native GP ciphertext plants exhibit nearly twice as many equal pairs.

**Consequence:** even granting unknown independent secret alphabets on every page and chorus-word key phase, ordinary GP-English plaintext encoded through a directly stationary per-phase GP29 substitution, or one of the two specified 28-way predecessor-exclusion ranks, is strongly disfavored on all original pages. This is a **language-register conditional cryptanalytic exclusion**, not a universal exclusion of nonstationary encryption, hidden state, a different intermediate register or a secret transposition. It improves the eight explicitly keyed negative variants above by removing the actual key letters from the test and universally quantifying over the whole stationary phase-alphabet family.

The original-source SFT now contains both finite keyed inverses and the all-secret group-equality proof with three secret-alphabet positive plants. Its complete expanded [Node.js 22 Actions execution succeeded](https://github.com/FlareZ123/liber-primus/actions/runs/43275347585) on commit `70852eb02788b7fa67efbac241e688b63243d761`.

## Cryptanalytic decision

Retire direct short-period stationary page-local substitution models under the source-selected 56 chorus-word GP key periods in the native-English GP register, including the eight literal 28-way rank inverses. The conditional all-secret theorem is stronger than the initially tested key values. The original 2012 signed instruction did not specify that reversible mechanism, and the original LP2 output fails the independent readable-language diagnostic. Other source-selected uses of the chorus remain open. A successor needs a historically indicated **precise key consumer or complete reversible operation** yielding actual original plaintext and testable independent predictions. Avoid rescoring arbitrary phases, altered source words and newly invented cipher layers around this negative.
