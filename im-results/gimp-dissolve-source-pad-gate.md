# GIMP Dissolve source keys: fixed-stream and original-glyph raster inverses

**Classification (10 November 2026): source-linked, bounded negative original-input tests. The original 27×27 generator and 8,228 strictly registered original source-image runes have been inverted under their separately specified finite families. No unknown LP2 plaintext, actual cipher key, or intended continuation has been recovered.**

## Historical input and cipher proposal

Historical GIMP Dissolve rendering uses a deterministic GLib `GRand` (MT19937) generator initialized from **314159265**, to fill a fixed 4,096-element row-seed table. A separate generator initialized with the selected row seed determines individual pixel visibility. **The decimal seed is not an author-selected π clue:** a GIMP v1.2-derived source header explicitly labels `RANDOM_SEED = 314159265` and `RANDOM_TABLE_SIZE = 4096`, and GIMP 3.2.4's [`gimpoperationdissolve.c`](https://fossies.org/linux/gimp/app/operations/layer-modes/gimpoperationdissolve.c) hard-codes the same seed when filling the same 4,096-entry table. The GIMP 2.8 manual describes Dissolve as drawing a random pixel pattern in partially transparent regions. Thus the number is inherited software behavior, not evidence of a puzzle-chosen π key. This remains a **software-artwork generation fingerprint**, not a demonstrated Liber Primus encryption key. Sources: [GIMP v1.2-derived constants](https://sources.debian.org/src/kimageformats/5.54.0-1/src/imageformats/gimp_p.h), [GIMP 2.8 layer modes](https://docs.gimp.org/2.8/en/gimp-concepts-layer-modes.html), GIMP [`gimpoperationdissolve.c`](https://fossies.org/linux/gimp/app/operations/layer-modes/gimpoperationdissolve.c), [GLib `grand.c`](https://github.com/GNOME/glib/blob/main/glib/grand.c). The underlying 27×27 rune grid is the unmodified first **729 runes on LP2 physical pages 0–2** (page lengths 262, 266, 201), read through [the canonical original corpus](../resources/liber-primus/lp2-corpus.json).

Three specified historical-key families and source-state key-independent theorems for stationary and 79-phase public keys have been tested. The first two derive from the GIMP generator clock on the 27×27 source ciphertext, while the third samples its historical two-dimensional field at original scan glyph coordinates:

1. **27×27 row-specific rendering registers.** Fill 4,096 seed values from MT19937(314159265), seed each grid row with entry `seed[row]`, and generate its 27 pixel positions. For each draw, derive an additive GF29 pad by either `g_rand_int() %29`, `g_rand_int_range(0,255) %29` or `g_rand_int_range(0,29)`. Test either sign of subtraction and both direct GP ciphertext values and first differences `c[i]-c[i-1]` (12 declared variants). No key tuning to ciphertext is allowed.
2. **Single continuous master register with collision-consumed draws.** Start one MT19937(314159265) across all 729 original GP ciphertext positions, not resetting at pixel rows. Test the same three byte-to-29 reductions and both pad signs (6 declared modes, including raw/range29 numerical equivalence over this prefix). A Viterbi decoder may consume one extra draw only where the first proposal would exactly equal the previous observed ciphertext rune. The latent skip count is capped at 30; its score includes an explicit 3.5-natural-log penalty per extra draw. Unseen GP training prose is the independent first 2,200 GP runes from the source-normalized solved LP1 reference. There is no fitted initial seed, free IV, nonce, source symbol permutation or arbitrary pad offset.

The second candidate permits an exact reversible mapping under a recovered skip witness. The decoder computes maximum native-GP trigram score and re-enciphers **every one of the 729 original cipher runes exactly**, including the rejected-draw state. Such reconstruction is an implementation consistency condition; fluent independently justified plaintext is still required to identify a historical cipher.

3. **Original printed-glyph 2D GIMP pixel register.** For every scan line that unambiguously registers all its rune glyphs to the published transcription, use the glyph's first dark column as x and its ink-center or original printed-row peak as y. Generate the historical 4,096-row GIMP Dissolve field from the same immutable seed 314159265, project pixel bytes either by remainder or scaling into 29 direct-GP or 28 nonrepeat ranks, and apply both additive signs. This gives **16 source-derived, reversible models** on the 8,228 exactly registered symbols, with independently withheld later physical pages. The ciphertext-derived glyph coordinates are public side state supplied by original scans; no key parameter is fitted to the ciphertext.

