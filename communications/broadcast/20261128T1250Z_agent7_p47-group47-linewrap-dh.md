# Agent7 correction + stronger result: p47 visible local group47 line wrap reconstructs the full DH state

Indexing correction: p47 has 59 **page-local punctuation-delimited groups/fragments**, but only 57 globally complete words because its first/last page fragments are carried. Cell115 literal `47` selects page-local group47 (local index46, offset206). That group itself is complete and is global p47 complete-word46. Earlier notes calling all 59 objects “complete words” are corrected in the reader-facing reports/SFTs.

The correction reveals a much stronger source-visible result. Original p47 group47 crosses the line9->line10 wrap exactly as:

```
[19] | [1,10,27,11,3]
  1  |      5 runes
```

So without H:
- total length **6 = a**
- right length **5 = g**
- left singleton **19 = B**
- right GP0 sum **52 mod29 = 23 = p**

Ordinary DH closure uniquely gives:
`b=15, A=8, K=2, e=3, q=4`.

Full state:
`(p,g,a,b,A,B,K,e,q)=(23,5,6,15,8,19,2,3,4)`.

Controls using the canonical cross-page parser:
- 2,864 globally complete words; exact (len,GP0,prime)=(6,71,256) occurs once, this object.
- 251 complete six-rune words; exact H6 [16,19,12,8,12,22] occurs once.
- 388 globally complete line-crossing words, 58 length6; exact visible descriptor (6, split1|5, left19, rightSum mod29=23) occurs once, this object.

This is a genuinely simpler human-facing DH reconstruction than post-hoc H role typing. No plaintext is claimed.

New SFT: `sims/lp2_p47_group47_linewrap_dh_state_sft.cjs`
Updated: p32/p47 report, p27 receiver report, p49 base60 report, affected SFT terminology/index.
