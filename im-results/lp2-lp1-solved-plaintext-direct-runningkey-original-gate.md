# First-release Liber Primus, solved and printed streams, as direct LP2 running keys

**Current decision, 25 November 2026: direct additive, word-number additive and continuous signed BASE29 carry receivers fail on the tested LP1 source registers. No unknown LP2 plaintext or authentic key.** The original Agent 7 direct-key study and its authentic-clock and arithmetic-carry extensions are consolidated below. A simple puzzle-designer move would be to use the first-release Liber Primus's already recovered GP29 rune text as the running pad for the 2014 second release. The first book itself says its words and numbers are sacred; its cipher pages already teach a 29-rune additive Vigenère inverse. This is a *human-plausible* source choice, though no authenticated instruction is known to select the whole LP1 plaintext as a key.

> **Combined-clock extension (25 November):** the exact all-origin F-hold + unlimited collision-redraw Viterbi covers corrected/printed LP1 index/prime keys, both signs and nine original chapter windows. Three target-excluded plants recover all offsets and 434/434 withheld runes. All original prefix winners fail prediction (eight dead, one nonprose); all 72 retrospective variant/window domains are legal but best full scores −5.079 to −4.842. [Decision and raw paths](lp2-lp1-runningkey-fhold-redraw-original-gate.md). This is a finite likelihood rejection, not exact support exclusion.

## Source-fixed experiment

- Key: all **2,799 GP29 runes** in the seven solved original first-release sections of `resources/external/relikd-solved-gp29-native-v1.json`, in the stored print order; punctuation removed. This is a verified-derived transcription of known solved LP1 content, not original JPEG carrier bytes.
- Original untouched ciphertext: all **12,956 GP29 runes** across LP2 physical pp0–55 (physical p50 runeless), `resources/liber-primus/lp2-corpus.json`. The fixed illustrated section starts are `0,729,1874,3603,5506,6527,7960,9640,12648`.
- Receiver: first **729 runes of each of the eight sufficiently long illustrated chapters**; all **308 runes of the ninth**. These are source-visible chapter boundaries, not fitted to a cipher score.
- Fixed cipher: `P[i]=(C[i] ± K[offset+i]) mod29` for both signs. A separately bounded **surrogate** variant treats every *ciphertext* literal rune F (index zero) as transparent `P=F` and advances the source key only on non-F ciphertext. **This is not the authentic historical plaintext-F-transparent cipher:** under the genuine rule a non-F plaintext rune can encrypt to ciphertext F, so its key-consuming branch must remain available. The surrogate's negative results do not exclude the authentic rule. Source key offset is granted freely at every contiguous 729- or 308-rune position: 2,071 offsets for each long chapter and 2,492 for the last.
- Selection statistic: native GP29 index of coincidence, optimized over *all* key offsets separately for each chapter, sign and F-bypass variant. This permissive postselection makes the result favor the hypothesis.

| Original chapter | Max IoC, direct ±, no bypass | Max IoC, literal-F skip ± |
| --- | ---: | ---: |
| p0–2 | 0.0361514 | 0.0396675 |
| p3–7 | 0.0367506 | 0.0386537 |
| p8–14 | 0.0362230 | 0.0381374 |
| p15–22 | 0.0363926 | 0.0395205 |
| p23–26 | 0.0359705 | 0.0388798 |
| p27–32 | 0.0361364 | 0.0396298 |
| p33–39 | 0.0359781 | 0.0376023 |
| p40–53 | 0.0360271 | **0.0400895** |
| p54–55 (308 runes) | 0.0394898 | 0.0392360 |

The exact original 2,799-rune LP1 key's **first 729 original plaintext runes** have IoC **0.060273745**. A fully reversible 729-rune synthetic GP29 additive plant with a deliberately selected LP1 offset recovers its **729/729** source plaintext runes exactly. A second source-shaped plant exercising the **ciphertext-F-skip surrogate** likewise recovers **729/729**, deliberately preventing encrypted non-F runes from producing ciphertext F. This is a positive control for the surrogate only; it cannot validate an authentic plaintext-F clock with ambiguous ciphertext F. The **largest** of all 36 original-cipher chapter×sign×mask maxima is **0.0400895**. None approaches the positive native GP-English register, despite treating each chapter and key origin independently.

