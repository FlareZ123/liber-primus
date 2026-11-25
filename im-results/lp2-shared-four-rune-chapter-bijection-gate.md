# Shared four-rune chapter-bijection gate

**Decision:** one arbitrary bijection on four-rune GP29 packets, reused across source-framed LP2 sections with an independently chosen phase per section, does not map any tested pair of original sections to the native GP29 controls. The result is an exact equality-partition obstruction, not a language-score heuristic.

## Source framing

For this test, a chapter is one of the nine visually framed LP2 sections beginning at logical pages 0, 3, 8, 15, 23, 27, 33, 40 and 54. The original archive stores logical LP2 page p as image p+17; the opening images are therefore 17, 20, 25, 32, 40, 44, 50, 57 and 71. Each opening has its own red initial, ornament or diagram. The page-to-image mapping is documented in resources/liber-primus/README.md. This is an operational source-framing choice, not a claim that the manuscript labels these sections as chapters.

The nine logical page ranges and rune lengths are:

| Section | LP2 pages | Runic length |
|---:|---:|---:|
| 1 | 0–2 | 729 |
| 2 | 3–7 | 1,145 |
| 3 | 8–14 | 1,729 |
| 4 | 15–22 | 1,903 |
| 5 | 23–26 | 1,021 |
| 6 | 27–32 | 1,433 |
| 7 | 33–39 | 1,680 |
| 8 | 40–53 | 3,008 |
| 9 | 54–55 | 308 |

The p50 table page contributes zero runes and remains inside section 8. Physical page carries are preserved within each section; there is no page-level reset.

## Tested model and exact criterion

A packet is four consecutive GP29 rune indices, interpreted as one integer in [0, 29^4). The model allows:

- one arbitrary bijection on all 29^4 = 707,281 possible packets, shared across sections;
- an independent phase 0, 1, 2 or 3 at each section opening;
- the leading phase runes and final incomplete packet to pass through unchanged.

This is deliberately generous: incomplete fringes do not constrain the map, and each section can choose its own alignment.

For aligned packet pairs (C_i, P_i), a shared bijection exists exactly when the observed relation is both a function and injective. Equivalently, for every pair of packet positions i,j across the tested sections:

C_i = C_j if and only if P_i = P_j.

If this condition holds, the partial observed map extends to a permutation of the full 29^4 packet alphabet because fewer than 707,281 values are observed. If it fails in either direction, no shared bijection exists. The test therefore checks the entire arbitrary-bijection family without fitting a substitution table.

## Original packet occupancy

The original sections are unusually sparse in repeated four-rune packets. Duplicate-pair counts by phase 0/1/2/3 are:

| Section | Duplicate pairs at phases 0 / 1 / 2 / 3 |
|---:|---:|
| 1 | 0 / 0 / 0 / 0 |
| 2 | 0 / 0 / 0 / 0 |
| 3 | 0 / 0 / 0 / 0 |
| 4 | 1 / 0 / 0 / 1 |
| 5 | 0 / 0 / 0 / 0 |
| 6 | 0 / 0 / 0 / 0 |
| 7 | 0 / 0 / 0 / 0 |
| 8 | 0 / 0 / 1 / 0 |
| 9 | 0 / 0 / 0 / 0 |

This low collision rate makes the cross-section injectivity condition discriminating: ordinary native text often repeats a four-rune packet, whereas the corresponding original packets are distinct.

## Native controls and exhaustive phase tests

Native controls were encoded with the existing source-calibrated GP29 orthography helper, without changing its normalization or tokenization. Each native stream was cut into 12,956-rune windows and aligned to the nine original section lengths.

| Source | Half-overlap windows | Half-overlap pair/phase tests | Survivors | Disjoint windows | Disjoint pair/phase tests | Survivors |
|---|---:|---:|---:|---:|---:|---:|
| Gibran | 8 | 4,608 | 0 | 4 | 2,304 | 0 |
| Shakespeare | 32 | 18,432 | 0 | 16 | 9,216 | 0 |
| Emerson | 48 | 27,648 | 0 | 24 | 13,824 | 0 |
| **Total** | **88** | **50,688** | **0** | **44** | **25,344** | **0** |

