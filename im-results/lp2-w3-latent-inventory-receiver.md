# R41 W3 cumulative-cipher-word receiver with latent boundaries — #2965

## Decision

All four archived W3 sign/Atbash variants are excluded on the original opening 729 runes (physical p0–2) and independent 699-rune continuation (p3 through the last complete sentence before offset 1470, ending at offset 1428) **at the frozen 2.5 cost/rune cutoff**. This is an exact score-domain exclusion, not a proof that no conceivable plaintext exists. A stronger self-imposed zero-false-positive scoring gate failed; the Director's requested positive recovery-power gate passed. No original plaintext or key was recovered.

The archived W3 construction is a modern hint-derived hypothesis, not an authenticated Cicada cipher. The local result concerns only its existing cumulative-cipher-word variant, all-consuming GP29, R46 start-page reset, true sentence boundaries, conserved within-sentence length inventories (and, for the original lower bound, even arbitrary reuse of lengths present in each sentence). No literal-F bypass, other W variants, other resets, unknown alphabet, or arbitrary decoy length inventory is tested.

## Exact inverse

In the [pinned R41 camp7.py](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round41/C1-r14-r15/camp7.py), W3 uses a zero initial shift and cumulative prime sum of completed ciphertext words. The [R46 corrected loader](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round46/L1-word-loader/words.py) joins line/page wraps and groups each word by the page on which it starts. [R46 arm_r41.py](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round46/L1-word-loader/arm_r41.py) resets W3 at the first word starting on each page.

Let Q(i) be the cumulative sum of canonical ciphertext GP primes strictly before i, mod 29. For a candidate word of length L starting at i, with o the first candidate word starting on that physical page, decode each c in the word as T(c) + sign*(Q(i)-Q(o)) mod 29. T is identity or Atbash, sign is +1 or -1. When the next candidate word begins on a different physical page, set o to its start. A word crossing a page seam remains entirely under its original start-page state. Thus the original cumulative state is public once the candidate segmentation is known. No additional W3 key or prior plaintext feedback exists.

The exact A* node is (rune position, start-page origin, mixed-radix counts of remaining lengths in this sentence). The next edge consumes exactly one length, decodes that segment, and updates the page-start origin if necessary. At a sentence end, reset only the inventory, not the cipher state. This enumerates every legal within-sentence permutation, treating identical lengths as indistinguishable. Every returned candidate is re-encrypted using the sender and compared to the full ciphertext. Exactness here is score optimality, not uniqueness of intended plaintext.

The heuristic drops length multiplicities while retaining allowed lengths, true sentence endpoints, and the full start-page origin state. Any legal exact-inventory path is included in that relaxed graph. The stronger heuristic charges a fixed multiplier lambda to each use of each length and subtracts the exact remaining inventory's total multiplier charge. Each such bound is admissible because that extra charge cancels on every exact path. The maximum of these bounds remains admissible. Forty-eight deterministic subgradient iterations produce up to eight fixed multiplier vectors; neither the underlying objective nor the cutoff changes. A* cap is explicit, and a cap is not a negative result.

The word cost is -log(0.98*frequency/total frequency of that GP length) for the 33,350-form TextBlob-derived lexicon, with greedy standard and ING/IO alias spellings; OOV cost is 12 + L log(29). Single-letter Latin forms restricted to A/I/O. These are scoring costs, not calibrated probabilities. Literary controls come from repository Gibran, Emerson and Shakespeare source texts; native controls use the external relikd solved-rune transcription. None of the solved records is added to the scoring lexicon. The underlying TextBlob historical source pool may overlap literary donors. Controls use synthetic page seams at 43% and 78% of their rune tapes, with true length inventories shuffled independently within sentences. The receiver sees only the ciphertext, seam positions and printed inventories; variant truth and plaintext are used only for evaluation.

## Calibration and limitations

| Stage | Positives | Positive recovery | Negatives |
| --- | ---: | --- | --- |
| Pilot (unrestricted score) | 14/14 exact optimum and correct variant | 94.53–100% | Relaxed-bound separation fails (worst positive 2.945072, minimum negative lower bound 1.780521); several exact searches cap |
| Fresh, frozen 2.5 cutoff, base bound | 9/9 exact optimum and correct variant | 95.28–100% | 15/18 excluded, 3 capped wrong-length cases |
| Same fresh cases, stronger exact heuristic | 9/9 exact optimum and correct variant | 95.28–100% | 16/18 excluded, no caps; 2 exact wrong-length false positives |

The fresh wrong-rule controls use independent pseudo-random per-word shifts, while the wrong-length controls keep authentic W3 ciphertext and sentence rune/word counts but replace each sentence's true length inventory with a random positive composition. The two false positives have exact costs 2.327494 and 2.402655 and rune recovery 81.38% and 80.50%. All nine wrong-rule negatives are excluded. The frozen 2.5 threshold was selected after the pilot and before the fresh cohort; it was not retuned after these false positives. The extra zero-FP gate consequently remains failed. The issue specifies >=80% power with >=90% recovery, which both cohorts meet. The unchanged original score diagnostic below was explicitly run under that recovery criterion; it is not a validated universal plaintext classifier.

## Original diagnostic

| Variant (sign, Atbash) | p0–2 cost/rune lower bound | continuation lower bound |
| --- | ---: | ---: |
| -1, false | 4.540266 | 4.448554 |
| -1, true | 4.521735 | 4.437067 |
| +1, false | 4.552697 | 4.495518 |
| +1, true | 4.515792 | 4.428110 |

All eight bounds exceed the unchanged 2.5 threshold. All are the **base relaxed** bounds, i.e. even deleting multiplicity constraints cannot rescue these variants. Thus no exact inventory path scores within the frozen acceptance domain. No full optimum or text candidate was computed on original input; no variant was selected on the opening, so the pre-specified continuation was tested independently across the same four variants. Opening contains the red heading, exactly as the archived all-rune mechanism demands; continuation is [729,1428), not the entirety of physical p3–5. This strongly disfavors this finite W3 receiver for ordinary native/English text. It does not exclude a different language/scoring register, arbitrary additional allowed lengths, unknown sentence boundaries, different reset/skip conventions, or other W variants.

## Reproduction

- [CommonJS SFT](../sims/lp2_w3_latent_inventory_astar_sft.cjs): modes `pilot`, `fresh`, `original-diagnostic`. Run at repository root with Node 22, e.g. `node sims/lp2_w3_latent_inventory_astar_sft.cjs fresh`. These modes were executed in the connected V8 runtime; standalone Node CLI/CI has not been run here.
- [Pilot raw](lp2-w3-latent-inventory-pilot-output.json) · [Fresh base-bound raw](lp2-w3-latent-inventory-fresh-output.json) · [Fresh dual-bound raw](lp2-w3-latent-inventory-dual-output.json) · [Original diagnostic raw](lp2-w3-latent-inventory-original-diagnostic.json). Raw records pin all input blob SHAs, variants, candidate scores, state counts and censoring.
- [Director Issue #2965](https://github.com/FlareZ123/liber-primus/issues/2965). [R41 preregistration](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round41/C1-r14-r15/PREREG.md), [R47 H2](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round47/H2-harden/RESULTS.md).

Next decision: retire further searches in this exact W3 score-domain absent a new source-selected word/reset convention. The public prefix-state simplification and inventory-dual bounds can be transferred to other deterministic ciphertext-driven receivers where the exact state permits it; do not silently transfer them to decoded-word feedback.
