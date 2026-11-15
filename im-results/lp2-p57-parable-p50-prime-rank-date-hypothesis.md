# p57 parable → p50 prime-rank selectors: date pointer and p55 sample

**Status:** provisional historical-navigation hypothesis. Not an LP2 decryption, key recovery, or established intended route.

## Scope

The authoritative synthesis already records the 2013 Instar Parable's three sentence/line GP sums (1259, 1031, 1229) and their product (1,595,277,641). This note does not claim that identity as new. It tests one further cross-round consumer against the 256-value p50 base-60 table.

## Reproduction

The sentence sums use the historical GP orthography: C represents K, U represents V, and the NG rune represents ING in TUNNELING. The sums are 1259, 1031, 1229; their inclusive prime-counting ranks are 205, 173, 201.

Treating those ranks as **zero-based byte offsets** into the p50 256-value stream selects:

| Sentence | Offset | p50 token | Base-60 value |
|---|---:|---|---:|
| 1 | 205 | 1G | 76 |
| 2 | 173 | 1v | 117 |
| 3 | 201 | 1E | 74 |

Reversing the selected values gives 74, 117, 76:

- ASCII: JuL
- GP29 residues: 16, 1, 18 → TUE

The p05 red instruction identifies the totient function as significant. Since the GP alphabet has 29 symbols, φ(29) = 28. Together these outputs form **TUE JUL 28**.

The reproducible implementation is sims/p57_parable_p50_prime_rank_date_hypothesis.py.


## Title-derived direction byte

The existing synthesis also records that the three-word parable title is THE INSTAR EMERGENCE, whose GP word sums are 72, 280, and 409, totaling 761 (the original 761.mp3 basename). The first word sum 72 independently matches the p55 72-symbol cipher-consuming payload and φ(91)=72 for the p05 center word FORM. The total 761 is prime and π(761) = 135. Treating 135 as another zero-based p50 byte offset selects token 2p, value 171 (0xAB). In ISO-8859-1/Windows-1252 this is the left-pointing double angle quotation mark «.

Appending this title/basename selector after the three sentence selectors gives p50 values [76,117,74,171]. Reversing the combined sequence yields **«JuL**: the title-derived byte is now an explicit left-pointing marker, followed by the reversed sentence-derived month. The same reversed values modulo 29 give Y-T-U-E. This is a better source-grounded reason for reversing the three sentence outputs than MOBIUS alone, and is consistent with the 2016 message's statement that numbers provide direction.

The ordinary nth-item index for π(761) is 134, which selects token 1C / byte 72 (ASCII H), not a direction marker. The title's individual word sums have prime ranks 20, 59, and 80; their p50 offsets select bytes 102, 69, and 142, which do not yield a readable result under the same reverse ASCII/GP29 readings. I therefore use only the independently established title total as the fourth selector, not a cherry-picked word-level output. The offset interpretation is supported by a discriminating output, though still not proven: it assumes the title/basename sum is appended to the sentence-sum sequence and that p50 values should be interpreted as Latin-1 bytes.

## Historical match

Dukotah/cicada3301's PGP signature timeline records a 2015 signed message at 2015-07-28T05:12:39Z under key ID 181F01E57A35090F. 28 July 2015 was a Tuesday. The same timeline records the next relevant signed message on 2016-01-01T00:01:07Z under the same key. The 2015 signed message is the public statement denying association with illegal activity; it is an authentic historical waypoint, not evidence by itself of a new puzzle instruction.

Primary external records:
- corpus/A-primary-artifacts/SIGNATURE-TIMELINE.json
- corpus/A-primary-artifacts/pgp/messages/2015-07-planned-parenthood-denial.asc
- corpus/A-primary-artifacts/pgp/messages/2016-01-liber-primus.asc


## Secondary totient sample on p55

The same row-major p50 offsets select byte values 76, 117, 74. Their Euler totients are:

- φ(76) = 36
- φ(117) = 72
- φ(74) = 36

