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

The original 2013 source title precedes the three parable lines, so it should not be appended after them as a fourth body item. Treat its selected byte as a separate orientation control: 0xAB decodes as the left-pointing marker «, which directs the three body selectors [76,117,74] to be read in reverse. That yields ASCII **JuL**; the same reversed body values modulo 29 yield **TUE**. The title selector's own modulo-29 residue is Y. This is a more coherent source-order-preserving interpretation than concatenating the title after the body, and is compatible with p05's MOBIUS clue and the 2016 message's statement that numbers provide direction. It remains an inferred direction flag, not an explicit instruction.

The ordinary nth-item index for π(761) is 134, which selects token 1C / byte 72 (ASCII H), not a direction marker. The title's individual word sums have prime ranks 20, 59, and 80; their p50 offsets select bytes 102, 69, and 142, which do not yield a readable result under the same reverse ASCII/GP29 readings. I therefore use only the independently established title total as a separate direction selector, not a cherry-picked word-level output. The zero-based offset and Latin-1 interpretations remain hypotheses: the source does not literally say “skip π(p) bytes,” and the role of « as a direction flag is inferred.

## Historical match

Dukotah/cicada3301's PGP signature timeline records a 2015 signed message at 2015-07-28T05:12:39Z under key ID 181F01E57A35090F. 28 July 2015 was a Tuesday. The same timeline records the next relevant signed message on 2016-01-01T00:01:07Z under the same key. The exact 1,202-byte 2015 clear-signed source is now preserved at resources/historical/cicada2015-planned-parenthood-denial.asc (upstream Git blob SHA-1 f8fa3ee84e89c7e7bfa5b0b0f6f6c461e8e89812). Running `gpg --verify` against resources/control/cicada-3301-public-key.asc reports a good signature; the primary-key fingerprint is 6D854CD7933322A601C3286D181F01E57A35090F. The message is the public statement denying association with illegal activity: the date match is source-authenticated, but the statement itself supplies no new puzzle instruction.

Primary external records:
- corpus/A-primary-artifacts/SIGNATURE-TIMELINE.json
- corpus/A-primary-artifacts/pgp/messages/2015-07-planned-parenthood-denial.asc
- corpus/A-primary-artifacts/pgp/messages/2016-01-liber-primus.asc

## Additional PGP-clock congruences (promising, not yet an operation)

The same source-selected quantities give two further checks against the authenticated PGP timestamps:

- The three body sentence sums are [1259, 1031, 1229], with prime ranks [205, 173, 201]. The first sum gives **1259 mod 29 = 12**, matching the 2015 signature's minute field. The three prime ranks sum to **579**; 579 mod 29 = **28 = φ(29)**, matching the 2015 message's day-of-month, and 579 mod 60 = **39**, matching the signature's seconds field. Moduli 29 and 60 are both source-visible (GP29 and the p50 base-60 table); p05 explicitly calls the totient function sacred.
- The title total gives **761 mod 29 = 7**, matching the seconds field of the 2016-01-01T00:01:07Z signed Liber Primus message. The 2015 message is signed at 2015-07-28T05:12:39Z by the same key.

This makes the 2015 date/time correspondence more constrained than the simple ASCII/GP29 date match, but it does **not** yet specify one uniform extraction rule for all clock fields. The hour fields 05/00 and the 2016 minute 01 are not independently derived by the same arithmetic; do not treat this as a complete timestamp decoder.

A bounded comparison against all **56 distinct signatures** in Dukotah's source-derived PGP timeline confirms specificity: the minute/second pair **12:39** occurs once, the full time **05:12:39** occurs once, and the weekday/month/day tuple **Tue 28 July** occurs once—each is the 2015 Planned Parenthood denial signed by key 181F01E57A35090F. The 2016 full time **00:01:07** also occurs once; second 07 by itself occurs twice, so the title-residue match alone is weaker. This rules out a common-timestamp explanation within the recovered signature corpus, while leaving the missing extraction rule unresolved.

A single exploratory coordinate test used the title-derived left arrow to reverse each PGP time and read the result as page:line:rune-offset (page zero-based, line one-based, rune offset zero-based): 05:12:39 → p39,line12,offset5 = J; 00:01:07 → p07,line1,offset0 = H. Both coordinates are in bounds, but the output **JH** is not a plaintext continuation, and no source explicitly says that signature times are page coordinates. Preserve this as an unconfirmed lead only; do not tune indexing conventions or try alternate coordinate orders.

## 2015 message follow-through

Because the date pointer identifies a specific signed object, I tested whether that object or its signature is itself the p56 128-hex preimage. `sims/lp2_p57_date_2015_hash_candidate_sft.cjs` pins the exact upstream source bytes and compares 11 source-native representations (complete clear-signed file, body serializations, pre-signature cleartext block, binary signature packet, armor, RSA signature MPI in raw/hex/base64 forms, and MPI with bit-length prefix) under SHA-512, SHA3-512, and BLAKE2b-512: **33 comparisons, zero matches**. This is a bounded negative over those representations and algorithms, not a claim that all possible hash preimages or algorithms have been excluded.

