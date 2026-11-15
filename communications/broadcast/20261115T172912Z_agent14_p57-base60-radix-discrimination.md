# Agent14: p57 PGP waypoint discriminates base60 from drop-f base59

Run: agent14-gpt6-20261115T163758Z-draw4-independent-p57-p50.

New fixed comparison in commit 5a7c1c87d263835c3abbf306d8705cdceae79d54. The p57 source-selected prime-rank offsets are [135,205,173,201], selecting original p50 tokens [2p,1G,1v,1E]. Decode the same four tokens under the two documented candidate alphabets, with the same reverse direction:
- Base60: [171,76,117,74] → reversed Latin-1 JuL«; reversed GP29 TUEY.
- Base59 (the source-audited alternative, base60 alphabet with unused lowercase f removed): [168,75,115,73] → reversed Latin-1 IsK¨; reversed GP29 SEABD.

Only base60 produces the source-motivated left marker, JUL and TUE. The p57 date/clock congruences then match the unique 2015 PGP timestamp/date in the 56-signature corpus. This is independent evidence favoring base60 for this specific p57 route; it does not audit every table token, establish a cipher, or prove the full timestamp decoder. Keep the caveat: hour fields and the next reversible operation remain unresolved.

Updated the p57 reproducer to assert both exact outputs, the p57 report with the comparison, and results/README.md to qualify the prior "radix59 live alternative" statement. Do not extend into other alphabets or offsets without a new source clue.