This produces a symmetric 36–72–36 selector. The p55 corpus has 76 page-local runes: one incoming NG carry at index 0 and three F-bypass runes at indices 15, 25, and 41. Excluding those four positions leaves the 72 cipher-consuming symbols. Sampling that payload at 1-based positions 36, 72, 36 yields GP runes D, I, D: **DID**.

This is a potentially useful p55 ciphertext sample, not recovered plaintext. It is source-constrained by the p05 totient instruction and the independently established p55 72-symbol cipher-consuming payload; the central 72 also matches φ(91)=72 for the p05 center word FORM. But the sample still depends on the disputed π(p)-as-zero-based-offset convention, and DID is a short common word. More importantly, arranging the 72 symbols as a 2×36 Möbius strip (first row forward, second row reversed) makes the same 36/72/36 positions read D–IA–D (DIAD), not DID. Thus DID is specific to plain row-major p55 order; the MOBIUS clue does not independently select it. Do not treat DID as plaintext or use it to tune a cipher without an independent selector.

## Strongest objections

1. **Index-origin sensitivity.** π(p) is a one-based prime rank. The ordinary zero-based index of the nth prime is π(p)−1, giving indices 204, 172, 200 for the sentence sums and 134 for 761. These select tokens 3E, 2S, 1o and 1C, bytes 194, 148, 110 and 72; they do not produce the date or the left-direction marker. Using π(p) as a byte offset instead yields the marker «. This discriminates in favor of offset semantics, but the source does not literally say “skip π(p) bytes,” and the title/basename ordering is still an interpretation.
2. **Reverse-order choice.** The date fragment requires reversing the three selected values. The p05 MOBIUS word, its mirrored byte shell, and the parable's circumference language are possible hints, but do not uniquely prescribe this reversal. Explicit row- and column-serpentine flattenings of the 32×8 p50 table (natural full-grid Möbius/boustrophedon controls) do not reproduce the date fragment; only plain row-major followed by reversing the selected triple does. This weakens any claim that a full Möbius traversal is source-selected.
3. **Encoding choice.** ASCII and reduction modulo 29 are both natural for byte values in a GP29 puzzle, but the dual reading is not independent plaintext verification.
4. **p55 sample layout sensitivity.** The 36/72/36 sample is DID only in plain row-major payload order; a natural 2×36 Möbius traversal gives DIAD. This is another reason not to promote DID as plaintext.
5. **Historical match is not proof of intent.** The 2015 message date is exact, but no direct statement says the p50 table should be indexed by the parable's prime ranks. The year 2015 comes from external chronology, not this extraction.
6. The primary 2015 signed message body does not contain the community-noted asterisk-count pattern sometimes attributed to it. Do not promote that pattern as an authenticated instruction.


A further layout control: ordinary column-major flattening of the p50 32×8 grid at the same four offsets yields GP29 MBIO, not the date or direction marker. This is a near-match to the already-visible MOBIUS word, but it is not an exact output and would require an extra permutation; do not treat it as confirmation. Row-major is the ordinary table reading order and uniquely gives the «JuL/TUE date path among these tested layouts.

## Decision

Preserve this as a low-cost, source-linked historical waypoint candidate. Do not use it to seed broad cipher or hash sweeps. The decisive next action is independent review of the offset convention and reversal against the original page layout and the 2015/2016 signed-message chain. If no source-grounded selector supports both choices, retire the date-pointer hypothesis as an attractive coincidence.

## Sources

- Existing synthesis: results/README.md (2013 parable product already recorded).
- p50 table: resources/liber-primus/base60-grid.json (32×8 base-60 tokens and byte values).
- p05 source instruction and MOBIUS word: original LP1 p05 image and solved-page transcription.
- https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/SIGNATURE-TIMELINE.json
- https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/pgp/messages/2015-07-planned-parenthood-denial.asc
- https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/pgp/messages/2016-01-liber-primus.asc
