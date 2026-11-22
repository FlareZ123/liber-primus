# Original p50 H×G 252-symbol quotient: direct RC4, GP29 and BASE29 consumers

**Agents 8 (13 November), 4 and 44 (16 November), and 2 (17 November 2026). Classification: four source-motivated finite original-cipher negatives.** No previously unknown Liber Primus plaintext, authentic key, cipher architecture or deep-web destination recovered. The original quotient exists exactly, but none of the tested direct consumers reads as the manuscript's instructions.

## Source hypothesis

The independently PGP-authenticated original 2013 Cicada TCP challenge supplies **BASE29 3301 → 3QO**, with exact GP29 digit values **[3,26,24]**. The red physical p39 triad in the original manuscript is **[27,5,15]**. With the previously independently supported ascending-power red-triad reading, these define two degree-two polynomials over GF29:

- H(X)=3+26X+24X², source-authenticated 2013 digits.
- G(X)=27+5X+15X², source-authenticated original p39 red rune values.
- Their product is **23+21X+11X²+17X³+12X⁴ (mod29)**.

Read the original 256-cell base60 table on pp49–51 as 256 descending GF29 coefficients. Exact long division by H×G leaves **[0,0,0,0]** remainder and gives a **252-symbol quotient**, beginning **[0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21,7,21,18,7]**. This algebraic relationship predates the present test and is documented in the [2013-signed worked example and original grid factor](2013-base29-gf29-grid-factor.md).

The tested *new* consumer regards these **252 quotient GF29 residues as literal RC4 key bytes** in the existing descending-coefficient order. Standard RC4 is a historically plausible contemporary primitive (Cicada used it indirectly through OutGuess), but **the original manuscript has no instruction selecting RC4 or this quotient-to-key transfer**. This differs from previously tested [raw full 256-byte table as RC4 key](lp2-grid256-rc4-original-gate.md): no raw printed bytes are the present KSA key.

## First frozen original-cipher consumer: standard RC4

Take the exact quotient bytes as a 252-byte RC4 KSA key without salt, discard or reordering. Generate PRGA output (a) continuously across all **12,956** original unknown GP29 runes or (b) restart RC4 at each of the 55 physical rune-bearing pages. Project each byte either with **byte mod29** or **(byte >>>3) mod29**. Decode original rune C by GP29 addition or subtraction of that key symbol, respecting every physical rune position and preserving original word boundaries.

Eight complete original-stream inverses are tested. Their output GP29 IoC normalized by29 is:

| RC4 stream | Output projection | P=C−K | P=C+K |
| --- | --- | ---: | ---: |
| Continuous | byte mod29 | 0.99939978 | 0.99929335 |
| Continuous | byte high-five | 0.99962163 | 1.00049796 |
| Physical-page reset | byte mod29 | 0.99955459 | 0.99898338 |
| Physical-page reset | byte high-five | 1.00066901 | 1.00009504 |

Original source IoC29 **0.99987354**. The maximum original output is **1.00066901**, entirely ciphertext-like, while genuinely solved p57 GP29 plaintext has IoC29 **1.818589** over its original 95-rune text. None of eight outputs yields previously unknown readable text.

## Original RC4 positive control and decision

The [original-source single-file CommonJS SFT](../sims/lp2_hg_q252_rc4_original_sft.cjs) reads only canonical repository GP29 corpus and 256-byte table, verifies both source factors and the complete remainder identity, runs all eight inverses, and reencrypts the **entire 12,956 original ciphertext symbols exactly**. For each of eight fixed modes, the independently solved p57 GP29 plaintext is repeated to original length, encrypted with the same source-derived key schedule, and decrypted: **12,956/12,956 known GP29 symbols** are recovered. The script asserts eight original IoC29 values to 1e−12. The planted text is deliberately repetitive; its role is an exact decoder test, not recovered LP2 text.

**Bounded RC4 negative:** the original H×G quotient **does not decode LP2 as a conventional direct additive GP29 RC4 stream** under the eight natural fixed source clocks, projections and signs. This does not exclude a separately sourced decoder.

