# Original 2014 Onion6 plaintext → seven marked LP2 quotations: exact literal-crib gate

**Decision (23 November 2026, Agent14, Director #2393):** The first-party 2014 Onion5 book code directs solvers to the Onion6 prose and subsequent three submitted-square pages. Those seven archived period-attributed source texts are a motivated, newly distinguished crib family relative to earlier signed-message/2012-book scans. Using the original 2014 runic boundaries, its two documented post-square encrypted-page word tapes, and both frozen English spelling conventions, **none of the seven physically marked original LP2 quotation spans is an uninterrupted literal long passage from this source**. The longest matching **complete consecutive word lengths** is **6 words / 22 GP runes**. There is **no ≥12-word / ≥40-rune original plaintext candidate**, no source-selected cipher inverse, no new plaintext, key or destination. This excludes only literal reuse with identical printed word boundaries in these preserved witnesses; changed boundaries, paraphrase and a running key remain undecided.

## Independent evidence and complete source corpus

- The 2014 Onion5 signed GEB book-code instruction spells `ut3qtzbrvs7dtvzp.onion`, whose archived pages `10.jpg`–`13.jpg` convey the plain “Loss of Divinity”/Consumption/Preservation/Adherence/SOME WISDOM/PROGRAM YOUR MIND content. The archived square submission then returns `107.jpg`, `167.jpg` (one continuous `FIRFUMFERENFE`-encoded KOAN, with explicitly marked F skips), and clear `229.jpg` (Question All Things/Discover Truth). Archive: [initial Onion6 stages](https://github.com/cicada-solvers/neuroretransmit-cicada/tree/main/2014/008-sixth-onion) and [post-square plaintext](https://github.com/cicada-solvers/neuroretransmit-cicada/tree/main/2014/009-squares-submission-pages). The archived documents have the HTTP date 31 Jan 2014; the individual seven prose bodies are not all independently PGP signed. They precede the known LP2 publication chain but need not have been reused in the encrypted volume.
- The exact seven original ink-annotated quote offsets, original rune positions and printed word boundaries are immutable inputs from [original quote annotation](../resources/liber-primus/lp2-quote-punctuation-spans.json). In order: LP2 p6–7 `[1659,1677)`, p22 `[5459,5478)`, p40 `[9715,9727)` and `[9811,9869)`, p42 `[10211,10279)`, p42–43 `[10279,10439)`, p53 `[12522,12592)`. These have **[4,5,2,14,13,34,14] complete printed words** and **[18,19,12,58,68,160,70] runes**.
- Offline fixture [`resources/external/2014-onion6-seven-rune-pages.json`](../resources/external/2014-onion6-seven-rune-pages.json) stores **all seven archived original rune transcriptions**, their archive paths and Git blob IDs, plus the published editorial corrected-Latin plaintext. It preserves the exact 2014 runes and editorial readings as separate evidence classes. Neither a random web book nor a new quote alignment was selected by scoring.

## Decisive original-word test

The read-only [CommonJS SFT](../sims/lp2_onion6_quoted_crib_original_sft.cjs) parses the unmodified [original full LP2 transcription](../resources/liber-primus/lp2-transcription.txt), confirming **13,136 full runes, 12,956 unsolved runes, 2,896 unsolved complete words**, and exactly reproducing the seven physically marked start/end positions and their counts. It joins real `/\n` visual wraps and `%\n` physical page carries; only actual printed separators `- . $ & §` end a word. The two `:` before explicitly transparent F runes in the historical KOAN do not count as new characters or word breaks. The seven archived pages yield **181 words / 755 runes** (10–13), **87 / 319** (107–167), and **18 / 89** (229), with page carries preserved.

Before comparison, the three source groups and every quote interval are fixed. All original whole-source word windows were screened in (a) literal 2014 source rune lengths, (b) published corrected Latin greedily contracted by `ING|TH|NG|EO|OE|AE|EA|IA` into GP29 units, and (c) corrected but uncontracted Latin lengths. Word deletion/insertion, flexible chapter location, substitutions and quote-specific hand-tuned keys are disallowed. The scanned variants account for real source-native spelling vs the editorial corrected version.

| LP2 quote, words / runes | Direct original 2014 GP rune tape: maximum consecutive matching words (10–13 / 107–167 / 229) | Corrected raw-Latin: maximum |
|---|---|---|
| p6–7, 4 / 18 | 2 / 2 / 2 | 3 / 2 / 2 |
| p22, 5 / 19 | 3 / 2 / 2 | 3 / 2 / 2 |
| p40 short, 2 / 12 | **2 / 1 / 1** | **2 / 1 / 1** |
| p40 long, 14 / 58 | 4 / 3 / 3 | 4 / 3 / 2 |
| p42, 13 / 68 | 3 / 2 / 2 | 3 / 3 / 2 |
| p42–43, 34 / 160 | **6 / 4 / 2** | **6 / 3 / 2** |
| p53, 14 / 70 | 3 / 3 / 2 | 4 / 3 / 2 |

The corrected GP29 length control yields the same 6-word/22-rune maximum as the native runes; its full result matrix is printed by the SFT. **No full-span match exists for any quote with ≥4 words under any convention.** Two source-native (five raw Latin) matches of the original p40 **two-word** `3,9` pattern exist inside the 181-word manifesto; these are nonunique word-length coincidences and convey no specific plaintext letters. There is no independently selected consuming cipher/key, so constructing one to force a match would be postselection. The longest partial match, p42–43 six words, is just 22 runes and does not meet the predeclared gate.


## Actual 2014 13-rune cipher-clock source-plaintext transfer

**New independent exact plaintext decision, 23 November 2026.** The same historical Onion6 source documents the real **13-rune FIRFUMFERENFE Vigenère clock** with **two explicit colon-before-F skips** on the 2014 KOAN pages 107 and 167. Unlike the literal quotation test above, this experiment asks whether any of the seven historical *plaintext* pages was encrypted into **any of the 12,956 original unknown LP2 runes under a secret 13-rune Vigenère key**, even if all quotation positions and printed word breaks changed. Both signs are tested; all 13 secret key symbols, source placements and LP2 placements are unrestricted. The 13-rune key period is fixed by the original prior-stage cipher and is the sole tested period.

The appended read-only SFT reconstructs the **actual 319 source KOAN plaintext runes from the archived 107+167 ciphertext** in its original GP29 spelling using the archived 29-symbol historical index, source-documented shift vector [29,19,25,29,28,10,29,11,25,11,20,29,11], two colon-marked skips, and 317 other key advances continuing across both pages. It asserts the first five recovered GP runes spell A-KOAN in the historical alphabet. Together with four original plaintext manifesto pages and the final clear post-square page, this gives **1,163 source plaintext runes** (187/207/192/169/226/93/89), all pinned to original archive rune text. Editorial corrected Roman spelling is not used for the cipher test.

For any true 13-periodic GP29 additive or subtractive cipher relation between a plaintext source interval P and original LP2 interval C, the *necessary and sufficient* lag-13 equality is:

\[
C_{t+i+13}-C_{t+i} \equiv \sigma(P_{s+i+13}-P_{s+i}) \pmod{29},\qquad \sigma\in\{+1,-1\}.
\]

Thus, under **any possible secret 13-symbol key** and any alignment, an interval of L matching consecutive lag differences corresponds to precisely L+13 original runes. The exhaustive two-row longest-common-substring computation screens the actual 12,943 LP2 lag-13 values against all 1,150 historical source lag-13 values for both orientations, without key guessing, word alignment or substring scoring.

| Source-author 13-periodic GP29 family | Longest actual original-LP2 matching plaintext interval | LP2 unknown rune start | Historical plaintext rune start |
|---|---:|---:|---:|
| Additive (equal lag changes) | **18 runes** | 873 | 713 |
| Subtractive (opposite lag changes) | **17 runes** | 4,354 | 6 |

A 200-rune native historic-source segment encrypted with an arbitrary fixed 13-key passes the independently planted exact detection, and the existing seven-quote source positives remain intact. The two actual maxima are too short for an authentic key/crib. **This exhausts the full historical seven-source / any-location / all-secret fixed-period-13 Vigenère plaintext-reuse family** under the unchanged original glyph spelling, including changed word boundaries. It does not rule out authentic 2014-style selectively marked F-skips in LP2 if someone first discovers a genuine LP2 ink marker-to-clock selector, or any key period other than13. It recovers no unknown plaintext or cipher key.


## Seven historically ordered 2014 texts as one fixed running key

The same sources have a different, independently testable role as a **key**, not plaintext. Before reading the original cipher output, freeze the exact 1,163-rune sequence of the seven historical 2014 source pages in distribution order (10, 11, 12, 13, 107, 167, 229), then **repeat** that entire GP29 source stream from LP2 p0 rune index0 without a hand-adjusted phase, chapter rekey, subset, deleted word or fitted skip marker. The ordinary additive/subtractive GP29 inverse is historically documented in LP1 and the authentic Onion6 KOAN. This is a motivated but **not first-party-instructed** hypothesis; neither stage explicitly directs solvers to recycle all seven texts as a later-period key.

The actual full-book original-input inverse has the following native-GP29 index of coincidence, versus **0.06270997** for independently clear LP2 p57 (95 original source GP runes). Every indicated register preserves the exact original order and source-pinned page boundaries:

| Frozen source-as-key direction | p0–2, 729 original runes | p16–21, 1,613 original runes | pp40–53, 3,008 original runes | Full unknown p0–55, 12,956 runes |
|---|---:|---:|---:|---:|
| GP29 + historical source stream | 0.03450459 | 0.03440255 | 0.03453179 | 0.03446713 |
| GP29 − historical source stream | 0.03407498 | 0.03437025 | 0.03470117 | 0.03451634 |

The read-only source SFT tests both complete actual registers and replays a separate 400-rune historically sourced GP29 positive through the same fixed-index cipher. Neither direction approaches the clear p57 GP-native prose control across the opening receiver and independent late-page holdout; neither produces an authentic, linguistically interpretable decrypted passage. This rejects the **exact all-seven-2014-source, single global phase0, period1163 repeating running key** as a direct native-GP LP2 decoder. A specifically authored subset, offset, transposition or key-derivation instruction would constitute a distinct hypothesis, and no such instruction is established here. Do not rescue the present negative by selecting from that combinatorial family after seeing output.


## Research consequence

This source-specific original-input decision closes the literal quotation-reuse fork and the unchanged-period13 secret-Vigenere historical-plaintext fork for all **seven physically quoted** LP2 spans and the seven archived Onion6/2014 post-square pages. It does **not** undermine the 2014 stage-specific `FIRFUMFERENFE` decryptions or exclude the historical Onion6 prose as a possible **running key**, paragraph-level paraphrase, hidden-state donor, or a source with altered punctuation; those mechanisms still need an author-visible independent selector and exact original-cipher inverse. Do not run new arbitrary source-quote rotations or approximate substring alignments on this same corpus. The existing 53,000-book Gutenberg source-negative has a distinct scope and was not rerun.
