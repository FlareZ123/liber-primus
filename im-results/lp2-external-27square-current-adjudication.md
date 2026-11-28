# Current external 27×27 p0–p2 plaintext claim: strong local mechanism, not yet authenticated plaintext

**Agent 9, 28 November 2026. Classification: external-claim adjudication plus recovery of pruned internal prospective evidence. This report is not a decryption claim.**

## External release pinned

Repository:

`2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption`

Current inspected HEAD:

`3c7921629065a4688aae02403b14c8eb6e12e3d6` (21 November 2026).

The public release proposes a 27×27 arrangement of the 729 p0–p2 runes, three-rune geometric key nodes, optional center totient, a Möbius-derived three-position rotation, and modulo-29 subtraction. It publishes a 39-block reading beginning:

`AS I GO, THE WEATHER TURNS COLD`

and ending in `DIE`.

This exact public route was already the subject of substantial FlareZ123 work in the repository history around commit `d9789b9ce39bf9efe9d16ecfd2ac49842c6b1164`, even though those reports are absent from the present pruned working tree.

## What the current public decoder does and does not establish

The external project's own November audit (`New-strongest-findings/07-FlareZ123_analysis.md`) records a rerun of its current decoder:

- all 729/729 ZIP matrix indices matched this repository's canonical p0–p2 transcription;
- the longest search returned **192** readings;
- **96** end in `DIE`;
- **96** end in `WINGING`;
- both longest branches reach 39 blocks / 118 runes and share geometry through block38;
- the highest-ranked DIE reading is rank1;
- the highest-ranked WINGING reading is rank4;
- the default search uses a dictionary from the first block to admit/rank candidates.

Therefore the headline "rank1 in a free search" is not a target-language-blind authentication event. The search still conditions on English lexical evidence, and the terminal state is not unique even at maximum depth.

The public project's own audit names the same missing decisive test that this repository has required: freeze an exact unused key node, raw/phi mode, ciphertext start, direction and stopping point from a single source clue, **before** examining that reading.

## Recovered internal prospective evidence

Historical FlareZ123 commit `d9789b9ce39bf9efe9d16ecfd2ac49842c6b1164` still exposes the earlier source-bounded analyses through raw Git history.

### Real prospective hits

`im-results/lp2-p28-dh23-p0-prospective-block9-block10-nodes.md` records two sealed exact key-node predictions from the independently reconstructed DH23 state:

1. block9 node `J-D-J` at `(15,20),(17,18),(19,16)`, globally unique by values; sealed before the public block9 walkthrough was opened;
2. block10 node `OE-J-OE` at `(18,16),(19,16),(20,16)`, also globally unique; sealed before the public block10 walkthrough was opened.

Because the public node-to-key operation was already fixed, those predictions also fixed the derived keys.

These are genuine prospective source-geometry evidence for the 27×27 construction.

### The same prospective program also failed

The same archived report preserves sealed neighboring misses:

- proposed block6 ciphertext start failed;
- proposed block7 ciphertext start failed;
- proposed block8 key-source mirror failed;
- proposed block11 fully state-native mirror failed;
- proposed block12 endpoint mirror failed;
- proposed block13 connected mirror failed;
- a later fresh block14 key-node prediction `C-N-C` at `(24,3),(25,3),(26,3)` failed; the public route instead used `EA-J-EA`.

This is critical: DH-state expressibility can make exact-looking source packets, but it does not specify a general next-node transition.

### Opening/continuation evidence is substantial but partly post-hoc

Recovered historical reports also show:

- the p0 first-three-block bootstrap was source-bounded but originally lacked a deterministic p1 transition;
- a locked solved-LP1 checksum uniquely selected `COLD` inside the frozen 36-way block4 family, but that checksum itself came from the already-public candidate passage;
- the physical p2 boundary later selected `I MAY / CRY / NOW THE / IDEA` through a compact equal-outer/mirror grammar;
- a broadened post-IDEA mirror-incidence family had 66 complete assignments, 7 of length12, and exactly 1 hitting the precommitted residual 151/553, yielding `OF THE END IS DEATH`;
- those grammars were recognized after the public route existed and therefore remain temporal holdouts rather than creator-authentication.

The route is consequently much stronger than an arbitrary English fit, but weaker than recovered plaintext.

## Decision

Treat the November 2026 27×27 release as a **high-priority intermediate mechanism**, not as solved LP2 plaintext.

Established value:

- canonical original input;
- compact geometric/totient/Möbius decryption primitive;
- several strong source-only closures;
- two consecutive sealed globally unique key-node hits.

Blocking defect:

- no general source-selected transition grammar;
- multiple sealed neighboring/future misses;
- current full decoder admits candidates with a dictionary from block1;
- longest current search retains a 96/96 DIE/WINGING terminal split.

Do not spend effort rediscovering the published 39-block English reading or its retrospective numerology.

The only promotion-grade next experiment is a **fresh unused reading** where all of node, transform mode, start, direction and stop are frozen from first-party/source state before target inspection. Failure should retire the claimed general transition; success should be repeated on a second independent target before any plaintext promotion.

## External source pins

- current external HEAD: `3c7921629065a4688aae02403b14c8eb6e12e3d6`;
- current README and Report 00 describe the decoder and primitive;
- `New-strongest-findings/07-FlareZ123_analysis.md` contains the current project's own FlareZ123 cross-audit and 192-reading decoder statistics;
- historical internal snapshot used here: `d9789b9ce39bf9efe9d16ecfd2ac49842c6b1164`.
