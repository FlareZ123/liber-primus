# Conditional P7 READ URL → original signed Stage11 onion address: receiver test

**Agent10, 22 November 2026. Classification:** one concrete first-party URL operand, one complete-word corpus readout check, and bounded negative original-page direct-key inverses. **No unknown LP2 plaintext, authentic key, destination, or p56 deep-web hash preimage was recovered.** This report follows [the P7 two-square discovery](lp2-p7-2014-two-square-fifthpower-readurl.md).

## Historical path and exact source operands

The end of original physical P7 visibly contains five red complete GP29 words, lengths **2,4,3,2,3**, with a 2|3 stop division and five dots below. The original whole-word **zero-based GP index products**, modulo29 and in source order, are **[11,26,8,15,2]**. The fifth powers (GF29) of the original printed first and last 2014 Stage10 5×5 magic squares give:

- First square: **[13,18,4,28,23] = P E R EA D**.
- Last square: **[1,4,20,14,21] = U R L X NG**.

The central six GP symbols spell **READ URL**. Four outside symbols remain unexplained (**PE** and **XNG**). The author did not supply a known instruction to take *GP0 products*, raise both matrices to the fifth power, and discard outer positions. Historical LP1 instead demonstrates whole-word **prime sums**, which do not give the message under these matrices. The instruction therefore remains a **retrospectively identified candidate**, not a verified decryption.

One unusually concrete follow-on operand already available to a human LP2 solver is the [actual original 2014 Stage11 PGP clear-signed handoff](../resources/historical/cicada2014-stage11-message.asc). It prints **ky2khlqdf7qdznac.onion**, the address through which the book was originally obtained. Its 16-character historical Tor-v2 Base32 hostname *canonically* decodes to exactly **ten bytes**, the same width as the two-square combined output:

    Hostname:                 ky2khlqdf7qdznac
    Tor-v2 Base32 bytes:      56 34 a3 ae 03 2f e0 3c b4 02
    Decimal byte indices:     86 52 163 174 3 47 224 60 180 2
    Bytes modulo29:           28 23 18 0 3 18 21 2 6 2

The URL and its Base32 interpretation are sourced and exact. Using them as a cipher key is **not** source-authenticated; the phrase could also refer to another, as-yet-unseen URL. Furthermore, the same original Stage11 URL was *already read* to obtain LP2, so an additional instruction to read it could be redundant unless an additional operation is provided.

## Original complete printed-word control for the phrase

The canonical p0–55 unknown-corpus transcription contains **2,896 complete printed words**, including words split by line or page boundaries. Sliding the same original zero-based word-index product and two original A^5/B^5 matrices over all **2,892 consecutive five-word windows** gives the exact GP six-rune string **READURL in exactly one window**, at zero-based complete-word index **408**, the original P7 final five red words.

For a broader sense of operator selectivity, normalize the pinned 300,000-character Shakespeare and 90,965-character Gibran controls to GP29, retain **335** distinct three-GP-rune natural-word spellings and add the modern word **URL**. Exactly **one** of all 2,892 actual original ciphertext windows yields two three-rune words from this 336-spelling lexicon: **READ URL at index408**. The dictionary was chosen after the phrase was noticed and is spelling/corpus dependent; this is a descriptive cross-input property, not a corrected significance estimate. Under a simplistic uniform independent GP-five-vector model, the 336×336 possible dictionary pairs admit **3,768** inputs among 29^5 possible vectors, giving an expected **0.531** dictionary-pair hits across 2,892 such hypothetical windows. Thus simply seeing one two-word output is not unusual on that reference. The *specific wording at the artistically marked location* and historical input connection are the potentially interesting components, subject to broad prior hypothesis selection.

## Frozen direct receiver attempt

A newly documented next action must recover original ciphertext, so six unkeyed-by-fitting source-derived candidate repeating GP29 masks were formed:

| Source-to-key operation | Key runes |
| --- | ---: |
| Signed onion URL decoded ten bytes, each modulo29 | 10 |
| Signed onion URL sixteen Base32 characters, each as digit modulo29 | 16 |
| Entire authentic two-square output before trimming | 10 |
| Decoded ten URL bytes minus entire two-square output, modulo29 | 10 |
| Original 256-byte p50 table values at the ten decoded URL-byte indices, modulo29 | 10 |
| Only the central GP instruction READURL | 6 |

For each candidate, ordinary GP29 Vigenere inversion was applied at **both signs**, starting key phase zero at the original physical page beginning, to original source pages **p0**, **p8**, and **p55**: **36 complete original-page inverse settings**. On P8, symbol statistics are computed for the initial title-excluded **243 black runes**; the other pages are evaluated completely. The keys, cells, pages, phases, directions and comparisons are all frozen before reading any hypothetical plaintext. A solved source-native P57 positive was forward-encrypted and recovered exactly under all twelve key/sign settings.

All 36 original inverses remain non-prose: every index of coincidence is **below 0.041**, compared with the solved P57 control **0.06270997** and the GP29 uniform baseline 1/29≈0.03448276. Highest original value **0.03965** is on short P55 for the raw ten-byte URL-mod29 subtraction key. Nearest-page P8's highest (black-body) value is **0.03802**, and its output has no coherent readable text. The ten p50 bytes selected by the signed URL-byte indices are **[111,86,82,209,186,76,68,106,144,167]**, with no direct ASCII URL.

This retires only the explicitly fixed **simple repeating-key consumers** and page-start clocks. Tor URL bytes might still be input to a different, genuinely selected operation. The manuscript and handoff do not instruct an arbitrary KDF, extra phase, deep-cipher layer, p50 lookup or key mapping; searches multiplying those assumptions would be unconstrained.

## Decision and reproduction

Keep the source-defined **ten Tor-v2 hostname bytes** as a candidate *operand*, contingent on an independent author clue specifying their use. The direct decryptions fail, and the matrix readout remains a conditional phrase. An authenticated cipher instruction or independent unknown-page plaintext would justify a further test. Mere numerical width agreement or one clean English phrase does not license an unbounded key search.

**Windows Node22 original-source result:** [PASS run 45075775363](https://github.com/FlareZ123/liber-primus/actions/runs/45075775363), with all 2,892 word windows, the single READURL pair, Tor-v2 Base32 10-byte packet, all 36 original-page inverses and all twelve solved-P57 plaintext plants asserted.

**Exact original-data, read-only, Windows Node22 CommonJS reproducer:**
[sims/lp2_p7_readurl_onion7_base32_original_receiver_sft.cjs](../sims/lp2_p7_readurl_onion7_base32_original_receiver_sft.cjs).
It reads the actual pre-LP2 square and signed URL text, original marked red words, complete manuscript word-seams, canonical numeric table, GP29 controls, and solved P57 positive. It asserts all printed operands and original candidate outputs before reporting the final original-page inverses.
