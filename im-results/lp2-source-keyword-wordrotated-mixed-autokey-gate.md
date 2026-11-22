# Source-keyword mixed-alphabet ciphertext autokey: all word rotations on original LP2

**Classification (Agent9, 16 November 2026):** a completed *conditional negative* against six source-motivated or control 29-symbol alphabets. No unknown-page LP2 plaintext, authentic key, or complete decoder recovered. The precise positive and original tests passed on Windows Node.js 22 in [Actions run 43849688298](https://github.com/FlareZ123/liber-primus/actions/runs/43849688298).

## The proposed inverse and why it was worth one trial

The independently observed near-absence of doubled neighboring GP runes motivates testing ciphertext-feedback ciphers. A more expressive, small-key variant of additive feedback uses a mixed GP29 alphabet `K` and an unknown cyclic *output* rotation `r_w` per printed word. For rune positions `j>=1`, write

`C_j = K((K^-1(C_(j-1)-r_w) + P_j - e) mod 29) + r_w (mod 29)`.

The exact inverse is

`P_j = K^-1(C_j-r_w) - K^-1(C_(j-1)-r_w) + e (mod 29)`.

The first rune of **every** word is entirely unconstrained, granting the model a free initializer. The word rotation is also completely free, rather than guessed from a first-cipher-rune or chapter clock. The four identities `e` tested are the rare source-GP runes J/EO/OE/AE at indices **11,12,22,25**, motivated by the separate dead-rune autokey proposal in [Michel Oosterhof's 2026 hypothesis catalogue](https://github.com/micheloosterhof/aldegonde/blob/main/hypotheses/ciphertext-autokey-with-a-dead-identity-rune.md). The historical Cicada *alphabets* examined are the direct canonical GP order, its already-demonstrated Atbash reversal, and conventional 29-symbol keyword-mixed alphabets seeded by genuine solved-LP1 terms **DIVINITY**, **FIRFUMFERENFE**, **CIRCUMFERENCE** and **WISDOM**. Keyword mixing uses the first distinct rune occurrences followed by the unused canonical GP runes. This keyword-extension convention is an experiment choice; the original LP2 does **not** instruct using it.

## Original-source all-phase test

Parse the unchanged source transcription with the repository's authoritative page-wrap/word-wrap parser. The source has **12,956 runes in 2,896 complete printed words**, including **343 words of GP length 8–14**. The historical-reference comparison dictionary consists of **13,196 distinct GP29 interior word patterns** of lengths 8–14, built from unchanged TextBlob spelling data, Gibran and Shakespeare source texts, using existing solved-source GP spelling rules (including ING and IO). For each candidate ciphertext word, every source-reference match is checked against all 29 rotations `r_w` and all four `e` values independently. **One matched word** would mean that its original ciphertext suffix decrypts exactly to a source-English dictionary word's suffix under the proposed operation; the leading plaintext glyph is intentionally not checked.

| Alphabet construction | Allowed e values | Original length-8–14 matches over all rotations |
| --- | --- | ---: |
| GP29 canonical | J, EO, OE, AE | 0 |
| GP29 Atbash | J, EO, OE, AE | 0 |
| DIVINITY-mixed | J, EO, OE, AE | 0 |
| FIRFUMFERENFE-mixed | J, EO, OE, AE | 0 |
| CIRCUMFERENCE-mixed | J, EO, OE, AE | 0 |
| WISDOM-mixed | J, EO, OE, AE | 0 |

**All 24 alphabet/identity combinations have zero matching original long words.** The dictionary has 4,429 distinct GP length-8 interiors, 3,481 of length 9, 2,461 of length 10, 1,494 of length 11, 790 of length 12, 387 of length 13, and 154 of length 14. Each reference pattern represents a complete candidate word of that length; the full-word first rune is ignored.

## Independent exact positive

For each of the canonical, DIVINITY-mixed and FIRFUMFERENFE-mixed alphabet constructions, take **64** independently selected source-English words of GP lengths cycling through 8–14. Assign a deterministic, arbitrary first ciphertext rune and an independently determined hidden rotation per word. Encrypt their remaining suffixes with the exact stated forward law at `e=EO`, then run the identical all-rotation dictionary inverse. Each positive has **64/64** expected word matches. This proves the negative gate is capable of recognizing this exact construction when it is actually the encoder. It does not prove recoverability when the underlying mixed alphabet is an unguessed secret.

## Decision and scope

Retire this precise direct reuse of solved-round key words in the *word-rotated, mixed-alphabet ciphertext-autokey* class. Reoptimizing word rotation or changing which of the four rare GP identities is used cannot rescue these fixed source-keyword alphabets, because the test already exhausts those freedoms. None of the 343 tested original long words is recovered as source-native English under any of them.

This **does not** exclude an arbitrary secret 29-permutation, a source word outside the finite dictionary, re-segmented plaintext, inserted/repaired duplicate runes, additional cipher layers, or different within-word state. The standalone cipher family is not independently authenticated as Cicada's algorithm; the test constrains specific accessible-key instances and should not be promoted to a solution.

**Reproducer:** [`sims/lp2_keyword_autokey_wordrotation_sft.cjs`](../sims/lp2_keyword_autokey_wordrotation_sft.cjs), with the pinned parser and preserved corpus/lexicons; [manual Windows Actions workflow](../.github/workflows/agent9-keyword-autokey-rotation-manual.yml). The SHA-verified commit history and CI pass retain the exact method and source inputs.