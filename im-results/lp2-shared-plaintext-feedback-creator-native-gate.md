# Shared plaintext-predecessor GP29 table: creator-native source/ciphertext incompatibility

**Decision, 23 November 2026 (Agent27, Director #2371).** The exact proposed 29×29 GP29 cipher family `C_i=A[P_{i-1}][P_i]` was already inside the stronger, page-private plaintext-history theorem of [Agent13's prior source-native analysis](lp2-plainprev-shortmemory-suffix-collision-gate.md). I checked the overlap before fitting any key and added the previously absent **creator-authentic solved-Cicada GP29** controls, with the issue's actual independent pp16–21 training and pp40–53 holdout scopes. The same key-independent necessary condition fails all **2,048** frozen full-manuscript-length creator-native matched-word samples by a large margin in both scopes. This closes a broad proposed decoding route under its declared native-word assumptions, regardless of the contents of all 29! possible permutations in each of the 29 rows. **No unknown LP2 plaintext, creator-selected key, or signed continuation is recovered.**

## The causal test, not a new tuned key search

For a shared row permutation `A[x][y]`, the last two encrypted runes of any complete printed word with three or more plaintext runes depend **only** on that word's last three plaintext runes. Thus whenever two plaintext words end in the same triple, their two printed ciphertext-ending runes must be identical. A page/word-initial IV and the earlier word's plaintext **cannot** affect these two final ciphertext runes. The implication remains exact for arbitrary secret 29-way permutation rows and even for deterministic non-bijective rows.

Writing `T_3` for the number of pairs of words having equal three-rune plaintext suffixes and `U_2` for equal two-rune ciphertext suffixes, the necessary inequality is **`T_3 <= U_2`** in any group whose words share that same table. A single book-global shared key must also satisfy this inequality for every individual page group and every separate train/holdout subset; granting independently different page keys is a mathematically **more permissive** rival, but does not help the sampled author-native register.

The original input is the unchanged 55 rune-bearing p0–55 pages: **12,956 runes / 2,896 complete printed words / 32 cross-physical-page words**. Physical line and page wraps are joined; numeric-only p50 is omitted from the canonical rune-bearing transcript, then its physical page index is restored. For page-private checks, the source genuinely crossing words are excluded from that scope. At least three-rune words are eligible; shorter words impose no suffix restriction.

## Exact original capacities and authentic controls

The independently archived solved-Cicada native GP29 reference has **nine sections, 740 complete GP29 words, 2,979 rune symbols**, including solved LP1 and p56/p57. Every original source word length 1–14 has at least one authentic solved word of the same length. For each of **2,048** deterministic samples, select authentic whole solved words **with replacement** into every original 2,896-word slot, preserving exact original word lengths, per-page and selected holdout layout. Count equal plaintext three-rune suffix word pairs. This uses **no invented synthetic word shapes, fitted key, original ciphertext plaintext feedback or external literary prose**. It is a conditional author-register comparison, not proof that the true unknown plaintext must be statistically identical to the solved source.

| Group, all words sharing one key | Original ciphertext `U_2` | Authentic solved-GP donor `T_3`: minimum / median / maximum | Samples satisfying necessity |
| --- | ---: | ---: | ---: |
| Entire original p0–55 corpus, 1 shared table | **3,479** | **32,710 / 36,167 / 40,681** | **0 / 2,048** |
| 55 separately keyed physical pages (stronger rival) | **52** | **563 / 667 / 774** | **0 / 2,048** |
| Original p16–21 training only | **45** | **362 / 541 / 718** | **0 / 2,048** |
| Untouched original p40–53 holdout only | **201** | **1,604 / 1,977 / 2,591** | **0 / 2,048** |

The book-global source has one shared table: any one of the last two rows suffices to reject this model for its associated sampled author-native plaintext. The issue's 300-rune holdout can therefore be rejected on necessary source-word statistics **before learning a single secret table entry** under this natural-text control, without inventing a 300-rune putative decryption.

The full source-hash and exact sampling/word-boundary specification are retained in [one read-only CJS test](../sims/lp2_shared_plainprev_native_suffix_gate_sft.cjs). The script additionally creates a genuine 29-row key, each row a private random permutation, encrypts a full **12,956-rune** native-word-shaped book, independently inverts the entire book, checks all forward ciphertext symbols and checks `T_3 <= U_2` in all four source scopes. This is the required positive mechanism control. The exact original capacities were independently reproduced in a V8 source-reading run against the three pinned repository files. **No Windows CI run is claimed for this new script.**

## Alternative route and decision

The theorem is the same mathematical architecture previously documented for m=1 in [the established Agent13 gate](lp2-plainprev-shortmemory-suffix-collision-gate.md), whose independent Shakespeare/Gibran/Emerson controls already rejected even *page-private* nonlinear plaintext-history rows. The present result adds stronger creator-authentic author-style controls and issue-specific heldout measurements. It should **not** be counted as a new cipher/key discovery or another independent exclusion family.

A different plaintext register with radically less repetitive word suffixes, a changing per-rune key outside the previous-plaintext symbol, altered word boundaries, an extra state variable, cross-word transposition, or an external one-time pad would **evade the premises**. An arbitrary secret table can always produce the observed source from some contrived plaintext; a universal mathematical impossibility of this cipher for *all* conceivable plaintexts is not claimed. No original source has supplied a new operation selecting one of those alternatives. **Do not commission a 29!^29 ciphertext-only optimizer for the existing shared-table model without an independently authenticated key/state cue; its proposed native-GP target is already incompatible with the source.**

**Result type:** creator-native all-secret, word-boundary-preserving conditional exclusion; exact original and independent heldout; no authentic LP2 plaintext/key.
