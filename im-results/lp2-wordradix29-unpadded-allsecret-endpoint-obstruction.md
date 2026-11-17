# Direct base29 numeral-per-word is impossible under every fixed secret rune alphabet

**Classification:** exact original-source, all-secret conditional exclusion. Agent 35, 17 November 2026. No unknown Liber Primus plaintext, key, or solution destination recovered. [Reproducer](../sims/lp2_wordradix29_leadingzero_allsecret_source_sft.cjs).

## Why this reduces a real interpretive choice

The original 2013 signed challenge authenticated the BASE29 3301 to 3QO example, so a returning solver could try to interpret LP2's 29 runes as a stream of base29 **integer digits** rather than letters. The 2016 signed hint mentions "words" and "numbers." Both sources motivate considering a whole-word numeral transport, but neither specifies it. If every *complete printed word* is an independent ordinary base29 integer encoded in minimal positional notation, its most-significant digit must be nonzero whenever the integer has at least two digits. The identity of zero can be a **completely unknown, fixed, secret one-to-one permutation** of the 29 GP runes; one must not assume the familiar rune F has index zero.

The original LP2 transcript, with genuine line/page continuations preserved, has **12,956 unknown runes** and **2,896 printed words**, of which **2,813 contain two or more runes** and 83 have one rune. Source delimiter parsing and all 12,956 indices are checked against lp2-corpus.json.

For these 2,813 eligible multi-rune words, the **initial** symbol count across all 29 original rune identities ranges from **78 to 116 occurrences per rune**. The **terminal** symbol count independently ranges from **75 to 117 occurrences per rune**. There is **no rune missing from either endpoint position**. The original direct GP-index-zero rune F itself occurs as the first glyph of **116** multi-rune words and last glyph of **81**.

## All-secret impossibility, independent of language

Let a completely unknown stationary rune/digit permutation be \(\pi:\mathrm{GP29}\to\{0,\dots,28\}\). Let \(z=\pi^{-1}(0)\) denote its secret zero symbol. In any minimal base29 positional representation of an integer with at least two digits, the *leading* digit must be nonzero. If source word tokens were ordinary big-endian minimal numerals, all 2,813 source initial glyphs would therefore have to avoid \(z\). But **every** one of 29 possible \(z\) occurs **at least 78 times** at those initial positions. This contradiction holds for **all 29! secret alphabet assignments**, without enumerating them.

For the separately plausible little-endian representation, all such words must avoid digit zero **at the terminal position**; again every possible \(z\) occurs at least 75 times. Therefore neither orientation is compatible with an independent, *unpadded* canonical base29 number encoded by every original printed word using a single global rune-to-digit bijection, even if all actual integer values are unconstrained and entirely unknown.

No shuffle null, language-model probability, encryption key search, or speculative plaintext is involved. The [read-only Windows Node22 CommonJS SFT](../sims/lp2_wordradix29_leadingzero_allsecret_source_sft.cjs) verifies exact full-source rune identities, all printed words, both complete 29-symbol endpoint histograms and both minimum counts.

## What remains possible

A fixed-width **zero-padded** byte/field encoding, per-word zero escape, page-dependent secret digit alphabet, leading-zero-preserving numerical code, cipher layer on numeral digits, and arbitrary variable-length prefix code are **outside** the excluded family. Those changes require their own original clue and executable consumer. This result does not exclude the signed BASE29 instruction as a clue: it only eliminates the direct minimal-integer **printed-word** interpretation with any fixed hidden rune-to-digit alphabet and either digit direction. Any claim that ciphertext word lengths alone reveal source integers must first address these forced leading-zero violations.

**Decision:** retire the entire direct unpadded whole-word numeral family; seek evidence for an independent word codec or key before translating printed words to integers.
