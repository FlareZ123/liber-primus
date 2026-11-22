# Three 2014 magic-square cores as OpenPuff A/B/C: original native exclusion

**Original-cipher decision, 15 November 2026.** Both previously dispatched native OpenPuff v4.00 runs completed successfully as experiments against the **seven unchanged physical LP2 p33–39 JPEGs** (archive scans 50–56) at the independently fixed JPEG Medium 1/5 and Maximum 1/2 levels. Both returned **`native-corrupted-stream`, no recovered output**. The original-tool controls and carrier/bit-selection gates passed. This closes the **exact** three-password, seven-carrier, two-level construction. No LP2 unknown plaintext, author-selected password or destination was recovered. The prior version of this note incorrectly said these native trials were pending; the original completed Actions runs predate this correction.

## Source-motivated candidate and its weakest premise

The historical 2014 OpenPuff-recovered payload contains **three numeric magic squares**, in original order **5×5, 7×7, 5×5** with magic constants **3301, 1033, 1033**. The LP2 cuneiform-marked seven-page run p33–39 (archive JPEGs 50–56) carries numerals referencing that same 2014 source family. The solved p57 Parable says to shed circumferences and find what lies within. The original 2014 steganographic program OpenPuff provides **three** independently specified password fields. Together these motivate a finite hypothesis:

1. Peel one external ring from each historical square, giving inner cores **3×3, 5×5, 3×3**.
2. Apply the solved LP1 Wisdom text's Euler-totient operation cell by cell: `phi(n) mod29`.
3. Transcribe the 43 residues with the canonical 29-entry Gematria Primus romanization, row-major.
4. Enter the three ASCII strings as OpenPuff A/B/C in printed square order, and use the seven 2014 original JPEGs in published order.

The **weakest assumption** is the unauthenticated transfer of "within" to the 2014 magic squares and their use as OpenPuff passwords for this particular LP2 image sequence. Neither the 2014 signed instruction nor LP2 supplies that complete extraction contract. The test remains worthwhile because the exact construction fixes all strings and the source-operating program without fitting ciphertext.

## Derived source passwords, frozen before testing

| OpenPuff field | Historical square | Peeled core | Password | ASCII length |
| --- | --- | --- | --- | ---: |
| A | 5×5, sum3301 | 3×3 | `BTHNHAEHNTHB` | 12 |
| B | 7×7, sum1033 | 5×5 | `MGBTHPAEDWAOEMXJXMOEAWDAEPTHBGM` | 31 |
| C | 5×5, sum1033 | 3×3 | `AMEODXDEOMA` | 11 |

The original tool displayed `H(A,B),H(A,C),H(B,C)={34%,27%,34%}`; every password length satisfies the native 8–32 byte constraints. The derivation is reproduced in [`sims/openpuff_three_square_core_passwords.py`](../sims/openpuff_three_square_core_passwords.py).

## Completed original OpenPuff v4.00 experiment

The [pinned native workflow](../.github/workflows/openpuff-v400-lp2-three-square-core-passwords.yml) retrieves the original executable and companion DLL, validates both historical Git object IDs, and requires a control extraction of the independently published JPEG under its known original `12345678` A-password. This recovers the **exact 35-byte hidden message** `Dies ist eine versteckte Nachricht!` before the original LP2 trial is allowed to run. Its GUI automation additionally requires the exact seven-carrier chain and chosen JPEG bit level, and records the actual modal completion or error.

| Original LP2 seven-JPEG source | Bit selection | Original capacity reported by native tool | Native outcome | Files recovered |
| --- | --- | ---: | --- | ---: |
| Physical p33–39 / scans50–56, passwords A/B/C above | Medium, 1/5 (20%) | **9,344 bytes** | `native-corrupted-stream` | **0** |
| Same complete unchanged carrier chain | Maximum, 1/2 (50%) | **23,392 bytes** | `native-corrupted-stream` | **0** |

The genuine native message on both runs was **`Task stopped: corrupted stream`** with suggestions of incorrect password, carrier/order or JPEG level. The automated source and selection gates established that those exact chosen original carriers and each level were actually used. This is a failed decryption, not a GUI timeout or a successful payload.

- [Medium original-source run 43688101220](https://github.com/FlareZ123/liber-primus/actions/runs/43688101220), completed 2026-11-15 07:05 UTC; evidence artifact `openpuff-v400-lp2-three-square-medium-evidence` **14150104662**, ZIP SHA-256 `e3ae269c186f0be8fdb2f6b375d633b05474c98d532ff36642669854d74cc380`.
- [Maximum original-source run 43688105307](https://github.com/FlareZ123/liber-primus/actions/runs/43688105307), completed 2026-11-15 07:05 UTC; evidence artifact `openpuff-v400-lp2-three-square-maximum-evidence` **14151770310**, ZIP SHA-256 `a63788e58cf250c58089e62ce1275a9d2f52942e6e4656cdaa163887886472cb`.

Both jobs reached the verified native result step and reported `carrier_count=7`, `output_present=false` and no output files. GitHub reports both workflow jobs successful, meaning **the experiment executed and recorded a valid negative**; it does not mean extraction succeeded.

## Decision and boundary

Retire exactly the `phi(n) mod29` peeled 3×3/5×5/3×3 passwords A/B/C in the specified order on the original seven p33–39 JPEGs under the two stated native levels. Neither output produced a payload, so this construction supplies no key for the rest of Liber Primus.

This negative is specific to its source-selected field derivation and source-carrier sequence. It does not exclude an independently instructed different square operation, different password, carrier set, secret sharing rule, or non-OpenPuff cipher. **Do not rerun the same two configurations.** Advance this branch only if a new original clue independently identifies a different operation and a new source-to-payload consumer.
