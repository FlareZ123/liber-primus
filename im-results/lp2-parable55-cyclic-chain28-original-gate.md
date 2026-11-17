# Direct 28-step chain with PARABLE's 55-rune interior: original LP2 negative

**17 November 2026 · Agent49.** Source-motivated exact reversible family; all 55 encrypted physical LP2 pages remain unsolved.

## Why a player might try this

The 2016 signed Cicada phrase “its words are the map, their meaning is the road, and their numbers are the direction” invites a conditional **directional step** reading. The encrypted pages have only **86 equal adjacent runes in 12,901 same-physical-page pairs**, far fewer than an approximately uniform independent GP29 stream, while their 29-symbol marginal counts remain almost flat. Replacing literal symbol values by consecutive **nonzero modulo29 increments** is one direct way to reproduce this exceptional no-repeat feature without a complicated cipher.

The independently clear original p57 *PARABLE* contains a source-specified phrase “shed our own circumferences.” Removing the first and last rune of each of its 20 words leaves **55 GP29 key symbols** (title 5, body 50), the number of unknown rune-bearing physical pages. The complete 55-rune internal tape contains **no last-alphabet GP29 EA rune** (index28), so it can be read directly, with no discarded symbol, as a repeated 28-symbol source key.

Neither the 2016 signed clue nor *PARABLE* specifies that the manuscript uses the following chain mode or that this tape is a running key. The coincidence is a clue-conditioned hypothesis, not an established historical instruction. This test is deliberately independent of [#1329's traditional additive key-pointer experiment](https://github.com/FlareZ123/liber-primus/issues/1329) and the [PARABLE pdir trial](lp2-parable55-all66-word-pointer-original-phase0-gate.md).

## Fully specified and reversible source-key candidate

Index the Gematria Primus alphabet 0..28. Let the 55-symbol p57 interior tape be K. For a ciphertext GP29 rune C at position i and previous ciphertext rune Cprev, let \`step = (C - Cprev) mod29\`.

Freeze the natural **EA-reserved** 28-step chain:

- \`step = 0\` means \`P = 28\` (literal EA). This permits the rare observed ciphertext repeat without an extra skip-bit channel.
- \`step in 1..28\` means \`P = (step - 1 - K[i mod55]) mod28\`, giving one of the other 28 plaintext runes.
- The corresponding forward encoder is \`C = (Cprev + 1 + ((P + K[i mod55]) mod28)) mod29\` for P≠28 and \`C=Cprev\` for P=28.

Every GP29 plaintext sequence has a unique ciphertext under this known key and initial previous symbol, and every ciphertext uniquely decodes. The rule uses the source GP prime rune indices directly: the tape has no EA, so \`K[i]<28\` is natural.

To bound simple source variations without parameter fitting, the trial grants two source-visible tape orders (literal title-first versus conditional table-split body-first), both ± key directions, both page-continuous and page-reset clocks, and both GP29 endpoint symbols EA=28 and F=0 as the zero-step escape (the latter requires shifting all 28 normal decoded rune indices by one). This is **16** complete original-cipher receivers. Cprev is zero for the first rune or at each physical-page reset; no source-specific phase offset, free permutation, inferred key or language maximization is permitted.

The input is the untouched canonical 12,956-rune ciphertext for physical LP2 pp0–55, preserving rune order and all physical page boundaries. The additional independent regions are original opening pp0–2, withheld 14-page pp40–53, and terminal pp54–55. One index-of-coincidence statistic per region suffices to reject direct GP-native English, and all 16 full candidate plaintexts can be regenerated exactly.

## Original-input outcomes

The best normalized \`29×IoC\` over all 16 direct decoders is:

| Original independent region | Best normalized GP29 IoC |
| --- | ---: |
| Opening physical pp0–2 (729 runes) | **1.035933** |
| Held-out physical pp40–53 (3,008 runes) | **1.026251** |
| Terminal pp54–55 (308 runes) | **1.028047** |
| All 55 unknown rune-bearing pages (12,956 runes) | **1.024512** |

For comparison, a fixed 300-rune source-native English plant from independently solved LP1 *WELCOME* has normalized GP29 IoC **1.642363**. A separate forward planter implements the exact frozen chain encoder with the literal 55-rune tape, sign+, EA-reserved, and a previous-ciphertext seed of zero, then exhaustively asserts **300/300 exact original-rune recovery** by the inverse. A reversed-key control yields less English-like plaintext. The real original ciphertext remains flat in every tested independent region, including the longest 3,008-rune section, for which true native GP29 English would have substantially higher coincidence.

This excludes the specified **direct one-layer** 28-step chain reading using the clear p57 55-rune tape at phase zero; it does not exclude a chain using another source key, another alphabet, a secret tableau, a second cryptographic layer, a physically indicated nonzero key phase, or plaintext that is not natural GP29 English.

## Reproducer and decision

[Single-file Windows-compatible CommonJS test](../sims/lp2_parable55_chain28_original_sft.cjs) reads the original rune transcription and source pages, verifies the p57 55-rune tape, enciphers and decrypts the independent LP1 known plaintext, and tests all **16** original complete reversible models on four independent scopes. The [manual workflow](../.github/workflows/agent49-20261116-source-gates-manual.yml) runs it together with the distinct original pointer-direction source-key gate.

**Retire this specific PARABLE 55-tape cyclic 28-chain receiver.** The source-visible p57 circumference tape remains a potential operand with an unidentified operation. The low-doublet original cipher remains a source fact worth explaining, but applying a new free modulo, offset, table permutation or arbitrary key-phase sweep without an independent Cicada-authored selector has no justified causal path to plaintext.
