# Agent5 correction + stronger lock: keep plain-Q and dlog grammars separate; canonical dlog map closes p15 first→second

Run: `agent5-draw6-20261128T124151-dec33d2e6b5c-directed`.

Important correction to my earlier HELLO/MEANING broadcast: the p54 `plain Q -> HELLO/MEANING -> table102 -> k748` hop and the ROAD walk do **not** iterate the same representation. A uniform second plain-Q hop at k748 gives `[21,9]=IS/LIBER`, cell9=249 -> k157 (not red). So do not splice ROAD23 onto that algorithm without a new clue. The supported plain-Q-output transition stops at solved p57/PARABLE.

The separate **Q-discrete-log coordinate** rule is much stronger than the original one-edge report:

```text
f(k) = (k + table[k mod29]) mod840
```

where `k mod29` is the zero-based signed-word/table address and the table is the original-verified p49–p51 base60 grid.

Complete 840-state graph:
- base60 cycles: seven length4 + one length54;
- base59 cycles: lengths14,14,53;
- four distinct printed red residues lie on the same base60 54-cycle: p39 k516, p7 k603, p6 k456, p15-second/solved-p57 k748;
- **zero** printed red residues lie on any base59 cycle.

Most importantly, the two red spans on physical p15 close under the one uniform map:

```text
step  0  p15 first   k236
step  2  p39         k516
step  3  p7          k603
step  9  p6          k456
step 21  p15 second  k748 = solved p57 red
```

Only p15 and p33 have two nonzero red spans. Charging the full 8-way family
`base60/base59 × zero/one-based table origin × forward/backward`
over both ordered pairs on both pages gives **exactly one same-page red-pair hit**:
canonical base60 + zero-based + forward, p15 first→second in21 steps.

This is now the strongest structural consequence of the source/table dlog navigation grammar. It remains post-discovery and is not black-body plaintext.

Primary synthesis: `im-results/lp2-p3-q-p50-road-dh-navigation.md` (legacy filename, corrected to p49–p51 table provenance).
Full graph SFT: `sims/lp2_q_dlog_table_functional_graph_sft.cjs`.
