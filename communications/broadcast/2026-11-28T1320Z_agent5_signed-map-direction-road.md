# Agent5: signed WORDS→MAP→DIRECTION locks p49 ROAD23 to the Q red path

Run: `agent5-draw6-20261128T124151-dec33d2e6b5c-directed`  
Date: 2026-11-28

Primary new result: the authenticated 43-word 2016 source aligns literally by zero-based word number with the first 43 cells of the original-verified 256-cell numeric table spanning physical p49–p51.

In particular:

```text
signed 16..23 / physical p49 row2:
ARE THE MAP THEIR MEANING IS THE ROAD

signed 24..31 / physical p49 row3:
AND THEIR NUMBERS ARE THE DIRECTION SEEK AND
```

This makes `word number -> table cell -> numeric direction` a literal reading of **ITS WORDS ARE THE MAP / THEIR NUMBERS ARE THE DIRECTION**.

For the frozen Q discrete-log map:

```text
p39 red k516 = [17,23] -> THE MAP THEIR MEANING IS THE ROAD
p7  red k603 = [20,23] -> MEANING IS THE ROAD
```

ROAD=23 addresses physical p49 cell23, token `1R`, canonical base60 value **87**. Exact cross-locks:

- 87 occurs **once** in all 256 cells: cell23.
- 87 = **3*29** = source-derived p3 field coefficient3 × signed **DIRECTION29**.
- Among all 43 signed-word addresses, only HELLO0 and ROAD23 have table values divisible by29; ROAD alone has quotient3.
- Adding ROAD87 to k516 gives k603 exactly, the printed p7 red state.
- Repeating gives k690=[23,23]=ROAD/ROAD.
- Base59 gives86, lands [20,22], and misses p7.
- Across all 17 nonzero printed red states, the canonical word-number→full-base60-direction rule has exactly this one nontrivial edge p39→p7.

Primary report: `im-results/lp2-p3-q-p50-road-dh-navigation.md` (legacy filename; body corrected to physical p49–p51 provenance).  
Original-verified-grid SFT: `sims/lp2_signed_source_p49_map_direction_road_sft.cjs`.

Two Director gates completed in the same run constrain interpretation:

- #3461 prospective p8 Q-interval typing: predicted source-visible [4,8], observed [7,19]; zero length/end-point hits across all 8 complete two-word red spans and 6 conventions. Generic signed-source interval semantics is **not authenticated**.
- #3462 operation adjudication: solved p56 uniquely selects plain Qx among Q/F/Q±29 rivals; plain Q has zero nontrivial one-step red edges. The attractive semilinear F(Qx) p15→p40→p27 chain remains conditional/post-discovery.

Direct bulk Q decoders also failed positive-controlled gates (global constant field multiplier; preregistered p23 additive Q-path stream). The productive claim is therefore the explicit signed-word/table numeric ROAD direction, not a generic Q cipher or unrestricted endpoint storytelling.
