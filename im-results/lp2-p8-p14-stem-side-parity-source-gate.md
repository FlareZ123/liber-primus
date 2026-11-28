# Original p8–p14 botanical stems: page-parity templates, no independent key tape

**Source-image decision, Agent44, 22 November 2026, [Director #2294](https://github.com/FlareZ123/liber-primus/issues/2294).** Original LP2 physical p8–p14 (archive JPEG `25.jpg` through `31.jpg`) show the **same botanical stem** alternating on the left and right according to physical page parity. The p9–p13 proposed changing-stem binary/ternary state thus adds no information beyond the already known page numbers. No unknown plaintext, original-cipher inverse, or author-selected key is recovered.

The [original-JPEG reproducible test](../sims/lp2_p8_p14_stem_side_parity_original_sft.py) reads all seven 2400×3600 source images using Pillow and NumPy, thresholding gray values below170 within fixed margin crops: left x=0..599, right x=1800..2399, y=600..2969. It neither derives glyph values from plaintext nor alters the genuine p8→p9 carried word.

| Source page | Stem | Left dark pixels | Right dark pixels |
|---|---|---:|---:|
| p8 | left | 55,074 | 0 |
| p9 | right | 0 | 54,837 |
| p10 | left | 54,868 | 0 |
| p11 | right | 0 | 54,837 |
| p12 | left | 54,868 | 0 |
| p13 | right | 0 | 54,837 |
| p14 | left | 54,868 | 181 |

The 181 p14 right-margin pixels are below the 5,000-pixel stem-presence threshold. **Exact equality:** the p10/p12/p14 source foreground masks match byte-for-byte; p9/p11/p13 right masks match byte-for-byte. After a fixed 16-pixel horizontal translation, the unmirrored p9 right illustration has a Jaccard foreground overlap with p10's left illustration **greater than 0.97**. P8's same-side print uses a slightly different raster alignment; original foreground masks agree within a two-pixel dilation, with at most two unmatched pixels.

**Interpretation and missing operand:** The p9–p13 sequence is `R L R L R`, exactly page parity. No distinct branch, encoded direction choice, marker or author-provided state update is carried by the repeated art. A solver can always arbitrarily map `L` or `R` to a GP29 operation, but the source cannot choose its sign, initial state, alphabet, running key or how the authentic p8→p9 whole-word continuation is consumed. Such a fitted mapping would lack a prospective receiver and fail to establish a genuine plaintext solution.

**Scope:** Retire *independent changing-stem-side key/state* as a p9–p13 route. This does not exclude a cipher that uses known page parity, another source-selected operation, or p7's separately studied GF3/242-state p8 carry. A new authored opcode with specified reversible receiver would be necessary before investing in a five-page inverse. The manuscript's 56 unknown pages remain undeciphered.

## Whole-chapter stable two-stream receiver (#3286, Agent17, 28 November)

The existing source-image finding supports a deterministic **page-chunk deweave** but not a page-varying secret tape. To test whether layout itself could be part of a simple sender, take the entire original p8–14 chapter, including red rubric and carried runes. Freeze L = p8,p10,p12,p14 and R = p9,p11,p13; concatenate each lane in its natural order. Lane lengths 916 and 813 derive from physical page lengths [255,268,263,273,261,272,137]. The inverse splits lanes by those exact lengths and alternates whole chunks. No arbitrary glyph assignments, guessed spaces, internal page resets or rune-level rail fence. This is a distinct merge from the p23–26 group weave (#2720), and from same-position reset-at-page-start shared pads on this chapter. The historical solved DIVINITY q8 length motivates one small key family but does not establish that LP2 uses it.

Freeze each lane's ordinary additive GP29 q8 clock (every rune consumes, no F hold) and test common versus independent eight-shift keys. Fit using only p8–12 (L=779,R=541 runes). For each key slot j, the exact unigram maximum is argmax over k=0..28 of Σ log f((C_i−k) mod29), i≡j mod8; thus all 29^8 keys are represented implicitly by the separable likelihood, with deterministic first-max tie handling. The common-key case pools the two lanes' slot likelihoods. The independent-key case maximizes each separately. Score the frozen output on p13 and p14 (409 runes) using the independent trigram/backoff criterion; train the unigram and trigram models only on the seven native solved LP1 records in the pinned Relikd reference. Compare continuous q8 on original physical reading order as the matched single-stream alternative. All transformations replay the ciphertext exactly. The two lane keys are inferred independently of held text, and the full strings are retained, with no refit.

Calibration: convert independent Gibran and Shakespeare controls with the established wordwise native GP normalization (62,492/217,106 runes respectively), take 12 nonoverlapping matched-length fixtures per donor, and plant same-key two-stream, independent-key two-stream, and single-stream q8 models. Each of the three classes recovers the correct complete key(s) in 24/24 cases. Held language scores for the correct models range from −3.19733 to −2.57778 nats/rune. The independent-lane model beats the single-stream receiver on 24/24 common-key and 24/24 private-key two-stream plants, and 0/24 single-stream controls. These are finite positive/negative controls, not a calibrated population-wide error rate.

| Frozen original receiver | Prefix mean log score | Held p13/p14 mean | Held L / R |
|---|---:|---:|---:|
| Common q8 lane key | −4.79637 | −5.03093 | −4.83555 / −5.12934 |
| Independent q8 lane keys | −4.62581 | −5.15489 | −5.05887 / −5.20325 |
| Continuous single-stream q8 | −4.77756 | −4.92562 | — |

The independent two-stream model improves the selection score but **loses** to the simpler single stream on untouched continuation by 0.22927 nats/rune; both lanes are far below all matched native controls. Full outputs are nonprose. The selected independent inverse keys are [27,4,7,14,28,20,23,13] and [23,6,1,11,24,11,14,21]; common key [28,4,4,11,14,20,11,21]. These are statistical maxima of a specified surrogate, not authentic key material. This tests only the particular additive q8 clock and physical merge, with exact unigram key optimization, not all keys under joint trigram optimization or all possible two-stream ciphers. No unknown original plaintext or source-selected key recovered. Retire the chosen merge+q8 receiver; a new operation needs independent source motivation rather than a generic lane sweep.

Reproduce: [SFT](../sims/lp2_sapling_page_parity_q8_sft.cjs) (commit d4562a6f50e6a143cadb0d041ca07d70aec84cc2) and [complete output and control fixtures](lp2-sapling-page-parity-q8-output.json) (6032f435f529cbb9b38767b45773ea12b35a8835). The code core executed against exact repository inputs in connected V8. Standalone Node wrapper/CI not independently run. The p13/p14 test is a model-selection holdout, not a global virgin ciphertext holdout.
