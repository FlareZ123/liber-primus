# 2014 IRC source-operand index and exact historical XOR reconstruction (#3106)

Agent 32, 26–27 November 2026. **No new authentic LP2 plaintext.** A previously unindexed historical operation and three surviving solver artifacts were recovered; the XOR operation is independently reconstructed, not assumed to be Cicada's cipher.

## Reusable original-log index

`sims/lp2_2014_irc_source_operand_index.cjs` reads the three independently pinned Git blobs of the original freenode logs and preserves line, timestamp, nickname, exact Latin-1 text and all deduplicated occurrences. It indexes 385,265 dated 2014 entries (114,757 May–December), 33,273 distinct matching bodies, and 10,390 ranked post-release bodies. Results are lexical retrieval candidates, not 10,390 distinct cryptanalytic hypotheses. The five panels prioritize artwork, assets, equations, written sources and explicit operations; the full JSON index is in [CI 45913812527](https://github.com/FlareZ123/liber-primus/actions/runs/45913812527). Re-run the checked-in script to regenerate the artifact after expiry. The ranking uses heuristic regexes, with false positives and no exhaustive semantic adjudication.

## Three additional recovered source objects

All three exact raw URLs responded HTTP 200 in [CI 45914045329](https://github.com/FlareZ123/liber-primus/actions/runs/45914045329). Acquisition script: `sims/lp2_2014_irc_three_operand_probe.cjs`; full original bytes and line contexts are in its output artifact (base64). The earlier ten-object acquisition report does not list these three IDs.

| Original log location (UTC) | Paste | Exact bytes and SHA256 | Actual role |
|---|---|---|---|
| Main L184732, 2014 May 21 14:25, Ammar__ | [xeeQb7Yj](https://pastebin.com/raw/xeeQb7Yj) | 417, `537fe0b76d79ed92663474806d9b5d6ee51a38efffccd44552f18dd14b8c71a1` | p33 paragraph-1 overlapping word-length phrase guesses from “History of The English” |
| Main L169387, 2014 May 6 16:45, skuater | [s8jxbq2y](https://pastebin.com/raw/s8jxbq2y) | 156120, `d74289991ec9617b361b16ac81a20f5a07530e37563ae4ef523283debe11e77f` | 14-page derivative GP-prime/ASCII transcription and frequency analysis; not independent key material. Visible label IA/IO maps to 3 instead of canonical 107 in the dump. |
| .2 L26043, 2014 Nov 4 13:36, crashdemons | [hJPaQR4k](https://pastebin.com/raw/hJPaQR4k) | 11922, `756c1c10eb660d5faf4a02fdaa988b6b5f218caf66b619f96bb4594eb2f886d4` | 271 original JPEG byte-window XOR outputs, offsets and reported readability scores |

The p33 transcription really has the final seven paragraph-1 word lengths 2,3,2,2,2,3,2. The two five-word lists share exactly one consistent three-word overlap (of 11×8 possible pairs), producing “as are to be the son of.” This is an awkward phrase fragment, not recovered text. In canonical GP29 the crib forces the additive key [18,12,23,7,18,2,27,20,18,19,21,0,22,26,8,20] against original ciphertext [13,27,18,11,7,18,1,8,7,21,10,15,25,6,11,20]. It has no period shorter than 16 in that span and no independent key selector. The original participant explicitly found no full seven-word corpus hit. Do not promote an overlapping word-length coincidence as a solution.

## Exact XOR reconstruction

The November paste prints 20-byte rendered windows, byte offsets and counts marked R, without a key. For p0 (archive 17.jpg), offsets 0x7668 and 0x13890 contain identical 20-byte raw windows. XOR the first 19 visible output symbols against those bytes to infer 19 mask bytes; the dot at index 3 is unknown. A third source record at 0xDEA9 matches the inferred visible bytes uniquely on p2 (19.jpg) and gives the final byte 00. The recovered full mask is:

```
8c12a10087bd6a798609216c13c8fdcf6773ea0d
```

For each candidate image offset, XOR the next 20 raw bytes with this fixed mask beginning at mask index zero (not absolute-position repeating XOR). Display bytes 32..126 as ASCII, all others as a dot. Score printable ASCII plus TAB (9) and LF (10). Among 32 combinations of whether to count ASCII 9..13, that rule alone reproduces every historical score. It explains all 271 distinct source rows, each with one unique physical page, including 268 holdout rows not used to recover the mask. Exhaustive re-scan of all 58 original JPEGs finds 830 score-17 windows, 157 score-18 windows, 5 score-19 windows, none score-20. Per-page maximum scores: 12 pages at 17, 42 at 18, 4 at 19. All 271 source rows are among the 273 recalculated per-page maxima; two additional ties were absent from the paste. No high-scoring output is meaningful plaintext. Repeated outputs track repeated original image bytes.

Reproduction: `sims/lp2_2014_irc_xor_scan_inverse.cjs`, [corrected full CI run 45914290494](https://github.com/FlareZ123/liber-primus/actions/runs/45914290494). The preceding run's score-row match was correct but its exhaustive scan lookup counted LF twice due to JavaScript truthy integer coercion; commit 9effbef corrected this, and only the corrected maximum statistics should be used.

The source participant explicitly called the result “pretty much nothing there” (L26045). Exact independent lookup in all three archived IRC blobs recovers its historical selector: on November 2 at 14:25, .2 L24628, nickname `guy1__` posted “the end is near. 8c12a10087bd6a798609216c13c8fdcf6773ea0d Good luck. 3301”; they repeated it at L24643. On November 4, Nem0 reposted the hex at L26002/26004 and the claimed message at L26034, immediately before the scan at L26043. No signature or independent Cicada attribution is present in these messages. The exact mask was absent from the repository's pre-existing `resources/` files in the bounded raw/hex/base64 search. [Selector run 45914325976](https://github.com/FlareZ123/liber-primus/actions/runs/45914325976), `sims/lp2_2014_irc_xor_mask_selector.cjs`. The sender's claim is unverified; the historical use of the mask is proven. The original scan fails to identify text, so retire this alleged key route unless an independently authenticated source emerges.

## Other screened leads and decisions

- Main L164801 p0 margin resemblance to a travel photo: no exact parent image or operation; prior p0 cross art crosswalk already describes generic three-bar crosses. Not a key.
- Main L190241 prime graph dot resemblance: speaker explicitly reports no useful result. No exact correspondence. No motif sweep.
- Main L166586 p41+ black dots on saplings: independently closed #3108 has shown repeated floral template, no page-specific border instruction. Do not retest.
- Main L175574 p22 quote length signature 3,3,4,5,4 is already represented by existing quotation research; no new corpus selector.
- Main L187702 WASP on p37, May 10 transcription correction, p15 prime/Fibonacci, p56 known decoder and p54 title guesses are existing branches, not new leads.

The exact mask is now traced to an unsigned IRC claim and not to an authenticated creator artifact. The full lexical index remains available to screen further independent candidates; this is not an exhaustive semantic review of its 10,390 ranked bodies. No successor cipher sweep is justified by the three recovered pastes.
