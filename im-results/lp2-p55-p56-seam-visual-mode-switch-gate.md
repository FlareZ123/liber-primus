# p55→p56 source-visible mode-switch gate for zero-F

**Agent17, 18 November 2026. Decision:** p55→p56 is unmistakably a **visual section boundary**, yet the source-visible boundary grammar is ordinary for Liber Primus rather than selective for this seam. The seam therefore does **not** supply the missing instruction that tells a 2014 solver to stop or change the frozen zero-F surface transform exactly before p56.

The zero-F transform remains a reproducible p0–55 structural anomaly. Its scope is still unsupported by an authored stop condition.

## Exact question

The held-out correction to #1422 establishes the problem: continuing the unchanged zero-F clock into authentic solved p56 changes four source ciphertext runes at local positions 16, 18, 25 and 74. The unique authentic 85/85 solved-p56 prime/totient path disappears, with the historical best rule falling to 81/85. Any intended zero-F interpretation therefore needs a source-readable scope change before those p56 runes.

This audit does not inspect transformed p56 language and does not modify the zero-F algorithm.

## Original-image seam

The exact original files are:

- physical p55 = archive `72.jpg`;
- physical p56 = archive `73.jpg`.

Direct source-image inspection shows a strong page-design change:

- p55 closes the floral/tree/moth terminal chapter and ends its 76th rune at a red 13-dot mark;
- p56 removes the floral border;
- p56 begins with a red five-rune rubric and a giant red initial;
- p56 contains a visibly typeset 128-hex, 512-bit digest and five black dots;
- p56 ends at another red 13-dot mark.

The format change is real. The question is whether it **selects this seam over the manuscript's other section boundaries**.

## Boundary grammar comparison

The repository's established nine unsolved visual chapters are:

```
p0–2
p3–7
p8–14
p15–22
p23–26
p27–32
p33–39
p40–53
p54–55
```

Treating solved p56 and clear p57 as the two following visibly titled source units gives ten consecutive seams:

```
2→3, 7→8, 14→15, 22→23, 26→27,
32→33, 39→40, 53→54, 55→56, 56→57
```

For **all 10/10** seams, the original-image-derived ink annotations show the same high-level grammar:

1. the left unit ends with a **red 13-dot mark at its terminal rune offset**;
2. the next unit begins with a **red rune span at local offset 0**.

So the exact p55→p56 pattern

```
terminal red13 -> next-page red rubric
```

is not a seam-specific opcode. It is the standard visual-unit delimiter.

The giant initial does not rescue uniqueness either. The source-image giant-cap audit identifies giant initials at many earlier visual starts, including p0, p3, p8, p23, p27, p33, p40 and p54, with solved p56 and clear p57 as controls.

## The unique p56 hash

P56 does contain one genuinely exceptional visible object: its 128-hex 512-bit continuation digest

```
36367763ab73783c7af284446c59466b4cd653239a311cb7116
d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e227
4568926a49fb4f45132c2a8b4
```

(line breaks in the source image are typographic).

That makes p56 visibly special as a page. It does **not** specify that an outer rune transform must cease at p55. The digest is printed inside p56 after runic material has already begun, and no adjacent source text labels it as a cipher-regime switch.

There is also a strong source counterexample to “non-runic format change implies stop the outer mechanism”: p49–51 contains the unique 32×8 numerical field, including a rune-free p50, inside the p0–55 target interval. Zero-F's claimed p0–55 scope already crosses that much larger format interruption.

## 2014 delivery context

The contemporaneous Stage11 carrier provides no external separator at this seam. The preserved directory contains one static `index.html` plus the 58 consecutively named files `0.jpg` through `57.jpg`. The original signed handoff names the Tor host but supplies no page grouping, stop page, key file or cipher-change instruction.

Thus p55 and p56 are consecutive members of one delivered page sequence. Their section break is printed in the book itself, with no separate carrier boundary.

## Decision for zero-F

The source supports this limited statement:

> A 2014 reader can recognize that p56 begins a new visual section.

It does not support the stronger statement required by the hypothesis:

> This particular visual section boundary tells the reader to stop or change zero-F, even though the same zero-F rule crossed every preceding visual-chapter boundary.

The p55→p56 seam is therefore **ordinary chapter grammar plus a unique internal hash page**, rather than a source-selected mode-switch opcode.

Consequences:

- retain zero-F only as a section-local **structural** hypothesis;
- do not treat the solved/unsolved boundary itself as evidence for its intended scope;
- do not commission further zero-F value-layer variants unless an independent first-party clue selects an operation and scope;
- the four-rune p56 conflict remains a real objection rather than something visually resolved by the seam.

## Reproduction

`sims/lp2_p55_p56_seam_visual_gate_sft.cjs` uses only the original-image-derived `lp2-ink-annotations.json` and asserts the 10/10 terminal-red13 → red-start-rubric boundary pattern, including the exact p55 and p56 offsets. The visual hash, border and giant-cap observations are preserved from direct original-JPEG inspection and existing source-image audits.
