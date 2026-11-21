# Exact unrestricted 2×2 original-cipher obstruction for the LP2 81²→80² bookend

**Agent30 · 21 November 2026 · original source and exhaustive all-secret computation.** **No unknown LP2 plaintext, creator-selected operation, key or destination recovered.** This test eliminates the entire *single stationary 2×2-neighborhood-to-rune* family for the 81×81→80×80 candidate, allowing every nonlinear output rule and every possible location of five consecutive omissions. It directly extends the previously bounded [one-symbol 81→80 border peel](lp2-81square-80square-borderpeel-allsecret-original-gate.md) and [fixed 2×2 mixed-difference stencils](lp2-bookend-p56-fivecrib-81-80-stencil.md). Unlike those earlier finite operators, **the table lookup is completely unrestricted**.

Reproduction: [single-file Node22 CommonJS original-input SFT](../sims/lp2_bookend_81to80_unrestricted_2x2_sft.cjs); [green Windows runner, original+all-gap run 44954552229](https://github.com/FlareZ123/liber-primus/actions/runs/44954552229).

## Original clue, candidate human route and falsifying invariant

The original ciphertext contains **12,956** unsolved second-release GP29 runes. The exact adjacent two-word ciphertext pair **DJU BEI** is repeated at global positions **6,555–6,560** and **12,950–12,955**; its first copy ends precisely after **6,561=81²** runes. Taking that endpoint as a first block leaves **6,395=80²−5** runes. Independently solved p57 says to **“shed our own circumferences.”** A human solver might therefore arrange the first block as an **81×81** source grid and use its adjacent 2×2 cells to generate the **80×80** output grid, with five positions omitted. The bookend and arithmetic are original-source facts. **No first-party text confirms the split, row-major order, 2×2 operator or five-gap semantics; those remain hypotheses.**

At every output grid cell (r,c) in the 80×80 raster, take the four GP29 values from one corresponding 2×2 neighborhood in the unaltered 81×81 input. Permit all **eight** dihedral directions, so no fixed left-to-right/top-to-bottom orientation is assumed. Let an entirely arbitrary unknown deterministic function \`F\` map the ordered four-rune tuple (29⁴ possible inputs) to one of 29 rune outputs. For each orientation independently, demand the same secret \`F\` wherever its **identical four-rune input tuple recurs**. No linearity, algebra, cycle, key alphabet, monotonicity, homomorphism, or English word structure is assumed.

\[
  T_{r,c}=F(S_{r,c}, S_{r,c+1}, S_{r+1,c}, S_{r+1,c+1}).
\]

An exact decoder of this one-layer model must emit *identical* output rune values from identical input 2×2 tuples. That permits a key-independent all-secret test even though no one knows \`F\`.

For each observed ordered tuple \`u\`, count its observed output-rune histogram \`H_{u,v}\`. If all four-rune input tuples that equal \`u\` share one secret deterministic emitted symbol \`F(u)\`, the *maximum* original matching outputs over all such functions is exactly

\[
  M = \sum_u \max_{v \in \mathrm{GP29}} H_{u,v}.
\]

Thus the **minimum required symbol changes** equals \`N−M\`, and the bound is attainable by independently choosing the most common output rune for each \`u\`. This is an **exhaustive all-secret lookup optimization**, avoiding a futile search over \`29^(29^4)\` functions. It applies to nonbijective nonlinear maps too, so every fixed invertible 2×2→1 local function is also excluded if the bound is nonzero.

## Exhaustive missing-five geometry on untouched original ciphertext

The original tail has 6,395 runes. We evaluated all of the following *distinct source-shaped ways* of supplying exactly five missing 80×80 positions without changing, decoding, or retyping any original rune:

1. **Terminal known-five:** append exactly the first five original p56 encrypted glyphs \`[25,11,22,15,4]\` (*AN END* under its independently solved prime-totient cipher). This fully defines all **6,400** candidate outputs.
2. **Terminal entirely free-five:** retain the first **6,395** original tail glyphs at grid slots0–6394 and give the remaining five output slots *arbitrary* symbols; no assumption about sharing the p56 cipher.
3. **Five source-printed paragraph numbers:** reserve the five original pp36–38 ordinal labels as missing slots \`[2244,2384,2476,2575,2672]\` in the 80×80 destination grid. Retain the whole original 6,395-rune tail in its authentic order at the other slots.
4. **All possible five-consecutive-slot omissions:** for each of the eight orientations, scan **all 6,396** possible locations of an unknown five-cell run, retaining all the original 6,395 known ciphertext symbols in order before/after the gap. The location is a completely free secret integer, including the two ends. The SFT slides this gap one position at a time; **exactly one observed rune changes its associated 2×2 input tuple per step**. It updates the two affected histograms and the all-secret optimum exactly, so 51,168 configurations are evaluated efficiently without sampling.

| Original output completion | Candidate placements per orientation | Most favorable of eight directions | Minimum original rune edits required under *any* secret nonlinear \`F\` |
| --- | ---: | --- | ---: |
| Fixed p56 five known ciphertext symbols at the end | 1 | 0 | **35/6,400** |
| Five entirely free symbols at the end | 1 | 0 | **35/6,395** |
| Original five numbered-paragraph holes | 1 | 3 | **35/6,395** |
| Every possible contiguous five-hole position | **6,396** | 5, gap after tail rune **528** | **32/6,395** |

The exact number of forced edits for the **eight directions** in source mode order 0–7 is:

- Terminal known-five: \`[35,39,40,39,38,39,40,40]\`.
- Terminal entirely free-five: \`[35,39,40,38,38,39,40,39]\`.
- Five original paragraph-number holes: \`[39,39,39,35,39,36,38,39]\`.
- Best over all 6,396 consecutive omissions: \`[34,37,38,33,37,32,36,37]\`.

Each orientation uses all four actual original GP29 input symbols from the full 81×81 source array. The original 80×80 grid has **6,360 distinct ordered 2×2 neighborhoods** among its 6,400 positions (40 repeated contexts), enough to produce exact conflicts without assuming any plaintext language. The all-gap minimum **32** is an absolute lower bound on the number of output glyphs that a direct fixed 2×2 map would have to alter to fit *even after optimizing its entire unknown lookup table, the gap position, and the orientation*. Exact transformation demands zero.

## Cipher-positive test and provenance of the decision

A *deliberately nonlinear* planted map

\[
 F(a,b,c,d)=(7a+11b+3c+15d+ab+cd+5)\bmod29
\]

emits a complete 6,400-symbol test output from the actual original 81×81 inputs. The all-secret oracle reports **zero** forced edits on the full plant and with five arbitrarily omitted original ordinal slots. Removing the five output slots beginning at **1,307** and running the complete **all-6,396-gap scan** again recovers a zero-edit configuration, with no special plant-only optimization. The scan also recovers every synthetic output under the fixed physical orientation. This proves the necessary-condition algorithm can recognize genuine original-source nonlinear 2×2 mechanisms, including an unknown insertion/erasure point. The source input is authentic; the planted output is explicitly synthetic and is **not** a recovered LP2 solution.

The code imports the exact original 12,956-rune source corpus, checks the duplicate 6-rune source bookend, checks p56's original five source indices, and enforces strict original input counts and all secret histogram invariants. It writes nothing and uses no network or external npm dependencies.

**Decision:** retire direct row-major 81×81→80×80 **one-layer stationary two-by-two local emitters**, regardless of the 29⁴→29 table, all eight orientations or placement of any five consecutive absent cells; the separately authenticated pp36–38 five printed-number slots also fail. The manuscript may still encode a more complex *two-dimensional stateful cipher*, a larger neighborhood, geometric transposition, separately ciphered layers, a hidden state, or use the bookend coincidence for a different purpose. Pursue a new geometric decoder only if an independent original clue specifies how to advance or invert state and where the output goes. No amount of enlarging the local secret table recovers a plaintext under this exact one-layer model.
