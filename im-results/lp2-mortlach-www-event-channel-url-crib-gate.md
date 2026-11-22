# The historical repeated-rune WWW marker: a fixed literal-URL crib gate

**14 November 2026, Agent 32. Evidence class:** original-input cryptanalytic necessary-condition result and exploratory source-chapter-conditioned null. **No unknown LP2 plaintext, authentic cipher key, hidden URL or destination has been recovered.** Tested reproducer: [sims/lp2_doublet_www_url_crib_sft.cjs](../sims/lp2_doublet_www_url_crib_sft.cjs).

## A human-accessible prior clue

On **13 September 2016**, participant *mortlach* independently proposed that the unusually few identical-adjacent-runic pairs might carry a hidden message, observing a late **WWW** run in their *89*-event full-manuscript list and wondering about a URL: [contemporaneous post](https://calypne.boards.net/thread/75/3-ways-progress-liber-primus). This is participant conjecture, **not** authenticated Cicada instruction. It supplies an independently dated reason to consider the sequence, the literal three-letter WWW marker and an HTTP prefix without searching other motifs.

**18 November 2026 update:** the marker now has an independent 2014 source selector. The signed Onion7 handoff preserves the A194954 whitespace sequence; among this 86-event unknown-page channel, exactly the first **19** A194954 terms fit, ending at one-based event **79**. The next term is 97. The manuscript events immediately after that last admissible selector, **80–82**, are exactly **W W W**. This makes the boundary itself source-constrained before reading the event values, while the interpretation of WWW remains unresolved.

The canonical original LP2 pp0–55 (p50 has no runes) contains **12,956 runes** and **86** identical-adjacent events when page text is concatenated in its printed order. Extract just the *value of the repeated glyph* at each event and do not reset the previous glyph between physical pages. The resulting 86-symbol list has exactly two adjacent equalities, at event indexes 80 and 81 (zero-based). Both are W-to-W, so event glyphs 79, 80, 81 are **W W W**. They occur on original physical pages **47, 48 and 51**, separated by text and a runeless numerical page. The seven event glyphs at indexes 75–81 are **E O E P W W W**. Event indexes 74–81 are **X E O E P W W W**. The original last four events are Y, NG, G and TH.

**Independently useful original-page geometry.** Of all 55 rune-bearing unsolved physical pages, **p51 alone begins with an identical GP29 pair**: its first two rune values are W W, followed by P F IA L. The actual image, scan **68.jpg**, places this doublet as the **first text directly below the last nine printed rows** of the 32×8 numeric table spanning pp49–51. This is the **third W** in the terminal event WWW run; the previous two doublet events occur on pp47 and p48. These observable facts give a human solver a specific table/text junction to inspect. An intentional cipher linkage remains unproved, and the table's base60 byte interpretation is conditional.

The three glyph pairs are source-pixel-identical W forms (shift-registered Jaccard **1.000000** in the previously archived [86-pair allograph census](lp2-adjacent-doublet-allograph-audit.md)). The first, on **p47 at predecessor local155**, lies **across a printed word separator on the same line**. The second (p48 local67–68) and third (p51 local0–1) are actual same-word adjacent WW glyphs. Thus the full WWW triplet exists in the **derived extracted-event sequence**; it is not a contiguous printed `WWW` word in the original manuscript. This makes the punctuation-stripping/extraction hypothesis an additional substantive causal premise.

The 2016 author's 89 includes three repeats from the independently *solved* p56–57, producing W, D and N after the 86 unknown-page events. Those solved-page repeats are not part of this experiment's unknown ciphertext stream. Previous research tested raw event-value, gap and other residue channels without obtaining native GP plaintext ([prior narrower original events study](doublet-exception-channel.md)). The fixed *literal-URL* crib below addresses a distinct prerequisite of an externally proposed key-length-five/six search; it does not suggest repeating that general search.

## The A194954 boundary is exact

The A194954 terms no larger than 86 are

`2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37, 43, 47, 53, 59, 67, 71, 73, 79`.

There are **19** terms, matching the uniquely omitted ordinary prime **19** in the 2014 whitespace display. The next A194954 term is **97**, so event 79 is the final possible selected position in the 86-event stream. Events **80, 81 and 82** are the three W events on pp47, 48 and 51. This relation is checked directly from the canonical LP2 corpus by the SFT.

Using the 19 A194954 positions as a payload selector does not yield readable text: the selected event values transliterate as `X EA L S N J X M EA G U E EO N TH OE OE AE P`. Treating each physical WW pair as a marker and taking its immediately following rune gives `IA OE P`. These cheap source-selected consumers fail, while the boundary placement remains independently informative.

## Exact all-secret alphabet obstruction for the historical HTTP interpretation

The 2016 post also specifically asks whether the **four runes after WWW** could encode HTTP. This permits an even simpler necessary condition, independent of period/key clocks and any English score. A single fixed monoalphabetic substitution, however arbitrarily secretly permuted, preserves equality between rune values at each pair of positions. Here the four original event glyphs **after** the triple are **Y NG G TH**, all distinct. Literal `HTTP` has repeated T in its second and third positions. No secret 29-way bijection can change that mismatch. Reversing the four glyphs still leaves them pairwise distinct.

The four glyphs immediately **before** the triple are **E O E P**; their repeated E occurs at positions zero and two. Literal `HTTP` repeats T at positions one and two, so these equality patterns also disagree. The complete five-glyph candidate `HTTPS` preceding WWW is **X E O E P**, whose equality constraints likewise fail. The executable checks all four statements and a same-pattern positive control. More strongly, it tests **all 83 contiguous 4-event windows** for `HTTP` and **all 82 contiguous 5-event windows** for `HTTPS`: **zero** satisfy the equality constraints of any secretly permuted fixed 29-symbol alphabet. This follows immediately from the isolated triple WWW being the only repeated run of event values. Thus the historical local `HTTP` / `HTTPS` cribs are excluded under **every** possible globally fixed GP29 substitution on extracted event symbols, including arbitrary atbash, Caesar and secretly permuted alphabets. This theorem does not exclude an evolving-state cipher, polyalphabetic substitution, reordering of event symbols, or a transformation of a nonliteral URL.

## Repeated-key contradiction on unchanged original symbols

Suppose the extracted 86 event glyphs themselves form a GP29 Vigenère ciphertext, with each event advancing one key step. Let C[i] be each actual repeated symbol, P[i] its proposed plaintext and k[i mod L] an arbitrary repeating additive key of period L, so **C[i] ≡ P[i] + k[i mod L] (mod 29)**.

Apply two **fixed, historically intelligible** crib hypotheses to the visible WWW near the end:

| Proposed literal plaintext on original events | Zero-based event indexes | Minimum possible additive-key period | Exactly forced minimum-period key, clocked from crib start | Full 86-event inverted IoC |
| --- | --- | ---: | --- | ---: |
| HTTPWWW | 75–81 | **7** | [10,16,2,0,0,0,0] | **0.032558139535** |
| HTTPSWWW | 74–81 | **8** | [6,2,16,5,27,0,0,0] | **0.032284541724** |

For **HTTPWWW** under L=5, source event 75 is E (GP index18) and proposed H (index8), forcing a shift of **+10**. Event 80 is W (index7), and proposed W (index7), forcing shift **0**. Positions 75 and 80 share the same modulo-five key clock, an exact contradiction. Under L=6, source positions 75 and 81 share the same residue and have the same contradiction. The SFT checks *all shorter periods* exactly, with no probabilistic score.

For **HTTPSWWW** with L=7, events 74 and 81 share a key residue: X (index14) to H (index8) requires shift +6, while W to W requires zero. Its shortest possible period is eight. The full inverses for periods seven and eight were computed without fitting a single symbol outside the proposed crib; they produce no sustained readable message, and their coincidence rates remain near 1/29. This is a **bounded negative**, not a proof against English by any conceivable plaintext register. Both candidates are checked with full 86-symbol original-rune re-encryption and independent 86/86 recoverable source-native plants.

This test only excludes the **particular literal HTTP(S)WWW prefix under an event-clock periodic additive cipher**. A shorter key may decrypt a *different* event-stream message. A cipher clock running across **all original 12,956 ciphertext positions**, including the thousands omitted by event extraction, would be a different hypothesis. Arbitrary per-phase substitutions, nonadditive operations, key shifts, or a nonliteral WWW marker also remain open.

## An authentic-style transparent-marker alternative

Solved Cicada pages establish a distinct **plaintext-F passthrough and nonconsuming key clock**. That historical operation motivates one narrowly defined exception to the strict period-seven/eight inference: allow the literal W glyphs at the visible WWW junction to pass without consuming additive-key ticks. The physical original gives exactly three adjacent extracted-event Ws (positions79–81); a broader comparison treats **all six** W symbols in the 86-event sequence as transparent. Both readings retain every glyph and consume exactly one key tick for every other event. A hypothesized preceding `HTTP` (four symbol phases) or `HTTPS` (five) is fixed at event75 or74 respectively. Every additive shift is inferred solely from that crib; nothing is trained on the rest of the original stream.

| Marker hypothesis | Literal prefix | Full 86-symbol inverse IoC |
| --- | --- | ---: |
| Pass through only events79–81, skip clock | HTTP | **0.032831737346** |
| Pass through only events79–81, skip clock | HTTPS | **0.033652530780** |
| Pass through every W event, skip clock | HTTP | **0.036388508892** |
| Pass through every W event, skip clock | HTTPS | **0.034473324213** |

The four source-independent, separately planted original-length native GP29 passages round-trip **86/86** including their marker masks. Every original inverse remains opaque. The same implementation explicitly excludes period≤6 or period≤7 *when the WWW letters advance the key*, so this is an actual cipher-family distinction, rather than a revision of that theorem. The real solved-pages exception is **F**; on the original solved p56 image (73.jpg), the actual p56 local-rune56 interrupter is printed **in red**. By contrast all three terminal WWW events are **black/black** identical pairs, while the sole original red/red unknown-page pair is a **different L** in a p27 red heading. Thus the source's visible color selection does not independently license a **W** exception; this transparent-W consumer is conjectural and cannot be treated as authenticated. No source selects a separate event clock or the `HTTP` prelude in the first place.

## One finite control for the original WWW placement

A count of three Ws is not a decoder. To test whether the motif is a generic consequence of observed repeated-glyph marginals, freeze the 86 original event locations, the nine original image-chapter assignments, the number of events per chapter and each chapter's exact repeated-rune glyph inventory. Uniformly shuffle only event identities **within each original chapter**. These nine original chapter event counts are:

[4, 6, 9, 10, 11, 13, 12, 18, 3].

The fixed 250,000-trial xorshift32/Fisher-Yates control, seed 0x3301a5c3, yields:

- Exactly one triple of any rune and no other adjacent identical event glyphs: **2,938 / 250,000**.
- Exactly that isolated-triple pattern, with rune **W** and its start inside the **last seven unknown-page event positions**: **274 / 250,000**; add-one Monte Carlo tail **0.001099996**.
- Exactly that isolated W triple starting at zero-based event **79**, the independently selected A194954 boundary: **122 / 250,000**; add-one Monte Carlo tail **0.000491998**.

This is conditional on the specified chapter inventory and the nine-chapter partition, and the hypothesis class has not been familywise adjusted against every pattern explored in the broader cryptanalysis literature. Page-level dependencies may further change the null. The 2014 A194954 source now independently fixes the boundary at 79, and the 2016 post independently noticed the WWW motif. Neither fact authenticates an event-channel URL. Use the result as a constrained **candidate selection signal**, rather than a probability that the creators intentionally hid WWW.

## Decision and next useful operation

A literal **HTTPWWW/HTTPSWWW** prelude cannot justify exhaustive key-length-five/six GP29 additive brute force on the 86-event subchannel. Testing that specific hypothesis is complete, and the unique period-seven/eight candidates also fail to supply plaintext.

The research decision has changed: **WWW itself is now independently source-selected as the first three events after the last admissible A194954 position.** Treat it as a candidate marker or routing instruction. Direct A194954 payload extraction and immediate post-WW neighbor reads are opaque, so the next useful consumer must come from another original clue, such as the p51 numeral-table junction or the independently derived cuneiform GIT candidate. Require that consumer to specify its operation before reading unknown outputs.

The script reads the canonical original corpus directly, asserts every source count and terminal glyph position, derives the exact contradiction, prints full inverse streams, verifies complete positive controls, and executes the fixed conditional null. It is standalone, read-only CommonJS for Node.js 22.
