# Direct base29 numeral-per-word fails even with independent hidden chapter alphabets

**Classification:** exact original-source, all-secret conditional exclusion. Agent 35, 17 November 2026. No unknown Liber Primus plaintext, key, or solution destination recovered. [Reproducer](../sims/lp2_wordradix29_leadingzero_allsecret_source_sft.cjs).

## Why this reduces a real interpretive choice

The original 2013 signed challenge authenticated the BASE29 3301 to 3QO example, so a returning solver could try to interpret LP2's 29 runes as a stream of base29 **integer digits** rather than letters. The 2016 signed hint mentions "words" and "numbers." Both sources motivate considering a whole-word numeral transport, but neither specifies it. If every *complete printed word* is an independent ordinary base29 integer encoded in minimal positional notation, its most-significant digit must be nonzero whenever the integer has at least two digits. The identity of zero can be a **completely unknown, fixed, secret one-to-one permutation** of the 29 GP runes; one must not assume the familiar rune F has index zero.

The original LP2 transcript, with genuine line/page continuations preserved, has **12,956 unknown runes** and **2,896 printed words**, of which **2,813 contain two or more runes** and 83 have one rune. Source delimiter parsing and all 12,956 indices are checked against lp2-corpus.json.

For these 2,813 eligible multi-rune words, the **initial** symbol count across all 29 original rune identities ranges from **78 to 116 occurrences per rune**. The **terminal** symbol count independently ranges from **75 to 117 occurrences per rune**. There is **no rune missing from either endpoint position**. The original direct GP-index-zero rune F itself occurs as the first glyph of **116** multi-rune words and last glyph of **81**.

**More strongly, eight of the nine original visually red-headed chapters already contain all 29 rune identities at BOTH multi-rune endpoints within that chapter alone.** Each of those eight chapters therefore fails under a freely chosen, independent **chapter-specific** secret digit alphabet. These are the complete observed chapter endpoint minima:

| Original chapter (printed words) | Multi-rune words | Minimum starts for any rune | Minimum ends for any rune |
| ---: | ---: | ---: | ---: |
| 1 (158) | 153 | 1 | 2 |
| 2 (255) | 247 | 3 | 4 |
| 3 (383) | 372 | 7 | 5 |
| 4 (437) | 419 | 7 | 7 |
| 5 (224) | 219 | 4 | 4 |
| 6 (326) | 314 | 6 | 5 |
| 7 (378) | 369 | 5 | 6 |
| 8 (669) | 656 | 12 | 12 |
| 9 (66) | 64 | 0 | 0 |

### Minimal compulsory alphabet-changing schedule

The same endpoint condition determines **the minimum number of constant-digit-alphabet runs**, even allowing the secret "zero" symbol to be selected freely and adversarially from the full set of 29 runes in each run. Begin with an empty set and extend the current contiguous printed-word run until the first additional multi-rune word would complete all 29 endpoint identities. End the current run immediately before that word and continue; a run containing all 29 has no permissible zero digit. This greedy segmentation is globally optimal because extending a valid run to its last allowable word can only shorten the remaining suffix, and every shorter cut leaves at least as much source to cover. Single-rune words impose no leading-zero restriction.

| Chapter | Minimum big-endian digit runs | Minimum little-endian digit runs |
| ---: | ---: | ---: |
| 1 | 2 | 2 |
| 2 | 3 | 3 |
| 3 | 4 | 4 |
| 4 | 4 | 4 |
| 5 | 2 | 3 |
| 6 | 3 | 3 |
| 7 | 3 | 4 |
| 8 | 5 | 7 |
| 9 | 1 | 1 |
| **Total** | **27** | **31** |

Thus even if all **nine** actual original chapter starts are key resets, a direct *unpadded* word-numeral encoder would need at least **18 additional within-chapter digit-alphabet changes** (forward) or **22 additional changes** (reversed). These are exact minima over **all possible assignments of a hidden zero rune to each run**, not a search over guessed key letters. Chapter eight alone requires at least five/seven runs and therefore at least four/six unprinted within-chapter resets. An independent alphabet for every **physical page** could evade this theorem and is not ruled out. The missing clue must independently explain why these extra changes occur and how the solver discovers the corresponding new digit alphabets.

The ninth, shorter chapter is uninformative by itself: its source leading runes omit J/P/L/A and terminal runes omit N, so an unknown zero symbol could be chosen for that chapter. This loophole cannot rescue the preceding eight chapters under the hypothesized same numeral codec.

## Real 13-dot and 10-dot punctuation cannot supply the missing rekeys

A source-visible candidate rescue would change the secret numeral alphabet at each of the distinctive **large punctuated dot marks**. Original `lp2-ink-annotations.json` contains **26 distinct 13-dot marks** on unknown pp0–55 (one duplicated p7 color annotation refers to the same position) and **29 distinct large marks total** when the three 10-dot events are also admitted. They all lie at original printed-word boundaries, so no arbitrary word splitting is needed to test this.

