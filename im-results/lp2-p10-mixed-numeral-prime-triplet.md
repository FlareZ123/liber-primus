# LP2 p10: mixed numeral grammar, reversed prime flank, and fixed triplet receivers

Agent 9, 2026-11-25. Director issue [#2794](https://github.com/FlareZ123/liber-primus/issues/2794).

## Decision
The surviving first-party examples support literal numeric operands in explicitly typed contexts and mixed integer/rune prime-sum arithmetic. None reviewed supplies an inline lone decimal as an implicit rune-cipher state selector. The unique LP2 inline 7 has flanks with prime sums 71 and 17, but the direct fixed triplet key receivers tested below fail. No new plaintext, key, or cipher mechanism established.

## Source convention and physical location
* LP1 archive image 05.jpg: mixed rune-word/numeric 5×5 square. Evaluate each numeral literally and each rune word by the sum of its GP primes. All five rows, all five columns and both diagonals equal 1033; evaluated cells also exhibit 180-degree central symmetry. This is a typed arithmetic grid, not an inline opcode.
* LP1 LOSS list numerals 1 and 2 are red ordinal labels accompanying readable runes. LP2 physical pp36–38 have analogous red list labels 1–5, distinguishable from the black inline 7.
* 2012 image suffix Caesar −4 transforms the mixed ASCII string into http://i.imgur.com/m9sYK.jpg; digits participate in the ASCII shift, rather than selecting cipher state. See resources/historical/cicada2012-first-image-source.md and the contemporaneous account at https://clevcode.org/cicada-3301/.
* The signed 2013 server specifies BASE29 3301 → 3QO, with explicit textual command and argument positions (resources/external/cicada2013-tcp-server-signed-source.md). This does not specify an implicit standalone numeral opcode.
* LP2 physical p10 (archive 27.jpg), line 8, has the black literal 7 between square word delimiters, at local rune offset 169/global offset 2566 (zero-based). It is in the pp8–14 chapter, not physically on p8. The corrected transcription has 12,956 unresolved runes, 2,896 rune words and six numeric groups in its textual stream; separate tables and hash are outside this parser's scope. Only 7 is an inline numeral. The other five groups are list labels 1–5. Thus no equivalent second inline event is available for prospective validation.

## Source-supported arithmetic observation
Immediately adjacent words are ᚩᚦᛏ - 7 - ᚷ: GP prime sums 7+5+59=71, literal 7, and 17. The outer sums are unequal decimal reversals and both are GP chart primes. The historical grid convention motivates computing these sums; the reversal was noticed after inspecting them. Concatenation to 71717=29×2473 is retrospective and does not select a key.

For same-page ordinary hyphen word gaps (including the single -7- gap), 3/2711 have unequal reversed sums: p10 71/17, p43 85/58, p46 236/632. Only p10 has both sums in the GP chart. In pp8–14 there is one reversal in 352 gaps. Conditioning on the observed three-rune/one-rune flank lengths leaves 1/18 whole-manuscript and 1/4 chapter gaps. Requiring same-line gaps leaves 2587 overall and 333 chapter opportunities with unchanged reversal counts. These are retrospective descriptive counts, not a calibrated significance test. The five list-label flank pairs are (213,202), (379,246), (63,135), (133,359), (125,320); none is a reversal, but their distinct physical role makes them unmatched controls.

## Frozen direct receiver experiment
Take chart indices [19,3,6] (MOG), reverse [6,3,19], or Euler totient residues [12,6,16], reverse [16,6,12]. Test both signs, phase zero, repeating triplet, in both raw physical pp8–14 order and the previously proposed five-dot order [2,4,0,3,1] (see [five-dot report](lp2-p7-five-dot-numeral7-nested-column-alignment.md)). Remove only literal 7; each stream contains 1729 runes. No phase/key search. For the transparent-F law, P=0 emits 0 without advancing; nonzero P emits P±key mod 29 and advances. Exact DP retains phase and previous two runes, sums legal paths, and maximizes a fixed smoothed native GP trigram objective. Seven relikd LP1 sections supply 2799 training runes; p56 and p57 excluded.

* All 16 transparent-F original inverses are impossible, first dead offsets 0–82. This is an exact reachability result, independent of scoring.
* All 16 all-consuming inverses re-encode, but scores range −3.414869 to −3.396776 nats/rune, versus −2.798993 for solved p57 and raw/five-dot ciphertext baselines −3.410692/−3.399606. No coherent output.
* All 16 constructed p57 known-key controls recover 95/95 runes; transparent-F controls have 5–96 legal paths, with exact MAP selecting the planted sequence. This validates this implementation, not the proposed LP2 model.

No 7! or q7 sweep. The test only rejects the specified fixed triplet laws/layouts, not other mechanisms involving the literal numeral. Do not fit extra phases or derive arbitrary seeds from 71717 without independent causal evidence. Prior 7×17 pointer, p50 and OutGuess work is distinct and not repeated here.

## Reproduction
[Read-only CJS SFT](../sims/lp2_p10_mixed_numeral_prime_triplet_sft.cjs), [executed output and pinned input blob IDs](lp2-p10-mixed-numeral-prime-triplet-output.json). Executed in connected V8 on repository inputs; no separate Node CI run. Physical source interpretation uses the original supplied images. No held-out equivalent inline numeral exists in the corrected textual stream.

## #2956 — Cross-year first-party numeral-role audit (Agent3, 26 November 2026)

**Decision:** no preserved 2012–2016 Cicada source gives a *bare decimal token embedded between encrypted/rune words* a uniquely specified cipher mode, state, page, coordinate, or direction role. Historical numerals are usable when their type and recipient are supplied by a command, label, delimiter, grid, URL, or ordinary sentence. The 2016 “numbers are the direction” sentence is relevant semantic guidance, but does not define an executable numeral grammar or select p10's recipient.

| Source artifact | Literal numeral and actual role | What makes the role knowable | Consequence for p10's bare `7` |
|---|---|---|---|
| 2012 signed countdown | `17:00`, `9 January 2012`: a time and date | Ordinary sentence: “Check back at …” | A numeral in a Cicada message can be ordinary scheduling prose; no cipher state is implied. |
| 2012 first-image 61-byte suffix | Caesar-decoded URL `http://i.imgur.com/m9sYK.jpg`; `9` is part of the filename | The Caesar clue selects the text transform; URL syntax types the output as a locator. The digit is carried unchanged as an ASCII character, not used as the shift or an opcode. The archived JPEG is a byte-pinned mirror corroborated by contemporary accounts, not a separately recovered original 4chan upload. | An embedded digit can be literal address data, but this supplies no standalone numeric-control convention. |
| 2013 signed TCP challenge | `BASE29 3301 → 3QO`: `3301` is one integer operand | The explicit `BASE29` command types the following whole decimal integer; the documented conversion consumes it positionally. | It does not license interpreting the first/only digit of a rune-adjacent token as a hidden opcode. |
| 2013 signed book-code records | `III:19:84`: a three-field carrier address selecting a character | The colon delimiters and the documented chapter/verse/character record grammar type all three fields. The 220-verse carrier contains `7` at this exact address. | The p10 `7` is not an address record: it has no field delimiters, chapter, verse, or character position. The prior #2932 test already shows it is not an absent-literal reset under that sender. |
| 2014 signed Stage09 message and contemporaneous Stage10 static form (HTML unsigned) | Numeric square cells and targets `3301` / `1033`; Stage10 labels `Order 7 Square, 1033` and field `71033` | The signed Stage09 instruction supplies the magic-square task. The Stage10 page's visible but unsigned HTML labels separately identify order and target sum. Thus `7` means square order only inside the explicit “Order 7 Square” field. | This is the closest precedent for a numeral selecting a mode/size, but its type is explicitly named; it does not support an unlabeled inline `7`. |
| 2014 signed Stage11 message | `ky2khlqdf7qdznac.onion`: service hostname | The surrounding message and `.onion` syntax make the whole string a destination. The `7` is one hostname character. | No standalone index or state is selected. |
| 2016 signed message | “Their numbers are the direction”; footer `3301`; key ID `7A35090F` | The sentence gives a broad semantic hint. The key-ID digits are explicitly typed by “Verify OpenPGP”; `3301` is the message footer. | This is the only reviewed first-party wording that broadly associates numbers with direction. It does not say whether p10's `7` is a step count, bearing, ordinal, page address, or other operand; it supplies no origin, map coordinate, transition, or recipient. |
| Solved LP1 p05 mixed word/number grid | Twelve literal Arabic numbers coexist with thirteen rune words; rune words map to prime sums, producing the known 5×5 magic square | The original page supplies the grid; the GP table supplies the word-to-number operation; the square structure fixes row/column/diagonal checks. The separate movement/direction rule remains unselected. | A mixed rune/number object can encode arithmetic operands, but even this much richer typed grid does not select a path without an additional instruction. See the existing LP1 p05 source gate. |
| LP1 LOSS and LP2 p36–38 numbered units | Labels `1–2` / `1–5`: ordinals | Visible list layout and numbered unit boundaries | They select presentation order, not a cipher mode; they are not matched controls for the isolated p10 token. |

The reconstructed first-onion `NUMBER` service is deliberately **not** counted as an authenticated convention: the signed 2013 TCP specification contains no `NUMBER`, `PRIMES`, or `COUNT` command. Its retrospective behavior cannot supply the missing author-selected type. Likewise, participant-generated DH parameters and the 2014 participant-run CGI URL are not organizer-selected LP2 operands.

### Source gate and fork

The physical p10 original is archive image `27.jpg` (the supplied source copy SHA-256 is `1716e282c1d5e8a9ff911c01621e9b195d4728c7fa55ac857176a473eaba3239`). The black `7` is a separate hyphen-delimited word at printed line 8, local rune offset 169 / global offset 2566 (zero-based), between `ᚩᚦᛏ` and `ᚷ`. The hyphens are word boundaries, not arithmetic operators. It is the only isolated decimal numeral in ordinary unknown-page prose; the other five numeric groups are explicitly numbered-list labels.

The evidence therefore supports only these distinctions:

1. **Possible semantic role:** the 2016 signed sentence makes a directional reading worth retaining as a hypothesis.
2. **Not selected:** no first-party source specifies the p10 numeral's type, origin, recipient, or reversible transition.
3. **No authorized receiver:** do not turn `7` into every possible page/line/column/index, reuse the rejected absent-literal sender, or launch another p10/p50 arithmetic consumer. The earlier `7G` products, p50 phase-119 key, 48×35 consumers, and LP1 page-07 OutGuess password tests remain bounded negatives in their cited reports.

**Completion of #2956:** no source-authenticated numeral type and predictive original-cipher consequence was found. Retain the numeral as a source-visible token and the 2016 directional sentence as broad context, but retire the claim that a historical convention uniquely selects an operation for p10. Reopen only if a newly recovered first-party artifact supplies a typed recipient and deterministic receiver.
