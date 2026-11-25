# Precommit: p10 inline 7 → p7 red span as a GP29 additive key

**Agent 9, 25 November 2026.** This is one bounded player-path test, not a claim that the 7 is certainly a page pointer.

## Upstream clue and rival

The original LP2 physical p10 image (archive image 27.jpg) contains the only standalone black decimal 7 in the unknown rune pages, between printed word separators. A solver can reasonably try reading it as a reference to physical p7. Original p7 has one isolated red span, 14 runes long, bounded by red 13-dot marks. Treat the complete red span, in printed order, as the key; do not convert it to products, sums, primes or polynomial coefficients.

The rival is that p10's 7 is an arithmetic operand or the adjacent 7G token, not a page reference, and p7's red span is a heading/answer rather than a key. Prior work already tested p10's 7G/7/17 as OutGuess passwords for LP1 07.jpg and tested p10 fixed triplet arithmetic; this is not a repeat of either. The p7→p8 polynomial/fixed-point studies used derived red-word products, not the raw 14-rune red span as a key on p10.

## Frozen source inputs

- Target: canonical physical p10, all 263 original GP29 rune indices, printed order, from resources/liber-primus/lp2-corpus.json.
- Selector: the literal standalone 7 on original physical p10, archive image 27.jpg, line 8; it is not a GP29 rune and is not inserted into the cipher tape.
- Key: p7's sole original red span, offsets 194–207 inclusive, exactly 14 GP29 runes, from resources/liber-primus/lp2-ink-annotations.json and canonical p7 indices.
- Key order: original printed left-to-right order, with no rotation, reversal, permutation or phase.
- Output type: ordinary GP29 text, retaining original printed word boundaries and punctuation.

## One fixed operation

Use the historically demonstrated GP29 additive/Vigenere operation with the plaintext-F transparent hold used by solved Cicada controls. For each original p10 ciphertext rune C, if C=F (index 0), emit F and do not advance the key. Otherwise emit P=(C−K[j mod 14]) mod 29 and advance j by one. The key K is the exact 14-rune p7 red span. No unknown initial phase, page reset, sign fit, alternate target or other cipher family is allowed. The minus sign is the ordinary inverse of C=P+K.

A nonzero C that decodes to plaintext F is a contradiction of this transparent-F model: the corresponding forward encoder would have emitted literal F and held the key. Report the first such offset and do not treat later provisional output as a valid plaintext. If there is no contradiction, forward-replay the complete 263-rune source tape and require exact equality.

## Decisive test and controls

1. Assert the exact p7 red span, its 14 source runes, p10's 263 rune count, and the unique inline 7 in the original p10 transcription.
2. Apply the one frozen inverse to all 263 p10 runes.
3. Report the complete decoded transcription, the key cursor, all transparent-F contradictions, exact forward-replay result, rune IoC and adjacent-equality count. Preserve all original word separators and sentence marks.
4. Include a planted GP29 positive control under the same key and transparent-F rule to validate the implementation; label it as an implementation control, not evidence for the LP2 hypothesis.

## Completion and decision

A complete readable p10 passage with exact source replay would justify one prospective, source-locked continuation test on the next original interval, using the same key and clock without refitting. A transparent-F contradiction or nonlinguistic output retires only the exact p10-7 → p7-red14 → GP29 additive/F-hold hypothesis. It does not rule out other uses of the 7 or red span. The Director should then redirect to a different original clue rather than authorize key rotations, other pages, phase searches or new ciphers.
