# The p7 five-dot order moves the unique p8–14 numeral 7 to a seven-column header

**17 November 2026, Agent24. Evidence class: exact original-image/ciphertext *alignment* and a bounded negative plaintext test.** The alignment is reproducible and source-constrained; an author-intended instruction, cipher key, plaintext or final Cicada destination has **not** been established. This report preserves one independently motivated solve-path hypothesis, with explicit failed first consumers and a way for future research to distinguish it from an accidental coincidence.

## Source-visible construction and strongest objection

The source p7 image **24.jpg** ends with five large black circles. Their exact reusable stencil, including its vertical reflection on p23 and horizontal reflection on solved p56, was previously established in [the original three-page art study](lp2-p7-p23-p56-five-dot-dihedral-triad.md). A human can sort the five p7 circles by horizontal position and read their **vertical positions from top to bottom**. Measured centers, sorted left to right, are:

| x position (native pixels) | y position | rank from top | zero-based column |
| ---: | ---: | ---: | ---: |
| 796.94613 | 3105.73973 | 3 | 0 |
| 992.46667 | 3166.68765 | 5 | 1 |
| 1296.96618 | 2866.70402 | 1 | 2 |
| 1479.36384 | 3127.50000 | 4 | 3 |
| 1527.21721 | 2936.20488 | 2 | 4 |

The **top-to-bottom column order is [2,4,0,3,1]**. That is one conventional geometric reading, rather than an authenticated imperative from the illustration. The strongest rival explanation is ornamental reuse of one five-dot stencil; there is no caption identifying columns.

Immediately after this drawing, original physical **pp8–14**, source scans **25.jpg–31.jpg**, form a visually bounded **seven-page runic chapter**. They contain precisely **1,729** canonical GP29 runes and exactly one visually distinctive, untranslated **Arabic numeral `7`**, on p10 / original scan **27.jpg** between runic word delimiters. The numeral is at zero-based position **692 when counting runes preceding it**; page-local mixed-stream position **169**. Counting the numeral as one additional standalone symbol makes the full source stream exactly **1,730 = 5×346** symbols. Critically, its position is **692 = 2×346**, the first slot of the third contiguous 346-symbol column.

The two independent observations meet mechanically: **the topmost of the five p7 dots is x-sorted column 2**, the very column at whose start the manuscript prints `7`. Reading down five source columns in dot top-to-bottom order, taking a rune at each common row before moving to the next, reconstructs a stream that begins with the **literal numeral `7`**. Strip that now-leading unencrypted marker and the rest has exactly **1,729 = 7×247** runes, while the physically bounded section itself spans **seven pages**. This supplies a plausible two-stage player path: five dots select the first column reading; the recovered `7` selects a following seven-column operation. The historical 2014 Cicada puzzle did use a seven-position rearrangement in a different stage, independently making that second operation imaginable to a period solver.

**This alignment is real. Its proposed meaning is not proven.** Top-to-bottom is only one of several reasonable dot-reading conventions; we noticed the match retrospectively, and the visible 7 could simply be ordinary plaintext numeric content left untouched by a separate rune cipher. Among all 5! arbitrary column orders, 24 put column 2 first, so locating the 7 at the first output position does not identify a unique secret permutation. With the top-down convention fixed, exactly one source position out of 1,730 would land first; that conditional combinatorial fraction is *not* a calibrated probability of authorial intent.

## An exact reversible test, with a solved-source plant

Let the source stream including the literal 7 be `C[0..1729]`, the five column heights be `h=346`, and the source image's y-sorted x-order be `q=[2,4,0,3,1]`. The proposed first inverse is:

```text
D[5r+j] = C[346*q[j]+r]     r=0..345, j=0..4
```

The observed original prints `C[692]=7`. Therefore `D[0] = C[346*q[0]] = C[692] = 7`, with no fitted phase, oracle or arbitrary alphabet values. The original layout and **all 1,729 GP rune identities** are recovered exactly by reversing this five-column rearrangement. An independent 1,729-rune actual **source-native solved LP1 English plant** with leading literal 7 is forward-transposed, places its numeral at original source index 692, and is then fully recovered by the identical inverse. These are losslessness checks, not validation of the unknown text.

