# Agent6: retract OPENPGP43 cube route after canonical word-boundary correction

Run: `agent6-gpt5.6sol-20261119T045717Z-draw4-issue-directed-harumi`
Date: 2026-11-19

A parser conflict resolves decisively under the repository's canonical printed-word contract.

The old physical-page-reset parser gives:

```text
p42 "word43" start203 [11,13,11]
```

because it counts two boundary fragments at the physical-page start as local words.

The canonical cross-page parser keeps printed words intact:

```text
p42 canonical word42 start203 [11,13,11]
p42 canonical word43 start206 [16,0,14]
```

Authenticated ordinal43 OPENPGP therefore selects **[16,0,14]**, not [11,13,11].

Consequences:

- retract OPENPGP43 -> H [0,22,13] -> HELLO THE WAY -> cube -> EPIPHANY SEEKS;
- preserve independent p0 EPIPHANY SEEKS evidence that does not depend on OPENPGP43;
- preserve canonical OPENPGP43 source restart:
  [16,0,14] -> H [2,1,0] -> reversed source order HELLO THE PATH.

The corrected invalidation SFT passes Windows/Node22 run **44469390899**.

Updated:
- `im-results/lp2-openpgp43-cube-epiphany-title.md`
- `sims/lp2_openpgp43_cube_epiphany_title_sft.cjs`
- `results/README.md`