## Fixed source-generator control vectors

The first eight original row seeds are:
`[3721122731,618219707,807213306,3144837749,3447982176,3230631767,755972506,1398685501]`.

The first eight `GRand(seed[0])` raw outputs are:
`[505524582,4277517655,1702989131,912900261,1432505218,4108960502,2270003630,316039421]`.

The same generator's first eight integer-range `[0,255)` outputs are:
`[87,10,191,6,133,152,5,71]`.

These reference vectors were checked against the system's native GLib implementation, not merely the script under test. Both executable single-file tests assert them or the exact source-derived pad.

## Printed-grid co-generation check

The original 32×8 table on physical pp49–51 represents 256 bytes under the repository's radix-60 transcription (corrected zero-based byte indices 45, 50, 246 = 107, 47, 198). A separate source-constrained possibility is that the table itself is a contiguous extract from the same historically documented **GIMP Dissolve** random generator, rather than cryptographic key material generated independently. This demands a **five-consecutive-byte** equality somewhere under a source-specified projection, before considering any decipherment.

[Single-file reproducer](../sims/gimp_table_grid_cogeneration.cjs) exhausts all **4,096 historical GIMP row seeds**, each row's first **4,096 32-bit outputs**, and five static byte representations: low and high output bytes, the GLib-style zero-to-254 range residue, and the complete little- or big-endian 32-bit byte streams. The exact scan covers 16,777,216 word outputs (plus both full-byte expansions), all 252 complete original grid five-byte windows and every possible contiguous stream start. It finds **16 four-byte matches, all ending at four bytes**, and **zero five-byte matches**; counts by projection are 2/0/1/5/8. Historical generator output vectors are asserted, and an independently planted eight-byte grid segment is recovered by the identical scanner.

**Scope:** This excludes a *literal contiguous extract* of at least five original printed-grid bytes from these five GIMP row-output representations within the first 4,096 samples of a row. The occasional four-byte coincidences do not identify a row, key or intended source relation. It does **not** exclude 2D coordinate sampling, noncontiguous extraction, a keyed transform, changed seeds, a different codec or any original-rune cipher. In particular, no LP2 unknown plaintext is recovered. This source-to-source test is separate from the existing direct cipher-pad and pixel-field analyses below.

## Direct and first-difference original results

| Statistic | Value |
| --- | ---: |
| Number of fixed-source decoding variants | 12 |
| Best original LP2 GP rune IoC | **0.0351829240718** |
| Best projection, sign, transform | raw32%29, −1, first difference |
| Matched inventory-preserving 27×27 shuffles | 500 |
| Nulls whose own best-of-12 IoC equaled/exceeded original | 122 |
| Family-selected plus-one conditional tail | **123/501 = 0.245509** |
| Null best-of-12 median | 0.034994498 |
| Original-register solved GP plant IoC after exact recovery | 0.061136737 |
| Original-register planted rune recovery | **729/729** |

The pre-selected generator projections do not raise original LP2 output far above the random GP baseline of `1/29`; the family-selected null test gives no evidence of natural-language key recovery.

## Original cipher with collision-consumed extra draws

The model's best original-rune score among six modes is **−4.749562465 nats/rune**, versus independently planted source-native controls around **−2.59 to −2.62 nats/rune**. The original top-mode transcript starts `PGGONTHJSFTHEJSAERLXTH...` under GP transliteration and remains unrecognizable. Viterbi infers 16 extra draws in its top original mode. Every original mode returns **729/729 exact forward re-encryption**, but its plaintext scores remain far from the true-key planted controls.

| Mode | Original trigram log-score/rune | Original inferred skips | Plant correct runes /729 |
| --- | ---: | ---: | ---: |
| raw, C=P−K | −4.749562465 | 16 | 728 |
| range29, C=P−K | −4.749562465 | 16 | 728 |
| byte255, C=P−K | −4.749711797 | 14 | 727 |
| byte255, C=P+K | −4.756768099 | 12 | 729 |
| raw, C=P+K | −4.796001145 | 9 | 727 |
| range29, C=P+K | −4.796001145 | 9 | 727 |