Other straightforward dot sort orders put the numeral in the **first row but later column**: top-to-bottom output index 0, bottom-to-top index 4, left-to-right index 2 and right-to-left index 2. Only the top-to-bottom convention reveals the digit as the first output symbol among these four.

## Does a second source-motivated seven-column transform reveal plaintext?

After the first inverse, remove only the exposed numeral `7` and preserve all **1,729** original GP indices. The total is seven-divisible with column height **247**. Test the historical 2014 seven-tuple rearrangement in both directions, and conventional seven-column down/across rearrangements in both directions, with no fitted key or changing rune values. Score each candidate under the repository's separately trained **3,510-rune authentic solved-LP1 GP29 trigram model**. Clear solved p57, reserved as an independent check, scores **−2.468145**, whereas ciphertext-like text typically scores near **−3.4**:

| Original-scoped candidate | Mean native-GP trigram log score | Adjacent equal GP pairs / 1,728 |
| --- | ---: | ---: |
| Original p8–14, digit omitted | −3.421147 | 9 |
| Five-dot ordered deinterleave, initial 7 removed | **−3.411400** | 56 |
| Then historical seven-tuple order [0,6,2,5,1,4,3] | −3.421150 | 58 |
| Then inverse seven-tuple order [0,4,2,6,5,3,1] | −3.419532 | 53 |
| Then seven-column downward readout | −3.415380 | 70 |
| Then seven-column rowwise readout | **−3.410092** | 68 |

The first transform restores an ordinary number of adjacent equalities (56 from 9), but all four seven-column continuations remain nonlinguistic at the tested plaintext layer. In fact, **any pure symbol transposition preserves the near-uniform GP29 unigram frequency and collision index**, so these operations alone could never produce the native rune frequency concentration of established LP1 English. A genuinely solving interpretation would need an **independently sourced rune-value transformation or key** in addition to any column rearrangement.

[Read-only source-original Node22 CommonJS reproducer](../sims/lp2_p7_fivedot_seven_header_alignment_sft.cjs) validates the original scan hash, source rune transcript, unique 7 location, native source-art center order, exact marker movement, reverse transform, source-native positive plant, and all six reported original-cipher scores and doublet counts. The source image geometry itself remains separately reproducible from the earlier [native-raster art audit](lp2-p7-p23-p56-five-dot-dihedral-triad.md).

## Another concrete interpretation of the numeral: prime 7

The literal `7` might identify a **starting prime**, rather than a seven-column width. LP2 p56 is independently known to use consecutive-prime Euler-totient GP29 shifts with literal plaintext F passing through without advancing the key. Retain that **actual solved cipher mechanism**, grant every mathematically legal hidden F-skip history, and fix the source-7 reading to either **prime value 7** (fourth prime, zero-based index 3) or **seventh prime 17** (index 6). The first-prime start2 and zero-based index7 (prime19) are additional explicit indexing controls, not a search for secret starting points.

For each of the five original streams above, exact exhaustive reachability finds the **first impossible zero-based rune offset**, including all potential plaintext-F branches. If any complete stream were a legal instance of the proposed authentic p56 cipher, it would have no impossible offset.

| Proposed stream | Prime2 control | Literal prime7 | Seventh prime17 | Zero-based index7 = prime19 |
| --- | ---: | ---: | ---: | ---: |
| Five-dot order only | 22 | **49** | 18 | 61 |
| Followed by historical seven tuple | 61 | **1** | 22 | 24 |
| Followed by inverse seven tuple | 5 | **26** | 25 | 39 |
| Followed by seven columns downward | 34 | **12** | 8 | 3 |
| Followed by seven columns across | 37 | **3** | 20 | 17 |

The very same complete all-skip-state decoder accepts **all 85 authentic solved p56 runes** under its real prime2 starting clock. Thus these original inputs disprove the literal `7` as a prime start **for precisely these five unchanged inverse streams**, including every admissible transparent-F history, without asserting anything about a more complex hidden cipher. A guess at a different key family or additional preceding layer is outside the test and needs a separate original clue.

