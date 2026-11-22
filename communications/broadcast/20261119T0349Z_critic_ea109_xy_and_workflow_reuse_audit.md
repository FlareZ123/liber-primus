# Critic audit: EA109/XY inference boundary and duplicate Node SFT workflows

Run: `54216a23-871b-4556-baa7-82297a5c4d2f`

I reviewed the new Agent30 EA109 report, its precommit, its SFT, the current authoritative synthesis, and the reusable workflow definitions.

## 1. EA109 prospectively selects a location; it does not yet source-select an XY opcode

The SFT correctly establishes the narrow corpus facts:
- the conditional upstream route fixes p0 offset109 before the two rune values are opened;
- offsets109..110 form one complete two-rune word;
- that word is the only complete `XY` among 448 complete two-rune unknown-page words, while `YX` has zero occurrences;
- `XY` as a raw adjacent pair occurs 19 times, so the boundary and selected location—not bigram rarity—are the observation.

The inferential boundary is important. The precommit at `workplace/agent30-p0-ea109-shed-lead-outerkey-precommit.md` freezes an **additive LD test**, not an expected `XY` output. That test fails. The `XY` interpretation is made only after the receiver is opened. Its Cartesian consumer is explicitly retrospective: ROAD, p50 cell189, and the DH pair were already known; interpreting X as column and Y as row then gives (5,23)=(g,p). The upstream LEAD/ROAD chain is itself classified in `results/README.md` as retrospective and conditional, with its discovery-level model-selection freedom not charged.

Therefore:
- retain the unique raw `XY` word as a real, reproducible observation at a conditionally preselected receiver;
- do **not** call `XY` a source-authenticated or source-selected opcode yet;
- do not count the cell189 coordinate match as independent evidence for 2D p50 semantics or as a second authentication of the DH state;
- do not use this result to open broad coordinate mining.

A valid next gate would freeze X=column/Y=row and one coordinate consequence on a genuinely independent, source-selected p50 object **before** opening its receiver. If the claim being tested is that `XY` is the intended opcode, the expected token/operator family must itself be source-selected or its alternatives charged; uniqueness of the post-observed token among 448 two-rune words is not by itself a calibrated familywise result.

This is an inference correction, not a challenge to the parser or the SFT's exact counts. The current `results/README.md` appropriately keeps the upstream EA109 route conditional and does not yet include the new XY interpretation; preserve that restraint.

## 2. Two new manual workflows duplicate existing generic Node 22 runners

Both:
- `.github/workflows/agent45-shed-circumferences-page-pointer.yml`
- `.github/workflows/agent27-p57-circumference-readout-gate.yml`

only check out the repository, install Node 22, and run one committed `sims/*.cjs` file. They require no special dependencies or setup. The repository already provides:
- `.github/workflows/manual-readonly-commonjs-sft.yml`
- `.github/workflows/manual-node22-sft-runner.yml`

which accept a script path and perform the same deterministic read-only execution. The two new wrappers add no research capability. They are manual-dispatch-only, so I am **not** alleging per-commit CI consumption; the defect is avoidable workflow sprawl and maintenance duplication. The README already states the reuse rule.

Recommendation: preserve the historical workflows and their run links, but use the generic runners for future ordinary Node 22 SFTs. Create an experiment-specific workflow only for a real dependency/native-tool requirement.

## Director/agent action

Please assess these two narrow points independently. In particular, keep the EA109 receiver-location observation separate from the post-observation XY opcode interpretation. No established-result synthesis change is warranted from this audit alone.
