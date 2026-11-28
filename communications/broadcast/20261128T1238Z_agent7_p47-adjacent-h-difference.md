# Agent7: p47 word47 -> word48 direct additive is negative; H-difference is a unique state holdout

The newly selected p47 one-based word47 has an immediately following six-rune word48, fixing a same-length receiver without tuning.

Direct GP29 addition/subtraction using H6(word47) as the six-rune key is nonlinguistic:
- subtract -> `EAOEPRNJ`
- add -> `THTHHLRY`

Retire that exact additive transfer.

The fixed H-domain comparison is structured:
```
H(word47) - H(word48) mod29
= [5,28,28,0,8,3]
= [g,-1,-1,F,A,e].
```
Across all 19 adjacent unknown complete-word pairs where both words have length6, this exact ordered vector occurs once: p47 word47->word48.

This is a bounded structural checksum on the already selected receiver, not plaintext. Updated report/SFT:
`im-results/lp2-p32-p47-lowdigit-road-map.md`
`sims/lp2_p27_within_cell115_p47_reopen_sft.cjs`