## Does the five-dot count itself select a prime start?

The five dots already determine the column order above. A separate, bounded reading is that their **count, 5**, also selects a starting prime for the authentic p56 totient cipher: either prime value **5** (zero-based prime index 2) or the **fifth prime, 11** (index 4). Apply the same exhaustive all-legal-F-skip reachability test to the unwrapped 1,729-rune stream, with no fitted plaintext.

| Dot-count interpretation | Prime-sequence index | First impossible zero-based rune offset |
| --- | ---: | ---: |
| Prime value 5 | 2 | **3** |
| Fifth prime 11 | 4 | **30** |

Both candidates fail almost immediately. The same decoder still accepts the authentic solved p56 page under its established prime2 start, so this is not a broken reachability check. This rejects the additional interpretation of the five-dot **count** as a p56 prime start; it does not reject other cipher families or other source-supplied keys.

## All-secret phase-alphabet capacity of the source-selected 5→7 path (17 November 2026)

**New exact original-cipher obstruction, Agent24.** The source-position alignment above remains real. To ask whether a short, unknown GP29 substitution key could supply its missing rune-value step, grant the proposed solver **all possible secret alphabet bijections independently in each position class**. This avoids searching or guessing even one key: arbitrary 29! permutation choices per phase are allowed, including every five-dot permutation, any supplied five-/seven-rune Vigenère key, and more expressive nonlinear per-phase monoalphabetic maps. The source-fixed transposition paths are tested without adapting the original ciphertext.

For each of the six original 1,729-rune streams (printed order, five-dot deinterleave, then four frozen seven-column/tuple continuations), partition the rune positions by period **5**, **7**, or the combined cycle **35**. Let H[r,v] be the original frequency of GP rune v at phase r. Under a bijection in phase r, the 29 frequency counts can only be permuted. The **sharp** maximum possible output collision numerator is obtained by independently sorting every H[r,*] descending and summing equal ranks before computing Σ_v n_v(n_v−1). This follows by the rearrangement inequality. It holds simultaneously for every secret alphabet and key; a particular decoder's output cannot exceed the ceiling. The index of coincidence is this numerator divided by **1,729×1,728 = 2,987,712**.

| Untouched-source ordering | Secret 5-phase ceiling | Secret 7-phase ceiling | Secret 35-phase ceiling |
| --- | ---: | ---: | ---: |
| Printed pp8–14, numeral 7 removed | 108,826 | 112,724 | 153,832 |
| Five-dot deinterleave, first 7 removed | 108,566 | 111,490 | 152,110 |
| Then historical seven-tuple [0,6,2,5,1,4,3] | 109,250 | 111,490 | 152,110 |
| Then inverse seven-tuple [0,4,2,6,5,3,1] | 108,588 | 111,490 | 152,110 |
| Then seven columns read down | 109,644 | 113,174 | **157,544** |
| Then seven columns read across | 108,028 | 111,034 | 148,484 |

These are exact **maximum equal-symbol pair numerators**, rather than observed candidate frequencies. All six input streams have the same original 1,729-rune IoC **102,958/2,987,712 = 0.03446048**. The most permissive of all 18 secret-phase cases has maximum **157,544/2,987,712 = 0.05273065**. Consequently even a perfectly chosen but undisclosed set of 35 substitution alphabets cannot produce an ordinary native-GP29 English output with IoC above 0.05273065 in any of the six proposed arrangements.

**Independent original-language falsification.** Source-native GP29 spelling, including authenticated ING and IO ligatures, was applied without changing its grammar to the complete pinned solved-LP1 reference and to three already-preserved nonoverlapping-source literary corpora. Exhaustively scan every contiguous length-1,729 original-language window using the same collision numerator. Each control's **minimum** is greater than the strongest possible original encrypted output:

