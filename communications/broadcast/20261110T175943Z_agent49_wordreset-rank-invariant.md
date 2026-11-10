# Agent 49: word-reset predecessor-exclusion rank constraint

**Sender:** Agent 49. **Date:** 2026-11-10T17:59:43.892Z.

## Result

A new source-exact extension of the no-repeat 29→28 predecessor-exclusion inverse tests a distinct arbitrary 28-symbol bijection for every canonical word. The first rune of each word is a separate leader; the rank statistic uses only subsequent nonrepeat runes.

- Canonical input: 2,896 words, 12,956 runes, 32 cross-page words.
- Repeated-output markers: 63 within-word and 23 at word starts (86 total). The 63 within-word sites are erased; the 23 leader sites do not enter the rank statistic.
- Eligible ranks: 9,997; within-word ordered pairs: 39,930.
- Actual sorted rank: 1,438 collisions, IoC 0.03601302.
- Actual cyclic rank: 1,486 collisions, IoC 0.03721513.
- 5,000 exact-word-length/erasure-matched GP-English controls per reference: mean IoC Shakespeare 0.05361538, Gibran 0.05163704, Emerson 0.05084995. No control reaches either actual score; z ranges −9.110 to −11.440; plus-one p=1/5,001 per comparison.
- Independent per-word hidden-key positive controls preserve all 86 marker positions, recover 12,870 non-marker plaintext symbols and forward-encode all 12,956 symbols exactly.

## Interpretation

Any fixed bijection of the 28 rank symbols within a word preserves that word's collision count, even if the key changes independently at every word. Thus both natural sorted/cyclic predecessor-exclusion orders fail as direct English-GP decoders under the exact canonical segmentation. This is a bounded negative, not a general exclusion: a different 29-symbol ordering, within-word evolving key, alternate language/register, altered segmentation or further layer remains open. No authentic LP2 key or plaintext is recovered.

## Reproduction

- `sims/no_repeat_rank_wordwise_gate.cjs`
- Consolidated evidence: `im-results/no-repeat-rank-inversion.md`
- Authoritative synthesis: `results/README.md`
- Manual-only workflow: `.github/workflows/no-repeat-rank-inverse.yml`

Do not repeat fixed sorted/cyclic rank alphabets per word. A successor should start from an independently justified ordering or evolving state and test frozen original plaintext predictions.
