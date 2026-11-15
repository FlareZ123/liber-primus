# Previous ciphertext word's GP-prime sum: an all-secret original-cipher obstruction

**15 November 2026, Agent 12. Classification: key-independent finite family exclusion with a source-native, exact inverse positive control.** The unknown LP2 pages remain undeciphered. This study rejects a broad, concrete hypothesis in which the **immediately preceding printed ciphertext word's GP-prime sum modulo 29** selects one independently secret, stationary substitution rule for the next word, including a substantially more permissive rule that changes with **the exact within-word rune position**. It recovers no unknown plaintext, historical key, final destination, or independent Cicada instruction.

## Reconstructible reader path and decisive weakness

The authentic [2016 signed continuation](../resources/historical/cicada2016-4gq25-outguess.asc) says: “Its words are the map, their meaning is the road, and their numbers are the direction.” A reader possessing the manuscript's Gematria Primus prime labels could naturally assign a number to each word, use the previous ciphertext word's prime sum as a causal numerical state for the following word, and allow a secret GP29 alphabet to act at each state. The 29-letter printed GP alphabet motivates **modulo 29**. A more permissive variant allows the printed p50 table's **eight-column width** to change the alphabet within each word, and a still stronger variant grants an independent lookup to **every absolute position 0–13** of the next word.

The major unsupported premise is **the choice of modulo 29**. The 2016 sentence does not specify a previous-word dependence, a modulus, a substitution alphabet or a key source. This experiment can reject these selected mechanisms without asserting that they were the intended puzzle.

The original 56 unknown physical pages contain **12,956** GP runes in **2,896** printed words, including 32 words carried across pages. The runeless physical p50 remains skipped. The literal word parser preserves original cross-line/page words and independently verifies exact agreement with the 12,956 original ciphertext symbols of [the canonical rune corpus](../resources/liber-primus/lp2-corpus.json). Only the first printed word, eight runes long, lacks a predecessor and is exempt from the capacity bound.

## Exact unknown-secret theorem

For printed ciphertext words `C_0,...,C_2895`, define the public state of word `i>0` as

`s_i = (Σ_{c in C_(i−1)} prime(c)) mod 29`.

Test three increasingly permissive one-rune-in/one-rune-out deterministic ciphers:

`C_(i,j) = f_(s_i, h(j))(P_(i,j))`,

where each `f` is an *arbitrary* hidden 29→29 function, with no affine, additive, bijective, English or common-key restriction. The position clock `h(j)` is one of: (a) constant zero for the entire word, (b) `j mod 8`, or (c) the exact absolute position `j` in the original word. Different states/positions may have unrelated functions. This is much more permissive than guessing one GP29 Caesar key or one secret alphabet across all pages.

For a particular state/phase pair `g`, count printed original next-runes `n_g(c)` for each GP symbol `c`. Any *one fixed plaintext symbol* `x` must always emit the **same** ciphertext value `f_g(x)` within that state. Therefore its possible occurrence count in the entire 12,948-rune tested portion satisfies the exact inequality

`N_x ≤ U = Σ_g max_c n_g(c)`.

The theorem holds even if the unknown functions are chosen adversarially after observing the ciphertext, and even if they are **not bijections**. It does not assume a plaintext word or recover any key.

| Independent secret states | Original state/phase groups observed | Exact upper bound on **any fixed plaintext rune** | Source runes constrained |
|---|---:|---:|---:|
| One arbitrary rule per preceding-word sum mod29 | **29** | **688** | 12,948 |
| Sum mod29 × 8-column position | **232** | **1,154** | 12,948 |
| Sum mod29 × **absolute position**, one secret rule per observed pair | **348** | **1,276** | 12,948 |

The last row is the decisive, **most forgiving** model: it grants independent alphabets for the entire 14-rune maximum printed word length, with more unknown freedom than the putative eight-column rule. For an additional direct original-data diagnostic, the 29 sum-state groups have exactly **200,770 ordered matching ciphertext pairs among 5,838,488 ordered within-group pairs**, collision fraction **0.03438732767798786**. The capacity bound itself is exact and does not rely on this approximate random-looking fraction.

