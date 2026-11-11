# P55 literal fold mismatch selects the p27 red section title

**Evidence class:** source-image navigation hypothesis with exact original-corpus reproduction. **No unknown LP2 plaintext, cryptographic key, or destination is claimed.**

## Source-visible path

The existing signed-2016 word-address candidate reaches the literal word **FOLD**, then physical LP2 p55. That numerical address rule remains provisional. Independently, p55's two outer botanical ornaments are nearly exact left/right reflections at the printed page midpoint, and an exact-center binary fold comparison leaves two dominant residual components at the two intentionally pale circles in the left five-circle ornament. The image result is already reproduced by [`p55_fold_mirror_original_image_sft.py`](../sims/p55_fold_mirror_original_image_sft.py).

Treat the five aligned ornament positions only as **match/mismatch under the fold**, avoiding a black-versus-white value convention. In ordinary printed reading order

`top, middle-left, middle-right, bottom-left, bottom-right`

the mismatch mask is

`1 0 0 1 0 = 10010₂ = 18`.

The complete LP2 source annotation contains **31 thirteen-dot punctuation marks**, so those marks divide the 13,136-rune physical book into **32 ordered fragments**. A five-bit fold output therefore has an immediate source-sized address space without introducing a modulus.

Using ordinary human one-based numbering, **18 selects the 18th thirteen-dot-delimited fragment**. It is exactly physical **p27 local runes 0–18**, a 19-rune red title bounded by the preceding p26 terminal thirteen-dot mark and p27's thirteen-dot mark:

`ᛗᛈᚣ-ᛚᛋᚩᚪᚫᚻᛚᛖᛇᛁᛗᛚ-ᛚᛋᚳᛈ`

Canonical GP transliteration:

`MPY LSOAAEHLEEOIML LSCP`

Its printed word lengths are **3, 12, 4**. It is also the exact opening title of the next `$`-delimited canonical transcription section, rather than an arbitrary interval cut through prose.

## Independent self-checks

The selected fragment is the **only one of all 32 thirteen-dot fragments** with both of these exact properties:

- its rune count is **19**, equal to its first rune's canonical GP index, **M = 19**;
- after that first rune, exactly **18** runes remain, equal to the one-based fragment number selected by the fold.

The natural orientation alternatives do not produce comparable structure:

| Five-position reading | Bits | One-based fragment | Result |
| --- | --- | ---: | --- |
| top-to-bottom, left-to-right within paired rows | `10010` | **18** | **p27 red title, 19 runes; unique self-index checks** |
| top-to-bottom, right-to-left | `10001` | 17 | 1,005-rune p23-p26 block |
| bottom-to-top, left-to-right | `10001` | 17 | same 1,005-rune block |
| bottom-to-top, right-to-left | `01001` | 9 | zero-length interval at p7's coincident black/red 13-dot marks |

The zero-based value-18 alternative is likewise diffuse: it selects the 1,414-rune interval from p27 local19 through p32 local120. Thus ordinary printed order plus ordinary one-based fragment numbering is independently discriminated by source structure.

## Separate p27/p55 corroboration

This selector lands on a page already linked to p55 by a distinct original-cipher fact. The six GP runes

`ᛞᛄᚢ-ᛒᛖᛁ` = `DJU-BEI`

occur at **p27 local 28–33** and again as **p55 local 70–75, the final six unsolved runes**. Prior exact corpus work established this as the only duplicated adjacent two-word sequence among the 2,896 canonical LP2 ciphertext words; see [the existing 28-page bookend report](2016-28page-bookend-ratio-inverse.md). Direct affine registration of the p27 wing and p55 insect imagery was negative, so the useful corroboration is the exact ciphertext bookend, not pixel reuse.

The fold-derived route therefore connects p55 to a p27 source boundary that already has an independent p55 connection.

## First cryptographic consequence tested

The selected title was tested as a periodic self-key on the 1,414 following runes of its canonical section under the established mod-29 additive families. Keys were the 19 title indices, the 18 runes after the enlarged initial, title GP-prime residues, and title totient residues; each was tested under subtract, add, and Beaufort orientations. The best candidate remains ciphertext-like (IoC about **0.03493**, held source trigram score **-13.8565** versus body **-13.9104**) and has no readable output. This rejects the immediate periodic-title-key interpretation and should not be expanded by free phase/key searches.

## Evidence boundary and next decision

The new result is a **navigation candidate**, not a decryption. Its weakest upstream premise is still the provisional signed-2016 word-address route that selected FOLD/p55. The five-bit interpretation is much less free once the physical fold has been chosen, because it uses only match/mismatch, the source has exactly 32 thirteen-dot fragments, and the selected address passes two unique structural checks plus the pre-existing p27/p55 ciphertext bookend.

The next useful experiment should derive an operation from the selected p27 title, its wing illustration, or the p27/p55 repeated bookend that makes an out-of-fit prediction on original ciphertext. Avoid generic title-key enumeration or post hoc arithmetic.

**Reproducer:** [`p55_fold_fragment18_p27_title_sft.cjs`](../sims/p55_fold_fragment18_p27_title_sft.cjs).
