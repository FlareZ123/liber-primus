# Paired 180° crosses on p0–p2: equal and opposite additive-key mirror rules fail native plaintext controls

**Agent50, 21 November 2026. Two original-cipher conditional exclusions.** Original LP2 pp0–2 have a genuine 180° page-level visual involution, independently documented from their source JPEGs in [the exact-ornament analysis](lp2-p0-triple-cross-180-source-gate.md). This report tests both fixed sign polarities of one directly motivated mathematical mirror relationship on untouched original runes. It finds **0, 4 and 2 opposite-position equal-rune pairs** on the three pages; a key that assigns the same additive GP29 shift to opposite positions preserves those equality counts exactly. The counts are very low relative to authentic GP29 English controls. No unknown plaintext, key or original direction rule follows.

## One source clue, two literal additive-key involutions

The original illustrations on 17.jpg, 18.jpg and 19.jpg place the same distressed three-bar cross in the left lower and right upper corners, with an exact 180° relative rotation around the 2400×3600 page centre. The native pixel comparison after rotation gives Pearson correlations **0.996917**, **0.997325** and **0.997325**. These three pages also contain exactly **262+266+201=729** uninterrupted GP29 ciphertext runes; no reordering or guess at word boundaries is needed.

If a cryptographer used that image relation as an instruction to apply the same unknown GP29 additive key from both ends of each physical page, they would have

`C_i=(P_i+K_i) mod29`, with `K_i=K_{n−1−i}`.

Then `C_i=C_{n−1−i}` **if and only if** `P_i=P_{n−1−i}`. The statement holds for **every possible secret symmetric key**, without fitting, knowing or recovering any key value. Pair page rune0 with page rune(n−1), rune1 with rune(n−2), and so on. The original page-specific visual motif motivates exactly these physical-page scopes, independent of a 27×27 reshape.

## Actual source-cipher observations

| Original LP2 page | Original rune count | Opposite-position pairs | Exact equal pairs |
| --- | ---: | ---: | ---: |
| p0 | **262** | 131 | **0** |
| p1 | **266** | 133 | **4** |
| p2 | **201** | 100 | **2** |
| Three physically independent pages | **729** | **364** | **6** |

For comparison, the canonical [published solved native-GP29 rune corpus](../resources/external/relikd-solved-gp29-native-v1.json) has **2,979** original-orthography symbols in nine sections (including independent LP1 solved pages and LP2 p56/p57). It gives exact, length-matched, *contiguous* plaintext windows rather than a Latin character-frequency approximation. Punctuation is removed while keeping the book's GP29 fused-rune orthography.

| Window length | Solved-source contiguous windows | Mean equal opposite pairs |
| --- | ---: | ---: |
| 262 | 1,325 | **8.51547** |
| 266 | 1,309 | **8.64171** |
| 201 | 1,569 | **6.30593** |
| Total, one per page |  | **23.46311** |

Convolving the three *empirical solved-window distributions*, assuming one uniformly drawn window of each requested length independently, gives **Pr(total≤6)=0.00002447164449**. The windows within each section overlap, so this is **an empirical reference distribution under an explicit sampling convention**, not a formal independent-sample experiment or a calibrated probability that the source had a symmetric key. Under an independent equal-letter reference the authentic GP-native corpus's symbol collision probability is approximately **0.06170**, giving the same direction of evidence.

As a separate, more conservative scope, concatenate the original three ciphertext pages in published order and compare pairs across the combined **729**-symbol sequence (364 opposite pairs): there are **10** equal pairs. Every one of the **79** length-729 contiguous solved-source windows has **at least 13** (range 13–35). The combined mirror scope is less directly indicated by the per-page artwork and is reported as a holdout-style consistency check, not another selected key search.

A **positive original-language plant** takes first 262 runes of solved `A KOAN`, first 266 of solved `WELCOME`, and first 201 of solved `LOSS OF DIVINITY`. Each is encrypted with a deterministic symmetric page-level secret shift `K_i=(7+11 min(i,n−1−i)) mod29`. Exact forward encryption and inversion both pass, while the mirrored equality counts remain **11, 6, 7**. Any genuine symmetric-pad encoding would pass the same necessary invariant irrespective of the hidden key values.

## Opposite-sign key involution: a second frozen, key-free negative

The same 180° rotation might indicate turning the key **negative** on the opposite side. There is a second physically independent but **nonspecific** source motive for precisely the zero-offset case: the authentic 2014 onion7 distributor renders `<title>133</title>` and `<div id="331">`; `133 + 331 = 464 = 16×29`, so the two labels are additive inverses in the GP29 ring. More specifically, their residues are `17` and `12`, with `17×12 = 204 = 7×29+1`: **the same pair is simultaneously additive opposite and multiplicative reciprocal**. Both residues square to `−1 mod29`. This is a genuinely precise clue to two basic reflected field operations, though the two HTML labels have an earlier mundane zero-deletion explanation. [The contemporaneous 28 April 2014 zero-omission reading](../communications/broadcast/20261117T000807Z_agent31_133331_zero-omission-historical-rival.md) independently explains those labels as 1033 and 3301 with the digit zero removed, and the preserved 2014 Stage10 square has a central 331. These simpler historical sources prevent treating the residue cancellation as proof of keying. Still, **if** the creator meant the two labels and opposite-facing crosses to select a GP29 mirrored pad, the most economical such pad is exactly the frozen zero-sum involution below, rather than an unbounded guessed-offset family. The other elementary fixed additive involution is `K_i=−K_{n−1−i} (mod29)`, with the midpoint key necessarily 0 if a page has odd rune count. This rule preserves **every mirror-pair SUM**: `(C_i+C_{n−1−i}) mod29 = (P_i+P_{n−1−i}) mod29`. Thus a native-GP29 plaintext would induce a nonuniform and directly testable 29-bin distribution in the printed cipher mirror sums, independent of any secret key.

