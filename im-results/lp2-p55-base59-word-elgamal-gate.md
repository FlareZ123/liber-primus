# p55 safe-prime ElGamal word nonce: direct 59-rune inverse and all-exponent obstruction

**Agent20, 25 November 2026.** Conditional negative, not a recovery. The [p55 base59 / DH23 fixed point](lp2-p55-base59-elgamal-fixedpoint.md) suggests the safe prime 59. Its order-29 subgroup supports a lossless GP29 register; this differs from [mapping raw p50 table values into that subgroup](lp2-base59-safeprime-gp29-subgroup-original-gate.md), which was rejected. The page-local p55 interpretation has 75 runes in 16 complete groups after omitting the incoming NG carry. A conventional ElGamal vector per group with one nonce followed by all encrypted elements yields exactly 75−16=59 message runes. The private exponent 6 comes from the proposed p28 DH23 packet. The manuscript does not select this nonce packing, transport, or exponent's transfer to modulus59. SHED CIRCUMFERENCES does not establish one-endpoint removal.

## Direct inverse

Use subgroup H of quadratic residues modulo59. Its order is29; 5 generates H. Two elementary bijections from GP index i=0..28 into H are g(i)=5^i and g(i)=(i+1)^2 mod59. For each original complete p55 group designate its first element (standard framing) or last element (endpoint rival) as nonce A=g(k); decrypt every other element c as g^-1(g(c) × A^-a mod59), preserving data order. The inverse retains the nonce. Under exponential transport p=c−ak mod29, so changing the order29 generator cannot change that readout.

| transport | nonce | IoC at exponent6 | decoded 59 runes |
|---|---|---:|---|
| exponent | first | 0.027469 | XCTH X OE NOLEAOE IAABCU L PXEAARSMIAOEGCY BAEFSTH OEYM R ATEOLEONG DLIIYD I IANERP EH OA |
| exponent | last | 0.035067 | EOGY F T IWUEY DNGEJEA EO OXSFAECTLEADWG MSDIAP TWJ L AESWOJO SEONEAEAS S HTHPOEH BC ST |
| square | first | 0.028638 | CLAE P IA THJFNGC IAABCU AE OWUEATSICEOFHP BYUFL EOPI F OEODSDL MIAIIHM Y AETHRT DO AEA |
| square | last | 0.032145 | EAPN N M GUWER JBRMEO I YPIAGEOEATHHLSAEU MSDIAP XNGF IA SBUJWJ BETHNGNGB G YTMIAY GAE ES |

No sustained intelligible text. Five source length2 groups become singletons. Even granting permissive native singleton set {A,I,O,T}, **every exponent0..28**, both transports and both nonce placements, yields at most 2/5 legal singleton words. No private exponent in the four fixed receiver families can satisfy all five if groups frame individual plaintext words. Does not exclude resegmentation or a different codebook.

The executed JS calculation replays 8,700 original symbols across 116 variants and decrypts 11,020 planted native symbols (95 clear p57 runes and its original groups, deterministic nonce sequence, all 116 variants). These are algebraic controls, not authentication. No literal F exception is introduced; the incoming carry is deliberately not decoded. The standalone equivalent Node wrapper has not been CI-run.

**Decision:** retire this per-word ElGamal vector framing and exponent tuning. The base59 fixed point remains a conditional scalar correspondence, with no authentic key or plaintext. [Reproducer](../sims/lp2_p55_base59_word_elgamal_gate.cjs).

## Full physical p55: ordinary two-component ElGamal serialization (Agent8, 25 November 2026)

The conditional safe-prime59 clue also permits a direct standard ElGamal pair receiver without assuming that printed word lengths are plaintext word lengths. The original physical page has 76 runes including the incoming NG carry, so grant 38 pairs, retaining one symbol per pair as public nonce metadata. This is distinct from the 16 per-word nonces above and the earlier 19 four-rune blocks over GF1259. The even page length alone does not authenticate the framing, and the hypothesis would produce only 38 payload runes, not 76 plaintext runes.

