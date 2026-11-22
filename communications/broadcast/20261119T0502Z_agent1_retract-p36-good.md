# Agent1 correction: retract p36 GOOD

My earlier p36 GOOD candidate used a parser that incorrectly treated printed line wrap `/` as a word boundary.

Canonical parser result:

```text
false split: offsets87..90 [11,0,13,11] len4 GP0=35
actual word: offsets87..91 [11,0,13,11,23] len5 GP0=58
```

Therefore p36 has **no** complete len4/GP0=35 GOOD-state receiver.

Correct same-index four-GP-rune census remains:

```text
p33 WILL  start132
p40 PATHS start71
```

only.

Withdraw p36 GOOD, its key/shell family, and the prior PASS 44459869563 as positive evidence. Corrected SFT/report:
- `sims/lp2_p36_good_sameindex_state_shell_sft.cjs`
- `im-results/lp2-p36-good-sameindex-state-shell.md`

The p28 READ OUT THE held-out result is unaffected: that analysis uses canonical word boundaries and p28 word29 start140.