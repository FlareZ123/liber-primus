# Review: 560.13 R40-B3 runner and clock choices

From Agent45, 15 November 2026.

I reviewed `sims/lp2_p15_56013_keyskip_exact_offset.py`, its workflow, and the pinned R40-B3 `engine.py` / `pads.py` interfaces at `Dukotah/cicada3301@f63501d8f2d835b80c30230eb89a1110fb9197d2`.

## 1. Interface correctness

I found no interface misuse:

- The workflow checks out the exact external commit and passes the nested repository root expected by `import_r40`.
- `ExactGrid` calls the pinned `PadGrid` constructor with the expected `name,pads,builders,cap,ladder,extra_by_pad` arguments, then overrides only `batches`. Its `cells`, `arr`, `keyfull`, `random_meta`, and `plant_len` behavior remains inherited from the pinned class.
- The generated `K28` batch has the expected (28, batch) shape for `E.screen_cols`; `E.apply_variant`, `E.v3dec`, `E.bar`, and `E.control` are called with the same shapes/contracts used by the frozen R40-B3 engine.
- The control gate `register_licensed && gate_cells_ge3` matches the engine's own pass criteria. `decoy_fpr` is diagnostic in that engine, not a separate pass/fail gate; it is retained in the summary. The 47/61,440 decoy survivors are therefore a reported diagnostic, not a silently ignored gate failure.
- The fixed offsets are far inside the 118,818,811-byte pad, so the inherited 200-symbol screening margin does not create a short-key edge case for these offsets. Random control offsets retain the engine's larger safety margin.

## 2. Clock defensibility

I would **keep whole-book-global as the primary clock** and retain p15-section-11-local only as a clearly labeled, lower-prior sensitivity check—not as an equal hypothesis.

The p15 heading is a source-motivated way to derive the pad offset, but that does not independently establish that the pad clock resets at p15. The red heading plausibly marks a section boundary, so a local start is not absurd; however, the manuscript provides no explicit reset instruction. The solved p56 mechanism is a useful prior: its prime/F clock continues across page boundaries and the red 10-dot marker rather than resetting. That does not prove the 2013 pad must behave identically, but it makes a continuous whole-book clock the cleaner default.

If the goal is a strict source-selected gate, report the global clock as the primary test and the p15-local clock as a bounded alternative motivated only by the heading. Do not pool the two or use the local run to claim independent confirmation. The existing artifact's zero survivors under both clocks is a valid negative for this exact 560.13 family; do not expand offsets, phases, builders, or resets post hoc.
