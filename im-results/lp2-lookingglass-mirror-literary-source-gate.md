# Carroll mirror-text hypothesis: source-literal original LP2 inverse gate

**Agent22, 18 November 2026. Classification: narrowly bounded negative literary route, with authentic original-source and synthetic positive controls. No unknown LP2 plaintext, authentic key, or Cicada continuation is recovered.**

## Human-visible premise and its strongest objection

The already-solved LP1 instruction says **“DO FOUR UNREASONABLE THINGS EACH DAY”** in `resources/liber-primus/lp1-plaintext-reference.txt`. Lewis Carroll's *Through the Looking-Glass* (1871) has the White Queen speaking about believing **six impossible things**; its first chapter makes a directly operational puzzle of the poem *Jabberwocky*: the printed verse is mirror-written and Alice reads it with a looking-glass. The authentic earlier LP1 cipher family already used reversed-Gematria/Atbash, which makes a literal mirror operation something a period solver could attempt.

**The proposed connection is conjectural.** Four/unreasonable/each day is not the Carroll quotation six/impossible/before breakfast, and no first-party Cicada source in this test mentions Carroll, Alice or the poem. The known LP1 reversed alphabet is a historical fact, but it does not authenticate reusing it on LP2. We therefore tested only the small author-visible operations, and did not scan arbitrary full-book offsets, invented secondary keys or tuned word cribs. Public-domain historical literary reference: [Project Gutenberg, *Through the Looking-Glass*, eBook 12](https://www.gutenberg.org/ebooks/12).

## Exact original-cipher test

The [read-only CommonJS reproducer](../sims/lp2_caroll_lookingglass_mirror_source_sft.cjs) parses the complete original LP2 rune stream and physical manuscript structure from `resources/transcriptions/liber_primus_master.txt`, requiring an exact **12,956/12,956** GP29 match to the independent 58-page `resources/liber-primus/lp2-corpus.json` numeric reference. Printed `/` and `%` delimit physical line/page reversals; `-`, `.`, `&`, `§`, `$` delimit the wordwise reading. Each mirror is a perfect, tested involution.

The three preselected short GP29 key texts are **SIX IMPOSSIBLE THINGS BEFORE BREAKFAST** (31 GP runes), **THROUGH THE LOOKING GLASS AND WHAT ALICE FOUND THERE** (40 GP runes), and **JABBERWOCKY** (11 GP runes). The latter two are the original title/poem label, and the first captures the White Queen's recognizable phrasing. English K/V/Q/Z are normalized using the documented GP29 C/U/C/S spelling convention; multi-letter GP transliterations are tokenized greedily. No complete novel or poem running key was fitted in this committed, frozen gate.

Each candidate applies one of five original-layout rune readings (unaltered, entire-book reversed, printed-line reversed, printed-word reversed, physical-page reversed), with or without the historic GP Atbash `x ↦ 28−x`, and one of two additive signs for a cyclic literal key. The solved p56 literal-ciphertext-`F` nonconsumption is tested as an independent optional branch. Every tested inverse is exactly defined by `P_i=(C_i±K_j) mod29`, with `j` advancing on ordinary runes or held when the optional literal-`F` branch is active. The periods start at key offset zero for each designated test region; all 480 comparisons are explicitly the cross-product of those small source-shaped choices and four regions. No free phase or learned alphabet is available.

The independent original regions are physical **p0–2 (729)**, **p3–7 (1,145)**, **p40–53 (3,008)** and **p54–55 (308)** runes. Each reports its maximum whole-region GP29 index of coincidence (IoC) over 120 candidate decoders:

| Original region | Untouched original IoC | Largest candidate IoC, searched 120 source-defined variants | Best combination |
| --- | ---: | ---: | --- |
| p0–2 | 0.03408252 | **0.03774929** | page reverse; Atbash off; Looking-Glass key, additive +; ciphertext-F copied |
| p3–7 | 0.03463371 | **0.03753016** | full-book reverse; Atbash off; Looking-Glass key, additive −; F copied |
| p40–53 | 0.03454263 | **0.03723780** | page reverse; Atbash off; Jabberwocky key, additive +; F copied |
| p54–55 | 0.03382123 | **0.03993401** | full-book reverse; Atbash off; Looking-Glass key, additive +; F copied |

For comparison, original clear solved p57 is **0.0627099664** GP29 IoC. Its 95 actual clear runes were also used in six exactly reversible synthetically planted native-GP29 Vigenère positive controls, covering all three fixed keys and both signs. All six recover the exact original clear p57 string. The original-source maxima remain much closer to the near-uniform encrypted input than the authentic native-GP prose control; none yields a coherent text passage, key or new instruction. This comparison addresses the particular native-GP29 English output assumption, not every possible target language or multi-stage cipher.

## Decision and bounds

**Do not prioritize a simple repeated Carroll phrase-key with literal mirror-writing, old Atbash and/or the historic ciphertext-F interruption as the missing direct unknown-page decoder.** The motivating allusion itself is speculative. The finite negative is conditional on the exact three phrases, zero key phase, selected physical reading modes, native GP29 additive output and the four chosen regions. A newly discovered Cicada-authenticated Lewis Carroll pointer specifying a longer text, page index, or cipher receiver would materially alter this decision. No such pointer was found here.

Execution: [Windows Node.js 22, original checked-in files, successful workflow run 44216944427](https://github.com/FlareZ123/liber-primus/actions/runs/44216944427). The program normalizes Windows Git checkout CRLF and verifies the master/source rune identity before computing any results. An earlier Windows run failed at this input normalization, and was corrected without changing source data or the tested cipher family.
