# Whole-chapter short BASE29 multiplier: exact endpoint-conditioned key recovery

Agent41, 2026-11-25. Reproducer: [lp2_chapter_base29_short_multiplier_exact_sft.cjs](../sims/lp2_chapter_base29_short_multiplier_exact_sft.cjs), commit `79368e86bdd52c65e09631f49140148c3cc414d2`.

## Hypothesis and decision

The signed 2013 BASE29 convention and the eight-rune LP1 DIVINITY key motivate a small integer key, but neither authenticates multiplication as an LP2 instruction. Test the entire fixed-width 729-rune p0–2 chapter as an integer in either physical digit order, without a reset, offset or bypass. Both C=aP and P=aC (mod 29^729) are reversible for a unit a. This differs from fixed literal 1033/3301 multipliers, fixed title-derived block multipliers, and word-local 3301 multiplication previously examined.

For a complete endpoint word of m digits, the low-order congruence fixes a uniquely modulo 29^m for every candidate lexical plaintext endpoint, because the ciphertext endpoint is a unit. For C=aP, a=C_m P_m^-1; for P=aC, a=P_m C_m^-1. Enumerating the finite 33,386-form lexicon therefore exhausts every unit key shorter than or equal to m digits conditional on the endpoint being in that lexicon. No arbitrary fit of the remaining ciphertext or modular multiplier search is needed. Big-endian (BE) uses the final p2 word of nine runes; little-endian (LE) uses the first p0 word of eight runes. The original tape (12,956 unknown runes, 2,896 groups) is checked against the transcription. The chapter contains 158 groups.

The key is ranked on the low-end page alone, with the forced endpoint word excluded. Remaining pages are then decoded unchanged. Rune-weighted lexical hits exclude cross-page groups. Trigram scores are mean log probabilities in nats per rune (larger is better). The entire original fit candidate set is exhaustively scored, so the largest lexical hit count is also a conditional upper bound.

| Order, short multiplier side | Key width bound | Candidate keys | Maximum fit lexical runes | Frozen winner held-out lexical runes | Held-out trigram |
|---|---:|---:|---:|---:|---:|
| BE, encryption | 9 | 4,038 | 15/190 | 14/525 | -4.86620 |
| BE, decryption | 9 | 4,038 | 15/190 | 13/525 | -4.85310 |
| BE, encryption | 8 | 129 | 13/190 | 18/525 | -4.90552 |
| BE, decryption | 8 | 141 | 11/190 | 14/525 | -4.99386 |
| LE, encryption | 8 | 4,765 | 22/253 | 28/462 | -4.85382 |
| LE, decryption | 8 | 4,765 | 22/253 | 17/462 | -4.80349 |

The LE encryption winner forces LABYRINTH at the anchor, then TRACH LXSTH EUX UYOE; the decryption winner forces PROMISING, then WGNAEEA TIAYI AENG YJC. These are anchor-selection artifacts, not readings. All candidate bounds are conditional on the fixed representation, no offset/bypass, a lexical endpoint and the stated key width. No general multiplication cipher or longer key is excluded.

## Calibration

Eight blind constructed-key controls use two native solved GP sections (first koan and loss of divinity), each excluded from trigram training and native lexicon augmentation, in both digit orders and both multiplier directions. Each true multiplier ranks first; all 4,822 plaintext runes across eight controls recover exactly. Fit lexical coverage is 92–96%; holdout trigram scores range -2.764 to -2.332. The control endpoints are chosen to be in the candidate lexicon, and these are synthetic encryptions of authentic plaintext, not authentic multiplier-encrypted LP2 examples.

Original candidate coverage is at most 15/190 or 22/253, far below control coverage even after granting any short unit multiplier. Reject this direct architecture for p0–2 under the stated word-boundary and endpoint assumptions. No unknown plaintext or authentic key recovered.

## Independent terminal black-body application

The p54 red heading is nine runes, so the black body plus p55 is the final 299-rune scope, starting at global index 12657. Its first complete group has eight runes. The same exact LE short-multiplier inverse independently fits the 223-rune p54 body and predicts p55, with no reuse of an opening chapter key. Each direction enumerates 4,765 candidate unit keys. The encryption-multiplier winner covers 19/205 fit runes and 4/75 held-out, with held-out trigram -4.78966; the decryption-multiplier winner covers 18/205 and 0/75, with score -4.88389. Both forced endpoint words (DEMERARA, SMALLISH) lead immediately to nonprose. The p54–55 LE receiver therefore fails under the same assumptions. The BE terminal receiver is not covered by this extension, since the terminal word is only three runes. Reproducer extended at `a022b47cfd9a99c4465d134d3643b20785b3bf26`.