| Independently stored plaintext register | GP29 control runes | Every sliding 1,729-rune window | Lowest collision numerator | Lowest original-language IoC |
| --- | ---: | ---: | ---: | ---: |
| Authentically solved LP1 | 3,510 | 1,782 | **178,186** | 0.05963962 |
| Shakespeare | 217,106 | 215,378 | **164,130** | 0.05493501 |
| Gibran | 62,492 | 60,764 | **171,684** | 0.05746337 |
| Emerson | 321,327 | 319,599 | **172,456** | 0.05772176 |
| **Combined observed control windows** | | **597,523** | **0 windows ≤ 157,544** | |

This is a deterministic comparison against those observed sources, not a theorem covering every imaginable English text. The strongest bound is compatible with a random-looking output but excludes source-calibrated prose in all 597,523 tested control intervals. It also excludes any periodic substitution whose key symbols produce fixed alphabet permutations over a 35-position cycle, including arbitrary source-supplied keys, as the **complete final** operation for ordinary GP29 English. A key with state changing inside those cycles, an intervening value-changing step, a non-bijective symbol code, an alternate output register, or altered text segmentation remains outside this gate.

**Adjacent first-party key-length clocks.** The preceding p7 red colophon prints **14 GP runes**, and following p15 prints an exactly recovered **16-cell Fibonacci-prime spiral**. The cipher may conceivably draw its repeating key from either source, although no original instruction says to use them on pp8–14. Repeating them as arbitrary *independent secret GP29 alphabets at each phase* gives complete sharp maxima, over all six frozen source orderings, of **126,216 / 2,987,712 = 0.042245** for period **14**, and **126,656 / 2,987,712 = 0.042392** for period **16**. Both are below even the least concentrated original-language control, 164,130 / 2,987,712. These source-adjacent short-period substitution-key routes are therefore excluded as complete final inverses without guessing their keys. A combined changing clock such as lcm(5,14)=70 or lcm(5,16)=80 is **not** covered by either single-period exclusion; neither the 14-rune colophon nor the 16-cell grid independently instructs a 70/80-phase composite key.

**Old English and Latin source-register sensitivity.** Because a runic manuscript could encode an older Germanic language or Latin, reuse two independent **already-source-normalized GP29 controls** without passing them through the English spelling encoder: the corrected 48,012-rune *Beowulf* Old English fixture ([pinned source](../resources/control/beowulf_oe_gp_profile_corrected.json)) and the 2,400-rune Vulgate Latin held-out fixture ([pinned source](../resources/control/latin-vulgate-heldout-gp.json)). Exhaustively scan their **46,284** and **672** consecutive 1,729-rune windows. The lowest Old English collision numerator is **157,852** (IoC **0.05283374**, original stream offset38,967); the lowest Latin numerator is **212,584** (IoC **0.07115278**, offset1). Both remain greater than the strongest period35 ceiling **157,544**. Therefore **0/46,956** additional original-language windows can arise through *any* source period5/7/14/16/35 final alphabet-bijection layer in the tested section orders. In total, the source period35 exclusion covers **644,479** archived English, Old English and Latin 1,729-rune windows. The Old English margin for period35 is only 308 ordered collision pairs, so the result is specific to these finite source transcriptions and encoding policies. Crucially, **2,184** Old English windows *do* fall at or below the strongest period1–38 pooled ceiling **163,128**: the broader continuous-period **1–38** exclusion applies to the 597,523 **English** source windows, and must not be advertised as language universal.

**Full continuous-period complexity boundary.** The same sorted-count proof can be applied *exhaustively to every continuous period from 1 through 39*, without claiming the author chose any particular period. Over all **six** source-defined orderings and all periods **1–38**, the highest attainable output collision numerator is **163,128**, reached by the inverse-seven-tuple ordering at period **38**. This remains below the lowest observed source-native English control (**164,130**, Shakespeare). At period **39**, the five-dot ordering for the first time reaches a permissible ceiling (**164,632**). Thus **no direct constant-period GP29 alphabet-bijection layer with a continuous period ≤38** can produce any of the 597,523 pinned native-English windows from the original p8–14 runes, even allowing up to 38 independent unknown full alphabet permutations and any of the six original-derived reorderings. A continuous period ≥39 is a *necessary capacity condition* for this comparison, **never a sufficient decryption condition**. A source-specific line/page reset, a word-clock, nonlinear state or a second encryption layer invalidates the simple continuous-period premise; those families require their own evidence and tests. The source does not itself instruct the use of period39.

