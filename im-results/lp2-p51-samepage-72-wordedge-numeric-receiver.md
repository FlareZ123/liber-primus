# LP2 physical p51: the 72-token panel and a bounded same-page receiver

## Original source and proposed operation

Physical p51 is the final original scan carrying the 32×8 numeric table. Its own upper panel has **nine printed rows of eight base60 tokens (72 total)**. Beneath it are **92 runes in exactly 20 printed words**, beginning with WWP. Removing the first rune *or* the last rune from each of these 20 words leaves **72 original runes**. Thus a local 1:1 alignment is possible without inventing a pad length. The source of the 72/72 alignment is the actual layout in `68.jpg`, the derived text `resources/liber-primus/lp2-transcription.txt`, and `resources/liber-primus/lp2-grid-256.json`. One-edge removal is a **hypothesis**: the clear p57 injunction to "shed our own circumferences" does not explicitly prescribe removing *only one* edge, and no first-party direction maps a table cell to a rune.

The bounded test checks two fixed source orders (printed and reverse), two edge choices (drop first or drop last), a completely unknown stationary byte→rune lookup, and the minimally motivated direct GP29 additive mask `P=(C±(tableByte mod29)) mod29`. No key fitting or arbitrary offsets were allowed. The eight direct additive candidates have exact inverses and a solved-p57-based planted round-trip control.

## Original-cipher result

- Each 72-cell panel contains **66 distinct bytes**. The **six duplicated byte values** align with **different retained cipher runes** in all four source configurations. Consequently a stationary lookup from table byte to the printed retained rune cannot reproduce the page exactly; its maximum is **66/72** with at least six forced discrepancies. This is an exact deterministic-symbol-map obstruction, not evidence about keyed or position-dependent encoders. The source lacks an instruction choosing either operation.
- Original direct additive outputs have GP29 IoC **0.0309077–0.0387324**, compared with **0.0627100** for solved clear p57. None of the eight outputs is readable English in its original word order. Their hypothetical plaintext-F counts include **2–6 violations** of the source-era F-transparent rule, though the unknown original-page cipher need not use that rule.
- The geometric 72/72 size coincidence **does not recover plaintext** or establish a cipher mechanism. It is a better bounded direct receiver than matching the 76 table perimeter to any arbitrary 76-rune window, but it supplies neither an independently selected opcode nor source-supported post-processing. **Retire the direct stationary-map and unshifted ±GP29 byte-mask branches**; reopen only if an original clue supplies a distinct operator, traversal, or prior transform.

## Reproduction

`sims/lp2_p51_samepage72_wordedge_numeric_receiver_sft.cjs` is a standalone deterministic Windows Node22 test reading the original indexed table, corpus and canonical transcription. All original counts, duplicated-byte constraints, exact additive inverses and solved-source planted controls are asserted. The complete outputs are in [successful Windows workflow 44976418260](https://github.com/FlareZ123/liber-primus/actions/runs/44976418260) (source commit `45e80c05531681c5317f950988fcb4b8834178f4`). This is an intermediate negative with a genuinely distinct same-page source selector; the overall LP2 solve status in `results/README.md` remains unchanged.
