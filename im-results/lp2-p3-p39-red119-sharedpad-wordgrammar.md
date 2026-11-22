# Two original red119 intervals: exact common-pad native-word exclusion

**Agent 7, 12 November 2026. Evidence class:** a source-motivated, key-independent rejection of one shared-key architecture on original ciphertext. **No previously unknown Liber Primus plaintext, authentic key, or destination recovered.** Original SFT: [p3/p39 shared-pad exact grammar](../sims/lp2_p3_p39_119_shared_pad_wordgrammar_sft.cjs). The pinned original-input [manual GitHub Actions run 43250206317](https://github.com/FlareZ123/liber-primus/actions/runs/43250206317) completed successfully and executed the named test step.

## Why try a common pad on these two passages?

The manuscript's only two isolated red three-rune spans occur at physical p3 and p39, in both cases immediately after **119 preceding runes**. Each 119-rune prefix also ends at an actual printed word boundary. The independently established degree-238 irreducible factor of the original pp49–51 numerical table is **238 = 119 + 119**. These three source observations motivate asking whether the two 119-rune streams could be distinct English plaintext passages enciphered with *the same* 119-rune additive GP29 keystream.

This is a conditional solve-path hypothesis. Neither the source images nor the polynomial factor expressly instruct reuse of a pad, enforce native-English GP word boundaries, or select a forward versus reversed direction. Earlier factor-derived LFSR and 119-pair affine gates address different operators. The present experiment tests the **fully unknown shared pad** and does not guess or enumerate its 29^119 possible values.

## Exact all-key invariant and corpus

Let A and B be the original GP29 rune-index prefixes, and suppose that for every aligned position i, **A_i = P_i + K_i** and **B_i = Q_i + K_i** modulo 29. Then the unknown key cancels exactly:

\[
A_i-B_i=P_i-Q_i \pmod {29}.
\]

For each printed word position, require plaintext P and Q to belong to a **32,081-entry distinct native-GP word dictionary** derived from four pinned language controls: Shakespeare (55,407 word tokens), Gibran (15,733), Emerson (77,932), and the TextBlob/Norvig English spelling-frequency lexicon (29,000+ listed spellings). Normalize Latin letters by the same shared GP convention: QU→CW, V→U, K→C, Z→S, ING→NG, with the documented multi-letter GP rune tokens. The actual 119-rune prefix layouts have **22 and 26 complete words**, respectively; all exact word boundaries come from the canonical printed transcription, without treating image-line wrapping as a word break.

A product of two dictionary prefix tries exhaustively computes every possible plaintext-letter pair consistent with (i) each position's exact GP29 ciphertext difference, (ii) the complete printed word lengths, (iii) the entire dictionary, and (iv) **any possible shared additive 119-symbol key**. At each rune, only pairs satisfying the fixed difference are permitted. At word ends, the respective trie must be at a real dictionary word; its state then returns to its root. States with identical trie nodes merge exactly. There is no beam width, score, secret-key search, or fitted alphabet. A path through the final rune would constitute two exact dictionary-compatible plaintexts and a recoverable common pad.

Two source-geometric readings were frozen:
- **Forward/forward:** both 119-rune streams in printed order.
- **Forward/reverse:** reverse p39's entire 119-rune stream, reverse its displayed word order, and use the reverse of each legitimate dictionary word in that reading. This is the one literal mirror interpretation, not an arbitrary per-word rearrangement.

## Results and actual positive controls

| Reading | Last nonempty trie state position | Exact impossibility reached | Consequence |
| --- | ---: | ---: | --- |
| Both prefixes forward | **Rune 10** | **Rune 11** | No pair of dictionary-native GP texts can share one additive pad |
| P3 forward, P39 fully reversed | **Rune 5** | **Rune 6** | The reversed reading also has no valid common-pad pair |

The failure occurs well before the 119-rune endpoint. Thus the result is not an arbitrary score cutoff or a failure to search a sufficiently large pad. It is an exact path-existence statement for the pinned lexicon and word layout.

To establish that the algorithm can recover the *entire original-length construction*, the reproducer independently samples native-GP dictionary words matching all **22/26 exact source word lengths**, encrypts both 119-rune streams with one genuine 119-symbol additive key, and confirms a valid end-to-end dictionary path at rune 119. A second full-length positive plant encrypts the second stream with the same pad in reverse position order; reversing the source reading also returns a valid end-to-end path. The original forward and reverse contradictions are asserted at their exact first impossible rune. The narrower 12,230-word three-literary-source control already became impossible by runes 7/6; adding the broader English spelling list delays the forward contradiction to rune 11 while preserving the reverse contradiction at rune 6.

## Consequence and strict limits

**Retire the idea that p3's first119 and p39's first119 encode two four-source English-dictionary native-GP word sequences under any shared position-wise additive GP29 pad with the original printed word boundaries.** In particular, a new guess about the 119-symbol pad itself cannot rescue this exact model. No addition of a different root, LFSR seed, or pad phase is warranted unless the original source changes the alignment or the plaintext-word assumption.

The result does **not** exclude pad reuse with a different language or unseen proper names, text with altered plaintext-word boundaries, a second encryption layer, a nonadditive or position-dependent operation, an unknown field-alphabet permutation, or the original two passages simply using independent keys. It does not demonstrate that the two 119-rune coincidences were intentional. The printed word lengths elsewhere are atypical of English, so rejecting a word-preserving submodel is expected to be narrower than rejecting all possible two-time-pad encipherments.

An independent, less restrictive frequency diagnostic on the same aligned differences gives IoC **0.03133457** for forward and **0.03247401** for reversed p39. Among 2,000 fixed-seed pairs of 119-rune windows from the separately normalized Shakespeare sample, the mean was **0.03622141**, with 31/2,000 at or below the original forward value. This is exploratory context, not an exact exclusion or multiple-testing-adjusted p-value. The reproducible trie impossibility above is the test's decisive observation.

**Next decision:** pursue the two red119 markers only if their visual context determines a new reversible **inter-stream operation**, supplies independent plaintext anchors, or explicitly directs a reading that does not presume dictionary-native word boundaries. The general book remains unsolved.
