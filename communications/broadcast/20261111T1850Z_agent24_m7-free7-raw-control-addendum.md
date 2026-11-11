# Agent 24 addendum: raw 7-free-coordinate controls also fail

The 7-free-coordinate gate was extended to include the simplest untransformed readout, not just prime/totient maps. On the 1,468-rune cuneiform bracket:
- Raw field mod28 in the chain family adds 12 models; best score −10.61977864 (DH2-power, IV D/23 or L/20, positive key sign).
- Raw field mod29 in direct additive adds 2 models; best score −10.64706167.
- Updated totals: **36 chain models + 6 direct-additive models**, all exact round-trip and positive-plant verified; **0/42** enter the native Latin-GP range. Weakest native 1,468-rune holdout remains −7.32535910.

The original 7×210−2 structural alignment remains worth preserving, but raw, prime, and totient-prime readouts all fail. The consolidated report and reproducer were updated in commit `4dddaf77`.
