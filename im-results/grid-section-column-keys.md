# Eight LP2 base-60 table columns as section-continuous 256-bit keys

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

## Independently audited five-cell key overlay and fresh original-ciphertext test

Agent 9 (10 November 2026) compared all 256 source cells against [an independently corrected historical master transcription](https://github.com/pnotisdev/cicada3301/blob/main/work/ref/lp_master.txt). The five differences at indices **45, 50, 165, 172 and 246** change key columns **2, 4, 5 and 6**. Their proposed corrected bytes are **81, 21, 47, 174 and 224**. The original raw repository transcription is intentionally preserved; `sims/grid_section_column_keys.cjs` exposes a verified `correctedGridColumns` transformation and optional `LP2_GRID_FIVE_CORRECTIONS=1` environment gate. This leaves older tests reproducible.

The new [source correction inverse](../sims/grid_five_cell_corrected_inversion.cjs) fits all 16 direct AES/ChaCha/sign/reducer variants and exact 8! assignments on the first **300 symbols of each of eight sections**, then holds the model fixed on the next **300 symbols each** while maintaining the stream pointer. The same source and model are fed an English GP plant, then 40 byte-shuffled-column controls.

| Matched original-input condition | 2,400 training runes, weighted GP IoC | 2,400 held-out runes, weighted GP IoC |
| --- | ---: | ---: |
| Earlier repository 256-byte transcription | 0.03601449 | **0.03430881** |
| Five-cell independently corrected overlay | 0.03593645 | **0.03388517** |
| 40 column-preserving byte-order shuffles of corrected source | n/a | mean **0.03440677**, range 0.03367893–0.03517559 |

**38/40 shuffled sources outscore the corrected source on heldout** (add-one upper-tail 39/41 = **0.95122**). The language-source control encrypts **12,956/12,956 symbols**, retrieves all eight true column assignments and the correct AES-CTR forward/mod29/subtractive inverse, and re-decodes every original planted symbol. An additional repair-perturbed planted control recovers the true mode and all columns, with 344 synthetic collision repairs. This search is powered for its specified additive no-key-pointer-drift model and gives **no authentic LP2 plaintext**.

The more expressive hidden-skip, unknown-global-alphabet original-source test with the corrected source is consolidated in [outer-alphabet-skip-alignment.md](outer-alphabet-skip-alignment.md). Both were executed in the same [successful manual GitHub Actions run 42812635906](https://github.com/FlareZ123/liber-primus/actions/runs/42812635906). The corrected cells are a useful source-reconciliation lead, while their failure in these two original inverse architectures is a scoped cryptanalytic negative. Further families need independently justified cipher state, key clock or source derivation.

**Limits:** A source-independent output replacement is an illustrative anti-repeat channel; a cipher that consumes additional key draws would desynchronize these direct streams. The screen does not test counter/IVs derived from page identifiers, altered section cuts, external KDFs, an unknown rune permutation, mixed algorithms per section, plaintext registers unlike the Shakespeare plant, or any key schedule with hidden skips. The 100 controls randomize order within each actual 32-byte column and run the complete 16-mode/max-assignment search. The small fixed-order p=0.069 is insufficient to identify a real key, particularly amid exploratory choice of partition and cipher family.

**Reproduce:** 'node sims/grid_section_column_keys.cjs' from the repository, with Node 22 and no extra dependencies. CI file: '.github/workflows/grid-section-column-keys.yml' is manual-dispatch only; it never runs on ordinary commits.
