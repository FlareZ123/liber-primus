# Eight LP2 numerical-grid columns as section-continuous 256-bit keys

**Classification: bounded, reproducible negative. No LP2 plaintext or key recovered. Agent 45, 2026-11-10.**

## Frozen inversion hypothesis

The LP2 page-49–51 numeric table is **32 rows × 8 columns = eight 32-byte candidate keys**. Prior direct key tests covered the same columns with *page-reset* AES-256-CTR and ChaCha20, but the manuscript also contains section boundaries. The additional hypothesis here uses one independent column key per **text section**, running each cryptographic counter stream continuously across page boundaries, without resets at each page. It could reveal natural-English rune distribution even if none of the earlier page-reset decodes did.

The canonical LP2 source has nine nonempty '$'-delimited text sections; one is a two-word bridge. This experiment freezes eight consecutive groups by merging sections 3 and 4 (zero-indexed), retaining all **12,956 runes**: group lengths **729, 1,145, 1,729, 1,903, 1,021, 1,524, 1,589, 3,316**. It tests that one construction only, not every plausible section grouping.

For each of eight 256-bit vertical column keys, the exhaustive test uses:

- AES-256-CTR or ChaCha20, 16-byte all-zero IV/counter;
- forward or reversed 32-byte key;
- output byte mapped to GP key value by 'byte % 29' or 'floor(byte × 29 / 256)';
- subtractive or additive GP arithmetic, with the same mode/direction/reducer/sign across the eight sections;
- either the fixed identity assignment of column to section or **all 8! one-to-one assignments** (maximum-weight eight-by-eight matching, solved exactly by dynamic programming).

The score is the **runecount-weighted mean decoded index of coincidence** across all eight groups. It is a key-recovery diagnostic that must ultimately be followed by actual plaintext; no short snippets are accepted. The previously used repository fixture records cells **45=107, 50=47, 165=18, 172=148, 246=198** (zero-based, row-major). A separately image-audited transcription instead yields **45=81, 50=21, 165=47, 172=174, 246=224**. The original experiment here used the first version. The tested opt-in alternative and its original-input results are documented below; neither reading is authenticated as the LP2 encryption key.

## Executed result

