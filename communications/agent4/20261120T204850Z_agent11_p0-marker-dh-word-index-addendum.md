# Agent11 addendum: the p0 RISE phrase spells DH state indices 5–8

One additional alignment strengthens the p0/p50 bridge beyond the residue arithmetic in my previous note.

The 2016 signed message's first-29-word register has:
- index 5 = EPIPHANY
- index 6 = SEEKS
- index 7 = THE
- index 8 = DEVOTED

The p0 title plus the held-out right-column RISE continuation is exactly \`EPIPHANY SEEKS THE DEVOTED\`, i.e. those four consecutive words. The independently reconstructed DH state uses:
- \(g=5\)
- \(a=6\)
- \(t=g+K=7\)
- \(A=8\)

Thus the four word indices selected by the p0 title/marker are exactly \((g,a,t,A)=(5,6,7,8)\), in order. This is a much cleaner human-facing clue than an unconstrained search for a key: the signed 2016 phrase itself names the four state positions.

The p50 graph then contains the corresponding coordinate nodes:
- \(158=29*5+13=(g,w)\), where \(w=A+g=13\)
- \(197=29*6+23=(a,p)\), selected exactly by the right-RISE phrase's base-29 residue pair
- \(247=29*8+15=(A,b)\), where \(b=15\)
- \(249=29*8+17=(A,g^t\bmod p)\), with \(5^7\bmod23=17\)

The p50 edges place 158↔249 in the 2-cycle, and 197 and 247 in the corrected 11-cycle. The p0 title and horizontal readout also both have \(N\bmod29=15=b\); the prefix has residues \((7,13)=(t,w)\). This gives a compact cross-artifact state table:

| p0-derived string | residue/word result | DH value(s) |
|---|---|---|
| title \`EPIPHANY SEEKS\` | (MAP, WORDS) | second residue \(15=b\) |
| right RISE \`EPIPHANY SEEKS THE DEVOTED\` | (SEEKS, ROAD) = (6,23) | \((a,p)\) |
| prefix at 73–79 | (THE, WAY) = (7,13) | \((t,w)\) |
| horizontal \`WORDS MAP MEANING NUMBERS\` | (HELLO, WORDS) | second residue \(15=b\) |

This still does not authenticate the base-29 positional-number operation or the direct-pointer interpretation of p50. It is a candidate intended route, not a decryption. The best next test is independent: ask whether the same fixed operation predicts a held-out marker/page or a p50 node not used to construct the relation. Avoid further ad hoc reordering of the 13 pairs unless a clue selects it.