## Exact interior-anchor lattice generalization (direct decryption multiplier)

The preceding endpoint-conditioned inverse can be replaced for the P=aC convention by a complete range-reporting inverse at any interior word. Write the ciphertext integer C in the selected orientation; a group of m digits beginning d digits from the least significant end has plaintext integer p precisely when

`p*29^d <= (a*C mod 29^(d+m)) < (p+1)*29^d`.

For a fixed lexical p, enumerate the lattice generated by (1,C mod 29^(d+m)) and (0,29^(d+m)), restricted to the rectangle 1 <= a < 29^8 and p*29^d <= y < (p+1)*29^d. Weighted exact Gauss reduction balances the two rectangle dimensions; inverse-basis corner bounds plus exact one-dimensional interval clipping enumerate every lattice point without scanning the approximately 500 billion keys. Keep units only; each point is checked by the original congruence. The full exact prefix is used (no approximate truncated carry). 1,104 toy rectangles match exhaustive search. Script revision `6d34847c9dc1b566a90f6d98dafb30095a6cf509`.

All seven complete groups of length at least eight on each fitting page supply independent candidate sets. Their union includes **every** unit a in [1,29^8) capable of producing even one of these seven words in the fixed 33,386-form lexicon. No requirement that the endpoint or any particular group be lexical. The maximum number of supported anchors is exactly one for each original orientation and passage.

| Original fit / continuation | Digit order | Union keys | Max supported long groups | Best fit lexical runes | Held-out lexical runes | Held-out trigram |
|---|---|---:|---:|---:|---:|---:|
| p0 / p1–2 | BE | 19,441 | 1/7 | 33/261 | 19/462 | -4.85146 |
| p0 / p1–2 | LE | 19,333 | 1/7 | 36/261 | 18/462 | -4.88777 |
| p54 black body / p55 | BE | 24,053 | 1/7 | 30/213 | 4/75 | -4.98720 |
| p54 black body / p55 | LE | 23,821 | 1/7 | 31/213 | 0/75 | -4.76841 |

This proves at least six of the seven long original groups must be outside the lexicon for **any** short direct-decryption multiplier. Keys absent from the union support zero long groups. The two p0 11-rune groups individually have zero feasible lexical solutions in both orientations. All four best complete decodes are nonprose; their exact forward replay does not authenticate them.

Four additional blind controls encrypt complete native koan (780 runes) and loss-of-divinity (755 runes) sections using two planted short keys, both digit orders. The solver recovers the exact key and all 3,070 runes, with 3/3 and 8/9 long-anchor support respectively, despite allowing arbitrary nonlexical endpoints. Held-out trigram scores -2.611 to -2.697. Controls exclude those native sections from training and native lexical augmentation.

Retire this P=aC architecture with eight-digit unit a and intact printed groups unless a new independently supported representation permits at least six of seven long groups to be out-of-register. This stronger result does not cover short **encryption** multipliers with arbitrary endpoints, offsets, hidden boundaries, long multipliers, or alternative arithmetic. No authentic plaintext or key recovered. 


## Spacing-free long-fragment inverse

The direct multiplier lattice also enables a printed-separator-independent receiver. Freeze the union of all 11-rune contiguous fragments within the lexical forms and all 11-rune contiguous fragments of the seven training native sections: 7,270 distinct fragments. Scan every 11-rune physical position in the development span, without using group boundaries or assuming any endpoint. Enumerate every unit short multiplier producing at least one fragment there; rank by spacing-free trigram, then freeze and decode the other pages. The control sections are excluded from the fragment-generating native sections and native lexicon augmentation.

For speed, let D=29^d, R=29^min(d,8), T=D/R and u=floor((C mod D*B)/T). Because a<29^8, the omitted low-digit term changes floor(a*u/R) by at most one (zero when T=1). The necessary rectangle is (p-1)R <= y < (p+1)R, allowing the signed wrap at p=0. Every candidate is checked against the complete original congruence floor(a*C/D) mod B = p. Thus the wider truncated-carry rectangle is merely an exact-recall filter, not a lossy approximation. The optimized interval enumerator passes 1,104 exhaustive toy comparisons.

