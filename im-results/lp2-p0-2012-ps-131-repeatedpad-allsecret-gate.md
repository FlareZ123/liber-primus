# Opening p0 131+131 repeated-pad gate using Cicada's 2012 postscript length

**Decision (13 November 2026, Agent 1):** a source-motivated, exactly aligned two-time-pad route does not yield the key-independent difference distribution expected of ordinary GP29 English. No unknown plaintext, authenticated key, or destination is recovered.

## Human-visible premise and explicit missing instruction

The historical Cicada **2012 Valete postscript** is a single **131-decimal-digit number** (see [the authenticated-source RSA analysis](crossround-2012-ps-rsa-lp2-oaep-gate.md)). The original opening LP2 p0, archived as `17.jpg`, contains **262 GP29 runes**, exactly **2×131**. The two prominently opposed crosses on pp0–2 are physically repeated 180-degree-rotated drawings, as established in [the cross-artwork original scan study](p0-rotated-cross-source-readorder-gate.md). Together these suggest an inexpensive check of a **single 131-symbol additive pad repeated exactly twice** over the 262 opening runes.

The weakest premise is whether the historical decimal number should be reused as a rune key at all; **no signed Cicada instruction connects the 2012 postscript to p0's two exact halves**. The source alignment is retrospective. The statistical test below grants *any possible unknown 131-symbol pad*, which is stronger than testing only decimal digits.

## All-key inverse and original result

For original page rune indices `C[0..261]`, assume one 131-symbol pad `K[0..130]` was reused under the same ordinary GP29 additive clock, with unknown values:

`C[i] = P[i] + K[i] (mod29)`, `C[i+131] = P[i+131] + K[i] (mod29)`.

The pad cancels **exactly**:

`D[i] = (C[i] - C[i+131]) mod29 = (P[i] - P[i+131]) mod29`.

Thus neither 131 pad values nor their source encoding need to be guessed. On the untouched original p0, **4/131 aligned pairs match exactly**. Under an independent-source GP29 English marginal model, the expected equal-pair count is approximately **7.8–8.2/131**, depending on the literary source.

For a more complete 29-residue difference fingerprint, train each control's native GP29 unigram law, convolve it with its own reversed law to obtain `Pr(P1-P2=d)`, then score all 131 original residues by the log-likelihood ratio against uniform `1/29`. More positive means more compatible with ordinary paired English differences. The controls use conventional GP transliteration (including `ING`, digraphs, `QU→CW`, `K→C`, `V→U`, `Z→S`). Each comparative distribution contains source-native pairs of adjacent 131-rune blocks from the **same control**, sampled at fixed stride 17. This conditions on the proposed original same-page pairing instead of using independent letters only.

| Control, GP-native | Original p0 log ratio | Median genuine-control log ratio | Original percentile among control windows | Source windows |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare, first 300k raw letters | **−3.7275** | +2.7338 | **0.00305** (39/12,788) | 12,788 |
| Gibran, *The Prophet* | **−3.6751** | +3.1458 | **0.00436** (16/3,673) | 3,673 |
| Emerson, *Essays* | **−4.0629** | +3.2925 | **0.00195** (37/18,990) | 18,990 |

These are **finite-control rank comparisons**, not independent p-values. All windows within a source overlap, and the three sources share broad English rune statistics. The same original p0 differences score unusually poorly under all three registers. The statement is conditional on normal GP29 English in both underlying aligned halves, the same unchanged mod29 additive pad, and their source-order pairing. An alternate plaintext language/register, a variable clock, a non-additive cipher, a different segmentation, or a deliberately source-correlated pair is outside the gate.

## Constructive exact positive and next decision

The standalone [CommonJS regression](../sims/lp2_p0_2012_ps_131_reuse_keyless_sft.cjs) reads the original 262-index p0 from `resources/liber-primus/lp2-corpus.json`, builds each independently supplied native-GP control from the checked-in books, reproduces all three source comparison ranks, and constructs a 131-digit deterministic GP29 pad. Applying the **same pad** to two genuine 131-rune English windows reconstructs the source's complete 131-residue difference string *exactly*. The observed original difference signal is the obstacle; a wrong choice of key digits cannot repair it within this model.

**Research decision:** retire the literal p0 `131+131` identical GP29 pad hypothesis for ordinary English. The exact cardinality match warrants recording but offers no plaintext or key. A new route must provide an actual author-selected key use, an independently specified altered register, or a different cipher architecture. Do not brute-force 131 offsets or local rotations to rescue this particular retrospective count.
