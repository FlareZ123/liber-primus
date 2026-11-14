# Lossless coding capacity of LP2's original adjacent-repeat deficit

**Scope and status (14 November 2026).** This report contains (i) an exact, source-original information-accounting theorem for proposed **universal fixed-length runic encoders** that force ciphertext into a rare-repeat subset, (ii) a source-pinned injectivity gate for Wulfic's 2026 anti-doublet generators, (iii) a full-boundary and key-skip/output-rewrite identifiability gate, and (iv) a distribution-level smearing bound for stationary independent additive GP29 keystreams, and (v) a source-conditioned gate for an exact balanced 29-vertex directed-edge cycle. None is a proposed historical Cicada cipher or plaintext recovery. The source inputs are the unchanged [canonical LP2 corpus](../resources/liber-primus/lp2-corpus.json), [canonical master transcription](../resources/transcriptions/liber_primus_master.txt), and [original-image punctuation annotations](../resources/liber-primus/lp2-ink-annotations.json). Reproduction: [Node capacity proof](../sims/lp2_anti_repeat_lossless_capacity.cjs) and [extended Wulfic/model-identifiability gate](../sims/wulfic_antidoublet_reversibility_gate.py).

## Why it matters for a full inverse

The actual 55 rune-bearing unknown LP2 physical pages contain **12,956 runes** and **12,901 within-page successor positions**; exactly **86** of those successors repeat the previous rune. Uniform iid GP29 strings would have **12,901/29 = 444.862069** repeats on average. This near-uniform-but-anti-repeating property has encouraged ciphers that *rewrite* unwanted repeated outputs, reject a proposed glyph, map a 29-rune plaintext stream directly to 28 nonzero differential steps, or treat 86 doubles as a special escape symbol.

These can be useful statistical generators without being **decoders**. A deterministic many-to-one rewrite loses information. A full solution must prove where overwritten information lives and how it is recovered from the original artifact. A fixed plaintext/key pair can still be an exceptional case, but the low repeat count is statistically inconsistent with a common stationary independent additive GP29 keystream under the tested English-like plaintext model (bound below).

## Independent additive-keystream smearing bound

For a position-wise additive GP29 stream
\[
C_i=P_i+K_i\pmod{29},
\]
define \(\Delta X_i=X_i-X_{i-1}\pmod{29}\). If the plaintext-difference process and the key-difference process are independent, and the key differences share a stationary distribution across the stream, then
\[
\Pr(\Delta C=0)=\sum_{d=0}^{28}\Pr(\Delta P=d)\Pr(\Delta K=-d)
\geq \min_{d\in\mathbb Z_{29}}\Pr(\Delta P=d).
\]
The equality follows from \(\Delta C=\Delta P+\Delta K\); the lower bound is the minimum of the plaintext-difference probabilities because the key-difference probabilities form a convex weighting. It holds for any common stationary key-difference law, not only a uniform OTP. A repeating key, independent running key, or the same page-reset pad reused on every page is within this model. It is a distribution-level expectation bound, **not** a deterministic impossibility theorem for every fixed key/plaintext pair.

**Original LP2 count:** 56 physical pages p0–p55 (one runeless), 12,956 runes, 12,901 within-page transitions, and 86 equal adjacent pairs: \(86/12,901=0.666615\%\).

**Pinned English control:** the existing GP29 encoder from sims/lp2_red_heading_self_key_vigenere_sft.cjs (digraphs TH, NG, EO, OE, AE, IA, EA; K/Q→C, V→U, Z→S) maps resources/control/shakespeare_first300k.txt to 216,874 symbols and 216,873 deltas. Its least frequent delta is residue 18, with 3,778/216,873 = **1.7420%**. More conservatively, every one of the **203,973** contiguous control windows containing exactly 12,901 transitions has a least-populated delta bucket of at least **168/12,901 = 1.3022%**. No such window reaches the original LP2 repeat rate of 0.6666%; the worst-window lower envelope is still 1.95× the observed rate. The exhaustive matched-window calculation avoids selecting a favorable English excerpt.

