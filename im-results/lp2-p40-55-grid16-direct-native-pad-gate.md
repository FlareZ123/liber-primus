# The 16 mirror-framed LP2 pages and 256 printed grid cells: literal page-key inverse

**Agent2, 28 November 2026. Classification: independently source-motivated but *bounded negative* direct native GP29 page-pad test. No unknown plaintext, independently authenticated page key, or global table codec.** The original late LP2 section comprises **16 consecutive identically mirror-framed pages p40–p55**, independently established in original-image frame census (Director #3435). The same chapter physically contains a **32×8 table of 256 two-character numerals** on p49–51. Its 256 cells can be repartitioned without scrambling as **16 consecutive strips of 16**, each two original rows. This provides a non-fitted page-to-table alignment that does not need p15's speculative AES key or random-page selection. It remains an *interpretation*, not an explicit author instruction to read the table as a cipher key.

## Frozen complete inverse

- Keep all **3,316** physical p40–p55 ciphertext GP29 runes in their original page shapes and original order; page p50 is numeral-only (zero runes) but naturally receives/consumes its own 16 table slots.
- Page p40 gets original table cells0–15, p41 cells16–31, ..., p55 cells240–255. The horizontal 16-token strip consists of two consecutive printed 8-token rows. For position `j` within the page, repeat its 16 tokens cyclically from original rune position zero.
- Decode each 2-character table number exactly using the two already-live source numeric conventions: **base60** printed alphabet or **base59** same alphabet with lowercase `f` omitted. Take its value mod29, and invert ordinary solved-LP2 native additive GP29 using `P_j=(C_j±K_{j mod16}) mod29`. There are exactly four fixed, fully reversible source/operation cases: two radices × two signs. No corpus shifts, English cribs, phase search, skipping, plaintext-conditioned key consumption, or changes in printed word boundaries.

## Actual original-input decision

| Fixed table decoding / inverse sign | Original p40–55 whole-section IoC, 3,316 runes | p55 IoC, 76 runes | Coherent source-native plaintext? |
| --- | ---: | ---: | --- |
| Original untouched | **0.03446283** | 0.03789474 | none established |
| Base59 − | 0.03443808 | 0.03228070 | no |
| Base59 + | 0.03446792 | 0.03263158 | no |
| Base60 − | 0.03446938 | 0.03824561 | no |
| Base60 + | 0.03437568 | 0.03122807 | no |

All four fixed complete-section outputs remain uniformly distributed at near **1/29=0.03448276**, and p55 remains short/noisy. The independently clear original p57 source has GP29 **IoC≈0.06270997**, substantially different. The SFT prints all 76 original derived p55 GP29 values for each model rather than hiding inconvenient outputs; inspection does not reveal a coherent native phrase or stable header. This is enough to reject a **plain 16-period native additive pad** as the intended source-key-only decryption of all final-section prose, not an exclusion of encoded/pre-whitened payloads, keyed state machines, larger external keys or all 256-token consumers.

## Controls, rival and next decision

The program decrypts/re-encrypts every one of the **3,316** original runes exactly in both signs and radices, then encrypts and recovers a 3,316-position native-GP synthetic plant based on all 95 authentic solved p57 rune values under the same per-page key assignment. This is positive *implementation* calibration only; the wrong-key roundtrip is not evidence that original plaintext was recovered.

The strongest rival to this failed literal reading is that **the real source-selected crossing p40 red lengths → ROAD/MAP cell43**, not the 16-page ordinal, is the start address in the table and supplies a different nonperiodic reader. The registered mirror continuation after cell72 fails its prospective gate (#3442), but other source-directed consumers remain unresolved. Historical Stage7 and contemporary p15 key proposals are separate unconfirmed constructions; this experiment does not recycle their fitted parameters or invalidate them globally.

**Reproduce:** `node sims/lp2_p40_55_grid16_direct_gp29_sft.cjs` from repository root, using only committed original `lp2-corpus.json` and `base60-grid.json`. Source-visible 16-page/256-cell typing is a useful negative filter; pursuing fresh page-dependent changes to this failed additive key would require an independent author-selected opcode, not further phase optimization.
