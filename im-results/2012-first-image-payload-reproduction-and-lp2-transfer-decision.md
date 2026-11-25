# 2012 opening-image payload: byte-exact extraction and LP2 transfer decision

**Current status (25 November 2026):** the 2012 opening image and both payload channels were recovered from two pinned community mirrors, and the historical OutGuess extraction was reproduced with pinned OutGuess 0.4. Default-key extraction from original LP2 p55 fails with zero payload bytes. The downstream phrase has 59 GP29 letter-runes and 16 ASCII spaces, matching the 75 p55 body glyphs in total count only if a space-to-rune representation is assumed. Direct key consumers, five source-linked shared-pad receiver placements exhaustive reversible affine additive key recurrences of orders one through five, and exact arbitrary-gap all-key q8/q13 additive crib inverses yield no unknown plaintext. Historical payload recovery stands; the mixed-token crib has no authenticated LP2 reader.

## Original image and source limits

The image is `1CcV1.jpg`, originally referenced as `http://i.imgur.com/1CcV1.jpg`. The byte-preserving copies used here are pinned to:

- [`scream314/cicada3301`](https://github.com/scream314/cicada3301/tree/10733feb487bb8beb9966d534727ee5897aa54fc/assets/2012), commit `10733feb487bb8beb9966d534727ee5897aa54fc`, file `assets/2012/1CcV1.jpg`.
- [`cijhho123/cicada3301`](https://github.com/cijhho123/cicada3301/tree/d360ad97d39c4719e42dc88b0cbbb81ed54aa02c/2012), commit `d360ad97d39c4719e42dc88b0cbbb81ed54aa02c`, file `2012/additional media/images/1CcV1.jpg`.

The two files are byte-identical: **29,279 bytes**, SHA-256 `870353b8fbe4d1dd83fdbfc61b07d80213bab035526d3e5fd6a43f7d77db1ead`, Git blob SHA-1 `467a24a6f70bb589a994fd73ee37b6f9c7a827f8`. This agrees with the independent artifact comparison in [`Dukotah/cicada3301` REPORT-A.md](https://github.com/Dukotah/cicada3301/blob/fd13fe88a0bfef13f07c03c666b831e9ddae7f2d/corpus/A-primary-artifacts/REPORT-A.md), pinned to commit `fd13fe88a0bfef13f07c03c666b831e9ddae7f2d`.

**Authentication boundary:** the direct 4chan upload has not been recovered as a separately hashable binary, and this first image has no preserved Cicada PGP signature. The two matching copies are byte-pinned community mirrors, consistent with contemporary reports, not a cryptographically authenticated 4chan download. This matches the existing [local first-image source record](../resources/historical/cicada2012-first-image-source.md). The alternate 27,517-byte copy documented in the local source record is not a substitute: it lacks the 61-byte trailer and has a different JPEG encoding.

## Channel 1: the post-EOI Caesar URL

The 29,279-byte mirror has **61 bytes after the JPEG EOI**:

`TIBERIVS CLAVDIVS CAESAR says "lxxt>33m2mqkyv2gsq3q=w]O2ntk"`

The explicit Caesar reference selects a uniform ASCII-byte shift of −4 on the quoted string, producing:

`http://i.imgur.com/m9sYK.jpg`

This is not an alphabet-only Caesar rotation: punctuation and digits shift too. The destination image is the known duck decoy; its text directs the solver to “guess” how to get the message “out”, leading to the separate OutGuess step. The original first-image record and the exact byte-level trailer are documented in the pinned external report above.

## Channel 2: reproduced OutGuess payload

The historical walkthrough [scream314/cicada3301/2012.md](https://github.com/scream314/cicada3301/blob/10733feb487bb8beb9966d534727ee5897aa54fc/2012.md), pinned to the same `scream314` commit, records the exact command:

```sh
outguess -r 1CcV1.jpg 1CcV1.jpg.out
```

No password or additional flags are supplied. The extraction was reproduced in [workflow run 45288446664](https://github.com/FlareZ123/liber-primus/actions/runs/45288446664) using the repository's existing manual runner and OutGuess 0.4 source commit `24810e14327c2bbeedeaadd3e24491f2a4425c02`.

The run independently downloaded both pinned mirrors and verified that:

- both original JPEGs are byte-identical and match the expected 29,279-byte SHA-256;
- both archived `.out` files are byte-identical;
- the 61-byte post-EOI trailer is exact and its ASCII −4 transform yields the URL above;
- `outguess -r` reports **29,049 usable bits**, **seed 228**, **length 535**;
- the newly extracted 535 bytes exactly equal both archived `.out` files.

The extracted payload SHA-256 is `7dbf268b1b356527cf4a2dc105c0dd1f6d2d703291dda24dd9e98e22851d6f40`. Its exact bytes are preserved in [`2012-first-image-1CcV1-outguess.txt`](2012-first-image-1CcV1-outguess.txt); the executable reproducer is [`2012_first_image_outguess_reproduction.cjs`](../sims/2012_first_image_outguess_reproduction.cjs).

The output is a **book-code instruction**, a Reddit destination (`r/a2e7j6ic78h0j`), and 76 line:character pairs. The Reddit/book identification and subsequent phone-number extraction are downstream stages of the 2012 chain; they are not extra bytes hidden in the JPEG trailer and should not be conflated with the OutGuess output.

A tempting LP2 overlap is that this payload has 76 coordinate entries while unknown p55 has 76 runes. This is a count-level match, not a selected transfer: the 2012 syntax is line:character addressing into a separately identified book, whereas p55 is a 76-rune page, not a 76-line reference text. Neither the 2012 payload nor an LP2 instruction says to map these coordinates to p55 rune positions, turn them into a GP29 key, or use them as a permutation. No source-defined operation connects the two 76-element objects.

## LP2 transfer candidate: 59 letter-runes plus 16 hypothetical space slots

The recovered OutGuess payload contains 76 line:character coordinates. The pinned 2012 walkthrough resolves the book code to the exact visible message:

\`CALL US AT US TELE PHONE NUMBER TWO ONE FOUR THREE NINE OH NINE SIX OH EIGHT\`

This is **76 characters including spaces**. In GP29 transliteration, the \`TH\` in \`THREE\` is one rune, so the phrase contains **59 GP29 letter-runes and 16 ASCII spaces**, for 75 mixed tokens. The space is not a GP29 rune.

The canonical LP2 transcription has **76 runes on p55**. Its first rune, \`ᛝ\`, completes a word carried over the p54/p55 page boundary. Removing that one carry-in leaves **75 p55 body runes**. Thus a one-glyph-per-space hypothesis would supply a 75-position alignment. No such representation is defined by the source, so this is a conditional mixed-register count match.

The alignment is not yet a plaintext identification:

- The phrase has 17 words; p55 has 16 complete printed word groups after the carry-in. GP29 word lengths are `[4,2,2,2,4,5,6,3,3,4,4,4,2,4,3,2,5]`; p55 body word lengths are `[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. Merging any one adjacent phrase-word pair does not make these vectors agree.
- A one-to-one monoalphabetic substitution over the 75-token alignment fails.
- The sorted symbol-frequency distributions do not match under any of the 29 possible single-rune assignments for the 16 spaces; this also rejects a simple transposition plus monoalphabetic substitution.
- No constant GP29 Caesar shift maps the phrase's letter-runes to the p55 body.
- Bounded source-derived consumers were tested (Agent36, 23 Nov 2026): the 75-token GP29 phrase as a direct Vigenère/OTP pad with all 29 space-symbol mappings and both additive signs always produces first word LAMT (C−K) or UXUIA (C+K); the literal phone digits 2143909608 as a repeated GP29 key (forward/reversed, both signs) do not yield coherent text. The 76 book-code coordinate pairs were reduced through nine simple line/character maps (line, character, sum, difference, product, and four small linear combinations), both 0-/1-based origins, both signs, and all 29 space values. No exact coordinate-derived key matches the 75-rune body or 76-rune full page; best partial agreements were 9/75 and 7/76 after 1,044 comparisons per alignment, not evidence after selection. These bounded negatives reject only those explicit consumers; a general Vigenère/OTP search or arbitrary coordinate mapping remains unjustified without a source-selected schedule.

The source gives a natural p55 body boundary after its documented one-rune carry, but no independent link between that boundary and the 2012 message. A reversible space-to-rune representation is missing. Agent35's handoff and Agent43's correction distinguish 59 letter-runes from the 16 spaces; no fitted OTP can authenticate the alignment.

This candidate should not be promoted to \`results/\` or described as plaintext unless a fixed, reversible mechanism decrypts the original p55 ciphertext and independently validates beyond this one phrase. The earlier no-transfer conclusion is superseded by this exact-length alignment, but the transfer remains **unproven**.

## #2493: exact Reddit author-order replay and typed transport gate (Agent14, 24 November)

The exact phone phrase is now recovered from archived **post titles**, rather than accepted as a corrected walkthrough string. At the pinned [2012 subreddit export](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/003-subreddit/a2e7j6ic78h0j-posts.json) (blob `76e5ca0f3f00cd6ec740e9bde575f4d55dbc53b3`), take chronological non-image titles, deduplicate exact title strings, and decode letters with the subreddit-info base36 shift sequence `a2e7j6ic78h0j7eiejd0120`, restarting the key per title and preserving all nonletters. Use the 76 original one-based line:character coordinates verbatim.

- Including deleted-account titles gives 186 lines and **CAMT US AT US TELE PHONE NUMBER TWO ONE FOUR THREE NINE OH NINE SIX OH EIGHT**, identical to the pinned archive's published extraction. Coordinates 3:5 and 4:20 select M and T.
- Independently selecting the two named puzzle accounts (anagrams of Charlotte Guest and Mabinogion), before sorting/deduplication, gives 185 lines and **CALL US AT US TELE PHONE NUMBER TWO ONE FOUR THREE NINE OH NINE SIX OH EIGHT** exactly. Selecting CageThrottleUs alone gives the same output. The deleted-account 2012-01-05 20:29:12 UTC copy of the HANDMAIDENS line predates the OF CLYDNO line (20:37:08); the named-account copy of HANDMAIDENS follows at 20:46:28, restoring coherent source prose order and both L selections. This is a source-defined account filter, not manual correction of two letters. The archival transcript is community-preserved, and these titles are unsigned.
- The named-account extraction has 76 characters, 16 spaces, 59 GP29 runes, prime sum 2262; the all-account variant retains the lengths but has prime sum 2246. Thus the previously reported prime arithmetic survives the named-account reconstruction, while the archive-order sensitivity is explicit.

The source-specific operations inspected for a transferable transport were: the original 2012 line:character extraction and title Vigenère; the signed subreddit Welcome/Problems/Valete messages and downstream phone recording; the signed 2013 opening book-code coordinates, native GP29 table, BASE29 and NEXT protocol; the signed 2014 opening book-code (paragraph:sentence:word:letter, with literals inserted), and the documented 2014 Stage10/11 handoff. The 2012 Vigenère literally preserves spaces, the GP29 table supplies no space glyph, and the 2013 BASE29 command converts integers to a separate alphanumeric digit alphabet. The later book-code extracts letters within words with separately supplied literals. None of these inspected sources specifies replacement of each 2012 ASCII space by one GP29 rune, a boundary-moving codec, or an address into p55.

For clarity, the exact lengths of literal composition with the authenticated radix29 conversion (without claiming those compositions are authored) are:

| Input to numeric conversion | Minimal base29 digits |
| --- | ---: |
| 76 individual ASCII code points | 152 |
| Full 76-byte ASCII message as one big-endian integer | 125 |
| 59 native GP indices plus each ASCII space 32 as base29 | 91 |
| 76 original book-code column integers | 89 |
| Both fields of all 76 book-code coordinate records | 213 |

None is 75; in particular a space byte 32 has two radix29 digits. The historical digit alphabet is not GP29 without an additional mapping. These are exact type/length contradictions for the listed literal serializers and do not exclude a specially specified compression or cipher.

The [reproducer](../sims/lp2_2012_bookcode_named_account_transport_sft.cjs) retrieves the pinned JSON and uses the already-recovered local coordinate payload. The same filtering, decoding, extraction and numerical tests were executed against the connector-fetched source in this invocation. No new receiver sweep was run. **Decision:** preserve the exact historical phrase as an unconfirmed operand; park #2493 at the missing independently selected space-to-rune/segmentation and receiver instruction. No source-selected p55 decoder is available for #41; #2278 remains free to investigate unrelated boundary-changing mechanisms. This is a bounded source decision, not evidence that no such lost instruction ever existed.



### Independent recovery of the complete 2012 carrier from the old Gutenberg edition

The pre-2012 Project Gutenberg edition survives as [GITenberg old/mbng10.txt](https://github.com/GITenberg/The-Mabinogion_5160/blob/86b1521ce54ddae3caaa235a6fb04a9ae67f2370/old/mbng10.txt), pinned commit `86b1521ce54ddae3caaa235a6fb04a9ae67f2370`, blob `2a149950ed767f5c6f03d9710935f288b85d72d0`, 599,427 ASCII bytes. Its header dates the first upload and latest update to 22 May 2002. The updated 2014 edition is not the input.

Begin at `KING ARTHUR WAS AT CAERLLEON`, zero-based byte 17,345. Uppercase, trim each line, omit empty lines, and concatenate each line of at most three whitespace-separated words to the preceding line with one space. In the first 188 nonblank tale lines exactly three merges occur:

| Original nonblank line (one-based) | Orphan | Resulting title |
| --- | --- | ---: |
| 10 | LODGING. | 9 |
| 51 | DAGGERS. | 49 |
| 138 | TO THEIR LORD. | 135 |

The resulting 185 lines equal **all 185 archived decrypted titles exactly**, including punctuation and double spaces. Joined length is 12,384 characters / 2,414 words. Applying the original 76 coordinates directly to this independent book reconstruction recovers the historical phone instruction verbatim, without needing Reddit. The <=3-word threshold is an inferred minimal rule reproducing all observed boundaries, not a surviving author instruction. No hidden textual substitutions remain in this excerpt. Same SFT now independently retrieves and checks the original-book blob and exact carrier equality. This establishes an actual historical line-reflow operation, not an LP2 space-reflow rule: its earlier merged breaks can only be reconstructed from the known source book. No LP2 key or plaintext is established.

### Independent 13/23 historical numeric-key lead (Agent14)

The archived 2012 subreddit banner displays thirteen Mayan digits, which are the first 13 members of the **23-member** numeric shift key derived from the community-info string. The original clear p57 has a red13 stop after its title and a unique terminal red23 stop. That pair is a concrete, independently available source clue to the two historical key lengths, but the connection is conjectural; no first-party text says to transfer the banner key to LP2. The numeric source sequences are the prefix and full key `[10,2,14,7,19,6,18,12,7,8,17,0,19,7,14,18,14,19,13,0,1,2,0]`, with no fitted values. The historical 2012 subtraction and title reset motivate direct GP29 subtraction and printed-line reset; solved LP1 repeating-key page-continuous clocks motivate the separate page reset. The original p0 opening red13 and terminal p55 are the fixed recipients, with p55 carry-in retained or excluded, yielding 12 scoped cases. The original 4-line p55 register is [24,22,22,8]. Both ordinary native GP29 subtraction and the distinct known plaintext-F bypass were tested.

| Key length | p0 first impossible physical index, line/page | p55 full, line/page | p55 body, line/page |
| --- | --- | --- | --- |
| 13 | 53 / 111 | 51 / 35 | 4 / 4 |
| 23 | 53 / 43 | 51 / 55 | 4 / 4 |

The failure indices are zero-based. **All twelve plaintext-F bypass models have no legal inverse**, even granting every possible interpretation of ciphertext F as literal or ordinarily encrypted. Direct additive outputs are nonlinguistic (p0 IoC 0.03349–0.03536; p55 0.03263–0.04070). The same four direct numeric-key/clock combinations applied to the complete original 12,956-rune manuscript have IoCs 0.03450565, 0.03449935, 0.03448245, 0.03447280 (13/line,13/page,23/line,23/page), indistinguishable in magnitude from original 0.03447840. Native solved-p57 plants recover exactly under the bypass inverse and all their alternative paths re-encrypt. The source replay also independently recovers the original 2012 message under the true title-reset Latin26 operation. See the expanded same [SFT](../sims/lp2_2012_bookcode_named_account_transport_sft.cjs). The fixed direct GP29 transfer fails; retire these two exact numeric keys with these two clocks, rather than rotate/reorder the banner or manufacture new key representations. The historical 13/23 observation is not a decryption.



### Literal 76-line transport: all-secret column-codebook obstruction (Agent14)

The historical payload gives one coordinate per line, exactly lines 1 through 76. The full p55 register, including the p54 carry-in, also has 76 glyphs. Test p55 as the column register with implicit rows in the original 2012 named-account decrypted title text and the exact historical 76-character phone phrase. The one-based GP ordinal gives 76/76 in-range addresses but yields `EETSET SEF II, STTYRE A G"R OIS SARAOA GDAIAST,AEFNUV EEXNLIEE MIT DEIN IE N`, not the historical phrase. GP prime values yield only 55/76 in-range addresses.

Even an arbitrary secret rune-to-column function cannot reproduce the original coordinates (32 distinct columns versus 25 distinct observed runes). Allowing alternate columns that produce the same exact historical character does not rescue it: 18 of the 25 rune types have empty intersections of compatible columns. More generally, grant each rune a private set of columns, and freely choose one at each occurrence. For each column, form a bitmask of occurrences where that column selects the required character. The exact minimum set-cover DP gives this sharp distribution:

| Minimum columns | Rune types |
| --- | ---: |
| 1 | 7 |
| 2 | 8 |
| 3 | 4 |
| 4 | 5 |
| 6 | 1 |

The total minimum is **61 rune-column associations**. In particular, S at one-based rows 6,10,38,55,57,62 requires six separate columns: no column covers any pair. Thus even an arbitrary five-choice private codebook fails on this alignment, independently of the selector/clock. Explicit optimal column lists witness the minima. As a genuine historical control, encode the original 76 columns modulo29: the same solver succeeds with at most three columns per residue. Same [SFT](../sims/lp2_2012_bookcode_named_account_transport_sft.cjs), directly executed experimental function. No additional fit or language scoring. Retire these bounded row-aligned book-code transports; the historical message is not established LP2 plaintext. A genuinely new source-selected operation is required.

## Conditional crib propagation into other original receivers (Agent37, 24 November)

The mixed-token alignment allows a direct attack without assigning any of the 16 spaces a GP value. Under a common additive pad, at each of the 59 known letter positions the other receiver plaintext is forced by `P_B = (P_A + C_B - C_A) mod 29`. All 16 untyped slots remain unrestricted. Under a literal shared XOR pad the forced target is `P_B = P_A xor C_A xor C_B`; any value outside 0..28 is an exact GP29 contradiction.

Freeze the previously documented [p27 cyclic seam](lp2-p27-p55-sixrepeat-boundaryfree-paired-plaintext-gate.md) (42 final plus 34 initial chapter runes, omit the p55 carry-aligned position), [p32 tree-art placement](lp2-tree-p32-p55-boundaryfree-twotimepad-plaintext-gate.md) (its earlier explicitly postselected offset19, omit first rune), and three distinct [p53 moth-art placements](lp2-p53-p55-moth-terminal-marker-reusedpad-original-wordgate.md) (p53 indices 1..75, 0..74, 104..178). No new phase or alignment is optimized.

The [read-only CJS reproducer](../sims/lp2_2012_p55_crib_paired_receiver_sft.cjs) fixes all 59 propagated letter positions and uses exact dynamic programming over the preceding three GP symbols to maximize smoothed tetragram likelihood over all 29^16 wildcard assignments. It trains on the first 145,461 of 217,106 GP symbols from the pinned Shakespeare reference using the prior paired-decoder normalization. It imposes no word boundaries. Eight distinct held-out 75-rune native passages are encrypted under arbitrary pads agreeing with the p55-derived pad at all known slots. All 59 fixed letters are recovered, along with 8–14 of the 16 wildcard letters.

| Frozen receiver | Best GP29 log score | Forced XOR values outside GP29 |
| --- | ---: | ---: |
| p27 cyclic seam | -448.133719 | 4 |
| p32 prior art offset19 | -434.446055 | 3 |
| p53 page start | -383.338475 | 4 |
| p53 first complete p55 word | -447.361040 | 3 |
| p53 terminal marker | -451.767207 | 3 |
| Eight held-out native additive controls | -172.353872 to -115.938556 | not tested |

The strongest original score is over 210 log units below the weakest genuine native control. The p27 terminal E I G H T is forced by the existing five matching ciphertext runes and the speculative crib, not independently recovered. Its initial known target symbols are NG Y H EO ? EA X ? AE Y ? I O. Changing spaces cannot alter those letters. No complete original output is coherent. Every XOR placement is an exact contradiction under the specified shared-pad/crib assumptions.

A strict F policy requiring P=F iff C=F conflicts at p55 body offset14 (P=T, C=F). This does not exclude a plaintext-only F bypass that permits ordinary non-F encryption to F. The actual phrase F at body offset40 matches original F; the third original F at offset24 corresponds to an untyped space.

**Decision:** retire these five shared-pad placements for the specific mixed-token crib and direct GP29 ordinary-native target, even with freely changed segmentation. The language comparison is finite-control evidence; XOR range contradictions are exact. No unknown plaintext or authentic key was found. The wider #2278 problem remains open; a new author-selected reversible space representation or independent alignment is required before further fitting. Direct execution of the committed experiment function produced the values above; no Windows CI result is claimed.

## Exact OutGuess transfer test on original p55

The source-selected receiver is the original May 2014 Stage11 file `55.jpg`, pinned to commit `6c3421a4d245596e403c88e037509d162a2afd17`. Its identity was verified in the reproduction run: **614,928 bytes**, Git blob SHA-1 `ee00cd34013fe3a5c6808650abb6d3206b6f1b13`, SHA-256 `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`.

Using the same pinned OutGuess 0.4 source and exact historical read command, with no password or extra flags:

```sh
outguess -r 55.jpg 55.jpg.out
```

The 2012 positive control again succeeds (29,049 usable bits, seed 228, length 535; exact 535-byte payload hash matches). On p55, OutGuess reports **629,181 usable bits**, **seed 41,408**, **length 58,152**, then terminates with **SIGFPE**. The output file is created but contains **0 bytes** (empty-file SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`). It contains neither the 2012 payload nor the book-code phrase.

Reproduction: [workflow run 45292635452](https://github.com/FlareZ123/liber-primus/actions/runs/45292635452); [exact SFT](../sims/2012_outguess_transfer_lp2_p55_sft.cjs). This is a negative result for this exact OutGuess 0.4 extraction on original p55, not proof that every possible image-steganography method is absent. It is consistent with the existing LP2 writer-fingerprint analysis.

## 2012 telephone number as an OutGuess password: original LP2 all-page gate

The recovered 2012 book-code message explicitly supplies telephone number **2143909608**. Treating it as a cross-round OutGuess password is one source-derived candidate, not a password search.

The source-faithful OutGuess 0.4 receiver in sims/outguess_extract.py and sims/outguess_bitmap_dump.c was run against original archive images 17–74 (all 58 LP2 JPEGs). The same receiver passed authentic LP1 controls under the historical default key: image 00 recovered a 2,899-byte PGP-armored message, and image 08 recovered the 140-byte “For those who have fallen behind” text.

All 58 LP2 images have the already-documented all-one first 1,024 eligible-coefficient bits, so their encrypted OutGuess headers are source-forced. Under password 2143909608, the 54 completed extractions all decode the same forced header 9566a29b (little-endian seed 26,261; length 39,842). Four archive images (31, 49, 73, 74) terminate with “iterator adapted to zero skip modulus.” None of the 54 outputs has a file signature, PGP armor, or near-printable content; entropy is 7.994522–7.996296 bits/byte and printable fraction 0.377491–0.387631. All 54 share the same first 32 output bytes, another consequence of the forced prefix.

LP2 p55 is archive image 72. Its 39,842-byte output has SHA-256 6e8bd6218148d795044bb9ed80b0e127254849cfdb9373e02a89c5f4e3e8b19c, entropy 7.994522 bits/byte, printable fraction 0.383264, and no recognized magic or PGP armor. It is not a recovered payload.

Reproduction: [bounded source-transfer SFT](../sims/2012_bookcode_p55_transfer_sft.py). This rejects only the literal 2012 telephone number as an OutGuess 0.4 password on these original LP2 JPEGs; it does not prove that every steganographic method or key is absent.

**Decision:** reject transfer of the historical OutGuess extraction operation to p55. Reject the literal 2012 telephone number as an OutGuess password for the original LP2 image set, and reject the bounded direct phrase-pad and coordinate-pad consumers above. Preserve the mixed-token book-code phrase as a historical candidate with 59 letter-runes and 16 untyped spaces; its direct shared-pad propagation to five prior placements failed even with unconstrained segmentation. Further work requires an independent source-selected space representation. No generic OutGuess page sweep, password dictionary, arbitrary coordinate-to-rune mapping, or broad Vigenère/OTP key sweep is justified without a new first-party selector. No unknown LP2 plaintext, authentic LP2 key, complete inverse, or final Cicada destination has been recovered.

**Research result class:** exact historical payload recovery; negative original-p55 default-key OutGuess transfer; negative 2012-phone-number OutGuess transfer across all 58 LP2 originals; bounded direct key-consumer exclusions; conditional mixed-token p55 crib with direct substitution/Caesar/transposition exclusions and five original-receiver shared-pad negatives.


## Masked crib affine-key recurrence recovery (Agent31, 24 November)

The p55 mixed-token proposal also supports a direct key-recovery attack that does not choose a space symbol. On the same frozen 75-body-rune alignment, set known key values K_i=(C_i−P_i) mod29 at the 59 letter positions and leave all 16 remaining key values entirely unconstrained. Motivated only conditionally by the independently observed p15 Fibonacci arithmetic, test the more general reversible affine stream K_{i+d}=b+sum(a_j K_{i+j}) mod29, with a_0 nonzero, all coefficients, constant, and initial state secret, and order d=1..5. No ciphertext-dependent feedback or F bypass is included. The additive sign is immaterial since negating all K and b preserves this family.

For each d there is at least one consecutive d+1 known run (NUMBER supplies six). Its first d terms fix an anchor state and its final term fixes b uniquely for every coefficient vector. Enumerate all 28×29^(d−1) vectors, filter every wholly known recurrence window, then propagate the complete state forward and backward, rejecting any known position mismatch. Since a_0 is nonzero, reverse propagation is unique. This is exhaustive within the stated family and no English scoring is used.

| Order | Known windows | Coefficient vectors | After known windows | After forward propagation | Full original solutions |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 42 | 28 | 0 | 0 | 0 |
| 2 | 25 | 812 | 0 | 0 | 0 |
| 3 | 13 | 23,548 | 0 | 0 | 0 |
| 4 | 4 | 682,892 | 28 | 0 | 0 |
| 5 | 1 | 19,803,868 | 19,803,868 | 0 | 0 |

Exact original p55 indices from canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 are embedded in the [NumPy reproducer](../sims/lp2_p55_masked_affine_recurrence.py). The local execution used 250,000-vector batches. Five deterministic planted masked streams (one per order, RNG seed 3100+d) include the correct full tape and recurrence among the solutions, with candidate counts 1,1,28,1,1 respectively. This is inclusion rather than unique parameter recovery for order three. The order-five original search took approximately 4.2 seconds locally; no Windows CI claim.

### Authentic F-transparent clock extension (Agent5, 24 November)

The solved p56 convention emits plaintext F (index zero) unchanged without consuming a keystream element. The previous ordinary-clock test does not cover this. In the fixed 75-rune p55 body, ciphertext zeros are at offsets 14, 24, 40 (zero based). The crib fixes a non-F at 14 and F at 40, while 24 is an unknown gap. Hence the only possible skip masks are [40] and [24,40], consuming respectively 74 and 73 key terms, each with 58 known values. At every consumed position, even unknown gaps, the decoded plaintext must be nonzero. Enumerate all reversible affine recurrence coefficients as above on each compressed tape, enforcing the nonzero plaintext condition throughout propagation.

| F skip offsets | Order | Known windows | Coefficient vectors | After known windows | Full solutions |
| --- | ---: | ---: | ---: | ---: | ---: |
| 40 | 1 | 41 | 28 | 0 | 0 |
| 40 | 2 | 24 | 812 | 0 | 0 |
| 40 | 3 | 12 | 23,548 | 0 | 0 |
| 40 | 4 | 4 | 682,892 | 28 | 0 |
| 40 | 5 | 1 | 19,803,868 | 19,803,868 | 0 |
| 24,40 | 1 | 42 | 28 | 0 | 0 |
| 24,40 | 2 | 26 | 812 | 0 | 0 |
| 24,40 | 3 | 15 | 23,548 | 0 | 0 |
| 24,40 | 4 | 8 | 682,892 | 0 | 0 |
| 24,40 | 5 | 6 | 19,803,868 | 1 | 0 |

All 41,022,296 coefficient/mask combinations were enumerated locally. Every forward survivor count was zero. Five deterministic positive controls (seeds 5101–5105) each recovered the exact recurrence and full tape uniquely under its true F mask; the mask enumerator included the true mask and encryption replay matched. The controls did not establish blind mask uniqueness. [Standalone NumPy reproducer](../sims/lp2_p55_ftransparent_masked_affine.py), commit aa3dac220456b80bcae5ecf63668eb11996238a4.

**Combined decision:** no reversible affine additive keystream of order at most five realizes the frozen historical phrase alignment under either the ordinary or the authentic F-transparent clock, even with unconstrained unknown gap values. The historical crib remains unverified. Higher order, noninvertible transients, alternative alignments, nonlinear or ciphertext-conditioned state, and nonadditive models are outside scope. Do not enlarge recurrence order merely to fit this crib.

## Arbitrary gap placement under all-secret native-length periodic pads (Agent1, 25 November)

The historical 59-rune phone phrase has 16 spaces; p55 has 76 glyphs including the p54 carry. Previous fixed-slot tests do not exclude a **59-letter ordered crib at any 59 of the 76 physical positions**, with 17 surplus positions freely placed. Test this strictly more permissive alignment as a way to recover an authentic effective key and then predict preceding p54 if any key survives. The motivation is the independent 59/76 historical phrase length and the solved LP1 keyword periods 8 and 13; no first-party instruction selects this gap mechanism or establishes the phrase as p55 plaintext. The historical phrase's complete order, GP spellings (TH contracted, spaces omitted), the p55 physical order, and the two native-length periods remain fixed. No language score or word boundaries are needed.

**Exact nonconsuming-gap inverse:** enumerate every embedding of the first q consuming crib symbols. Each determines the entire effective q-digit key by k_j=C_position−P_i mod29. After that, greedily find the earliest compatible ciphertext occurrence for each remaining crib symbol. Earliest-match subsequence recognition is complete because the future requirements depend only on the crib cursor, not the physical position. Both ordinary consumption and native plaintext-F literal holds are covered, and arbitrary initial key rotation and sign are absorbed in the arbitrary effective key. The phone phrase has no F in its first 13 runes, so exactly binomial(17+q,q) prefix embeddings must be visited per clock. All possible gaps include the carry; fixing the carry to be a gap would only reduce the domain.

**Exact physical-consuming-gap inverse:** instead let every ciphertext position consume a pad symbol, including the unknown gaps. For the F-transparent version enumerate every subset of original visible F positions 15,25,41 (zero based) as nonconsuming literal-F holds. Each mask fixes the physical phase array. During ordered crib-subsequence search, a matched consuming symbol binds its phase key or checks an existing binding; a matched literal F requires a held position. Once all phases are bound, greedy earliest compatible matching is again complete because the physical phase array is fixed. In the transparent case unmatched consuming positions are granted arbitrary plaintext even if their inverse is F, a relaxation of the native rule; zero survivors therefore excludes the stricter rule too. Unassigned phases at a completed alignment would remain wildcards.

| Period | Clock | Nonconsuming-gap prefix embeddings | Physical-clock search nodes (all masks) | Surviving original effective keys/patterns |
|---:|---|---:|---:|---:|
| 8 | Ordinary | 1,081,575 | 67,837 | 0 / 0 |
| 8 | F-transparent | 1,081,575 | 515,450 | 0 / 0 |
| 13 | Ordinary | 119,759,850 | 2,236,350 | 0 / 0 |
| 13 | F-transparent | 119,759,850 | 14,280,124 | 0 / 0 |

All four nonconsuming-gap positives uniquely recover their independently supplied planted key and forward-replay all 59 crib letters; all four physical-clock positives uniquely recover their planted effective key under the actual generated hold mask (one ordinary q13 positive admits two accepting branches for the same key). These are constructed cipher controls using the historical crib, not new native solved-page decryptions; the historical q8/q13/F conventions were established separately. The physical-clock negative enumerates all eight visible-F masks, while the corresponding positive uses its true generated mask. The two programs ran locally in Node 22.16.0 against the full 76-index canonical p55 array retrieved from the repository; the committed checkout entry points also assert the canonical array and alphabet. No CI execution is claimed.

Reproduce with [nonconsuming-gap SFT](../sims/lp2_p55_phone_gapped_periodic_sft.cjs) and [physical-clock SFT](../sims/lp2_p55_phone_gapped_physical_sft.cjs). The exhaustive negative removes both ways of moving the 17 gaps within these q8/q13 additive families, including all 16-space placements with the carry excluded. It is a known-plaintext compatibility test, not a general p55 inverse: unknown plaintexts, arbitrary other key schedules, reordered/substituted cribs, and mixed clocks where some non-F gaps consume and others do not are outside scope. No new unknown-page plaintext, key, or authored selector. Retire this particular ordered crib transfer under these families rather than extending to arbitrary periods or retuning the gaps.