## Second original-source consumer: literal GP29 quotient on complete table-flanking sentences (16 November)

The immediate neighbors of the printed table form a complete **138-rune / 33-word p48–49 pre-table sentence** (p48 last72 + original p49 66) and a complete **170-rune / 40-word p51–52 post-table sentence** (p51 all92 + p52 first78). They are much more plausible targets for the table than an unrelated whole-book RC4 stream. The finite source-only hypothesis is to use the original **252 GP29 quotient coefficients as a direct cyclic Vigenère key**, with no cipher-dependent key search. A human could read the displayed table as a cipher key after recognizing its p39 and 2013 factors, but **no surviving authored instruction selects this construction**. This mechanism is independent of the earlier RC4 KSA consumer.

Use quotient (Q) in descending original coefficient order, decode (P_i=(C_i\pm Q_{t+i})\bmod29), with signs ±, one fixed original start at zero, and either reset the clock after the table or continue its pre-table count (post start=138). These four exhaustive fixed interpretations were evaluated on the full original sentences, maintaining every original word and boundary.

| Direct key choice | Pre IoC | Post IoC | Concatenated IoC |
| --- | ---: | ---: | ---: |
| C−Q, table reset | 0.0354384851 | 0.0336930038 | 0.0351114683 |
| C−Q, continuous clock | 0.0354384851 | 0.0332057083 | 0.0349211050 |
| C+Q, table reset | 0.0343806199 | 0.0368952315 | 0.0351326198 |
| C+Q, continuous clock | 0.0343806199 | 0.0335537765 | 0.0343923178 |

For context, uniform GP29 IoC is 0.03448276; original solved p57 GP29 IoC is 0.06271. All four candidate outputs are uniformly shaped, and **none yields an intelligible 66-rune table instruction or a coherent independent post-table sentence**. Source-indexed native p57 plants recover all 308/308 symbols under all four modes and the complete original ciphertext re-encrypts exactly for all four. These tests check the specific literal quotient-key mechanism, without identifying a secret.

A further source-specific readout treats (Q) itself as one **big-endian BASE29 integer**, motivated by the independently signed 2013 BASE29 example used to form H. The 252 digits serialize to **153 bytes**, starting **`04598e588f3e70d4100f40d7489f9855a468a0d950156d2a`**. This direct byte stream has no first-packet GZIP, bzip2, PDF, ZIP, PNG or OpenPGP signature; no guessed offset, KDF or wrapping was tried. A binary payload or a further independently instructed step is not excluded.

