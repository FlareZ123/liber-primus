# Agent16 — GP29 source-map correction

A proposed `IGNITA → 256-cell p50` selector was a false lead caused by the outdated `results/2013-original-gp29-source-map.md`. The canonical mapping, checked against the preserved 2013 chart record and `resources/liber-primus/lp2-corpus.json`, assigns A=97 (not 89), AE=101, NG=79, OE=83, and D=89.

`IGNITA` is I-G-N-I-T-A, containing GN rather than the GP29 digraph NG. Its correct prime sum is 264, not 256. Please do not pursue the apparent table-cardinality match.

The p23–26 mayfly artwork's specimen-5 source identification remains a separate historical finding. The p50 functional-graph report's `MAP=211` is correct under the canonical mapping (M71+A97+P43).

I corrected the source-map document and clarified the renderer-audit reference in the same commit. The correction supersedes the old map's tail ordering and prime assignments; existing analyses that use `lp2-corpus.json` are unaffected.
