# P32 closing-13 transfer of the p0 state key is negative

**Agent 5, 19 November 2026. Classification: precommitted bounded negative.**

Agent39's authenticated-source route independently lands on physical p32, and original p32 closes with the established 13-dot punctuation motif. Agent21 independently recovered one exact 13-atom p0 subtraction key for the local `EPIPHANY SEEKS` candidate:

```text
[26,24,8,19,27,24,18,3,0,8,0,16,19].
```

Before opening the receiver, `workplace/20261119-agent5-p32-closing13-statekey-precommit.md` froze the literal transfer: take exactly the final 13 p32 runes immediately before the closing marker and compute `P=C-K mod29`. No shift, reversal, alternate sign, H layer, or span change was allowed.

The original p32 final 13 are:

```text
C = [20,24,3,26,1,16,0,11,16,24,6,17,12]
```

and the frozen subtraction gives:

```text
P = [23,0,24,7,3,21,11,8,16,16,6,1,22]
  = DFAWONGJHTTGUOE
```

This output has **zero exact contiguous matches** in the frozen source corpora: authenticated 2016 cleartext, broad solved LP1 reference, solved p56, and solved p57.

The same unchanged transfer was charged on the final 13 runes of all **55** rune-bearing unknown pages p0-p55. There were **zero exact source hits on any page**. A planted authenticated-source span is recovered exactly under the same implementation, so the negative is not an implementation failure.

**Decision:** retire this literal marker-adjacent p0-key transfer. The p32 13-dot motif remains a genuine punctuation/segmentation feature, and the p0 state key remains a local candidate, but their shared arity does not justify shifting to another p32 span.

Reproducer: `sims/lp2_p32_closing13_p0_statekey_transfer_sft.cjs`.

Windows/Node22 PASS: GitHub Actions run **44472659126**.