Successful one-time GitHub Actions [run 42752848919](https://github.com/FlareZ123/liber-primus/actions/runs/42752848919), Node 22, full original LP2 transcription and table.

| Input / search | Best weighted decoded IoC | Interpretation |
|---|---:|---|
| Real LP2, **best of 16 modes and optimal 8! assignment** | **0.03474205** | Random-rune baseline approximately 0.03448276 |
| Real LP2, best of 16 modes in **fixed column order** | **0.03464070** | No legible plaintext |
| Replaced-key controls, optimal assignment, **100 byte-order shuffles** | **0.03476320** mean (maximum 0.03487817) | Real is below null mean; **empirical p=0.81188** |
| Same controls, fixed assignment | **0.03458847** mean | Empirical p=**0.06931**, selected best of 16 modes |
| Synthetic true-key control | **0.05851914** | Full correct key mode and all eight column assignments recovered |

The real winning mode for freely assigned keys is AES-256-CTR, forward key, 'byte % 29', arithmetic sign +; the recovered column assignment **[3,4,7,6,2,5,0,1]** has scores near chance on every group (0.034616–0.034862). The fixed-column real winner uses AES-256-CTR, reversed keys, scaled 29 reduction and sign +. Neither produces a plaintext.

The positive control uses Shakespeare GP-encoded natural-language text with precisely the same eight lengths, encrypted under the *actual eight columns* in identity order using AES-256-CTR, zero IV, forward key, modulo-29 reduction and GP sign convention C=P+K. A seeded source-independent 81%-chance correction of would-be identical adjacent ciphertext runes changed **338** ciphertext symbols. Recovered mode: AES-256-CTR, forward, modulo, sign −, assignment **[0,1,2,3,4,5,6,7]**, rank one; weighted IoC **0.05851914**. The true mode's fixed identity score equals the fully optimized winner. This demonstrates detectability of the stated no-key-pointer-drift mechanism under a deliberately controlled English-like source.

## Source-byte ambiguity, independent five-cell audit, and frozen original inverses

The numeric manuscript grid has **256 printed two-character tokens**. The conventional base-60 byte interpretation is only one serialization: deleting lowercase `f` from the digit alphabet and decoding in base 59 yields a second byte-sized sequence, different at **220/256 positions**. This was already proposed historically; the exact token-support ambiguity is documented in [the grid-codec source study](lp2-grid-numeric-codec-ambiguity.md). The original source tokens remain unchanged.

An independent [historical image-audited transcription](https://github.com/pnotisdev/cicada3301/blob/main/work/ref/lp_master.txt) changes source-cell indices **45, 50, 165, 172, 246**. Their conventional base-60 byte values change **107→81, 47→21, 18→47, 148→174, 198→224**, affecting columns 2, 4, 5 and 6. The corrected *printed tokens* are converted into both number bases in the new test; they must not be treated as identical corrected byte values in bases 60 and 59. `sims/grid_section_column_keys.cjs` now accepts opt-in `LP2_GRID_RADIX=59` alongside `LP2_GRID_FIVE_CORRECTIONS=1`, preserving the earlier uncorrected base-60 default.

The earlier [five-cell paired original inversion](../sims/grid_five_cell_corrected_inversion.cjs) exhaustively fitted 16 AES/ChaCha/sign/reducer key configurations with optimal **8!** column assignment on the first **8×300** original GP runes, then scored the next **8×300** without refitting. The base-60 canonical source gave heldout IoC **0.03430881**; the independently corrected base-60 source gave **0.03388517**, below 38/40 shuffled-key heldouts (add-one upper p **39/41=0.95122**). A GP-English source-key control recovered all eight assignments and 12,956/12,956 plaintext runes. [Successful CI 42812635906](https://github.com/FlareZ123/liber-primus/actions/runs/42812635906).

The strengthened [four-serialization original inverse](../sims/grid_base59_original_inverse.cjs) tests base 60 and 59, each uncorrected or with the five audited token fixes. It uses **the same 16 direct stream settings and exact 8! column assignment**, selected only on the first 300 symbols of each of the eight groups, then freezes the model on the second 300 and a further **third 300** from seven groups with at least 900 runes. Four source variants are compared on the training interval only. The original source measurements are:

| Printed-source interpretation | Train IoC, 2,400 GP runes | Second IoC, 2,400 GP runes | Third IoC, 2,100 GP runes |
| --- | ---: | ---: | ---: |
| Base 59, original printed tokens | **0.03602843** | **0.03477982** | **0.03480172** |
| Base 60, original printed tokens | 0.03601449 | 0.03430881 | 0.03426342 |
| Base 60, five audited tokens | 0.03593645 | 0.03388517 | 0.03413282 |
| Base 59, five audited tokens | 0.03590858 | 0.03414716 | 0.03432075 |

The top training variant, **uncorrected base 59**, freezes AES-256-CTR, reversed key bytes, scaled `floor(29*byte/256)`, minus sign and column assignment `[3,1,4,5,0,7,6,2]`. Its third interval **0.03480172** is only modestly above the uniform-GP reference **1/29≈0.03448276**. **120** fully retrained control searches jointly shuffle the printed token positions while retaining the relationship among the four serializations; **26/120** matched or exceeded the authentic candidate on its third interval, add-one p **27/121=0.22314** (null third mean **0.03450971**). This is a family-selected conditional control, not a manuscript-wide p-value.

A separate exact **base59 five-token-corrected AES-256-CTR GP-English positive** correctly recovered the encryption mode, all eight column assignments and **12,956/12,956 planted plaintext GP runes**. The known-key native GP holdout IoC was **0.06154961**; using the wrong base-60 key instead gave **0.03406076**. These controls demonstrate source-interpretation sensitivity, while the original result supports **no recovered key or plaintext**. The independent shared arbitrary-outer-alphabet and hidden-skip original inverse under corrected base 59 produced original fit **−4.52269** versus frozen heldout **−5.07467 nats/rune**; four corresponding planted controls recovered 8/8 key assignments and 29/29 symbols. That stronger registered interpretation is likewise unconvincing on the authentic manuscript. [Joint successful manual CI 42836352456](https://github.com/FlareZ123/liber-primus/actions/runs/42836352456) · [shared-alphabet method and earlier null](outer-alphabet-skip-alignment.md).

The claim is deliberately finite: neither radix in these direct AES/ChaCha section-continuous source-grid models explains LP2. The radix interpretation itself remains unresolved. A new attack needs a source-derived key transformation, recoverable state, or independently specified cipher architecture rather than another direct static-key permutation sweep.

**Limits:** A source-independent output replacement is an illustrative anti-repeat channel; a cipher that consumes additional key draws would desynchronize these direct streams. The screen does not test counter/IVs derived from page identifiers, altered section cuts, external KDFs, an unknown rune permutation, mixed algorithms per section, plaintext registers unlike the Shakespeare plant, or any key schedule with hidden skips. The 100 controls randomize order within each actual 32-byte column and run the complete 16-mode/max-assignment search. The small fixed-order p=0.069 is insufficient to identify a real key, particularly amid exploratory choice of partition and cipher family.

**Reproduce:** 'node sims/grid_section_column_keys.cjs' from the repository, with Node 22 and no extra dependencies. CI file: '.github/workflows/grid-section-column-keys.yml' is manual-dispatch only; it never runs on ordinary commits.
