# P28 center boundary candidate plaintext: READ OUT

**Agent 1 with later Agent11 source audit, 19 November 2026. Classification: preferred p28 plaintext/instruction candidate with exact reversible reconstruction and an independently discriminating downstream receiver consequence. Established plaintext still awaits authentication of the p50-numeral to LP2-offset output type.**

## Source-selected object before the plaintext appeared

The existing p57 → p50 → p28 route selects physical p28 independently of this result. On p28, the already established page-numbered object has these exact source properties:

- physical p28 contains **269 runes**, so its exact zero-based center is rune offset **134**;
- p28 contains **59 printed words**;
- the **28th printed word** begins at offset **135**, immediately after the center, and spans offsets135..139;
- that word is the five-rune sequence **EA A I U L**, GP indices `[28,24,10,1,20]`;
- it is the last word of physical line6, whose source geometry independently supplies the manuscript-native DH tuple `p=23,g=5,a=6,B=19`, giving `b=15,A=8,K=2`.

The contiguous six-rune source span formed by the center rune and the selected word is therefore:

`N EA A I U L`

with GP indices:

`[9,28,24,10,1,20]`.

This span is also a physical source object independent of the word parser. P28 line6 has exactly **23 runes**. The page-center rune is line6 position18, and word28 occupies positions19..23. The six-rune candidate span is therefore exactly the **rightward suffix from the page center through the physical line edge**.

## The DH23 state selects a reversible GP29 operation

The same source-selected DH state has the cross-field relation documented separately in `lp2-p28-dh23-gp29-cube-bridge.md`:

`e = g-K = 5-2 = 3`

and independently

`e = a/K = 6/2 = 3`.

In GF(29), cubing sends the DH values

`K=2 -> A=8 -> B=19 -> b=15`.

A separate source-local receiver later corroborated the same exponent without relying only on those internal DH identities. With the reversible shell map `H(x,y)=(x-y,x+y) mod29` already oriented by the solved **OUR OWN** phrase, the independently selected p27 red19+13 receiver gives `H(19,13)=[6,3]=[a,e]`. The chronology prevents treating this as a prospective validation: `READ OUT` was committed at 23:52:08 UTC, while the first commit applying H to p27 red19+13 as the e=3 cube check followed at 23:53:38 UTC. The source object and H were pre-existing, so the equality is an exact source-frozen cross-object corroboration of **e=3** after discovery. P28's immediate successor word29 `[24,25]` also maps under H exactly back to word28's outer shell `[28,20]`, uniquely among the 42 within-page five-rune→two-rune adjacencies. Director #1690 later found the historical 2013 `NEXT` command cannot authenticate choosing that successor: its real protocol operation is client upload/storage. The adjacency therefore remains a selective local consistency check rather than an independent NEXT-selected operation.

Cubing is an invertible permutation on all29 GP indices because `gcd(3,28)=1`; exponent19 is its inverse on nonzero residues and zero is fixed.

The selected five-rune word admits **three combinatorial shell depths**: outer pair, inner pair, center. The cube-layer candidate applies the selected cube map once per shell depth. A single center rune then has one shell depth and uses exponent3; the five-rune word uses three cube iterations. Director #1728 later checked the original scan and found no visual marking that draws these shells or instructs repeated cubing, so this layer rule remains a model choice supported by the arithmetic and downstream discrimination rather than by local artwork:

`3^3 = 27 (mod28)`.

Exponent27 is the multiplicative inverse map on GF(29)* and is self-inverse modulo the exponent group because `27^2 = 1 mod28`.

## Exact plaintext candidate

Apply exponent3 to the exact page-center rune and exponent27 to every rune of the immediately following selected word:

| Source | GP index | Exponent | Output index | Output |
| --- | ---: | ---: | ---: | --- |
| N | 9 | 3 | 4 | R |
| EA | 28 | 27 | 28 | EA |
| A | 24 | 27 | 23 | D |
| I | 10 | 27 | 3 | O |
| U | 1 | 27 | 1 | U |
| L | 20 | 27 | 16 | T |

The six output runes are:

`R EA D O U T`

which transliterate under the canonical GP spelling as:

**READ OUT**

No rune, word break, alphabet substitution, Caesar shift, phase, direction, dictionary target or free key is fitted after this transform is specified.

The inverse is exact. Apply exponent19 to the initial `R` and exponent27 to the five-rune `EA D O U T` word; the original source span `N EA A I U L` is recovered rune-for-rune.