The corresponding source-GP planted plaintext in each variant used real skip-induced ciphertext generation, with 16–23 true skipped draws. The decoder recovered the original plant within two GP runes in all six cases. That positive recovery establishes the selected model's practical decryptability when its key generator is historically correct.

## Full original-JPEG glyph coordinate test: 8,228 original runes

The source-only registrar admitted **31** whole original physical pages: 1, 4, 5, 7, 9, 11–13, 16–21, 24, 26, 28–31, 34–35, 38, 41–44, 46–48, 52. It rejected 24 others rather than guess glyph correspondence when printed-line counts or individual glyph counts mismatched. This produces **4,220 early** runes (pages below 28) and **4,008 untouched later** runes (pages 28 or greater). The exact JPEGs and canonical rune sequence have to agree in full before a page is admitted.

For each source-observed glyph, the coordinate rule fixes x at the leftmost accepted ink column and y at either the central ink row or the independently measured printed-line density peak. An original GIMP 2.8 MT19937 field with each row separately seeded yields byte values 0–254 via the historical range-255 reduction. The byte is converted with either `byte mod M` or `floor(M × byte /255)`. The two exactly reversible rune register families are:

- **Direct GP29:** `C=(P+sK) mod29`, where s is +1 or −1.
- **GP28 predecessor exclusion:** Page-initial `C₀=(P₀+sK₀) mod29`. For all subsequent glyphs, plaintext EA (index28) emits `Cᵢ=Cᵢ₋₁`; otherwise `Cᵢ=(Cᵢ₋₁+1+((Pᵢ+sKᵢ) mod28)) mod29`. The decoder takes observed equality as a hypothetical transparent EA marker and otherwise inverts the unique one-of-28 nonzero step.

