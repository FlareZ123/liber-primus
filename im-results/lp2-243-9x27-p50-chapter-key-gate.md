# 243 = 9 × 27: p50 table as a chapter-key schedule — rejected

**Classification:** bounded, source-motivated exploratory negative; no LP2 plaintext or key.

## Why this was worth one test

Several independent source observations invite a compact structural hypothesis:

- The authenticated 2016 message supplies the numbers **243** and **58** and says that words are a map and numbers are direction ([fold/source analysis](lp2-2016-signed-message-fold-square.md)).
- LP2 has **nine** original visual sections ([section map](lp2-global-original-visual-section-map.md)).
- Liber AL II:55 says to obtain the order and value of the English alphabet and find new symbols to attribute to it ([2013 source transcription](../resources/external/2013-book-of-law-II.txt)). Crowley's Old Comment points to *Liber Trigrammaton*, whose 27 trigrams carry English-letter attributions on the first 26 figures ([text and trigrams](https://sacred-texts.com/oto/lib27.htm)).
- The original p50 numerical table contains **256** base-60 byte values. The p32 image has a **13-dot** marker, and 256−13=243=9×27.

The hypothesis was that the 13-dot marker selects a 13-cell leading skip in the p50 table; the remaining 243 values form nine consecutive 27-value keys, one per visual section. A 27-value key repeats within its chapter. The table values are reduced modulo29 and used as a direct additive GP29 key. The alternative is one continuous 243-value key across the whole unknown stream.

This is a hypothesis, not an established creator instruction. In particular, the p32 marker is not adjacent to p50, p49's table is locally preceded by a 10-dot marker, and the 27-trigram period is an interpretive leap rather than a direct LP2 direction.

## Reproducible test

Run from repository root:

    node sims/lp2_243_9x27_p50_chapter_key_gate.cjs

The script uses only the original normalized table and ciphertext corpus plus the pinned English quadgram-count file. It fixes:

- key values = p50 bytes 13 through 255, reduced modulo29;
- chapter boundaries = the nine original visual sections, in page order;
- either one continuous 243-period key or nine 27-period keys, resetting at each chapter;
- both additive signs, with no fitted offsets, alphabets, transpositions or post-hoc plaintext;
- the exact p56 plaintext-F-transparent rule as a separate reachability gate.

## Results

The no-F-skip outputs are not plaintext. Original unknown-stream IoC is **0.0344784** and its smoothed mean English quadgram log score is **−14.4423**; the p57 plaintext control scores **−10.0304**. The four fixed additive candidates score:

| Schedule | Sign | IoC | Mean quadgram log score |
|---|---:|---:|---:|
| Continuous 243 | − | 0.0344490 | −14.4760 |
| Continuous 243 | + | 0.0345109 | −14.5248 |
| Nine chapter keys of 27 | − | 0.0344920 | −14.5447 |
| Nine chapter keys of 27 | + | 0.0344645 | −14.5238 |

Every candidate is at or below the original ciphertext's English score, and none shows linguistic recovery. The p57 control demonstrates that the scoring pipeline distinguishes the solved prose.

The exact F-transparent state search has **no legal complete path** for any fixed schedule/sign. The first dead positions are:

| Schedule | Sign | First dead global rune | Original location |
|---|---:|---:|---|
| Continuous 243 | − | 262 | p1, rune offset 0 |
| Continuous 243 | + | 25 | p0, rune offset 25 |
| Nine 27-key chapters | − | 215 | p0, rune offset 215 |
| Nine 27-key chapters | + | 25 | p0, rune offset 25 |

The nine 27-cell blocks also fail the simpler substitution-alphabet interpretation: their distinct counts after reduction mod27 are **18,18,18,18,19,18,18,19,19**, not permutations of the 27 trigrams.

## Decision

Reject this exact **13-skip / 243-cell / 9×27 / direct additive GP29** consumer. The arithmetic coincidences remain real, but they do not specify a working cipher operation. Do not tune the offset, phase, block order or modulus without an independent original clue selecting that change. The 2016 message, nine-section map, 13-dot markers and 27-trigram source may still have other uses; this negative does not reject those sources generally.
