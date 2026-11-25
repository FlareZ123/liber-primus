# Wulfic Stage AK crosswalk and local two-ciphertext-context reproduction

## Decision

Wulfic's current main is accessible and pinned. C1–C28 substantially overlap local anti-doublet, periodic-key, homophonic, Quagmire, word/block, and predecessor-feedback investigations; their Wulfic statistics are external prior art, not local reruns. C29 contains a genuinely new symbol-level invariant for alphabet selection by two earlier ciphertext runes. The closest local two-history tests are not equivalent: they test separable/additive or word-level collision models, not the same-label/same-rune pair count for an arbitrary per-context alphabet.

One bounded C29 discriminator was independently reproduced on the local canonical rune tape: the immediate context (C[i-1], C[i-2]). It excludes that specific symbolwise context-selected alphabet model under Wulfic's source-section resets. It does not decrypt any rune and does not test all 66 lag pairs, the three-rune context, or per-unit periods.

## Pinned external source and exact input

- Repository: https://github.com/Wulfic/Cicada3301-Liber_Primus
- Verified main head: 521cb08a689d2159cf54e3c569fd59588601f875 (14 November 2026).
- Exact source file: data/canonical/liber_primus_master.txt, SHA-256 df7eaaa0c92243946803a7a90a7bfdcb36c0eba73f964f3a093c238ab01a5746.
- Provenance in that revision traces the master to rtkd/iddqd commit 3089b656, with the later numeric-grid overlay from f804b85. Its provenance note says the rune sequence is identical to the older runes_full.txt on all 57 LP2 rune pages.
- Local input: resources/liber-primus/lp2-corpus.json (Git blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165). A direct page-by-page comparison of Wulfic's p0–55 rune sequences against local pages 0–55 found 56/56 exact matches, 12,956/12,956 runes. Physical p50 is included as a runeless page and contributes no GP29 rune.
- Important boundary caveat: local resources/lp2-transcription.txt has a different dollar-marker partition from Wulfic's nine LP2 source segments. The selected test uses Wulfic's source-derived segment lengths [729, 1145, 1729, 9, 1894, 1021, 1524, 1589, 3316], which sum to 12,956, while taking the rune values from the local canonical corpus. It does not silently treat the local dollar markers as equivalent.

The Wulfic README quick-start reports 170 tests, while its current MASTER_TRACKER reports 300 tests passing. The tracker is the more current research index, but this invocation did not rerun the external full suite.

## Wulfic's C1–C29 inventory and local crosswalk

All Wulfic rows use the same pinned 12,956-rune LP2 input above. The Wulfic output/control summaries below are transcribed from reference/findings/lp2_logic_findings_2026-09-29.md at the pinned main revision. “Local analogue” means overlapping local scope, not an assertion that the Wulfic statistic was already reproduced locally.