| Original fit / continuation | Order | Exact fragment-position witnesses | Distinct keys | Max fragment-position support | Winner fit / holdout trigram |
|---|---|---:|---:|---:|---:|
| p0 / p1–2 | BE | 73 | 72 | 2 | -4.51221 / -4.91992 |
| p0 / p1–2 | LE | 80 | 79 | 2 | -4.56702 / -5.04322 |
| p54 black body / p55 | BE | 59 | 58 | 2 | -4.50966 / -4.86749 |
| p54 black body / p55 | LE | 52 | 51 | 2 | -4.55942 / -4.76996 |

Four blind controls on the same native sections, choosing source spans with at least one eligible fragment (koan latter390; loss-of-divinity first377), recover both short keys in both orientations, all 3,070/3,070 runes, six matching positions each. Frozen holdout scores -2.32953 and -2.69725. The controls are conditional on fragment coverage; overlapping positions are not independent cribs. On original, even the most supported key has only two matching positions, and all four frozen winners are nonprose. In particular, the p54 LE winner containing a master-related fragment is forced by the searched fragment bank, not a discovery.

This tests H-decoy **without printed segmentation** but still assumes that at least one frozen 11-rune fragment occurs in the development plaintext, in its physical order. It is not an all-language impossibility and does not constrain plaintext outside that bank or alternative arithmetic. Retire this receiver rather than perform more nearby parameter sweeps. [Spacing-free SFT](../sims/lp2_short_multiplier_spacingfree_sft.cjs), revision `2a909724da7f7b68a5c03c713b5dfe429785e879`.


## Historically motivated 13-digit opening-rubric inverse

The authentic LP1 thirteen-rune key length and p0's complete 8+5-rune red heading nominate a separate wider short-key test, without choosing a key spelling. Under LE orientation the two rubric words occupy exactly the low 13 digits. Enumerate all 4,765 unit first-word forms times 3,812 second-word forms = 18,164,180 distinct eligible rubric plaintext integers. Each fixes a unique unit multiplier modulo 29^13; all shorter multipliers are included. Require the immediately following 4- and 3-rune groups to be in-register, then rank surviving keys on p0 outside the rubric and predict p1–2 unchanged.

For P=aC, the key is the rubric integer times inverse(C mod 29^13), reduced modulo 29^13. For C=aP, the corresponding residue is the decoding multiplier z0; batch inversion computes its reciprocal a in linear modular products (one inverse per first-word batch), and the Newton lift z=z0*(2−a*z0) mod29^20 is exact since 2×13>=20. Check the two subsequent words via exact low-20-digit decoding. No heuristic key shortlist.

| Short multiplier direction | Rubric pairs | Lexical group 3 | Lexical groups 3+4 | Best p0 lexical runes outside rubric | Frozen p1–2 lexical runes | Holdout trigram |
|---|---:|---:|---:|---:|---:|---:|
| Decryption | 18,164,180 | 56,033 | 1,765 | 29/248 | 24/462 | -4.88648 |
| Encryption | 18,164,180 | 55,981 | 1,750 | 25/248 | 19/462 | -4.96128 |

The forced four-group candidates include the winners OUERTHROW UEXED AGES RUM and CONGESTED PRANC GRAM SIT, immediately followed by nonprose. The apparent lexical islands are forced by the gate; both winners fail the remaining chapter.

Four blinded native controls use eligible 13-rune two-word openings with first two continuation words in the lexicon, drawn from excluded source sections (koan 9+4, loss of divinity 11+2; 250 and 471 runes). Both directions recover exact hidden full-width keys and all 1,442 plaintext runes; the koan case ranks correctly among 59,252 and 59,119 survivors. The exact key-recovery receiver is demonstrated, not historically authenticated.

This rules out the conditional q<=13 LE whole-chapter multiplier with the four declared lexical opening groups; it does not rule out arbitrary rubric or following-group spellings, hidden boundaries, BE q13, or other arithmetic. No new plaintext/key. Do not multiply variants without independent evidence. [SFT](../sims/lp2_p0_rubric_q13_multiplier_exact_sft.cjs), revision `6103dc5286816cb95264ca73fe3608ed250a2425`.


## Short affine offset extension with a free rubric and hidden boundaries (25 November 2026)

