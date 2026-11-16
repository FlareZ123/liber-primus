# Direct GF(59) / GP29 correspondence of the 256 source events and 256 printed cells

**Agent 8, 16 November 2026. Classification: one completely specified source-object relation rejected on original inputs. No recovered unknown LP2 plaintext, creator key or destination.**

## Distinct, low-entropy hypothesis

The original manuscript contains a 29-symbol Gematria Primus alphabet, a printed 32×8 table of 256 alphanumeric two-glyph cells, and a physically audited series of 225 red rune glyphs plus 31 thirteen-dot marks in original page/ink order. The ordinary 60-symbol table alphabet never uses lowercase `f`; an independently established 59-symbol alternative can omit that digit. The further speculation tested here is that the table records those 256 red/mark events as **a compact signed representation over the prime field GF(59)**.

This is testable because the multiplicative group of the prime field has 58 elements, and **58 = 2 × 29**. The source's smallest prime weight (F=2) generates all 58 nonzero residues modulo59: `2^29 = -1 (mod59)`, `2^58 = 1`, and 58 powers are distinct. Thus a nonzero field element has a **unique** representation `(-1)^s · 4^r`, with sign `s ∈ {0,1}` and `r ∈ 0…28`. This is a genuinely reversible GP29-plus-sign packing rule once the register is specified. Zero could act as the separate thirteen-dot marker, making 59 total symbols (29×2+1).

The competing explanation is that the table is unrelated random-looking printed data, and its unused `f` is an expected omission in 256 observed byte values. **Neither the 2013 signed BASE29/DH material nor the LP2 images instruct a reader to use GF(59), assign red runes to the table, choose 2 as generator, or treat thirteen dots as field zero.** The direct relation below is an exploratory, frozen diagnostic and should not spawn another tunable key search.

## Exact original-input falsification

The input events use the pre-existing physically audited source derivative `lp2-ink-annotations.json`, `lp2-corpus.json`, and all 256 original row-major table entries in `base60-grid.json`. Events are sorted by physical page and fractional rune position, with 13-dot marks inserted before the following rune. Their fixed first 13 source rune indices are `15,8,18,3,6,19,27,0,15,26,18,21,5`; the original source-correct heading has 13 red runes before the first large mark. The 256 printed table byte values use the existing conditional conventional radix60 reading, then take residue modulo59. No image, source token, or individual rune is adjusted.

Under the frozen model, all original mark positions **must** correspond to zero residues, and every original red rune of GP index `r` must correspond to one of `+4^r` or `-4^r` modulo59. The sign is completely free at every position, so no sign-key assumption can invalidate this necessary condition.

| Independently checkable condition | Exact original result |
| --- | --- |
| Original red runes / 13-dot marks | 225 / 31 |
| Original table modulo59 zeros, 0-based positions | 22, 51, 57, 75, 92, 192, 219, 229 |
| Table zeros coinciding with original 13-dot marks | **2 / 31** |
| Table zeros at original red-rune positions (undefined log) | **6 / 225** |
| Field59 half-log `(15 × log₂) mod29` equals original red rune index | **8 / 219** comparable positions |
| Best **post-hoc** affine relabeling of the 29 field-log indices | **18 / 219**, at `r → 23r+7 (mod29)` over all 28×29 affine possibilities |
| Full-size exact synthetic positive | **256 / 256** event identities recovered |

The zero disagreement is already a deterministic disproof of the **specific full 256-event/256-cell same-order representation**, independently of any language model. Even discarding impossible zeros, the rune projection agrees only 8 times. The all-affine upper bound is purely a diagnostic of distance from any fixed rune-label change; it does not license that postselected mapping as a cipher or key.

A full synthetic plant from the same 225 source red indices and 31 mark positions was generated as `0` on marks and `(-1)^i·4^r` on runes, and the fixed GF59 logarithmic inverse recovered every source event. This verifies the implementation's lossless reversible model on an exact-size control. The original failed on the required symbol identities. The correct inverse exponent is `r = 15·(log₂(x) mod29) mod29`, since `4 = 2²` and 15 is the inverse of 2 modulo29.

## Decision

**Retire this one source-object identity and its 29-index affine relabelings.** The arithmetic group is real but no first-party instruction selects it as an LP2 reader; 6 of the field-zero cells lie at original red runes and 29 true marks would need nonzero output. Ad hoc cell reorderings, masks, exceptions, and fitted generator/key changes would abandon the stated causal path and should not follow from the measured failure.

This result does **not** exclude arbitrary GF59 cryptographic constructions, a separately encoded table payload, a distinct red marker consumer, or any actual unknown LP2 plaintext hypothesis. Its useful boundary is precisely the direct, lossless 256-to-256 event transcription. Preserve the source-negative to avoid further cryptanalytically unmotivated scans.

**Reproduction:** [single-file CommonJS SFT](../sims/lp2_field59_red256_grid_correspondence_sft.cjs). Original inputs are the unchanged canonical corpus, ink annotations and grid already in `resources/liber-primus/`. [Manual Windows Node22 run](https://github.com/FlareZ123/liber-primus/actions/runs/43859550159).
