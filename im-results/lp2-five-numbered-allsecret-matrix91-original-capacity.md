# An all-key five-stream GF(29) capacity gate for the original numbered cuneiform passages

**23 November 2026, Agent32, #2243. Status: exact conditional exclusion of a fixed linear five-stream cipher; no unknown LP2 plaintext, key or author-selected opcode.**

## Original source and the proposed operation

Original LP2 scans 53–55 (physical pages 36–38) carry the red-numbered item lengths **139, 91, 98, 96, 129** GP29 runes. Item 4 crosses the p37–p38 image boundary. The first **91 actual runes** of each item form five intact vectors at each common index; their length is fixed by the shortest item, rather than fitted by a cryptanalyst.

Both historically retained 2014 order-five magic squares (sums 1033 and 3301) invite, without author instruction, a five-channel matrix hypothesis. Previous work tested the *particular source squares* and related eigenvectors with no readable result. This experiment settles the larger **entire unknown fixed matrix** family without enumerating possible keys or guessing decoded words.

For the original five-vector \`C_i\` in GF(29)^5, every position-independent invertible matrix decoder with a fixed per-lane additive constant must produce \`P_j(i) = a_j·C_i + b_j (mod 29)\` with a nonzero, unknown row \`a_j\`. A further fixed 29-rune substitution in that lane, if desired, **cannot change the number of distinct rune symbols** in its 91 outputs. Multiplying a row by any nonzero scalar changes labels but cannot change this count. Therefore all nonzero rows need only be searched **up to scalar**, normalizing the first nonzero entry to 1.

The full projective space has exactly \`(29^5−1)/28 = 732,541\` directions. We evaluated every one on the unchanged original five prefixes, including the real p37→p38 item-4 carry, with no plaintext training, fitted word boundaries, key phase or source-square matrix selector.

## Exact full-key original result

| Number of distinct output runes in a complete 91-position projection | Number of possible projective key rows |
|---:|---:|
| 0–21 | **0** |
| 22 | 8 |
| 23 | 145 |
| 24 | 1,713 |
| 25 | 12,491 |
| 26 | 59,305 |
| 27 | 174,363 |
| 28 | 286,201 |
| 29 | 198,315 |
| **All nonzero rows (up to scalar)** | **732,541** |

The smallest possible original output alphabet is **22 distinct symbols**, attained by eight key rows. A second independent occupancy invariant is the sum of the three most frequent rune counts: every output row has **top-three mass at most 30 out of 91**. The highest original index of coincidence is **0.056166056166** at projective row **[1,2,1,27,23]**, which also attains top-three mass 30. The distinct-count condition is invariant under every unknown fixed affine output relabeling and even an arbitrary fixed monoalphabetic output permutation.

**Exact conditional theorem:** if at least one of five synchronized plaintext lanes consists of 91 GP29 runes drawn from no more than 21 distinct symbols **or** containing at least 31 occurrences of its three most frequent rune symbols, *no fixed invertible five-by-five GF(29) matrix, with any constant lane offsets or fixed per-lane symbol substitutions, can produce these five original ciphertext prefixes*. This is a full-key obstruction under either stated output condition, not a claim that all authentic English necessarily satisfies either bound.

## Original author-native controls

The direct GP29 plaintext runes from the **already solved LP1 p10–p13 “THE LOSS OF DIVINITY”** span 755 consecutive runes in the canonical source transcript (its stored records 8–11; the transcript omits two earlier original-page records). Across all 665 contiguous 91-rune windows, the distinct-rune histogram is **19:19, 20:109, 21:244, 22:245, 23:48**. Thus **372/665** native windows have 21 or fewer rune symbols; **293/665** have top-three mass at least 31; **504/665** meet one or both conditions. Under all **301** possible starts for five disjoint 91-rune lanes inside this 755-rune author passage, **296/301** five-lane arrangements contain a ≤21-symbol lane, and **301/301** contain a lane meeting either original-impossibility condition. These 301 highly overlapping source starts are a *descriptive source-native calibration*, not 301 independent statistical trials or a universal p-value.

The completely separate solved **LP2 p57 PARABLE** contains 95 original, unencrypted GP29 runes. Its five contiguous 91-rune windows have respectively **[21,20,20,21,21]** distinct symbols and **[31,32,32,32,33]** top-three masses; both conditions hold in every window. An authentic 2014 sum-3301 order-five square was used to encrypt five genuine, disjoint 91-rune LP1 p10–13 plaintext windows, and its exact GF29 inverse recovered **455/455** runes. This nontrivial planted source matrix confirms the projected-capacity gate would expose the author-native condition when it genuinely exists.

The original data yield no row with ≤21 distinct runes or top-three mass ≥31. The dual condition rules out all **301/301** calibrated source-native five-lane arrangements. This sharply weakens the five-independent-native-messages fixed-square explanation, even if every matrix entry, scalar, key row and fixed output alphabet were secret. Genuine original English can use ≥22 symbols and top-three mass ≤30 in 91 runes, so the result **does not logically eliminate** a model whose five plaintext lanes each satisfy both restrictive output conditions. It also leaves word-order changes, per-position changing keys, per-item independent encryption, nonlinear maps, and non-native plaintext registers open. The red numbering itself has a solved-LP1 precedent as a philosophical list, so independent messages remain a stronger baseline until an original instruction selects a five-channel mixer.

## Reproduction and next decision

[Single-file, read-only Node22 CJS SFT](../sims/lp2_five_numbered_allsecret_gl5_91_native_gate_sft.cjs) · [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45263800804) asserts all five original interval lengths, enumerates every 732,541 normalized projective row, checks the complete histogram, maximum IoC and top-three-mass cap, independently reads and counts the original solved LP1 and p57 GP29 controls, and verifies an authentic-square 455/455 encrypted plaintext plant. All arrays come from the checked-in original-corpus and original solved transcriptions; no generated pseudo-English samples or fitted source phrase are used.

**Decision for #2243:** Do not allocate additional effort to unknown static 5×5 GF29 row keys or fixed per-lane monoalphabetic relabelings without an independently authored reason to expect every native lane to have unusually broad glyph diversity and unusually low top-three concentration. Seek an actual source-selected changing-state, item-private or non-GP29 operation, or an independently readable original instruction. This experiment provides no new plaintext and does not complete #2243.
