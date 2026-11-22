# Conditional p0 EPIPHANY SEEKS source-key library gate

**Agent3, 19 November 2026. Classification: bounded negative for direct additive source/historical running keys. The conditional title remains a navigation-derived crib, not verified plaintext. No p0 body plaintext or global LP2 inverse is recovered.**

## Frozen crib

The current navigation route selects the native-GP 8+5 phrase `EPIPHANY SEEKS` for p0 offsets0..12. Against the original ciphertext, ordinary GP29 additive decryption requires

```text
C = [15,8,18,3,6,19,27,0,15,26,18,21,5]
P = [18,13,10,13,8,24,9,26,15,18,18,5,15]
K = C-P mod29
  = [26,24,8,19,27,24,18,3,0,8,0,16,19].
```

The two required key-word sums are **149** and **43**, while the complete key sum is **192**, equal to the candidate plaintext's total GP0 state192. Those arithmetic identities are observations only; they do not select a key generator.

## Frozen external key library

The test pins the independent public source-key project

`pnotisdev/cicada3301@15200c67abee106913ba01ff504c5b6e88d16cc7`

and builds its existing `work/kscreen` KSB library without adding a title-specific source.

The pinned export contains **1,439** deterministic source/historical additive streams. It includes the project's broad pre-existing families such as number streams, solved-text/source strings, historical Cicada constants and payload material, hash-derived streams, and other already-authored key candidates. The external project had previously classified 858 of these by a whole-LP2 IoC filter, leaving 581 survivors; this test ignores that filter and charges **all 1,439**.

For every stream the gate searches:

- every contiguous phase that can cover13 runes;
- `C-P` and `P-C` additive signs;
- forward and reversed stream orientation.

That is four predeclared key-direction variants per stream, with no language score and no near-match threshold.

## Result

**No exact match exists.**

```text
library streams: 1439
variants per stream: 4
exact 13-rune key hits: 0
```

The result passed on native Windows Python3.12 after the external library was rebuilt from the pinned source.

## Scope

This closes the direct explanation that the conditional p0 title is encrypted by a contiguous phase of one of the broad existing source/historical additive key streams in the pinned library.

It does **not** reject:

- a stateful key schedule;
- a key generated from the p28/p50 navigation state;
- a non-additive receiver;
- a source object absent from the external library;
- a per-word reset or other independently instructed state transition;
- the title crib itself.

The contemporary p0 frontier therefore remains a typed-state problem: multiple source-linked routes select the title/ROAD regions and expose DH/p50 state, while the value-changing consumer that turns ciphertext into those words is still missing.

## Reproduction

- SFT: [`sims/lp2_p0_epiphany_seeks_581key_crib_sft.py`](../sims/lp2_p0_epiphany_seeks_581key_crib_sft.py)
- Workflow: [`.github/workflows/agent3-p0-crib-library-manual.yml`](../.github/workflows/agent3-p0-crib-library-manual.yml)
- Windows PASS: [44427896838](https://github.com/FlareZ123/liber-primus/actions/runs/44427896838)
