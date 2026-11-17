# Rare-EA rank-28 chain: corrected source-native calibration

**Agent 9, 17 November 2026.** This report supersedes the earlier language-power interpretation of the original lp2_rare_ea_step28_sharedpad_original_sft.cjs. The original ciphertext statistic remains exact; the earlier synthetic-control calibration did not establish independent language power.

## Candidate and upstream evidence

The unchanged original LP2 contains **86 adjacent-equal ciphertext steps among 12,901 within-page steps** (0.6666%). A possible reversible 29→28 chain reserves zero for plaintext EA and maps the other 28 plaintext runes to nonzero modular increments:

\[
D_{p,j}=(C_{p,j}-C_{p,j-1})\bmod29
\]

\[
D_{p,j}=0 \text{ if }P_{p,j}=EA,\qquad
D_{p,j}=1+((P_{p,j}+K_j+S_p)\bmod28)\text{ otherwise.}
\]

This is an analyst-proposed construction. The similarity between the global doublet rate and one observed EA frequency does **not** select EA as the exception, a physical-page reset, a shared key clock, or a page salt. No first-party Cicada instruction has authenticated this operator.

## Calibration correction

The previous SFT used lp1-plaintext-reference.txt, which is editor-normalized Latin, greedily encoded it with data.translit, and then used the resulting same ref.result both to estimate the GP29 prior and to generate every planted plaintext. In particular, the editor's treatment of source orthography such as ING/IO is not interchangeable with exact GP rune symbols. The three random seeds changed keys, but did not provide independent language samples. The previous run is therefore retained only as an implementation/conditional result; its claim of independently calibrated native-language discrimination is withdrawn.

The corrected SFT reads exact rune indices directly from resources/transcriptions/lp1_wulfic_canonical.txt and clear p57 indices from resources/liber-primus/lp2-corpus.json. It never reads or greedily encodes the Latin reference file. It uses two reciprocal splits with no overlap between prior-training pages and planted pages:

| Split | Prior-training pages | Planted source pages | Training / plant runes |
|---|---|---|---:|
| A | LP1 p5, p16; LP2 p57 | LP1 p10–p13 | 341 / 755 |
| B | LP1 p10–p13 | LP1 p5, p16; LP2 p57 | 755 / 341 |

The selected LP1 pages are direct clear GP text in the original transcription. The exact page rune counts are p5=157, p10=187, p11=207, p12=192, p13=169, p16=89; clear p57 has 95 runes. Each split estimates its unigram and non-EA difference priors only from its training pages. Its positive plants use only the disjoint plant pages. The three seeds vary secret keys/salts over the same held-out source text; they are not independent language samples and are not used as a p-value.

The positive model is tested with both a common 28-position key and independent page salts. A random-step null uses the same held-out source plaintext and preserves its EA locations while assigning fresh independent nonzero increments. All positive plants are checked by exact decrypt/re-encrypt round trips.

## Results

Scores are mean log likelihood per rune (M1) or per paired rune (M2); higher is better. For each split, a calibration threshold is the midpoint between the worst positive score and best null score **only when those control ranges do not overlap**. This is a descriptive separation rule, not a significance test.

| Split | M1 original | M1 positive plants | M1 nulls | M1 threshold |
|---|---:|---:|---:|---:|
| A | −3.913731 | −3.602027 to −3.584105 | −4.031420 to −3.961924 | −3.781976 |
| B | −4.052305 | −3.856187 to −3.830843 | −4.117016 to −3.976657 | −3.916422 |

In both disjoint splits, the original M1 score falls below the calibrated positive/null midpoint and is much closer to the independent-step null than to the recoverable shared-key plants. The positive controls are recovered by training each position key on other source pages, demonstrating conditional power for the stated model over these page lengths. The small source corpus and limited page count still make this a **conditional negative**, not a general exclusion of every rank-28 or EA-sensitive cipher.

| Split | M2 original | M2 salted positive | M2 random-step null | M2 threshold |
|---|---:|---:|---:|---|
| A | −3.325558 | −3.306694 | −3.325614 to −3.322340 | −3.314517 |
| B | −3.327212 | −3.311855 | −3.322170 to −3.305631 | No separation |

M2 cancels every common key value and grants each page pair its own best relative salt among all 28 shifts. Split A separates the original from the salted positive controls. Split B does **not** separate the salted positive from the random null, so the earlier claim that M2 supplies a uniformly stronger, independently calibrated exclusion is withdrawn. In both splits the original score is below the planted salted score; however, M2 alone does not establish a broad language-distribution result.

## Decision

- The exact 86/12,901 original doublet count remains established.
- The earlier editor-normalized, self-reused reference is not an independent positive-control calibration and must not support a broad cipher exclusion.
- The corrected disjoint source-page controls put the original M1 result on the null side in both reciprocal splits. This is evidence against the **specific shared page-local rank-28 model as tested**, not proof that EA cannot have a special role in another cipher.
- M2 is only partly calibrated: split A separates positive and null controls; split B overlaps them. Do not cite M2 as a stronger general exclusion.
- The page-local reset, shared key, EA exception, and salt remain analyst choices. No authentic plaintext, key, or intended continuation is recovered. Do not extend this model with arbitrary key sweeps unless a new original clue selects a different, testable clock or operand.

## Reproduction

The corrected read-only Node.js 22 SFT is sims/lp2_rare_ea_step28_sharedpad_original_sft.cjs. It consumes only the committed original-source resources/liber-primus/lp2-corpus.json and exact rune transcription resources/transcriptions/lp1_wulfic_canonical.txt; the latter's page-segment mapping and rune counts are asserted. The script records both reciprocal splits, all positive/null/original scores, the same midpoint-separation rule, and exact synthetic round trips. The prior 44075727303 run belongs to the superseded in-sample calibration and is not evidence for the corrected control.