Freeze the same two bijective order-29 transports, i→5^i and i→(i+1)^2 mod59, and let L be their base5 logarithm. For each pair (q,r), recover P=L⁻¹(L(r)−aL(q) mod29), retaining q. Test both ordinary adjacent interleaving and two contiguous 38-rune component tapes, both pair-role orders, both transports and every private exponent a=0..28 (232 combinations). Direct source transfer a=6 is evaluated separately. Every candidate re-encrypts all 76 original runes including preserved nonces; this is a correctness invariant, not key evidence.

The exact scorer is a smoothed conditional Latin trigram model from 3,180 letters in LP1's editor-normalized solved reference, excluding LP2 p56/p57. The fixed model is only a ranking heuristic; it does not enforce spelling or printed separators. Across the 232 original decodes, the maximum mean log score is **−3.061103**, at interleaved reversed roles, exponential transport, a=11. Its exact readout is

`WAETHEARUAEALJLEALHWNREATPTSBRTHGLEANIANGTRAEEBA`

No sustained plaintext was identified. Direct source exponent6's best score is −3.411595. Sixteen native p57 plants (two disjoint 38-rune spans, keys6 and17, all eight fixed framing/transport cases) recover the exact hidden key at rank1 of29 within their known framing and recover all 608 payload runes. True scores are −2.922542 to −2.226426, entirely above the original best. In 256 deterministic original-multiset shuffles, re-maximizing over the full 232-case receiver family, **24/256** meet or exceed the original maximum. This is only a matched-marginal diagnostic, not a cryptographic null preserving the manuscript's repeat suppression, nor a postselection-corrected significance claim.

**Decision:** retire these exact 38-pair safe-prime59 receivers, including all exponents, as a calibrated negative. No authentic 38-rune plaintext, key, or full 76-rune inverse; the p55 scalar fixed-point result is unaffected. A different framing or transport needs independent evidence. [Complete read-only SFT](../sims/lp2_p55_safeprime59_elgamal_pair_sft.cjs), executed against unchanged source blobs corpus `054f2a0f780b7d46901acbe3d9bf4f0ac1801165` and reference `8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d` in connected V8; no separate Node/CI run claimed.

## Full-length self-nonce subgroup feedback (Agent1, 25 November 2026)

**Decision:** the full-length ordinary receiver is a calibrated nonprose result, and the historical literal-F variant has an **exact all-nonzero-exponent impossibility across physical p54–55**. This is distinct from the partial-payload nonce framing above: no rune is removed as metadata, and p54's 232 and p55's 76 original glyphs (including the incoming carry) are decoded together. The page-local reset rival remains nonprose but is not an all-key algebraic exclusion.

The conditional source motivation is p55's proposed prime59 selector and the p28 DH23 private exponent6. Reuse of the previous encrypted group element as public nonce is a minimal deterministic feedback architecture that avoids losing half the page to nonce metadata; it is not an instruction found in the historical material. Transfer of exponent6 from GF23 to GF59, and reading the source public values 8/19 as GP indices for the initial nonce, are exploratory assumptions. The full enumeration includes all private exponents and all initial nonce indices so that a negative does not hinge on those particular assumptions.

Let H be the subgroup of quadratic residues of GF59, with generator5 and order29, and let L be a bijection from GP indices to logarithms in H. Freeze two distinct transports: L(i)=i (exponential), and L(i)=log_5((i+1)^2 mod59) (square). The superficially different signed-residue transport chooses the unique QR representative of ±(i+1); since 59 ≡ 3 mod4 and that representative squared equals (i+1)^2, its logarithm is exactly half the square logarithm mod29. Scaling every logarithm, including the initial state, by the same nonzero factor leaves these feedback readouts unchanged. Thus the signed and square transports are algebraically equivalent and counted only once.

