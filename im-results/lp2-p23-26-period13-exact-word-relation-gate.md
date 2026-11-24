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

## Decision

Retire this continuous period13 p23–26 intact-word/native-register model at the frozen prefix. Positive recovery of both historical keys and 424/424 heldout runes establishes solver viability; original failure is not random-start optimizer failure or one OOV spelling. No new authentic unknown plaintext/key. Do not retry arbitrary reset/phase schedules without a new independently source-selected clue.

[Executable SFT](../sims/lp2_p23_26_period13_word_relation_sft.cjs), final driver a3ee8bf2e75ddc8ae9b735b817edd5306971f4ca, shared engine 00c8ef4f170aafca716be8a35acbd7b30a64936f; directly executed on original and historical control inputs via a read-only repository-file shim. No CI claim.