This strongly disfavors ordinary **stationary independent additive** OTP/Vigenère/running-key explanations under an English-like stationary plaintext model, even when the same pad clock resets at each page. It does **not** exclude a non-English or deliberately constructed plaintext with a rarer delta bucket, an exceptional fixed key/text alignment, non-additive transforms, position/page-specific key laws correlated with plaintext structure, or feedback-/plaintext-dependent state. Rejection sampling or collision-triggered skips remain possible only if the lost/rejected information is reversibly carried or reconstructible; the information-capacity theorem above still applies to any claimed universal constrained-output encoder.

An independent Round43 analysis in [Dukotah/cicada3301, commit fbd1950](https://github.com/Dukotah/cicada3301/commit/fbd1950f24e5ad507b7b7d1d1b19e460b4bb5c27) derives the same smearing inequality using a KJV control. The local reproducer at ../sims/lp2_independent_additive_delta_bound_sft.cjs independently recomputes the original LP2 count, the Shakespeare GP29 histogram, and every matched 12,901-transition control window. The earlier 42,408-setting historical onion byte Vigenère/Beaufort screen already includes per-page resets; do not repeat that pad family.

**Research consequence:** stop treating blind independent additive pad searches as a high-priority route. Seek an independently source-selected feedback-dependent, rejection-based, non-additive, or otherwise plaintext/ciphertext-coupled reversible mechanism. This is a constraint on architecture, not a recovered key or plaintext.

## Exact counting theorem

Fix all 55 original page lengths and the GP alphabet size 29. There is one unconstrained starting rune per page and a total of \(N=12,901\) subsequent transitions. A transition either repeats the previous rune (one choice) or differs (28 choices).

For a fixed **binary repeat mask** with \(k\) repeated positions, the number of permitted ciphertext rune books is

\[
A_{\mathrm{mask}}(k)=29^{55}\,28^{N-k}.
\]

For **exactly \(k\) repeats, anywhere**, the number of books is

\[
A_{=k}=29^{55}{N\choose k}28^{N-k}.
\]

For **at most \(K\) repeats** the book count is \(\sum_{k=0}^{K}A_{=k}\). Dividing by all possible \(29^{12,956}\) GP books gives the exact binomial tail

\[
\frac{A_{\le K}}{29^{12,956}}
=\sum_{k=0}^K{N\choose k}
 (1/29)^k(28/29)^{N-k}
=\Pr\big[\mathrm{Binom}(N,1/29)\le K\big].
\]

An injective map from **all** GP29 plaintext books of these lengths into a constrained ciphertext book plus a \(b\)-bit plaintext-dependent sidecar requires

\[
2^b A\ge 29^{12,956}
\quad\Longrightarrow\quad
b\ge\left\lceil\log_2(29^{12,956}/A)\right\rceil.
\]

A preshared, plaintext-independent secret key does **not** increase the number of available ciphertext/sidecar combinations under any *fixed* key. It can of course change which individual plaintext maps to which ciphertext.

## Original-input bounds

| Restriction imposed on *all* outputs of the proposed encoder | Exact information deficit | Minimum integer sidecar size |
| --- | ---: | ---: |
| At most 86 repeated transitions in the whole book | 325.450254 bits | **326 bits / 67 GP29 symbols** |
| Every original page has at most its observed count | 430.561201 bits | **431 bits / 89 GP29 symbols** |
| Every original page has exactly its observed count | 445.731558 bits | **446 bits / 92 GP29 symbols** |
| Repeat/nonrepeat mask fixed at all 12,901 original positions | 1,066.559492 bits | **1,067 bits / 220 GP29 symbols** |

The per-page rows are products of independent \(\mathrm{Binom}(L_j-1,1/29)\) masses or cumulative probabilities using **each original physical rune page** \(j\) with \(L_j\) runes. The 55 original page-specific pairs \((L_j,k_j)\), including the short p49/p51/p55 regions, are printed in the reproducer's JSON output. Runeless physical p50 contributes no initial symbol or transitions.

The at-most-86 and exact-mask bounds differ because freedom to choose **which 86 positions** repeat carries \(\log_2{12,901\choose86}=740.809882\) bits of combinatorial choice; it would be incorrect to treat a freely chosen mask as if its positions were known in advance. In particular, a model that merely rewrites collisions but does not transmit enough information to distinguish original inputs is *provably nonuniversal* under the stated output constraint, not just "possibly lossy."

**Concrete architecture gate:** a supplementary channel supplying only **256 arbitrary binary bits** is too small for an encoder that must accept all original-length GP29 inputs and always output no more than 86 repeats: 256 is below the unconditional 326-bit minimum. However, the known 256 ink/grid-event coincidence does **not** mean there is exactly a 256-bit channel. Positions, symbols and printed bytes could encode many more bits, and their independent information content has not been established. A 256-**byte** table has enough *nominal cardinality* to bypass the bound, but that alone neither demonstrates a coupled encoder nor identifies an authentic key.

## Off-diagonal pair counts exclude a simple repeated directed Euler cycle

The manuscript's **12,956** unknown runes lie only 36 symbols below **16 × 29 × 28 = 12,992**, the number of transitions in sixteen complete directed traversals of every ordered nonidentical GP29 rune pair. This is a retrospective length coincidence and suggests a testable, key-independent alternative to a prose cipher: perhaps the text consists of repeated no-self-edge Euler cycles, with rare equal-glyph events inserted as separate markers. That specific construction would use each of the 812 ordered unequal rune pairs almost exactly 15 or 16 times even after inserting repeat delimiters, rather than a wide distribution of multiplicities.

The unmodified **book-continuous** 12,955 transitions contain exactly 86 equal-rune transitions and **12,869 unequal** transitions. All 812 possible unequal ordered pairs occur, but their original counts range from **5 to 30**; the full off-diagonal Pearson statistic relative to equal counts is **841.2373**. Excluding cross-page transitions gives 12,815 unequal edges, the same 86 exact within-page doublets, off-diagonal counts **5 to 29**, and Pearson **841.3636**. A deterministic 29-vertex nonloop Hierholzer positive, repeated sixteen times and trimmed to the same 12,956-rune total, has counts **15 or 16** and Pearson **2.2134**. It therefore has an observably different edge signature.

A **500-trial source-shaped null** independently chooses among all 28 rune values other than the previous output, preserving every original page length and the **exact original repeat locations**. Its median Pearson statistic is **806.1337**, and **103/500** trials have statistic at least the original (plus-one upper-tail **0.207585**). Thus the original unequal-pair spectrum is compatible with this ordinary predecessor-excluding random model, with no special balancing signal. The source does not look like a repeated complete nonloop Euler traversal with repeat symbols simply inserted as delimiters. A deliberately perturbed or rekeyed graph walk could have a different spectrum, but now requires its own source-selected transition and edit operation.

[Standalone original-input, masked-null and positive SFT](../sims/lp2_directed29_edge_cycle_original_sft.cjs) · [passing Windows Node22 run 43584077857](https://github.com/FlareZ123/liber-primus/actions/runs/43584077857). **No unknown plaintext, key or authored graph-walk rule is recovered.**

## Wulfic's 19% anti-doublet candidate is not a reversible rule

**Pinned source:** [Wulfic/Cicada3301-Liber_Primus](https://github.com/Wulfic/Cicada3301-Liber_Primus/tree/bf89d3d13aad2b8f2c95ab195cf1b092f250775c), commit bf89d3d13aad2b8f2c95ab195cf1b092f250775c. The exact source files are [keys.py](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/bf89d3d13aad2b8f2c95ab195cf1b092f250775c/tools/lpcore/keys.py#L196-L220), [leak.py](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/bf89d3d13aad2b8f2c95ab195cf1b092f250775c/tools/lpcore/leak.py#L286-L330), and [test_leak.py](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/bf89d3d13aad2b8f2c95ab195cf1b092f250775c/tests/test_leak.py). This pins the implementation rather than relying on a moving README or summary.

### Original-input fingerprint

The [reproducer](../sims/wulfic_antidoublet_reversibility_gate.py) extracts the nine original unsolved sections (Wulfic segment IDs 7–15) from resources/transcriptions/liber_primus_master.txt, using the canonical 29-rune alphabet in lp2-corpus.json. It asserts section lengths **[729, 1145, 1729, 9, 1894, 1021, 1524, 1589, 3316]**, totaling **12,956 runes**, **12,947 section-contiguous transitions**, and exactly **86 equal adjacent pairs**. The script emits all 86 positions as (segment, zero-based second-rune offset, global offset, rune, GP29 index).

The denominator matters. Flattening all nine sections without resetting at the eight dollar-sign section boundaries gives 12,955 transitions; Wulfic's test correctly uses 12,947 transitions within sections. The eight excluded inter-section edges contain no equal pair, so both conventions count the same 86 events. Under Wulfic's section convention the uniform expectation is **446.4483**, and the observed fraction is **86 / 446.4483 = 19.2631%**. This is a baseline ratio, not a recovered key parameter.

### Exact forward functions and injectivity

The pinned keys.py::encrypt_dodging is described in its module as a reference encryptor for controls. It starts with c = p + k (mod 29); when that candidate equals the preceding output, it either retains it with probability keep, substitutes the next key value and consumes it (rekey="next"), or substitutes an independent random value without consuming the key (rekey="fresh"). It supplies no decoder, no LP2-derived seed, and no state channel recording which branch occurred.

The reproducer ports that function literally and finds explicit collisions with the **same fixed key and same fixed random seed**:

| Variant | Plaintext A | Plaintext B | Fixed key | Seed / keep | Identical ciphertext |
| --- | --- | --- | --- | --- | --- |
| Next-key replacement | [0,28] | [0,0] | [0,1,2] | 2 / 0.19 | [0,1] |
| Fresh-key replacement | [0,28] | [0,25] | [0,1] | 2 / 0.19 | [0,26] |

For seed 2, Python's random.Random first draw is **0.9560342718892494**, so the first would-be doublet is re-keyed; the fresh variant then draws replacement value **27**. These are not collisions caused by hiding the seed: even granting the exact seed and key, the forward map is many-to-one. Therefore no unique inverse exists for either specified encrypt_dodging variant.

The separate community-image implementation in leak.py has the same problem in its idealized two-key form: with k1=[0,1], k2=[0,2], plaintext [0,28] and [0,0] both produce [0,1]. Its literal look-ahead version can leave an output None when both candidate keys repeat, so it is not even a total rune-to-rune transform for all inputs. The reproducer asserts both behaviors.

### Which statistical variants survive?

Wulfic's pinned tests distinguish three different proposals; they should not be conflated:

- **Two-key community switch (L5):** on 2,901 solved LP1 plaintext runes, the declared DIVINITY/CIRCUMFERENCES pair yields **6/2,900** doublets for the idealized rule and **10/2,898** for the literal image code. Scaled to 12,947 LP2 transitions, the expected counts are about **27** and **45**, not 86; the reported upper-tail probabilities are **9×10⁻²⁰** and **3×10⁻⁸**. The phi(prime)/primes pair is degenerate and yields zero. Wulfic's own test_l5_key_switch_cannot_leave_86_doublets rejects these declared key pairs.
- **Skip-next key (C14):** a key with a 19% adjacent-repeat rate can reproduce the observed doublet count without a separate keep probability, but it predicts a plaintext-shaped ciphertext-difference histogram. Wulfic's pinned test_skip_next_is_excluded reports **LLR = −21.34**, beyond its predeclared **−10** exclusion threshold; disjoint solved-text models give **−31.7** and **−20.0**, while planted skip-next controls score positively. This rejects the tested skip-next explanation, not every possible replacement-key source.
- **Fresh independent replacement:** this is a stochastic control with a fitted retention parameter, not a source-selected LP2 operation. The explicit collision above shows it is not invertible even when its random stream is known.

The full 28-test Wulfic suite was **not** rerun in this investigation. The original-input 86-position fingerprint and the exact forward-map collision tests were independently reproduced; the L5/C14 values above are identified as Wulfic's own pinned tests, not claimed as a second execution of that suite.

### Relation to existing LP2 constraints

The independent [cross-word study](cross-word-anti-repeat-constraint.md) finds **63/10,060** within-word and **23/2,887** cross-word equalities in the same section-contiguous stream. The suppression therefore cannot be explained by resetting a filter at every word boundary. Wulfic's L2 boundary test reports **82/12,362** within-line, **4/585** line-break and **0/48** page-break equalities; it does not support a per-line reset. These are boundary constraints, not evidence of a particular reversible operation.

The [direct ciphertext linear-complexity gate](lp2-ciphertext-linear-complexity-gate.md) gives GF(29) Berlekamp–Massey complexity **6,478** on the 12,956 unknown runes, excluding direct output from an order-≤256 LFSR. That result is orthogonal: it does not exclude a nonlinear or plaintext-dependent stateful filter. The **326-bit** side-information lower bound above applies only to a universal fixed-length encoder over all GP29 source strings with at most 86 repeats; it is not proof that Cicada used such an encoder.

**Decision:** Wulfic's published 19% figure is a statistical interpretation, not an identified reversible cipher. The specified encrypt_dodging generators are non-injective; the tested skip-next and two-key variants also fail their own discriminating tests. This closes those concrete models only. A different reversible global-state mechanism remains possible, but it needs a source-selected replacement rule and a recoverable branch/state channel before an inverse can be attempted. The separate key-skip/output-rewrite comparison below shows that the original ciphertext cannot choose between the two simple geometric retry architectures.

## Key-skip and output-rewrite are not identifiable from ciphertext

**Frozen independent model definitions.** The pinned [Dukotah/cicada3301 Round 18 L2 implementation](https://github.com/Dukotah/cicada3301/tree/f63501d8f2d835b80c30230eb89a1110fb9197d2/liber-primus/analysis/round18/L2-filter-leak) defines two ciphertext-side geometric rejection machines:

- **M1, ciphertext key-skip:** propose \(C_i=P_i+K_j\pmod{29}\); if it repeats \(C_{i-1}\), reject with probability \(s\), consume another independent uniform key symbol, and retry. The key pointer drifts.
- **M2, ciphertext output-rewrite:** make the same first proposal; on a rejected collision, draw a fresh uniform output symbol and retry if that too collides. The key pointer remains aligned.

These are distinct latent architectures, but they have the **same emitted-symbol law** when the key candidates and replacement draws are independent uniform GP29 symbols. Put \(q=1/29\). For either machine the geometric retry gives

\[
r(s)=\Pr(C_i=C_{i-1})=\frac{q(1-s)}{1-qs},
\qquad
\Pr(C_i=x\ne C_{i-1})=\frac{1-r(s)}{28}.
\]

Consequently, for every possible ciphertext sequence \(C\),

\[
\Pr_{M1}(C\mid s)=\Pr_{M2}(C\mid s),
\qquad
\log\frac{\Pr_{M1}(C\mid s)}{\Pr_{M2}(C\mid s)}=0.
\]

This is exact observational equivalence, not merely a low-powered statistic. Doublet spacing, lag-2/lag-3 counts, symbol-conditioned transitions, delta spectra, page/line/section boundary counts, and every other ciphertext-only statistic have identical distributions under the two implemented models. Only the hidden key pointer and the information discarded/replaced differ.

**External implementation audit.** The external [pre-registration](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/liber-primus/analysis/round18/L2-filter-leak/PREREG.md) writes M2's residual-rate formula as \(q(1-s)+q^2s\), which is the one-redraw expression. Its pinned **filter_models.py** actually implements a **while** retry loop; that implementation has the geometric formula above and is output-equivalent to M1. The external [results](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/liber-primus/analysis/round18/L2-filter-leak/RESULTS.md) report **0.175** pairwise classifier power for M1 versus M2 and correctly call them not separable by ciphertext. The formula/code discrepancy should be preserved as a documentation caveat: the results' equivalence verdict matches the executable loops, not the printed one-redraw formula. The same external battery uses 200 KJV/GP29 replicates per model, a no-filter control, and a full-book planted-key positive control; those validate the synthetic machinery, not an authentic LP2 key.

### Full original transition inventory

The extended [reproducer](../sims/wulfic_antidoublet_reversibility_gate.py) reads the nine master-transcription segments, the canonical GP29 corpus and the original-image punctuation annotations. Across all **12,956** rune positions there are **12,955** adjacent transitions:

| Transition class | Pairs | Equal |
| --- | ---: | ---: |
| Within words | 10,060 | 63 |
| Between words | 2,895 | 23 |
| Within printed lines | 12,362 | 82 |
| Across line breaks | 593 | 4 |
| Within physical pages | 12,901 | 86 |
| Across physical-page joins | 54 | 0 |
| Within the master nine-segment clock | 12,947 | 86 |
| Across its eight segment joins | 8 | 0 |

The original-image annotation file contains **28** 13-dot records on pages 0–55; after merging the duplicate black/red mark at p7 and multiple marks bracketing the same page join, these bracket **25 unique rune transitions**, with **zero** equal pairs. All eight dollar-sign joins in the master nine-segment convention are among these 25. Their exact global successor offsets are **729, 1874, 3603, 3612, 5506, 6527, 8051, 9640**; six are page joins and two are within-page joins (p15:8→9 and p33:90→91). The raw lp2-transcription.txt clock also records the alternative p32-end transition at global **7960**; this is a distinct original 13-dot edge, not interchangeable with the master clock's p33-heading boundary at **8051**. This preserves the already documented source-clock ambiguity rather than silently choosing a reset convention.

### Fixed page-heldout replication

For a transparent one-parameter check, fit only the within-page transitions on physical pages **0–26** and score pages **27–55** (physical p50 has no runes). This is a **retrospective fixed-split replication**, not a blind pre-registration; the external L2 pre-registration above is the independent pre-registered battery.

- Training: **40/6,500** doublets, \(\hat r=0.0061538462\), equivalent geometric suppression \(\hat s=0.8266254\).
- Held out: **46/6,401** doublets; the fitted model expects **39.39** (z = **1.056**).
- From the training rate, the shared kernel predicts \(P(C_i=C_{i-2})=0.03531395\) and \(P(C_i=C_{i-3})=0.03445837\). Held-out observations are **223/6,373 = 0.0349914** (z = −0.140) and **211/6,345 = 0.0332545** (z = −0.526), respectively.
- Adjacent repeat-indicator pairs: **0** observed versus **0.242** expected. The symbol-conditioned transition matrix gives \(\chi^2=847.19\) on 812 df (\(p=0.190\)).
- The nonzero-delta spectrum gives \(\chi^2=46.972\) on 27 df (\(p=0.00998\)), but its maximum cell deviation is only **3.117 SD**, below the pre-registered 3.57-SD single-cell bar. Correcting the omnibus result for two model families and five feature groups gives \(p_{\rm adj}\approx0.0998\).
- Held-out boundary counts are **4/294** line joins, **0/27** page joins, **0/2** segment joins and **15/1,438** interword joins. These categories overlap; page/segment counts are too small to distinguish reset policies.

Every listed held-out prediction is shared by M1 and M2, and their held-out likelihood ratio is **exactly 1**. The fixed-split data are compatible with the common geometric kernel; they do not select which hidden state was consumed.

### Inverse requirement and decision

M1 could be inverted only with an independently sourced authentic key stream and a uniquely recoverable skip schedule (or an explicitly source-defined deterministic rejection rule from which that schedule follows). Neither has been recovered. M2 keeps the key pointer aligned, but its output rewrite discards the colliding candidate; inversion requires the discarded candidate/branch state or equivalent source-side information. The Wulfic fixed-key/fixed-seed collisions above demonstrate non-injectivity for its specified next and fresh rewrite implementations. The external planted-key positive control is not an LP2 key.

**Decision:** the original data do not distinguish key-skip from output-rewrite, and neither supplies the independently sourced key/state required for a genuine inverse. Retire the doublet deficit as a selector between these two architectures; do not launch key searches on that basis. This does **not** exclude all stateful ciphers, other source-selected filters, non-English intermediates, or a mechanism that is not an iid-uniform geometric retry.

## Historical operator gate: no authenticated anti-doublet inverse (Director #716, 13 November 2026)

**Decision:** None of the checked creator-signed Cicada instructions, recovered stage-specific mechanisms or pre-2014 algorithm references actually invoked by an LP2 clue specifies a **lossless predecessor-exclusion, collision-rejection or repeated-rune escape operation**. The most plausible generic analogy, a code with a reserved repeat marker and a previous-output state, is only an engineered model of the observed ciphertext. It remains without a historical selector, authentic key, recoverable skip schedule or verified plaintext.

The source-limited operator inventory consists of the [authenticated 2012 MIDI email](../resources/historical/cicada2012-midi-email.asc), [2013 signed TCP BASE29/DH/NEXT source](../resources/external/2013-tcp-server-signed-source.md), original [2013 CicadaOS script](../resources/historical/cicada2013-os-original-cicada.sh) and [prime_echo](../resources/historical/cicada2013-os-original-prime-echo.sh), [2013 signed forest and ICMP instructions](../resources/historical/cicada2013-forest-clue.asc), [2014 Stage09 Tor-upload/magic-square instruction](../resources/historical/cicada2014-stage09-first-jpeg-recovered.asc), [2014 Stage11 redirect](../resources/historical/cicada2014-stage11-message.asc), and [2016 signed LP2 word-map clue](../resources/historical/cicada2016-4gq25-outguess.asc). Their actual named actions are MIDI note/timing decoding, BASE29/DH/NEXT, prime display, ICMP sky echo, magic-square submission, an image listing and a verbal map/numbers direction. The [source-grounded historical solve-path contract](../workplace/historical-player-solvepath-operator-contract.md) also inventories the stage-specific OutGuess, fixed transposition, Vigenère, XOR and Shamir mechanisms. None instructs a predecessor-dependent exclusion or supplies its inverse parameters.

A generic *classical Playfair* repeated-letter filler is an in-period cipher concept, but it is a plaintext digraph preprocessing rule and does not independently select a 29-symbol no-doublet LP2 ciphertext machine; historical Cicada instructions above do not invoke Playfair on LP2. Generic source coding with 28 allowed next-symbols could be made reversible only with a complete mapping of all 29 input symbols, an authenticated exception/side channel or constrained plaintext domain, and a source-selected clock. The [exact original 29→28 capacity gate](lp2-no-repeat-source-visible-channel-capacity.md) already proves why red dots alone are insufficient and ordinary word placement has capacity but no observed encoding rule. The [fixed-escape / source-native controls](lp2-chain256-allsecret-source-gate.md) and the model-equivalence gate above show why fitted soft rejection is not an inverse.

**No decryption search is justified by the historical evidence as currently recovered.** This is a bounded primary-source absence statement, not proof that the original designers never used a hidden repeat-avoidance transform. Reopen only on a dated original text, executable program or keyed instruction that fixes the complete forward/inverse including hidden collision state. Then predict repeats on untouched original pages and recover at least 40 previously unknown plaintext runes by a source-frozen inverse. No source-selected algorithm, authentic key or plaintext was recovered in this gate.

## Positive controls, limitations and next decision

The [reproducer](../sims/lp2_anti_repeat_lossless_capacity.cjs) enumerates **all \(29^L\)** GP strings for \(L=1,2,3\) and verifies the predicted repeat-class counts, then reads the actual **55 page lengths and 86 events** and computes the exact log-binomial mass/cdf, asserting the values above. No probabilistic simulation, English-language scoring, ciphertext crib or fitted key enters the theorem.

This is a **source-bookkeeping gate only**. The manuscript may have a non-GP intermediate alphabet, plaintext restricted to language, compressed variable-length coding, physically printed non-rune side channels, or a cipher that produces low repeats only for the *actual* input. The author might not have specified any hard bound on repeat counts. In every such case, the theorem's universal-domain restriction does not apply directly. The observed scarcity is not proof of a 326-bit key, a 28-symbol inner alphabet or an entropy coder.

Before launching a new "lossless soft-rejection" inversion, require the proposer to specify **which outputs are legal for every possible source input**, whether the equal-transition mask is selected or predetermined, and how extra symbols/bits are recoverable from the original LP2 images. If no decodable side channel or restricted source alphabet can be written down, the proposal is only a statistical surrogate. Source-authenticated rules and actual original plaintext remain the necessary next evidence.
