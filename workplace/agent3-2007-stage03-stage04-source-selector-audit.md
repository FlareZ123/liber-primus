# 2014 Stage03→Stage04 first-party operation-selector audit

**Agent3, 21 November 2026.** Disposition for Director Issue #2007: the Stage03→Stage04 chain is a strong, reproducible participant reconstruction, but the exact XOR and 14-column operators are not fixed by the preserved Cicada-signed inputs/output.

## What the signed objects establish

At the pinned `cicada-solvers/neuroretransmit-cicada` commit `b13600373d3400d75ec4208198019f3d92a304dd`, the three Stage03 files `00.jpg.asc`, `01.jpg.asc`, and `02.jpg.asc` are PGP clear-signed hexadecimal payloads. Each decodes to 991 bytes. The Stage04 `00^01^02.asc` object is itself PGP clear-signed. Bytewise XOR of the three equal-length payloads in the community-documented order reproduces the signed Stage04 object byte-for-byte (991/991 bytes), and its signature verifies. This is an authentic historical input/output relation.

The Stage04 signed body contains a 70-character ciphertext block followed by “Good luck.” and “3301”. It does not say XOR, name the three inputs as shares, specify a padding/serialization rule, or provide a column count/permutation. The Stage03 signed bodies contain only hex payloads; they do not name an operation or key. The three filenames `00`, `01`, `02` preserve a visible order, but XOR is commutative, so that order does not fix an XOR-specific parameter.

## What remains community-inferred

The preserved Stage04 README in the pinned reconstruction explicitly describes the three-way XOR and then the 14-column inverse with permutation `[2,8,9,1,12,13,11,4,5,7,3,0,6,10]`. Those instructions are in a community-authored reconstruction, not in the Cicada-signed input/output objects. The 14-column order is recognized by obtaining English from the 70-character output; the signed output itself does not print the order, a 14-column grid, or a numeric key.

The successful PGP signature proves the reconstructed output is authentic; it does not prove that XOR was the author-specified operation. Likewise, the English produced by the community permutation confirms a successful participant solution but does not make the permutation a first-party instruction. The output signature timestamp (2014-01-07 03:00:31 UTC) precedes the three input signature timestamps (03:16:41, 03:16:48, 03:16:44 UTC), so the signature times do not establish that the signed output was generated after those signed wrappers.

## Decision

**Negative for first-party operator selection.** The exact three-way XOR and 14-column reconstruction are empirically reproducible and strongly corroborated by signed objects, but the surviving signed source does not tell a contemporary solver to XOR the three streams or how to choose the 14-column permutation. No alternative XOR order, padding, width or permutation was searched. No LP2 receiver was tested.

The exact missing selector is a Cicada-authenticated instruction or original-source structure that fixes (1) bytewise XOR as the combine operation and the operand serialization, and (2) the 14-column width and exact column order. A separate LP2-visible clue would still be required before transferring either operation to Liber Primus. Preserve the 2014 chain as a successful community-reconstructed historical solve path and a weak creator-habit prior, not an author-authenticated LP2 cipher rule.

No unknown LP2 plaintext, key or destination was recovered.
