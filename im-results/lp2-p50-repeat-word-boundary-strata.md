# p50 low60 repeat signal: word-boundary architecture discriminator

**Decision (Agent17, 18 November 2026):** the phase-zero p50 low60/leading-zero adjacent-repeat association is present on both sides of canonical printed word boundaries. The cross-word stratum is not depleted relative to within-word transitions; its raw enrichment is slightly larger. This rejects a **word-local-only / word-reset explanation of this particular signal** and favors carrying the relevant state continuously across ordinary printed word boundaries.

This is an architecture constraint on the existing p50 association. It does not identify the reversible opcode, key, plaintext, or authorial meaning of the 60-cell class.

## Frozen source and partition

Director #1530 reused the source-exact #1508 setup:

- original p0–55 ciphertext: **12,956 runes**;
- canonical parser: **2,896 complete printed words**, reproduced rune-for-rune from `lp2-transcription.txt` against `lp2-corpus.json`;
- existing eligible within-page adjacent pairs only: **12,901**;
- original global phase-zero row-major p50 clock;
- pair indexed by its first rune;
- frozen 60-cell leading-`0` / low60 mask.

The canonical manuscript has 32 words crossing physical page boundaries. Those cross-page rune pairs remain excluded exactly as in #1508. Among the pre-existing eligible opportunities, the frozen partition is therefore:

- **10,028 within-complete-word pairs**;
- **2,873 cross-word pairs** whose two runes remain on the same physical page.

No punctuation or line subtype was introduced.

## Source result

| stratum | low60 opportunities | low60 repeats | outside opportunities | outside repeats | low60/outside repeat-rate ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| within word | 2,349 | 23 | 7,679 | 40 | **1.87970×** |
| cross word | 676 | 10 | 2,197 | 13 | **2.50000×** |

The source pooled 33/86 split is therefore composed of **23 within-word** and **10 cross-word** low60 repeats. The effect does not disappear at printed spaces.

The raw log-rate-ratio interaction is only **−0.28518 nats** (cross-word enrichment slightly exceeds within-word enrichment). There is no source sign of the large positive within-minus-cross interaction expected from a word-reset-only mechanism.

## Nine-chapter held-out transfer

The exact #1508 Beta(1/2,1/2) eight-train/one-holdout scoring was rerun separately in each stratum.

| stratum | summed held-out gain | positive held-out directions |
| --- | ---: | ---: |
| within word | **+2.361916 nats** | **8/9** |
| cross word | **+0.962753 nats** | **6/9** |

The cross-word evidence is sparser, with only 23 total cross-word repeat events, so chapterwise direction is less uniform. Its predictive gain remains positive, and its pooled enrichment is not weaker than within words. This is inconsistent with a mechanism whose low60 effect is erased whenever a printed word ends.

## Matched source-preserving null A: exact chapter × stratum relocation

Before inspecting the split, #1530 froze an exact conditional null. Within each of the 18 chapter/stratum cells, it holds fixed:

- opportunity count;
- low60 exposure count;
- repeat-event count.

It then relocates those repeat events uniformly without replacement and convolves the exact hypergeometric laws.

| stratum | observed low60 repeats | exact expected | SD | exact upper tail |
| --- | ---: | ---: | ---: | ---: |
| within word | **23** | 14.79583 | 3.35454 | **0.0135312** |
| cross word | **10** | 5.41407 | 2.02523 | **0.0269837** |

Both strata are enriched relative to their own fixed source exposure.

Using the same 0.5 stabilization as the held-out models solely to make the interaction finite at null endpoints, the exact null probability of an absolute within-vs-cross interaction at least as large as the source is **0.636515**. The observed difference between the two strata is ordinary under this matched conditional null.

## Matched source-preserving null B: exact shared-column permutations

The second frozen null exhausts the same **8! = 40,320** shared printed-column permutations used by #1500, applying each permuted p50 mask identically to the fixed within-word and cross-word inventories.

It first reproduces #1500's pooled control exactly: **26/40,320** permutations reach at least the source's 33 pooled selected hits.

Stratified tails are:

- within word: **155/40,320 = 0.00384425** reach at least 23 selected repeats;
- cross word: **737/40,320 = 0.01827877** reach at least 10 selected repeats;
- absolute within-minus-cross interaction: **22,119/40,320 = 0.548586** are at least as large as source.

Again, both strata independently retain unusual source alignment while their difference is unremarkable.

## Architectural consequence

The p50 low60 signal **transfers across ordinary word boundaries**. For any future reversible mechanism attempting to explain this particular diagonal/repeat association:

- do not reset the relevant p50 state merely because a printed word ends;
- do not require a separate word-local alphabet to explain the low60 repeat excess;
- prefer a stream-continuous clock/state interpretation across spaces, while still respecting physical-page handling already frozen by the upstream clock evidence.

This conclusion is narrower than “the entire LP2 cipher is continuous.” Other cipher layers may still use word structure. The result says that a word reset does not explain the established p50 low60 repeat association.

## Reproduction

Run `sims/lp2_p50_repeat_word_boundary_strata_sft.cjs` under Node 22. It reconstructs the canonical words from repository source, asserts the original 12,956-rune tape and 12,901 opportunity inventory, reproduces the two stratum counts and held-out scores, evaluates the exact chapter×stratum hypergeometric null, and exhausts all 40,320 shared-column permutations.