**Page-reset sensitivity.** Even if arbitrary new phase-5/phase-7 alphabets are allowed separately for each of the seven original source pages, keyed by that source-page label and the current output position modulo the period, the greatest phase-5 ceiling over the six streams is **151,970/2,987,712**, and the greatest phase-7 ceiling is **172,004/2,987,712 = 0.05757048**. The latter is below all 1,782 solved-LP1 reference windows and all 319,599 Emerson windows, but **22,852 Shakespeare windows** and **55 Gibran windows** have IoC no greater than this upper bound. The page-specific phase-7 extension therefore does **not** support a universal native-English exclusion. A new first-party reset/clock rule must be justified independently; allowing new secret alphabets at arbitrary position classes eventually makes an IoC necessary-condition gate nondiscriminating.

**Exact reproduction:** [read-only Windows/Node22 CommonJS SFT](../sims/lp2_p7_dot7_allsecret_bijection_ceiling_sft.cjs) hashes original p7 JPEG 24.jpg, verifies the original 7 position and every GP29 glyph, implements the six exact reversible ordering candidates, proves and asserts the secret-period ceilings, and independently scans 597,523 English, 46,284 Old English, and 672 Latin source windows in rolling O(N) time. The exact original-source calculation **passed Windows Node22 CI [run 44147900953](https://github.com/FlareZ123/liber-primus/actions/runs/44147900953)**. This runs without any cipher-key search or prose scoring fit; printed word boundaries, numbering and the unique 7 remain original-source observations. There is no unknown LP2 plaintext or authentic key recovered.

## The original five-dot / seven-bit ASCII receiver

The five dots, source-fixed deinterleave, and literal **7** also motivate a **different output alphabet**: regroup 7 original GP29 runes ×5 bits into 5 standard 7-bit ASCII characters, yielding an exact 1,235-character chapter without padding. This is a different cipher/register hypothesis from the GP29 all-secret phase substitutions analyzed above.

An independent exact [29-of-32 secret-codebook feasibility proof](lp2-p7-fivedot-sevenbit-allsecret-ascii-original-gate.md), using all six frozen original source orderings and every possible injective five-bit rune alphabet, proves **at least 102 ASCII control characters** are unavoidable even under the optimal unknown alphabet. Crucially, it now also covers **arbitrarily secret periodic bit codebooks**: periods 5, 7, 14 and 35 each force at least **22, 86, 60 and 7 controls** respectively, over all original orderings. This rejects direct all-printable ASCII7 as the complete receiver under the most obvious 5/7 and adjacent 14-rune key clocks, irrespective of secret codebooks. A 16-phase codebook from the next source page's established spiral has **zero on this internal-bit-only lower bound**, but a subsequent complete QF_BV test of the five-dot order proves printable/mixed-case feasibility (non-identifying gibberish witnesses), and excludes uppercase-only and lowercase-only letters with the fixed digit/punctuation class. Both literal spiral-derived period-16 XOR keys fail. See the linked report for the exact scope. The exact test passed [Windows Node22 CI run 44152555563](https://github.com/FlareZ123/liber-primus/actions/runs/44152555563). No unknown plaintext, historical bit rule or secret key was recovered.

## Authentic plaintext-F period-seven recovery after the source transposition (Agent24, 24 November)

The earlier continuous-period alphabet capacity theorem assumes a clock that advances at every rune. Real LP1 Vigenère pauses on transparent **plaintext F**, while ciphertext F can also arise from a nonzero encrypted rune. Consequently the ordinary period-7 exclusion does not decide a latent-F clock after the five-dot relocation. The exposed numeral 7 motivates a finite period-seven test. The missing premise remains that 7 selects a key period at all.

Using the already calibrated [soft-phase EM / hardening solver](../sims/lp2_latent_f_soft_phase_primitive_gate_sft.cjs), fix q7 and two source-only inverses: (0) five-dot deinterleave with the relocated marker removed; (1) that inverse followed by the historical seven-tuple order [0,6,2,5,1,4,3]. Both exactly reverse all 1,729 original rune identities. Each 1,729-rune sequence is divided into 1,123 training / 294 validation / 312 withheld runes in recovered order. Three deterministic soft-EM starts fit the training prefix, finite hardening uses a 24-wide beam with the top five phase digits and all seven rotations, and two coordinate-refinement sweeps use only the first 1,417 runes. Holdout likelihood is computed with the frozen key and phase distribution. The native model uses the existing solved reference; the two full-length positive plants are disjoint Shakespeare and Gibran donor intervals. Each is forward encrypted with its independently generated seven-digit key and then forward transposed to put the marker at source position 692. Two independent per-rune random-pad controls undergo the same transport. The gate requires exact key recovery and ≥98% withheld rune accuracy on both plants, ≥0.1 nats/rune soft and hardened holdout improvement over uniform pads, and rejection of both pads.

| Test | Soft holdout gain (nats/rune) | Frozen hard-key holdout gain | Exact held-out runes |
| --- | ---: | ---: | ---: |
| Shakespeare plant | +0.368034 | +0.376752 | 310/312 |
| Gibran plant | +0.362824 | +0.365441 | 312/312 |
| Independent pad 0 | −0.016261 | no complete path | — |
| Independent pad 1 | −0.010698 | no complete path | — |
| Original five-dot order | **−0.007073** | no legal hardened prefix key | — |
| Original historical seven-tuple order | **−0.019128** | no legal hardened prefix key | — |

Both plants recover their exact secret keys, and both pad controls reject. The original hardening search expands 720 and 905 candidates, respectively, and retains zero legal fully hardened development keys. Neither original soft profile predicts even uniform-pad-level held-out likelihood. The original source order remains reversible, but this specific **blind q7 consuming-clock recovery** does not produce a candidate plaintext. It is a heuristic predictive rejection, not an exhaustive impossibility proof for all 29^7 keys. Other source-selected clocks, orientations, layered mechanisms and different output alphabets remain outside this finite decision.

[Executed CommonJS SFT](../sims/lp2_p7_fivedot_latent_f_period7_holdout_sft.cjs) · [raw deterministic results](lp2-p7-fivedot-latent-f-period7-holdout.json). The shared solver core is pinned in the script header. Execution was through a JavaScript runtime on the repository's exact canonical GP29 and native reference inputs; no additional workflow or provenance audit was needed.

## Seven-consuming-rune plaintext autokey after the source transposition (Agent24, 24 November)

A distinct interpretation of the exposed numeral 7 is the delay of a plaintext-fed running key. Fix the two preceding source orders and an arbitrary seven-rune primer. Each consuming plaintext rune x != 0 emits C=(x+oldest queue rune) mod29, then shifts x into the queue. Literal plaintext F emits zero and holds the queue; ciphertext zero may also be an ordinary consuming emission. This is a source-shaped hypothesis, not an authenticated LP2 autokey instruction.

**Blind constructive inverse:** partition the observed tape at ciphertext zeros. Within each nonzero block, all seven queue coordinates evolve independently by the affine reflection x <- C-x. For each zero-hold branch, keep 29 scores per lane, disallow consuming zero plaintext, and update the 7×29 score arrays by their exact coordinate maps. Each branch's unigram maximum is the sum of its lane maxima plus literal-F scores. Retain a width-4,096 beam of hold histories; reconstruct the MAP lane choices for the best 256 retained histories and select by the native trigram score. This is bounded beam inference, not exhaustive key optimization. Fit only the first 1,417 recovered-order runes. Freeze the selected primer, hold history and ending queue, then Viterbi-decode the remaining 312 runes with no key/state refit. Deduplicate suffix states by exact queue and previous two runes. Native source reference provides the language model, with both donor controls excluded.

| Test | Primer recovered | Fitted trigram nats/rune | Frozen 312-rune continuation |
| --- | --- | ---: | --- |
| Shakespeare 1,729-rune plant | Exact 7/7 | -2.880701 | 312/312 exact |
| Gibran 1,729-rune plant | Exact 7/7 | -2.684288 | 312/312 exact |
| Original five-dot order | Candidate only | -5.138196 | **No legal continuation** |
| Original historical seven-tuple order | Candidate only | -5.093114 | **No legal continuation** |

Both independent controls recover the true primer and complete ciphertext replay; fitted plaintext accuracy 1415/1417 and 1417/1417. Original suffix enumeration never exceeds two states, never prunes, and becomes empty for either frozen prefix. The selected original prefixes are already nonprose. This is a predictive negative for this particular search, not proof that every primer/hold history is impossible: an independent symbolic reachability DFS adapted from the existing q8 reach solver (q=7) finds **full-length legal nonprose paths on both originals**, at 46,768 and 111,303 node visits. The exact replay witnesses are saved. A legal inverse alone does not identify the key.

[CommonJS SFT](../sims/lp2_p7_fivedot_plaintext_autokey_q7_holdout_sft.cjs) · [raw key/holdout decisions and full legal witnesses](lp2-p7-fivedot-plaintext-autokey-q7-holdout.json). Original fit, controls and continuation actually executed on canonical repository inputs in JavaScript. No fresh CI run claimed. Retire the specified bounded q7 recovery route; a different feedback law needs independent source evidence.

## Source-fixed red-word product key in both layer orders (Agent9, 24 November)

The five contiguous red words on p7 immediately above the five-dot drawing have GP0 products modulo29 **[11,26,8,15,2]**. This independently sourced five-value vector and the geometry order **[2,4,0,3,1]** are two inputs from the same original page. Test their direct composition on the complete p8–14 1,730-symbol mixed tape: the original literal 7 at index692 passes untouched, with the source-fixed transpose moving it to the leading position. The key consumes only runes. This is distinct from the prior [fixed-order black-body key](lp2-p7-red-product-repeating-vigenere-p8-gate.md), the q7 blind consuming inverses above, and the opposite-layer **unknown q8** research assignment #2616. There is no authenticated instruction identifying the products as a key.

Freeze the two natural orderings of the known values (red-word order, or dot-reordered [8,2,11,15,26]), both additive signs and all five initial phases. For **ciphertext transpose last**, undo the geometry before the additive inverse. For **plaintext transpose first**, apply the additive inverse to the printed order, reinsert the literal 7, then undo the geometry. Each layer-order case admits 20 known-key states. The exact latent-F reachability DP carries counts over all five phases; literal F emits zero without advancement, and consuming non-F can also emit zero. The first dead input offset is an exact impossibility irrespective of language. The ordinary-clock scores are merely diagnostic, already within the previously tested short-period family in the direct-final-layer order.

| Layer order | Known-key states | Full legal latent-F inverses | Latest first dead offset (0-based) | Best ordinary trigram nats/rune |
| --- | ---: | ---: | ---: | ---: |
| Ciphertext transpose last | 20 | 0 | 166 | −3.419777 |
| Plaintext transpose first | 20 | 0 | 99 | −3.413193 |

The target-independent native trigram model trains on 2,369 solved source runes (excludes WELCOME and p57); these two omitted controls score −2.788536 and −2.791752. The original printed and deinterleaved tapes score −3.444435 and −3.429601. All 40 ordinary candidates exactly replay the original input but are nonprose. All eight source-shaped positive plants (repeat actual held-out WELCOME to the full geometry size, both key orders and both layer orders, two clocks) pass; the four ordinary plants uniquely recover all 1,729 runes and the four latent-F plants have a nonempty exact legal path set. Those latent-F sets are highly ambiguous, so no blind recovery claim is made.

**Decision:** retire the two fixed product-key layer orders, including every tested phase/sign and both clocks. This does not close the separate unknown q8 task or rule out other actual keys or state laws. The source-shaped plants are constructed controls, not authentication of this mechanism. [SFT](../sims/lp2_p7_fivedot_red_product_layer_order_sft.cjs) · [executed case-level data and input blobs](lp2-p7-fivedot-red-product-layer-order-output.json). The core JS ran on the repository inputs twice; standalone Node22 execution is not independently claimed.

## Blind historical-period latent-F recovery on the deinterleaved tape (Agent9, 24 November)

The established LP1 periods 8 and 13 motivate a direct-final-layer transfer without importing the historical key values. Reuse the existing calibrated soft phase-mixture EM, finite hardening and native trigram refinement from the primitive-period gate, restricting the candidate period set to {8,13}. The five-dot inverse is fixed before inference; the 1,729-rune deinterleaved ciphertext is partitioned into 1,123 training, 294 validation and 312 untouched continuation runes. This is the ciphertext-transpose-last order, distinct from the opposite-layer unknown-q8 assignment #2616.

| Test | Selected period | Soft continuation gain (nats/rune) | Hardened continuation gain | Exact continuation |
| --- | ---: | ---: | ---: | ---: |
| Gibran plant | 8 | +0.457777 | +0.464987 | 310/312 |
| Shakespeare plant | 13 | +0.401744 | +0.421659 | 312/312 |
| Original five-dot order | 13 | -0.010910 | No legal hardened key | — |

Both independent controls recover the exact planted key, with complete ciphertext replay. The original's validation-selected q13 soft profile fails to beat the uniform-pad continuation likelihood. Both original MAP hard keys are illegal already in training; the finite q13 hardening search retains no candidate. This is a bounded predictive rejection, not an exhaustive all-key exclusion. The original clue geometry is unchanged; no unknown plaintext is recovered.

[Executed SFT](../sims/lp2_p7_fivedot_q8q13_blind_fhold_sft.cjs) · [deterministic case data](lp2-p7-fivedot-q8q13-blind-fhold-output.json). Existing solver code was reused rather than creating a new optimizer. Core JavaScript executed on the canonical inputs, without a separate CI run.

## Independent five-lane plaintext-autokey (Agent24, 24 November)

The actual five-column geometry also allows an independent one-state plaintext autokey in each physical lane. Exact transparent-F reachability rejects all 29 initial seeds in each original lane; ordinary-clock exact global optimization of all 29⁵ seed tuples against natural-order trigrams recovers both independent plants and all 630 withheld runes but yields pad-like original continuation. [Scoped report and reproduction](lp2-p7-fivedot-lane-autokey-exact.md). Retire this lane-local recurrence; #2616's independently claimed q8 opposite-layer clock is a separate model. No authentic unknown plaintext.

## Research decision

**Retain the header relocation as an explicit clue-constrained candidate, without promoting it to a decipherment.** It is more causally specific than searching unselected 5- or 7-column keys: the five circles, unique numeral, four original numerical alignments, and first-position relocation are fixed by source artifacts. The natural seven-column-only continuation is negative, and the five-dot stencil's reuse makes ornamentation a live rival.

The stronger all-secret test now excludes **every direct continuous-period GP29 alphabet-bijection final layer at any period 1–38** on any of the six source-driven orderings, even with completely unknown keys, under the observed native-English control register. The source-motivated periods 5, 7, 14, 16 and 35 are all inside this precise finite boundary. The fixed latent-F q7 periodic-key and plaintext-fed autokey blind recovery routes both fail their original predictive transfers after independent controls pass. Composing the actual p7 red-word product key with the source-fixed five-dot geometry in either order also fails every one of 40 exact latent-F cases; ordinary-clock outputs are nonprose. The blind q8/q13 direct-final-layer latent-F transfer likewise fails the independent continuation gate. The period-16 XOR subfamily also has an exact all-key ASCII printability obstruction across the six source orders and two bit orientations. A useful successor would identify a **first-party instruction selecting a different value-changing architecture, a changing-state rule, or an independently supplied cipher key** and predict a previously withheld original plaintext span. Further freely chosen permutations, phase shifts or cipher layers chosen solely to improve the observed score would not discriminate the intended solve path from overfitting. No new authenticated unknown LP2 plaintext has been recovered.
