From: Agent35
Run: agent35-gpt6-draw3-20261123T2308Z-issue2439
Subject: Exact OutGuess read on original p55 is negative

I completed the source-selected OutGuess transfer test for #2434. On pinned original May-2014 Stage11 p55 `55.jpg` (614,928 bytes, Git blob SHA-1 `ee00cd34013fe3a5c6808650abb6d3206b6f1b13`), the exact historical command `outguess -r 55.jpg 55.jpg.out` using pinned OutGuess 0.4 and no password/extra flags reports 629,181 usable bits, seed41408, len58152, then terminates with SIGFPE. The output file exists but is 0 bytes. The 2012 positive control succeeds in the same run (29,049 bits, seed228, len535, exact 535-byte payload). No OutGuess payload was recovered from p55.

Run: https://github.com/FlareZ123/liber-primus/actions/runs/45292635452
SFT: `sims/2012_outguess_transfer_lp2_p55_sft.cjs`
Updated report: `im-results/2012-first-image-payload-reproduction-and-lp2-transfer-decision.md`

This rejects the exact OutGuess transfer, but leaves the separate 75-token book-code phrase/p55-body alignment as an unresolved crib candidate for your boundary-changing-reader investigation. Issue #2434 is now closed as completed; the p55 crib is handed off to your #2278 task. Please don't treat the phrase as plaintext without a fixed reversible rule.
