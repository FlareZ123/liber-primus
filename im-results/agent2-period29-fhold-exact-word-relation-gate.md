# Exact period-29 F-hold word-relation key recovery

Agent2, 2026-11-24, follow-up to [Director #2537](https://github.com/FlareZ123/liber-primus/issues/2537) and [Agent15's existing collision selector and EM calibration](agent15-period29-fhold-calibration.md). Agent15's lease had expired; this is a distinct exact algorithm, not another random-start EM run. The Dickins 1915 GP alphabet source match motivates testing period 29, not evidence that LP2 uses it.

## Exact solver

At a word boundary let s be consuming key phase modulo 29. For ciphertext word c and each finite-lexicon spelling p of the same rune length, discard p if any p=0 has c!=0. For every other position compute d=(c-p) mod29. A row contains the sequence of consuming shifts d, its length m, its plaintext p, and possible starting phases s. Each row imposes K[(s+i) mod29]=d[i] and adjacent boundary phase s'=(s+m) mod29. Ciphertext F may have either interpretation; plaintext F alone is transparent.

Each word is therefore a relation over two phase boundaries and shared key residues. Use bit masks for possible starts and key domains. At each propagation step, restrict rows by the current start/end domains and required key values, then project surviving rows onto the two boundaries and every key residue assigned by all surviving possibilities. If any row leaves a key residue unassigned, that relation does not constrain that residue. Repeat bidirectionally to a fixpoint. If necessary branch on the smallest non-singleton key/boundary domain, with no scoring or beam pruning. Once all key domains singleton, count complete paths capped at 2 and reconstruct a witness; re-encrypt exactly. Stop after proving >=2 distinct keys or explicit node cap. Unknown initial phase is absorbed into cyclic rotation of the key.

The lexicon is the frozen 38,920 native GP spellings from TextBlob and LP1, expanded before any target inference by adding unordered full vocabularies of the public Gibran and Shakespeare donor texts (40,540 distinct spellings). Whole donor lexicons include their plant words, but no word order, key, or crib. Therefore this calibrates exact inference under in-vocabulary plaintext, not unrestricted open-language success.

## Native positive controls

Deterministically planted uniform-ish pseudorandom 29-residue keys, independently rotated by a random initial phase. Continuous exact F convention. Fixed key recovered on prefix, then frozen for full path resolution including untouched continuation. The returned full paths were unique and 100% exact. These are new positive controls where prior EM failed; no claim of general recovery for all texts.

| Native plant | Prefix runes | Withheld runes | Ciphertext Fs | Plaintext F holds | CSP search nodes | Exact key/holdout |
|---|---:|---:|---:|---:|---:|---|
| LP1 Koan1 suffix | 220 | 72 | 9 | 6 | 3 | 29/29, 72/72 |
| Gibran, continuous source opening | 405 | 295 | 47 | 17 | 13 | 29/29, 295/295 |
| Shakespeare, continuous source opening | 403 | 301 | 38 | 19 | 23 | 29/29, 301/301 |

Calibration commit 84c37362eefaae27ee10660a3e853839b0992bae; frozen original target comment [7126776207](https://github.com/FlareZ123/liber-primus/issues/2537#issuecomment-7126776207).

## Frozen original p54–55 prefix

Agent15's original source-independent collision selection already chose p54–55 (3/96 native joint passes). Do not repeat chapter selection. Freeze first complete words reaching >=200 runes: 45 words, 205 runes, leaving 103 untouched. Run exact CSP with phase0 at chapter start and unknown key modulo rotation. Result **zero possible keys**, 1 search node (propagation alone), 6 passes, 867,081 surviving-row visits, 127,209 initial word rows. No cap and no score. Original 103-rune continuation was not used for key inference. No key means no continuation prediction.

## Robustness to missing lexicon words

The prefix has three ciphertext Fs. Enumerate all eight masks of transparent/consuming F interpretations. Each fixes every consuming phase and all non-F constraints K_phase != ciphertext rune. For each word construct a table of its allowed partial key assignments, with exactly the specified F mask. If two word tables have disjoint projections onto shared key phases, those words cannot both be in-vocabulary for any shared key. Create an incompatibility graph; every collection of OOV words must cover all edges, plus any independently impossible word. Exact minimum vertex cover by branching on high-degree vertex v (include v or all its neighbors), with disjoint-edge matching lower bound and memoization, gives:

| F mask | Pairwise incompatible word pairs | Minimum required OOV words (lower bound) |
|---:|---:|---:|
| 0 | 28 | 10 |
| 1 | 29 | 11 |
| 2 | 31 | 8 |
| 3 | 36 | 12 |
| 4 | 33 | 11 |
| 5 | 34 | 12 |
| 6 | 36 | 9 |
| 7 | 41 | 13 |

Thus any q29 key under the tested F convention and fixed printed boundaries must yield at least **8 of 45 prefix words outside this expanded lexicon**. This is an exact lower bound, not the achieved optimum; higher-order conflicts can require more. Independent exact <=2-OOV budget search returns zero on every mask without entering key branching. The bound allows arbitrary out-of-vocabulary word content, while preserving native rune alphabet and hold semantics.

## Decision

A stronger blind method recovers three independent planted keys and 668 withheld native runes exactly, but the source-selected original chapter prefix has no solution in the tested lexical family. Even a small number of unfamiliar words cannot explain the failure. Retire this bounded continuous period-29 intact-word/native lexicon model on p54–55, rather than expanding periods or inventing alternative resets. This does not exclude arbitrary-register plaintext, substantial OOV content, or a different cipher. No new original plaintext or key.

[Executable CJS reproducer](../sims/lp2_period29_fhold_word_relation_csp_sft.cjs), final code commit d3fc33b25c50070445e8ed02022207dd5d37dbc9. Actual executed via read-only repository-file shim; no external CI assertion. 
