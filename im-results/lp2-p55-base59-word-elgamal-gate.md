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