**Exact runnable, read-only CommonJS:** [SFT](../sims/lp2_lp1_plaintext_direct_runningkey_original_sft.cjs). The six source-register/encoding combinations were individually computed using the committed JSON/transcription data through the connected GitHub-source runtime; the final consolidated standalone CJS has not yet been run in a local repository checkout or CI.

## Independent first-release source encoding: printed, not decrypted

The same original-player motivation offers a distinct key: the first book's **printed GP29 glyphs in order**, including the portions still encrypted in print. This avoids using its editor-reconstructed plaintext, and makes no choice between stage-specific first-book ciphers. Read the canonical Wulfic original-scan-derived `resources/transcriptions/lp1_wulfic_canonical.txt` in physical order, remove punctuation/numerals/line breaks and concatenate the **2,797 original printed rune identities**. This is source-derived rather than original JPEG bytes, so it is a different historical key proposal from the solved-cleartext stream above.

Run the same exactly fixed nine chapter openings, both additive signs, both F conditions, and *every* key offset against unchanged LP2 ciphertext. As with the first key, all four sign/F forms are complete receiver definitions before scoring.

| Original chapter | Max IoC, printed LP1 direct ± | Max IoC, printed LP1 literal-F bypass ± |
| --- | ---: | ---: |
| p0–2 | 0.0359856 | **0.0402440** |
| p3–7 | 0.0360195 | 0.0377681 |
| p8–14 | 0.0360874 | 0.0381714 |
| p15–22 | 0.0363587 | 0.0393584 |
| p23–26 | 0.0360158 | 0.0386876 |
| p27–32 | 0.0361213 | 0.0390947 |
| p33–39 | 0.0360045 | 0.0372481 |
| p40–53 | 0.0358688 | 0.0393660 |
| p54–55 (308 runes) | 0.0380304 | 0.0393629 |

A synthetic 729-rune source-LP1 plaintext encrypted under the printed stream at a secret offset is recovered **729/729** by the same tested inverse. The strongest of these **72** original index-encoded tests for the first two source registers is **0.0402440**, with no recognizable native GP-English key recovery. This narrows an obvious creator-plausible historical source reuse without implying anything about source-key KDFs, stateful skip paths, ciphertext word order, or other ciphers.

### Complete zero-origin physical overlap (#2769, Agent4, 25 November)

The prior printed-stream tests include the first 729 runes at origin zero. The Director's exact full-overlap extension fixes both physical origins at zero, canonical index subtraction, ordinary consumption, no cycle, no reset, no shift/representation search. Use all 2,797 printed LP1 runes, including encrypted/clear material as printed, against the first 2,797 LP2 runes (p0–10 plus 137 runes of p11). The LP2 transcription and corpus agree over all 13,136 rune identities, including known p56/p57; the physical overlap preserves line/word/page punctuation as a display overlay without altering consumption. Source blob IDs: LP1 37c96b816495c5f93ca658a01c9918bf92598316, LP2 text 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7, corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, native controls 1b064ef6d85819b7d96adaff31a82d1ec551598f.

The exact original candidate re-encrypts 2,797/2,797. IoC .034335275 (uniform 1/29=.034482759), 90 adjacent repeats, add-one native trigram −3.393571 nats/rune. Previously tested first729: −3.392339; new remaining2068: −3.394013. All 12 physical page slices, including the partial final slice, score −3.414354 to −3.371968; no sustained native prose. Independent uniform-pad negatives (256 full-length, fixed LCG seed2769, no candidate selection) range −3.408569..−3.387299, mean −3.395086. Native training uses LP1 sections 0,2,3,4,6; withheld WELCOME, second KOAN, AN END and PARABLE have scores −2.928822, −2.786772, −3.014682, −2.964269 and IoC .059416.. .070028. All four synthetic encryptions under the frozen origin-zero key recover every source rune (1,014/1,014); their 128 matched independent-pad negatives per control all score below the respective true output. These are implementation and linguistic discrimination controls, not independent source-key evidence.

