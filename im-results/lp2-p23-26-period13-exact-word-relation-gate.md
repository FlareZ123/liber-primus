# Exact period-13 word-relation recovery on original p23–26

Agent2, 2026-11-24; [Director #2536](https://github.com/FlareZ123/liber-primus/issues/2536). Inherits #2521's thin collision compatibility (1/96 native windows), not an authenticated period. Transfer the independently calibrated [period29 word-relation method](agent2-period29-fhold-exact-word-relation-gate.md) to the actual solved KOAN period13 and to the prescribed original p23–26 chapter. No EM or period/reset sweep.

## Reusable exact engine

[sims/lp2_fhold_word_relation_csp.cjs](../sims/lp2_fhold_word_relation_csp.cjs) generalizes exact word relations to any fixed period 1..29, with distinct phase and key-residue domains. If a word consumes more than one key period, intersect its repeated phase constraints. Every relation imposes starting and ending consuming phase and the appropriate exact key residues. Branch over literal plaintext F (transparent and nonconsuming) versus encrypted non-F at ciphertext F. Arc propagation and minimum-domain branching, with explicit node cap, no ranking/beam. Key-identical branches retain combined path ambiguity and all reachable end phases.

A wildcard word permits any legal native GP plaintext (consuming shift cannot equal ciphertext, transparent F only where ciphertext F), without a lexical constraint. It still imposes correct key/phase transitions. A simple deterministic escape retries the first contradiction word from the strict propagation; this is not exhaustive OOV search. For a recovered frozen key and fixed boundary phase, the separate exact Viterbi maximizes dictionary-supported rune count, allowing unknown words and reporting ties.

Native lexicon: independent TextBlob word list with GP digraph alternatives and source-calibrated QU/CW, V/U, K,Q/C, Z/S, ING/NG, IO/IA, contractions with removed apostrophes; unordered Gibran/Shakespeare vocabularies; all other native solved sections. Each actual control's target plaintext section is excluded entirely from lexicon construction. Corpus and transcript rune order are checked; LP1 second KOAN's apostrophe does not introduce a ciphertext word break, and is merged only in comparison.

## Actual original LP1 positive controls (no target crib or key dictionary)

| Original cipher | Prefix/holdout | Inference | Recovered exact key | Heldout exact |
|---|---:|---|---|---:|
| WELCOME, q8 | 255/260 | Strict contradiction at word48; one wildcard there; one unique key by propagation | DIUINITY | 260/260 |
| second KOAN, q13 | 155/164 | Strict, one unique key and path by propagation | FIRFUMFERENFE | 164/164 |

Both known keys compared only after search. WELCOME's wildcard word is independently confirmed OOV in the post-search comparator; there are two legal training paths, both ending phase0. The retained training witness is not entirely correct, so **do not claim exact 515/515 WELCOME recovery**. The frozen phase and key nevertheless uniquely recover all 260 withheld native runes; full forward replay passes. KOAN's complete 319/319 recovered plaintext and unique path pass, with frozen boundary phase10. These are genuinely original encrypted controls, not only synthetic plants. This strengthens the calibration of exact lexical inference and clarifies why OOV escape is needed.

## Frozen original target

Pre-registered first complete words reaching >=500 runes ([issue comment](https://github.com/FlareZ123/liber-primus/issues/2536#issuecomment-7126932056)); p23–26 has 1,021 runes. Train 113 words / 502 runes; withhold 519 runes, never used in inference. Lexicon 42,468 GP spellings. Unknown continuous q13 key, phase0 by rotational equivalence.

- Strict result: zero keys, propagation alone, first contradiction word34, pass1; 304,283 initial relation rows.
- One deterministic wildcard at word34: zero keys, propagation alone, contradiction word37, pass1.
- No candidate key, so no original continuation was opened for prediction.

## Exact robust pairwise incompatibility bound without exponential F-mask enumeration

For any two printed words i<j, build tables of legal in-vocabulary partial keys, grouped by the number h_i/h_j of transparent Fs in each word. Let d be the original rune offset difference between word starts. The second starting phase relative to the first is d-h_i-h_gap mod period, where h_gap ranges freely from zero to the count of ciphertext Fs strictly between the words. Compare partial-key projections at overlapping phases for every candidate hold count and every possible relative phase. If no compatible pair exists, the two words cannot both be dictionary-compatible under any real shared key. This relaxation generously allows each pair an independent intervening F schedule, so every incompatibility is a necessary constraint even when global schedules are unknown. Restrict to words of length >=4, which can only weaken the bound.

Build the incompatibility graph and solve exact minimum vertex cover (branch include high-degree vertex or all neighbors, matching lower bound and memoization). Each edge forces at least one OOV endpoint, independent of other words' contents. Calibrations:
- WELCOME prefix: 29 eligible words; 11 edges, all incident to word48, minimum cover1. Matches post-search true OOV count1.
- KOAN prefix: 21 eligible words, 0 edges, minimum cover0. Matches true OOV count0.
- Original prefix: 64 eligible words, 64 incompatible pairs, exact minimum cover **16**, 65 search nodes. Thus every exact original key must produce at least 16 of the 113 prefix words outside the expanded finite lexicon (at least 16/64 long words). No arbitrary unknown-word content can fix fewer than 16 words. This is a lower bound; higher-order conflicts may force more.

This is a constructive and genuinely all-key negative under the declared period, plaintext-F rule, native lexicon and intact word boundaries; it is not an information-theoretic rejection of arbitrary language or other mechanisms. The robust conflict graph can be reused where a full F-mask enumeration would be exponential.

## Author-specific orthographic sensitivity (Director #2602)

The original 16-word lower bound is **lexicon-dependent**. A single authentic input error, WIDSOM rather than WISDOM, motivates a finite native spelling expansion. Freeze the rule before original scoring: for a dictionary spelling with at least five GP runes, allow at most one exchange of unequal adjacent interior non-F runes; neither first nor final rune may move; no chaining, insertion/deletion or F changes. See the [frozen plan](https://github.com/FlareZ123/liber-primus/issues/2602#issuecomment-7134382260). The exact same baseline word list and donor normalization above are reused, with the two erroneous external first-KOAN WHAT forms replaced by the source-exact WHO forms (778 original rather than 780 donor runes). The all-section baseline still has 42,468 spellings.

Whole-section leave-one-out controls (all other solved sections and the same external lexicon/donors retained; WELCOME is the rule-training section, not independent validation):

| Native section | Words / GP runes | OOV before → after | Words ≥4 runes |
|---|---:|---:|---:|
| WARNING | 45 / 184 | 0 → 0 | 27 |
| WELCOME (training) | 124 / 515 | 2 → 1 | 59 |
| WISDOM | 31 / 157 | 9 → 9 | 23 |
| First KOAN (source-corrected) | 208 / 778 | 1 → 1 | 82 |
| LOSS OF DIVINITY | 181 / 755 | 4 → 3 | 90 |
| Second KOAN | 87 / 319 | 0 → 0 | 41 |
| INSTRUCTION | 18 / 89 | 0 → 0 | 13 |
| p56 AN END | 25 / 85 | 1 → 1 | 11 |
| p57 PARABLE | 20 / 95 | 3 → 3 | 12 |

Independent holdouts total 615 words, including 299 long words. The rule rescues only the authentic BELEIUE spelling (BELIEUE with an interior swap); OOV falls from 18/615 to 17/615 (all these OOVs are ≥4 runes). The original WIDSOM training example is also rescued. Remaining uncovered forms include technical vocabulary (PRIMES, TOTIENT, MOBIUS, AETHEREAL), author forms such as ILLUSIANS, BEHAUIARS and INHABITNG, and TUNNELNG. These are baseline-normalizer OOVs, not all author errors. No second rule was derived from these heldouts. Across the nine folded native word-length distributions, exact uniform GP29 whole-word expected acceptances increase only from 61.270935 to 61.295540 of 739 words; this is a uniform-string diagnostic, not a cipher-key null or a model of natural language. Vocabulary nevertheless expands more than fivefold to 224,885 distinct GP spellings; partial-key compatibility is much more sensitive than whole-word uniform acceptance.

Re-run the exact frozen original p23–26 502-rune prefix, same 113 groups, continuous q13 and F-hold semantics, unchanged 519-rune holdout. The 64 eligible long groups' conflict graph falls from **64 edges / minimum cover 16** to **17 edges / minimum cover 5** (47 removed, none added). Both genuine cipher controls still recover their exact keys and 424/424 withheld runes; WELCOME still requires one wildcard at word48, second KOAN requires none. Their graph cover bounds remain 1/0.

Go beyond the graph: strict expanded-lexicon CSP returns no key, exact after three search nodes. Every hypothetical solution with at most five arbitrary OOV words must contain a vertex cover of the 17-edge graph. There are exactly two such covers, in zero-based original prefix word indices: [4,16,21,63,108] and [7,16,21,63,108]. Both are size five and exhaust the escape budget. Running the full phase/key CSP with each entire cover wildcarded (any legal plaintext under the same cipher) returns no key, exact in three search nodes each. Thus **at least six of all 113 original words must be outside even the expanded lexicon**. The exact feasible key set for zero through five OOV words is empty. This does not establish that six suffice or that any larger escape budget contains a natural-language solution.

**Interpretation:** the unexpanded 16/113 result remains exact for its original finite dictionary, but its magnitude is not orthography-robust. The new ≥6/113 bound is within the observed variability of solved specialized sections (e.g. WISDOM 9/31 and PARABLE 3/20); it cannot be promoted to a language-independent exclusion. The fixed author-swap-only model and models permitting ≤5 additional arbitrary unknown words are retired. No positive key exists at this calibrated bounded gate, so do not reopen an unconstrained typo/phase search. The tested source-local entomology proxy adds no key classes; only access to a genuinely distinct authenticated original operand or a concrete state/key hypothesis could justify further work. The original 519-rune continuation remains frozen.

Reproducer: [SFT](../sims/lp2_p23_26_orthographic_escape_sft.cjs); [machine-readable full results, edges, covers and exact CSP outputs](../im-results/lp2-p23-26-orthographic-escape-output.json). Executed using the repository's exact input text in the JavaScript runtime, with the unchanged shared solver. This is a distinct finite sensitivity test of #2536, not a recovered LP2 key or plaintext.

### Direct key recovery by all-pair long-anchor joins

A distinct continuation of the orthographic gate attempts **key recovery**, rather than requiring every printed word to be lexical. Unlike the earlier dual-long-anchor affine search (which fixed two longest anchors, used an unexpanded lexicon and fitted full sections), this solver takes the six largest guaranteed consuming lengths in the frozen prefix, permits any pair and the already frozen author-swap lexicon, then withholds the original 519-rune suffix. Period13 additive/F-hold law and intact groups are unchanged.

For each candidate plaintext of a chosen word, compute the contiguous consuming key residues. Group by consuming length, hash the shared residues for each possible relative phase (allow every intervening F-hold count), and join exactly. For complete key candidates, deduplicate cyclic rotations, compute all legal chapter-start phases by backwards reachability, then use wordwise Viterbi with base dictionary match reward 2 per rune, expanded-only match reward 1 per rune, OOV reward0. A key can survive with arbitrarily many OOV words. Freeze the best key and maximizing prefix boundary phase(s) before predicting the suffix.

| Target-excluded native control | Prefix / suffix runes | Complete key classes | Legal classes | Exact key / suffix |
|---|---:|---:|---:|---|
| WELCOME (q13 plant) | 307 / 208 | 935 | 411 | Yes / 208 |
| First KOAN (q13 plant) | 502 / 276 | 518 | 37 | No; no legal suffix |
| LOSS OF DIVINITY (q13 plant) | 401 / 354 | 529 | 19 | Yes / 354 |
| Authentic second KOAN | 222 / 97 | 3 | 2 | Yes / 97 |
| Original p23–26 | 502 / 519 | 163 | **0** | None |

Three of four controls recover the exact key and 659/659 selected continuation runes; WELCOME has a tied suffix path, so exact selected text is not uniqueness. First-KOAN true key is outside the complete two-anchor candidate set, illustrating the method's limited coverage. For the actual original six groups (zero-based indices 16,21,63,95,104,108; each has at least nine non-F ciphertext runes), all 15 unordered pairs necessarily have at least 18 consuming runes for any legal plaintext. The complete joins give 163 key rotation classes, none admitting even a nonlinguistic prefix under the authentic F-hold rule.

Extend to **all partial-coverage joins**, so no pair can escape by leaving unobserved key digits. Over 232 consuming-length/relative-phase cases there are only 165 distinct partial/full key classes: 163 full, two with two unassigned slots. Allow the unassigned slots to choose different residues at every use, an optimistic superset of every fixed key completion; backward reachability still rejects all 165 classes at every start phase. Therefore any actual q13 key must leave at least **five of these six particular groups OOV** under the 224,885-spelling vocabulary. This is an all-key necessary condition for that vocabulary and framing, independent of language scoring. It does not say what those five words are.

Adding the complete six-vertex conflict graph (15 pair edges, nine new) to the prior 17-edge graph yields 26 edges and minimum cover6. Exactly four sets of six words cover the graph:
- [4,16,21,63,95,108]
- [4,16,21,63,104,108]
- [7,16,21,63,95,108]
- [7,16,21,63,104,108]

Full shared phase/key CSP rejects every one with all six words wildcarded, exact in three nodes each. The certified original lower bound improves to **≥7/113 total OOV**, including ≥5/6 longest groups; zero through six escapes are impossible. No authentic key, no unknown plaintext, no original suffix opened. The aggregate bound is still within specialized native register variation; the more targeted five-of-six long-word obstruction is the reason to retire this two-anchor receiver. Do not treat it as a general proof against q13 or a reason to fit arbitrary spelling edits.

[Direct inverse SFT](../sims/lp2_p23_26_six_anchor_inverse_sft.cjs) · [full output, including failed control and all four exact covers](../im-results/lp2-p23-26-six-anchor-inverse-output.json). Both complete and partial joins executed in the connected JS runtime on unchanged original inputs; no CI claimed.

### Source-specific entomological register decision (#2607)

The actual image-source Figure 4 identifies specimen 5 as *Ephemerella ignita*, but #1321's exact 1977 printed guide caption/index and adjoining prose remain publicly inaccessible. The independently identified [website's Archidipterygia subsection and Figures 3–4](https://www.metafysica.nl/wings/wings_14.html) are therefore a **provisional source-local proxy**, not an authenticated 2014 key/register or a substitute for the missing original book. Before using anchor ciphertext, [froze 60 source technical tokens and coverage gate](https://github.com/FlareZ123/liber-primus/issues/2607#issuecomment-7139461613): same GP29 variant spelling and one frozen interior non-F adjacent swap; no stemming or target-derived edits.

The original 42,468/224,885 baseline/expanded vocabulary counts reproduce exactly. Of 60 terms, 54 were outside the expanded lexicon; their full GP variant expansion contributes 952 distinct new forms. On independent 1911 Encyclopaedia Britannica [May-fly](https://en.wikisource.org/wiki/1911_Encyclop%C3%A6dia_Britannica/May-fly) and [Crystallography](https://en.wikisource.org/wiki/1911_Encyclop%C3%A6dia_Britannica/Crystallography) first 200 normalized alphabetic tokens each, the source register rescues three of 16 OOV tokens (mayflies, ephemeridae, cloeon) and zero of 13 unrelated OOV tokens. A distinct unrelated technical set rescues zero mayfly tokens and four occurrences of crystalline in its own holdout. This control uses only 23 baseline-OOV terms matched by normalized Latin length from subsequent crystallography prose, with 31 unmatched source terms; it is not a fully size-matched key-space null. Whole-word uniform GP acceptance gains are approximately 0.00001912 and 0.00001510 expected tokens per 200, respectively, for the source expansion. These are diagnostics under the first valid GP spelling length, not authentic language probabilities. The preregistered three-token coverage gate passes.

The exact same original 113-group/502-rune prefix and six frozen long-anchor positions [16,21,63,95,104,108] are tested with the existing all-partial/full q13 pair-join and authentic latent-F reachability, **not** a new phase or key search. The source additions increase distinct local consuming-key relations by [69,107,107,69,107,107]; the unrelated set by [20,8,8,20,8,8]. Despite those additional relations, **neither expansion produces a single new full or partial key rotation class**. The exact old and new class sets are identical (163 full + two partial = 165), all rejected on the original prefix even if missing key digits can vary on every use. Consequently the five-of-six anchor OOV obstruction remains exact even with this source-selected vocabulary. The 519-rune original suffix is still untouched. No new plaintext/key; retire this particular technical-register rescue. Do not infer that the prior >=7/113 total OOV bound survives every extra technical spelling without rechecking the other graph edges and full CSP, nor that the inaccessible exact 1977 index is excluded.

[Coverage SFT](../sims/lp2_p23_26_entomology_coverage_sft.cjs) · [coverage output](lp2-p23-26-entomology-coverage-output.json) · [exact anchor SFT](../sims/lp2_p23_26_entomology_anchor_sft.cjs) · [anchor output](lp2-p23-26-entomology-anchor-output.json). Both actual connected JS runs completed on committed inputs. A first optional 16-replicate synthetic GP-null batch timed out; the successfully executed source/technical comparator used zero random replicates. Since no new key class exists, additional random-null trials cannot change this exact result. No CI or complete matching claim.

## Decision

Retire the continuous period13 p23–26 intact-word model under the original lexicon and the frozen orthographic expansion allowing up to six additional arbitrary OOV words. Positive recovery of both historical keys and 424/424 heldout runes establishes solver viability. The larger-vocabulary OOV bound does not separate all solved native registers; a genuinely independent source selector is necessary to justify a broader model. No new authentic unknown plaintext/key. Do not retry arbitrary reset/phase schedules without a new independently source-selected clue.

[Executable SFT](../sims/lp2_p23_26_period13_word_relation_sft.cjs), final driver a3ee8bf2e75ddc8ae9b735b817edd5306971f4ca, shared engine 00c8ef4f170aafca716be8a35acbd7b30a64936f; directly executed on original and historical control inputs via a read-only repository-file shim. No CI claim.
