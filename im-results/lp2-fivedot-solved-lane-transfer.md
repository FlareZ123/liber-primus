# Five-dot pages: full-chapter five-lane transfer of the solved p56 key

**Agent 35, 12 November 2026. Original-input supporting experiment; no recovered unknown plaintext, key, or destination.** The three visually identical five-dot stencils on physical pp7, 23 and solved p56 were already shown to form exact axial reflections in [the source geometry study](lp2-p7-p23-p56-five-dot-dihedral-triad.md). The present, distinct question is whether the *five dots* specify five parallel reading lanes, with p56's **actual solved plaintext or actual cipher shifts** providing an independently recovered key for the two stencil-bearing chapters. All source material and candidate options are fixed before scoring original ciphertext. The stencil itself specifies no five-lane cipher.

## Observable clue and constrained original input

The p7 stencil sits at the end of the original visually bounded **pp3–7** chapter. The p23 stencil appears immediately before its original **16-rune red heading**, followed by pp23–26 body material. The p56 stencil is attached to the separately solved **85-rune AN END** page. These placements give three complete, divisible-by-five source spans:

| Source and graphic relation to solved p56 | Exact GP29 runes | Five-lane width |
| --- | ---: | ---: |
| pp3–7, including headings; reflect each original printed line horizontally, as p7→p56 artwork | **1,145** | **229** |
| pp23–26, excluding p23's red 16-rune heading; reverse the complete body, as p23→p56 artwork rotates 180° | **1,005** | **201** |
| solved p56, with its red 5-rune heading | **85** | **17** |
| solved p56, after its red 5-rune heading | **80** | **16** |

The original p3–7 and p23–26 chapter boundaries, p23 red heading, and p56 solved text are already available in the canonical source atlas and [pp23–26 art study](lp2-p23-26-original-art-source-gate.md). **Divisibility alone is weak:** many long passages happen to be multiples of five; treating a visual chapter as one encrypted block, removing only the p23 red heading, and extending a single-page stencil to a full chapter are separate hypotheses. The figure's true geometric reflections are source-level observations, not authenticated text-operation instructions.

The authentic p56 cipher is independently solved by its prime-totient subtraction with one literal-F skip at local offset 56; the [original-control reproducer](../sims/lp2_dot_triad_solved_p56_plaintext_key_sft.cjs) verifies all 85 plaintext symbols. This supplies two *actual* 85-rune keys, without guessing key bytes: the recovered GP29 plaintext and the observed cipher-minus-plaintext GP29 shift sequence, including the zero shift at the skip position. A third literal variant removes the five red heading runes, leaving an 80-rune plaintext key.

## Frozen complete operation

For a target of 5N GP29 runes and a key of 5M GP29 runes, form five lanes either as five consecutive blocks or as residue classes in consecutive quintets; do the same independently for the key. Reflect the five key lane indices, as the source artwork permits: target lane j uses key lane 4−j. At each lane position i, compute

`P_(j,i) = (C_(j,i) ± K_(4-j,i mod M)) mod 29`.

The source key repeats every **17** or **16** lane positions; no phase offset, free ciphertext-derived key, additive constant, page reset, arbitrary cipher substitution or language-tuned stopping is permitted. Both conventional additive signs are tried. Each of the two original spans has **3 keys × 2 target layouts × 2 key layouts × 2 signs = 24** complete candidates, **48** in total. Reassembly preserves all input runes, and the opposite sign exactly reproduces the original ciphertext. Every one of 48 configurations also perfectly decodes a separate, positive artificial encryption of repeated **solved p57 native GP text**. This control proves the transform functions and key alignment work, not that any historical source chose the transform.

[Complete original-cipher CJS single-file reproducer](../sims/lp2_fivedot_solved_lane_transfer_sft.cjs).

## Original-image dot-order operation versus known p56 plaintext

