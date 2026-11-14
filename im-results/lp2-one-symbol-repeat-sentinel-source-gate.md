# Supplementary three-slot GP29 repeat-sentinel gate (prior all-symbol result acknowledged)

**14 November 2026, Agent19. Classification: supplementary measurement of an already-established exclusion.** The [11 November all-symbol fixed-rune source gate](lp2-reserved-ea-repeat-transport-original-gate.md) had already demonstrated the same all-key invariant, 23/44/19 original site counts, and a corrected Beowulf AE-only best candidate. The [14 November independent original-source gate](lp2-fixed-reserved-rune-doublet-source-gate.md) and [10 November word-position gate](doublet-plaintext-letter-marker.md) likewise cover this family. The present work computes a distinct three-slot variance score and Old English comparison. It is a metric refinement and independent calculation, **not a new cryptanalytic mechanism or independent exclusion**.

**Original scope:** a key-independent, native-register-conditional rejection of the family in which a repeated ciphertext pair occurs **if and only if** its second plaintext rune is one constant GP29 symbol. No new plaintext, key, or historical algorithm is identified.

## Causal path and locked necessary condition

The original 55 rune-bearing LP2 pp0–55 contain 12,956 runes but only 86 repeated adjacent runes among 12,901 same-page adjacencies. A natural reversible 29-way construction gives the previous ciphertext symbol one repeat branch and all 28 other plaintext symbols the nonzero modulo-29 transitions; hidden keys may permute those 28 differences arbitrarily at every step. The visible near-absence of doubles is the hypothesized human clue. For **every** such exact one-symbol repeat sentinel, repeat **locations** survive arbitrary secret permutations, page-specific keys, and changing state. They must therefore follow the plaintext word-position distribution of the special rune under intact printed word boundaries.

The canonical original ciphertext and transcription reconcile precisely as 2,896 printed words and 12,956 original rune positions. Page starts and line wrapping are treated correctly. Assign the *second* member of each same-page repeated pair to its actual printed word slot: **23 word initials, 44 interiors, 19 word finals**. An initial in a one-rune printed word is counted as initial.

For each actual printed word, sample whole GP-native reference words of the exact same rune length. Retain the manuscript's page starts, so a first symbol on a physical page has no predecessor. Across all possible sentinels, compute the expected number of such word-initial, word-medial and word-final rune positions and their reference-sampling variances. The statistic is the largest absolute standardized discrepancy among those three slots for a rune, minimized over **all 29** GP symbols. A secret substitution mapping cannot change this invariant.

## Original versus two independently prepared native-GP controls

| Source-native register | Best of 29 fixed sentinels | Expected initials / interior / finals | Observed | Smallest maximum standardized discrepancy |
| --- | --- | --- | --- | --- |
| Shakespeare first 300k, word-level GP digraph encoding | **P** (GP13) | **94.01 / 95.93 / 16.17** | **23 / 44 / 19** | **7.565 SD** |
| Corrected Beowulf Old English GP source | **AE** (GP25) | **29.1 / 105.8 / 5.5** | **23 / 44 / 19** | **6.160 SD** |

The corrected Beowulf register is the checked-in 48,012-rune/10,885-word source, with Þ/Ð/Æ input repaired. Its pool has no 14-rune words, so three original 14-rune words were omitted from that register's comparison; **none contains a doublet**. The Shakespeare pool supports every original length. The GP English encoder is the same one used in the repository's earlier #823 key-blind rotor controls; it applies digraphs inside words only.

A deterministic, standalone **Node22 CommonJS SFT** samples 2,500 matched native books per register, separately measuring the discrepancy tail of each of the 29 possible marker identities. It also implements one complete 29-symbol reversible predecessor-excluding witness cipher and asserts exact full-original-layout plaintext/ciphertext round trips on four independent synthetic marker choices. The calibration is a conditional finite-source test, not a general significance theorem about all possible natural languages.

## Decision and scope

For the two tested source-native word registers, reject the entire **one-fixed-rune, if-and-only-if repeat sentinel family** under intact original typographic word boundaries. This is stronger in key freedom than rejecting a specific affine rotor because all ciphertext-to-nonrepeat symbol maps may be secret and state-dependent. It does **not** exclude a changing sentinel, probabilistic escapes, multiple-symbol repeat encoding, altered word boundaries, an untested historical language, or an output process with no plaintext-symbol-specific repeat meaning.

The result supplies an actionable requirement: a proposed anti-repeat inverse needs independent evidence for how its repeat condition changes across context, or an explicit reason why the printed word-slot distribution cannot be used. Retire universal EA/F and other fixed-symbol repeat-sentinel rescues without a new source-selected register or segmentation.

**Reproducer:** sims/lp2_one_symbol_repeat_sentinel_sft.cjs. Required original and control inputs are already under resources/. Run from the repository with Node 22; no external packages, network access or file writes.
