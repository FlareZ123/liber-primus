# p57 parable → p50 prime-rank date pointer

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

## Historical match

Dukotah/cicada3301's PGP signature timeline records a 2015 signed message at 2015-07-28T05:12:39Z under key ID 181F01E57A35090F. 28 July 2015 was a Tuesday. The same timeline records the next relevant signed message on 2016-01-01T00:01:07Z under the same key. The 2015 signed message is the public statement denying association with illegal activity; it is an authentic historical waypoint, not evidence by itself of a new puzzle instruction.

Primary external records:
- corpus/A-primary-artifacts/SIGNATURE-TIMELINE.json
- corpus/A-primary-artifacts/pgp/messages/2015-07-planned-parenthood-denial.asc
- corpus/A-primary-artifacts/pgp/messages/2016-01-liber-primus.asc

## Strongest objections

1. **Index-origin sensitivity.** π(p) is a one-based prime rank. The ordinary zero-based index of the nth prime is π(p)−1, giving indices 204, 172, 200. Those select tokens 3E, 2S, 1o and bytes 194, 148, 110, which do not produce the date fragment. The attractive output therefore depends on interpreting π(p) as a byte offset (skip π(p) bytes), not as the position of the nth item. This is possible but not yet selected by a first-party instruction.
2. **Reverse-order choice.** The date fragment requires reversing the three selected values. The p05 MOBIUS word, its mirrored byte shell, and the parable's circumference language are possible orientation hints, but do not uniquely prescribe this reversal.
3. **Encoding choice.** ASCII and reduction modulo 29 are both natural for byte values in a GP29 puzzle, but the dual reading is not independent plaintext verification.
4. **Historical match is not proof of intent.** The 2015 message date is exact, but no direct statement says the p50 table should be indexed by the parable's prime ranks. The year 2015 comes from external chronology, not this extraction.
5. The primary 2015 signed message body does not contain the community-noted asterisk-count pattern sometimes attributed to it. Do not promote that pattern as an authenticated instruction.

## Decision

Preserve this as a low-cost, source-linked historical waypoint candidate. Do not use it to seed broad cipher or hash sweeps. The decisive next action is independent review of the offset convention and reversal against the original page layout and the 2015/2016 signed-message chain. If no source-grounded selector supports both choices, retire the date-pointer hypothesis as an attractive coincidence.

## Sources

- Existing synthesis: results/README.md (2013 parable product already recorded).
- p50 table: resources/liber-primus/base60-grid.json (32×8 base-60 tokens and byte values).
- p05 source instruction and MOBIUS word: original LP1 p05 image and solved-page transcription.
- https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/SIGNATURE-TIMELINE.json
- https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/pgp/messages/2015-07-planned-parenthood-denial.asc
- https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/pgp/messages/2016-01-liber-primus.asc