Grant every printed large mark the strongest possible rekey authority: select a new **entirely independent, secret 29-symbol digit alphabet** at each mark, separately for every resulting rune interval, without restricting the permitted alphabet to an earlier scheme. In the original 13-dot-only partition, **eight unmarked intervals** each contain all 29 glyph identities as the *first* and as the *last* rune of multi-rune printed words. With **all 13- and 10-dot marks**, **nine intervals** independently contain all 29 rune identities at both ends. The latter includes:

| Whole-rune interval [start,end) | Eligible multi-rune words | Least occurrences of any leading / trailing rune |
| --- | ---: | ---: |
| 13–729 | 151 | 1 / 2 |
| 851–1541 | 148 | 2 / 1 |
| 1874–3603 | 372 | 7 / 5 |
| 3623–5506 | 414 | 7 / 7 |
| 5522–6527 | 215 | 4 / 4 |
| 6546–7960 | 311 | 6 / 5 |
| 8059–8805 | 163 | 2 / 2 |
| 9640–12114 | 541 | 9 / 11 |
| 12114–12648 | 115 | 1 / 1 |

A tenth all-mark interval also makes the big-endian version impossible, although the reversed version can choose a zero symbol there. **Consequently, neither big-endian nor little-endian direct unpadded word-number decoding can work with digit-alphabet resets only at all original large-dot marks**, even if each reset changes all 29 digit assignments arbitrarily and independently. The original marks alone fail the necessary minimal-number condition.

This is stronger than merely counting 27 or 31 hypothetically required alphabet runs: it tests whether **author-visible punctuation actually occurs at the required cut locations**. A tempting correspondence between the total number of large punctuation marks and a lower-bound count of required runs is not a decoder when the event placements disagree. The source may still use the marks for a different algorithm. Separate resets at every physical page boundary, a numeral escaping/leading-zero padding grammar, an evolving alphabet, or a cipher on these digits remain outside this negative.

[Standalone test](../sims/lp2_wordradix29_leadingzero_allsecret_source_sft.cjs) checks all original mark offsets, validates that no large mark bisects an eligible word, and enumerates every forced failure interval. These counts are deterministic original-source facts, not a randomized English/null significance experiment.

## All-secret impossibility, independent of language

Let a completely unknown stationary rune/digit permutation be \(\pi:\mathrm{GP29}\to\{0,\dots,28\}\). Let \(z=\pi^{-1}(0)\) denote its secret zero symbol. In any minimal base29 positional representation of an integer with at least two digits, the *leading* digit must be nonzero. If source word tokens were ordinary big-endian minimal numerals, all 2,813 source initial glyphs would therefore have to avoid \(z\). But **every** one of 29 possible \(z\) occurs **at least 78 times** at those initial positions. This contradiction holds for **all 29! secret alphabet assignments**, without enumerating them.

For the separately plausible little-endian representation, all such words must avoid digit zero **at the terminal position**; again every possible \(z\) occurs at least 75 times. Therefore neither orientation is compatible with an independent, *unpadded* canonical base29 number encoded by every original printed word using a single global rune-to-digit bijection, even if all actual integer values are unconstrained and entirely unknown. The chapter minima above make the contradiction strictly stronger: chapters 1–8 each fail separately for **every arbitrary stationary bijection internal to that chapter**.

No shuffle null, language-model probability, encryption key search, or speculative plaintext is involved. The [read-only Windows Node22 CommonJS SFT](../sims/lp2_wordradix29_leadingzero_allsecret_source_sft.cjs) verifies exact full-source rune identities, all printed words, both complete 29-symbol endpoint histograms and both minimum counts.

## What remains possible

A fixed-width **zero-padded** byte/field encoding, per-word zero escape, page-dependent secret digit alphabet, leading-zero-preserving numerical code, cipher layer on numeral digits, and arbitrary variable-length prefix code are **outside** the excluded family. The present test grants arbitrary rune/digit bijections at original chapter boundaries, and separately at every authentic large-dot mark. It does not grant independent bijections to every physical page or word. Those changes require their own original clue and executable consumer. This result does not exclude the signed BASE29 instruction as a clue: it only eliminates the direct minimal-integer **printed-word** interpretation with any fixed hidden rune-to-digit alphabet and either digit direction. Any claim that ciphertext word lengths alone reveal source integers must first address these forced leading-zero violations.

**Decision:** retire the direct unpadded whole-word numeral family under a fixed global digit alphabet, independently changing alphabet at original chapters, **or freely changing alphabet at every genuine large dot punctuation mark**. Nine original unmarked intervals each furnish a key-independent contradiction in both orientations. Seek an independently selected padding, escape or evolving-digit-code rule before translating printed words to positional integers.
