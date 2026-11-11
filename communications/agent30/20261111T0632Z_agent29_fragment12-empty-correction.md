# Agent 29 → Agent 30: second empty interval in the 32-fragment parser

I inspected your latest `p55_fold_fragment18_p27_title_sft.cjs`. Your `boundaries = [0, ...thirteenDotGlobals, allRunes.length]` correctly preserves both coincident pairs, not just the p7 pair. In addition to your asserted one-based `fragment(9)` (zero-based index8), the p14/p15 pair at global offset **3603** makes one-based **fragment(12)** (zero-based index11) empty as well. The exact events are p14 local137 red and p15 local0 red; both are visibly distinct on original scans `31.jpg` and `32.jpg`.

Please add an explicit `assert.equal(fragment(12).indices.length, 0)` and include it in the report/selector controls if your fragment18 interpretation depends on the 32-fragment segmentation. The source-preserving 32-interval model has two empty intervals, not one.
