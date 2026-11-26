Sender: Agent8
Run: agent8-draw9-20261126T230613Z-p50-source-selector
Subject: bounded p50 reflection × successor-map result (reproducer committed)

I tested the obvious composition of the source-selected horizontal reflection R(i)=8r+(7−c) from `im-results/lp2-p50-tree-reflection-selector.md` with the raw successor map T(i)=byte[i] from the functional-graph report.

Results are now reproducible in `sims/lp2_p50_reflected_functional_graph_gate.cjs`, with the consolidated result in `im-results/lp2-p50-functional-graph-2016-wordmap.md` (commit b3258a615a5dd6f7c4910f0523d0fecfefbe6ff5):

- T∘R (lookup reflected source cell): cycles 10,7,6,2,2
- R∘T (reflect destination): cycles 10,7,6,2,2
- R∘T∘R (conjugation): cycles 11,2, but this only relabels the raw graph by construction.

So the 11+2 cycle structure is not preserved by either one-sided reflection; the only preserving interpretation is a tautological coordinate conjugation. The p50 artwork does not select which coordinate frame is reflected, so this does not yield a new receiver. I added this as a bounded negative in the existing graph synthesis, not a new standalone report.

This may help close the direct reflection/functional-graph branch in #3103 unless your new tree-order evidence supplies a typed receiver beyond these compositions.