**Decision:** the complete direct operand is noise-like under the frozen receiver, including the previously untested continuation. No new plaintext or authentic key; retire the exact full-overlap proposal without opening another raw artifact. The earlier shorter overlap was already tested and is reused as context, not presented as novelty. [Read-only SFT](../sims/lp1_printed_lp2_zerooffset_full_overlap_sft.cjs) emits every candidate index and preserved separator, controls and per-page diagnostics; core executed in connected V8, standalone Node wrapper not independently run. This is a finite calibrated negative, not an all-cipher theorem.

## Original-koan spelling correction and exact solved register

The candidate *solved* LP1 source has a recoverable **two-word editorial discrepancy**. In `resources/external/relikd-solved-gp29-native-v1.json`, solved `0_koan_1` is **780 runes**, whereas the four original koan pages of `resources/transcriptions/lp1_wulfic_canonical.txt` contain **778 runes**. The original encryption's known GP29 Atbash/reversed+3 decoder is `P=(31−C) mod29`. Its exact application to those 778 printed ciphertext runes aligns against the derived solved text with just two local word replacements:

- Original koan offsets **140–142** read **WHO** (`ᚹᚻᚩ`) in “THAT IS NOT WHO YOU ARE”; the derived relikd solved version reads **WHAT** (`ᚹᚻᚪᛏ`).
- Original koan offsets **276–278** again read **WHO** in “THAT IS WHAT YOU DO NOT WHO YOU ARE”; the derived relikd version again reads **WHAT**.

These corrections come from known LP1 plaintext, not any unknown LP2 decryption. Preserve the independent external reference as published. For key research, rebuild the **2,797-rune source-corrected solved-LP1 key** by replacing only the `0_koan_1` part with the original printed GP29 ciphertext's exact historical inverse.

All 36 source-corrected chapter×sign×F-mask LP2 searches, each with every possible source offset, were executed. Its maximum IoC **0.0400895** (pp40–53, negative sign, literal-F bypass) again fails to recover native GP plaintext. A 729-rune source-shaped synthetic additive plant recovers **729/729** under this corrected key. In total the three-source study comprises **108** original-input combinations, with combined maximum **0.0402440** (original *printed* key, p0 section).

## Historical GP prime numbers as the first-release key alphabet

The solved first-release WISDOM explicitly says **“THE PRIMES ARE SACRED.”** This supplies a concrete second, source-authored numerical reading of any first-release GP rune beyond its 0–28 index: **its corresponding GP prime number, reduced modulo29**. No invented KDF or fitted residue table is required: `K[i] = resources/liber-primus/lp2-corpus.json.prime[LP1Rune[i]] mod29`. The alternate prime-minus-one/totient-of-prime expression differs by a global Caesar shift; its IoC is the same and does not require a separate search.

The three original-order LP1 source registers were each transformed using this exact source-defined prime mapping. Repeat the identical nine original LP2 chapter windows, both ± additive directions, literal ciphertext-F skip on/off, and every contiguous source offset. This adds **108** separate prime-encoded original-input scans to the 108 index-encoded scans. Their maxima are **0.0395280** (published solved LP1), **0.0397202** (original-source-corrected solved LP1), and **0.0398370** (first-release printed LP1). The best original offset is **72** in the first LP2 visual chapter under printed-LP1 prime values, positive addition, ciphertext-F bypass; output remains nonlinguistic. Fully controlled source-GP29 additive plants invert **729/729** with the same prime mapping. Across **216** original-input conditions, the greatest IoC is still **0.0402440**, well below the native first-release register 0.060274.

This retires only the **parameter-free direct GP29 additive reuse** of LP1 as indices or the source's prime values. It does not warrant another fitted prime gap, nonlinear key table or arbitrary source-key clock.

## Literal author-written Koan crib, scanned for authentic plaintext

The two original **WHO YOU ARE** repetitions yield a concrete authored **nine-rune plaintext crib** (`W H O Y O U A R E = 7,8,3,26,3,1,24,4,18`). Rather than assuming its location or post-fitting a cipher key, an exact direct-key test asks whether **any** nine contiguous unknown LP2 ciphertext runes could decrypt to this complete original-source phrase under **any** contiguous 9-rune source segment of each of the six pinned LP1 index/prime keys, with either additive sign.

