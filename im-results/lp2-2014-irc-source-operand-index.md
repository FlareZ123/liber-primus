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

## Independent source-reference triage (Agent8, 27 November)

The read-only `sims/lp2_2014_irc_unindexed_url_context_sft.cjs` (commit `2787b69bbb22f9be9a7d6db949da251685c982f8`) verified all three pinned historical logs, indexed 8,927 distinct normalized URLs already represented in the bounded repository text index, and returned 178 distinct contextual URL candidates in the May–December logs. [Successful Windows CI run 45924166639](https://github.com/FlareZ123/liber-primus/actions/runs/45924166639), [full context artifact 15165323092](https://github.com/FlareZ123/liber-primus/actions/runs/45924166639/artifacts/15165323092). URL absence is a retrieval feature only; aliases, dead sites, unrelated channel conversation and previously known materials remain in the output.

**Contemporaneous mayfly → key agreement clue, independent of recent geometric construction.** Main log L172865 (2014 May 09 21:51, Mothwing) explicitly links `http://cryptome.org/cc-see.htm` and identifies a public-key system named MAYFLY. Main L175249 (May 12 17:41, Pomponia) independently proposes that the mayflies hint at ephemeral keys. The two messages establish that these interpretations were available to original participants, not that either was intended. The [2000 Cryptome document mirror](https://cryptome.wikileaks.org/cc-see.htm) names MAYFLY but supplies no implementation. The period [Cryptoki 2.0 draft, MAYFLY mechanisms](https://www.cryptsoft.com/pkcs11doc/v200/group__SEC__10__MECHANISMS.html) describes a prime/subprime/base key-pair template and derivation with sender/recipient option, two random operands, other party's public key, base key and output type/length; the [header](https://cryptsoft.com/pkcs11doc/v200/pkcs11__all_8h.html) distinguishes DH, MAYFLY and KEA key types. This strengthens historical plausibility of a key-agreement interpretation of the illustration, while preventing a literal MAYFLY algorithm claim based on the ordinary DH example alone. No source fixes the extra operands, secret calculation, or a GP29 receiver. See `im-results/lp2-mayfly-dh23-semantic-selector.md` for the separate, retrospective p14→p23→p25 candidate. Do not assign additional parameter sweeps without a source-selected operand or falsifiable original prediction.

Other screened references: main L164380 is an ordinary Sumerian mathematics reference used by a May 2 solver, not a new table codec; L167154 references Gronsfeld/Fibonacci, already investigated; L167357 is a mayfly/Gilgamesh discussion, not an independent quotation match; L207137 and associated word-list pastes concern word-length guesses rather than keys. The remaining artifact candidates are still available for targeted review. No original unknown plaintext or new key is established by this pass; #3106 remains open because full semantic adjudication and an independently executable receiver are absent.


## May 13 whitespace rendering and May 6 prime-list recovery (Agent8, 27 November)

A second pinned-source extraction ([script](../sims/lp2_2014_missing19_ephemeral_source_sft.cjs), [successful run 45924676271](https://github.com/FlareZ123/liber-primus/actions/runs/45924676271)) recovered both live raw pastes:

- [0wmWfct8](../resources/external/2014-irc-shared/0wmWfct8.txt), linked main L177022 (May 13 20:49), 562 bytes, SHA-256 `5720e93507d77bdb528e07fa2e8cd2fe8912d37e146ef5a5a077053d1b6fdf46`. In the quoted dialogue, nikkler explicitly represents spaces as x and end-of-line as $. The trailing counts after the onion hostname and Good luck are 7 and 23, respectively; the first nine runs match the Michel archive (2,3,5,7,11,13,17,23,29). Totry's introductory list mistakenly repeats 31, but main L176667 (May 13 16:36) supplies the complete corrected eleven-value sequence ending 31,37. L176669 and L176695 distinguish the five-space indentation. This is contemporaneous textual corroboration of the disputed 7/23 positions, not an independently preserved raw upload. The log timezone is not established, so its ordering against the May 13 20:55:55 UTC Git commit is unresolved. The OpenPGP signature still excludes trailing spaces.
- [rKBY198Y](../resources/external/2014-irc-shared/rKBY198Y.txt), linked main L169513 (May 6), 1,297 bytes, SHA-256 `7c2c76d14af735109e22ba672d31f04b6863ec8596c9245df1a8c2d18afb39ff`. All 180 numbers are consecutive prime ranks 21–200 (73–1223), formatted into 18 rows of ten. The May 6 discussion also links the already recovered 2013 PRIMES TELNET paste xGY4pbHV. This is a contemporary derivative of the known omission list rather than a second service capture or a new key.

Main L216945 (July 2 20:52, nikkler) specifically proposes a Diffie–Hellman interpretation of missing prime 19 involving runes and position. Together with the May 6/9/12 ephemeral/MAYFLY discussion, this establishes a historically available candidate family rather than author selection. The signed 2013 example has public share 19, but neither the IRC proposal nor the two pastes binds an LP2 receiver, operand serialization, or new plaintext prediction. Existing missing-19 and DH transfer negatives remain valid. Do not repeat those searches.

The new decision is to prefer the 7/23 *reported rendering* as a contemporaneously corroborated description, while keeping the byte-authentication and cipher gates closed. No unknown plaintext or key was recovered.
