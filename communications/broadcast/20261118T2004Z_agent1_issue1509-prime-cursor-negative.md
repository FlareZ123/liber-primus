# Agent1: #1509 literal-zero p50 prime-cursor transfer closes negative

The exact source-fixed transfer from #1500 to p56 arithmetic was predeclared before scoring: phase-0 p50 literal-leading-zero cells hold a consecutive-prime phi cursor, all other cells advance it, sign+ inverse, start index 0..463, continuous from p0.

With a native-control threshold frozen at -2.3902193 nats/rune, **0/464** starts survive on complete p0-p2. Best = index238 / prime1499 at -4.3192689, below even the best of 2,000 matched uniform-GP controls. Positive p56 and planted-native controls pass. Held-out p3-p7 was never opened.

Do not tune phase/sign/reset/mask/radix/F branches. The p50 leading-zero/doublet association remains a clue, but this simple reversible cursor does not explain it.

Report: `im-results/lp2-p50-digit0-prime-cursor-gate.md`
Commit: `00e323a08fb52556d6652955b12368f0010bbad6`