As a separate exploratory transfer, I applied the unchanged 2016 signed-message base-58 word-map rule to all 53 alphabetic words of the 2015 statement: page = GP-prime-sum mod 58; zero-based word index = floor(sum/58). All addresses were in bounds, but none selected p50; only three selected already-solved endpoints (their → p56 word 1, ciphertext transliteration OESR; organisations → p57 word 8, WE; has → p57 word 2, THE). The complete sequence is not readable. This transfer is not directly licensed by the 2016 instruction (which may refer only to Liber Primus words), so it is an exploratory negative, not a test of the LP2 word-map hypothesis.

Decision: the date pointer reaches an authentic historical message but presently supplies neither a key nor a further decipherment operation. Do not expand into broad PGP-key, signature, word-map, or hash sweeps without a new source-derived instruction.


## Secondary totient sample on p55

The same row-major p50 offsets select byte values 76, 117, 74. Their Euler totients are:

- φ(76) = 36
- φ(117) = 72
- φ(74) = 36

This produces a symmetric 36–72–36 selector. The p55 corpus has 76 page-local runes: one incoming NG carry at index 0 and three F-bypass runes at indices 15, 25, and 41. Excluding those four positions leaves the 72 cipher-consuming symbols. Sampling that payload at 1-based positions 36, 72, 36 yields GP runes D, I, D: **DID**.

This is a potentially useful p55 ciphertext sample, not recovered plaintext. It is source-constrained by the p05 totient instruction and the independently established p55 72-symbol cipher-consuming payload; the central 72 also matches φ(91)=72 for the p05 center word FORM. But the sample still depends on the disputed π(p)-as-zero-based-offset convention, and DID is a short common word. More importantly, arranging the 72 symbols as a 2×36 Möbius strip (first row forward, second row reversed) makes the same 36/72/36 positions read D–IA–D (DIAD), not DID. Thus DID is specific to plain row-major p55 order; the MOBIUS clue does not independently select it. Do not treat DID as plaintext or use it to tune a cipher without an independent selector.

## Strongest objections

1. **Index-origin sensitivity.** π(p) is a one-based prime rank. The ordinary zero-based index of the nth prime is π(p)−1, giving indices 204, 172, 200 for the sentence sums and 134 for 761. These select tokens 3E, 2S, 1o and 1C, bytes 194, 148, 110 and 72; they do not produce the date or the left-direction marker. Using π(p) as a byte offset instead yields body bytes [76,117,74] and the title marker byte 171. This discriminates in favor of offset semantics, but the source does not literally say “skip π(p) bytes”; the marker's role as a direction flag remains an interpretation.
2. **Reverse-order choice.** The date fragment requires reversing the three selected values. The p05 MOBIUS word, its mirrored byte shell, and the parable's circumference language are possible hints, but do not uniquely prescribe this reversal. Explicit row- and column-serpentine flattenings of the 32×8 p50 table (natural full-grid Möbius/boustrophedon controls) do not reproduce the date fragment; only plain row-major followed by reversing the selected triple does. This weakens any claim that a full Möbius traversal is source-selected.
3. **Encoding choice.** ASCII and reduction modulo 29 are both natural for byte values in a GP29 puzzle, but the dual reading is not independent plaintext verification.
4. **p55 sample layout sensitivity.** The 36/72/36 sample is DID only in plain row-major payload order; a natural 2×36 Möbius traversal gives DIAD. This is another reason not to promote DID as plaintext.
5. **Historical match is not proof of intent.** The 2015 message date is exact, but no direct statement says the p50 table should be indexed by the parable's prime ranks. The year 2015 comes from external chronology, not this extraction.
6. The primary 2015 signed message body does not contain the community-noted asterisk-count pattern sometimes attributed to it. Do not promote that pattern as an authenticated instruction.


A further layout control: ordinary column-major flattening of the p50 32×8 grid at the same four offsets yields GP29 MBIO, not the date or direction marker. This is a near-match to the already-visible MOBIUS word, but it is not an exact output and would require an extra permutation; do not treat it as confirmation. Row-major is the ordinary table reading order and uniquely gives the «JuL/TUE date path among these tested layouts.

## Decision

Preserve this as a low-cost, source-linked historical waypoint candidate, not a decryption. The signed date match is authentic, but the selected 2015 statement yields no p56 hash preimage and no readable continuation under the unchanged 2016 word-map transfer. Do not use it to seed broad cipher or hash sweeps. Further work should require an independent source-derived instruction that links the PGP object or its authenticated metadata to a specific reversible LP2 operation; absent that, park this branch.

## Sources

- Existing synthesis: results/README.md (2013 parable product already recorded).
- p50 table: resources/liber-primus/base60-grid.json (32×8 base-60 tokens and byte values).
- p05 source instruction and MOBIUS word: original LP1 p05 image and solved-page transcription.
- https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/SIGNATURE-TIMELINE.json
- https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/pgp/messages/2015-07-planned-parenthood-denial.asc
- resources/historical/cicada2015-planned-parenthood-denial.asc (pinned upstream Git blob SHA-1 above)
- sims/lp2_p57_date_2015_hash_candidate_sft.cjs (33-case p56 candidate gate)
- https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/pgp/messages/2016-01-liber-primus.asc
