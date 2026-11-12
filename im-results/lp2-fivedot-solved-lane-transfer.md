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

## Key-free same-pad cancellation across stencil-linked chapters

A separate full-ciphertext necessary-condition attack asks whether the two five-dot-linked sections reuse an unknown **1005-position GP29 additive pad**. This variant needs no guess at the pad or p56's solved key: if both original ciphertext sections are made by `C_i=(P_i+K_i+a) mod29`, where the per-section unknown `a` is an optional constant Caesar offset, the aligned difference `C^A_i−C^B_i` is the difference between the two plaintexts plus a constant. Its rune-histogram index of coincidence remains **exactly invariant under every such unknown pad and section-wide offset**. This is a stricter test of pure shared addition than searching particular seed bytes.

The original p3–7 section has 1145 GP runes, of which the first 1005 are aligned with p23–26's post-red16 1005-rune chapter body. A human could choose the two source-visible forward/reversed chapter orientations, yielding **four fully fixed** differences without phase search or truncation other than the shorter chapter boundary. The observed difference IoCs are:

| Original chapter directions | Difference IoC | Exactly matching rune pairs of 1005 |
| --- | ---: | ---: |
| p3–7 forward, p23–26 forward | 0.03432638 | 36 |
| p3–7 forward, p23–26 reversed | 0.03404095 | 46 |
| p3–7 reversed, p23–26 forward | **0.03456423** | 29 |
| Both reversed | 0.03435611 | 33 |

A deterministic, source-disjoint native-GP language control compares **200** independent length-1005 windows, each taking Shakespeare for one plaintext and Gibran's *The Prophet* for the other, using the repository's GP29 longest-match encoding. For each native pair, an independently generated 1005-symbol secret pad is added to both, and exact key cancellation recovers the genuine plaintext-difference string. The native difference IoC has **minimum 0.03487542** and **mean 0.03622118**, so **0/200** genuine native controls fall at or below even the strongest of the four original differences. Every one of 200 pads roundtrips exactly. This comparison is conditional on the two tested authors, 200 finite windows, the specified source boundaries and pure shared-pad architecture. It is not a discovery-wide false-positive probability.

**Decision:** These complete section-pair results supply no evidence for a reused **pure GP29 additive pad**, including arbitrary distinct **fixed Caesar offsets per section**, under the sampled GP-English source register. A page-local varying offset, independent pad clocks, arbitrary substitutions after encryption, variable-rate encoding, ciphertext-dependent key skips, a different source register or an independently selected overlap could evade the invariant. Neither the dots nor the ciphertext actually establishes shared-pad reuse, so a larger unconstrained alignment hunt would be unjustified. The original-input SFT emits all four original differences, the 200 native controls and exact cancellation plants.

## Outcome and decision

The original source streams and *best* possible symbol coincidence indices among the eight configurations for each fixed span/key choice are:

| Original target | Raw GP29 IoC | Solved p56 plaintext, 85 key runes | Actual p56 cipher shifts, 85 | P56 post-heading plaintext, 80 |
| --- | ---: | ---: | ---: | ---: |
| pp3–7, 1,145 runes | **0.03463371** | **0.03480930** | **0.03461386** | **0.03494061** |
| pp23–26 after heading, 1,005 runes | **0.03430457** | **0.03520842** | **0.03562268** | **0.03488732** |

The candidate outputs stay close to the uniform 29-symbol coincidence rate **1/29 ≈ 0.03448**, with no sustained recognizable plaintext in their beginnings. By contrast the complete solved p56 plaintext has IoC **0.07002801**. Even the maximum among the 48 source-key variants (**0.03562268**) supplies no recovery signal. The one-file reproducer reports every setting, exact original inputs and first 60 transliterated characters for independent inspection.

**Research decision:** These three source-solved p56 key transfers across the stencil-linked full chapters provide **no evidence of a five-lane plaintext decode**. They test a genuinely different, complete target framing from the earlier single-page p7/p23 p56-key experiments, but the historical source never specified a lane order, cycle, operation or key-transfer instruction. Do not expand the five-lane search with arbitrary phases or page keys based on these failed candidates. A worthwhile reopening requires a new independently original-visible rule that picks an exact five-lane operation or produces authentic decoding state. Any future positive must cover the full target, demonstrate coherent text, and forward reencrypt without fitted exceptions.