A stricter control asks whether the five-dot **shape itself**, before any interpretation of unsolved pages, selects a nontrivial **positional reading order** on the already-solved p56 ciphertext. Original p56 has exactly **five printed rune lines** of lengths **[20, 19, 6, 22, 18]**; it also has 85 runes that form either 17 chronological quintets or five 17-rune stripes. The exact original-image connected-component method and native JPEG hashes are in [the image source SFT](../sims/lp2_p7_p23_p56_dot_triad_sft.py), rather than derived from a new fit to text. From left to right, the five original p56 dots have **top-to-bottom x-rank order [2, 0, 4, 1, 3]**, versus the reflected p7 **[2, 4, 0, 3, 1]** and rotated p23 **[1, 3, 0, 4, 2]**. The candidate natural orientations are these three orders, p56's reverse vertical order, left-to-right identity, and right-to-left reversal.

Apply each **fixed order** to (a) the five actual printed rune lines, (b) the 17 quintets, and (c) five 17-rune stripes. For each of the **18** unkeyed possible readings, apply the *unchanged* authentic p56 **85-rune cipher-minus-plaintext shift vector**, respecting the known single literal-F exception at local offset56, and compare with the independently solved full plaintext. This is a direct **known-control requirement** for the narrow claim that the dots prescribe an additional transposition *before the existing p56 totient decoder*. It is not a test of all possible unrelated ciphers.

| Dot order | Errors / 85, printed lines | Errors / 85, quintets | Errors / 85, 17-rune stripes |
| --- | ---: | ---: | ---: |
| Left to right, identity | **0** | **0** | **0** |
| Original p56 top to bottom | 83 | 84 | 83 |
| Original p56 bottom to top | 84 | 68 | 64 |
| Right to left | 85 | 64 | 68 |
| Reflected p7 top to bottom | 85 | 68 | 66 |
| Rotated p23 top to bottom | 84 | 84 | 83 |

**Result:** only the unchanged source order produces the complete p56 plaintext. Every nonidentity physical dot-order transformation forces at least **64 wrong GP runes** on the authentic p56 control; the natural figure-selected top-to-bottom orientation forces **83–84** errors. This is a rigorous finite negative for an *additional unkeyed five-way transposition operating on the p56 ciphertext before its solved prime cipher*. A distinct source-selected operator, such as a hash-line transformation or standalone later-stage instruction, remains possible.

The original visual placement also supports a simpler **section-boundary decoration** interpretation: p7's figure follows a red closing sentence and red thirteen-dot terminal mark; p23's figure precedes a red opening heading after p22's terminal mark; solved p56's figure follows its closing passage and red terminal mark. The repeated image can bookend separate passages without participating in their encryption. This is a plausible design reading, not authenticated author intent. The current source supplies no nontrivial operator that survives the solved p56 gate.

## Outcome and decision

The original source streams and *best* possible symbol coincidence indices among the eight configurations for each fixed span/key choice are:

| Original target | Raw GP29 IoC | Solved p56 plaintext, 85 key runes | Actual p56 cipher shifts, 85 | P56 post-heading plaintext, 80 |
| --- | ---: | ---: | ---: | ---: |
| pp3–7, 1,145 runes | **0.03463371** | **0.03480930** | **0.03461386** | **0.03494061** |
| pp23–26 after heading, 1,005 runes | **0.03430457** | **0.03520842** | **0.03562268** | **0.03488732** |

The candidate outputs stay close to the uniform 29-symbol coincidence rate **1/29 ≈ 0.03448**, with no sustained recognizable plaintext in their beginnings. By contrast the complete solved p56 plaintext has IoC **0.07002801**. Even the maximum among the 48 source-key variants (**0.03562268**) supplies no recovery signal. The one-file reproducer reports every setting, exact original inputs and first 60 transliterated characters for independent inspection.

**Research decision:** These three source-solved p56 key transfers across the stencil-linked full chapters provide **no evidence of a five-lane plaintext decode**. They test a genuinely different, complete target framing from the earlier single-page p7/p23 p56-key experiments, but the historical source never specified a lane order, cycle, operation or key-transfer instruction. Do not expand the five-lane search with arbitrary phases or page keys based on these failed candidates. A worthwhile reopening requires a new independently original-visible rule that picks an exact five-lane operation or produces authentic decoding state. Any future positive must cover the full target, demonstrate coherent text, and forward reencrypt without fitted exceptions.
