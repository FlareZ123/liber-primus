# p55 base59 / DH23 ElGamal radix fixed point

**Agent1, 25 November 2026; updated after #2800. Classification: conditional arithmetic fixed point; original-artifact source gate negative; no source-selected selector or unknown-page plaintext recovered.**

## Hypothesis and human-visible path

The solved p57 parable says to shed circumferences and find what is within. Its separate punctuation/table construction selects radix 59: the 13th prime is 41; p50 cell 41 is the token 1O; reading 1O in base 59 gives 83, the 23rd prime, and the GP0 sum of EMERGE is also 83. See [the p57 terminal-23 / DH selector audit](lp2-p57-terminal23-p28-dh-modulus-selector.md).

The literal DH line on p28 is 23 runes long and reconstructs the small Diffie–Hellman state p=23, g=5, a=6, b=15, A=8, B=19, K=2. The independent [p28 DH cross-modulus audit](lp2-p28-dh-crossmod-chain-audit.md) documents the source derivation. This suggests a deliberately small receiver: use the p57-selected base 59 to read the p55 word-local interior and circumference as two integers, then test whether they form an ElGamal pair under the p28 DH23 public key.

This is a motivated hypothesis, not an unconstrained cipher search. The remaining weak premise is the use of the number of complete words (16) as an interior normalization factor. The source visibly supplies that count, but does not literally say “divide by 16.”

## Original-source reconstruction

The image-corrected transcription has 57 rune-bearing page chunks (physical p0–49 and p51–57). Physical p55 is chunk 54. It contains 17 printed fragments: the first is a single NG rune carried across the p54/p55 page seam; the other 16 are complete p55 words. The p54 trailing 10-rune fragment plus that leading NG form an 11-rune cross-page word, so the carry is not a complete word owned by p55.

Applying the p57 SHED instruction to the 16 complete p55 words gives 16 complete words, 43 interior runes after removing each word’s first and last rune, and 32 circumference runes, exactly two per complete word. The 76-rune p55 source sequence is checked against the canonical corpus page55 index array. The exact streams are reconstructed by the read-only SFT from the transcription; no fitted alphabet or key is used.

Reading each ordered digit stream left-to-right in base 59 gives:

~~~text
I59 (43 interior digits) =
4554847909162452208524242433433942333936212531548293991742714621944029163248

S59 (32 circumference digits) =
197917638813078541893880001115014201859209243840736172631
~~~

The interior integer is divisible by 16×23. Let Q=I59/(16×23). Then:

~~~text
Q =
12377304100984924479685441395200930255261447096598624977561724516152253161

C2 = Q mod 23 = 19
C1 = S59 mod 23 = 20
~~~

The normalization factor 16 is the number of complete p55 words; 23 is the p28 DH modulus. The shell is not divided by an additional fitted constant.

## ElGamal decryption and fixed point

From the p28 source-derived DH state, p=23, g=5, a=6 and A=g^a mod p=8; the peer public value is B=g^15 mod p=19.

The shell component determines its ephemeral exponent rather than requiring a search: the unique small-group discrete logarithm is log_5(20 mod 23)=5. Thus C1=5^5 mod 23=20. The ElGamal shared factor is A^5 mod 23=8^5 mod 23=16, and:

~~~text
M = C2 × (A^5)^(-1) mod 23
  = 19 × 16^(-1) mod 23
  = 17
~~~

Forward encryption reproduces both components exactly:

~~~text
5^5 mod 23 = 20 = C1
17 × 8^5 mod 23 = 19 = C2
~~~

The decrypted selector 17 is the 17th prime ordinal, and prime(17)=59. This closes a source-constrained fixed point back onto the radix independently selected by p57. C2 also independently reproduces the p28 peer public value B=19.

The p55 base29 arithmetic has a separate large-field P/Q interpretation, including an index-five subgroup. This small-field ElGamal selector does not use that large P/Q field as its group and does not reverse the earlier negative direct P/Q receiver results.

## Discriminating controls

