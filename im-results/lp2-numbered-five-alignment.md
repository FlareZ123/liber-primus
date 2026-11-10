# Five numbered LP2 passages: a cross-alignment hub and its key-reuse failure

**Classification:** exploratory ciphertext relationship, independently reproducible within a fully specified *conditional* test. **No recovered LP2 plaintext, cryptographic key, or confirmed mechanism.** Analysis by Agent 29, 2026-11-10.

## Why this section is a useful, bounded target

Original LP2 archive JPEGs **53.jpg–55.jpg** display five conspicuous red enumeration labels **1, 2, 3, 4, 5**. Each label starts a prose interval; the fifth interval also contains the material before the next paragraph terminator. Their respective rune counts, from the repository's canonical master transcription, are exactly **139, 91, 98, 96, 290**. This is a manuscript-defined set of five related ciphertext samples, potentially more informative than choosing arbitrary pairs from 55 pages.

The first numbered block is held as the anchor, and each of the other four is compared to it at every **noncyclic rune offset -40 through +40**. Let N_s be the count of overlapping runes and E_s the count of identical runes. The unconditioned uniform-rune collision z-score is

    Z_s = (E_s - N_s / 29) / sqrt(N_s * (1/29) * (28/29)).

The per-pair peak is the maximum across all 81 offsets, and the five-passage statistic is the **minimum of four independently optimized pair scores**. The latter asks whether passage 1 connects unusually well to *all* four other enumerated passages.

## Exact observations

| Comparison | Peak lag of partner | Coincidences | Full z | Heldout coincidences / positions | Heldout z |
|---|---:|---:|---:|---:|---:|
| Block 1 / 2 | -24 | 11 / 91 | 4.51684 | 6 / 46 | 3.56658 |
| Block 1 / 3 | -20 | 11 / 98 | 4.21891 | 5 / 49 | 2.59176 |
| Block 1 / 4 | -34 | 10 / 96 | 3.74186 | 5 / 48 | 2.64589 |
| Block 1 / 5 | -9 | 13 / 130 | 4.09399 | 5 / 65 | 1.87523 |

All four full-sample maxima exceed **z=3.74**; the observed minimum is **3.7418562366**. A short sequence can attain such a high post-optimization z-score by chance, so these are *not* individual hypothesis-test p-values.

For a more stringent split check, divide **each offset's own overlap** into a first training half and second validation half. Choose the three highest-z training offsets per partner, then score the best of those three on its *unfitted* second half. This is a permissive, three-choice validation rule whose selection must be included in controls. All four originally selected full peaks were among the three training choices; their validation z-scores are given in the table. The minimum validation z is **1.8752289238**.

## Exact conditional nulls

The implementation performs the **entire offset optimization and split-selection procedure again in each control trial**. Both controls keep the observed first block fixed, preserving any unusual hub rune distribution.

**Real-manuscript-window null:** Choose four nonoverlapping windows matching the lengths 91, 98, 96 and 290 from the concatenated 12,956 genuine LP2 runes. Do this for 10,000 trials with deterministic seed 1013539. No trial attained the observed full-peak minimum: add-one p **1/10001=0.00009999**. Four trials attained the observed split-validation minimum: add-one p **5/10001=0.00049995**. This null retains authentic neighboring-runic structure inside randomly drawn windows, including the known anti-doublet deficit.

**Exact-histogram shuffle null:** Keep the four actual partners' symbol multisets fixed; uniformly shuffle the order within each block in every trial, with seed 730031. Of 10,000 trials, none attained the observed full-peak minimum, and two attained the observed split-validation minimum. Add-one p values: **0.00009999** and **0.00029997**, respectively. This addresses the possibility that unusual individual rune frequencies create the apparent hub.

The null probabilities are **conditional on this manuscript-defined five-block set, chosen anchor, scanning range, statistic, and analysis path**. They do not correct for searching many sections, anchor selections, cipher hypotheses, or all possible human pattern discoveries. Consequently they support further investigation of an anomaly; they do not provide a family-wise claim about the entire Liber Primus ciphertext or an identified encryption architecture.

## The most important cryptographic obstacle: no transitive common pad

A single additive key reused at the chosen pairwise offsets cannot explain the alignment table in the simplest way. If block 1 aligns with blocks 2, 3, 4 and 5 at offsets [0,-24,-20,-34,-9], the common key must cancel also between the other six pairs at offsets obtained by subtracting their inferred shifts.

The observed exact coincidences at these six *forced* alignments are:

| Other pair | Forced offset | Rune coincidences |
|---|---:|---:|
| 2 / 3 | +4 | 3 / 91 |
| 2 / 4 | -10 | 4 / 81 |
| 2 / 5 | +15 | 0 / 91 |
| 3 / 4 | -14 | 3 / 84 |
| 3 / 5 | +11 | 3 / 98 |
| 4 / 5 | +25 | 3 / 96 |

**16/541 = 2.96%** of forced comparisons coincide, slightly *below* the uniform 1/29 reference. An actual common additive pad masking two independently sampled, similarly distributed ordinary English-GP rune streams would generally preserve a *higher* character equality probability at corresponding key phases. The pairwise links involving block 1 are therefore mutually inconsistent with a straightforward five-way identical keystream. This is an informative architectural failure, subject to the unspecified true plaintext distribution and possible state/skipping rules.

A direct English-GP difference-distribution likelihood screen at these selected offsets also did not identify one consistent affine multiplier for all four pairs. Thus neither the high exact matches nor the per-pair English-like score is a decryption.

## Reproduction and next decision

**Run:** node sims/numbered_five_alignment.cjs from the repo root, Node.js 22. The script reads resources/transcriptions/liber_primus_master.txt and resources/liber-primus/lp2-corpus.json, asserts the five counts and entire 12,956-rune pool, and emits all offsets, full scores, train/validation choices, complete null counts and forced transitivity comparisons. No external library, API, or secret is required.

**Inversion requirement before promotion:** Find an independently motivated rule producing these four offsets *and* an explanation for why the other six forced alignments fail. Apply that rule to untouched rune positions or to another independently selected manuscript section. Recover reproducible plaintext and re-encrypt it exactly. Absent such a rule, the correct status remains an intriguing but post-selected hub pattern. Additional score optimization on the same five passages alone is unlikely to resolve it.
