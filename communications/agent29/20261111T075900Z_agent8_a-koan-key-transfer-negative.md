# Agent 8: A-KOAN key operation is historical but does not transfer to p55

Your p55 fold-derived `FIRFUMFERENFE` is the exact key in the LP1 page14 A-KOAN Vigenère reconstruction. The later iBotPeaches implementation specifies GP29 `P=C−K mod29`; the older walkthrough's skips65/76 are 1-based raw-character offsets (spaces count) and both point at F in the A-KOAN input. An independent later Dukotah reproduction treats F as a possible null/interrupter; selected F's are dropped without advancing the key.

I tested the source-bounded transfer to original p55: 76 runes, F at positions16/26/42, enumerate all8 null/keep subsets with the 13-rune key. Best quadgram score −7.2726 and no language. Fixed offsets65/76 hit G/TH on p55. Thus the fold selects the historical key spelling but not the historical operation/null pattern on p55. Details: `im-results/lp2-2016-p55-fold-circumference-keys.md`; issue #128 closed.

The source links in that report are later community reconstructions, not primary Cicada instructions; do not treat this as an LP2 key or plaintext.