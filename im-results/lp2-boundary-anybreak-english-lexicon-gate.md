# Original LP2 punctuation-fixed, arbitrary word-break native-English obstruction

**Agent41, 14 November 2026.** A source-exact finite-English-register exclusion covering two fixed rune inverses and **every independently secret invertible affine GP29 inverse per punctuation segment**. **No new LP2 plaintext, creator key, cipher mechanism or destination was recovered.** Runnable [Node.js 22 CommonJS SFT](../sims/lp2_boundary_anybreak_lexicon_sft.cjs); successful [original-source manual GitHub Actions run 43598045428](https://github.com/FlareZ123/liber-primus/actions/runs/43598045428), including the expanded all-secret affine gate.

## Why this test matters

LP2's source-exact 2,896 printed word lengths have weak native word-order grammar, although their boundaries unusually enclose lag-five ciphertext echoes. A decoder might therefore need to recover a different latent English word segmentation. The decisive baseline question is whether moving spaces could possibly suffice, **without changing any rune value or its position**, even if a solver were permitted to choose every new space retrospectively.

This test gives the boundary channel more freedom than any small keyless shuffle: it permits **every partition into nonempty dictionary words**, including partitions with different counts of words, separately within each printed full-stop span. The period positions, rune order and the original GP29 spelling conventions are fixed. First test GP29 identity and historical Atbash, index \`x ↦ 28 − x\`; next enumerate **all 28 × 29 = 812 invertible affine maps** \`P=(aC+b) mod29\`, separately and without key reuse for each of the 175 segments.

## Original ciphertext and finite language register

- Inputs: \`resources/lp2-transcription.txt\` and \`resources/liber-primus/lp2-corpus.json\`, verified identical after stripping only source line/page-break symbols. The original 55 rune-bearing physical pages p0–p55 (p50 is rune-free) contribute exactly **12,956** cipher runes, **2,896** complete words, **175** periods and **32** words continued across page turns.
- Hard-stop spans: all 175 original periods divide the rune stream into **175 nonempty, disjoint segments**. Original word count within each segment is known from the source. Every possible insertion/removal of interior spaces is allowed in the *unrestricted* test.
- English register: the repository's **29,157** TextBlob word-frequency entries, plus every lowercase alphabetic type from pinned Gibran, Shakespeare and Emerson references, plus the independently solved LP2 p57 words. The union is **32,191 lexical types**, transformed with the source-calibrated GP29 maximal-token mapper, including attested **ING** and **IO** single-rune spellings. These are finite language assumptions; proper names and unrepresented words remain possible.
- Exact method: build a **78,629-node** GP29 trie. For identity and Atbash, a BigInt dynamic program carries **all reachable word counts at each rune offset**. Its final-state bitset gives unrestricted segmentability and whether the source's original word count is feasible. For each of 812 possible segment-specific affine keys, an exact reachability DP asks whether **any word count** is segmentable. All **142,100** key-by-segment cases are enumerated, without pruning a fitted key based on English quality. There is no cap at the printed count in either unrestricted test and no language-scored selection of break locations.

| Fixed original symbol inverse | Complete dictionary parses with **any** number of words | Complete parses with the **original per-segment word count** | Nonsegmentable spans with any word count |
| --- | ---: | ---: | ---: |
| GP29 identity | **11/175** | **0/175** | **164/175** |
| GP29 Atbash \`P=28−C\` | **15/175** | **1/175** | **160/175** |

The source's first 13-rune sentence has two printed words and can be segmented under identity only into **9–13** allowed lexicon words; its original two-word count is impossible. A three-rune single-word segment later admits the one Atbash original-word-count match. These lexicon permits many obscure or phoneme-like words and some one-letter entries, so a *successful* segmentation can still be complete nonsense.

## Exact all-secret sentence-affine extension

Allow the complete **812-entry invertible GP29 affine key family**, including any otherwise unknown shift, multiplier and Atbash-like map, and give **each punctuation-delimited segment its own independent hidden key**. Permit any possible placement and number of dictionary words inside that segment. This is much more permissive than any single secret affine key per page, section, or whole book.

| Exhaustive source-exact question | Result |
| --- | ---: |
| Different possible invertible affine maps per original segment | **812** |
| Segment × affine possibilities exhaustively checked | **142,100** |
| Segments with at least one complete native-GP dictionary parsing under some affine map | **102 / 175** |
| **Segments impossible to parse under every affine map, despite free word breaks** | **73 / 175** |
| Minimum disjoint rune changes if one allows one affine alphabet per original segment and then repairs nonsegmentable spans by edits | **73** |

These are exact *compatibility* counts within a deliberately broad finite dictionary, not probabilities. A candidate parse cannot be promoted to plaintext just because it spells dictionary entries: many candidates split long ciphertext into dozens of one-rune or obscure fragments. For every original segment that fails all 812 keys, an additional rune-changing rule, original punctuation relocation, changed rune order, a different alphabet/register or out-of-vocabulary word would be required. The disjoint 73-edit bound applies to the specified affine-with-repairs superfamily and fixed original punctuation; it is only a necessary bound, not a sufficient number of edits for solution. This stronger original-input obstruction holds **even when a different affine key is granted to each original segment**.

## Cryptanalytic consequence

**The 175 period-delimited spans are disjoint**, so any later *substitution-only* correction that aims to produce dictionary-segmentable English must change at least **164** original rune identities after the identity inverse, or **160** after Atbash, even when given wholly free word counts. With the original number of words in each hard-stop span preserved, the corresponding lower bounds are **175** and **174** changed rune positions. These bounds assume the periods stay fixed and alphabetic word labels belong to this finite reference register. They are necessary minima, not sufficient edit budgets.

In particular, a literal spacing transducer, however complicated, **cannot** alone restore conventional source-native English in almost all original sentence spans under either tested rune inverse. This includes every word-boundary displacement, space-bit transposition, or five-gap word-clock shuffle that preserves rune identities and all 175 hard stops. It does **not** exclude keyed rune-changing systems, ciphertext transposition, moving periods, non-English text, alternate orthography, arbitrary out-of-register word lists, or insertions/deletions.

## Real inverse and positive controls

As a concrete low-description-length delimiter channel, the SFT reflects delimiter *gap bits* inside successive blocks of five legal inter-rune gaps, resetting at a printed period. This channel is an exact involution with no hidden state: applying it twice restores the original positions of every space, while leaving all rune values, period positions and physical-page rune geometry fixed. It was chosen to afford a reproducible reversible representative of a five-position boundary shuffle, **not because any first-party source selects it**.

The SFT proves **350/350** original/native sentence-level five-gap encoder/decoder pairs. A 12,956-rune planted native-English-word control preserves every original word length, all 175 stop spans, all 55 rune-bearing physical page lengths and all 32 carried words; its **175/175** spans retain their original native-dictionary word counts. Reencrypting each native planted span under a **different secret affine pair** and exhaustively decoding every possible affine key restores at least one valid complete dictionary parsing on **175/175** planted segments; independent inverse GP29 arithmetic regenerates each exact plant. Independently known solved p57 reconstructs **95/95** authentic GP runes from **20** native plaintext words, including **INSTAR**, **TUNNELING** and **CIRCUMFERENCES**, and passes the same word-break recognizer. These are exact positive-functionality controls, not evidence that the source used five-gap reflection.

## Decision

Retire **identity, GP29 Atbash or any independently secret invertible sentence-local affine rune map plus arbitrary punctuation-preserving spacing**, for the tested source-native English register. The all-secret affine result is the strongest obstruction, with 73 of 175 exact impossible segments. A next decoding proposal must supply a source-selected, reversible **rune-changing** operation; if it claims word-level plaintext, it should also say how/why the printed stops and word counts change. Director #874 has been completed and closed on its bounded causal question. The broader joint word-boundary/rune-symbol architecture remains open and this exclusion must not be mistaken for plaintext recovery.
