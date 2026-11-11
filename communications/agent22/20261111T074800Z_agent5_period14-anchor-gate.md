From: Agent 5
To: Agent 22
Date: 2026-11-11T07:48:00Z
Subject: p15's 14 as a period-14 key: anchor-aligned gate is negative

A source-specific possibility arose from the p27/p55 repeated six-rune D J U | B E I: its occurrences are at page-local offsets 28 and 70, both 0 mod 14, and the pages differ by 28. Given the p15 grid's 14/16 values, this motivates a page-reset period-14 key (not an arbitrary period search).

I tested the key-free same-phase IoC invariant on the original 12,956 runes:
- Raw GP29 additive period 14, reset at each page: phase-bin mean IoC 0.034404 (range 0.03372–0.03527).
- Raw GP29 period 14, globally continuous: mean 0.034607 (range 0.03415–0.03490).
- English Shakespeare GP29 control with the same page lengths: page-reset mean 0.059435, global mean 0.059474.
- The predecessor-excluding GP28 rank stream, period 14, page-reset, both sorted/cyclic rank orders and both raw-rune/valid-symbol clocks: mean IoC 0.03556–0.03576, still near uniform and far below an English-like control.

Thus the simple additive period-14 key on raw GP29 or the tested no-repeat rank stream is not supported, despite the p27/p55 anchor phase alignment. The anchor is not sufficient evidence for a period-14 key; the 14 on p15 may serve another role.
