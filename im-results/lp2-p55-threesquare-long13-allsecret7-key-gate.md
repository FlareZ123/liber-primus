# Original p55 long word: exact seven-secret-key obstruction to 2014 square-row arithmetic

**Agent 6, 17 November 2026. Key-independent candidate-decoder constraint, no new original plaintext or authentic key.** This report strengthens the previously tested [fixed historical three-square row Vigenère consumer](lp2-p55-2014-three-square-17row-full76-direct-inverse.md) to arbitrary secret additive shifts on the seventh source row. Its constraints are conditional on one preserved p55 word spelling from a declared GP-English lexicon, an assumption explicitly tested in two rune spelling registers.

## Human-selected route and untested decision

The original 2014 Cicada OpenPuff document prints three numeric squares, **5×5, 7×7, 5×5**, with **17** printed rows. Original LP2 physical p55 also shows **17** word segments including its initial one-rune continuation from p54. This count suggests a one-row-per-p55-word map, although no authenticated source explicitly makes that assignment or says to use Vigenère. Source row **8/17** (zero-based 7) is the **third row of the 7×7 square**:

\`456 232 121 114 72 23 15\`.

Its seven original integers are all different. The corresponding p55 original word **8/17** has exactly **13** GP29 ciphertext runes, with original transliteration

\`B EA F X I M U C P H NG L EO\`.

Its only ciphertext F is at zero-based offset **2** inside that word.

A single 13-rune original word is enough to test a necessary condition for any **seven-phase additive key** derived from its historical row, even when the original seven numbers are transformed by an entirely unknown secret function. Grant **every one of the 29^7 independent possibilities** for its seven source-row shift values, including any repeated values. The historical row supplies a period-seven clock, with no chosen key, phase tuning or word edit:

\[
C_i \equiv P_i + K_{q_i \bmod 7}\pmod{29}.
\]

Two first-party-relevant modes are fixed: (1) all 13 ciphertext glyphs consume the key in the simple historic Vigenère fashion, and (2) true plaintext F emits ciphertext F and does **not** advance \`q\`, as in the authenticated p56 cipher. In mode 2, a ciphertext F may also be the encrypted image of a non-F rune. The initial phase is key slot zero at the original word start; each numeric square row is permitted its own wholly independent secret key.

## Exact unknown-key original calculation

For each candidate original-language plaintext word of length 13, the first seven *consumed* rune positions determine its entire seven-key shift vector via \`K = (C-P) mod29\`. Each later consumed position must agree with the same earlier key phase. If true plaintext F occurs, require the original ciphertext F and skip its shift; this tests the exact transparent plaintext-F clock without choosing F sites retrospectively.

Use the pinned 29,055-source-word GP dictionary constructed from \`resources/control/english_wordfreq_textblob.txt\`, counting original Latin spellings of exactly 13 GP runes in two registers: (a) source-calibrated native longest GP token spelling, including **ING→NG** and **IO→IA**, and (b) an independently defined GP one-rune-per-normalized-letter register. Literal-text spellings normalize **QU→CW, V→U, K/Q→C and Z→S**, exactly as in the existing GP-English controls. These are language coverage controls, rather than claims to exhaust every possible authorial term.

| Frozen source input and decoder | Number of 13-rune candidate spellings | Source-original exact matches under any seven-rune secret key |
| --- | ---: | ---: |
| GP-native text, all 13 cipher runes consume key | **382** | **0** |
| GP-native text, plaintext F passes without consuming | **382** | **0** |
| Letter-spelled GP, all consume key | **549** | **0** |
| Letter-spelled GP, plaintext F bypass | **549** | **0** |

With actual authenticated p56-style transparent F, the native GP candidates fail as follows: **38** have an impermissible literal plaintext F at a non-F ciphertext position; the other **344** demand contradictory shifts from the **same** seven-phase key. For letter-spelled GP, the corresponding counts are **53** and **496**. The simple all-consumed native word has six repeated-key difference constraints: the six ciphertext differences between positions \`i\` and \`i+7\`, \`i=0..5\`, are exactly **17, 14, 8, 7, 10, 22 modulo29**. None of the 382 tested native thirteen-rune English spellings satisfies all six, even without selecting a key. The nearest spelling in that finite list still violates three constraints.

This rejects the direct historical row numerical values from the earlier report **and every other secret, stationary seven-shift map** on this one source word, under the two specified plaintext spelling registers and explicit F convention. It does not derive any original plaintext candidate.

## Non-exclusion control, synthetic positive and scope

The [source-original CommonJS SFT](../sims/lp2_p55_threesquare_longword_allsecret7_sft.cjs) checks real square numeral shapes, exact p55 source ciphertext, every candidate word/key conflict, all F passes and a deliberately **stronger cipher-family control**. If each seven-key phase is instead allowed an independent **secret 29-way bijection**, with no additive structure, the same exact 13-rune ciphertext is compatible with **254/382** native and **349/549** letter-spelled source dictionary words. That is a mathematically different model. Accordingly, the negative above is an **additive seven-shift-family obstruction**, rather than an assertion that every secret seven-phase 29-symbol substitution is excluded.

Artificial forward encryption of the authentic GP-dictionary words \`TRANSPARENTLY\` and \`SIGNIFICANTLY\`, in both spelling registers, with a hidden actual seven-shift key **[2,7,12,17,22,27,3]**, passes the exact inverse and recovers **all seven original secret shifts**. The positive includes genuine F nonconsumption for SIGNIFICANTLY, so the source gate is not spuriously rejecting valid examples of its target family. The operation may use different numeric-source transformations on other words, but that cannot repair the incompatible row-8 source word.

**Decision:** Drop any row-static, period-seven additive GP29 interpretation of the historical 17-row/17-word alignment as a direct GP-English p55 decoder, unless an authentic new 13-rune plaintext spelling outside the tested lexicon or a different explicit symbol-update law is identified. A truly independently sourced entire p55 sentence or a source-selected nonadditive row permutation would be a meaningful next input. Do not generalize this finite lexical constraint into a cipher-family impossibility over every conceivable language, insertion rule or external stage.

[Windows Node22 read-only reproducer](../sims/lp2_p55_threesquare_longword_allsecret7_sft.cjs). Its source-original inventory, exact word/cipher matches and all synthetic controls were independently evaluated in memory against the live GitHub corpus. A Windows manual CI execution was **requested**, but success is not presumed until the runner reports completion.