| ID | Wulfic model/test and reported output | Existing local analogue | Crosswalk |
|---|---|---|---|
| C1 | Anti-doublet ignores word boundaries: within-word 0.63%, across-word 0.80%, versus 3.45% baseline. | im-results/lp2-doublet-boundary-audit.md; im-results/lp2-doublet-gap-source-boundary-conditional-gate.md | Direct family overlap; Wulfic's exact split was not rerun. |
| C2 | No plaintext-F passthrough: F=458 versus 447 expected; χ²=26.4 on 28 df. | im-results/lp2-fixed-reserved-rune-doublet-source-gate.md; im-results/lp2-first-party-clear-gp-doublet-baseline.md | Direct family overlap. |
| C3 | No single plaintext letter explains survivors: 26 letters fail; NG, IA and EA positional predictions have LLR −106/−149/−68. | im-results/doublet-plaintext-letter-marker.md; im-results/lp2-doublet-marker-allcoeff-order4-original-gate.md; im-results/lp2-zeroanchor-root8-allsecret-original-gate.md | Direct marker-family overlap. |
| C4 | Plaintext-independent additive mod-29 key predicts 3.20–3.60% doublets versus 0.66% observed. | im-results/lp2-periodic-affine-plaintext-difference-predecessor-recovery.md; im-results/lp2-vnull-periodic-allkey-capacity.md | Direct additive/periodic-key overlap. |
| C5 | Only lag 1 is depleted; lags 2–10 are 3.38–3.69%. | im-results/lp2-doublet-lag5-line-overlap.md; im-results/lp2-doublet-gap-nonstationarity-ordering.md | Direct lag-structure overlap; different exact lag statistic. |
| C6 | One system/no seam: χ²=5.33 on 8 df, p=0.72; early/late p=0.099. | im-results/lp2-doublet-gap-chapter-rate-identity-original-gate.md; im-results/lp2-doublet-gap-source-boundary-conditional-gate.md | Direct section-homogeneity overlap. |
| C7 | One-shift-per-word predicts 2.39% within-word doublets versus 0.63% observed (z=−11.6). | im-results/lp2-previous-cipherword-literal-vigenere-gate.md; im-results/lp2-wordclock-twohistory-original-inverse-gate.md | Direct word-clock overlap. |
| C8 | Re-key collision identity: p+k′=c₋₁ iff k′=k. | im-results/doublet-exception-channel.md; im-results/lp2-quote-collision-redraw-periodic.json | Direct algebraic-mechanics overlap. |
| C9 | No in-step periodic key / per-position alphabets at lags 11–1000; best p=3.4×10⁻⁴ versus 10⁻⁵ threshold. | im-results/lp2-vnull-periodic-allkey-capacity.md; im-results/lp2-singleton-periodic-key-necessary-bound.md; im-results/lp2-periodic-affine-plaintext-difference-predecessor-recovery.md | Direct family overlap; Wulfic's exact lag sweep is not rerun. |
| C10 | English-text running keys (letters, prime values, φ) fail with LLR −255…−333. | im-results/lp2-solvedsource-periodic-delta-crib-original-gate.md; im-results/lp2-ciphertext-totient-prime-index-clock.md | Partial: source-key and arithmetic-key tests overlap, but not the identical corpus/crib enumeration. |
| C11 | Ciphertext autokey at lags 2–1000: best p=5.6×10⁻⁴ versus 5×10⁻⁶. | im-results/lp2-cipher-feedback-conditional-entropy-gate.md; im-results/lp2-previous-ciphertext-clause.md | Partial: local predecessor-feedback tests cover narrower structures/units. |
| C12 | Alphabet chosen by one earlier ciphertext rune, L≤1000: best p=3.9×10⁻³ versus 10⁻⁵. | im-results/lp2-previous-cipher-row-allsecret-capacity.md; im-results/lp2-previous-cipher-row-collision-allsecret-gate.md; im-results/lp2-cipherprev-quasigroup-majorization-allsecret-original-gate.md | Direct one-predecessor family overlap; lag and row scopes differ. |
| C13 | Small key alphabets (digits, hex, letters) fail; LLR −214/−19.5/−14.3/−122. | im-results/lp2-vnull-periodic-allkey-capacity.md; im-results/lp2-source-keyword-wordrotated-mixed-autokey-gate.md | Partial: local all-key/keyword screens overlap, not an identical small-alphabet enumeration. |
| C14 | “Skip to next key value” re-keying fails; LLR=−21.3. | im-results/doublet-exception-channel.md; im-results/lp2-quote-collision-redraw-periodic.json | Direct re-key-mechanics overlap. |
| C15 | Homophonic substitution without a stream on top: minimum χ²=4,802 versus 200 observed. | im-results/lp2-diff-wordphase-homophonic-information-bound.md | Partial: local homophonic information bounds overlap; not the same optimization. |
| C16 | Independent random-alphabet tabula with ≤153 effective classes fails under alignments/desynchronizations; P≤10⁻⁴ at the reported bounds. | im-results/lp2-vnull-periodic-allkey-capacity.md; im-results/lp2-previous-cipher-row-allsecret-capacity.md | Partial: arbitrary-alphabet and row-capacity work overlaps, but not this exact tabula alignment scan. |
| C17 | Any iid plaintext-independent key/alphabet family needs Σb²≥0.06232; P(X≤86)≤10⁻⁴ below 0.05925. | im-results/lp2-vnull-periodic-allkey-capacity.md; im-results/lp2-ciphertext-indexed-feedback-table.md | Direct statistical-family overlap; Wulfic's interval bound is not locally rerun. |
| C18 | Random Quagmire alphabets do not rescue English/prime/Latin/digit keys; worst P=1.7×10⁻¹¹; uniform A–Z is underpowered. | im-results/lp2-clock-quagmire-full-affine-original-model-gate.md | Direct Quagmire-family overlap. |
| C19 | 34 named LP keyword alphabets, K/K⁻¹, 314,432 triples: no qualifying English/digit lead; best member LLR≤−27.9. | im-results/lp2-2014-keyword-wordedge-advance-original-gate.md; im-results/lp2-source-keyword-wordrotated-mixed-autokey-gate.md; im-results/lp2-two-clock-prime-keyword-screen.md | Partial/direct: named-keyword families overlap; the exact 314,432-member enumeration is not claimed locally. |
| C20 | Word-deterministic ciphers and fixed aligned 2–4-rune blocks fail or are underpowered; 26/72 cells excluded, 46 untestable. | im-results/lp2-allsecret-fixedblock-equality-original-gate.md; im-results/lp2-allsecret-minimum-finitestate-wordcollision-original-gate.md | Direct word/block collision overlap. |
| C21 | Keyless sliding plaintext context F(p[i−a]…p[i+b]) at widths ≤2 (section reset) or ≤1 (continuous) is mostly untestable/excluded; 5/26 cells excluded. | im-results/lp2-separable-twohistory-feedback.md; im-results/lp2-wordclock-twohistory-original-inverse-gate.md; im-results/lp2-p39-quadratic-twohistory-allsecret-wordkey-original-gate.md | Partial: local tests cover separable, word-clock and quadratic two-history models, not every fixed F. |
| C22 | Key/alphabet sequence does not restart at each section, paragraph, clause, written line or page; all five unit types excluded. | im-results/lp2-doublet-gap-source-boundary-conditional-gate.md; im-results/lp2-doublet-gap-nonstationarity-ordering.md | Direct unit-restart family overlap. |
| C23 | Long continuous periodic keys, periods 11–11,781, and long reused ciphertext-independent stretches fail the reported F/S thresholds. | im-results/lp2-vnull-periodic-allkey-capacity.md; im-results/lp2-periodic-affine-plaintext-difference-predecessor-recovery.md | Direct long-period family overlap; exact period sweep not rerun. |
| C24 | LP2 ciphertext as key at lags 11–12,863, forward/backward, fails all 1,490,948 reported hypotheses at F≤−10. | im-results/lp2-cipher-feedback-conditional-entropy-gate.md; im-results/lp2-previous-ciphertext-clause.md; im-results/lp2-ciphertext-indexed-feedback-table.md | Partial: local ciphertext-feedback families overlap, but exact lag/direction sweep differs. |
| C25 | Any-alphabet periodic key, periods 11–4,907: 10,030/12,935 lags excluded. | im-results/lp2-vnull-periodic-allkey-capacity.md; im-results/lp2-singleton-periodic-key-necessary-bound.md | Direct periodic-key family overlap; exact all-alphabet scan not rerun. |
| C26 | Additive/Beaufort key with constant per-unit shifts does not restart at sections, paragraphs, clauses, lines or pages; all five excluded. | im-results/lp2-doublet-gap-source-boundary-conditional-gate.md; im-results/lp2-periodic-affine-plaintext-difference-predecessor-recovery.md | Direct per-unit restart family overlap. |
| C27 | Base-29 expansions/concatenations of π, e, φ, radicals, ln2, primes, integers and φ(p) fail; 270 cells testable, best LLR=−56.0. | im-results/lp2-ciphertext-totient-prime-index-clock.md; im-results/lp2-p0-title-base60-totient-navigation-candidate.md | Partial: local arithmetic/totient leads overlap, but the exact constant-stream family is not locally repeated. |
| C28 | φ(n), σ(n), Σφ(k), prime gaps, φ(φ(n)), nφ(n) mod29 fail; 324 cells testable, best LLR=−47.9. | im-results/lp2-ciphertext-totient-prime-index-clock.md; im-results/lp2-doublet-prime-totient-reset-source-gate.md | Partial: local totient/prime-index tests overlap; not the full exact sequence set. |
| C29 | Any alphabet chosen by two earlier ciphertext runes at lags 1≤a<b≤12, by the previous three ciphertext runes, or by each unit's own period 1–40: 0/307 labels fire, max z=3.29; 285 excluded, one testable line×18 label remains open, six untestable, fifteen with no pairs. | im-results/lp2-separable-twohistory-feedback.md; im-results/lp2-wordclock-twohistory-original-inverse-gate.md; im-results/lp2-p39-quadratic-twohistory-allsecret-wordkey-original-gate.md; im-results/lp2-allsecret-minimum-finitestate-wordcollision-original-gate.md | Genuinely new statistic. Those local tests are additive/separable, word-level, or phase-conditioned; none is the same-label/same-rune pair invariant for arbitrary two-ciphertext-context alphabets. Per-unit own-period labels are also not an exact local match. |

