# p55 2012 phone-phrase running-key gate

**Status: bounded negative; no unknown plaintext recovered.**

## Question and source-constrained candidate

The 2012 book-code walkthrough output recorded in Agent35's source note is:

> CALL US AT US TELE PHONE NUMBER TWO ONE FOUR THREE NINE OH NINE SIX OH EIGHT

It contains 17 words and 76 characters including 16 spaces. GP29 contracts the TH in THREE to one rune, leaving 59 letter-runes; retaining the 16 spaces as tokens gives a 75-token candidate stream.

Canonical p55 has 76 runes. Its first rune is the NG carry from p54; removing that carry leaves a 75-rune p55 body. This is an exact length match, not evidence that the phrase is plaintext or an intended key.

The 2013 source note describes the GP29-to-prime mapping and BASE29/prime-echo conventions. It supplies a historically plausible value representation, but does not say that the 2012 phrase is a p55 key or how spaces should be encoded.

## Frozen test

The test keeps p55 body order and aligns the 75 candidate tokens at offset zero. It tests:

- GP29-index key, with spaces represented as F/index 0.
- 2013 Gematria prime values reduced modulo 29, with spaces represented either as F's prime value or numeric zero.
- Both additive directions: plaintext = ciphertext minus key, and plaintext = ciphertext plus key.
- Byte-XOR using GP29 indices and raw Gematria prime values for the cipher and key.

No key offset, permutation, transposition, fitted alphabet shift, or dictionary-selected spacing is introduced. The code also checks that each additive representation exactly reverses a planted 75-rune GP29 control.

## Results

| Key representation | Space value | Direction | IoC | Mean quadgram score |
|---|---:|---|---:|---:|
| GP29 index | F / 0 | subtract | 0.034234 | -7.457816 |
| GP29 index | F / 0 | add | 0.032072 | -7.405517 |
| prime mod 29 | prime(F) = 2 | subtract | 0.027387 | -7.278194 |
| prime mod 29 | prime(F) = 2 | add | 0.027387 | -7.858919 |
| prime mod 29 | numeric 0 | subtract | 0.031712 | -7.313106 |
| prime mod 29 | numeric 0 | add | 0.028468 | -7.842922 |

The best additive output is still non-linguistic:

EONANGPXMBCJRLWDEAENHOTPYBMIAXWGIAAETHGLUCBHDEJIAICUOWWMNHGEOGGTHEFTHTSOELIYNGBIALNGTHEAFAN

The same quadgram model scores the clear p57 control at approximately -4.42; the candidate outputs are materially worse. These short-text scores are ranking evidence, not a calibrated p-value.

The four byte-XOR variants yield respectively 0/75, 26/75, 45/75 and 54/75 printable ASCII bytes. None produces coherent text. The strongest printable ratio is not itself evidence of plaintext.

All planted additive round-trip controls pass.

## Decision and scope

The exact fixed-alignment 2012 phone phrase is **not** a direct additive/running key for the p55 body under GP29 indices or the source-derived prime-mod-29 representation. The tested byte-XOR representations also fail.

This does not reject a source-selected space-changing reader, a transposition with an independently specified key, or another transformation that uses the phrase in a different role. In particular, it does not close Agent6's broader #2278 investigation. It only removes the simplest length-matched running-key interpretation; do not rescue it with arbitrary offsets or fitted permutations.

## Reproduction

Run:

- sims/lp2_p55_2012_phone_phrase_running_key_sft.cjs

Inputs:

- resources/liber-primus/lp2-corpus.json
- resources/control/dukotah_english_quadgrams.txt
- resources/external/2013-twitter-stage-gematria-source.md
- workplace/2014-html-133-331-arithmetic-page-selector.md
- agents/agent35/memory.md (the historical 2012 phrase and its qualifications)

This is an intermediate negative, not an established result; results/README.md is unchanged.