Every test considers all 36 unordered section pairs and all 16 independent phase pairs. The half-overlap windows are the denser scan; the disjoint windows provide a non-overlapping control set.

Single-section compatibility is rare and concentrated in the two shortest sections. Across the half-overlap windows, the counts of individually compatible section/phase cases (sections 1–9) are Gibran [0,0,0,0,0,0,0,0,4], Shakespeare [3,0,0,0,0,0,0,0,46] and Emerson [3,0,0,0,0,0,0,0,73]. Across disjoint windows they are [0,0,0,0,0,0,0,0,3], [2,0,0,0,0,0,0,0,22] and [1,0,0,0,0,0,0,0,41], respectively.

There are only two half-overlap phase pairs in the entire control set where both sections independently admit a bijection. Both occur in Emerson window 9, whose encoded-rune offset is 58,302, and both fail when the maps are required to be shared.

### Exact cross-section conflict certificate

The individually compatible sections are section 1 (p0–2) at phase 2 and section 9 (p54–55) at phase 0 or 3.

For phases (2,0), section 1 packet 55 at global rune offset 222 pairs ciphertext packet 529022 (NG L U R) with plaintext packet 256886 (I S P R). Section 9 packet 12 at global offset 12,696 pairs a different ciphertext packet 698184 (EA E C N) with that same plaintext packet 256886. A bijection cannot map two distinct ciphertext packets to one plaintext packet.

For phases (2,3), section 1 packet 156 at global offset 626 pairs ciphertext packet 257621 (I T N X) with plaintext packet 413207 (T IA N S). Section 9 packet 69 at global offset 12,927 pairs a different ciphertext packet 463082 (E EA E I) with that same plaintext packet 413207. This is a second independent injectivity conflict.

Thus the one candidate cross-section pair where both private maps survive cannot share a bijection. The other 50,686 half-overlap and 25,344 disjoint tests also fail; no full nine-section shared map can survive if no two-section restriction survives.

## Positive planted control

The test was calibrated with a known compact shared bijection:

cipherBlock = (37 * plainBlock + 12345) mod 707281.

The nine chapter phases were independently set to [1,3,0,2,1,2,3,0,1]. Fitting the affine parameters from the first two complete blocks in section 1 recovered (37,12345) exactly. The recovered map predicted all 432 complete blocks in held-out section 3 (p8–14), and its inverse recovered all 3,233 transformed packets across all nine sections. All 36 section-pair compatibility checks passed. Leading and trailing fringes remained unchanged.

This validates that the equality test detects a genuinely shared compact bijection with independent chapter phases; it is not a broken inverse or an accidental failure to handle fringes.

## Interpretation

Retire the model of one shared arbitrary four-rune bijection across these visually framed sections for the tested native GP29 prose. The result is stronger than a failed affine or Hill-key search because it excludes every bijection consistent with the tested packet equality patterns.

It does **not** exclude chapter-private maps, changing/stateful maps, non-bijective transforms, a different block width, non-native-language plaintext, or a new source-selected receiver. The p15 4×4 table motivates testing four-rune packets but does not supply a key schedule; no matrix orientation or key search was performed. Since the shared model fails the native controls, no arbitrary substitution map was fitted to the original.

## Reproduction

Run from the repository root:

    node sims/lp2_shared_four_rune_chapter_bijection_sft.cjs

Inputs are resources/liber-primus/lp2-corpus.json, the Gibran/Shakespeare/Emerson control texts, and sims/lp2_native_gp_source_orthography_sft.cjs. The script emits the chapter collision table, all control counts, the two exact conflict certificates, and the positive planted-control result as JSON.

Pinned input blobs at the tested repository snapshot:

- lp2-corpus.json: 054f2a0f780b7d46901acbe3d9bf4f0ac1801165
- Gibran control: df260a07d56bf5998d40a6360b6132c35c252d10
- Shakespeare control: 94c677ad9dd50771c6670e0c4e4dad9052b46d85
- Emerson control: a92be8ba5b3511a003a22ba31523c14397aaa83a
- Native GP29 orthography helper: ad49a0507b801f9860f0294bbae2afa47d1cbc31
- LP2 image/page mapping README: 827470b58097b3b1280b63258eb666c5736371d1
