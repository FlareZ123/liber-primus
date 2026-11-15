# P55 recursive word circumferences produce a unique 23-rune inner register

**14 November 2026, Agent7. Status: original-source-constrained, exploratory extraction, no recovered plaintext or keyed inverse.** The last unsolved physical page, p55, is adjacent to the clear p57 PARABLE that tells the reader to “shed our own circumferences” and “find the divinity within.” Repeatedly remove the first and last GP rune **of each complete printed word**, retaining the others in order, and stop when none remain. Applied only to the 16 complete words wholly within p55, this yields a peculiar nested register. The **second peel leaves 23 GP rune symbols**, exactly the count of the final p57 red-dot mark and the modulus in the signed 2013 DH challenge. A straightforward historically available BASE29-to-byte consumer of those 23 digits does **not** yield printable plaintext.

## Original source and justified geometry

The p55 manuscript starts with one isolated `NG` rune that closes an **eleven-rune word beginning on p54**, whose ten previous symbols are `G O T TH X E EA R G Y`. The page then prints **16 whole words**, which must be separated from this carry fragment before computing word circumferences. Their exact GP rune lengths in source order are:

`[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`

These sixteen full words contain **75** runes. The carry rune makes physical p55's original total **76**, and the original unknown corpus still contains **12,956** runes. The extraction is **an unambiguous full-word operation on the sixteen page-contained words**, unlike the separate conditional p55 33-outer/43-inner *page-local* polynomial interpretations that treat the carry as a stand-alone edge. The source does not explicitly order this particular exclusion or iteration depth, which remain the weakest premises.

The source-visible instruction “shed circumferences” motivates successive edge removals, without any secret key, letter substitution or fitted phase:

| Completed peels | Surviving printed words | Total original runes remaining | Exact resulting GP rune stream |
| ---: | ---: | ---: | --- |
| 0 | 16 | 75 | Full sixteen words, see reproducer |
| 1 | 11 | 43 | Full strict interior of those words |
| **2** | **7** | **23** | `G D A B F X I M U C P H NG D IA I G X EO TH TH I M` |
| 3 | 3 | 9 | `X I M U C P H G TH` |
| 4 | 1 | 5 | `I M U C P` |
| 5 | 1 | 3 | `M U C` |
| 6 | 1 | 1 | `U` |
| 7 | 0 | 0 | Empty |

The **seven** words at depth two have surviving lengths `[2,2,9,2,3,3,2]`. The three at depth three are `[7,1,1]`. All are literal original ciphertext runes in original relative order, with no claimed decipherment. The single final `U` is original GP rune index1 (prime3). It must not be interpreted as a recovered English pronoun without a predictive decoding rule.

A 2014 player had the three earlier magic squares of orders 5, 7 and 5 before receiving LP2, making a **seven-row source object** another candidate context for the seven surviving words. There is no independently indicated mapping from those seven unequal-length rune words to the square's cells or any next cryptographic operation. The matches 43, 23, 9, 5, 3 and 1 were noticed after inspecting the words and historical counts; treat them as a structural extraction worth testing, not separate statistical confirmations.

## Independent original-corpus comparison

The exact continuous-word parser respects original `%` page turns and `/` line wraps, **does not terminate a word at the physical p54→55 boundary**, and parses the first 55 rune-bearing unsolved pages (skipping the runeless p50) into **2,896 full words totaling 12,956 runes**. Repeating the same operation on every consecutive 16-word window yields **2,881** windows:

| Predeclared property of a 16-word window | Matching windows |
| --- | ---: |
| Complete 75-rune input | 115 |
| Complete 75-rune input followed by exactly 23 after two peels | 7 |
| Entire staged length path `75,43,23,9,5,3,1,0` | **1**, the actual p55 block at zero-based complete-word index **2,880** |

This is an **empirical distinctness count under the actual manuscript**, not a chance probability of authorial design. The extraction window was selected by a source-visible terminal parable and the full stage path was recognized during exploration. It cannot establish a key by itself. The full original word lengths uniquely determine every stage's remaining count.

## Frozen first 23-rune consumer

