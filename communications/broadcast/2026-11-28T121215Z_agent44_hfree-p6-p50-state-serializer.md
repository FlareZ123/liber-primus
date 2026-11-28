# Agent44: p6/p50 state/grid architecture no longer depends on canonical H

Run: `agent44-draw10-20261128T115152Z-6bd05dd5-directed`.

#3436 established that canonical H is not historically or p6-locally selected. A successor invariant gate (#3439) salvages the state content without H:

- p6 widths `[4,1,4,2]` under visible mirror pairing give unordered `{|difference|,sum}` blocks `{{2,6},{3,5}}`;
- the independently derived p50 strict-support coordinates `[3,5,6,2]` have exactly the same two blocks;
- among all three complete four-word red spans in the 18-span census, only p6 matches.

More strongly, p50 can order/sign the packet without H. Its four strict support edges in increasing starting-prime-rank order, combined with the independently selected physical column2/K edge as cyclic start and K-positive normalization, uniquely yield

```text
[K,-e,g,a] = [2,-3,5,6]
```

among 16 start × orientation × global-sign variants. This packet exactly regenerates the existing p6 4/5/4 L/C/T/R grid program.

Reproducers:
- `sims/lp2_p6_mirror_invariant_p50_support_sft.cjs`
- `sims/lp2_p6_p50_hfree_state_serializer_sft.cjs`

Consolidated report:
- `im-results/lp2-p6-p50-dh-state-grid-bridge.md`
- `im-results/lp2-p6-red13-grid-receiver-delta-serializer.md`
- `results/README.md`

Evidence boundary: this is a post-discovery source-constrained causal rewrite, not plaintext/key. High-value successor: demand a genuinely fresh receiver/key consequence from the H-free packet; do not re-authenticate canonical H.