For previous-element mode, set state s initially to L(IV) and update s ← L(C) after each consuming rune. For cumulative-product mode update s ← s+L(C) mod29 instead. In both modes decode P=L⁻¹(L(C)−a·s mod29); encrypt C=L⁻¹(L(P)+a·s mod29) and advance with the same ciphertext-dependent state. This is a complete deterministic original-length inverse for ordinary consumption. In the authentic-F variant, P=0 emits C=0 and leaves the state unchanged; all other symbols consume. At C=0, retain the bypass and the consuming inverse if the latter is nonzero; at nonzero C, a consuming inverse of zero is illegal. The DP retains all distinct (state, preceding two plaintext runes) and the best path per tuple, which is sufficient for both exact feasibility and the fixed trigram objective. No word boundaries constrain either receiver.

### Executed outcomes

Inputs: canonical corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, native control blob `1b064ef6d85819b7d96adaff31a82d1ec551598f`. A normalized smoothed GP29 trigram model is trained on WELCOME, KOAN1, LOSS OF DIVINITY, jpg107–167 and jpg229 (2,458 runes). WARNING, WISDOM and solved p56/p57 are excluded from training. Enumerate 2 transports × 2 state updates × 29 exponents × 29 IVs = 3,364 parameter tuples (not necessarily distinct readouts). Select on p54 alone; keep p55 strictly as continuation. For latent-F, carry all feasible states of the prefix-selected key into the suffix.

| Receiver | p54 fit candidates / p54–55 legal candidates | Fit score | Frozen p55 score |
|---|---:|---:|---:|
| Ordinary, all tuples | 3,364 / 3,364 | −4.561653 | −5.281202 |
| Ordinary, source exponent6 | 116 / 116 | −4.647667 | −5.441595 |
| Ordinary, exponent6 and IV8/19 | 8 / 8 | −4.684875 | −5.217851 |
| Latent F, all tuples | 120 / 116 | −4.845487 | prefix winner has no legal continuation |
| Latent F, exponent6 | 1 / 0 | −4.845487 | impossible |
| Latent F, exponent6 and IV8/19 | 0 / 0 | impossible | impossible |

The 116 full-path F-hold survivors are **exactly the exponent-zero tuples**: all 2×2×29 such tuples necessarily admit the identity plaintext via consuming nonzero runes and holding each zero. Since the complete enumeration has only 116 survivors, every a=1,…,28 tuple fails, independent of any language or printed word assumptions. Only four nontrivial tuples reach the p54 boundary, and all four fail on p55. The best prefix candidate is exponential/product/a6/IV27. This is a lossless architecture obstruction, not a statistical score claim.

Independent p55 reset (all 3,364 tuples, scores selected on p55 itself): ordinary best −4.209629; latent-F 314 legal tuples (198 nonzero-exponent tuples), best −4.308994; both full 76-rune readouts nonprose. This postselected comparison has no withheld original validation. No unknown plaintext or source-selected key recovered. All 1,036,112 ordinary original-symbol applications (3,364×308) replay exactly; this is mandatory correctness, not identification.

Calibration: 16 ordinary synthetic encryptions of four withheld native passages, across both transports and both clocks, recover all effective hidden exponent/transport/state modes and 528/528 withheld runes; IV can be unidentifiable in previous-element mode because its effect ends after the first consuming glyph. Sixteen latent-F plants recover all effective modes and exponents and 524/528 withheld runes; exact replay for every winning path. The weakest observed control suffix score is −3.271398, well above the original frozen ordinary scores. These are native-text plants under the experimental cipher, not evidence the historical plaintext used it.

Reproducer: [full-length Node/CommonJS SFT](../sims/lp2_p55_gf59_dh_feedback_fullpage_sft.cjs), [complete raw results](lp2-p55-gf59-dh-feedback-fullpage.json). Core calculation was executed in the connected JS runtime; no separate Node or CI execution claimed. Code commit `dcb38c5deb83faaeaa2a1c6372b27be97a08c6f8`; raw `6cc029453329a76cf034379fa09a9569025a8f4e`.

**Disposition:** retire these fixed one-element and cumulative ciphertext-product feedback receivers, including the algebraically equivalent signed transport. No additional exponent, IV, generator or score sweep within the same architecture is warranted. A different historical operation, field transport, reset, or segmentation needs independent source evidence. The conditional scalar p55 fixed point and #41's requirement for a source-selected decoder producing actual unknown plaintext are unchanged.
