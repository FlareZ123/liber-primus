# A literal p0–2 east-column key on the untouched rest of LP2

**Original-text decision (18 November 2026):** Treat the community-proposed phrase “THE KEY IS TO GO TO THE EAST OF THE MAP” as a **conditional hypothesis**, and ask whether it determines a usable key for the remaining encrypted pages. The direct, source-visible 27-rune rightmost column and the claimant's GP29 subtraction operation do **not** recover unknown plaintext on original pp3–55 under three natural data clocks and either additive sign.

## Upstream claim and independent key

[2retooz270703's proposed 27×27 p0–2 reconstruction](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption) reports the words “THE KEY IS TO GO TO THE EAST OF THE MAP.” Its method uses three-rune source nodes, Euler totients, Möbius-derived phase selection, and GP29 subtraction. The entire proposed decryption is **unverified** because it has not independently fixed its route/selector. [SECRA's later audit](https://secra.tech/research/liber-primus-strongest-findings/) found alternative legal paths and no source-independent next-node rule for the original seventeen-block version. The author's newer extensions do not by themselves certify an intended Cicada plaintext.

An immediately testable interpretation is that **east of the map** means column 27 of the proposed 27×27 original page-0–2 grid. Pages 0,1,2 contain exactly 262+266+201=729 original runes. Take each row's easternmost cell, top to bottom, with no English-word selection, and freeze this 27-rune GP29 key before examining recipient ciphertext:

- Numeric rune indices (0-based GP order): [17,17,21,25,7,11,25,28,1,4,16,6,9,24,28,5,1,8,6,19,8,16,18,20,7,21,7].
- Rune transliteration: B B NG AE W J AE EA U R T G N A EA C U H G M H T E L W NG W.

This key is a deterministic consequence of the reported source geometry and the original p0–2 runes; whether any author intended this key interpretation is **unknown**.

## Frozen original LP2 continuation

Use the author's direct additive GP29 operation, repeated every 27 ciphertext runes, on all 12,227 original rune-bearing ciphertext positions in physical pages 3–55 (p50 has no runes). Evaluate both subtraction and addition and exactly three source-visible restart clocks: continuous, physical-page reset, and eight non-opening visual-chapter resets. Test source-native GP29 index of coincidence (IoC) and output strings without tuning vocabulary, offset, or key permutation.

| GP29 readout | Subtraction IoC | Addition IoC |
| --- | ---: | ---: |
| Original p3–55 ciphertext | 0.034480440 | 0.034480440 |
| Continuous 27-rune key | 0.034459529 | 0.034479959 |
| Reset at physical pages | 0.034463502 | 0.034475985 |
| Reset at eight visual chapters | 0.034508684 | 0.034532886 |

For comparison, the actual clearly readable GP29 p57 paragraph in the same source transcription has IoC **0.062709966** (95 runes). All six candidate outputs remain near random-symbol frequencies and have no coherent original prose at the unchanged start of page 3 or terminal page 55. A complete mathematical reencryption of each candidate reproduces its untouched original ciphertext and verifies the implemented inverse, not the hypothesized key.

The source-pinned [Node22 CommonJS read-only SFT](../sims/lp2_27x27_east_column_key_original_sft.cjs) prints the complete source key, input length, six statistics, and representative start and terminal decoded strings, using only the repository's canonical LP2 indices. Reexecute it if the corpus changes.

## Research consequence

The literal **eastmost-column repeating-key continuation** of that candidate p0–2 instruction fails to decrypt original untouched pp3–55. This does **not** rule out the independent historical intent of the phrase, a directional walk through the grid, or a non-additive mechanism. Those would need source-fixed travel and state rules, ideally predicting a held-out passage without English target selection. Further lexical fitting of the claim's route or scanning dozens of east-key permutations would be weak. **No unknown LP2 plaintext/key/destination recovered.**
