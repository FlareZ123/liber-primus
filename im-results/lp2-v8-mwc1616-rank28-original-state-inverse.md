# 2014 V8 MWC1616 state recovery against original LP2 nonrepeat runes

## Source-constrained decision, 23 November 2026

**No original rune plaintext or V8 generator state was recovered.** One historically motivated direct-emission hypothesis is excluded: the original `C[i+1]-C[i] mod29 - 1` 28-way successor ranks are *not* a page-started sequence of ordinary 2014 V8 `Math.floor(28*Math.random())` outputs, for the ten specified page starts under either of the two MWC1616 half-lane multipliers. The decision is exact at 28 consecutive rank outputs, allowing every low-lane rounding possibility. It does **not** exclude a V8 keystream combined with unknown plaintext, discarded generator outputs, different clock phase or key derivation.

The direct human clue is the solved LP1 page 5 emphasis on the totient function: phi(29)=28, matching the 28 possible nonrepeating successor runes after a given GP29 rune. The historically specific V8 proposal is motivated by 2014 browser-era tools, but no archived first-party instruction actually selects V8. A separate prior test in this repository, `sims/lp2_mwc1616_p50_sft.cjs`, checked raw V8 outputs against the independent 256-byte numerical table and does **not** test the 12,956-rune unknown LP2 cipher step stream.

## Direct original-input inversion

The frozen model takes the first runic symbol on each candidate physical page as transmitted initial state and decodes the next 28 successive nonzero differences to the integer ranks 0–27. Pages **p0, p1, p2, p15, p16, p40, p43, p49, p53, p55** each have 28 nonzero adjacent ciphertext differences at their physical starts.

A 2014 V8 MWC1616 output consists of a 16-bit high lane followed by a 16-bit low lane. The historical recurrence for each 32-bit half-state is `S'=a*(S&65535)+(S>>>16)`, for `a=18030` or `30903`. The direct model uses `floor(28*((high16*65536+low16)/2^32))`.

Instead of guessing 2^32 states, enumerate the approximately 2,340 permissible first high16 outputs and 2,340 permissible second high16 outputs. The first two observed ranks imply a unique possible initial high16 carry, `(secondLow16-a*firstLow16) mod65536`, which must be less than the source multiplier. The state recurrence then predicts every later 16-bit high lane. To include the second generator **without** guessing its unknown state, allow each observed rank to originate from its exact high16 bin or the immediately preceding high16 value whenever some possible 16-bit low lane can cause rounding into the next bin. This is a mathematical necessary condition for all full V8 streams, so failure excludes every second-lane seed under this model.

Both multipliers are tested separately against the same ten fixed page-start windows, without fitting phase, text, lexicon, word boundaries, alternate shifts or keys.

## Outcome and next research decision

- **20** original fixed page/multiplier combinations, each with **28** consecutive successor ranks, all derived automatically from the canonical original LP2 corpus.
- The **best** any candidate MWC half-state could achieve, even under low-lane-compatible rounding, was **7** consecutive ranks (p15 with multiplier30903). Other windows reached only five or six.
- **Zero** complete 28-rank seed-state trajectories. The direct source-aligned model is rejected for every tested page start.
- Two positive plants use actual full two-lane MWC1616 outputs with the historical multipliers, each recoverable exactly from its 28-rank stream by the same state scanner. The planted second half-state is never supplied to the inverse.
- The original experiment is restricted to the ten listed natural page starts. No inference is made about an independently keyed V8 stream XORed/added with unknown plaintext. Such a stream is information-theoretically masked without external key material.

**Reproduction:** [original-input self-contained CommonJS single file](../sims/lp2_v8_mwc1616_rank28_original_sft.cjs). The script reads `resources/liber-primus/lp2-corpus.json` and reports per-page seed counts and maximum prefix lengths. It has no dependency on web access, external corpora or probabilistic English scoring. Because source-derived known plaintext has not emerged, this line is closed rather than expanded into speculative seed, phase or cipher-masking searches.
