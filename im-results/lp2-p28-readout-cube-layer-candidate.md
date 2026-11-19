# P28 center boundary candidate plaintext: READ OUT

**Agent 1 with later Agent11 and Agent16 audits, 19 November 2026. Classification: preferred p28 plaintext/instruction candidate with exact reversible reconstruction and a language-free external numeric selector. The authenticated-source low-digit p50 route selects the READ OUT rune output uniquely across the charged DH/shell family and as the sole raw output across all reversible uniform GP29 power-pair configurations on the source-selected object. The remaining gap is the first-party justification for applying separate GP29 power maps to this center-plus-word object.**

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

## Equivalent cube-plus-reciprocal decomposition

The exact winning transform has a simpler algebraic description that does not require interpreting the five-rune word as three repeatedly cubed layers:

```text
center: x -> x^3 mod29
word:   x -> x^27 mod29 = x^-1 mod29 for nonzero x
```

So the p28 object is transformed by **cubing the center rune and taking GP29 multiplicative reciprocals of the complete five-rune word**. The same original input gives the same output:

```text
N + EAAIUL
[9] + [28,24,10,1,20]
 -> [4] + [28,23,3,1,16]
 -> READ OUT
```

This removes the algebraic need for the three-layer iteration story. It does not by itself source-select the reciprocal operation. The center exponent3 has several exact source-number derivations, including the standard-DH inverse `15^-1 mod22=3`; the word exponent27 is the canonical reciprocal exponent in the 29-symbol field.

A post-discovery source-simple control also uses p28's three printed periods as the boundary exponent and reciprocal exponent27 on the five-rune word. Applying that fixed rule to every complete five-rune predecessor object on unknown p0..p55 gives **READ OUT as the sole finite-register phrase among 314 objects**. Restricting to the nine one-based page-numbered five-rune words again leaves p28 as the sole phrase hit. This is useful selectivity, while its discovery after READ OUT means it remains corroborative rather than a prospective validation.

Reproduction: `sims/lp2_p28_periodcount_inverse_readout_sft.cjs`, Windows Node22 run 44435632291.

### Direct page-derived exponent reading

The same exact transform also has a source-only parameterization that avoids the three-shell count. On p28, the physical page contains **three printed periods**, and `page-1=27`. Applying `(period count, page-1)` to the already selected predecessor + page-numbered five-rune word therefore gives the exact `(3,27)` exponents.

Across the nine page-numbered five-rune controls in unknown LP2, p28 is the sole finite-register phrase hit under this dynamic rule. Across all 314 five-rune predecessor objects there is one additional weak parse, p5 `PUT ATT`.

This is a post-discovery intended-route hypothesis, not a blind validation, but it provides a materially simpler clue path: **page punctuation supplies 3; page order supplies 27**. It removes the need to claim that the five-rune word visibly has three cryptographic layers.

SFT: `sims/lp2_p28_pageperiod_exponents_readout_sft.cjs`; Windows PASS 44437498443.

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

A complete six-state cube-orbit calibration also grants every pair of cube iterates `{1,3,9,27,25,19}` independently to the predecessor and five-rune word. Across all36 exponent pairs ×314 boundaries, the source-selected `(3,27)` pair still has exactly one phrase hit, `READ / OUT`. Eleven other exponent pairs have a single dictionary split elsewhere, so the lexicon alone does not select the exponents. Exponent3 has compact arithmetic support from `g-K=a/K=3` and the later `b^-1 mod22=3` observation, while the p27 `[6,3]` relation is post-discovery corroboration. The exact word exponent27 also has the simpler interpretation of GP29 multiplicative inversion; what remains unresolved is why that reciprocal operation, rather than another source-supported power, should apply to the word.

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

Director #1721 routed every phrase-producing transform from the charged p28 family through the then-frozen receiver grammar. READ OUT was the sole phrase parse producing the required joint whole/split same-page p0 receiver structure, which made it the preferred p28 interpretation. Director #1725 later rejected the stronger assumption that full base60 p50 numerals are generally LP rune offsets, so that old receiver branch is no longer used as an acceptance prerequisite.

Director #1728 inspected the original p28 scan for a local human-facing selector of the exact center-to-right-edge cube operation. The source geometry is real: among the four odd-rune pages whose next word starts immediately after the exact rune center, p28 alone has that successor word run to the same physical line edge. Line6 also begins with the unique LP2 physical-line fragment `DH`. The scan provides no local visual mark at the center boundary, no unusual line6 spacing or width, no color or marginal illustration, and no nested/cubic motif selecting exponent3 versus exponent27. This leaves exact transform selection as a genuine caveat.

Agent16 subsequently supplied a different, independently source-supported downstream selector that avoids the rejected full-numeral output type entirely. The authenticated 2016 relation **“their numbers are the direction”** gives:

```text
NUMBERS(83)   -> 13
DIRECTION(112)-> 13
13 -> 4 -> 37 -> OUT(20) -> FIND(42) -> p28
```

using one unchanged operation: zero-based native-base60 low digit of the addressed p50 token. Across the three explicit clue noun relations and 16 charged token conventions, only NUMBERS/DIRECTION under base60/low/zero/zero converges and reaches `FIND -> p28`.

Apply that externally supported operation first to every two-word parse produced by the complete p28 source-object transform family. The local object has two English rivals, **READ OUT** and **LUNG DEAR**. Only READ OUT satisfies `first -> second -> FIND -> p28`.

The stronger charge removes English completely. Enumerate every raw six-rune output of the 44-transform DH/shell family in both orientations and all five internal splits. Across **440** numeric configurations, require only `GP0(left) -> GP0(right) -> 42 -> 28`. Exactly one survives: uniform `(3,27)`, forward, cut3, raw output `[4,28,23] | [3,1,16]`, sums `55 | 20`.

Then widen to all independent reversible uniform GP29 powers. The 12 exponents coprime to28 give **1,440** exponent-pair/orientation/split configurations. Two parameter tuples survive, `(3,27)` and `(17,27)`, and both produce the same raw output because center rune9 has the same image under exponents3 and17. Thus there is one selected raw six-rune output before language scoring. The source-derived DH exponent `e=3` resolves the residual parameter alias.

Only after the numeric selection do the runes spell **READ OUT**. This materially upgrades the candidate and removes language as the selector for the winning output. The chronology caveat now attaches to the operator class itself: the separate center/word reversible GP29 power family was motivated through p28/DH analysis before this external selector was found. The clean next promotion gate is a first-party clue that requires this operator class, or a fresh ciphertext consequence that requires READ OUT specifically and is frozen before inspection.

External source-pointer report: [authenticated 2016 low-digit routes](lp2-2016-road-found-falsepaths-lowdigit-cycle.md). Full-family selector reproduction: `sims/lp2_p28_readout_familywise_audit_sft.cjs`. Successful Windows runs include 44452135320, 44452267077, and combined run 44452495827.

## Reproduction

Run:

`node sims/lp2_p28_readout_cube_layer_candidate_sft.cjs`

The standalone CommonJS SFT reparses the canonical physical transcription, reconstructs the exact p28 center and word28, derives the DH23 cube bridge, recovers **READ OUT**, reverses it exactly to the original six ciphertext runes, constructs the 32,853-entry source-native lexicon, and asserts that p28 word28 is the sole phrase hit among all314 eligible five-rune-word boundaries. The independent original-image selector audit is reproduced by `sims/lp2_p28_visible_selector_gate_sft.py` with Windows run 44433297532.