The historically authenticated 2013 Cicada server explicitly demonstrates unsigned positional `BASE29`; that supplies a plausible, narrow test for the 23 original GP digit indices. Encode the selected second-peel register as one **big-endian base29 integer** `N=Σ digit_i×29^(22−i)`; this entire range fits 14 bytes because `29^23<256^14`. Read its exact 14-byte, zero-padded big-endian form without shifting, secret keys, compression guesses or extra byte offsets.

- The original 23-rune integer is `1015521743086949888934587058926666`.
- Its exact 14 bytes are `32 11 af b9 81 f0 de 40 d7 26 90 a8 b4 4a`.
- Only **4/14** bytes are printable ASCII; rendering nonprintable bytes as dots gives `2......@.&...J`.
- A separate **14-byte positive plant**, the source-native clear-text label `PARABLE SOURCE`, is encoded as exactly 23 positional BASE29 digits then recovered byte-for-byte by the identical routine.

This **rejects the direct 23-rune positional BASE29→printable ASCII hypothesis**. It does not exclude that the 23 runes are a key, coordinates, compressed/encrypted bytes, a cross-round link, or a clue pointing elsewhere. No serialization, cipher state, key, or target byte grammar besides the tested printable ASCII interpretation is authored by the preserved source.

## Follow-up: conditional DH23 / p56-cipher consumer

The same BASE29 integer was conditionally interpreted as a DH(23) client exponent, using the worked-example server public share 8 from the authenticated 2013 protocol. `N mod 22 = 4`, giving client public share `5^4 mod 23 = 4` and shared value `8^4 mod 23 = 2`. This matches the example's shared value 2, but is not independent evidence: `8` has order 11 modulo 23, so the example's client exponent 15 also gives `8^15 = 2`; the worked server base/public values are participant-generated, not fixed LP2 key material.

The follow-up then applied the solved p56 prime-minus-one inverse from first prime 2 to both the inner23 and the 52 peeled circumference runes (outer layer then inner layer, left edge before right edge per word). Both are negative: the inner23 has two legal F interpretations, neither readable; the outer52 has one legal F mask and is also non-language. The p56 known-plaintext positive control passes. Full exact inputs, outputs, caveats and a reproducer are in [the DH23 / prime-totient gate](lp2-p55-inner23-dh23-shared2-prime-totient-gate.md) and [its script](../sims/lp2_p55_inner23_dh23_shared2_gate.cjs).

This retires the simple **inner23→worked DH23 share→shared2 / first-prime2→p56 inverse** direct consumer for both the core and its source-ordered circumferences. It does not rule out an independently specified different use of the 23 symbols; no further DH peers, bases, exponent reductions, ring permutations or cipher starts are justified without an author-selected instruction.

## Reproducer and decision

[Complete Windows-compatible Node.js 22 CommonJS SFT](../sims/lp2_p55_recursive_circumference_23_sft.cjs) reads the original [GP corpus](../resources/liber-primus/lp2-corpus.json) and [printed continuous transcript](../resources/liber-primus/lp2-transcription.txt), validates the p54/p55 carried word, all seven peeling depths, all 2,881 manuscript windows, exact BASE29 bytes and native positive implant.

**Next decision with a causal path to plaintext:** seek an **independently authored stopping and consumption rule** for the 23 symbols, particularly any original p57 red-dot instruction or 2014 seven-row square operation that fixes a reversible key use. The worked-example DH23 / p56 direct consumer has now been tested and retired as documented above. Do not infer another free modulus23 mapping, alter the complete-word segmentation, or retune cipher shifts to make these 23 source digits read as a phrase. A subsequent original-input reading should recover meaningful external bytes/unknown plaintext and exactly reproduce the original 23 runes before promotion to [authoritative results](../results/README.md).

**Source references:** original p55/p57 scanned LP2 images and word transcript in `resources/liber-primus/`; 2013 authenticated BASE29/DH source `resources/external/2013-tcp-server-signed-source.md`; original 2014 5×5/7×7/5×5 magic squares `resources/cicada2014-openpuff-magic-squares.txt`; 2016 signature record `resources/cicada2016-4gq25.md`. Existing conditional p55 one-peel source polynomial research is consolidated in [p55 inner43 report](p55-inner43-base29-polynomial-bridge.md).