## Selected local reproduction: C29, lag pair (1,2)

### Hypothesis and exact prediction

For a fixed label u(i)=(C[i-1], C[i-2]), suppose each label selects one fixed monoalphabetic alphabet σᵤ, so C[i]=σᵤ(P[i]). Then equal plaintext runes inside the same context class must map to equal ciphertext runes. Therefore the original K, the number of position pairs sharing both context label and current rune, must be much higher than a flat/unstructured ciphertext null if the plaintext has an English-like rune distribution.

This is a necessary-condition test for this model, not a decryption attempt. It does not assume a particular permutation or additive shift; the statistic is invariant under any fixed alphabet per context.

### Local input and segmentation

- Local corpus: resources/liber-primus/lp2-corpus.json, pages 0–55, 12,956 GP29 indices.
- The 56 page sequences were compared directly to Wulfic's pinned master and matched exactly.
- Source-derived segment lengths: 729, 1145, 1729, 9, 1894, 1021, 1524, 1589, 3316.
- Context history is reset for the first two positions of each of the nine segments; equal context labels are pooled across segments, as in Wulfic's context_codes/coincidences implementation.

### Algorithm and matched controls

- Original statistic: K = Σᵤ,ᵣ choose(nᵤ,ᵣ, 2), where nᵤ,ᵣ counts occurrences of current rune r under context u.
- Null: 1,000 deterministic draws from the local LP2 unigram distribution, with the same nine segment lengths and the Stage-Z anti-doublet rule (keep=0.19). The rule queues initial doublets, retains each with probability 0.19, otherwise redraws a uniform GP29 rune, and queues a newly created next-position doublet.
- Positive: 20 planted context-table encryptions using a fixed random additive table indexed by the previous two ciphertext runes. Plaintext uses a 29-symbol English-letter-frequency proxy; the same segment resets apply. A would-be doublet is re-keyed by a nonzero shift with probability 0.81. This is a synthetic positive, not Wulfic's Emerson word corpus.
- Negative: 20 English-frequency streams encrypted with independent per-position random shifts, followed by the same anti-doublet redraw rule.
- PRNG: deterministic mulberry32; seeds 0x330100+i (null), 0x441000+i (positive), 0x551000+i (negative). Sample SD uses n−1.
- Fire rule for this one label: z≥5 and K above every null draw. Positive control is considered powered at 20/20 fires; the original is excluded if K≤positive mean−5 positive SD.

