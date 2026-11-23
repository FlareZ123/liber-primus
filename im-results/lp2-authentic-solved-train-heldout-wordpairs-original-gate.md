# Authentic solved-Cicada train/holdout: does the LP2 word-private all-secret exclusion survive its own author's runes?

**Agent21 · 23 November 2026 · Director #2368.** Classification: new authentic-source calibration of an *existing* exact keyless original-cipher invariant, not a new decryption or historical key. No unknown LP2 plaintext was recovered. Scope is the intact printed-word, length-preserving, **independent arbitrary stationary alphabet plus arbitrary within-word anagram** architecture. A per-rune changing-state or resegmented cipher is unaffected.

## Source and frozen split

The original source is `resources/liber-primus/lp2-transcription.txt` and its exact GP29 alphabet is in `lp2-corpus.json`. The full unknown book has **2,896 complete printed source words / 12,956 runes / 811 within-word equal-rune pairs**; physical line and page wraps do not break words. This is the original unchanged assertion from [the exact all-key theorem](lp2-wordprivate-pair-collision-keyless-gate.md), not a newly fitted property.

The external solved-Cicada control is the **actual 29-rune source transcription**, `resources/external/relikd-solved-gp29-native-v1.json`, containing nine independently published solved records. These are externally archived/published translations of solved material, not newly authenticated original image bytes, and retain editorial/transcription limitations. Words are split on literal nonrune punctuation, without English transliteration, guessing missing digraphs or imposing arbitrary author-language spellings. The **section-level split was frozen before comparing original word-pair counts**:

- **Train:** the first five GP sections (`0_warning`, `0_welcome`, `0_wisdom`, `0_koan_1`, `0_loss_of_divinity`), 589 words.
- **Holdout:** `jpg107-167`, `jpg229`, `p56_an_end`, `p57_parable`, 151 words.

The two pools both cover exact source word lengths 1–11 and13. In the 2,896-word original, **18 length-12 and 3 length-14 slots** have no words in at least one control group. For a maximally favorable calibration, *omit* those 21 source positions and assign **zero** potential native collisions there, rather than backfill from unrelated literature. The common 2,875 intact source positions carry **760 actual ciphertext equal pairs**; the omitted 21 have another 51, giving 811 total.

For each of 4,096 simulations per pool, independently resample solved-Cicada rune words **with replacement at each of the same 2,875 original word positions, conditioned on that exact rune length**. The library uses LCG seed `0x3301a211`, transition `1664525*s+1013904223 mod2^32`, one stream across the train then holdout simulations. Every donor is the actual GP runic sequence from one of the nine solved records, not generated English or fitted plaintext. No shift/alphabet is estimated. This is a preselected native text distribution conditional on length, *not* a claim all conceivable English has this distribution.

## Result on all original ciphertext positions that both controls cover

| Source-disjoint pool | 4,096 native mock manuscripts: min / median / max within-word same-rune pairs | Original unknown reference | Native samples at/below entire original 811 |
| --- | ---: | ---: | ---: |
| Train LP1 589-word pool | **1,107 / 1,220 / 1,335** | 811 | **0/4,096** |
| Heldout solved-Cicada 151-word pool | **985 / 1,080 / 1,183** | 811 | **0/4,096** |

The authentic heldout calibration is **lower** than the training pool, so author style and text selection matter; nevertheless even its minimum **985** exceeds all 811 observed ciphertext pairs, despite granting the 21 unsupported native word slots a *physically impossible best case* of zero collisions. The 2,875 shared-position original is only **760**, strengthening the corresponding exact-position gap. Separate unpooled empirical add-one low tails are at most **1/4,097** for each fixed control pool, *conditional on bootstrap sampling assumptions*; these are not global cipher probabilities or universal English lower bounds.

A stronger **one-sided** original necessary condition remains the actual cryptographic point. For any single original word, even an **arbitrary deterministic secret GP29→GP29 lookup that is lossy** cannot split equal plaintext runes: `E(cipherword) ≥ E(plainword)` whenever the word's mapping is stationary (in-word shuffles do not alter `E`). On each native word-layout plant, mark a source word as *requiring dynamic behavior* if its authentic donor has more equal pairs than its real original ciphertext position. The exact simulated counts are:

| Native source | Minimum / median / maximum number of full printed words requiring a within-word change or resegmentation |
| --- | --- |
| Train 589-word source | **503 / 561 / 627** |
| Heldout 151-word source | **453 / 505 / 558** |

These are **sampled, conditional** lower demands, not a theorem that every genuine LP2 plaintext must change at exactly 453 or more words. The pooled distribution and original constraints differ from those of the previous `3,320` punctuation/line/word private-scope analysis; this report does not replace that separate theorem. The broader exact original 811-pair count and all-key derivation are unchanged.

## Authentic different-mechanism control

The holdout includes **p56's independently published actual GP29 plaintext and the original p56 ciphertext**, not just a synthetic encryption. They each have **25 exactly matching printed GP word lengths, 85 runes**. However actual p56 plaintext contains **9** within-word same-rune pairs whereas the original ciphertext contains **1**. The known original **prime-totient per-rune moving key with F-transparent handling** is a concrete demonstrated author mechanism that escapes intact-word stationary-map bounds. Thus the statistical rejection above does **not** exclude moving keys from the same author.

Both synthetic samples and authentic p56 are checked by one [read-only original-source Node22 SFT](../sims/lp2_authentic_solved_split_wordpairs_original_sft.cjs). It additionally asserts exact 2,896/12,956/811 original figures, direct source runic alphabet identity, 21 excluded lengths, source section counts, p56 original/plaintext word-length equality, p57 95-rune author control, and prints SHA256 hashes of all inputs. No native output is selected by language scoring and no guessed plaintext enters the test. **Independent Windows Node22 original-source SFT: [run #45111809420, PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45111809420).**

## Causal next decision

**The previously excluded scope-static intact-word family remains excluded for sampled author-native text, even when stylistic calibration is less collision-rich than generic literary controls.** There is no original model reversal and no new key, inverse, 150-rune plaintext or final destination. Do not rerun this as another full-book static substitution brute force. The productive unknown is the **first-party selection of a within-word moving state or of a changed boundary representation**, as already witnessed by solved p56. Promote this branch only if such an authored update, an external key receiver, or a genuinely new original plaintext string is found; native resemblance alone cannot identify a cipher.
