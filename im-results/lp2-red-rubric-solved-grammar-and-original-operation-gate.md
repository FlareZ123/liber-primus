# Red-rubric grammar: authentic solved controls and missing unknown-page operation

**Agent7, 23 November 2026. Director issue #2423.** This is an original-image / solved-plaintext **instruction-typing result**. All 56 unknown physical LP2 pages remain unsolved; no original unknown plaintext, authentic keystream or executable red-caption decipherment was found. The source facts below permit a narrow layout grammar, but provide no way to interpret an encrypted red sentence as a cipher opcode.

## The authentic controls fix what red ink can mean

In the original first release (archive 01.jpg, 03.jpg, 05.jpg, 06.jpg, 09.jpg, 10.jpg, 13.jpg, 14.jpg, 16.jpg), headings such as **A WARNING**, **WELCOME**, **SOME WISDOM**, **A KOAN**, **AN INSTRUCTION** and **KNOW THIS** are introduced by red lettering or rubric treatment. Their known outputs are editorial labels identifying philosophical prose, a koan, an imperative, or numeric squares. A label is not automatically a cryptographic instruction; the source's numeric magic squares were used as a later submission, while a separate actual cipher recipe was needed to decode the relevant pages.

A more discriminating **same-release positive** uses exact solved LP2 p56. Its red first five original rune indices are **[25,11,22,15,4]**, whose native spelling is **AEJ-OESR**. Its genuine solved red heading is **AN END**, GP indices **[24,9,18,9,23]**. The five differences modulo29 are **[1,2,4,6,10]**, exactly the Euler totients of primes **2,3,5,7,11**. The first original black rune after the red heading and red 13-dot separator is GP index **19**, decrypting to the first black plaintext **W** (index7) by difference **12**, the next prime13's totient. Thus p56's red heading **is itself encrypted**, and its red 13-dot boundary **does not reset the authenticated prime clock**. The source does not license interpreting red as a plaintext-only key channel.

Solved p57 has the separate, unencrypted **PARABLE** heading in seven red runes with the same red 13-dot terminator. These are two independent positive source controls for red as **layout/heading treatment**, with different encryption status.

## Exact remaining unknown rubrics

Original source records: `resources/liber-primus/lp2-ink-annotations.json` (red spans and dot marks), `lp2-corpus.json` (GP29), `lp2-transcription.txt` (printed word breaks), and original source archive scans 17.jpg–72.jpg. Page numbering here is physical LP2, meaning source JPEG number minus17.

The 16 unknown red spans comprise exactly **213 original red runes**; nine begin at page rune0 and seven occur inside an existing page. **Fourteen** terminate immediately at an original red 13-dot mark. The two exceptions are first rubrics of p8 and p40, whose images have no corresponding immediate big-dot separator. The table uses source-native GP transliteration, with printed word separators preserved. These are **ciphertexts** and should never be read as recovered plaintext.

| Physical LP2 page / position | Red-runic GP reading (word divisions) | Observed original role |
|---|---|---|
| p0 / 0, 13 runes | SHEOGMIAF-SYENGC | opening label, red13 after |
| p3 / 0, 16 | LJ-EOHNGCTHTAEJTXH-TUOE | chapter opening, red13 after |
| p3 / 119, 3 | PDTH | isolated inset, red13 on both sides |
| p6 / 71, 11 | ATXB-M-GIASB-XEO | internal highlighted phrase, red13 after |
| p7 / 194, 14 | DO-OETTHAE . CWJ-XEA-GEAM | page-terminal two-sentence rubric, red13 after |
| p8 / 0, 12 | XIXM-UXMCTHPOB | opening label, **no immediate red13** |
| p15 / 0, 9 | FULM-AEAYOEA | first heading, red13 after |
| p15 / 9, 11 | LUNGN-CU-BNTFNG | adjacent second heading, red13 after |
| p23 / 0, 16 | UA-WNGGXDG-IBI-EOTBIY | opening label, red13 after |
| p27 / 0, 19 | MPY-LSOAAEHLEEOIML-LSCP | opening label, red13 after |
| p33 / 0, 10 | DEO-XCFIAWHG | first label, red13 after |
| p33 / 91, 8 | NGTHEO-IFCOEEO | second inset, red13 after |
| p39 / 119, 3 | IACS | isolated inset, red13 on both sides |
| p40 / 0, 8 | FNM-YGDAEH | opening label, **no immediate red13** |
| p53 / 128, 51 | 12 printed word slots | exceptionally long page-terminal highlighted passage, red13 after |
| p54 / 0, 9 | A-MNGDIATHXIM | opening label, red13 after |

The p3 and p39 isolated three-rune red insets both begin at rune position119 and are bracketed by 13-dot marks. Their GP29 coefficient triples **[13,23,2]** and **[27,5,15]** have mathematically examined polynomial interpretations elsewhere. A common colored three-rune *format* is source-visible. An instruction to treat either as a polynomial key, choose a coefficient order, and apply it to an exact black-text receiver is **absent**. The source p53 terminal passage's 51 colored runes also prevents a single grammar that treats every red span as a short opcode.

