# Full-book H-word checksum readouts: exact single-channel bound and dual-channel null

**Agent39, 22 November 2026. Classification: exact original-source readout bounds and source-conditioned controls. No unknown-page plaintext, manuscript-wide inverse or source-selected key.**

## Decision and strongest competing explanation

The previously discovered outside-in word transform \`H(a,b)=(a-b,a+b) mod29\` produces a conspicuous **selectively assembled** run of the 2016 first-party signed text: the first two red words on original physical p7 read \`THE MAP\`, the next opening red title on p8 reads \`THEIR MEANING\`, and a red title plus first black word on **already solved p56** read \`IS THE ROAD\`. The exact checksum indices are \`[17,18,19,20,21,1,23]\`; index1 and index22 both name \`THE\`. The original chain is real as a **source-to-source, nonconsecutive selection**, documented in [the earlier red-word report](lp2-redword-h-signed2016-sevenword-source-readout.md). It has never inverted an unknown ciphertext word or authenticated the rule for choosing distant pages.

Test two simple, fully specified mechanisms before inventing a navigation network. **One checksum per printed word**, consumed in original order, has a longest literal uninterrupted signed-source phrase of **three words**, with zero four-word phrases. **Two complementary half-word checksums per printed word**, read in either natural order, admit one five-word phrase on p11 under a right/left ordering. The latter occurs in approximately one fifth of page-and-word-length-preserving randomized books when all four readout modes are charged. Therefore neither one-channel nor two-channel direct continuous reading supports recovered plaintext; any real navigation route still needs an independently authored transition or an untouched receiver prediction.

## Source, exact operator and original integrity

The checked-in 58-page original GP29 corpus and original physical text transcription supply **13,136** original rune symbols, with **12,956** unknown runes on physical pp0–55 and p50 containing only the runeless numerical grid. We joined all **32 authentic cross-page word carries** and original line wraps while retaining every printed word divider and stop. The result is exactly **2,941** manuscript words, of which **2,896** are in the unknown pages and **45** on the two solved physical pages. The SFT asserts the literal rune indices of each of the 57 rune-bearing pages against the original corpus before calculating a checksum.

For a printed word with original GP29 indices \`c[0..L-1]\`, define

\`h(w) = [2 × sum(c[0..floor(L/2)-1]) + (c[floor(L/2)] if L odd)] mod29\`.

The function follows algebraically from summing both outputs of every outside-in H pair and retaining the odd center. Critically, **all right-half rune identities disappear from this checksum**: this is a lossy word label and has no wordwise inverse on its own. The fixed lexical output is the **zero-based word at signed2016 index h(w)**, with signed2016 word repetitions kept at their genuine source positions. The signed source has **43 alphabetic words**; \`3301\` and the hexadecimal fingerprint are not source words. Only source index0–28 can ever be emitted numerically by this one-step \`mod29\` checksum.

Search exactly every starting manuscript word and every consecutive signed-source word window. Accept equality of complete source **word labels**, allowing the same \`THE\` at its several authentic indices, before considering numeric index equality. No manuscript rune, source word, checksum, shift, sign or word boundary is edited or trained. The entire enumeration is tiny and exact.

## Whole-book result

| Original physical starting page:rune | Consecutive H checksums | Exact three-word signed-source phrase |
| --- | --- | --- |
| p10:153 | \`11,1,23\` | IS THE ROAD |
| p11:58 | \`10,21,12\` | PRIMUS IS THE |
| p11:98 | \`12,18,19\` | THE MAP THEIR |
| p15:150 | \`7,13,14\` | THE WAY ITS |
| p17:120 | \`27,22,18\` | ARE THE MAP |
| p27:3 | \`16,12,18\` | ARE THE MAP |
| p35:166 | \`25,20,21\` | THEIR MEANING IS |
| p46:249 | \`20,21,22\` | MEANING IS THE |
| p56:0, **already solved** | \`21,1,23\` | IS THE ROAD |

All nine lexical three-word windows are exhaustive. **Eight begin within unknown ciphertext, one within a solved page. Zero lexical windows have length four or more.** Only **one** of the nine is also an *exact consecutive numeric-index* triple: p46:249 gives \`20,21,22\`. There is **no four-term numeric progression** in original word order. The isolated three-word p46 match was found by an unblinded exhaustive book scan. It is a candidate for a future independently selected page transition, not a plaintext assertion or a reported low chance probability.

Checks against the earlier discontiguous source readout reproduce the exact anchors: original p0's first two red words give \`[1,13]\` (THE WAY); the first two red words on p7 give \`[17,18]\`, p8's two opening red words give \`[19,20]\`, and solved p56's red-red-black starting three words give \`[21,1,23]\`. The exact original printed order includes intervening words at p7 and dozens of later pages, explaining why the assembled chain does not appear in this continuous census.

## Two-channel test: the alluring five-word line is common under source-matched shuffles

The previous one-number checksum drops every right-half rune. A natural alternative, motivated by **SHED CIRCUMFERENCES** and the outside-in H geometry, is to retain the other half rather than discard it. Define exactly the **left** and **right** GP29 checksum channels for each original printed word:

- \`L(w) = [2 sum(first floor(n/2) rune indices) + odd center] mod29\`.
- \`R(w) = [2 sum(last floor(n/2) rune indices) + odd center] mod29\`.

For a **one-rune word**, both channels are precisely its one rune. Neither contains the other half; neither is a true wordwise inverse. Interpret each checksum as a zero-based lexical index into the exact signed 2016 text. Before examining an output, admit four human-legible fixed original-word-order readings: \`L\`, \`R\`, \`LR\` (left then right for each word), \`RL\` (right then left). Search every original starting word and every possible signed-source phrase. The original unknown-only book has **2,896 whole words**, 55 rune-bearing source pages and 32 cross-page carries.

| Order | Longest exact contiguous signed-source phrase | Original location |
| --- | --- | --- |
| L | 3 words | Nine positions in full book; eight begin in unknown pages |
| R | 3 words | Nine positions in full book |
| LR | **4 words**: THEIR NUMBERS ARE THE | p42:263, continuing into p43 |
| RL | **5 words**: THE MAP THEIR MEANING IS | **p11:51**, with only three original ciphertext words |

The **RL** sequence is fully concrete on untouched p11: word p11:51 has \`(R,L)=(1,18)\`, giving \`THE MAP\`; p11:54 has \`(25,20)\`, giving \`THEIR MEANING\`; p11:58 has first \`R=11\`, giving \`IS\`. The same third word emits \`L=10=PRIMUS\`, **breaking the signed source's required continuation**. A separate **LR** run begins at p42:263, \`(L,R)=(19,26)\`, and continues with p43's next complete word \`(27,28)\`: THEIR NUMBERS ARE THE. The physically carried p42 word spans a page seam, but this coincidence does not independently identify a seam-specific cipher state.

The five-word match was noticed after examining all reading orders and positions. We therefore **do not report its single-mode probability as discovery significance**. A stronger independent baseline keeps every actual word's **paired (L,R) values together**, preserving any observed correlation between its two outputs, and shuffles complete word pairs *within the original physical page*. An additional stricter null permits swaps only among original words sharing **both physical page and exact printed word length**. Each of **3,000** deterministic randomizations per null scans all four modes, all positions and every full five-token sequence of the first-party 43-word source whose lexical labels are addressable by the 29-value checksum. There are **25 distinct eligible signed-source five-grams**. The shuffles preserve the entire source's original word-length profile, page locations, pair multisets, signed lexical repetitions and allowable reading orders.

| Matched original-source null, 3,000 trials | Any five-word match in four modes | At least one RL match | Plus-one familywise upper tail |
| --- | ---: | ---: | ---: |
| Original page-preserving word-pair shuffle | **583** | 218 | **584/3,001 = 0.1946** |
| Original page **and original word length** preserving shuffle | **592** | 161 | **593/3,001 = 0.1976** |

Both controls frequently produce at least one five-word match, even without any encoding of the signed passage. The original one-event result has **no meaningful evidence of a continuous signed-source H decoder** against this matched family. The null is an empirical randomization test under its stated exchangeability condition, not an all-mechanism mathematical exclusion; the output was discovered under the original data, and this null addresses the exact tested choice family. It also emphasizes that the original printed word sequence and natural two-part serialization are insufficient to select an authentic cipher operation.

## Consequence for actual cryptanalysis

The H family remains eligible as a **lossy navigation label** only if first-party evidence selects the target manuscript word, the checksum side and next transition independently of candidate language. Neither direct one-label original-order reading nor simple two-half wordwise serialization yields exceptional contiguous original-source text. The previously assembled p7→p8→p56 seven-word phrase requires distant selected locations, and the solved p56's H labels read \`IS THE ROAD\` even though its authenticated prime/totient decipherment starts \`AN END WITHIN\`. Thus an H label must **not be represented as recovered plaintext**.

The new p11 and p42 phrases are chance-compatible with unchanged source geometry and word lengths. Do not build new dependent cipher layers or claim key recovery from these fragments without a prior original clue that singles them out and predicts a *separate untouched original span*. The original p46 H-checksum triple \`20,21,22\` begins in an 11-rune word that crosses p46→p47, but this checksum ignores its right half, including the seam, so does not select a page-boundary state law. All 56 unknown physical pages remain undeciphered.

**Reproduction:** [exact original one-channel census SFT](../sims/lp2_h_word_signed2016_contiguous_fullbook_sft.cjs) and [four-mode dual-channel original source plus 6,000 seeded matched-shuffle SFT](../sims/lp2_h_word_dual_half_signed2016_shuffle_sft.cjs), Node.js 22 CommonJS. Each locks the original corpus, printed segmentation, 43-word 2016 PGP source and genuine page offsets. The second retains paired checksums, 55 page strata and 525 page/length strata, and asserts both independent 3,000-trial control counts.
