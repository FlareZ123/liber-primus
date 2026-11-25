# Five-rune content-dependent printed-boundary fingerprint

**Agent5, 25 November 2026 — exact negative for a deterministic H-decoy representation rule, not a plaintext recovery.** The local [lag-five locality study](lag5-contiguous-echo-second-order.md) shows 104/2105 within-group matches five positions apart and 375/10846 across groups; the independent public [ZzNible study](https://github.com/ZzNible/cicada3301-liber-primus-findings/blob/main/FINDINGS.md) likewise reports the within-group signal. W1 finds no ordinary length-order grammar. A rival to intact shuffled words is that printed separators were generated from ciphertext itself. A 2014 solver could compute a Rabin-style rolling fingerprint and recognize the two source-visible primes 1033 and 3301; neither the manuscript nor earlier authenticated material actually selects this algorithm. This is a single finite representation hypothesis, not a search of plaintext ciphers.

## Exact rule and inverse problem

For the fixed printed rune tape C and canonical GP-prime map g, compute h_i = sum of g(C[i-d])*a^d for d=0..4, mod p, for p=1033 or 3301. All nonzero multipliers a mod p are allowed. A binary secret table B(h) determines whether a printed hyphen follows each rune. Generously grant every word age a completely different secret table B(age,h) as a second, more permissive family. A true generator could recover its table by collecting labelled gap states from ciphertext and then predicting future boundaries; it need not know any plaintext. For a fixed a, exact minimum contradictions over every table are the sum of min(n_gap,n_no_gap) over identical states. This holds for all 2^p or 2^(13p) possible tables, not just fitted thresholds.

Parse the corrected original transcription, assert all 12956 rune indices against the canonical source, 2896 complete printed groups, and all 173 punctuation anchor gaps. Force all punctuation cuts, ignore the first four positions after any anchor and all word ages >=14 (thus permitting an externally forced maximum length), while retaining hyphen boundaries across physical page/line wraps. There are 12092 eligible gap sites, including 2608 hyphens and 69 singleton endings. The latter independently rule out a deterministic minimum age>1 at all eligible sites. Give the decoder the actual age at each site (teacher forcing, more permissive than recursive prediction). Freeze pp0–39 for recovery; pp40–55 for independent diagnostic continuation. No boundary locations from the holdout participate in selection.

## Original exhaustive result

| Modulus | Shared predicate: minimum training errors | Shared: minimum full errors | Age-specific predicates: minimum training errors | Age-specific: minimum full errors |
|---:|---:|---:|---:|---:|
| 1033 | 1866 | 2557 | 835 | 1340 |
| 3301 | 1506 | 2198 | 354 | 618 |

No candidate multiplier is exact, even on development alone, under either family. The 3301 relaxed best training multiplier1079 still has633 total contradictions; on the withheld teacher-forced sites, 867/2429 non-boundary and190/666 boundary states have ever been seen in training, of which 752 and42 are predicted correctly. The diagnostic therefore does not provide a usable boundary generator. The strongest fixed-table training winner at 3301, multiplier1782, predicts 2013/2259 seen non-boundaries but only84/623 seen boundaries.

## Calibration and scope

Two artificial boundary tapes on the **original** fixed rune tape, with actual punctuation anchors and forced max age14, use hidden multipliers and deterministic predicates: p1033/a761, B(h)=[h mod5=0]; p3301/a1033, B(age,h)=[(h+11 age) mod5=0]. Both recover the unique exact true multiplier from development and retain zero full contradictions. The fixed-table plant predicts all 3059 withheld gap decisions; the age-private plant predicts all 795 withheld decisions whose (age,h) states were observed in training (teacher-forced, not a claim of full recursive segmentation recovery for unseen states). The incorrect fixed-table model rejects the age-private plant, establishing discriminative power. Both plants preserve original glyphs but generate synthetic boundaries, not native plaintext.

This excludes the specific five-symbol polynomial GP-prime fingerprint with either source modulus, every multiplier, and arbitrary binary state predicates. The manuscript might use another boundary-generation rule, secret side information, a longer state, or actual shuffled words. Neither W1 nor lag-five significance identifies this hash, and the negative does not establish H-shuffle. Do not rescue the failed model with arbitrary state expansion absent a new source selector.

[Standalone CJS](../sims/lp2_five_rune_boundary_hash_sft.cjs). Run in repository root; emits the complete per-multiplier error tables and all control summaries. Executed in connected JavaScript against pinned repository inputs. The initial attempt to publish the complete raw array failed internally after the computation returned its summary; the script and this exact observed summary are persisted instead. No separate Node or CI execution claimed.
