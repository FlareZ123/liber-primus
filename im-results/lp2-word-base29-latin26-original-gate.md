# Whole-book printed-word BASE29 integer to Latin26: direct inverse rejected

**Scope and result.** A concrete candidate plaintext-producing operation was executed on all 2,896 original printed words of the 56 unsolved LP2 pages (12,956 GP29 runes, including 32 words carried across physical page boundaries). Convert each word's canonical zero-based Gematria Primus indices to one positional BASE29 integer, then render that same integer in a conventional Latin alphabet radix26. Under the two conventional letter-digit rules, the decoded words are nonlinguistic and violate independently calibrated English-word initial concentration. **No unknown plaintext, author-selected key, or destination was recovered.**

## Why this operation, and what it assumes

The signed 2013 Cicada TCP specification establishes integer BASE29 conversion, including the independently known vector `3301 → 3QO`. The signed January 2016 Cicada message explicitly discusses *words* as the map and *numbers* as the direction. Original LP2 supplies 2,896 visible word fields in a 29-symbol alphabet. These clues motivate a precise test of wordwise positional conversion without searching substitution keys, clock phases, column orders, image data or publication variants. **Neither signed source establishes this particular runes-to-Latin26 operation**; that premise is a hypothesis being tested.

Freeze each word's source ordering and canonical GP29 index map. For a word `r[0]...r[n-1]`, compute `N=Σ r[i]·29^(n−1−i)`. Test the conventional positional Latin alphabet A=0,…,Z=25, with `N=0` represented by A, and the bijective spreadsheet-like convention A=1,…,Z=26, for which the empty sequence represents zero. Preserve every printed original word length as external framing to reconstruct leading GP29 zeros on reencryption. No extra Caesar shift, transposition, width scan, secret alphabet or post-hoc removal is allowed.

## Original results

| Source-fixed variant | All original words | Source-visible failure |
| --- | ---: | --- |
| Ordinary positional Latin26, A=0 | 2,896 | 1,096 words begin B. Top four initial symbols occupy 1,434 word starts. The first two original title words become `BGWFKJNTO YQPLP`; the next black words begin `DIDO ND EDE BCSEHGOIXGWE`. |
| Bijective Latin26, A=1 | 2,896 | The authentic one-rune word at zero-based source word index 143 is a literal GP29 digit zero (`ᚠ`), which necessarily decodes to the **empty** Latin word. The remaining words have 1,030 A-initial words, irrespective of which plaintext letters a subsequent *fixed* relabeling would name A. |

A fixed alphabet relabeling can change the *name* of a frequent initial but cannot change its count. For comparison, exactly 101 nonoverlapping-in-the-same-iteration (128-word stepping) 2,896-word windows from Gibran's *The Prophet* and 411 such Shakespeare windows, taken from existing `resources/control/` texts, have maximum first-letter counts of respectively 490 and 483; largest combined four-letter initial counts are 1,313 and 1,272. Both original Latin26 readouts are far outside these two source-native English comparison sets. These are deterministic reference-window ceilings, not discovery-corrected p-values or a proof against every possible language/register.

**Exact arithmetic roundtrip and control.** A standalone read-only Windows-compatible Node.js 22 CommonJS program verifies the canonical 12,956-rune reconstruction, all GP29→Latin26→GP29 word-field roundtrips, a 2,896-word Gibran-source-shaped synthetic English positive (native words fit each original field width), and the two native reference ceilings. Runtime validated on GitHub Actions with success [run 45000804893](https://github.com/FlareZ123/liber-primus/actions/runs/45000804893).

**Reproducer:** [`sims/lp2_word_base29_to_latin26_sft.cjs`](../sims/lp2_word_base29_to_latin26_sft.cjs). Execute in the repository using Node.js 22 to recompute the counts and positives.

## Cryptanalytic decision

Retire **only the direct unkeyed per-original-word BASE29→ordinary/bijective Latin26 interpretation**, and any one further *fixed* bijection relabeling its output letters. Neither variant supplies an authentic recoverable instruction or even plausible continuous ordinary English, and the bijective mode cannot represent an original zero-valued printed word as a nonempty Latin plaintext word without inventing a new special symbol.

This differs materially from already tested **GP29→binary byte fields** (e.g. issue #885) and the **whole-book GP29→Latin26 register with a 256-byte quotient sidecar** (#2178/#2187). A contextual word-dependent key or an independently authored wire-framing rule is outside scope and would require its own source selector, rather than parameter changes to this rejected direct readout.

**Status:** bounded negative / supporting evidence, not an established decipherment and not a change to the authoritative `results/README.md` synthesis.
