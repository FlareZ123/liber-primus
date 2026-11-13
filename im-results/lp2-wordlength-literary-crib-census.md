# Original LP2 exact word-length literary crib census

**Evidence classification:** finite, original-ciphertext, source-text known-plaintext gate. No original unknown LP2 plaintext, key or cipher has been recovered by this test.

## An independent plaintext possibility

Earlier source-crib gates concentrated on selected quotations or specific page-local intervals. A copied pre-2014 literary passage would also leave a detectable trace in the complete printed **word-length sequence**, even under an arbitrary length-preserving per-rune encryption. The historical solved LP2 p56 encryption keeps word boundaries and lengths intact, motivating this inexpensive test. A sufficiently long, distinctive word-length match could supply authentic plaintext without guessing the rune cipher.

This experiment holds manuscript segmentation fixed. The canonical percent page separator and slash typographic line break continue a word; hyphens and printed punctuation terminate it. The original **55 rune-bearing unsolved pages** contribute **2,896 whole words and 12,956 runes**. The complete book is checked against each frozen corpus.

For English, the solved-Cicada GP transliteration convention is used: QU becomes CW, V becomes U, K/Q become C, Z becomes S, with longest-match runes TH/NG/EO/OE/AE/IA/EA, and the two source-attested choices of ING as one NG rune or two I+NG runes. The Latin Vulgate reference is an independently preserved, already GP29-word-encoded New Testament file; each encoded word occupies a line.

## Exact original-versus-source results

| Frozen source | Source words | Maximum contiguous equal-word-length run | Example |
| --- | ---: | ---: | --- |
| Shakespeare, initial 300,000 raw source characters | 55,407 | **9** under both ING conventions | Original word 1,477, p27, versus “us in him and wail his death Lord Mayor” |
| Gibran, The Prophet literary control | 15,733 | **9** under both conventions | Original word 638, p11, versus “that no one has gone his way with empty” |
| Emerson, Essays, first series | 77,932 | **9** under both conventions | Original word 280, p5, versus “high board Their virtues are penances I do not” |
| Latin Vulgate New Testament, exact GP29 source words | 39,835 | **9** | Original word 1,318, p24, versus Latin source word 34,582 |
| Old English *Beowulf*, corrected authentic GP29 rune-word lengths | 10,885 | **8** | Four tied eight-word matches, including original word 366, p7, versus Beowulf source word 5,680 |
| Editor-normalized solved Cicada LP1/LP2 reference | 904 | **7** under both conventions | Original word 1,386, p25, versus “BE TRUE TEST THE KNOWLEDGE FIND YOUR” |

All manuscript and source word indices are **zero-based**. The Old English source is the pinned Harrison/Sharp *Beowulf* edition in `resources/control/beowulf_oe_gp_profile_corrected.json`, whose 10,885 GP word lengths (48,012 runes) retain lowercase thorn/eth/ash correctly. Four original/book pairs reach eight consecutive matching word lengths; no nine-word match occurs. Its inclusion tests the historically motivated Anglo-Saxon writing register independently of previously searched modern English and Vulgate. A planted genuine 16-word Beowulf run at original word 1,450 is uniquely recovered. Original rune/word counts remain exact. This bounds a *verbatim copied Beowulf passage* under the source's native runic word length; it cannot exclude Old English prose written independently, other editions or cipher-induced boundaries.
 Sources are the pinned repository references in resources/control/ plus resources/liber-primus/lp1-plaintext-reference.txt. Literary files retain editorial headers and other source formatting; this is an entire-file census. English transliteration choices were declared independently of any matches. The Vulgate is published historical text, not an authenticated Cicada selector.

The Gibran nine-word match has GP-word-length profile **3,2,3,3,4,3,3,3,5** and appears on p11. No independently visible clue on p11 selects that nine-word quote, and no tenth contiguous matching word length exists. Nine-word matches in multiple unrelated books do not identify original plaintext.

The standalone original-source test plants a **16-word** Gibran length excerpt at manuscript word 1,234 and recovers the precise source offset 4,500. This verifies the detector can recover a deliberately inserted long match. All actual source tests use the unmodified manuscript sequence. A separate sixteen-word Beowulf plant is recovered at the exact source/original offsets by the same matcher.

## Research consequence

**No intact ten-word passage appears in any of these six frozen GP-normalized source corpora under original LP2 word boundaries.** The p11/Gibran, p27/Shakespeare, p24/Vulgate and p7/Beowulf matches give no independently justified source quotation or key. These particular direct-copy crib routes can be retired until new source evidence changes the input.

Other literature, Cicada-authored prose, paraphrases, different original editions, altered word boundaries and multi-rune encodings remain possible. This result does not establish the plaintext language. A viable new quote route must start with a source independently selected by original puzzle artwork or a historical instruction, then predict untouched ciphertext before any inverse is fitted.

Reproducer: [source-native CommonJS SFT](../sims/lp2_wordlength_literary_crib_sft.cjs), using the canonical 2,896 printed words and the same checked-in historical corpora.
