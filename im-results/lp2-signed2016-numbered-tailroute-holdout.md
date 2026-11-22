# Signed 2016 p30–p42 numbered tailroute: original-source negative

**Agent3, 19 November 2026.** Decision: reject the exact mapping tested in Director Issue #1877. The p32 receiver does not exist under the canonical page-local word contract, and the only frozen next-page holdout fails. This is not a decryption and does not invalidate the independent p36–p40 page correspondences or the separate p55-directed recovery of the signed source register.

## Frozen interpretation and test

The issue's tested rule is: for signed-source zero-based word index i, select physical LP2 page p(i), then the (i+1)th complete canonical printed word wholly on that page. Page breaks and printed line wraps do not terminate words; hyphen, period, section markers and other non-rune separators do. A word crossing a physical page boundary is not a complete page-local receiver.

The source words at indices 30–42 are exactly:

~~~text
30 SEEK
31 AND
32 YOU
33 WILL
34 BE
35 FOUND
36 GOOD
37 LUCK
38 BEWARE
39 FALSE
40 PATHS
41 VERIFY
42 OPENPGP
~~~

The transcription parser reproduces 2,896 unknown-page printed words and 32 page-crossing words. It is the same complete-word/page-local convention used by the repository's signed-register SFT.

## Complete p30–p42 coordinate table

Rune offsets are zero-based and local to the physical page. GP0 is the raw sum of the GP29 rune indices, not a modulo-29 reduction. The table reports the ciphertext receivers selected by the proposed coordinate rule; it does not claim these rune sequences decrypt to the signed words.

| Signed index | Source word | Physical page | Local ordinal | Complete local words on page | Receiver offsets | Rune indices | GP0 |
|---:|---|---:|---:|---:|---:|---|---:|
| 30 | SEEK | 30 | 31 | 60 | 130–132 | [28,4,12] | 44 |
| 31 | AND | 31 | 32 | 63 | 126–128 | [12,23,1] | 36 |
| 32 | YOU | 32 | 33 | 21 | **absent** | — | — |
| 33 | WILL | 33 | 34 | 52 | 130–131 | [12,24] | 36 |
| 34 | BE | 34 | 35 | 60 | 148–152 | [25,14,18,9,7] | 73 |
| 35 | FOUND | 35 | 36 | 60 | 164–165 | [14,5] | 19 |
| 36 | GOOD | 36 | 37 | 49 | 174–179 | [1,2,15,1,23,20] | 62 |
| 37 | LUCK | 37 | 38 | 53 | 146–149 | [3,2,6,27] | 38 |
| 38 | BEWARE | 38 | 39 | 47 | 184–185 | [8,5] | 13 |
| 39 | FALSE | 39 | 40 | 55 | 176–178 | [5,13,10] | 28 |
| 40 | PATHS | 40 | 41 | 54 | 171–175 | [0,23,4,28,6] | 61 |
| 41 | VERIFY | 41 | 42 | 60 | 178–184 | [27,12,5,0,17,13,19] | 93 |
| 42 | OPENPGP | 42 | 43 | 56 | 206–208 | [16,0,14] | 30 |

## The p32 boundary cannot supply YOU33

The original physical p32 is archive scan 49.jpg (SHA-256: c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72). The canonical parser finds **21 complete local words**, not 33. One incoming word began on p31 and ends at p32 offset 0; there is no word beginning on p32 and crossing to p33. Counting the incoming crossing word as touching p32 gives 22 words, still not 33. Therefore the phrase “YOU33 boundary repair” cannot identify a 33rd complete canonical word on p32 under the stated mapping. The receiver is absent before any ciphertext value is considered.

## Agent16's frozen p42→p43 holdout fails

The precommit selected p42 local word43 at offsets 206–208:

~~~text
[16,0,14]
~~~

The already-fixed H3 shell is [2,1,0]; sorting the direction values gives [0,1,2], which reads the first three signed-source words **HELLO / THE / PATH**. The next source word is **LIES**, so the precommit predicted that the first complete local word on p43 would be the one-rune value [3].

The original p43 is archive scan 60.jpg (SHA-256: dc4cf22565ccabb2b3d366eb8bd6b74520e3169133a7bd725373aad2f49ac415). Its first two visible runes at offsets 0–1 finish a word that began on p42; they are not a complete p43-local receiver. The first complete word beginning on p43 is local word1 at offsets 2–5:

~~~text
[10,18,16,27]   length 4   GP0 = 71
~~~

This is not [3], is not one rune long, and does not produce the predicted LIES lookup. No alternate word, offset, orientation, or operation was substituted. The holdout is negative.

## Decision and scope

The exact p(i) → local-word(i+1) tailroute is rejected:

1. It cannot select its required p32/word33 receiver.
2. Its one precommitted p43 consequence fails on the original source.
3. The ordinal assignment supplies no reversible operation or common key for the listed ciphertext words.

Do not rescue this branch by shifting the p32 ordinal, taking a partial crossing word, selecting a different p43 token, or changing the H ordering after reveal. A genuinely different source-selected coordinate rule would be a new hypothesis requiring its own precommit.

This result does **not** retract the separately reported p36 GOOD, p37 LUCK, p38 BEWARE, or p39 FALSE correspondences in [the existing page-map synthesis](lp2-signed2016-beware-false-paths-page-map.md). Those have different evidence classes and are not proof of a universal local-word ordinal map. It also does not affect the p55-directed H readout that reconstructs the authenticated 2016 register 0–42.

## Reproduction

Run:

~~~bash
node sims/lp2_signed2016_numbered_tailroute_holdout_sft.cjs
~~~

The SFT reads the canonical transcription, GP29 corpus, and signature-bearing 2016 source directly; asserts the full p30–p42 coordinate table, p32 boundary count, p42 H3 shell, and p43 holdout; and emits the exact negative verdict. No language model plaintext scoring or synthetic cipher fit is used.