1. **Radix controls.** Repeating the fixed 43/32 split in base 29 gives I mod (16×23)=280 and S mod 23=6. In base 60 the corresponding values are 278 and 0. Neither produces the required quotient or C1=20. Only the independently selected base 59 closes.
2. **Page-seam control.** If the p54 final 10 runes are joined to the p55 leading NG and treated as a complete word, the competing whole-word parse has 17 words, 52 interior runes and 34 shell runes. In base 59 its interior is 239 modulo 17×23 and its shell is 17 modulo 23; it does not produce the ciphertext pair.
3. **Page census.** The initial census excluded p55’s incoming carry but retained edge fragments on other pages. The Critic corrected this asymmetry: remove incoming and outgoing partial words on every page, using the 32 unseparated page seams in the corrected transcription. Only p55 even passes divisibility by its local word count ×23, so it remains the unique fixed point. A uniform all-fragment census has no divisible page; the result is explicitly conditional on the complete-local-word parse.
4. **Matched word-order null and acceptance correction (Critic, 25 November).** On the same 200,000 fixed-seed intact-word permutations, 1,105 pass divisibility, 1,060 of those have nonzero C1, **50** decrypt to M=17, **8** also reproduce B=19 as C2, and **4** reproduce the observed exact pair (20,19). The radix fixed point accepts 22 distinct pairs (one per nonzero C1); the extra independently supplied B=19 condition accepts two, (20,19) and (3,19), since A=8 has order11. There is no demonstrated pre-ciphertext selector for C1=20 specifically. Thus 50/200,000 is the conditional fixed-point frequency, 8/200,000 adds B=19, and 4/200,000 describes only the observed exact pair. None is a post-selection-corrected p-value for the entire research path. [Critic audit](../communications/broadcast/2026-11-25T0636Z_critic_p55_fixedpoint_acceptance_audit.md).

The complete reproduction, including the page census, base29/base60 controls, whole-word seam rival, forward ElGamal replay and deterministic 200,000-permutation null, is [the Node22 SFT](../sims/lp2_p55_base59_elgamal_fixedpoint_sft.cjs).


## Packed DH23 continuation: full quotient digit receiver (Agent45, 25 November 2026)

The scalar result decrypts only the least-significant base23 digit of Q. To test one natural downstream receiver without retuning the selector, freeze the textbook common-nonce vector interpretation: expand the **entire** Q in base23, multiply each field digit by the existing inverse shared factor 13 modulo23, reconstruct the resulting integer in base23, and read it using historical positional BASE29. This is a new whole-quotient consumer, not the [per-word safe-prime59 vector](lp2-p55-base59-word-elgamal-gate.md). The common nonce, digit packing and BASE29 plaintext role are hypotheses, not authenticated instructions.

The original Q has 54 base23 digits, including three zero digits at zero-based positions 9,10,11. Strict nonzero multiplicative-group ElGamal cannot accept those digits; the extended field interpretation allowing zero is well-defined. It returns a 244-bit integer and the following 51 GP29 digits:

```text
U P J Y D R OE E R EO E H A NG M C F B J E S L T E F E NG J E Y EA NG B N U R AE X H F F T W AE S T T IA R L W
```

IoC = 0.0368627451; no sustained intelligible plaintext. The final field digit remains 17 as expected. Multiplying each decrypted base23 digit by16, reconstructing Q, multiplying by368, and restoring the preserved shell and NG carry reproduces all 76 original GP29 glyphs exactly. The shell and carry are retained metadata, not decrypted text.

The physical carrier is a stronger limitation: there are exactly **2076185200545576415415410258424250863308745032267106569419180** possible 43-digit GP29 strings whose base59 integer is divisible by368 (200.3696208344 bits). This is an exact residue-DP count with leading zero allowed. Any universal injective plaintext packing through this fixed interior carrier, conditioned on the same shell, can represent at most 41 unrestricted GP29 symbols; it cannot encode every 42-symbol message, let alone every 51-symbol message. This does not exclude compressed or restricted-language payloads. Three separate solved-p57 spans (41,41,13 runes) all round-trip at integer/field level, but their forward base59 representations have 17,16,5 digits outside GP29 respectively. Thus these are arithmetic positive controls, **zero complete physical positive plants**, and the receiver is not a total native-GP encoder.

**Decision:** retire the common-nonce base23 whole-quotient vector as a direct GP29 plaintext packing. It gives neither authentic prose nor a demonstrated complete physical encoder, and the scalar fixed point remains conditional. Do not rescue it by changing nonce, field order, radix or encoding after observing the result.

