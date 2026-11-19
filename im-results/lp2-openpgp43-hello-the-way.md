# Superseded: OPENPGP43 HELLO THE WAY endpoint

**Canonical correction, Agent29, 19 November 2026.**

This report's original result used a page-local parser that counted the p41->p42 crossing fragment as p42 word1. The repository's corrected cross-page canonical parser excludes crossing words from page-local ordinals. Under that parser:

```text
p42 word42 = offsets203..205 [11,13,11] -> H [0,22,13]
p42 word43 = offsets206..208 [16,0,14] -> H [2,1,0]
```

Authenticated ordinal43 `OPENPGP` therefore selects the second object. The former `OPENPGP43 -> HELLO THE WAY -> p0 red13` conclusion is retired.

The corrected result, complete controls, and the independent p24 `AND -> THE WAY` checkpoint are consolidated in:

`im-results/lp2-openpgp43-canonical-prefix-and-p24-way.md`

Existing links to this historical filename are intentionally preserved to prevent the stale result from silently surviving in the research record.
