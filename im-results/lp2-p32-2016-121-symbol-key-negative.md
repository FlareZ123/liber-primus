# 2016 121-symbol candidate key for p32 — negative gate

**21 November 2026, Agent1. Classification: bounded, source-motivated exploratory negative.** No plaintext, key, or cipher mechanism recovered.

## Hypothesis

The authenticated 2016 clear-signed message has a source-visible 29-word core body, from `The` through `direction`. Under the repository's GP29 transliteration (including the established K→C and V→U aliases and GP digraphs), those 29 words contain **115 rune symbols**.

That count has a cross-source numerical match: the p28 DH state tuple records (p=23) and (g=5), so (p g=115). This is a suggestive count relationship, not proof of an intended key.

The first coda sentence, **“Seek and you will be found.”**, has six words. Taking each word's GP0 sum modulo 29 gives **[27, 27, 1, 28, 6, 7]**. Appending those six values to the 115 body rune symbols produces a 121-symbol candidate key. Physical p32 has exactly **121 runes** and is the receiver of the separately reported p50 navigation route.

This is a deliberately narrow test of the most direct length-matched construction:

`K = GP29(body words concatenated) || [GP0(Seek), GP0(and), GP0(you), GP0(will), GP0(be), GP0(found)]`.

The exact source does not explicitly instruct the solver to concatenate the body runes with the coda word sums. The 115+6 construction is therefore a hypothesis, not an authenticated cipher instruction.

## Fixed inputs and operation

- Source text: the authenticated 2016 payload transcribed in `resources/cicada2016-4gq25.md`; the body register excludes the separate `Hello.` salutation and stops at `direction`.
- Alphabet: `resources/liber-primus/lp2-corpus.json` GP29 order and transliteration.
- Receiver: original p32 sequence in `resources/liber-primus/lp2-transcription.txt`; the canonical corpus independently records 121 runes.
- Key: the 115 body GP indices in source order, followed by the six coda GP0 word sums modulo 29.
- Operations: the three standard additive orientations, with no offset, key rotation, reordering, or parameter tuning:
  - Vigenère decryption: (P_i=C_i-K_i pmod{29})
  - Vigenère forward: (P_i=C_i+K_i pmod{29})
  - Beaufort: (P_i=K_i-C_i pmod{29})

## Result

All three outputs are non-linguistic GP streams. The script preserves original p32 separators in its full output; the compact strings below omit separators.

**Vigenère decryption**
`EPEOEODIONMETHALLUTHEOCTHOPITMEAOEEXPGJTHEANGXAEIARMCJWAEPTHTYBCOEETXEARFJEOOIAPEAOIAESYXMXEOGLPEFIAJNIAYMNAHLMWWEAMXNPNGOEAEFOEAEIAXLWEEOLTGIAILPLPEDWJC`

**Vigenère forward**
`OELNTHIANGDTLAEJNGDXHEAOTHEOETHRBYGOMELDERCANGPNAAEOMRRRJEIAHGYAEUROEAOEOYNGUFOEGAEMRDNJTPJNGIAIATTHOEEIADTOXIWYAETDNGFNGIACCFOMBOEIAJAEFJAPHPJMNNXAECDM`

**Beaufort**
`JTBBGMYLIJIACNNEAIABAIAYTMPIUWJSTDEIAUHSRTHAEIAEOERTIAPOEOAWJPSUAEFEBYTHTUYTHJXOSISBDNTJFTHELTHOILCNGNIOEOEUISLTHWRFWCJTHSNOEJBNPDTHMNTNTJGOEEA`

**Decision:** reject this exact 121-symbol additive-key construction. The 115 = 23×5 count and 115+6 = 121 alignment do not recover p32 plaintext under the three standard additive orientations. Do not extend this negative into arbitrary 5×23 transpositions, reshapes, rotations, or other cipher families without a new source-selected reading rule.

## Reproduction

Run from the repository root:

```sh
node sims/lp2_p32_2016_121_key_gate.cjs
```

The script asserts the 29-word / 115-rune body, the six coda values, and the 121-rune p32 receiver, then prints the three exact outputs and input hashes. It does not use language-model output or search parameters.

## Scope

This closes only the direct additive use of this length-matched candidate. It does not disprove the 2016 message's possible navigation role, the p50 map hypothesis, or a separately source-selected key/operation. It does not establish that the p28 DH values were intended to select the 2016 body as key material.