## Post-discovery whole-book control

The transform was discovered on the already source-selected p28 center/word object, so a family control is necessary to measure how freely it produces ordinary language elsewhere.

Freeze the exact six-rune rule:

1. take any original **five-rune printed word** with an actual preceding rune;
2. cube that predecessor once, exponent3;
3. apply three cube iterations, exponent27, to all five runes of the word;
4. transliterate the six outputs;
5. allow a one-word reading or a two-word split with both Latin words at least three letters.

Across unknown physical p0..p55 there are **318** five-rune words; **314** have a predecessor rune and are eligible.

Use the same finite native-English register already employed elsewhere in this repository: TextBlob word-frequency vocabulary plus the pinned Gibran, Shakespeare and Emerson controls and solved LP1 reference vocabulary. The union has **32,853** entries, of which **32,550** have at least three letters.

Under the frozen transform, exactly **one** of the 314 eligible source boundaries yields a one- or two-word member of this register:

`p28 word28 -> READ / OUT`.

No other eligible five-rune word produces a comparable dictionary phrase.

This is a broad post-discovery selectivity control rather than a prospective authorship probability. The selected p28 object had already been singled out by the FIND→28 route, exact-center placement, unique DH-start line, and DH23 geometry before the plaintext candidate was observed.

A complete six-state cube-orbit calibration also grants every pair of cube iterates `{1,3,9,27,25,19}` independently to the predecessor and five-rune word. Across all36 exponent pairs ×314 boundaries, the source-selected `(3,27)` pair still has exactly one phrase hit, `READ / OUT`. Eleven other exponent pairs have a single dictionary split elsewhere, so the lexicon alone does not select the exponents. Exponent3 has compact arithmetic support from `g-K=a/K=3` and the later `b^-1 mod22=3` observation, while the p27 `[6,3]` relation is post-discovery corroboration; the three-layer word rule and cross-field application remain essential operation choices.

## Why the candidate is plausible as an intended solve step

The operation has a compact human path:

1. the clear solved material selects p28;
2. page number28 selects word28;
3. word28 begins immediately outside the exact page center;
4. its line visibly says `DH` and supplies the full DH23 state;
5. that state supplies the reversible GP29 cube map;
6. the five-rune object admits three shell depths under the candidate nesting rule; the original scan does not visually mark these shells, so the repetition count remains an inferred operation choice;
7. the adjacent one-layer center rune plus the three-layer selected word reads **READ OUT**.

The output is itself an instruction rather than a prose fragment. It is also geometrically self-descriptive: the decoded runes are the exact center-to-right-edge suffix of line6. A frozen equal-length ray taken from the same center in the opposite direction and decoded with the same exponents gives `RTHYIFP`, so the positive result does not arise from a bidirectional center transform.

## Later acceptance gates

Director #1721 subsequently routed every phrase-producing transform from the charged p28 family through the independently frozen receiver grammar. READ OUT was the sole phrase parse that produced the required joint whole/split same-page receiver structure, which upgrades it to the preferred p28 interpretation.

Director #1728 then inspected the original p28 scan for a local human-facing selector of the exact center-to-right-edge cube operation. The source geometry is real: among the four odd-rune pages whose next word starts immediately after the exact rune center, p28 alone has that successor word run to the same physical line edge. Line6 also begins with the unique LP2 physical-line fragment `DH`. The scan provides no local visual mark at the center boundary, no unusual line6 spacing or width, no color or marginal illustration, and no nested/cubic motif selecting exponent3 versus exponent27. This narrows the remaining weakness to operation selection rather than object selection.

The main outstanding authentication gap is the downstream type conversion: p50 base60 numeral to LP2 rune offset. Until that is independently established, READ OUT remains preferred candidate plaintext rather than established plaintext.

## Reproduction

Run:

`node sims/lp2_p28_readout_cube_layer_candidate_sft.cjs`

The standalone CommonJS SFT reparses the canonical physical transcription, reconstructs the exact p28 center and word28, derives the DH23 cube bridge, recovers **READ OUT**, reverses it exactly to the original six ciphertext runes, constructs the 32,853-entry source-native lexicon, and asserts that p28 word28 is the sole phrase hit among all314 eligible five-rune-word boundaries. The independent original-image selector audit is reproduced by `sims/lp2_p28_visible_selector_gate_sft.py` with Windows run 44433297532.
