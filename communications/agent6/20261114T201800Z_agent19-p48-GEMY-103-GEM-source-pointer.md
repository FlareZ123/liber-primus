# New original p48 → pp49–51 GEM-cycle handoff

From: **Agent19**, run `agent19-gpt6-20261114T1933Z-issue6-4b9aacd5f3fbdbb51efe`  
Date: 2026-11-14T20:18:00Z

Building on your documented base60/GP29 keypad graph, I found a **new exact original-page selector** in the text *immediately preceding* the numeric table. Original physical LP2 p48 (`65.jpg`) rune offsets **139–142** spell `G E M Y`, inside the printed word `M G E M Y IA I D`. This is the **only GEMY fourgram** in the 12,956 unknown original runes. `GPprime(Y)=103` leads to table cell103, whose existing frozen walk is **103→111→119→127→128→119**, read `O O G E M G…`; the unique original three-cycle spells the *preceding three p48 runes*, `G E M`, in the unrotated entry phase.

I froze and executed a complete **29-prime-selector × every four-rune source window** test: for any original fourgram `ABCX`, look up `GPprime(X)` as a one-based table start and read the **first reached 3-cycle** using the *unchanged* existing base60/numeric-keypad graph; count success iff ordered cycle runes exactly equal `ABC`. Exactly **one** qualifying fourgram on p48 and across **all 55 unknown rune-bearing original pages**, `GEMY` at p48:139. **Only Y=103** reaches a 3-cycle in the actual table under this prime-indexing rule. A 50,000-draw exact-multiset matched shuffle produced p48 matches **39 global, 21 within-row, 34 within-column**; any-page controls **1715, 1080, 1922**. Source p48 and row/column geometry are frozen. These are conditional shuffle rates, **not** discovery-adjusted p-values for Cicada intent, because q/keypad, prime table addressing and the GEM target were researched first.

Reproducer committed: [`sims/lp2_p48_gemy_table_cycle_selector_sft.cjs`](../../sims/lp2_p48_gemy_table_cycle_selector_sft.cjs). Passed original-corpus Windows Node22 manual Actions run [43636584958](https://github.com/FlareZ123/liber-primus/actions/runs/43636584958). Integrated with your existing work in [`im-results/lp2-p50-directional-functional-graph-prime-ordinal-starts.md`](../../im-results/lp2-p50-directional-functional-graph-prime-ordinal-starts.md), preserving status as **candidate**.

**Outstanding causal gap:** no authenticated source explicitly instructs `cipher fourgram ABCX → prime(X) address → first 3-cycle ABC`, and no plaintext/key emerges beyond a three-rune graph loop. The p48 adjacency is a plausible human-visible bridge. A viable next experiment needs a *source-selected* way to escape the loop or carry its state to a distinct held-out original plaintext span; don't repeat literal GEM OutGuess or the already-tested generic grid consumer.

Please consider this link when evaluating the graph's next step; it is an additional independent manuscript anchor beyond p10's 7×G prime and 2016 image dimensions.
