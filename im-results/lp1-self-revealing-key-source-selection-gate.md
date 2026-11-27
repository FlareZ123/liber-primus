# LP1 key self-occurrence: exact control and source-selection decision

**Decision for [Director #2480](https://github.com/FlareZ123/liber-primus/issues/2480):** retire the literal self-revealing key premise. Both actual historical keys can be recovered from a short known plaintext, but their occurrence in their own encrypted section is not a common mechanism. No new original LP2 plaintext or key was recovered.

## Locked control

Input: `resources/transcriptions/lp1_wulfic_canonical.txt` (blob 37c96b816495c5f93ca658a01c9918bf92598316), $-separated sections 1 and 5 (zero-based); native solved comparator `resources/external/relikd-solved-gp29-native-v1.json` (blob 1b064ef6d85819b7d96adaff31a82d1ec551598f). The native file is a community solved transcription, not original image bytes. Use the canonical 29-rune ordering, P=0 transparent without key advance, otherwise C=P+K mod29. Neither prefix contains F. Fit only first 26 C/P pairs, allow periods 1..13, then forward predict the remaining original ciphertext against independently withheld known plaintext. This is conditional known-plaintext recovery, not a blind original-LP2 decode.

| Section | Unique period | Recovered GP0 key | Holdout | Total |
|---|---:|---|---:|---:|
| WELCOME/WISDOM | 8 | 23,10,1,10,9,10,16,26 (DIVINITY) | 489/489 | 515/515 |
| A KOAN (second) | 13 | 0,10,4,0,1,19,0,18,4,18,9,0,18 (FIRFUMFERENFE) | 293/293 | 319/319 |

11 and 2 actual plaintext F holds respectively. The arithmetic reproduces the known keys without using their labels to select a period. Both known sections are fully predicted under the recovered phase-zero keys and exact F convention. Computed in Code Mode on fetched source; companion standalone CJS reproducer below.

## Literal key occurrence versus thematic donor

The exact recovered 8-rune DIVINITY string is **absent** from all 515 native WELCOME runes. The exact recovered 13-rune FIRFUMFERENFE string is **absent** from all 319 native second-KOAN runes and every one of the nine solved comparator sections. Its semantic form CIRCUMFERENCE occurs at zero-based second-KOAN rune offset 52, but has C=5 at positions 0,3,11 where the recovered key has F=0. Hence a literal key-in-own-plaintext rule fails both controls, and even a semantic self-key rule fails WELCOME.

A more plausible shared *donor* is the printed-clear LP1 LOSS OF DIVINITY section (archive 10–13.jpg). Its 755 runes agree exactly with the solved native comparator. DIVINITY occurs at rune offsets 8,70,622 (word indices 3,14,153); CIRCUMFERENCE at rune18 (word5, first sentence subject after THE). Thus a player could have seen both terms without decrypting either target. But the printed words do not select the target-to-donor address or C→F conversion. The donor has 181 words and 93 unique types, including seven distinct length-8 words and one length-13 word. Even *granting* the independently recovered periods and assuming a single source word, the period-8 donor has seven possibilities; choosing the title's final word or first body noun is two different retrospective selectors. For the period-13 donor, independently choosing whether to zero its three C positions gives eight possible forms. The actual all-three-zero form is fixed by ciphertext arithmetic, not by the printed donor. A global C→F transform would fit both recovered keys only because DIVINITY contains no C; it is not independently selected.

Solved LP2 PARABLE also has DIVINITY at offset73 and CIRCUMFERENCE as a prefix of the plural CIRCUMFERENCES at offset53; the exact F-spelled key is absent. The 2013 Instar Emergence precedent makes shared thematic vocabulary historically plausible (see results/README.md), but neither source fixes a nonperiodic expansion or chooses an unknown LP2 target.

Published corroboration: [Wulfic page14](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/pages/page_14/README.md), [iBotPeaches page15](https://github.com/iBotPeaches/cicada_3301/blob/master/liber_primus/markdown/15.md), [JBO solver notes](https://github.com/cicada-solvers/JBO-cicada_tools) explicitly identify these thematic words and modified key spelling. These are community sources, not a first-party key-selection instruction.

## Historical discovery, February 6, 2014 — #2486

The original `#cicadasolvers.freenode.log` archive, pinned to neuroretransmit/cicada commit ade9a02889ef8acbc8cde8edbfd0a785c369f4c3, gives contemporaneous evidence of the actual discovery sequence. The targeted extractor `node sims/lp1_2014_koan_key_origin_sft.cjs` checks both source Git blob IDs and sizes before screening January–May 2014. [Successful run and original line references](https://github.com/FlareZ123/liber-primus/actions/runs/45325519523/job/138214066548).

| Source line | 2014-02-06 | Observation |
|---|---|---|
| 106639 | 18:37 | mourn identifies the opening crib A KOAN: DURING A LESSON and indicates that it makes key recovery easy. |
| 106660 | 18:42 | mourn reports CIRCUMFERENCE. |
| 106694 | 18:47 | mlehmk asks why the key has the F-substituted spelling. No serious independent explanation appears in the surrounding dialogue. |
| 106704–711 | 18:49–50 | IAmNotCicada3301 publishes the exact 13-rune key FIRFUMFERENFE and a partial decode that loses synchronization. |
| 106742–755 | 18:57–59 | The same participant reports successful decode after recognizing two transparent plaintext Fs, specifically the F in OF and the F in CIRCUMFERENCE. |

The May 23 discussion (lines 186629–634) explicitly corrects an incorrect second-rune-start interpretation: the first A is unchanged because the first key rune is zero-shift F. On May 13 (177053), Nem0 retrospectively describes the success as a good plaintext guess. The later [December 2024 reenactment](https://connortumbleson.com/2024/12/23/the-cicada-3301-mystery-puzzle-3-solve-part-4/) independently illustrates how a thematic CIRCUMFERENCE candidate is repaired using recognizable opening text. Neither source supplies a first-party C-to-F rule or a donor address that predicts an unknown-page key.

**Decision:** the historical record supports crib-guided identification and transparent-F repair, not a documented author-provided key selector. The documented sequence is consistent with the previously recovered phase-zero period-13 key and F holds, and makes an arbitrary altered-key sweep less justified. No LP2 transfer is authorized by this evidence. Close #2486 as a bounded historical resolution; reopen only if an independent target-specific crib or selector emerges.

## Next decision

The positive 26-rune crib control gives a concrete way to evaluate a genuinely source-selected LP2 crib in a bounded periodic family. It does not select that family for unknown pages, nor a new nonperiodic law. Stop this branch before arbitrary key words, spelling mutations, or expansion functions are introduced. Reopen only with an independent clue fixing the donor address, spelling rule, and target or with an authentic known crib. Reproducer: `node sims/lp1_self_revealing_key_control_sft.cjs`.


## Two authentic encipherings of one exact rubric: key-bearing differential (#3170, Agent17)

The strongest exact cross-section match among the five already solved *encrypted* GP29 records is not an arbitrary thematic word: the complete repeated printed rubric AN INSTRUCTION, native 12 runes `ᚪᚾᛁᚾᛋᛏᚱᚢᚳᛏᛡᚾ`, occurs at WELCOME offset485, KOAN I offset740 (corrected 778-rune source, not the 780-rune external transcription), clear LOSS OF DIVINITY offset715, and clear final INSTRUCTION offset0. The first two are distinct original encrypted representations, with separately fixed physical rubric endpoints; the latter two are literal GP29, not independently encrypted third witnesses. The longer 13-rune exact cross-match includes the preceding word's terminal Y and is not a complete source-defined rubric, so it is not used.

For the authentic LP1 WELCOME and KOAN I laws, on a shared consuming non-F plaintext P, C_W=P+K_j and C_R=2-P (mod29). Therefore C_W+C_R-2=K_j, with P eliminated. If even the reflection intercept 2 were unknown, subtracting the first sum gives the intercept-free relative key differences. The actual rubric contains no F; there is no hidden hold choice within the overlap.

| Quantity | Exact GP0 sequence |
|---|---|
| Original WELCOME ciphertext | 5,18,20,25,12,10,14,2,15,25,8,25 |
| Original KOAN I ciphertext | 7,22,21,22,16,15,27,1,26,15,4,22 |
| Cipher-only difference after known reflection intercept | 10,9,10,16,26,23,10,1,10,9,10,16 |
| Intercept-free relative differences | 0,28,0,6,16,13,0,20,0,28,0,6 |

The overlap has shortest exact period 8 (period12 is the trivial finite-length alternative); one full cyclic key is obtained from the two cipher streams without inserting the rubric's plaintext rune values into the key equation. The independently known WELCOME consuming clock has phase3 at the rubric, which rotates that vector to [23,10,1,10,9,10,16,26] = DIVINITY. Forward prediction outside the 12-rune fitted span reproduces **503/503 original WELCOME symbols** using the separately known native plaintext and its literal-F mask. Thus the differential independently recovers the already known key conditional on the known reflection law, exact repeated-span alignment and external phase clock. This is not a blind inference of the phase or F mask. Wrong shifts -2,-1,+1,+2 in the KOAN I rubric fail period8 at 3,4,4,4 of the four repeated phase comparisons. Choosing period8 relies on shortest period plus the held continuation; the 12-symbol fit alone is not an unbounded period proof.

Exact longest common runs for all ten distinct pairs of the five solved encrypted sections are, in order: WARNING/WELCOME 8, WARNING/KOAN I 7, WARNING/KOAN II 5, WARNING/p56 6, WELCOME/KOAN I 13, WELCOME/KOAN II 5, WELCOME/p56 9, KOAN I/KOAN II 10, KOAN I/p56 6, KOAN II/p56 4. No third encrypted occurrence of the source-defined rubric exists in this finite register. The earlier 2013 ID3 PARABLE text and clear p57 are plaintext publication in different media; the original XOR stage's MP3 operand is not evidence of two independent ciphertexts enciphering that same passage. See #1377 for the existing source-exact carrier work; do not rerun it.

There is no independently readable AN INSTRUCTION rubric/other exact common-plaintext alignment on a presently unknown LP2 interval, nor an authenticated marker assigning it WELCOME's consuming clock or KOAN I's reflection law. Consequently the authentic differential provides a useful key-eliminating primitive but no source-selected original LP2 receiver. Stop before searching unknown offsets or forcing a 12-rune heading crib. The historical key is already known and this reconstruction contributes no new unknown-page key information. An independent third encrypted witness or original receiving interval is the missing requirement.

[Executable reproducer](../sims/lp1_repeated_rubric_differential_sft.cjs), executed on pinned native, original LP1 canonical ciphertext and LP2 corpus in connected V8. Standalone Node/CI not run.

## Leading-rubric fixed point and the historical QUINE distinction (#3191, Agent34)

**Decision:** no authored self-serialization grammar is available for an unknown GP29 rubric. This is different from #2480's search for a literal key somewhere in already deciphered text: #3191 requires an equation on the unknown key and its own serialized rubric. The distinction is real, but no source fixes the equation's grammar, phase or encryption law. Stop before original ciphertext fitting.

The strongest historical self-reference candidate is the signed 26 January 2013 TCP contract, [source and signature evidence](../resources/external/2013-tcp-server-signed-source.md). It requires a participant-selected quine in their chosen programming language, not a cipher that encrypts its own key. The [actual March 3 transcript](../resources/historical/cicada2013-clientlog-1362290293-9.txt) (blob `02b25b72a183b8e83ef6876de69eb64218190846`, lines 23–27) returns a two-line Python2 program using repr and string replacement. Its exact self-copy semantics apply to program source text; the participant supplies the program, its syntax and its literals. The adjacent BASE29 request at lines 28–29 is an independently typed integer-to-ASCII serializer, not a GP29 cipher/key encoding. CODE returns the participant's own server program; DH's private state is participant-selected; no cross-command composition is specified. The separate authored-code inventory [#3175](lp2-historical-authored-text-encipherment-code-gate.md) found no unused first-party reversible text sender. These are concrete source limitations, not claims that no unknown historical material exists.

### Algebraic guardrail for any future proposed grammar

Grant an ordinary phase-zero additive GP29 rubric and a same-length key, with the hypothetical serialization `K=A P+b` for an independently fixed matrix A and vector b. Then `C-b=(I+A)P` over GF29. If I+A has full rank, *every* ciphertext admits exactly one self-consistent rubric; obtaining a root provides no evidence for the premise. If rank is r<n, the image has 29^r elements, and every admitted ciphertext has exactly 29^(n-r) competing roots. Thus a genuine discriminating test must lock the serializer independently, or predict withheld original material; neither an invertible root nor exact replay suffices. This is a symbolic result, not a sweep.

In particular the literal echo K=P (the closest mathematical analogue of a quine, but **not** a source-selected cipher grammar) gives P=15C mod29, because 2*15=1 mod29. It fits every 8- or 13-rune ciphertext under the ordinary clock. More generally, if A is any coordinate permutation, each even-length permutation cycle contributes one null dimension (alternating signs), while odd cycles contribute none. Thus a single 13-cycle is always full rank, whereas an 8-cycle imposes one alternating-sum constraint and leaves 29 roots if admitted. These statements are conditional on the stated linear grammar and do not establish a manuscript operation.

Authentic WELCOME-style transparent plaintext F complicates that echo: at position i, j is the number of preceding nonzero plaintext runes, C_i=0 for P_i=0 and otherwise C_i=P_i+P_j mod29. Since j<=i, an exact forward root enumerator would choose P_i=0 only for C_i=0; for a nonzero choice use 15C_i if j=i, otherwise C_i-P_j, rejecting zero. Branches can only occur at ciphertext zeros, so there are at most 2^(number of zero ciphertext runes) roots. The two distinct GP0 keys [1,0,2,0] and [1,0,2,27] both produce [2,0,2,0] under this clock, with final consuming phases 2 and 3 respectively. This is an explicit ambiguity of the speculative grammar; it does not assert ambiguity for every ciphertext. The zero-free subset reduces to the ordinary unique-root case, again without independent evidence.

No native plant or original rubric fit was launched: the issue's prerequisite is an authored key-serialization grammar, which the historical QUINE and BASE29 examples do not provide. No unknown plaintext or key. Reopen only upon a first-party rule specifying a parameter serialization and a receiving cipher interval, or an independently locked authentic crib which distinguishes proposed roots. Do not treat a decoded heading chosen from an arbitrary self-description grammar as evidence.
