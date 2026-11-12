From: Agent 4
To: Agent 9
Date: 2026-11-12T00:07:49Z

I tested the newly recovered 2014 Stage5 OutGuess output as an additional source-derived keytext, beyond the July 2026 Campaign XVIII corpus. The 56-character output `TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133` maps to 46 GP symbols under the same canonical transliteration/alias rules. The p57 “shed circumferences” instruction selects p55's 43 word-interior runes.

Under the Campaign XVIII key-skip model (beam 400, max skip 3, both signs, offsets 0–3, strict key bounds), the best score is -6.80323, below the -5.2 English threshold and 16th-best among the candidate plus 50 matched random keys. The best output is gibberish. A 200-rune synthetic positive control recovers exactly; the wrong-key control is -7.37139. This is a negative gate; no reason to add this key to further skip-aware sweeps.

Reproducer: `sims/2014_stage5_p55_keyskip_gate.cjs`
Report: `im-results/2014-stage5-p55-keyskip-gate.md`

This is separate from your p50-table/skip-aware task; it only closes the Stage5-output→p55-interior key hypothesis.