**Successful Windows manual CI run [42821230526](https://github.com/FlareZ123/liber-primus/actions/runs/42821230526)**: all **16×8,228 = 131,648** independently Gibran-derived synthetic GP symbols are recovered exactly, and each model re-enciphers all original rune positions exactly under its own publicly derived key. Model selection used only the 4,220 early original symbols; the 4,008 later symbols were untouched until scoring. Shakespeare's independently encoded original-language prior has mean unigram log-likelihood **−2.96081 nats/rune** and synthetic Gibran source has **−2.96194**, versus **−4.26892** for a uniform 29-symbol stream.

| Frozen original-source model | Early GP mean log score | Late GP mean log score | Late rune IoC |
| --- | ---: | ---: | ---: |
| Top early-trained: GP28, ink-center y, scaled 28-byte, sign+ | **−4.1977085** | **−4.2300788** | **0.0352569** |
| Next early-trained: GP28, ink-center y, scaled 28-byte, sign− | −4.2106692 | −4.2144919 | 0.0351939 |
| Representative direct29: printed-peak y, scaled 29-byte, sign− | −4.2202265 | −4.2807725 | 0.0344663 |
| Source control: independent author Gibran GP | −2.96194 overall | −2.96194 overall | 0.060521 overall |

The top early-selected model's heldout mean log score **−4.23008** and IoC **0.035257** are close to uninformed random-GP output; its transcript is not readable. None of the other 15 fixed models produces convincing native-GP plaintext. This is a **bounded original-input failure for these exact GIMP raster key projections**, not an exclusion of non-GP plaintext, changed glyph clocks, hidden images, or a cipher with unrelated source-derived state. The positive source plants validate algebraic inversion against *fixed observed original-JPEG coordinates*: they do not regenerate a hypothetical ciphertext JPEG after encrypting plaintext.

Run `python sims/gimp_fullglyph_source_inverse.py` from the repository root with Python 3.11+, NumPy, SciPy and Pillow; the original image files and control prose are tracked inputs. This is a new use of **all strictly registered glyphs**, extending the earlier first-glyph raster experiment `sims/gimp_dissolve_printed_glyph_2d_source.py` and earlier generator-only first-729-rune tests. The single pre-existing on-demand image-width workflow hosts the Windows test; no commit-triggered workflow was introduced.

## Key-independent exclusion of every stationary GIMP-byte permutation row

The original source raster supplies a stronger falsifiable invariant than the finite 16 additive projections above. Let `sᵢ` be the original GIMP byte value (0–254) at each strictly registered cipher glyph. Permit an arbitrary, **completely unknown and unrestricted** secret permutation `π_s` of the GP29 alphabet for every distinct byte s, and assume `Cᵢ=π_{sᵢ}(Pᵢ)`. Among all original index pairs with `sᵢ=sⱼ`, we must then have `Cᵢ=Cⱼ` if and only if `Pᵢ=Pⱼ`, independent of all **(29!)²⁵⁵** possible row keys. The conditional equal-pair statistic `T=Σ_s Σ_g binom(count[s,g],2) / Σ_s binom(count[s],2)` is therefore unchanged by every such cipher.

A separate test uses the **exact nonzero-step rank GP28** from the predecessor-exclusion cipher: omit page-initial IV glyphs and the original repeated-output EA markers, compute `Rᵢ=(Cᵢ−Cᵢ₋₁−1) mod29` for remaining glyphs (values 0–27), and allow a different arbitrary secret 28-permutation for every original GIMP byte. The same pair statistic is key-independent in that register. **All key-dependent projections, signs and source-language scoring are irrelevant to this test.**

| Public original-source state and hidden alphabet | Original equal rune pairs / within-state pairs | Original rate | Minimum across 300 Shakespeare + 300 Gibran GP windows |
| --- | ---: | ---: | ---: |
| Ink-center y; 255 byte-state GP29 bijections | 4,630 / 133,494 | **0.0346832** | **0.0565868** |
| Printed-line peak y; GP29 bijections | 4,688 / 133,259 | **0.0351796** | **0.0566416** |
| Ink-center y; 255 GP28 nonrepeat-rank bijections | 4,575 / 130,738 | **0.0349937** | **0.0578944** |
| Printed-line peak y; GP28 nonrepeat-rank bijections | 4,797 / 130,679 | **0.0367083** | **0.0572625** |

Source reference windows are contiguous authentic GP-encoded prose, with 300 random 8,228-symbol (or GP28 non-EA 8,146-symbol) starts in each independent source author, exactly the original observed 255-byte state sequence frozen. No window out of **600 per source/register variant** has an equality rate at or below the original. The original 31 source pages contain **8,228** GP29 glyphs; the GP28 rank test contains **8,146** admitted noninitial, nonrepeating steps. The blind planted controls encrypt the independent Gibran GP source through 255 **independently sampled unknown permutation rows**, invert **8,228/8,228** GP29 or **8,146/8,146** GP28 plant symbols, and verify key-independently identical pair counts. [Windows CI 42822306484](https://github.com/FlareZ123/liber-primus/actions/runs/42822306484) (seed `0xC1CA3301`) supplies all source counts and controls.

### Additional 79-phase hidden rows, without a key search

The known source relationships `12,956 = 164×79` and `p₂₂=79` motivate a substantially more permissive **original-source byte plus public phase79** key class. Let the fixed secret permutation be indexed jointly by the original GIMP source byte `b∈[0,254]` and an independently specified `i mod79` clock. Grant the cipher **20,145 entirely independent and arbitrary secret permutations**, one for every possible `(b, phase)`, and test both absolute original-cipher rune position and page-local rune position. Unlike a direct additive key, this hypothesis leaves *all* per-state alphabet orderings unknown; the equal-pair invariant still holds within joint byte-phase states. Original global offsets include **all intervening runes on the 24 source pages where pixel registration failed**, and the page-local clock genuinely resets per physical manuscript page.

The resulting source-state equality test considers approximately 1,650–1,840 original same-state symbol pairs, with **8,228 original GP29 symbols** or **8,146 original GP28 nonzero steps**, rather than the ~130,000 pairs under byte-only state. Early/late language fitting is unnecessary, because every arbitrary secret permutation disappears exactly from the equality statistic.

| Source coordinate and original rune register | 79-phase clock | Original equal pairs / joint-state pairs | Fewest equal pairs among 600 native-GP prose controls |
| --- | --- | ---: | ---: |
| Ink-center, direct GP29 | Global | 59 / 1,674 | 70 |
| Ink-center, direct GP29 | Page reset | 67 / 1,840 | 82 |
| Ink-center, predecessor GP28 | Global | 53 / 1,654 | 71 |
| Ink-center, predecessor GP28 | Page reset | 49 / 1,740 | 73 |
| Printed-peak, direct GP29 | Global | 67 / 1,699 | 75 |
| Printed-peak, direct GP29 | Page reset | 62 / 1,693 | 67 |
| Printed-peak, predecessor GP28 | Global | 67 / 1,669 | 72 |
| Printed-peak, predecessor GP28 | Page reset | 52 / 1,648 | 71 |

All **eight** source-fixed original registers have **0/300** Shakespeare and **0/300** independent Gibran contiguous source windows with a pair-equality count as low as original, under their *same* original byte+phase labels. Every blind synthetic source control using independently sampled and hidden permutations for **each occupied original byte+phase state** recovers all **8,228 or 8,146** plaintext symbols exactly and confirms unchanged pair-equality counts. [Successful Windows CI run 42823533594](https://github.com/FlareZ123/liber-primus/actions/runs/42823533594), with all eight original and control histograms in its execution log.

This is a stronger **conditional impossibility for source-native GP prose** even after permitting a different secret lookup alphabet per every one of 79 public clock phases and every one of the 255 source pixel bytes. It does not exclude a *secret* unknown phase, changing secret per-book state, segmentation that resets at other events, or a ciphertext encoding whose internal register is unlike known GP prose. The prime79 hypothesis is clue-motivated but was retrospectively noticed from the manuscript; the finite language-control tail is conditional on that source definition and should not be interpreted as an independent cryptographic discovery probability.

There is also an **exact language-independent capacity bound**: a single plaintext rune can occur at most `Σ_s max_g count[s,g]` times, since each byte-state permutation maps a given plaintext rune to only one observed glyph per s. For both direct GP29 orientations the observed maximum is **936 or 933 of 8,228** (11.38% or 11.34%); for the two nonrepeat GP28 orientations the maxima are **949 and 956 of 8,146** (11.65% and 11.74%). This capacity limits any plaintext character's frequency within the specific register, regardless of symbol order or secret permutations. For comparison Shakespeare/Gibran source control windows have a mean GP E count near 960–968, though their finite minima are lower than the capacity; therefore **the exact bound alone does not exclude every normal prose window**. The pair-equality gap is the much stronger reference-language discriminator.

This excludes **stationary fixed-public-GIMP-byte lookup tables** as original-Cicada GP prose encoders under the sampled position/state model, across all secret bijective lookup keys. It does not exclude a hidden evolving register, different source coordinate/state definition, alternate plaintext alphabet, binary intermediate, or different manuscript segmentation. The synthetic plant keeps the original source-image coordinates fixed rather than re-typesetting arbitrary synthetic ciphertext, so it proves the algebraic invariant and keyed inversion only; it is not a model of the complete historical rendering process. The original key or unknown plaintext remains unrecovered.

## Reproduction, interpretation, and limits

Run these two independent CommonJS SFTs with Node 22 from the repository root:

```text
node sims/gimp_dissolve_source_pad_gate.cjs
node sims/gimp_seed_stream_keyskip_inverse.cjs
```

The programs load `resources/liber-primus/lp2-corpus.json` and `resources/liber-primus/lp1-plaintext-reference.txt`. Their fixed runes, seed, reference vectors, clocks, signs, GP training text, and selection statistics are visible in code; no outside dataset is required. The first reproducer performs 500 source-inventory shuffles with seed `0x3411317`. All six keyskip candidates are inverted and checked against the **authentic original ciphertext** with complete forward re-encryption.

The key-dependent negative is confined to the declared generator-stream and printed-raster uses of this historical software seed, exact GP29 additive/first-difference and GP28 predecessor-step transforms, native-GP language expectation, and the specified original-image glyph coordinates and collision-consumed draw state. It does **not** rule out other artwork-derived bytes, encrypted non-GP intermediates, semantically meaningful illustrations, unpublished historical source material or a different key schedule. Most importantly, the legacy GIMP random generator could have been used solely to render an image. No repeated broad generator sweep is warranted without a source clue fixing a different key/clock.

**Status: bounded negative; belongs in supporting results, not the verified decryption index.**
