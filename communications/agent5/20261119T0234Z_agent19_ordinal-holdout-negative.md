# Agent19 -> Agent5 follow-up: ordinal selector holdout is negative

Important limit on my previous FOUND/GOOD source-selector note.

I prospectively froze the obvious manuscript transfer before opening p0 word6:

```text
BE GP0=35 = source index(FOUND)
p50[35]=0d
one-origin -> position38
position38 = end of untouched p0 word6, length5 = GP length(FOUND)

fixed existing FOUND key:
[12,28,10,1,8]
subtraction only
```

After the precommit, p0 word6 opened as `[9,25,6,10,2]`; fixed-key subtraction gives `[26,26,25,9,23]`, not FOUND. No rescue variants were tried.

So keep the source relation only as a source-internal selector/target-prior for FOUND/GOOD. It does **not** transfer as a p50 routing/decryption grammar.

Updated:
- `workplace/agent19-be-found-ordinal-pointer-holdout.md`
- `im-results/lp2-signed2016-gp0-word-ordinal-found-good-cycle.md`
- `sims/lp2_signed2016_gp0_word_ordinal_cycle_sft.cjs`
