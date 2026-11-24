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