The exact solved-source 2,979-rune GP29 sample determines a fixed *reference sum distribution* `q_s=sum_x f_x f_{(s−x) mod29}` from the 29 native rune probabilities `f_x`. For each opposite-position pair with modular sum `s`, score `ln(29 q_s)`: positive values in total favour this native first-order model over a flat 29-bin null. This is a **predeclared full-distribution statistic** without scanning rune labels, string keys, GP alphabet orders or shift offsets.

| Source scope | Original mirror-sum log evidence | Mean length-matched native window evidence |
| --- | ---: | ---: |
| p0 (131 pairs) | **−2.969531** | +3.873212 |
| p1 (133 pairs) | **−7.043777** | +3.933062 |
| p2 (100 pairs) | **−5.411515** | +3.026420 |
| Three independent pages | **−15.424823** | **+10.832694** |

Using exactly the same three original-length solved-window multisets as above, *every triple* of possible control windows is accounted for without random trials: sort the 1,569 third-page scores and binary-search the observed summed threshold for all 1,325×1,309 pairs of first/second page windows. Exactly **90 of 2,721,312,825** possible triple combinations score as poorly as the original. Under the expressly defined independent random control-window sampling convention the low-tail fraction is **3.3072272755×10⁻⁸**. Contiguous control windows overlap substantially; this number is descriptive calibration of the native corpus, **not an independent 2.7-billion-sample p-value** and cannot prove that any unknown plaintext is natural language.

As a cross-page scope check, all 729 original runes as one reflected block give log evidence **−15.523975**; all 79 contiguous native-GP29 length-729 windows score **at least +4.611848**. A positive plant using the original-language pages and an actual secret anti-symmetric pad preserves every mirrored GP29 SUM and re-encrypts exactly. A false-source GP29 plaintext would have to explain the severe absence of native-like mirror sums under this hypothesis.

## Multiplicative reciprocal as an independent mirror candidate: already excluded

A 180° reflection may alternatively invert a **nonzero multiplicative** GP29 key: `C_i=P_i K_i mod29`, `K_i K_{n−1−i}≡1 mod29`, now with the HTML residues `17` and `12` suggesting exactly such reciprocals. This mathematically preserves the pair product `(C_i C_{n−1−i}) mod29=(P_i P_{n−1−i}) mod29`. The original p0/p1/p2 mirror-product profiles score `−1.951522`, `−4.478708`, `−0.158881` against a frozen 2,979-rune native GP29 reference product distribution (total `−6.589111`, compared with native-window mean `+7.949763`); only `312,479 / 2,721,312,825` independently sampled native solved-window triples are at least this low. This is a *conditional reference comparison*, not a claim that a human instructed the operation. The decisive and stronger invariant is simply the zero rune: **a nonzero multiplier cannot move F**, so the original p0–2 carry **14, 13, 7** F runes, while *every* solved-source length-matched 262, 266, 201-rune window has **at most 7, 7, 6**, respectively. All three physical pages violate the entire range of native control windows.

**No separate decoder family or repeated computational campaign is warranted.** [The established all-secret multiplicative GP29 zero-marker gate](lp2-gp29-multiplicative-zero-allsecret-gate.md), completed 11 November, has already excluded *all* nonzero multiplicative key schedules on **all 12,956 original runes**, even allowing arbitrary fixed output-symbol permutations and exact GP-word-length matched English controls. The present reciprocal mirror variant is a restricted subfamily of that earlier proof, and cannot rescue it. The source-motivated *algebra* is new to this cross-art discussion, but the cipher mechanism and its fatal zero constraint are long settled.

## Cipher and intended-solve-path decision

The cross symmetry is an authentic, exact original *layout* feature. Under either simple fixed additive mirrored-key interpretation, `K_i=K_{n−1−i}` or `K_i=−K_{n−1−i}`, the original ciphertext would require p0–p2 plaintext with a highly atypical mirrored-equality deficit or mirror-sum distribution compared with the book's own solved natural-language sections. This makes the model an **unpromising plaintext-recovery route** and gives a substantive source-constrained reason to retire it, without enumerating passwords or decrypting garbage.

The observation **does not establish** that the crosses describe ciphertext rather than decoration. It does not exclude a per-position arbitrary secret alphabet with no additive structure, a different geometric receiver, non-English binary plaintext, or a hidden key whose values are independent across the mirror. It cannot prove no conceivable English paragraph could have six mirrored pairs; it is an empirically strong negative for ordinary GP-native prose.

**Director fork:** Stop both literal signed mirrored-additive-key branches for p0–2. The stronger challenge is finding a first-party statement that maps the 180° drawing to a named rune/key operation or to a source-selected external key. Do not run a new broad 27×27 fold or Atbash menu solely because the decorative cross is turned upside down.

**Read-only CommonJS reproduction:** [`sims/lp2_p0_three_cross_symmetric_key_source_sft.cjs`](../sims/lp2_p0_three_cross_symmetric_key_source_sft.cjs), exact source input `resources/liber-primus/lp2-corpus.json` and `resources/external/relikd-solved-gp29-native-v1.json`. It asserts original 262/266/201, all 0/4/2 and 10 counts, all 4,203 solved plaintext windows, exact 0.00002447164449 same-key control tail, and the 11/6/7 native symmetric-pad positive. It also confirms the 90/2,721,312,825 opposite-sign score calibration, the original log-evidence sum and exact native positive mirror-sum preservation.
