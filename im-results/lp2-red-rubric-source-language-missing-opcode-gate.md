# Red-rubric instruction grammar: source-title mode counterexample and missing opcode

**Director #2250, Agent3, 22 November 2026.** Original LP2 page0 begins with two entirely **red** words of **8+5 GP29 runes**, separated by one small ordinary red divider. The title ends at the **large red 13-dot mark after rune13**. A previously proposed reading of red8 / black5 or a 13-dot mark after rune8 is physically incorrect; the source-compatible override is `resources/liber-primus/lp2-p0-physical-ink-override.json` for original image 17.jpg. The opening chapter has 716 following intact black runes across p0–p2. A finite, human-executable cipher *language* would require instructions defining opcode, key operand, clock/start, and which black text to transform.

The decisive known-original control already shows that the visual markup **does not identify the cryptographic opcode**. The two authentically solved LP2 terminal pages both print an entire **red heading word followed by a red 13-dot section mark**, but they require different treatments:

| Original solved page | Red heading as printed, GP29 | Same color and adjacent large mark | Authenticated plaintext heading | Required operation |
| --- | --- | --- | --- | --- |
| LP2 p56, original 73.jpg | `ᚫᛄᛟᛋᚱ` / AEJOESR, 5 runes | Red / 13 dots after rune5 | **AN END**, two plaintext words | Subtract the actual first five prime-totient terms **[1,2,4,6,10]** modulo29: AEJOESR→ANEND |
| LP2 p57, original 74.jpg | `ᛈᚪᚱᚪᛒᛚᛖ` / PARABLE, 7 runes | Red / 13 dots after rune7 | **PARABLE**, one plaintext word | Literal unencrypted GP29 reading |

The exact p56 prefix is `[25,11,22,15,4]` and its inverse is `[24,9,18,9,23]`; the original five-symbol reencryption recovers the source. The rest of p56 has a **special selective F bypass**, which must be respected for any full-body implementation. The title-only comparison avoids inventing a general rule for bypassing cipher-F. P57 identity is independently established from its full solved text and page. This is a genuine counterexample to “red title + red 13-dot mark selects a single fixed cipher mode”. Even the **ciphertext red-word break** need not be a plaintext break: p56's single printed red word corresponds to AN END. A separate original solved LP1 red-heading regression already demonstrates clear red titles and a Vigenère-encrypted red title with continuous black-body key clock: `sims/lp1_solved_red_title_two_mode_source_sft.cjs`.

## Contrasting unsolved first-page evidence

Exact original-source red ink and typography, preserving word delimiters and body:

| Physical page | Two printed red title words (GP transliteration) | Source ink/marker layout | Source intact black receiver |
| --- | --- | --- | --- |
| p0 | **SHEOGMIAF · SYENGC**, 8+5 runes | Small red word separator after rune8, large red 13-dot after rune13 | **716** following runes p0–p2, including all original word and page carries |
| p8 | **XIXM · UXMCTHPOB**, 4+8 runes | Ordinary red word separator, **no** large mark after red heading | **243** following black runes p8, then continuing p9 |
| p40 | **FNM · YGDAEH**, 3+5 runes | Ordinary red word separator, **no** large mark after red heading | **223** following black runes on p40 |

The committed color annotations identify **16** red unsolved spans containing **213** red runes. Using the rune transcription, source mark and word delimiters, their **52** complete red word tokens are **all distinct**. The red pages include other large punctuation and double-heading structures, so 13-dot-mark adjacency is not even a universal red-span delimiter. A lexical instruction grammar assigning one repeatable opcode to a recurring *literal red word* has no observed repeated token to calibrate. This observation is descriptive, and does not rule out an encrypted opcode alphabet with an external dictionary.

Earlier work has already tested the exact p0 original red13+black716 source under multiple prime/periodic/2014 historical hypotheses; see `sims/agent30_p0_red13_body716_source_sft.cjs`, `sims/agent30_p0_red13_body716_periodic_control_sft.py` and `sims/lp2_2014_index331_p0_red_primepair_sft.cjs`. The last report supplies the independently observed 2014 HTML `<title>133</title>` and `<div id="331">` numerical alignment with p0's 8+5 red-word GP prime-weight sums, **347 and315**; its direct original p0 prime-totient transfers fail after 24/25/2 runes. It is numerically interesting, but the author supplied no mode/clock/recipient in that HTML. Repeating it as a “program” without an independent opcode is not justified.

## Decision and precise missing operand

An instruction grammar grounded **only in ink color, red word count, 13-dot marks, and source-red GP words has no source-selected unique cipher instruction**. The solved original pages establish two distinct valid title modes under the same markup. Neither red words' raw GP29 spellings nor these markers specify how to choose between literal and encrypted text, how any black-text cipher resets or continues, or what key/recipient is used. A finite conditional grammar could exist if a missing external first-party legend or opcode-to-key table were recovered, but no such legend is identified here. Any new proposal should supply that original-authored **key/mode selector** and commit to the exact p0 red13 → p0–p2 black716 transition plus a different chapter holdout before optimizing plaintext.

No source-selected full-rune inverse is presently specified, so the Director's 300+200 original-body trial cannot honestly be run: choosing a formula after reading those ciphertexts would be an invented operation. This is the explicit **missing-authored-opcode fork**, rather than an exclusion of every imaginable dynamic grammar. It recovers no unknown plaintext.

**Reproducibility:** [single source-bound CJS SFT](../sims/lp2_red_heading_instruction_grammar_source_gate_sft.cjs), reading the original rune corpus, physical ink override, preserved original text delimiters and red/13-dot marks. [Independent solved-p56 full cipher positive](../sims/authentic_lp2_p56_totient_regression.cjs) and [independent LP1 red-title two-mode positive](../sims/lp1_solved_red_title_two_mode_source_sft.cjs) remain the separate encryption-mode authority. **Windows Node22 PASS** on the exact source-bound SFT: [run 45019109544](https://github.com/FlareZ123/liber-primus/actions/runs/45019109544).
