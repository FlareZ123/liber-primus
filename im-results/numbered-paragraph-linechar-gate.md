# LP2 numbered-paragraph line:character gate

**Decision: bounded negative.** The only explicitly numbered hanging-paragraph block on unsolved LP2 pages 36–38 does not select an executable line:character grammar, key, or instruction. The original images confirm ordinary numbered-paragraph indentation; the one frozen coordinate rule produces no meaningful continuation.

## Source cue and human solve-path hypothesis

Original scans 53–55 (physical LP2 pp36–38) show five red Arabic paragraph labels, 1–5. They are printed at the left text margin and mark the start of five paragraphs. A solver familiar with the historical one-based line:character book-code precedents could reasonably try the simplest diagonal interpretation: paragraph n, line n, rune column n, all one-based.

This is the only rule tested. No first/last-letter scan, endpoint search, rotation, alternative diagonal, free reset, or post-hoc key selection was performed.

## Original-image layout audit

The physical-line transcription in resources/lp2-transcription.txt gives paragraph lengths **6, 4, 5, 5, 6** and page-relative start lines **6, 1, 5, 10, 4**. The line bands and red label pixels were measured directly in the original JPEGs:

| Physical page | Scan | Red paragraph | Printed line | Red-label bbox (x,y,w,h) | Body-rune start x | Next line start x |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 36 | 53 | 1 | 6 | 620,1693,25,92 | 676 | 602 |
| 37 | 54 | 2 | 1 | 605,694,60,94 | 677 | 602 |
| 37 | 54 | 3 | 5 | 607,1538,56,96 | 633 | 601 |
| 37 | 54 | 4 | 10 | 601,2570,69,95 | 657 | 601 |
| 38 | 55 | 5 | 4 | 603,1316,62,94 | 676 | 601 |

All three scans contain 11 printed text lines. The red labels sit at x=601–620; the first black body rune begins at x=633–677, while the following continuation line begins at x=601–602. The 31–76 pixel offset is the ordinary hanging indent created by a paragraph number. It marks the paragraph start; it does not identify a line endpoint or a character offset. The five paragraph lengths are symmetric (6,4,5,5,6), not a distinctive coordinate sequence.

## Frozen readout and controls

For each red paragraph n, take its n-th printed line and n-th GP rune, excluding the red margin label. The exact readout is:

| Paragraph | Selection | Rune | GP transliteration |
| ---: | --- | --- | --- |
| 1 | line 1, rune 1 | ᛚ | L |
| 2 | line 2, rune 2 | ᛋ | S |
| 3 | line 3, rune 3 | ᚫ | AE |
| 4 | line 4, rune 4 | ᚢ | U |
| 5 | line 5, rune 5 | ᛇ | EI |

The output is **L S AE U EI**. Paragraph 5 on physical p38 was held out from rule construction; the frozen rule predicts **ᛇ (EI)** at its fifth line/fifth rune. This is a within-study holdout, not a research-wide blind test, and it supplies no verifiable continuation.

**Wrong-margin control:** count the red Arabic numeral as character 1 on the numbered first line. The first selected item becomes the literal digit 1, giving **1 S AE U EI** rather than a GP29 sequence. The source image shows why: the numeral is a separate margin label, not a GP rune in the body.

The historical 2012–2014 precedents make one-based book-code coordinates plausible in general, but they do not instruct a solver to use paragraph ordinal n as both the line and rune-column index in LP2. Nor do the LP2 labels specify how punctuation should be counted. The diagonal rule is therefore an analyst-imposed test, not an author-selected operation.

## Conclusion and scope

The numbered-paragraph cue is retired. The original layout establishes five ordinary paragraph labels and their hanging indents, but no source-visible instruction selects line:character semantics, endpoint rules, or a key. No unknown plaintext or cipher state was recovered.

This is a scope-bounded negative for the pp36–38 numbered-paragraph cue, not a claim that every possible visual feature in Liber Primus is irrelevant. Do not reopen it without a new independent source instruction that specifies the coordinate grammar.

## Reproduction

Run from the repository root:

    python sims/numbered_paragraph_linechar_gate.py

The script reads resources/lp2-transcription.txt, measures red labels and printed line bands in original scans resources/liber-primus/53.jpg–55.jpg, and emits the exact readout and wrong-margin control. Dependencies: Pillow and NumPy. Supporting line-wrap research is summarized in [the printed-line width inverse](printed-line-greedy-width-inverse.md).
