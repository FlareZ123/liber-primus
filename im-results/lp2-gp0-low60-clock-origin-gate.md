# GP0 zero-based addressing does not fix the p50 low60 absolute clock origin

**Agent33, Director task #1692, 19 November 2026. Classification: architecture/source-selection negative. No unknown plaintext, key, opcode, or cipher inverse is recovered.**

## Decision

The newly promoted navigation primitive

```text
whole-word GP0 sum -> zero-based row-major p50 cell
```

does **not** independently derive the absolute origin of the empirical p50 low60 rune clock.

The reason is structural rather than statistical. The #1685 address-only result supplies table addresses such as `PILGRIM=82`, `EMERGE=83`, and `DIUINITY=105`. It does not assign any of those addresses to a particular global rune coordinate in unknown p0..p55. A continuous 256-state rune clock has

```text
state(g) = (g + phi) mod 256
```

so one source-fixed pair `(global rune coordinate g, table state a)` would determine `phi = a-g mod256`. The promoted GP0 primitive supplies `a` but no `g`. For each promoted address, all 256 origins remain compatible until an additional receiver/state rule is introduced.

That additional rule cannot be imported silently from the current navigation graph. Director #1686 independently found that the existing numeric p50 output grammars do not generalize from solved p57 to held-out p56. The address convention is the promoted primitive; the downstream rune/page/word receiver semantics remain conditional.

**Director fork:** preserve the low60 clock as an empirical association and stop using GP0 zero-origin as independent support for its absolute phase. A future coupling needs a source-authenticated equation that binds a particular GP0-addressed table state to a particular unknown rune position before repeat-event scoring.

## Frozen empirical clock remains sharp

The SFT reuses exactly the #1508/#1528 event definition:

- 12,956 original unknown p0..p55 runes;
- 12,901 within-page adjacent-rune opportunities;
- 86 adjacent-equal events;
- the exact 60 p50 cells whose printed token begins with `0`, identical to the frozen 60-lowest-value class;
- canonical row-major order;
- Beta(1/2,1/2) predictive likelihood.

No mask, event, reset, direction, table traversal, or phase is added.

The earlier phase-zero reset-family result reproduces exactly:

| frozen clock | selected events / opportunities | held-out chapter gain (nats) | positive chapter directions |
| --- | ---: | ---: | ---: |
| continuous global | **33 / 3,025** | **+4.584893** | **9 / 9** |
| physical-page reset | 19 / 2,934 | -1.038412 | 6 / 9 |
| visual-chapter reset | 20 / 3,020 | -0.560471 | 5 / 9 |
| physical-line reset | 16 / 1,918 | -0.478429 | 5 / 9 |

The new all-phase comparison uses the same likelihood and scans only the already-required 256 circular origins:

- **nine-chapter leave-one-out:** phase0 is rank **1/256**, gain **+4.584893**; runner-up phase246 is **+3.217364**;
- **55-physical-page leave-one-out:** phase0 is rank **1/256**, gain **+4.130713**; runner-up phase16 is **+3.054976**.

This strengthens the description of the empirical phase0 association. It does not make the origin source-authenticated.

## Why GP0 cannot supply the missing equation

The #1685 positive was deliberately address-only. Its frozen evidence is:

```text
p56 PILGRIM GP0=82  -> p50[82]
p57 EMERGE  GP0=83  -> p50[83]
p57 DIUINITY GP0=105 -> p50[105]
```

Those words are solved p56/p57 source material and their successful event is geometry inside the 256-cell table. No step states that p50 address82,83, or105 is the state of a particular unknown p0..p55 rune.

Formally, for any address `a` and any proposed phase `phi`, there is a rune residue `g = a-phi mod256` that would make `state(g)=a`. Without a source-fixed `g`, the address contributes zero information about the absolute clock origin.

Zero-based addressing and phase zero therefore share a conventional number without sharing a causal mapping.

## Typed-receiver stress test

For completeness, the SFT also performs a deliberately stronger stress test that is **not admissible as positive evidence**. It takes several already-published typed receiver edges and pretends that a GP0 address should equal the low60 clock state at the pointed rune.

That direct identification produces mutually incompatible origins:

| published receiver relation | address used as state | receiver global/local rune | implied phase |
| --- | ---: | --- | ---: |
| NEXT -> p28 one-based rune118 | 57 | p28 offset117 | **91** |
| p0 typed closure, receiver word | 13 | p0 end236 | **33** |
| p0 typed closure, signed EMPTY | 92 | p0 end236 | **112** |
| p38 typed closure, receiver word | 95 | p38 end53 | **86** |
| p38 typed closure, signed FOUND | 36 | p38 end53 | **27** |

All five implied phases differ, and none is phase0.

This is not a rejection of those navigation edges. Their output semantics are heterogeneous and were never claimed to be low60 clock-state equations. It shows why they cannot be retrofitted into an independent phase0 derivation.

## Consequence

The current state should remain separated into two facts:

1. **Empirical p50 clock:** canonical row-major low60 at continuous global phase0 is the strongest frozen clock, including rank1/256 under both chapter- and page-level predictive likelihood.
2. **GP0 navigation primitive:** canonical whole-word GP0 selects zero-based p50 cells unusually well inside its charged address family.

There is still no source-authenticated bridge between them.

Do not multiply these as independent evidence for one mechanism. The next useful test would require a source-visible or authenticated instruction fixing a specific table address as the state of a specific unknown rune, then checking that predeclared origin against the frozen low60 statistic.

## Reproduction

- SFT: `sims/lp2_gp0_low60_clock_origin_gate_sft.cjs`
- Windows/Node 22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44425731866
- Upstream low60 clock: `im-results/lp2-p50-low60-clock-selection.md`
- Upstream source-origin gate: `im-results/lp2-p50-global-phase0-origin-source-gate.md`
- GP0 address audit: `im-results/lp2-gp0-zero-address-familywise-audit.md`
- Fixed-output-grammar holdout: `im-results/lp2-p50-solved-output-grammar-holdout.md`
- Typed receiver coordinates are asserted by their existing source SFTs:
  `sims/lp2_2013_next_p28_dh_pointer_sft.cjs`,
  `sims/lp2_2016_receiver_familywise_census_sft.cjs`,
  and `sims/lp2_p57_within_p38_found_closure_sft.cjs`.
