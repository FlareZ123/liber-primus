# A fixed 136-pair binary fold of LP2 p13 does not decode ASCII

## Source and motivated decision

Original physical LP2 **p13** (archive `30.jpg`, canonical `resources/liber-primus/lp2-corpus.json`) contains **272 GP29 runes**, arranged as two visual/line groups of **136 runes each**. Its neighbor p14 carries the unusually explicit four-rune original word `FOLD`. A distinct *historically implemented* Cicada procedure encodes ASCII in pairs of glyph classes (2013's tab/space binary transport, retained by #892), making a small binary readout worth one source-locked experiment. The already completed #2342, #2367 and #2403 tested geometrical folds, Crab Canon two-voice reading, and value-changing GP arithmetic. They did not supply a historically authentic binary readout for these pairs.

The strongest objection is **source selection**: the p14 word does not command numerical greater-than comparison, and the two p13 halves have unequal reverse-paired physical line widths. Consequently this test defines one *frozen, flattened* fold model rather than an authenticated creator instruction. The 2013 binary precedent fixes the packing convention only provisionally; there is no reason to search further phase, sign or comparator choices if this one fails.

## Complete exact original-source test

1. Read all 272 original GP29 indices from physical p13, retaining printed rune order.
2. Split after rune 136; reverse the later half. GP29 ordering is identical to increasing Gematria Primus prime ordering.
3. At each of the 136 aligned pairs emit 1 iff the rune index in the first half is strictly greater than its mirrored partner; equal pairs emit 0. Use original flat sequence with no chosen offset or excluded runes.
4. Pack the **136 bits in order, MSB-first**, into 17 ASCII bytes. Nothing is selected from the decoded bytes.

The original contains **four equal comparisons**, at zero-based pair positions `12, 34, 45, 99`. The complete original output is:

```text
12 d2 13 b1 10 b0 92 d6 60 ad aa da 0f 63 36 e8 86
```

Only **3 of 17** bytes are printable ASCII; the exact ASCII rendering is `........`....c6..`. There is no readable 17-byte instruction or file-type header under this fixed, creator-era ordinary ASCII reading. A 17-byte `HELLO FROM CICADA` planted binary-pair input passes the same decoder exactly, demonstrating that the specified comparison and bit packing can recover a message when present.

## Meaning and next decision

This result rejects **only** the 136-pair `first > reverse(second)`, tied-as-zero, original GP29 ordinal, MSB-first ASCII mechanism. It neither identifies the author's intended fold nor excludes alternate source-selected binary or nonbinary operations. Purely resampling fold directions, inequality signs, and byte phases after seeing the output would be a cipher-family sweep unsupported by an additional original instruction. The physically unequal line alignment is an independent reason to avoid treating the flattened comparison as a literal page-fold realization.

There is **no recovered LP2 unknown plaintext, decoded key, or destination**. The value of this experiment is removing one distinct physically motivated binary interpretation while retaining a readable, exactly reproducible original-cipher screen.

## Reproduction

Run the no-dependency read-only Node 22 CommonJS test at `sims/lp2_p13_fold_binary_comparator_sft.cjs` against the immutable corpus at `resources/liber-primus/lp2-corpus.json`. It asserts the exact output hex, tie locations, printable count, and a synthetic 136-bit positive.
