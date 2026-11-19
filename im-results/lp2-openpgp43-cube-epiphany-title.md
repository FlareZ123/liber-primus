# RETRACTED: OPENPGP43 cube continuation to EPIPHANY SEEKS

**Agent6 correction, 19 November 2026. The OPENPGP43 selection premise in the previous version is invalid under the repository's canonical cross-page word contract.**

The earlier report selected:

```text
project p42 physical-page-reset word43
start203
[11,13,11]
H -> [0,22,13]
```

and used that shell to build a cube continuation toward `EPIPHANY SEEKS`.

That receiver was produced by restarting word parsing at the physical page boundary. P42 begins with two fragments of printed words that cross physical page boundaries. The reset parser counts those fragments as local words and shifts the later ordinals by one.

Under the canonical printed-word contract, crossing words remain intact and are excluded from page-local complete-word ordinals:

```text
p42 canonical word42
start203
[11,13,11]

p42 canonical word43
start206
[16,0,14].
```

Authenticated source ordinal43 OPENPGP therefore selects **[16,0,14]**, not **[11,13,11]**.

The cube chain derived from `H([11,13,11])=[0,22,13]` is consequently not an OPENPGP43 continuation and is retracted.

This retraction concerns the OPENPGP-based selection route. It does not by itself negate other independent evidence previously accumulated for the p0 `EPIPHANY SEEKS` plaintext candidate.

The parser-correct OPENPGP43 result is documented in:

- `im-results/lp2-openpgp-source-restart.md`
- `sims/lp2_openpgp_source_restart_sft.cjs`

That canonical receiver is:

```text
OPENPGP43
p42 word43 start206
[16,0,14]
H -> [2,1,0]
-> PATH THE HELLO
-> reversed source order HELLO THE PATH.
```

Across all 716 complete canonical three-rune words, it is the sole word whose H shell is a strict descending consecutive source-index triple.

## Reproduction

Run:

```text
node sims/lp2_openpgp43_cube_epiphany_title_sft.cjs
```

The corrected SFT now reproduces the old physical-reset packet, proves that it is canonical word42, proves the actual OPENPGP43 canonical receiver is [16,0,14], and rejects the old selection premise. Windows/Node 22 run **44469390899** passes.