For each of the 12,948 possible whole-manuscript ciphertext windows, compute the required GP29 nine-rune key word by subtraction/addition against the known crib, then look it up in the complete source-key 9-gram index. The original ciphertext has **zero exact hits** under all six source-key encodings and both signs, even though synthetic plants made from the authentic crib and an independently selected source-key offset are recovered in all six cases. No punctuation or word-boundary constraints were imposed, making this an intentionally permissive necessary-condition check. An authentic plaintext-F bypass cannot change the **nine within-crib key consumptions** because **WHOYOUARE contains no F**. Earlier bypasses can shift the key origin, already allowed by the exhaustive source-offset search; the stated nine-rune crib exclusion is consequently valid for this direct contiguous-key family even under the authentic rule. This is a bounded negative for one exact authored phrase, not a claim that the phrase occurs in unknown LP2 plaintext or that no other key/cipher can carry it. The reproducible SFT above includes the exact crib scan.

## Authentic plaintext-F hold: exact source-key inversion (Agent 2, 24 November 2026)

The original experiments above used all-consuming addition and a surrogate that held on **every ciphertext F**. This new test closes the explicitly identified missing authentic-clock branch without changing the source keys, signs or original chapter windows. Under the genuine LP1/p56 rule, plaintext F=0 emits literal ciphertext F without advancing the running-key pointer; every non-F plaintext consumes one key symbol. Thus a ciphertext F permits a hold **or** a consuming non-F output, and a nonzero ciphertext admits consumption only when the resulting plaintext is nonzero.

Let state (j) be the absolute source-key pointer and (c) the current original rune. Retain (j) when (c=0); retain (j+1) when (j<|K|) and ((c+sK_j)\bmod29\ne0), for inverse sign (s\in\{-1,1\}). These are all legal transitions, independent of any language model. The sorted reachable-set implementation enumerates every possible finite-source starting offset through the last possible offset given the nonzero-ciphertext count. No wraparound, period, alternative source, transposition or internal reset is introduced. Near-end offsets omitted by the earlier full-consumption scan are included where a legal hold could make the remaining key long enough.

**Executed on the original rune tape:** 3 LP1 source registers × 2 encodings × 2 signs × 9 original windows, **231,240 origin tests**, with 729 runes from each of the first eight chapter openings and all 308 runes from the last chapter. Seven chapter windows are impossible even for arbitrary nonlinguistic plaintext; p0–2 and p54–55 retain only 7 and 14 legal variant/offset pairs respectively (not necessarily distinct key streams).

| Chapter | Window runes | Maximum reachable prefix across all origins and variants | Complete legal origins |
|---|---:|---:|---:|
| p0–2 | 729 | 729 | 7 |
| p3–7 | 729 | 570 | 0 |
| p8–14 | 729 | 545 | 0 |
| p15–22 | 729 | 632 | 0 |
| p23–26 | 729 | 685 | 0 |
| p27–32 | 729 | 661 | 0 |
| p33–39 | 729 | 588 | 0 |
| p40–53 | 729 | 629 | 0 |
| p54–55 | 308 | 308 | 14 |

**Actual inverse and disjoint continuation:** each surviving original offset is decoded by exact spacing-free trigram Viterbi with state (absolute key pointer, last two plaintext runes). This jointly chooses all legal F holds; every resulting candidate is forward-encrypted and compared with the exact original input. Model trained on 1,963 runes of solved sections 0, 2, 3 (original WHO-corrected), 4 and 6; no unknown LP2 or target control text appears in training. Backoff pseudo-counts are 0.5 per unigram and 6 for bigram/trigram interpolation. The native WELCOME, second KOAN and PARABLE controls are excluded from training.

| Target | Prefix / withheld | Prefix legal variant/offset pairs | Best prefix score (nats/rune) | Frozen continuation |
|---|---:|---:|---:|---|
| Original p0–2 | 262 / 467 | 2,053 | −4.846626 | No legal continuation for winner or any of its top five prefix candidates |
| Original p54–55 | 232 / 76 | 46 | −4.916722 | Legal but nonprose, −4.967905 nats/rune |
| Native WELCOME plant | 260 / 255 | 2,850 | −2.783668 | 251/255 exact, planted source/encoding/sign/offset recovered |
| Native second KOAN plant | 180 / 139 | 614 | −2.560191 | 139/139 exact, planted source/encoding/sign/offset recovered |
| Native PARABLE plant | 55 / 40 | 18,065 | −3.120740 | 40/40 exact, equivalent edited/corrected key segment at the planted offset |

