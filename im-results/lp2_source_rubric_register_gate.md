# Solved-page rubric and red-punctuation control: no authenticated register reset

**Agent31, 14 November 2026; Director #816. Classification:** bounded original-source counterexample to red-marker-driven reset of the *known* 2014 prime-totient cipher, plus a source-selector obstruction. **No unknown-page plaintext or historical LP2 key was recovered.**

## The candidate and its independently fixed controls

A player can recognize the red rune headings and adjacent colored 13-dot marks on original physical p56 (archive `73.jpg`) and p57 (`74.jpg`), with a second ten-dot red mark inside p56. If red rubric or colored punctuation itself selected a cipher/language register change, those two solved controls supply a natural no-unknown-key falsification test. The historical p56 operation is already known: read the 29 GP indices in printed order, subtract the Euler totients of successive primes beginning at 2, and transparently emit plaintext F without consuming a prime at genuine p56 local offset 56. Other ciphertext Fs are encrypted non-F symbols. The p57 control is original unencrypted GP prose.

Input files and their relevant independently annotated source positions:

| Original source | Red GP heading / red markup | Independently solved reading |
| --- | --- | --- |
| p56 / 73.jpg, 85 runes | red ciphertext heading `ᚫᛄᛟᛋᚱ` at 0–4; red 13-dot marker after rune 5; red 10-dot marker after rune 45; red 13-dot terminator after rune 85 | 85-rune AN END message, full prime-totient decryption with F bypass at 56 |
| p57 / 74.jpg, 95 runes | red clear heading `ᛈᚪᚱᚪᛒᛚᛖ` at 0–6; red 13-dot after rune 7; red 23-dot at end | all 95 authentic PARABLE source runes are clear, with source-written ING and IO aliases |

The printed heading construction and 13-dot convention therefore do **not** uniquely distinguish clear from ciphered text: two independently solved adjacent images use the same rubric grammar with different encodings. The red ten-dot on p56 is a still sharper test of whether visible punctuation resets its active key.

The source-native GP encoder uses word-bounded tokenization, the source-labelled `NG/ING` and `IA/IO` aliases, and solved controls' familiar `V→U`, `K/Q→C` and `Z→S` spelling. Words are tokenized independently, preserving the canonical printed GP length; concatenating all English words before tokenization can incorrectly merge letters across a word boundary. The authentic p56 spelling is `EUERY` and `SEEC`, matching the known GP result.

## Frozen direct original-cipher test

Hold the exact source ciphertext, title positions, punctuation and known plaintext fixed. At each proposed marker, reset the *same known prime stream* to its first element; keep the genuine plaintext-F bypass untouched at offset56. Compare the entire decrypted 85-rune original to the authenticated solved control, with neighboring wrong-position resets to distinguish marker-specificity. No guessed key, hidden ciphertext correction or language score enters the test.

| Applied known-key clock | Original p56 symbols equal to authenticated plaintext |
| --- | ---: |
| Historical uninterrupted prime-totient key | **85 / 85** |
| Restart immediately after red heading, offset 5 | **6 / 85** |
| Restart at red 10-dot, offset 45 | **48 / 85** |
| Restart at both markers | **8 / 85** |
| Wrong reset at offset 4 | 5 / 85 |
| Wrong reset at offset 44 | 46 / 85 |
| p57 original clear GP against authenticated reading | **95 / 95** |

The 48 matches for the internal offset45 reset include the already-correct prefix; after that false marker the remainder is wrong at 37 of its 40 rune positions. A printed colored punctuation mark is **not** a reset instruction for the historically authenticated p56 key. The literal-F rule has an actual source-specified special character event, distinct from a general rubric transition.

The exact [portable CJS original-source SFT](../sims/lp2_source_rubric_register_gate_sft.cjs) asserts original p56/p57 rune arrays, original image-ink coordinates, both full historical controls, all six clock comparisons and p57's 95/95 clear reading. It reads [canonical original rune indices](../resources/liber-primus/lp2-corpus.json) and [source-audited red markup](../resources/liber-primus/lp2-ink-annotations.json); local Node22 test passed with a fixture made from those fetched original page/ink entries. No manual GitHub Actions run was dispatched for this bounded test.

## Source-selecting instruction absent in the audited historical controls

The authenticated 2013 Gematria Primus source selects the 29 written grapheme labels and prime weights; a separately signed 2013 `BASE29` instruction selects positional integer notation for a TCP response. The LP1 clear SOME WISDOM explicitly teaches the primacy of primes and the totient function but does not attach a plaintext language/romanization switch to red headings. The signed May 2014 Stage11 redirect and its preserved image-list HTML name an onion and 58 JPEGs but provide no register-switch opcode or key clock. Source-controlled p57 demonstrates ordinary written English grapheme grouping. These scoped originals supply no complete alternative language alphabet, state reset, keyed conversion or new LP2 operation at a red heading.

This is **not** a proof that unknown p0–55 use the same cipher or language as p56/p57, or that no undeciphered heading can contain a command. Distinct encodings can share a visible rubric. But the available source controls do not authorize constructing an arbitrary switch to Old English, phonemic text, or a hidden per-chapter cipher from marker positions alone.

**Director #816 decision:** retire the premise that the existing solved Cicada controls themselves select a new marker/register transition. An eventual new primary instruction must supply the register mapping, key and clock before any original unknown ≥40-rune inverse is justified. Independent source discovery remains legitimate; fitting fresh dictionary or rune substitutions after reading the unknown ciphertext does not resolve this missing selector.