## Maximum justified instruction grammar and cipher decision

A literal three-role grammar grounded in solved source behavior is:

1. **Label/section introduction:** page-start red heading or heading-like text, sometimes delimited by 13-dot; the heading may itself require decryption (proved by p56).
2. **Emphasized inset/body:** red-runic words inside or at the end of black prose; the long p53 passage and the isolated p3/p39 triplets belong to this physical category without implying an operation.
3. **Visual delimiter:** 13-dot after a heading or emphasized span; the p56 positive proves that at least one authentic cipher **continues its key clock across this mark**.

The grammar independently predicts the title roles of solved p56 **AN END** and p57 **PARABLE**, and it correctly classifies p3/p39 red triplets as short insets without claiming to read them. It **cannot assign an executable opcode, authentic operand, key reset rule and black-text receiver to any complete unsolved chapter**. Source-rune opacity matters: in the only solved encrypted red example, the red title cannot be read until the black-text cipher is already known.

The original #2423 decision remains: a new executable operation requires an authenticated reader instruction or independently recovered red plaintext. The following #2927 result tests the separate semantic-crib possibility without assuming an opcode.
## Exact semantic title-to-body constraints: Director #2927

The solved-title corpus now permits a direct lexical test, independent of cipher selection. The [executable SFT](../sims/lp2_solved_title_body_exact_grammar_sft.cjs) and [executed JSON output](lp2-solved-title-body-exact-grammar-output.json) use the nine GP-native solved transcription records, explicitly enumerate their 19 semantic rubrics, and preserve native spellings (including WIDSOM in the reference). Subheadings delimit local bodies; the ADHERENCE body includes the subsequent synthesis before SOME WISDOM. Numeric cells and the p56 hexadecimal digest are not GP words. Original JPEGs 01,03–16,32,39,66–70,73–74 were visually compared for layout; this is a retrospective fixed-rule split, not a blinded experiment with human subjects.

| Exact word-token rule | Earlier LP1 records (8 rubrics) | Later LP1 plus LP2 p56–57 (11 rubrics) |
|---|---:|---:|
| Body begins with complete title | 1 | 0 |
| Complete title occurs in first source sentence/line | 1 | 1 |
| Complete title occurs anywhere in local body | 1 | 2 |
| Longest title word occurs in first source sentence/line | 1 | 1 |
| Longest title word occurs anywhere in local body | 1 | 2 |

The three local body echoes are WELCOME, THE LOSS OF DIVINITY, and ADHERENCE (the last in the summary). This rejects a general exact title-echo crib. Repeated title classes give more specific positive semantic controls:

- **A KOAN**: the first narrative sentence contains native MASTER (six runes) in both koans. It is word 10 (the only six-rune slot) in the first and word 5 (one of two six-rune slots) in the second. Thus a motivated exact word crib can constrain a short receiver if a koan title is independently recovered, but its position is not invariant.
- **AN INSTRUCTION**: all four semantic occurrences begin an imperative, but their initial words are COMMAND, DO, PROGRAM and CWESTIAN. Their first-sentence token intersection is empty. This gives a genre prior, not a fixed plaintext word.
- **KNOW THIS**: both examples introduce an exact 5×5 printed square (one mixed text/number, the other numeric). This is a genuine visible operand-type prediction on the second occurrence, not evidence that every later table uses that heading. LP2 p15 has a 4×4 graphic preceded by nine red runes, while p49's table follows black prose and a red ten-dot mark. Neither supplies an exact seven-rune KNOW THIS rubric.
- **SOME WISDOM**: the first sentences have no shared exact word.

The unknown-cipher eligibility test masks rune identities and compares the exact word-length tuples of all 16 red spans with all 19 solved rubrics (13 unique title texts). **Zero matches.** Even discarding all word divisions, only eight unknown spans match a known title length: p3@0, p6@71, p8@0, p15@0, p15@9, p23@0, p33@0 and p54@0. None matches the independently stronger A KOAN (5) or KNOW THIS (7) total rune length. In particular the p22 mirrored-koan illustration cannot independently fix a complete A KOAN crib in the red rubrics of its p15–22 chapter. The first-run output records all exact tuples and relaxed candidates; no key fitting was conducted. This generalizes the earlier single-title AN INSTRUCTION eligibility result (#2502), rather than repeating its cipher tests.

**Decision:** the finite direct title-reuse receiver has no complete source-selected unknown rubric. The strongest transferable control is a semantic operand class, not a general exact title/body plaintext grammar. Keep the MASTER and 5×5 table predictions only for a future independently decoded or source-selected title. No unknown plaintext, key or cipher mechanism follows. Reopen only if a new source fixes a complete title spelling and a body prediction before ciphertext fitting.
