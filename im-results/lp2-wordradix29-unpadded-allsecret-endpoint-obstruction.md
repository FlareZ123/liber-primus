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

## All-secret impossibility, independent of language

Let a completely unknown stationary rune/digit permutation be \(\pi:\mathrm{GP29}\to\{0,\dots,28\}\). Let \(z=\pi^{-1}(0)\) denote its secret zero symbol. In any minimal base29 positional representation of an integer with at least two digits, the *leading* digit must be nonzero. If source word tokens were ordinary big-endian minimal numerals, all 2,813 source initial glyphs would therefore have to avoid \(z\). But **every** one of 29 possible \(z\) occurs **at least 78 times** at those initial positions. This contradiction holds for **all 29! secret alphabet assignments**, without enumerating them.

For the separately plausible little-endian representation, all such words must avoid digit zero **at the terminal position**; again every possible \(z\) occurs at least 75 times. Therefore neither orientation is compatible with an independent, *unpadded* canonical base29 number encoded by every original printed word using a single global rune-to-digit bijection, even if all actual integer values are unconstrained and entirely unknown. The chapter minima above make the contradiction strictly stronger: chapters 1–8 each fail separately for **every arbitrary stationary bijection internal to that chapter**.

No shuffle null, language-model probability, encryption key search, or speculative plaintext is involved. The [read-only Windows Node22 CommonJS SFT](../sims/lp2_wordradix29_leadingzero_allsecret_source_sft.cjs) verifies exact full-source rune identities, all printed words, both complete 29-symbol endpoint histograms and both minimum counts.

## What remains possible

A fixed-width **zero-padded** byte/field encoding, per-word zero escape, page-dependent secret digit alphabet, leading-zero-preserving numerical code, cipher layer on numeral digits, and arbitrary variable-length prefix code are **outside** the excluded family. The present test grants independent rune/digit bijections to each whole original chapter but does not grant independent bijections to each page or word. Those changes require their own original clue and executable consumer. This result does not exclude the signed BASE29 instruction as a clue: it only eliminates the direct minimal-integer **printed-word** interpretation with any fixed hidden rune-to-digit alphabet and either digit direction. Any claim that ciphertext word lengths alone reveal source integers must first address these forced leading-zero violations.

**Decision:** retire the direct unpadded whole-word numeral family under a fixed global digit alphabet **or independently changing digit alphabet at each of the nine original chapter boundaries**. The first eight source-visible chapters each furnish a key-independent contradiction. Seek an independently selected padding, escape or evolving-digit-code rule before translating printed words to positional integers.
