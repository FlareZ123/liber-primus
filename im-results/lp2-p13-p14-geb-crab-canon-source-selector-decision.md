# Source-typed 2014 Crab Canon at LP2 p13–14: no value-changing reader

**23 November 2026 · Agent1 · Director [#2403](https://github.com/FlareZ123/liber-primus/issues/2403). Classification:** historical-opcode prerequisite failure on the original source. It does not yield a new LP2 key, plaintext, or full inverse.

## The actual historical operand

The contemporaneous authenticated 2014 Cicada Onion5 GEB book code includes the reference **`CC:8:6:1`**, addressing the **Crab Canon** chapter of Douglas Hofstadter's *Gödel, Escher, Bach* to extract the next onion-address character. It was genuinely available immediately before the LP2 handoff, but in that source its typed role is a **book-code chapter selector**; the original 2014 command is to index a word and letter in an exchange. [Contemporary source chain](2014-onion5-geb-onion6-chain.md).

The independent, pre-2014 meaning of a Crab Canon is **retrograde two-voice imitation**: the same musical material is played forward in one voice and backward simultaneously in the second. Hofstadter implements the analogy in a dialogue that repeats conversational lines in reverse order, exchanging the speakers' roles. See the [MIT GEB reading guide](https://ocw.mit.edu/courses/es-258-goedel-escher-bach-spring-2007/pages/readings/), and the [Chamber Music Society account of Bach's *Musical Offering*](https://chambermusicsociety.org/about-the-music/compositions/bach-musical-offering). This specifies **time reversal or line permutation**. It supplies neither a 29-letter musical-pitch encoding nor any operation that adds, subtracts, XORs or otherwise fuses two simultaneous notes into a new note. The authentic post-square 2014 GP29 Vigenère did specify such numeric shifts, but its source did not link its key clock to the Crab Canon.

## Fixed original LP2 receiver

The original LP2 p13, archive `30.jpg`, has twelve printed lines with GP lengths `24,21,23,23,22,23,22,25,21,22,22,24`. The first and last six lines each contain **136 GP29 runes**; the following p14, archive `31.jpg`, contains **137** runes, with literal visible `FOLD` at p14 positions2–5 and one F at index2. Both pages have recurring left/right rooted-stalk artwork; the same stem template recurs on other pages and therefore does not by itself order voices. [Exact original-image pairing and prior arithmetic gates](lp2-p13-p14-physical-line-fold-keyless-decision.md).

The literal GEB **repeated-line** Crab Canon would pair p13 source lines `1↔12, 2↔11, 3↔10, 4↔9, 5↔8, 6↔7`. Their lengths are respectively `24/24, 21/22, 23/22, 23/21, 22/25, 23/22`: **five of six corresponding line lengths differ**. The unmodified line-repeat reading is therefore absent. Treating each 136-rune half as a continuous monophonic voice and reversing the lower one, **only 4/136 rune positions are identical**. A simple stationary common rune substitution would preserve exact voice identity, so this result also rejects *literal repeated GP29 voice content* under any such shared substitution. Arbitrary different voice keys could of course hide a shared plaintext, but no authentic source names two keys or a receiver.

The source-original physical-paper fold is additionally distinct from literal flat-tape retrogression: it produces **132 paired glyph sites and four unpaired glyphs on each side** because line widths vary. This was fully tested with 10/8 contradictions for arbitrary stationary pair→p14 secret maps in original/reversed order. The eight exposed runes `WAFXFJEI` already failed as a single 2014 Vigenère repeating key on the complete p14, including p15 holdout; and prior #2342 tested 40 natural original-bounded fold additive, XOR, prime and bypass variants. [Existing reproducible controls](../sims/lp2_p13_p14_physical_fold_pair_invariant_sft.cjs) and [Windows PASS 45097459572](https://github.com/FlareZ123/liber-primus/actions/runs/45097459572).

## Missing causal step and decision

A first-party *Crab Canon* tells a player **which way to read an existing voice**, and that instruction alone is a permutation of the source symbols. Since the original p13/p14 GP29 ciphertext has near-uniform symbol frequencies, this permutation cannot expose ordinary native plaintext. To turn the two voices into a new `136`-rune key requires a second **value-changing binary operator**, plus a specific order for four physical overhang pairs, treatment of p14's F and independent original p14→p15 continuation. The period GEB dialogue and source Onion5 book code name **none** of those, and the already-tested obvious numeric operators produced no plaintext.

The necessary new historical instruction or actual pre-2014 musical note-to-GP29 alphabet is absent. The full-dialogue complement extension below also fails. Per the task's upfront no-selector completion criterion, **retire these GEB-specific Crab Canon routes now**. Its authentic contribution is a reversal/reading direction already included by prior fold tests. This conclusion does **not** exclude nonstationary two-voice ciphers generally and does not explain why FOLD appears in p14. No additional arbitrary operations have been fitted or claimed as a decipherment.

## Full-dialogue complement graph

**24 November 2026 · Agent32 · [#2581](https://github.com/FlareZ123/liber-primus/issues/2581).** The full Crab Canon dialogue, pp.199–203 (pinned historical OCR lines11016–11257), includes Fig.43's DNA strands and exchanged conversational roles. This is more specific than flat repetition. Its natural stationary complement hypothesis is a fixed involution (J) on labels, potentially after an arbitrary secret rune-to-label map (f). Such a map is more generous than a secret permutation: it permits all possible GP29 coarsenings, including a four-base interpretation. It requires (f(y)=J(f(x))) for each source-fixed paired position ((x,y)).

Build the undirected graph on the 29 original rune values, adding an edge for each pair. Along a path of length (k), the final label must be (J^k) of the initial label. An odd cycle (including a self-loop) forces its label to be fixed by (J); every connected neighbor then has the same label. Consequently a connected non-bipartite graph spanning all 29 runes permits **only a constant (f)**, which carries no alphabet distinction. This proof makes no assumption about language, the number of output labels, or the value of a secret key. In particular a complement with no fixed points is infeasible even for a constant (f).

Separately let (N_{xy}) count directed pairs. Every stationary function (y=h(x)) satisfies at most (sum_x max_y N_{xy}) original pairs; this is the exact optimum over arbitrary functions and an upper bound on any involutive/bijective complement.

| Original pairing | Pairs | Self-pairs | Max arbitrary-function matches | Graph components |
|---|---:|---:|---:|---|
| p13 flat reverse halves | 136 | 4 | 36 | One non-bipartite component, all 29 |
| p13 first 68 flat pairs | 68 | 3 | 30 | One non-bipartite component, all 29 |
| p13 disjoint final 68 flat pairs | 68 | 1 | 29 | One non-bipartite component, all 29 |
| p13 actual physical fold (overhangs excluded) | 132 | 2 | 37 | One non-bipartite component, all 29 |
| p24 flat reverse halves | 135 | 6 | 37 | One non-bipartite component, all 29 |
| p24 physical fold | 132 | 4 | 35 | One non-bipartite component, all 29 |
| p42 flat reverse halves | 136 | 3 | 35 | One non-bipartite component, all 29 |
| p42 physical fold | 130 | 6 | 37 | One non-bipartite component, all 29 |

The original source line parser is the previously used canonical slash-delimited transcription, cross-checked against all corresponding GP29 corpus arrays. p13 is the prespecified receiver; p24 and p42 are geometry-matched comparators (not independent author-selected keys or plaintext predictions). No placement, offset, or complement alphabet was fitted. Even the first and second p13 pair sets individually force collapse, so withholding half cannot rescue the hypothesis.

Positive controls use all 95 native p57 GP runes: a planted reverse-complement (J(x)=28-x) reconstructs 95/95 symbols exactly, with only bipartite pair components and row bound 95. A distinct four-label plant uses (f(x)=xmod4) and (J(v)=v\mathbin{\mathrm{xor}}1), choosing varying representatives of the complementary class. All 95 class relations hold, the graph remains bipartite, and the direct-function bound is only 83/95, confirming that the graph gate genuinely permits many-to-one mappings rather than requiring a rune-to-rune function.

Reproducer: [`sims/lp2_geb_crab_complement_graph_sft.cjs`](../sims/lp2_geb_crab_complement_graph_sft.cjs). Input corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`. Core experiment executed against the live canonical corpus and transcription; no new CI required. The complete six-dialogue source audit is consolidated in [the 2014 source chain](2014-onion5-geb-onion6-chain.md#complete-selected-dialogue-review-director-2581-24-november-2026).

**Scope:** this rules out literal stationary reverse-complement *label* consistency, even after arbitrary coarsening. It does not establish that LP2 should be a DNA code; applying the GEB role/base analogy to GP29 is the hypothesis tested. A source-defined position-dependent complement, changing voices, hidden state, different registration, or an independent value-changing binary operation is not excluded. No unknown plaintext was produced. No further complement fit or arbitrary alphabet sweep is warranted on this receiver.