The prefix selection used all legal source offsets on the prefix alone; full-chapter survival was not a selection criterion. The three planted controls yield **495/495 training-prefix and 430/434 withheld runes**, with exact forward replay. The WELCOME four-rune error shows the language model is not infallible. Twelve 729-rune planted repeat-PARABLE controls at known offset retain their true F clock and recover 8,712/8,748 runes; these are repetitive support/calibration plants rather than independent source discoveries. Actual solved p56 reproduces all 85 original ciphertext runes at authentic prime-totient clock origin 0, and its 84-consuming-symbol path is reachable (there are also alternative legal clock endpoints).

Even with retrospective full-window selection over all 21 legal original variant/offset pairs, the best p0–2 and p54–55 scores are −5.086578 and −4.929351 nats/rune respectively, far below the three independent native controls (true full-text −2.724830, −2.519309, −2.705327). Both best plaintext streams are nonprose; all 21 exact outputs are preserved. For example, the best final-chapter inverse begins GP tokens A R O U S P A D G C Y A C O W Y R IA TH N O EO J E H D. No candidate is an unknown plaintext recovery.

**Reproduce:** [SFT](../sims/lp2_lp1_direct_runningkey_authentic_fhold_sft.cjs); [complete raw output](lp2-lp1-direct-runningkey-authentic-fhold-output.json), committed at [d602255](https://github.com/FlareZ123/liber-primus/commit/d60225528931da1709b22e1db85d793d7ad43611). The actual experiment function ran against the three repository-pinned source blobs in the JavaScript execution environment; the committed CJS wraps that identical function in Node filesystem reads. The three source blob IDs were 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 (LP2 corpus), 1b064ef6d85819b7d96adaff31a82d1ec551598f (solved LP1 reference), and 37c96b816495c5f93ca658a01c9918bf92598316 (printed LP1). The standalone Node wrapper has not been independently run in a checked-out repository. The same script tests the [nine-warning-prime schedule](lp1-warning-nine-prime-chapter-totient-gate.md) under the genuine F clock.

## Continuous signed BASE29 carry: complete nine-chapter inverse (Agent 17, 25 November 2026)

The signed 2013 BASE29 instruction motivates treating the source-corrected 2,797-rune LP1 register as a positional integer rather than adding its digits independently. This is a genuinely different receiver from the prior direct-additive family; the source does not select addition/subtraction of LP1, an offset, or a carry clock. The frozen operation is signed radix-29 addition/subtraction with an ordinary integer carry propagated through the complete illustrated chapter:

```
v = p + s*K[j] + t
c = v mod 29 (nonnegative residue)
t' = (v-c)/29, j' = j+1
p = (c-s*K[j]-t) mod 29
```

The initial carry is zero. With s=+1, t is in {0,1}; with s=-1 it is in {-1,0}. The chapter and key are traversed together in physical order or both reversed; reversed traversal is the conventional least-significant-first treatment of source-order numerals. Enumerate every contiguous source offset, no wrap or repetition. In the ordinary variant every rune consumes; in the historical-style F-hold variant plaintext F emits ciphertext F and changes neither t nor j. Each visible ciphertext zero can therefore branch into a hold or an otherwise legal consuming nonzero plaintext. The exact reachability DP retains all (j,t) states; Viterbi additionally retains the last two plaintext runes and maximizes the same fixed source-native trigram log probability used above. Neither spaces nor original LP2 text train that model. The F-hold variant is a digit-clock hybrid, not ordinary whole-number addition.

**Blind source-native calibration:** four known-envelope hidden-origin controls, WELCOME (515 runes) and second KOAN (319 runes), each once with ordinary consumption and once with latent F. Exclude the entire target section from the source key as well as the five-section language training. Fit the first two-thirds of each traversal, freeze its key origin, carry, source pointer and last-two context, and decode the disjoint continuation. Recover all four planted offsets (457,993,617,1231), **1,110/1,110 fit runes and 558/558 withheld runes**. The four continuation scores are -2.559221, -2.464323, -2.850311, -2.547842 nats/rune; every complete candidate re-encrypts exactly. These four selected plants establish implementation and finite-control recovery, not general English recognition or original key provenance.

**Complete original attack:** all nine illustrated chapters in full, both signs, both paired traversal directions, ordinary and latent-F clocks. Prefix-only fits use 262/467 on p0–2 and 232/76 on p54–55 (reverse cases are length-matched traversal splits, not the physical forward seams); the other seven use floor(2N/3) and remainder. The first and last chapter forward seams have been used by prior research and are not globally fresh holdouts. All ordinary origins must have enough key digits for the known total length; F-hold prefix selection uses only prefix reachability. Independently enumerate every full-chapter reachable origin and maximize the fixed score retrospectively, with no pruning of legal F paths. Scores below are best across directions and signs, in nats/rune.

| Chapter | N | Full latent-F origins (+forward, -forward, +reverse, -reverse) | Ordinary origins per envelope | Best ordinary full score | Best latent-F full score |
|---|---:|---|---:|---:|---:|
| p0–2 | 729 | 0,5,0,0 | 2069 | -5.020836 | -5.206843 |
| p3–7 | 1145 | 0,0,0,0 | 1653 | -5.024168 | — |
| p8–14 | 1729 | 0,0,0,0 | 1069 | -5.108579 | — |
| p15–22 | 1903 | 0,0,0,0 | 895 | -5.140641 | — |
| p23–26 | 1021 | 0,0,0,0 | 1777 | -5.050776 | — |
| p27–32 | 1433 | 0,0,0,0 | 1365 | -5.103707 | — |
| p33–39 | 1680 | 0,0,0,0 | 1118 | -5.113577 | — |
| p40–53 | 3008 | 0,0,0,0 | 0 | — | — |
| p54–55 | 308 | 1,2,0,0 | 2490 | -4.853554 | -5.041086 |

The full 36 latent-F envelopes permit only eight origin/envelope pairs, all in p0–2 or p54–55. No latent-F prefix winner has any legal full continuation. The ordinary full best (terminal +forward) is nonprose, beginning R T G C A U I Y X B R E F L M Y D G U M L T D G J X EA O S R S M C O W C F AE C NG H. The best ordinary frozen continuation is -4.933650, still nonprose. No new plaintext or historical key is identified. P40–53 exceeds the finite LP1 key capacity, and no hold path makes it fit. The exact support exclusion is for seven complete chapters under this fixed carry/state rule; the eight surviving pairs and ordinary variants have a calibrated scoring failure, not a mathematical impossibility of all language.

**Reproduction:** [SFT](../sims/lp2_lp1_base29_runningkey_carry_sft.cjs) and [full executed results](lp2-lp1-base29-runningkey-carry-output.json), code commit 8913e6d11d34ad646f1c14cd63cac048b94fe05a, data f2a71756a16f51da96b34e4eaf5b9475edaaa37a. The same experiment function was executed in the connected JS runtime using repository inputs. No standalone Node CI was run. The archived JSON includes a summary derived from its original rows. Retire this finite source-corrected LP1 carry receiver. Do not expand to arbitrary carry functions, other key-source encodings, or repeated/wrapped keys without an independently motivated source selector.

## Source-corrected LP1 word-number running key (Agent 20, 25 November)

The LP1 warning explicitly preserves both "the words or their numbers"; WISDOM declares the primes and totient function sacred. This motivates a distinct source compression: each printed **solved LP1 word** contributes one key digit, instead of each rune contributing one. It does not uniquely select this operation, cycling, or an additive receiver. No unknown LP2 words or separators are used.

From the same seven native solved LP1 sections and original WHO corrections above, parse contiguous runs of the **exact 29-glyph set**, yielding 2,797 runes in 695 words. For each word, let S be its GP prime sum. Freeze two 695-digit cyclic keys K[j]=S[j] mod29 and K[j]=phi(S[j]) mod29. Test both encryption signs, ordinary consumption and genuine transparent plaintext-F holds. At every original illustrated chapter start take 308 original runes, selecting from all 695 starting phases on the first 200 alone and freezing the winning phase, clock and two-rune context for the remaining 108. Exact Viterbi merges states only when current key phase and last two plaintext symbols coincide; it maximizes a fixed GP29 trigram with backoff counts (0.5 unigram pseudo-count and 6 bigram/trigram interpolation mass) trained on 1,963 source-native runes from LP1 sections 0,2,3,4,6. No use of LP2 boundaries or text for training. A cyclic test includes ordinary nonwrapping origins but is a conjectural extension of finite LP1 reuse.

Four source-excluded plants use 308-rune windows from WELCOME and second KOAN (two texts; some windows overlap), each removing its entire plaintext source section from its candidate key register. Every plant recovers exact key mapping, sign, hold setting and starting phase, 800/800 prefix and 432/432 frozen continuation runes. All four wrong-source controls use deterministic shuffles of the actual key digits; their best prefix-selected continuation scores range from −5.383 to −5.189; the most favorable continuation among all eight preselected variant winners is −4.925188. True plant continuations range from −2.701 to −2.472. The authentic historical p56 prime-minus-one clock replays 85/85 independently. All returned original and synthetic paths replay their observed ciphertext exactly; this verifies the state machine, not key identity.

| Original chapter | Prefix-selected score | Frozen continuation | Best continuation among all 8 variant prefix winners |
|---|---:|---:|---:|
| p0–2 | −4.763073 | −5.611960 | −5.001325 |
| p3–7 | −4.793975 | −5.227493 | −5.001517 |
| p8–14 | −4.763809 | −5.351115 | −5.055198 |
| p15–22 | −4.740469 | −5.122525 | −5.053985 |
| p23–26 | −4.745938 | −5.283778 | −5.120562 |
| p27–32 | −4.738189 | −5.434854 | −5.099118 |
| p33–39 | −4.826803 | −5.198353 | −5.142423 |
| p40–53 | −4.795577 | −4.889016 | −4.889016 |
| p54–55 | −4.681391 | −5.281248 | −5.281248 |

Every overall original prefix winner chooses ordinary consumption. The best original continuation is slightly higher than the maximum of the four wrong-source control sets (−4.889 vs −4.925), but remains decisively separated from the finite native controls and is nonprose. These four nulls do not provide a calibrated p-value. The test rejects this fixed word-number-as-rune additive construction as a promising source-key receiver, not all word-number operations or all possible plaintext. The chapter openings and last split are not globally untouched by earlier project work; the holdout is internal to this invocation. The initial implementation's Unicode range accidentally omitted IA (U+16E1); its explicit 2,797-rune length assertion rejected it before scoring. The corrected parser matches the exact GP29 set.

[SFT](../sims/lp2_lp1_wordnumber_runningkey_sft.cjs) · [all original and control paths](lp2-lp1-wordnumber-runningkey-output.json). The identical experiment function was executed in the JavaScript research runtime on source blobs `1b064ef6d85819b7d96adaff31a82d1ec551598f` and `43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7`; standalone Node wrapper not yet CI-tested. Code commit `241ce4ece0c62ab8645fc4084b134be11ef22271`, raw data commit `c073389a9b4602df252e585071636df3ae34357b`. No unknown LP2 plaintext, authentic key or continuation destination recovered.

## Decision

The three finite LP1 running-key source registers (edited solved, original-source-corrected solved, and original printed), represented as GP indices or GP prime residues and used as contiguous direct additive GP29 keys, now fail under all-consuming, blanket ciphertext-F-skip, and authentic latent plaintext-F-hold models. The first two are language-score negatives; the authentic F-hold test is an exact support obstruction on seven original openings, and a calibrated native-prose/predictive failure on the remaining two. It rules out this particular all-chapter source-reuse architecture, even granting independently chosen chapter origins and signs. It does **not** mathematically exclude arbitrary nonlinguistic output on p0–2/p54–55, arbitrary wraparound, hidden state, different key derivations, or different ciphers. The distinct cyclic word-number receiver (695 prime-sum or totient digits, ordinary or authentic F-hold) also fails nine original frozen continuations despite exact source-native plants. No unknown LP2 plaintext, historical key, or destination has been recovered. The separate continuous signed BASE29 carry extension on the corrected solved source reaches the same decision: seven complete chapters admit no latent-F path, and all eight surviving origin/envelope pairs plus the ordinary variants fail native-like original inversion. This is not a general carry-cipher exclusion. Reopen only with a new independently selected source operation or operand; do not repeat this source-key menu or offset sweep.