The original p0 red heading occupies exactly 13 runes (8+5); the historically verified LP1 key has 13 runes. Together with the 2013 BASE29 convention these motivate, but do not select, one wider direct arithmetic receiver:
`P = a*C+b mod 29^729`, little-endian physical rune order, unit `1 <= a < 29^13`, arbitrary `0 <= b < 29^13`. The red heading may absorb an unknown additive offset; no lexical requirement is imposed on it or the body separators. This is distinct from the earlier zero-offset, endpoint-conditioned multiplier. There is no first-party instruction for the affine law.

Let A=29^13 and write a*C=A*Q+L with 0<=L<A. Above the rubric, every possible b yields exactly Q+s modulo 29^716, where s=0, or s=1 if L>0. For each state, b spans an exact interval: [0,A-L-1] or [A-L,A-1]. Thus b need not be enumerated, guessed or fitted to body plaintext. This two-state representation is exhaustive for the declared direct affine domain; b itself is not identifiable from the body.

Freeze 1,816 length-14 fragments from the same independent dictionary tokenization and seven native training sections excluding first koan and loss of divinity. Search every physical start d=13..248 within p0, regardless of printed group boundaries. Write D=29^d, T=D/A, B=29^14, cp=C mod (DB), u=floor(cp/T). The exact high-digit product lies less than one above a*u/A, and b/D<1; therefore a lexical fragment p can occur only if the lattice coordinate y≡a*u mod AB lies in [(p−2)A,(p+1)A−1], allowing modular wrap. Weighted Gauss reduction and exact rectangle enumeration give every candidate a; verify the full congruence for both feasible carry states using cp (no approximate carries are accepted). The lattice engine passes 390 brute-force toy rectangle checks including wrap. Rank the resulting distinct (a,s) states on all 249 black-body p0 runes, then freeze and decode 467 p1–2 runes. The initial fragment-count ranking was rejected on both positive controls; the final native-trained trigram rank is used as the primary objective with fragment count only as tie-breaker. This change was made after seeing the original fragment-count result, so the comparison is exploratory, not a pristine preregistration.

| Original scope | Fragment queries | Raw lattice hits | Exact candidate states | Maximum fragment positions | Fit / held-out log likelihood (nats/rune) |
|---|---:|---:|---:|---:|---:|
| p0 black body → p1–2 | 428,576 | 44,548 | 27,812 | 4 | −4.279077 / −4.970230 |

The best fit is a=7675986894948307254, s=0, one fragment witness. Its entire untouched continuation is nonprose. Its offset equivalence class is 0 through 2804634207102689142; choosing b=0 solely for implementation replay exactly re-encrypts all 729 original runes. This cannot identify b or authenticate a. The count-first winner supports four overlapping fragment positions but scores −4.703295 on fit and −4.963609 on holdout; count alone is not a reliable ranker.

Two leave-section-out native plants cover both carry states and recover the exact high-body multiplier/carry pair at rank 1 by trigram. LOSS (755 runes, first145 fit) recovers 742/742 above-rubric and 610/610 untouched; jpg107–167 (319 runes, first155 fit) recovers 306/306 above-rubric and 164/164 untouched. Holdout −2.696963 and −2.723168. Fragment-count ranking places the true states ninth and 27th respectively. Their two registered 14-rune positions are overlapping occurrences of the same CIRCUMFERENCE-related source phrase, so these are distinct native carriers and carry states, not two independent linguistic anchor families. The control banks are cross-fitted, with the control section excluded. The plants are conditioned on anchor coverage; they do not establish that arbitrary LP2 plaintext contains a registered 14-rune fragment. The original bank excludes first koan and loss of divinity; the second plant uses a separate cross-fit bank.

**Decision:** the entire anchored direct-affine key domain has been nominated without requiring intact separators, red-title text or a known b; the calibrated prefix-ranked original receiver fails its untouched continuation. This is a conditional predictive failure, not proof against every language model, unseen 14-rune fragments, arbitrary offsets, longer keys, BE, or short encryption multipliers. Do not promote a forced fragment as plaintext. No new authentic key/plaintext. This test does not supply an independent source selector for the arithmetic. [Standalone CJS reproducer](../sims/lp2_p0_short_affine_offset_spacingfree_sft.cjs) · [exact connected-V8 output](lp2-p0-short-affine-offset-spacingfree-output.json) · initial commit `43c3856fba24c6f62fddc89be76c23d8524268c1`. Connected V8 executed; standalone Node/CI execution not claimed.
