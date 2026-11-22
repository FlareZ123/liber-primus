# Original JPEG glyph-width conditioning removes a line-start alphabet candidate

**Evidence status (Agent 16, 10 November 2026):** executed, source-exact, width-matched conditional challenge of an existing printed-line-start bias; no unsolved LP2 plaintext, key, independently established cipher or destination recovered.

## Question and independent source constraint

The 594 printed lines of original unsolved LP2 were previously found to have a strongly nonuniform first-rune profile (particularly excess EA, P and D and deficit R and I). A separate image-based investigation measured first-glyph ink widths directly from original manuscript JPEGs, then accurately predicted held-out line cuts and the excess appearance of wide runes at line beginnings. This raises an actionable question: **does any stable 29-rune line-start preference survive after controlling the physical-width selection effect?**

We use the exact original 55 rune-bearing pages of `resources/liber-primus/lp2-transcription.txt`, and verify the 12,956 original runes against the physical pages of `resources/liber-primus/lp2-corpus.json`. The runeless numerical LP2 page 50 is retained in physical numbering but contributes no runes. Every actual slash-delimited printed wrap is retained, including wraps within one displayed cipher word. This yields 539 within-page line starts beyond the page's first printed line, of which 388 continue a cipher word. Page initials are excluded from this particular test because they are chosen by manuscript layout differently from ordinary wraps.

The 29 fixed ink-width medians (range 9–83 native-JPEG pixels), in GP rune order, are sourced from the original-JPEG measurement in `sims/printed_line_fixed_pixel_width_forward.py`, executed in [source-image Actions run 42779713580](https://github.com/FlareZ123/liber-primus/actions/runs/42779713580). They were measured entirely without the current residual tests. We define coarse, prespecified categories by width cutoffs of 20, 35, 45 and 55 px, where each rune keeps a fixed bin. These *first-ink-component widths* are a useful physical nuisance measurement but do not equal true advance widths or model full kerning.

## Exact matched conditional comparison

For each original physical page and pixel-width bin, record (1) the original multiset of rune identities at every eligible printed position and (2) the number of positions actually selected as line starts. Under the conditional null, draw **exactly that number** without replacement from the same page-bin's inventory. The within-word-only analysis additionally restricts every eligible sampling position to within a whole ciphertext word. Each draw preserves page-specific letter frequencies, physical width-bin composition, and the observed total number of line starts per page-bin.

For each rune r, define the expected number of selected starts as `E[r]=sum(group start count × group rune frequency / group size)`. Compute the pooled 29-rune discrepancy `chi=sum((O[r]-E[r])²/(E[r]+1e-8))`. In 10,000 deterministic source-matched Monte Carlo replicates (seeds `0x16aff991` and `0x16aff992`), compare the original discrepancy to the same null discrepancy. Every proportion below uses the add-one empirical tail rule.

To ask whether the residuals define a repeatable cipher alphabet rather than an accidental page-specific effect, split the canonical 55 rune-bearing pages into the first 28 and final 27. On one half, freeze the weights `(O[r]-E[r])/(E[r]+8)`; on the other half score `sum((O[r]-E[r])×frozenWeight[r])` against 10,000 independently redrawn matched test halves. Repeat in the reverse direction. This diagnostic has no access to any deciphered target or hidden key.

## Results from the completed original-input run

| Test | Original 29-rune discrepancy | Null mean | Exceedances / 10,000 | Add-one p |
|---|---:|---:|---:|---:|
| All within-page wraps, 539 events | **31.08491** | 22.75361 | 1,062 | **0.10629** |
| Midword wraps only, 388 events | **25.14533** | 22.73125 | 3,254 | **0.32547** |

| Frozen residual transfer | Original log-odds-type score | Null mean | Exceedances / 10,000 | Add-one p |
|---|---:|---:|---:|---:|
| All wraps, first pages → last pages | −0.16598 | −0.00057 | 5,255 | **0.52555** |
| All wraps, last pages → first pages | −0.26471 | +0.03302 | 5,357 | **0.53575** |
| Midword only, first → last | −0.86062 | −0.01107 | 7,060 | **0.70603** |
| Midword only, last → first | −0.79251 | +0.04468 | 6,191 | **0.61914** |

The biggest pooled all-wrap discrepancies after width matching are modest: R has 5 starts versus 13.51 expected; T has 13 versus 23.35; C has 22 versus 14.10. These were selected after inspecting the observed residuals, are not independent per-rune discoveries, and are not stable under cross-page predictive transfer.

The **source-matched positive** gives the P rune (GP index 13, independently measured 51px width) an eightfold higher chance of being selected as a start in *each page-width-bin sampling group*. One planted pair of early and late books yields 56 versus 13.13 expected P starts in early pages, and 47 versus 10.22 expected in late pages. Training only on that planted early set, the frozen residual vector predicts the planted late set better than all **3,000** matched unplanted controls (add-one **p=1/3001≈0.0003332**). This confirms the method has power against a substantial stable source-invariant alphabet channel.

## Mechanistic decision

**The original first-rune distribution supplies no stable residual 29-symbol preference detectable by this fixed page-and-JPEG-width-matched test.** Together with prior original-image line-capacity reconstruction, the result makes a purely typographical source of the observed first-column bias a concrete, comparatively economical explanation. This experiment does *not* prove there is zero hidden data in line breaks. Pixel bins are coarse, first-component width is only a proxy for actual advance/kerning, the manuscript can contain manually inserted line breaks, and the entire experiment was conceived after the first-rune bias was noticed. No discovery-wide multiple-hypothesis claim follows from the nominal p-values.

This is a **bounded negative for a stable line-start alphabet code independent of original visual width**, rather than a newly recovered plaintext. The remaining cryptanalytic priority is a key/state mechanism that inverts original LP2 text and exactly re-encrypts held-out runes. Further unrestricted acrostic or line-start alphabet searches without first handling visual selection have little evidential leverage.

**Exact reproducer:** [`sims/printed_line_width_conditioned_residual.cjs`](../sims/printed_line_width_conditioned_residual.cjs), CommonJS Node22, seeded finite sampling, original-corpus assertions and planted control. [Successful opt-in Actions run 42789258730](https://github.com/FlareZ123/liber-primus/actions/runs/42789258730) with `attack=width-residual` in the existing manual-only workflow.
