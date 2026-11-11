# P55 literal fold mismatch selects the p27 red section title

**Evidence class:** provisional source-image navigation hypothesis with exact original-corpus reproduction. **No unknown LP2 plaintext, cryptographic key, cipher mechanism, or destination is claimed.**

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

The zero-based value-18 alternative is likewise diffuse: it selects the 1,414-rune interval from p27 local19 through p32 local120. Thus ordinary printed order plus ordinary one-based fragment numbering is independently discriminated by source structure. The 32-fragment source model has a **second genuine empty interval at one-based fragment 12**, created by distinct p14-terminal and p15-initial 13-dot marks at the same global rune offset; this does not affect the fragment18 selection but must be retained in any 32-row mapping.

## Prime-totient address closure and the 18 by 13 page

The fragment selection has a further source-exact self-check. Physical p27 contains **234 runes = 18 × 13**. Across all 32 thirteen-dot-delimited fragments, fragment 18 is the **only** fragment whose start page contains exactly `13 × fragment_number` runes. Thus the same source quantities that select the fragment also specify an exact 18 by 13 rectangle for its page.

The unique repeated `DJU-BEI` pair sharpens this relation. The selected fragment begins with the enlarged **M**, GP index 19 with GP prime **71**. Immediately after the fragment's 13-dot boundary, the first body rune is **N**, GP index 9 with GP prime **29**. The two copies of `DJU-BEI` begin at:

- p27 local offset **28 = φ(29)**, the totient of N's GP prime;
- p55 local offset **70 = φ(71)**, the totient of M's GP prime.

Their offset difference is 42, and **42 mod 29 = 13**, returning the printed punctuation count. In the source-selected 13-column rectangle the two totient offsets are also diagonal coordinates: `28 = 2×13+2` and `70 = 5×13+5`. These are exact arithmetic/source relations. Their authorial intent remains a hypothesis.

Two direct decipherment consequences were tested without phase fitting. First, the authentic solved-p56 prime-totient semantics was transferred with the source-fixed prime starts N=9 for p27 and M=19 for p55. The authentic rule treats plaintext F as literal ciphertext F without consuming the prime clock. Under that exact rule, p55 has **zero valid hidden-F paths**. P27 has only **two** valid paths, with IoC **0.03396794** and **0.03389457**, both ciphertext-like. This decisively rejects direct reuse of the solved-p56 cipher under these M/N starts.

Second, the exact 18 by 13 p27 rectangle was subjected to the literal reversible fold transform `(a,b) -> (a+b,a-b)` over F29 across mirrored rows, mirrored columns, or both, with both natural difference orientations. The best IoC among these finite variants is **0.03492168**. Pure fold permutation is already unable to improve the page's low IoC; this stronger reversible pair transform also fails to expose native-GP plaintext.

These failures leave the prime-totient addresses valuable as a **navigation and synchronization clue**, while closing the two most direct cipher transfers. Reproducer: [fold/fragment SFT](../sims/p55_fold_fragment18_p27_title_sft.cjs).

## Separate p27/p55 corroboration

This selector lands on a page already linked to p55 by a distinct original-cipher fact. The six GP runes

`ᛞᛄᚢ-ᛒᛖᛁ` = `DJU-BEI`

occur at **p27 local 28–33** and again as **p55 local 70–75, the final six unsolved runes**. Prior exact corpus work established this as the only duplicated adjacent two-word sequence among the 2,896 canonical LP2 ciphertext words; see [the existing 28-page bookend report](2016-28page-bookend-ratio-inverse.md). Direct affine registration of the p27 wing and p55 insect imagery was negative, so the useful corroboration is the exact ciphertext bookend, not pixel reuse.

The fold-derived route therefore connects p55 to a p27 source boundary that already has an independent p55 connection.

## Word-number gap, LP1 totient support, and the p27 primitive cycle

Under the canonical **2,896-word** parser, which keeps page and line wraps transparent inside printed words, the two copies of `DJU-BEI` begin at zero-based word offsets **1462** and **2894**. Their difference is

`2894 - 1462 = 1432`.

The independently fold-selected p27 `$` section contains exactly **1,433 runes**. **1433 is prime**, so

`φ(1433) = 1432`.

This upgrades the equality from an isolated length coincidence to a source-relevant arithmetic relationship: LP1 explicitly tells the solver that primes and the totient function are sacred. Across all canonical `$` sections, this p27 section is the **only** one whose totient equals the unique repeated-pair word gap.

A second exact property uses the fold-selected title itself. Its enlarged first rune is **M = canonical GP index 19**, and

`ord_1433(19) = 1432 = φ(1433)`.

Thus 19 is a primitive root modulo the selected prime section length and visits every nonzero section position exactly once. Across every canonical `$` section, p27 is also the **only** section whose first rune has full multiplicative order modulo its own section length. The other prime-length section has length 1021 but begins with GP index 1, of order 1.

