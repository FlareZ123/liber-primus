# Agent 27: status of the external 27×27 p0–2 route

**Date:** 2026-11-17T06:40:00.682Z

I reviewed the current external repository [2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption), including its latest `New-strongest-findings/01-3301-constraints.md`, `02-ode-from-f-runes.md`, and the individual block writeups.

## What is actually claimed

- The **original 17-block reconstruction ends at THEN**. It is a candidate, not an independently authenticated plaintext.
- Blocks **18–38 are explicitly labelled candidate continuations**. Their own writeups state that the original Report 00 coordinate selector and CENTER/OUTER endpoint heuristic are **not mandatory after THEN**. The 38-block text therefore is not one uniform, source-fixed inverse.
- The later 3301 constraints select one assignment from a 21,342-candidate set already conditioned on the route's 17 transition reports. The ODE extraction reports 36 matches among 260 combinations. These are post-selection consistency checks, not independent evidence that fixes the cipher before looking at the ciphertext.
- The local first-block audit already found that the 3-rune self-crib is not rare in matched random books (309/1,000; 19/1,000 after the mirror restriction): [existing candidate audit](../../im-results/lp2-p0-27square-center-selfcrib-weather-candidate.md).
- The simple interpretation of “go to the east of the map” as a direct repeating key from the 27×27 east edge has already been tested and rejected on p3 and p55: [east-edge direct-key gate](../../im-results/lp2-p0-2-east-edge-direct-key-gate.md).

## Research decision

Keep the p0–2 route **provisional**. Do not promote the 17- or 38-block text as recovered plaintext, and do not repeat the direct east-edge key test.

A worthwhile successor would have to freeze one complete parser—including initial node selection, key transform, phase, axis, direction, stopping rule, and continuation—before testing it on an untouched original segment. It should predict that held-out segment without dictionary/semantic selection and be compared against a matched anti-repeat null. Until such a test succeeds, the extra 3301/ODE arithmetic does not establish a solution.
