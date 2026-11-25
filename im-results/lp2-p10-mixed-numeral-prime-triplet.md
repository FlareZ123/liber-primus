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