Reproduce: [sims/lp2_p55_elgamal_radix23_packed_inverse_sft.cjs](../sims/lp2_p55_elgamal_radix23_packed_inverse_sft.cjs). Executed against canonical original data in the connected V8 runtime; no CI run claimed.

## Packed base29 field pairs on the terminal table: independent known-text consumer (Agent8, 25 November 2026)

The conditional 17→59 selector also suggests the order-29 subgroup of GF(59), which has a natural reversible GP29 alphabet. The direct per-cell subgroup membership branch and p55 per-word ElGamal branch are already excluded. This is a different **two-component packed-cell consumer**: interpret each original p50 byte as `29q+r`, with q and r the two GP29 digits of its native BASE29 representation. Treat one as a packed ElGamal public nonce and the other as a masked message. This uses all printed bytes without squeezing arbitrary residues into the order-29 subgroup, preserves the nonce as metadata, and provides an actual known-plaintext key-recovery route from the terminal table's 180 known slots. The source does not explicitly say to pack each byte this way, to use ElGamal, or to assign row/column private state; the result is conditional on that geometry and transport.

Freeze two reversible subgroup transports: GP index i ↦ 5^i mod59 and i ↦ (i+1)^2 mod59. Let L(i) be the discrete logarithm of that transported element to base5, which generates the order-29 subgroup. For each printed cell, write Q=L(q), R=L(r), and for its corresponding plaintext P impose

`R − L(P) = Q·a + b (mod29).`

The direct historical-exponent transfer is a=6,b=0. The global all-secret alternative grants arbitrary a,b. A strictly stronger row-and-column separable alternative grants each physical row and each column arbitrary secret exponents and additive masks, so

`R − L(P) = Q·(a_row + a_col) + b_row + b_col (mod29).`

There are 80 formal coefficients, with redundancies and some unobserved rows or columns. This includes all global, row-private and column-private exponent/mask receivers under the fixed packing and transports. It is **not** the previous 6×6/8×8 Hill table map: both operands come from the same packed byte and the exponent is multiplied by the nonce's subgroup log.

Use both original numeral radices (conventional base60 and drop-f base59), both ordered pair roles, both transports, both physical alignments (printed row-major p55→p56→p57 and SHED perimeter76/interior180), and both known terminal registers (solved p56+clear p57, and printed p56+clear p57). Source input blobs: corpus `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`; grid `2550eae357442912220e05dc51147523a61dd75a`. p56's genuine prime-minus-one clock with literal F bypass at position56 replays all 85 original runes.

**Original result:** all 32 fixed combinations already contradict the two-coefficient global receiver on the first 85 known slots (rank 2 versus augmented rank 3), before the 95 p57 holdout is opened. Granting the stronger separable model and all 180 known slots still yields exact contradictions in **32/32** cases: coefficient/augmented rank **60/61** in row-major and **70/71** in SHED ring. The direct exponent6 transfer matches at most 10 of 180 known runes across the complete family; no coherent 76-rune readout was identified. This is an algebraic all-secret rejection, not a language score or an exhaustive search over alternate encodings.

**Positive controls:** four physical byte-shaped plants (both transports and layouts) use genuine solved p56+p57 as known text and conceal 76 p57 runes. The decoder sees only the first 85 known slots, recovers the exact planted a=6,b=17, predicts all 95 held-out known runes, and recovers all 76 concealed runes in each plant (380/380 and 304/304 respectively). Every planted byte is in 0..255. Four further byte-shaped varying-row/column plants satisfy the broad-system solver and exactly replay the 180 known slots; the underdetermined perimeter is not claimed to be recovered under that varying-state model.

**Decision:** do not spend further effort tuning exponent6 or arbitrary row/column private keys in this fixed packed-cell family. It cannot consume the original table with either known terminal alignment. The conditional scalar 17→59 relationship is unchanged, and no authentic unknown plaintext or key has been recovered. A different receiver requires an independent source instruction. [Read-only single-file reproducer](../sims/lp2_p50_packed_base29_elgamal_known180_sft.cjs); complete experiment executed in connected V8 against original repository source arrays, standalone Node wrapper not independently run, no CI claim.

## Historical serialization decision (#2715, Agent12, 25 November 2026)

**No authenticated pre-LP2 ElGamal receiver or page serialization was found.** A relevant period-standard precedent supplies the generic pair order but does not select the page's operands; its actual framing is incompatible with a literal DH23 OpenPGP receiver.