## Complete length-matched language test and planted inverse

Read the three already-pinned independent GP-English source controls, tokenize their native words and encode them using the repository's 29-symbol source-compatible spellings (including ING→NG, IO→IA, QU→CW, V→U, K→C and Z→S). For **each** of the 2,896 original printed word lengths, sample a native source word of **exactly that encoded rune length** with replacement. There are no missing original word lengths, and the known first word's plaintext is excluded from each count. Perform 300 independent seeded word-pool samples from each source, with xorshift32 `0x33012016` and the exact original 2,896-word length sequence frozen.

Every native GP-English control contains more `E` glyphs within the 12,948 tested positions than the most permissive 1,276-symbol bound. E is independently specified by the ordinary source orthography, not chosen to maximize the observed contradiction.

| Source-native text | Length-matched control manuscripts | Minimum `E` count | Median `E` count | Maximum `E` count | Within original capacity? |
|---|---:|---:|---:|---:|---|
| Shakespeare | 300 | **1,465** | 1,547 | 1,654 | **0 / 300** |
| Kahlil Gibran, *The Prophet* | 300 | **1,461** | 1,547 | 1,635 | **0 / 300** |
| Ralph Waldo Emerson, essays | 300 | **1,475** | 1,572 | 1,680 | **0 / 300** |

An independent source-native, exact positive control plants Shakespeare-format 12,956-rune plaintext with the *same original word lengths* under **406 independent randomly permuted GP29 substitution rows** indexed by previous **ciphertext** word prime sum and absolute word position, seed `0x5eed3301`. The causal encoder makes each new word's key state from the *already encrypted* previous word; its inverse recovers **all 12,956 / 12,956 genuine GP29 plaintext symbols**. This source-normalized planted ciphertext has **1,502 genuine E glyphs**, and the exact row-capacity evaluator admits **2,392** for the plant, well above the true value. The detector thus accepts a fully functioning example of its proposed cipher family and excludes the real original due to its fixed ciphertext distribution.

> **Interpretation:** No choice of hidden position-specific GP29 lookup alphabets, even with 348 independently secret tables, can encode any of these 900 length-matched native-English candidate manuscripts under the exactly stated prior-word-GP-prime-mod29 state rule. This is a complete **model-specific, English-register-conditional** exclusion; it is not a theorem about every possible English text, nor an LP2 decryption. The larger finite state family cannot be rescued by replacing Caesar with a nonlinear alphabet or increasing key entropy while retaining exactly these visible states.

## Research decision and reproducibility

Retire the *mod29 previous-ciphertext-word prime-state stationary GP29 lookup* route, including arbitrary per-position secret alphabets and p50-style eight-column within-word phase, for ordinary source-native English plaintext with the verified original word format. More key hunting inside this model is algebraically unable to recover that register.

A next original-input attack would need **independently selected extra state**, a larger authentic arithmetic address space, a source-supported non-GP intermediate, or a different prior-word operation. The signature 2016 “words/numbers” clue leaves those genuinely distinct options open, but supplies neither their exact parameters nor an independent key. Do not turn this finite exclusion into a conclusion that every word-dependent cipher fails.

**Original-source SFT:** [`sims/lp2_wordprime_nextword_allsecret_sft.cjs`](../sims/lp2_wordprime_nextword_allsecret_sft.cjs), Node 22/CommonJS, read-only. It asserts exact original source alignment, the 29/232/348 original groups, all three exact capacity bounds, original ordered collision pair counts, 900 exact word-length-matched controls and an independently reversible secret-row positive plant. **[Successful GitHub Actions original-data execution 43688032249](https://github.com/FlareZ123/liber-primus/actions/runs/43688032249)** completed on the checked-out main repository with every assertion and the positive inverse passing. The isolated manual-only workflow is [`agent12-wordprime-state-manual.yml`](../.github/workflows/agent12-wordprime-state-manual.yml). There is no automatic per-commit CI workload.
