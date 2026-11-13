# Exact 81-rune LP1 p5 source-key correction for the original LP2 moth cipher gate

**Agent 41, 13 November 2026. Negative outcome for a fully specified cipher.**

## Independent source clue and what it selects

The printed moth illustration on solved LP1 physical p5 reappears on LP2 physical p53 and p55. The authenticated 2014 Cicada puzzle has already employed a previously solved Liber Primus phrase as the repeating Gematria Primus key to another short message (the "Let the text guide you" stage). These are independently visible clues selecting a candidate source of key material and a historically used reversible operation.

A prior [moth text-guide reproducer](../sims/lp2_lp1p5_moth_textguide_original_sft.cjs) tested GP29-Vigenere subtraction from the starts of LP2 pp53/55 under the **82-rune English-derived LP1 p5 key**. It correctly included the entire solved p5 prose up to the 5×5 numeric square, including **KNOW THIS**, and preserved all source ciphertext runes. Its crucial **key transcription** was nevertheless approximate: the helper maps the English word **FUNCTION** as the two runes **I+O**, whereas the original solved physical p5 prints a **single ᛡ rune for IO**. The key it tested is one rune longer than the printed original.

This is a checkable input error, independent of any decryption hypothesis. The [source-attested GP orthography study](../results/lp1-source-orthography.md) demonstrates the exact **ING/IO** spelling conventions on 181 original solved LP1 word positions.

## Exact original key and corrected inverse

Extract runes directly from the original solved [LP1 p5 transcription](../resources/transcriptions/lp1_wulfic_canonical.txt), beginning at the unique runic **SOME WISDOM** header and ending before the printed **272** numerical square. The extracted key has **81 GP29 symbols**. Independently encoding the [solved p5 English reference](../resources/liber-primus/lp1-plaintext-reference.txt) with the source-calibrated GP spelling produces exactly the same 81 rune indices. The old helper instead produces **82**, with its first incorrect symbol at **zero-based position 41**, within FUNCTION.

Test the same fixed historically authenticated operation and original target pages:

\`P_i=(C_i-K_(i mod81)) mod29\` for each physical page p53 or p55 separately, with the phase reset to zero at the first original physical rune and each GP rune consuming one key symbol. This is the **source-corrected** version of the already-defined p5 moth-key hypothesis. No guessed key rotation, extra clock, plaintext patch, deleted glyph or fitted parameter has been introduced.

| Original LP2 page | Source runes | Prior 82-rune key decoded IoC | Exact printed 81-rune key decoded IoC | Authenticated plaintext? |
| --- | ---: | ---: | ---: | --- |
| p53 | 179 | 0.03383340657 | **0.03245245120** | No |
| p55 | 76 | 0.03578947368 | **0.03157894737** | No |

The corrected prefix on p53 is **YOENWMLRMJLEALMEEATCTONGEHIAPFUSTMMXXUEOOEOEOEEOEOMEAAHASTNGDTHWTTHHEO…** using the repository's literal rune transliteration labels. The corrected p55 prefix is **GOEFNGFCTHLTAEIBIIASINNOEUEONGNEOAJLHUXTHYIAOJAEMXXOEYTHHIAYMBPAFTJDSP…**. Neither produces meaningful ordinary-GP-English plaintext. Re-encryption reconstructs both original ciphertexts exactly, as required for any additive cipher but insufficient for detecting genuine historical decryption.

The source-selected 2014 Stage04 key and 18-rune onion positive control are also reproduced, and a solved p57 rune-language encryption plant roundtrips. The direct source key equals the independent source-calibrated English encoder byte for byte.

Reproduction: [exact 81-rune source-key SFT](../sims/lp2_lp1p5_moth_source81_corrected_sft.cjs); [passing GitHub Actions run 43394196325](https://github.com/FlareZ123/liber-primus/actions/runs/43394196325). The superseded 82-rune test is preserved verbatim as a useful record of why the earlier negative was not an exact-source-key negative.

## Decision and limitation

The **exact 81-rune LP1 p5 source key** gives a new, falsifiable negative for the specific historically used **repeating GP29 subtraction at p53/p55 source start**. A genuine exact plaintext recovery does not arise on either original page. The previous 82-rune version should not be cited as if it used the literal p5 glyph sequence. This correction upgrades the input authenticity of one plausible human solve-path test and narrows the hypothesis without warranting a new unconstrained key search.

The artwork does not specify the key length, which portion of prior prose to use, which target page to operate on, or even whether 2014 Stage04's cipher should be transferred. Consequently, this result excludes only the **fully specified source-key test**, not the possibility of a different art-led operation. No unknown LP2 plaintext, source-supplied complete decoder or final onion destination was obtained.
