# Page-local rune-word spacing: exploratory lag-23 signal (2026-11-10)

**Status:** computational observation, provisional. No LP2 plaintext, key, or validated transposition recovered. This is *not* an established decipherment.

## Actual result

LP2 has 55 rune-bearing unsolved page transcriptions containing **12,956 runes and 2,896 canonical rune-words**. The program splits the transcription at physical page boundaries before tokenization, yielding **2,928 page-local fragments**: 32 extra fragments originate from words that cross page boundaries. Its reported statistics apply to these fragments rather than the canonical whole-word sequence. The numeric-grid-only page 50 has no rune-bearing segment. Strip the typographical line-wrap marker (`/`) before counting lengths.

The unresolved text's **neighboring word lengths** show little of the statistical dependence present in the known solved LP1 material. Using 9 bins (1–8 runes, 9+ runes) and 1,000 within-clause permutations:

| Dataset | Neighbor pairs | Observed adjacent-length mutual information | Within-clause shuffle mean | z | Upper-tail permutation p |
| --- | ---: | ---: | ---: | ---: | ---: |
| LP2, unsolved | 2,691 | 0.010861 nats | 0.011606 | −0.36 | 0.630 |
| LP1, previously solved | 590 | 0.100487 nats | 0.060711 | +4.11 | 0.001 |

The contrast makes loss of a familiar word-order signature worth investigating, even though it cannot distinguish altered word breaks, unusual language, or word transposition by itself.

A second test uses a **Shakespeare-trained 9×9 English effective rune-length bigram log-odds score**. For the English training corpus, all literal `TH NG EA EO OE AE IA` bigrams are represented by a single character in an approximation of Gematria Primus rune length. The model uses add-one smoothing and scores ordered word-length pairs relative to independent marginal lengths. Within each LP2 page, compare **page-local fragments** at positions `i` and `i + lag`, for lags 1–60, against within-page shuffles that preserve page-specific fragment-length frequencies.

- The strongest **harmonic** spacing among candidate `k = 2..30` is `k=23` with score `z(23)+z(46)=5.0572`, component scores `z(23)=3.0535` and `z(46)=2.0037`. Runner-up `k=17`, score `2.3078`.
- Among 2,200 further random page-wise permutations, 9 had any scanned harmonic score at least as large (familywise exploratory `p = 0.00454`). For a fixed 23/46 harmonic, `p = 0.000454`.
- Direct lag-23 English log-odds score is −0.005717 versus the page-preserving null mean approximately −0.0194. Adjacent lag-1 score −0.023374.
- Holding the same word-length index fixed across pages while shuffling the page identities also retains a lag-23 tail signal (`z≈3.18`, `p≈0.002`): the effect is not explained simply by a position-dependent length marginal.
- The lag-23 association does *not* appear when entire section streams or the entire LP2 corpus are stitched together. It is **page-local**.
- Training the English pair model separately on first and last halves of the control gives lag-23 effects in each (`z≈3.13`, `z≈2.29`). However a model trained only on the 695 LP1 word groups does **not** detect it (`z≈−0.56`); this is a caution against treating an English-like association as proof of linguistic order.

**Critical boundary-model caveat (Critic, 2026-11-10):** The lag-23/46 statistics, nominal permutation p-values, and columnar candidates were calculated from 2,928 page-local fragments rather than the canonical 2,896 rune-words. They are conditional on that derived representation and its shuffle null. A 23-word stride or transposition hypothesis requires independent confirmation after correcting or explicitly modeling all cross-page words. A successful CI run does not validate the input's linguistic interpretation.

## Cryptanalytic interpretation and attempts

A possible hypothesis is a **23-slot page-wise rearrangement** of the page-local fragments, with each page broken into about two or three columns. The current test does not construct full words across page boundaries. For each page, interleave positions `i, i+k, i+2k, ...` for `i=0...k−1` to produce one candidate reading order. When `k` ranges from 2–33 and both original and reversed column orientations are scanned, the highest English pair score is `k=23` (−0.011432 versus −0.023374 unmodified). The runner-up is reversed `k=26` at −0.012746.

**Crucial falsifier:** a separate permutation search over all 64 columnar candidates gives **familywise `p≈0.372`** for the best score (1,500 page-wise shuffles). Thus the simple reconstruction does **not** constitute evidence for a columnar transposition or a valid decipherment. Fixed lag 23's rank in a search is partly circular with the discovered lag association.

The lag-23/46 harmonic family was chosen after viewing the uncorrected lag scan. Its `p≈0.00454` corrects for `k=2..30` inside this chosen family, **not** for all directions and statistics inspected while discovering the signal. It is vulnerable to exploratory selection bias. The lag-46 effect is weaker and not consistent across odd/even page subsets.

## Future high-value tests

1. **Fix the model boundary first:** recover 2,896 whole rune-words with page-span metadata, rerun lag-23/46 and candidate columns under explicit page assignment and exclusion conventions, and recalibrate the shuffle null. Retain the fragment-model numbers for historical comparison.
2. Seek a **mechanistic prediction** of how 23-rune-word offsets would arise from a precise encipherment or page layout. A mechanism must reproduce the 23/46 effect across unseen pages without fitted per-page parameters.
3. Investigate whether literal punctuation/spacing is a *ciphertext* layer, rather than assuming the visible word boundaries preserve plaintext words. Any method must generate testable independent word-length constraints.
4. A strong future proposal must show recovered rune plaintext, a reproducible key relation, or clear predictive success on held-out pages. More exploratory lag scans without independent mechanism are low priority.

## Sources and exact reproduction

- Original research scans: `resources/liber-primus/`.
- LP2 transcription: `resources/transcriptions/lp2_krisyotam_2017.txt`, derived from [krisyotam/cicada3301](https://github.com/krisyotam/cicada3301/blob/main/liber-primus/runes-text.txt), Git blob `43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7`.
- LP1 positive control: `resources/transcriptions/lp1_wulfic_canonical.txt`, from [Wulfic canonical](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/data/canonical/liber_primus_master.txt), Git blob `ba553b1d43bc491a1bab66ebd02534249263ae90`.
- Shakespeare text: `resources/control/shakespeare_first300k.txt`, first 300,000 bytes of [karpathy/char-rnn tiny Shakespeare](https://github.com/karpathy/char-rnn/blob/master/data/tinyshakespeare/input.txt), Git blob `7dcb3a2d4cc3b48b6283dd46870bfeb78f88aac9`.
- Deterministic executable: `sims/word_length_order_probe.cjs` (Node.js 22). The file currently asserts 2,928 page-local fragments (calling these 'words') and does **not** assert the canonical 2,896-word invariant. It prints machine-readable JSON; fixed seeds and Monte Carlo sizes are declared in source.
- Dispatched reproduction: [GitHub Actions run 42738369401](https://github.com/FlareZ123/liber-primus/actions/runs/42738369401) succeeded on 2026-11-10. Workflow only runs on manual dispatch to preserve CI budget.
- Prior external programs already document that LP2 rune distributions appear near uniform and suppress adjacent identical runes (see [Wulfic MASTER_TRACKER](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md), [Dukotah's Solvers' Dossier](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/SOLVERS-DOSSIER.md)); this report isolates spacing/order, without claiming a generic rune-only cipher weakness.
