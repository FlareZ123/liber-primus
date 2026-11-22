# Original LP2 32×8 table as an eight-state GP29 receiver: exact all-secret capacity decision

**Agent 5, 18 November 2026.** A completed original-input exclusion for one source-hypothetical cipher architecture. No unknown LP2 plaintext, authentic creator key or final destination recovered.

## Source premise and intended-player plausibility

Original LP2 pp49–51 contain **256 two-character cells, 32 rows × 8 columns**. The manuscript's source-alphabet has **29 GP rune symbols**, representable by five bits; eight columns can encode a three-bit state. A contemporary 2016 solver linked a Fu-Xi source that *might* have discussed eight trigrams; **that primary page remains unrecovered** and no first-party instruction associates Fu-Xi or three-bit state transition with the table. This hypothesis is an explicit, independently checkable proposed *receiver*, and it should not be upgraded to Cicada's method without such a selector.

Freeze the original previous **ciphertext** rune as a table row (0–28), a three-bit state as a column (0–7), and each real eight-bit source byte as either `[3-bit successor state | 5-bit value]` or `[5-bit value | 3-bit successor state]`. State moves deterministically using the original byte at the *previous observed ciphertext* row. Every initial state0–7 and both page-restart and book-continuous clocks are examined. The source provides no rule identifying the key or an output alphabet; test the deliberately broad possibility of an **arbitrary unknown 29-symbol output bijection independently for every (previous ciphertext rune, three-bit state) pair**, i.e. up to **232 secret permutations** chosen without restriction.

This design gives the strongest inexpensive test of this specific feedback-state architecture. After seeing the unchanged source ciphertext, the entire sequence of `(previous ciphertext, state)` contexts is fixed and thus observable. Each context's 29-symbol histogram must be relabeled by one secret permutation, independently of every other context. The maximum possible global plaintext coincidence is mathematically exact: sort each context's 29 histogram counts descending and align the equal ranks. Pairwise rearrangement inequality proves no different joint choice of hidden bijections can create a higher global coincidence score, and aligning all 232 sorted histograms achieves every pairwise maximum at once. **No computational key search or English-language optimization is involved.**

## Complete original-input capacity result

The unchanged unknown ciphertext comprises **12,956 actual GP29 runes** on the 55 physical rune-bearing pages p0–55. For the **32 distinct source-defined ciphertext-feedback state traces** (two bit packings × two reset clocks × eight initial states):

| Original-cipher decoding family | Greatest mathematically attainable 12,956-rune IoC |
|---|---:|
| 8 independently secret state-only GP29 bijections | **0.03500350144520259** |
| 232 independently secret predecessor-rune-and-state bijections | **0.05125666552553434** |
| Unmodified original source ciphertext | **0.03447839786450569** |

The **0.0512566655** upper bound is over **all** (29!^{232}) possible choices of stationary secret substitutions, not one guessed set of keys. It is an *upper limit*, and does not claim there exists a particular natural-language text attaining it.

For an independent real-language benchmark, use the repository's previously calibrated **source-native GP29 English renderer**. This accurately reproduces all **181 consecutive solved LP1 words on pp10–13 and all 95 clear LP2 p57 runes**, including historically attested ING and IO orthography. For each of three independently sourced literary texts, compute the *minimum* IoC over every complete 12,956-rune sliding window:

| Pinned GP29 English corpus | Reference windows | Lowest native-English IoC |
|---|---:|---:|
| Gibran, *The Prophet* | 49,537 | **0.05911558391558687** |
| Shakespeare corpus | 204,151 | **0.057216772285951** |
| Emerson essays | 308,372 | **0.06012084484147217** |

The strongest original-cipher secret-substitution model falls **at least 1,000,374 ordered equal-rune pairs below even the least repetitive of those 562,060 complete source-native windows**. An independently **encrypted genuine 12,956-rune Gibran GP-English plant** using nontrivial arbitrary affine rune permutations indexed by the identical p50 predecessor-and-state context decodes and re-encrypts **12,956/12,956** under both byte packings; its actual clear-text IoC is **0.06012609969032139**, below its exact all-secret upper bounds **0.07746058297364627** / **0.07860212441265745**. The envelope therefore accepts true model-generated English data.

This is a much stronger result than merely trying finite candidate decoders: **no choice of 232 stationary secret bijective GP29 alphabets can turn the complete original ciphertext into GP-native prose with the frequency regularity of any tested full-size English reference window**, conditional on the fixed observable state machine.

## Literal direct decoders and their weaker source-level obstructions

For completeness, an independent **128-model exact decoder gate** uses the table's five-bit field as a modulo29 additive keystream mask, while the three-bit field chooses the successor state. The candidate uses row=previous source ciphertext **or recovered plaintext**, both mask/state packings, both modular signs, page/book reset, all eight initial states. Each of **128** models exactly forward-reconstructs all 12,956 original runes, and every same-model p57-tiled native GP29 plant independently decodes exactly. The original outputs have GP29 IoC only **0.03445890368600836–0.03451370425257878** (the genuinely clear p57 IoC is **0.06270996640537514**), and none recovers original prose.

The literal five-bit table field also cannot be read *directly* as a GP29 output permutation of the 29 possible source row symbols. For its eight state columns, the low-five field yields **15,18,18,20,17,19,21,16** distinct values, plus **14 out-of-range codes** 29–31 across its 232 row-by-state cells; the high-five field gives **21,20,17,18,16,18,17,20** distinct values, plus **23 out-of-range codes**. The additive-mask model handles these codes modulo29 and remains invertible; this direct-output observation concerns only a different, literal lookup interpretation.

## Decision and reproduction

**Retire the fixed 32×8 original table as a direct stationary eight-state, previous-cipher-rune-indexed GP29 alphabet receiver for full-book ordinary GP-native prose, even when granted 232 independent unknown 29! substitutions.** The proof is an exact original-cipher key-independent collision bound, plus 562,060 native-English windows and positive examples. It does not exclude adaptive symbol maps, independent hidden key-stream states, insertions, transposition, other natural languages, alternative registers or a genuine source-authored different use of the table. Without the missing original 2016 Fu-Xi primary page, three-bit register selection is hypothetical, so do not commission another phase/mask menu around this printed table.

- [All-secret 232-context exact SFT](../sims/lp2_p50_eightstate_allsecret_bijection_sft.cjs), Windows Node.js 22 **PASS** [run 44263136479](https://github.com/FlareZ123/liber-primus/actions/runs/44263136479).
- [Earlier 128 literal-decoder original-input SFT](../sims/lp2_p50_fuxi8_bitpacked_mealy_original_sft.cjs), Windows Node.js 22 **PASS** [run 44258282832](https://github.com/FlareZ123/liber-primus/actions/runs/44258282832).
- Fixed source inputs: `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp2-grid-256.json`, pinned `resources/control/{gibran_prophet_58585,shakespeare_first300k,emerson_essays_2944}.txt`; authenticated GP orthography `sims/lp2_native_gp_source_orthography_sft.cjs`.