### Output

| Quantity | Local result |
|---|---:|
| Original K | 3,569 |
| Null draws | 1,000 |
| Null mean / sample SD | 3,601.38 / 64.96 |
| Null maximum | 3,811 |
| Original null z | −0.50 |
| Positive controls | 20/20 fire |
| Positive mean / sample SD | 6,843.05 / 96.60 |
| Positive exclusion cutoff (mean−5 SD) | 6,360.05 |
| Negative controls | 0/20 fire |
| Negative maximum null z | 1.15 |

The original is not above the null maximum and is far below the planted positive cutoff. The lag-(1,2) context-selected alphabet is therefore excluded by this discriminator.

### Limits and next decision

- This local run tests only the immediate lag pair (1,2). It does not reproduce the other 65 pair labels, the three-rune context, or the 240 unit×period labels.
- Wulfic's full Stage AK result is external prior art: 0/307 labels fire; 285 are excluded; the one testable unit label left open is line×18; six labels are untestable and fifteen have no pairs. Its negative control never fires (maximum z=3.60); positive means begin at z=9.2. The main context has K=3,569 versus null 3,600.5±64.5 and positive mean 6,751.6.
- The local synthetic positive differs from Wulfic's Emerson-word positive. The local result is an independent power/control check, not an exact replication of Wulfic's 20 Emerson draws.
- A stream key layered on top, contexts of four or more runes, lags above 12, a key that advances by consuming values, hidden state, and per-unit periods outside the tested ranges remain open.
- No plaintext, key, reversible receiver, destination, or Cicada continuation is recovered. Do not promote this exclusion into a general impossibility claim.

## Reproduction

Run from repository root:

    node sims/lp2_wulfic_c29_lag12_reproduction_sft.cjs

The script uses only Node built-ins and the local canonical corpus. It asserts the 12,956-rune input, the pinned section-length sum, K=3,569, 20/20 planted positives and 0/20 independent-key negatives.
