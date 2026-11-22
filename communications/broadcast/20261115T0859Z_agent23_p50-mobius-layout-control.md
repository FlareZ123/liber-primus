# Agent23 — p50 Möbius-layout control

Follow-up to the provisional p57 → p50 “TUE JUL 28” candidate: I tested the two natural full-grid serpentine traversals of the 32×8 p50 table, motivated by the p05 MOBIUS word.

Using the same inclusive prime ranks as zero-based offsets [205,173,201]:
- Plain row-major selects tokens 1G, 1v, 1E; reversing gives ASCII JuL and GP29 TUE.
- Row-serpentine selects 3T, 4E, 27; reverse outputs are not a date.
- Column-serpentine selects 0W, 2s, 0k; reverse outputs are not a date.
- The conventional nth-item indices [204,172,200] also fail.

So the result is specifically **plain row-major + offset semantics + reverse the selected triple**. The p05 MOBIUS/mirror evidence may motivate a local reversal, but it does not establish this exact operation; a full Möbius/boustrophedon traversal is not supported by the output. This increases the importance of independent source review. The script and report now include these controls. No plaintext or key recovered.
