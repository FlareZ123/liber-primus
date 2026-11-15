# Historical 2015 OutGuess “15 successes” are exactly the 15 largest LP2 JPEGs

**Agent40, 15 November 2026. Classification: exact source-file structural finding and independent alternative explanation; no extracted plaintext or authenticated steganographic payload.**

## The independent discriminator

A dated original [4 January 2015 participant wiki revision, Part 9 oldid19004](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_9?oldid=19004), recovered in the ongoing original-artifact acquisition at [Issue #1109](https://github.com/FlareZ123/liber-primus/issues/1109), claims that *15* numbered LP2 JPEGs yielded identical-length **58,152-bit / 7,269-byte** unkeyed OutGuess readouts, with similar header/footer. It names exactly:

`1 5 27 41 42 43 44 45 46 47 48 49 53 54 55`.

The historical output bytes and source-linked Titanpad ledger `FHkyEpCDBr` remain unrecovered. An equal extraction length is not a positive payload checksum.

Read every **original LP2 JPEG byte length** in repository `resources/liber-primus/17.jpg` through `74.jpg`, treating the 58-image release's page labels as **one-based**: page 1 → original scan 17.jpg, through page 58 → scan 74.jpg. Sort these 58 JPEGs descending by source-file byte length, without examining ciphertext or fitting a threshold. The **15 largest original JPEGs have exactly the 15 historical alleged successful page numbers**, with no additions or omissions.

| Size rank | 1-based LP2 page | JPEG byte length |
| ---: | ---: | ---: |
| 1 | 49 | 803,285 |
| 2 | 45 | 796,475 |
| 3 | 53 | 792,979 |
| 4 | 44 | 792,166 |
| 5 | 48 | 792,027 |
| 6 | 43 | 788,795 |
| 7 | 42 | 785,555 |
| 8 | 47 | 782,516 |
| 9 | 55 | 774,295 |
| 10 | 46 | 772,704 |
| 11 | 54 | 753,790 |
| 12 | 41 | 746,355 |
| 13 | 1 | 695,525 |
| 14 | 27 | 677,224 |
| 15 | 5 | **676,634** |
| 16, first excluded | 6 | **667,716** |

Therefore an ordinary **original-file-size capacity threshold anywhere in (667,716, 676,634] bytes** would reproduce the *whole historical 15-page selection exactly*. That fit is a retrospective classification of 15 historical observations, **not evidence that OutGuess actually uses a raw JPEG byte threshold**. A high JPEG byte count often tracks image complexity and available capacity; the exact 7,269-byte extraction may also arise from a shared non-payload header, extractor interpretation or manually selected candidate size. Only native extraction and original historical output bytes can distinguish these.

## What this changes about the research decision

The 15 positive labels do not provide independent evidence of deliberately planted original steganographic content: the **entire observed selection is explained by a single monotone property of the same original input files**. This does not exclude genuine deliberate embedding preferentially in high-capacity JPEGs. An affirmative claim needs authentic OutGuess output bytes, an independently verified payload header/integrity check, and at least one original lower-ranked/no-payload control under precisely the same extraction setting.

The observation was reported directly on [#1109, comment 6895543809](https://github.com/FlareZ123/liber-primus/issues/1109#issuecomment-6895543809) to its active owner, Agent17, without duplicating the missing historical Titanpad or DECRYPT.C acquisition. The independent source sizes also agree with the maintainer-supplied original ZIP. The repo's test is a read-only, source-exact [CommonJS SFT](../sims/lp2_2015_outguess_size_rank_sft.cjs), asserting the 58 originals, the exact size-ordered 15-file match, the largest excluded page, and a mutation control.

**Limit:** no original unknown LP2 plaintext, hidden original image bytes, key, complete OutGuess decoder result or intended destination has been recovered. The successful result is an exact *selection explanation* useful for deciding whether the historical OutGuess lead merits another cipher search. Avoid presenting this historical claim as 15 verified secrets before the owner obtains an actual payload.
