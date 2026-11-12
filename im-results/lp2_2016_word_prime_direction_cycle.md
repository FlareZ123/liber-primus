# Source-visible word-number navigation does not yet decode LP2

**Agent 28, 12 November 2026. Classification: executable original-input navigation hypothesis and bounded negative readout; no recovered plaintext, authenticated key, or destination.**

## Human solve-path premise

The authentic, signed 2016 continuation says: “Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.” The already authenticated 2013 Gematria Primus table gives a specific numerical operation for a word: add its rune-associated prime weights. This allows a player to number the visibly separated words and attempt a directed route without guessing a password. The crucial unestablished premise is **which** movement rule, direction and readout (if any) the authors intended. A forward jump by the current printed word's prime sum is one minimal reversible-to-reproduce candidate, not a signed instruction.

Across original unsolved physical LP2 pages 0–55, including words crossing printed page boundaries, the canonical transcription contains **2,896 printed rune words and 12,956 GP glyphs**. The complete exact word-to-rune stream matches the source numeric corpus.

The tested deterministic operation is:

\`\`\`
s[i] = sum(GP-prime-weight(rune) for rune in printedWord[i])
next(i) = (i + s[i]) mod 2896
\`\`\`

Start at printed word index 0, then repeatedly follow \`next\` until visiting a word again. This rule uses only published runes, authenticated GP weights and published word boundaries; it fits no unknown ciphertext key.

## Exact original navigation

- Initial word's GP-prime sum is **347**, so word 0 points to word 347.
- The first 20 visited indices are \`[0,347,592,754,1646,1772,2214,2550,2787,269,432,623,1108,1305,1331,1499,1679,1981,2132,2305]\`.
- After **12** moves the route enters a **90-word cycle** beginning at global word index **1108**. The complete directed function on all 2,896 original words has **exactly one** directed cycle, also of length 90. The remaining words lead into it.
- The first rune of each of these 90 source words, read in cycle order, begins \`A U T NG D Y IA B OE D L N P A I EO P TH E T Y T X I C OE EA D I W\`, with GP29 symbol IoC **0.0357053683**, indistinguishable from a visually random string at this length.
- Using solved p56's authentic prime-totient offsets in both simplest index-phase-zero orientations yields first-rune GP29 IoCs **0.0324594257** (subtract) and **0.0349563046** (add). Neither provides language-like plaintext. The SFT also prints the unfitted last-rune, word-prime-sum-residue and word-length-residue cycle readouts.

The number **90** also appears as a Fibonacci-derived index in the established p15 spiral, but **that relationship was noticed after the route was found**. Neither the 2016 source nor the image tells a player to identify the word-routing cycle with p15's 16-value spiral or consume its 90 entries as a key. It is not treated as an intended bridge.

Importantly, the remarkable two-word ciphertext duplication \`DJU-BEI\` on p27 and p55 is absent from both the 90-word cycle and the actual first-word route. This route does not explain the independently observed bookend repetition.

## Exact-layout matched controls

A finite shuffle test keeps the **2,896 actual word slots, lengths, and word-start physical page**. Inside each \`(page, word-length)\` stratum it permutes the multiset of *complete original GP-prime sums*. Thus 526 bins, including 87 singleton bins, preserve a page's word-length profile and the numerical values available at those word positions. For each reshuffled full book, the *whole* functional graph is rebuilt.

With fixed xorshift32 seed \`0x554e2016\` and **5,000** independent deterministic shuffles:

| Graph statistic | Original LP2 | Matched shuffled books |
| --- | --- | ---: |
| Exactly one directed cycle | Yes | 1,277 / 5,000 |
| Exactly one directed cycle of length 90 | Yes | 0 / 5,000 |
| Exactly one directed cycle of length **at least 90** | Yes | 134 / 5,000 |

The conservative directionally monotone threshold “one cycle of length ≥90” gives a plus-one conditional frequency of **135/5001 ≈ 0.02699**. The exact-length 90 result is post-selected and is **not** a legitimate discovery-level p-value. The rule and its null were investigated after multiple manuscript-wide experiments. No correction for that larger search is possible here. Consequently the moderate tail rank is insufficient to certify that this route was planted.

## Decision and reproducibility

The simplest signed-phrase-motivated map produces an entirely reproducible but **opaque** 90-word cycle. It does not select an LP2 ciphertext inverse, reveal a plaintext word, or provide authenticated key material. Do not treat the cycle length, a single GP rune per word or the p15 coincidence as a cipher solution. A successor would need an original clue independently fixing the movement and readout, then a whole-interval original-cipher prediction that outperforms the present source-native and page-length-matched controls. An arbitrary set of alternative step functions or post-selected cycle-character decoders would not meet that threshold.

[Single-file original-source CommonJS reproducer](../sims/lp2_words_prime_direction_cycle_sft.cjs) reads \`resources/lp2-transcription.txt\` and \`resources/liber-primus/lp2-corpus.json\`, asserts full rune equality and original walk invariants, prints all direct cycle readouts, and runs the 5,000 matched shuffles. It includes a small planted modular-cycle control. Run manually with Node.js 22; no automatic CI workflow or additional dependency was introduced.
