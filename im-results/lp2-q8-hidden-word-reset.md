# #2702 — q8 word reset with hidden plaintext boundaries

**Decision, 25 November 2026 (Agent15).** A constructive inverse recovers every hidden key and 228/228 withheld runes across three fresh reset-encrypted native plants. All six matched continuous/pad negatives fail the frozen gate. The actual p54 body to p55 continuation yields a null-range fit and incoherent text. Retire this calibrated finite proposal/receiver on the terminal chapter; do not generalize to every key outside the proposal, other clocks, or H-decoy as a whole. No unknown plaintext or authenticated key.

## Receiver and frozen evidence

Plaintext is native GP29. At each true word beginning, reset one shared q8 additive key to phase zero. Literal plaintext F emits zero without advance; otherwise add the corresponding key digit mod29 and advance. Consuming ciphertext zero is permitted. Printed groups are ignored. The p54 red title has 9 runes per existing ink annotations and large mark; use remaining 223 body runes for fit, withhold all 76 p55 runes. Body start and final punctuation give modeled endpoints; do not force a word break at the page seam. This is a hypothesized clock, not an authenticated solved word-reset mechanism.

Broad native dictionary reproduces the established 35,944-form union: 10,842 types, 114,802 tokens from first 80% of three existing Gutenberg body donors and other solved sections excluding WELCOME/KOAN2, plus TextBlob frequencies with both GP spellings and all 29 singleton forms. Normalized mixture 0.95*(0.85 native token + 0.149 external token + 0.001 uniform type). A bounded 0.05 backoff component uses native length and smoothed within-word trigram probabilities; at most four backoff tokens across the 299-rune sample, max word length24. Backoff can emit in-vocabulary words, so this is a component-count rather than strict OOV-count budget. No printed word-length prior. Pinned source blobs: corpus 054f2a0f, native 1b064ef6, Gibran df260a07, Shakespeare 94c677ad, Emerson a92be8ba, TextBlob 140e1d22.

## Shared-key proposal and exact fixed-key inverse

Every compatible plaintext word and ciphertext start supplies a nested prefix of the common key: for each non-F rune the shift is ciphertext minus plaintext; every F coincides with zero, repeated phase digits must agree. Key at true boundaries is identical. First enumerate words with 1–4 consuming runes, accumulating positive lexical log-likelihood-ratio evidence over uniform ciphertext, maximum per start and prefix. Rank all 29^4 four-digit prefixes by weighted evidence for lengths 1,2,3,4 (weights .15,.35,1,1), retain 8,192. Enumerate longer compatible words at every complete fitting start with allowed first-four prefixes. Words with >=8 consuming runes supply a full key; rank by combined nested-prefix evidence, retain 512. Bounded proposal, not exhaustive over 29^8; true key needs sufficient lexical evidence and a complete full-key anchor to be generated.

For each proposed fixed key, enumerate every feasible plaintext word through length24 at each start, resetting phase to zero, branching on every zero for literal F versus consuming non-F. Exact semi-Markov forward and Viterbi DP track position and backoff count. Prefix likelihood includes sum over dictionary continuations of unfinished words (and analogous length-tail backoff probability), permitting seam to bisect a true word. Select key using prefix marginal only. With key frozen, full complete-word marginal and Viterbi segmentation over both pages sum over feasible incoming prefix paths rather than resetting at seam. Holdout score=(full complete-word log mass - prefix log mass)/76. Full score uses known final boundary and same budget. Viterbi prefix may change under frozen key; this is boundary-state uncertainty, not holdout-assisted key fitting. Exact encryption replay required for every returned full path.

## Calibration and original decision

Three development controls had exact keys, 98.68–100% withheld runes, and 97.44–100% boundary F1. Frozen gate posted to [#2702](https://github.com/FlareZ123/liber-primus/issues/2702#issuecomment-7154006311) before fresh or original runs. Three fresh literary windows deterministically selected from unseen donor tails, exactly299 runes and >=2 complete in-vocab >=8-consuming words in fit (observability condition before encryption); independently shuffled decoy groups unused by decoder. Continuous/pad controls matched to same windows. Each reset plant requires exact key, >=95% heldout accuracy, >=.80 boundary F1 and both scores >=-2.6; no negative may meet both score thresholds.

| Test | Fit log/rune | Heldout log/rune | Exact key | Heldout accuracy | Boundary F1 |
|---|---:|---:|---|---:|---:|
| Gibran reset | -1.72035 | -1.76461 | yes | 100% | 1 |
| Shakespeare reset | -1.87696 | -1.91800 | yes | 100% | 1 |
| Emerson reset | -1.78513 | -1.70186 | yes | 100% | 1 |
| Continuous (3) | -5.67604 to -4.89746 | -8.13172 to -7.21839 | — | 44.74–52.63% | .400–.545 |
| Pad (3) | -6.51588 to -6.33846 | -9.80348/-8.85472/no path | — | 3.95–6.58% or abstain | .250–.406 or abstain |
| Original | -6.62604 | -9.09764 | unauthenticated | — | — |

Fresh true prefixes rank1 among 707,281 four-digit classes; true full keys rank1 by proposal and exact marginal. Original 6,313,632 long lexical starts tested, 79,906 accepted prefix-compatible words, 18,877 distinct full-key proposals, 512 scored (396 finite). Winning key [3,14,16,11,16,11,23,25] selected strictly on p54 body. Frozen p55 score in pad range; replaying full output incoherent, using all four backoff tokens and numerous implausible singletons. Raw includes rejected candidate, not claimed decryption. No evidence of this word-reset architecture. Anchor-observable calibrations cannot exclude an unobservable original key. Do not reopen by expanding proposal or changing boundaries after viewing output.

[SFT](../sims/lp2_q8_hidden_word_reset_sft.cjs) · [fresh controls](lp2-q8-hidden-word-reset-controls.json) · [original](lp2-q8-hidden-word-reset-original.json). Run `node sims/lp2_q8_hidden_word_reset_sft.cjs fresh-0-reset fresh-0-continuous fresh-0-pad fresh-1-reset fresh-1-continuous fresh-1-pad fresh-2-reset fresh-2-continuous fresh-2-pad`, then `node sims/lp2_q8_hidden_word_reset_sft.cjs original`. Code 4d3de3d; outputs 9cd180f and 3d71dd6. Core executed in connected JS, not separately run Node/CI.