**Reproducer:** [original-input Node22/CommonJS single-file SFT](../sims/lp2_p50_hg_q252_flanking_direct_sft.cjs), with source assertions, 4/4 exact original re-encryptions, 4/4 308-symbol native p57 planted decryptions and BASE29 header assertion. [Manual-only CI original-run 43781491464](https://github.com/FlareZ123/liber-primus/actions/runs/43781491464).

## Exact source quotient as key with the solved-page F bypass (17 November, Agent2)

The source-linked GP29 quotient has a stronger finite *key* test than rigid continuous Vigenère alone. The actually solved p56 cipher makes plaintext GP **F=0 transparent**: it prints as ciphertext F and does not consume its key. A non-F plaintext always consumes one key digit, potentially producing a printed F. Consequently a rigorous inverse must consider **both branches when ciphertext is F**, and must refuse every consuming branch whose decoded plaintext would be F. This exact source-demonstrated rule is distinct from treating Q itself as ciphertext under the p56 prime-totient key, which is tested in the next section.

With the original table Q[0..251] exactly as above, source phase0, no extra mask, no secret phase or adaptive key schedule, at key position `j` a consuming branch uses `P=(C ± Q[j]) mod29` and advances `j`; a literal transparent-F branch requires `C=0` and leaves `j` unchanged. Dynamic programming exhaustively combines these two branches, deduplicating equal key positions. It tests both additive signs on the unchanged full 138-rune table-preceding sentence, complete 170-rune table-following sentence, and 76-rune p55 terminal page. There is no English score or tuned word boundary in the acceptance test.

| Full original receiver, local key phase0 | Source runes | Printed F sites | Subtraction first impossible at | Addition first impossible at |
| --- | ---: | ---: | ---: | ---: |
| p48→p49 pretable sentence | 138 | 8 | 29 | 24 |
| p51→p52 posttable sentence | 170 | 6 | 37 | 30 |
| Physical p55 complete (including carry glyph) | 76 | 3 | 61 | 63 |

Every number in the last two columns is a zero-based original-cipher rune index. **All six inverse path sets become empty** before their passage ends. The failure is an exact necessary-condition obstruction to this **phase-zero literal Q252 key under the authentic F-transparent rule**, even if the intended plaintext is a foreign language, code or nonstandard word segmentation. It is stronger than the rigid-key random-looking IoC result for this particular source-locked key model. It does not exclude a distinct key derivation, historical phase instruction or another LP2 cipher.

**Positive control:** take the actual independently clear **95-rune p57 PARABLE**, encrypt it twice with the original Q252 key under both signs while bypassing every plaintext F, and enumerate all legal paths. Both positives yield at least one full-length legal path with the exact planted non-F key-consumption count. The original table polynomial identity, zero four-symbol remainder and the pre/post sentence counts remain asserted by the same script. This extension was executed on the original GitHub checkout in [Windows Node22 Actions run 44001775997](https://github.com/FlareZ123/liber-primus/actions/runs/44001775997), status **PASS**. [Single-file source-exact reproducer](../sims/lp2_p50_hg_q252_flanking_direct_sft.cjs).

**Decision:** the original 252-residue table quotient cannot directly decrypt any of the three complete original targets with the documented p56-style F-transparent key schedule at phase0, under either arithmetic sign. There is **no recovered plaintext/key**, and no reason to invent another phase without an independent author clue.

## Historical p56 native-F prime-totient transfer to the extracted quotient (16 November, Agent44)

The quotient itself is a distinct candidate encrypted GP29 payload. To see whether it can directly convey a hidden table instruction, run the only **historically solved LP2 cipher mode**, the original p56 prime-totient stream and plaintext-F nonconsuming bypass, on this complete source-derived **252-rune** tape. This uses neither p49/p51 unknown plaintext nor a free key. The source-derived factor orientation, six literal quotient-zero positions **0, 75, 120, 140, 170, 237**, key sign, GP29 alphabet, and skip law are fixed. We grant every prime-stream starting index **0–4,999** and every one of the six 0-site bypass masks, so the test does not falsely exclude a nonzero phase.

**Exact result:** the source's original p56 cipher reproduces **85/85 authentic known runes**, and an independent 252-rune native GP plaintext plant decodes under the same path rules. On the real original quotient, **30** starting prime offsets admit at least one legal full-length inverse, yielding **60** complete legal **252-rune** candidates with exact forward reencryption. Prime-index start 0 fails. The maximum IoC of those 60 candidate plaintexts is **0.03750079049**, with the remainder all below 0.04; none is a coherent original English instruction or recognizable GP29 prose. The highest-IoC candidate opens `O E J EO W E R NG G I A R IA I J J R T O U S OE TH NG N E C J NG N W U D X` in source GP rune-label order.

A fixed **32-order control** keeps all six zero positions and the exact nonzero quotient GP29 inventory, shuffling only those 246 residues with a deterministic seed. Each control receives the identical 5,000-start exact DP. The number of legal starts ranges **10–35**, mean **19.875**, versus original **30**; the descriptive plus-one upper-tail frequency is **3/33 ≈ 0.0909**. This small conditional null is a calibration of the potential key-path multiplicity, not a discovery-adjusted p-value or proof of a secret p56 clock. It shows that **some legal inverse and exact ciphertext round-trip are entirely insufficient** to claim decoding.

**Decision:** the source-derived Q252 has no readable recovered plaintext under this complete 5,000-start transfer of the genuine p56 cipher law. The narrower zero-start mode is algebraically impossible; the start-relaxed family remains legally decodable but does not identify a key, plaintext or consumer. This retires the present fixed mode as a direct table-instruction route without weakening the true H/G algebraic factorization or ruling out an independent table codec. [Original-source CJS SFT](../sims/lp2_q252_p56_native_ftransfer_sft.cjs).

## Cipher-register discriminator: Q252 resembles a key/random tape more than ordinary unknown-page ciphertext (Agent4, 16 November)

An original-source decision can be made *without assuming an English plaintext crib or searching an inverse*: if the H×G quotient is another piece of LP2 **ciphertext encrypted by the same observed no-repeat mechanism** as the 12,956 unknown runes, its 251 adjacent transitions should broadly resemble the same-length original encrypted windows. The quotient is already fixed by the signed-2013 H and original p39 G polynomials; no symbols, skip positions, key or page offsets were chosen to improve a result.

The exact original **252-digit quotient contains 8 immediate repeated GP29 symbols in 251 adjacent comparisons**. The original unmodified 256 table bytes, merely reduced modulo29, contain **13 repeats among 255 comparisons**. The entire original unknown book contains **86 repeats in 12,955 adjacent positions**, with original within-page pair rate 86/12,901, very unlike an ordinary 29-symbol random tape.

To give the encrypted-book hypothesis its most favorable empirical context, compare **every one of the 12,705 contiguous, overlapping 252-rune windows** of the exact original 12,956-symbol unsolved stream. The source-native distribution of within-window immediate duplicates is

| Repeated adjacent pairs per 252-rune window | Exact count of original LP2 ciphertext windows |
| ---: | ---: |
| 0 | 2,193 |
| 1 | 4,692 |
| 2 | 2,767 |
| 3 | 1,668 |
| 4 | 1,077 |
| 5 | 306 |
| 6 | 2 |
| **7 or more** | **0** |

**The quotient's eight repeats exceed the maximum observed in every source-native 252-rune ciphertext window.** This is a concrete *register mismatch* for the hypothesis that Q is another ordinary LP2 anti-repeat encrypted-passage fragment. The original window set is overlapping and includes page seams, so these counts are a deterministic within-book reference envelope, **not 12,705 independent trials or a calibrated significance probability**. A new soft-filter generator could produce eight repeats by chance; this is comparative evidence, not algebraic impossibility or definitive proof the quotient is a one-time pad.

**Cryptanalytic decision:** Stop treating the Q252 polynomial quotient as **independently authenticated plaintext or normal-register ciphertext** merely because it has 252 GP29 digits. Its randomness-like adjacency is *more compatible* with a candidate key/register or encoded binary payload. This observation complements the already negative direct-base29 serializer, literal Q additive key and p56-native quotient-inverse gates; it does not provide the missing authentic key or reversible decoder. Its historical role needs an original author-selected operation, preferably one that deciphers the adjacent full p49 sentence and independently predicts p51.

[Read-only, original-input Windows Node22/CommonJS SFT](../sims/lp2_p50_hg_q252_original_repeats_sft.cjs) computes the exact H×G division, asserts the zero remainder and original first ten quotient digits, and enumerates all source 252-rune windows with an exact frozen histogram. It was executed against unchanged GitHub source bytes with passing assertions and no CI claim.

## Source-Q252 SHA-512 chain inverse and a key-independent word-onset constraint (Agent42, 17 November)

One bounded operation was selected from two **actual but independently interpreted** source objects: the exact 252-coefficient H2013×Gp39 quotient, serialized as a 153-byte signed-era BASE29 integer, and the SHA-512 algorithm named in the solved p56 continuation. Fix the byte stream to `SHA512(seed || uint32BE(counter))` modulo28, with zero counter and continuous key across pp0–55. The trial's reversible ciphertext chain emits one of 28 nonzero GP29 steps for plaintext values 0–27, while exceptional plaintext **EA (GP28)** emits a repeated ciphertext rune and consumes no key. The EA-as-zero-step choice is an unauthenticated mechanism hypothesis, motivated by the original 86 adjacent repeat events.

The original 12,956-rune source cipher and an independent 12,956-rune native-GP solved p57 plant both invert exactly. A separate original LP1-calibrated **GREAT** rune-plant exercises the actual transparent EA branch, since the clear p57 contains no EA; the emitted repeated rune and its exact inverse are both asserted. However the original decoded rune IoC is **0.03526629** (random GP29 ≈0.03448), and every full original chapter remains random-shaped (nine IoCs **0.03489–0.03577**). The planted native p57 control gives IoC **0.07248**. No original plaintext or instruction is recovered.

The more useful **key-independent discriminator** conditions on the physical printed words being genuine plaintext word boundaries. Of 86 source consecutive equal runes, **23** occur at a complete printed word's first rune, so the EA-as-repeat hypothesis forces **26.74%** of all its plaintext EA to be word-initial, irrespective of SHA-512 or any other key. The same native GP spelling model calibrated on solved LP1 produces only **60/606=9.90%** on Gibran, **98/1633=6.00%** on Shakespeare, and **237/2224=10.66%** on Emerson. The respective conditional one-sided binomial reference tails for 23 or more in 86 are **7.36e−6, 9.11e−10, 2.43e−5**. These descriptive tails presuppose independent trials and preserved original word breaks. Neither premise is authenticated: the result disfavors this **literal EA-transparent GP-English chain**, rather than excluding arbitrary 28-symbol chain ciphers or other languages.

The same original source-and-control comparison extends beyond EA to **all 29 possible single GP-rune transparency markers**. The exact two-sided 95% Clopper–Pearson interval for the original 86/12,956 repeated-rune frequency is **0.5313%–0.8191%**. Among all 29 rune frequencies in the combined 600,925 native-GP runes from the three independent English controls, only **NG (0.6666%)** and **EA (0.7427%)** lie inside that interval. Their conditional word-initial shares are respectively **0.32%** and **8.85%**, versus the observed 23/86 **26.74%** (exact two-sided 95% interval **17.77%–37.38%**). No single GP rune in this calibrated English register matches **both** the repeat-event prevalence and its printed-word-onset placement, independently of any guessed key or SHA mode. The confidence intervals summarize a simplified independent-token model, not a proof for a manuscript with unknown language or scrambled word boundaries. [Updated all-29 native-escape SFT CI](https://github.com/FlareZ123/liber-primus/actions/runs/44005253473).

The frozen SHA-512 candidate is retired at this receiver. There is no original instruction selecting its counter serialization or the EA escape. Recovering an author-selected key source or true plaintext remains the next causal step. [Exact original-source Windows Node22 SFT](../sims/lp2_hgq252_sha512_chain28_original_sft.cjs) · [passing CI run](https://github.com/FlareZ123/liber-primus/actions/runs/44005253473).

## Interpretation and next missing evidence

The source-dependent **H×G polynomial quotient is algebraically real**, while its author-selected historical role remains unproved. Its eight adjacent duplicates in 252 digits are unlike any same-length original encrypted-LP2 window, so the quotient has no positive case for being an ordinary continuation of the unknown-page anti-repeat ciphertext register. The RC4 consumer, neighboring-prose GP29 pad, p56-native quotient inverse and fixed SHA-512 chain28 inverse fail to recover authentic plaintext under their specified clocks; the exact F-transparent quotient-as-key inverse has no full legal path on three original targets at source phase0; the direct BASE29 quotient lacks an identifiable file signature at offset zero. **Neither its key-like statistics nor its exact polynomial divisibility identifies the intended decoder.** Further phase fitting, reversed alphabets and newly invented cipher layers have no source support. The next genuine decision requires an independently preserved Cicada-era operation assigning the 252 coefficients a role, or an exact withheld original plaintext prediction on adjacent text.
