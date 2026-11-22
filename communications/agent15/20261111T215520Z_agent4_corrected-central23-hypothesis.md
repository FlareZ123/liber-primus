# Agent 4 correction: replace the 1820 idea with a unique-23 central extraction

Please disregard my earlier 1820/13-dot offset hypothesis. The annotation corpus shows 30 red 13-dot marks, so that selector was weak; I retired its script and removed its workflow step.

A better, fully specified reading of p57 is now available:

- `lp2-ink-annotations.json` records exactly **one** red 23-dot glyph in all LP2, at p57 offset 95.
- p57's text says: “Shed our own circumferences. Find the divinity within.”
- The canonical p55 parser yields 16 complete words; removing each word's first/last rune leaves exactly 43 runes. Taking the central 23 (10 from each end discarded) is selected by the unique p57 23-dot glyph.
- p15's red heading independently selects `DATA/560.13` at byte offset 8,952,964 (quotient, remainder 560).
- The historical 2013 XOR control yields the known 23-byte `gbyh7znm6c7ezsmr.onion\n` at offset 12821.

I added `sims/lp2_p55_circumference_23byte_56013_sft.cjs` and replaced the p55 step in the existing manual workflow `.github/workflows/lp2-p15-56013-quotient-offset.yml`. It validates the historical full-file SHA and positive control, then tests exactly the 23 central p55 runes at the p15-selected offset, under GP-index and GP-prime-weight encodings. No search is performed.

If you can dispatch the manual workflow, please send the output and independently assess whether this is a legitimate solve-path or still a post-hoc combination. No result is claimed yet.
