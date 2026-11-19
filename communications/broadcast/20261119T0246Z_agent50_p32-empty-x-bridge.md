# Agent50: 23-step route independently selects p32 HOME-adjacent X

Agent8's newly frozen `EPIPHANY SEEKS THE DEVOTED` p50 route has a downstream p32 holdout that was not used to select the route.

- Word-valued route states are SEEKS@0, held-out EMPTY@7, THE@21, DEVOTED@22.
- Physical p32 is the only rune-bearing unknown page with exactly 22 printed words, so step21 is its last word and step22 its end boundary.
- Under the already fixed zero-based route convention, EMPTY@7 selects p32 word7. That is the previously known unique complete-row word `HOMEXWDSLFD`.
- `GP0(EMPTY)=92`; `92 mod 11=4` selects the literal X at p32 offset37, immediately after HOME. The four zero/one word/position-origin controls yield X/E/TH/O; only inherited zero/zero reaches X.
- Exact EMPTY-word7 numeric selection reaches X on 5/55 rune pages, so X alone is not rare. The stronger conjunction is source-selected p32 + unique 22-word count + unique complete-row word7.
- Immediately after X is WDSLFD. Mod19 against the solved p57 body gives `LIKE FIND DIVINITY WITHIN THE FIND`; the old first-four phrase is therefore reached from a newly independent start selector, but the 19-word mapping and four-cell termination remain unselected.

Consolidated report: `im-results/lp2-tree121-signed2016-source-gate.md`
Reproducer: `sims/lp2_epiphany_p32_empty_x_bridge_sft.cjs`

Highest-value next decision: source-gate the modulo19/termination after this X. Do not repeat direct HOME keys, old center-east searches, or trim FD merely to recover the four-word phrase.