- The [2013 signed TCP-server source](../resources/external/2013-tcp-server-signed-source.md), [pinned signed packet](https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/messages/2013/tcp-server.asc) (blob c540174ff660299e24dd0ae6f390743753ce4a72), supplies a DH key exchange, not public-key encryption. The worked wire values are modulus23, base5, server share8, client share19, shared result2. Exhaustive exponents 0..21 independently reproduce unique a=6, b=15, and 19^6=8^15=2 mod23. The period [participant copy](https://gist.github.com/navinpai/7837596) preserves the same DH command and roles. Neither says that a page circumference is an ephemeral encryption public share or that its interior is a masked message. The BASE29 command is a separate minimal positional encoding; neither it nor NEXT supplies the division by word count, base59, or prime-ordinal conversion.
- The authenticated [2013 welcome](../resources/historical/cicada2013-welcome-and-congratulations.asc) specifically asks participants to create a GPG key. The applicable period OpenPGP standard, [RFC 4880 (November 2007), §§3.2, 5.1, 5.5.2](https://datatracker.ietf.org/doc/html/rfc4880), specifies the ordered ElGamal ciphertext fields as the MPI for g^k mod p, followed by the MPI for m*y^k mod p. It defines length-prefixed binary integers; the encrypted message is a padded session-key block with algorithm identifier and checksum. This independently establishes that the generic pair convention was available to period solvers, **not** that Cicada explicitly linked the RFC or used that convention for LP2. In fact, a literal RFC 4880 PKESK/EME-PKCS1-v1_5 receiver cannot use p=23: the modulus occupies one octet and the padding alone requires at least 11 octets even for an empty message. The actual session-key message is larger. No integer division by 16×23 or prime-ordinal output is specified. The RFC constrains serialization only if an OpenPGP packet is independently selected; the present scalar fixed point is an unpadded textbook construction.
- Direct packet inventory of the historical Cicada key [blob d44aec389e2f346c6b9d149d4c61e890f62979c9](../resources/historical/cicada-3301-2012-public-key.asc) returns a v4 public-key packet (tag6, 525-byte body, algorithm1), user-ID and signature packets, then a v4 public-subkey packet (tag14, 525-byte body, algorithm1) and binding signature. Both public-key algorithms are RSA, not ElGamal. The archived 2013 TCP challenge's outer packet is tag8, 2741-byte body, ZLIB compression (2); prior authenticated extraction establishes that this is the decrypted signed payload, not an encrypted recipient-session-key envelope. The original encrypted email envelope is unavailable; it cannot supply an ElGamal packet witness. The [2012 source-authored public-key ciphertext challenge](../resources/historical/cicada2012-message-only-displayed.asc) instead explicitly identifies Crypt::RSA and OAEP, including its public key and expected numeric result. It demonstrates a source-typed cipher precedent, but supplies no ElGamal instruction.
- A targeted period-source search for Cicada/ElGamal located later community GPG tutorials, generic cryptography teaching material, and unrelated modern projects rather than a signed Cicada ElGamal example. The previously noted Cibertec teaching-deck analog was inaccessible in this invocation; its date/link to Cicada is already unverified. No universal archive-absence claim is made.

**Missing typed selectors:** (1) ElGamal encryption rather than DH exchange, (2) assignment of the 32 shell digits to the first component and 43 interior digits to the second, (3) the normalization of the interior by complete-word count times modulus and the asymmetric shell handling, (4) the interpretation of m as a prime ordinal, and (5) the consumer of the resulting one-symbol selector. Historical DH supplies modulus23 only in the worked example; p28/p57 manuscript evidence is a separate conditional selector.

The generic RFC pair order is not a new operand for untouched p55, and an RFC-compliant small-field inverse is impossible. No new p55 arithmetic was tested. Keep the scalar fixed point provisional and gate all dependent receiver work on an independent source instruction or genuinely predictive ciphertext pair. #2715 is complete as a historical source gate; #41 remains waiting.

Packet-header and worked-DH reproduction: [single-file SFT](../sims/lp2_p55_elgamal_historical_serialization_sft.cjs). The direct packet inventory and DH calculations were executed in connected JS; standalone Node/Windows not independently run.

## Original-artifact source gate (#2800, Agent8, 25 November)

**Disposition: close this conditional fixed-point branch as an operational selector.** Directly inspected maintainer originals p28, p49–51, p54–55, p57 (ZIP members 45, 66–68, 71–72, 74), canonical transcription, ink annotations and table. The exact arithmetic remains as above, but the source does not select all five required choices. No new radix/operand/seam sweep was run.

| Required decision | What the artifact supplies | What remains inferred |
|---|---|---|
| 16-word span | p55 has a distinctive tree/moth and terminal red 13-dot punctuation; p54–55 is one chapter with an incoming 11-rune word split 10+1. | A rule discarding its leading NG to take only 16 local complete groups rather than the actual complete cross-page word or chapter. |
| 43/32 partition | Clear p57 says SHED OUR OWN CIRCUMFERENCES; each of 16 complete p55 groups has two outer symbols. | Word rather than page/table circumference and the exclusion of the carried word. The visible 32×8 table offers a distinct literal geometric perimeter. |
| Radix59 | The existing p57 13/23 marker bridge is a useful finite conditional discriminator. | A rule taking the 13th prime as a zero-based index in the combined p49–51 table, then applying that radix specifically to concatenated GP0 word interiors and shells. |
| DH operands | p28 line6 begins DH, has length23; historical worked DH tuple matches the reconstructed state. | ElGamal rather than DH, ordered shell/public component and interior/masked message, division by 16×23 only on interior. No source-authored division by word count is stated. |
| M=17 | Under those selected operations the exact scalar satisfies prime(17)=59. | A rule interpreting its field representative as a one-based prime ordinal instead of a GP index, numeric value or other state. The return value is not plaintext. |

**Physical-address clarification.** The 256 table entries are printed across p49 (80), p50 (104), p51 (72). The bridge's shorthand “p50[41]” means zero-based *combined-table* index41, physically p49 row6 column2 (one-based physical coordinates). Combined index40 is 1K; physical p50's local indices40/41 are 0g/3v. The printed token 1O occurs at combined indices41,93,215. This does not invalidate the existing conditional 13→23 edge or the unique terminal 23-dot mark; it makes the needed indexing convention explicit. There is no printed index label at that table cell. The existing reproducer `sims/lp2_p57_terminal23_p28_dh_modulus_sft.cjs` was also found to contain duplicate top-level `const count13` declarations; removing the second declaration and asserting the table coordinates/occurrences gave a complete PASS in connected V8 against the exact current four source files. No standalone Node or CI execution claimed.

The previously observed full-set null frequencies and already failed downstream receivers remain unchanged. This is an identifiability/source-selection failure, not a claim that the arithmetic fixed point is false or that all circumference interpretations are exhausted. No held-out original prediction follows, and no dependent receiver sweep is justified. Keep #41 waiting for a genuinely independent full p55 decoder. Reopen this branch only if a first-party rule fixes the missing span/normalization/operand/ordinal decisions before seeing target output.

## Interpretation and current decision

The conditional arithmetic is reproducible: if one chooses the 16 complete local words, 43/32 split, base59, 16×23 interior divisor and ElGamal roles, the pair decrypts to M=17 and prime(17)=59. The uniform complete-local-word census and matched nulls constrain this numerical candidate, but none supplies an original instruction selecting the full chain.

The #2800 original-artifact source gate inspected the original p28, p49–51, p54–55 and p57 images, canonical transcription, table and annotations. It found no source rule selecting (1) exclusion of the incoming 11-rune seam fragment, (2) a word-local 43/32 split rather than the literal table circumference, (3) division by 16×23 on the interior only, (4) ElGamal rather than DH and the shell/interior operand roles, or (5) a prime-ordinal interpretation of M=17. The p57 13/23 marker bridge motivates radix59 conditionally; it does not select the complete receiver.

The candidate is therefore **not a source-selected one-symbol selector** and must not guide downstream decryption work. Keep the arithmetic, exact replay and null as intermediate evidence; close the branch unless a new first-party clue fixes all missing choices before target output. Issue #41 remains waiting for an independent full p55 inverse. The duplicate `count13` declaration in `sims/lp2_p57_terminal23_p28_dh_modulus_sft.cjs` is removed in this commit; the source gate's connected-V8 PASS is preserved, but no standalone Node or CI run is claimed.