The same cycle factors as

`1432 = 8 × 179`.

The border value **31** has multiplicative order **179 modulo 1433**, so the nonzero section positions admit a complete 179×8 coordinate system

`position(r,c) = 31^r · 19^c mod 1433`, with `0 ≤ r < 179`, `0 ≤ c < 8`.

The eight-column factor matches the printed 32×8 numerical table width. This is a source-constrained structural relationship, not a decipherment.

### What this does and does not specify

Additively, `1432 ≡ -1 (mod 1433)`, and the repeated p27 occurrence starts at section offset **28**, giving an exact anchor. However, a direction claim still requires converting a difference of global **word ordinals** into a local **rune-position** operation. The totient instruction makes that conversion materially better motivated, but no authenticated source has yet stated the exact positional action. Treat backward traversal as a strengthened hypothesis, not as an established cipher clock.

The obvious direct consequences are negative:

- chronological reversal and cyclic reverse walks around the p27 bookend remain ciphertext-like;
- primitive-root position walks using 19, including the source anchor at section offset 28, remain ciphertext-like in both directions;
- direct GP29 and predecessor-excluded GP28 state streams from powers of 19 remain nonlinguistic. The best fixed source variant, inverse-generator GP28, scores **-13.8101** versus **-13.9040** raw, but ranks only **73rd of 1,424** signed primitive-root controls, so the gain is not discriminating;
- direct 179×8 coordinate transpositions remain nonlinguistic;
- an invertible three-stage 8-wide Walsh-Hadamard fold motivated by literal `FOLD` plus the wing/moth imagery worsens the language score;
- literal `FOLD`/`DLOF` additive and Beaufort keys on reverse paths also fail.

These tests retire the simplest read-order, direct state-pad, and linear eight-wide fold interpretations while preserving the exact totient/generator structure as a possible state-space clue.

## First cryptographic consequences tested

The selected title was also tested as a periodic self-key on the 1,414 following runes of its canonical section under the established mod-29 additive families. Keys were the 19 title indices, the 18 runes after the enlarged initial, title GP-prime residues, and title totient residues; each was tested under subtract, add, and Beaufort orientations. The best candidate remains ciphertext-like (IoC about **0.03493**, held source trigram score **-13.8565** versus body **-13.9104**) and has no readable output. This rejects the immediate periodic-title-key interpretation and should not be expanded by free phase/key searches.


## Anchored p27 reverse-window → p55 direct-key gate

Conditional on interpreting the 1432 equality as a backward step, the fold-selected p27 section and duplicated `DJU-BEI` bookend fix a stronger p55 experiment with **no phase search inside that hypothesis**. Align p55 local 75 with the matching p27-section local 33 and apply `−1 mod 1433`. Walking 75 positions backward from the anchor fixes one cyclic 76-rune source window. In forward p55 order it is exactly section positions **1391–1432 followed by 0–33**, and its final six runes reproduce `DJU-BEI`.

That single window was tested as a same-alphabet p55 key under the two source-native projections **GP index** and **GP prime weight mod29**, with the three standard direct orientations `C−K`, `C+K`, and `K−C`. Across all **6** frozen variants, the best native-GP trigram score is **−11.64744321**. The worst of **1,000** matched 76-rune native-GP controls is **−8.87918067**, so **0/6** candidates enter the native reference range. Exact forward plants recover under every projection/orientation pair.

**Decision:** preserve the fold-selected p27 target and exact bookend anchor as observations. The backward direction remains an unverified cross-unit interpretation. Conditional on that interpretation, retire **direct additive use of the uniquely anchored 76-rune reverse p27 window**. A successor should first source the direction/state rule independently rather than shift the anchor or scan phases.

**Reproduce:** [single-file SFT](../sims/p55_p27_bookend_reverse76_gate.cjs); successful manual CI [run 42973494572](https://github.com/FlareZ123/liber-primus/actions/runs/42973494572).


## Evidence boundary and next decision

The new result is a **navigation candidate**, not a decryption. Its weakest upstream premise is still the provisional signed-2016 word-address route that selected FOLD/p55. The five-bit interpretation is much less free once the physical fold has been chosen, because it uses only match/mismatch, the source has exactly 32 thirteen-dot fragments, and the selected address passes two unique structural checks plus the pre-existing p27/p55 ciphertext bookend.

The next useful experiment should preserve the reproduced **p27 target and p27/p55 bookend** while seeking an independently authenticated rule for direction and operation/readout. The exact 1432 equality may motivate that search, but it does not by itself authorize reverse-path key searches, p50 table moves, phase choices, or compound arithmetic. Avoid generic title-key enumeration and post hoc arithmetic.

**Reproducer:** [`p55_fold_fragment18_p27_title_sft.cjs`](../sims/p55_fold_fragment18_p27_title_sft.cjs).
