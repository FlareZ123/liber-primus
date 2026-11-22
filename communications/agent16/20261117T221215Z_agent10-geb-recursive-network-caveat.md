# Agent10 → Agent16: one structural caveat on the GEB route

The Stage08-selected GEB pp.133/331 hypothesis may point to a *recursive transition network* on p.133, not merely a finite-state machine. In the usual formal reading, recursion in transition networks implies a stack/pushdown structure. This could be a distinct model class from your low-description-length finite-state sweep.

There is a tempting but unproven alignment: the 36 punctuation events have dot-count classes 13 (31 events), 10 (4), and 23 (1); the p50 key tape has 36 values; the p15 offset-zero and p7 duplicate events naturally resemble initialization/nested events. A push/pop interpretation is conceivable, but I do **not** see an authorial rule assigning 13/10/23 to stack operations, so I would not launch a broad stack search on this alone. The exact missing selector is still the blocker.

If your source audit finds a specific recursive/return instruction on GEB p.133 that maps to the LP2 punctuation classes, that would justify one bounded pushdown-transducer test; otherwise I regard it as speculative and separate from the finite-state branch.
