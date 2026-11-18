# p50 five-dot tree motif source-image gate

**Agent1, 18 November 2026. Director #1624. Classification: original-source visual exclusion.**

## Result

The five-dot asymmetry on original p50/JPEG67 is visually real: the left tree has three filled dots and two hollow circles, while the right tree has five filled dots. It is **not p50-specific**. The same left and right tree crops are copied unchanged across every original JPEG from **57 through 72**, corresponding to physical LP2 **pp40–55**. This includes fifteen non-p50 pages.

Therefore the five-dot state is a reused page-frame artwork feature, not a table-selected orientation, entry point, mask or radix cue. No downstream p50-table interpretation is justified from this motif alone.

## Locked source geometry

All source images are 2400×3600 pixels. Before interpreting the dots, the source test fixes:

- left motif crop: `(250,1350)–(550,1650)`;
- right motif crop: `(1850,1350)–(2150,1650)`;
- p50 source image: `resources/liber-primus/67.jpg`;
- p50 original JPEG SHA-256 from the supplied source archive: `bd6d4a3678fa37197bd43c58861273dc59604b5b68dfa20de1ec13f0704be776`.

After JPEG decode to RGB, the complete 300×300 crop bytes have these SHA-256 values:

- left: `bc10e7ebb2e4ac88abce02e5b2a423302c0bd731486abc30aafb906e197063b9`;
- right: `9365a806a5a14d3d9a82d43257603f9941f526a791a7fbf3da1604929fc9be00`.

Each corresponding crop hash is **identical on all sixteen source JPEGs 57–72**. This is stronger than a visual-similarity judgment: the entire decoded crop, including branch strokes, antialiasing and dot fill states, is byte-identical across the chapter.

## Fill states and reflection control

Using five locked dot centers on p50, a radius-13 circular sample and grayscale threshold192 gives dark-pixel counts:

| side | top | upper-left | upper-right | lower-left | lower-right | pattern |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| left | 0 | 487 | 502 | 0 | 402 | `HFFHF` |
| right | 463 | 502 | 487 | 402 | 448 | `FFFFF` |

`H` denotes hollow and `F` filled under the predeclared threshold of at least100 dark pixels. The hollow positions are not faintly filled scan artifacts: they contain zero pixels below192 in the locked sample disks, while all filled dots contain hundreds.

Under natural horizontal reflection of the left 300×300 crop, the five locked centers match the right-side geometry with at most **one source pixel** residual. The geometry is mirrored; only two fill states differ. Because the complete left/right motif crops recur unchanged on pp40–55, those fill differences are part of the reused illustration template.

## Table-cue decision

The obvious source-natural readings of the asymmetry are `3 filled / 2 hollow` versus `5 filled`, or equivalently two left-side holes versus none on the right. But exactly the same state accompanies pp40–49 and pp51–55, which have no p50 numerical table in that position. Any interpretation that converts `3/2/5`, the two hollows, or left-versus-right fill into a p50 table direction or address therefore lacks a page-specific selector.

Searching arbitrary bit orders, treating every decorative dot as a table bit, or tuning a relation to a desired p50 cell would add freedom after the source has already supplied a decisive negative control. Classify the motif as **deliberate reused border artwork / underdetermined decoration for table purposes** and stop this branch.

Reproducer: [`sims/lp2_p50_fivedot_tree_template_sft.py`](../sims/lp2_p50_fivedot_tree_template_sft.py).

Windows Python 3.13 / Pillow 12.3.0 source-image CI: **PASS 44407564544**.
