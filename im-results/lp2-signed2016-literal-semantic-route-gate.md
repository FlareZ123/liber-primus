# Signed 2016 literal semantic-route gate

**Agent8, 18 November 2026. Director #1654. Classification: exact lexical echoes to solved Liber Primus sections, ordinary-position navigation negative, no unknown plaintext or key.**

## Decision

The authenticated 2016 message reuses several exact Liber Primus phrases and words in a way that supports a literal semantic reading of the clue. The strongest echoes point back to already-solved material:

- solved **Warning** contains `EITHER THE WORDS OR THEIR NUMBERS`; the signed 2016 sentence says `ITS WORDS ... THEIR NUMBERS`;
- solved **Welcome** contains the exact bigram `THE WAY` and the exact trigram `AND YOU WILL`;
- solved p56 contains `SEEC OUT THIS PAGE`; the signed message later says `Seek and you will be found.`

These echoes strengthen the interpretation that the 2016 message is talking about Liber Primus's own recovered words and numbers. They do not define an ordinary page/word address into the unknown ciphertext.

The exact route required by #1654 fails its address gate. Among the ten requested semantic terms, only `WORDS` and `NUMBERS` occur as exact GP words in the authenticated solved corpus, and both occur in the same Warning section. None occurs as an exact complete word in the 2,896 complete printed words of original unknown p0-p55. The one-based signed-word positions select physical pages 3,5,6,9,16,19,21,24,27,30, which do not reach the p50 numerical table or solved p56/p57 and come with no source-authored start, successor, stopping, or extraction rule.

Close the ordinary literal-address branch. Preserve the exact solved-text echoes as evidence that the 2016 clue is a broad manuscript instruction and plausibly a post-plaintext navigation hint. It does not independently locate an untouched LP2 source object.

## Frozen authenticated wording

The relevant signed text is:

```text
The path lies empty; epiphany seeks the devoted.

Liber Primus is the way.  Its words are the map, their
meaning is the road, and their numbers are the direction.

Seek and you will be found.
```

The full clear-signed body has 43 alphabetic words after removing the hexadecimal OpenPGP key ID.

The requested terms have these ordinary one-based word positions:

| signed term | word position |
| --- | ---: |
| path | 3 |
| empty | 5 |
| epiphany | 6 |
| devoted | 9 |
| words | 16 |
| map | 19 |
| meaning | 21 |
| road | 24 |
| numbers | 27 |
| direction | 30 |

No prime sum, modulus, page-origin change, stemming, synonym expansion, or p50 target was used.

## Exact lexical census

Using the canonical GP29 transliteration and only the historical Latin normalization `v->u, k->c, z->s`, exact complete-word matches across the solved native-GP corpus are:

| signed word | exact solved occurrences |
| --- | --- |
| words | Warning, word38 |
| numbers | Warning, word41 |
| way | Welcome, words26 and35 |
| seek | p56, word22 |
| path, empty, epiphany, devoted, map, meaning, road, direction | none |

The exact phrase-level overlaps are also finite:

- `THEIR NUMBERS`: once in Warning;
- `THE WAY`: once in Welcome;
- `AND YOU WILL`: once in Welcome.

The requested ten terms were also tested against all 2,896 complete printed words in original unknown p0-p55. Every exact-hit count is zero. This does not imply that those ideas are absent from the encrypted plaintext; it shows that the signed clue cannot navigate the ciphertext by literal visible-word matching.

## Ordinary word-position page test

Treating each requested signed word's ordinary one-based position as a physical Liber Primus page number gives:

```text
3, 5, 6, 9, 16, 19, 21, 24, 27, 30
```

Under the repository's zero-based page labels these are:

```text
p2, p4, p5, p8, p15, p18, p20, p23, p26, p29
```

and under the original scan numbering they are:

```text
19.jpg, 21.jpg, 22.jpg, 25.jpg, 32.jpg,
35.jpg, 37.jpg, 40.jpg, 43.jpg, 46.jpg
```

This projection never reaches physical page51 / project p50, the numerical table, nor physical pages57-58 / project p56-p57, the solved terminal pages. More importantly, the signed message gives no rule for treating these ten page numbers as a walk, no start within a page, no output object, and no stopping event. Mixing one-based signed word positions with zero-based project page labels would be an analyst-created convention and is excluded.

## Semantic consequence

The strongest literal interpretation now has a source-supported qualitative shape:

1. The 2016 text deliberately speaks in vocabulary already present in solved Liber Primus.
2. Its `WORDS ... THEIR NUMBERS` wording directly echoes the Warning's protected pair `WORDS ... THEIR NUMBERS`.
3. Its `Seek` wording is consistent with p56's unresolved instruction to `SEEC OUT THIS PAGE`, whose deep-web hash target remains unrecovered.
4. The message still supplies no hash preimage, URL, cipher, coordinate tuple, word selector, or reversible unknown-page operation.

The first three points are textual evidence. Treating them as proof that the 2016 author intended a specific section-to-section route would exceed the source because Welcome also contains multiple common overlaps and no direction opcode is given.

## Completion fork

The #1654 positive criterion is unmet: no unique literal word path predicts a separate untouched original page/word object plus a source-selected operation.

Retain the exact Warning/Welcome/p56 echoes as a useful interpretation of authorial wording. Reopen a literal address route only if a first-party source fixes an ordinary page/word convention, start and stop, and an operation that makes a blind prediction on an unused original object.

Reproduction: `sims/lp2_signed2016_literal_semantic_route_sft.cjs`, Windows Node22 Actions run `44412981617` passed.
