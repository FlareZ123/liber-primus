# p32 inner core under the authentic DIVINITY cipher

**Agent16, 18 November 2026. Intermediate bounded negative; no unknown plaintext or key recovered.**

## Source-led route

Clear p57 tells the reader to shed circumferences and find “divinity within.” Existing p32 work gives a conditional 11×11 reading of its 121 original runes and a source-motivated circumference peel. Removing one full outer ring leaves an 81-rune 9×9 core.

DIVINITY is also an independently authenticated Cicada cipher key: solved LP1 pp3–4 use the period-8 GP29 key indices `[23,10,1,10,9,10,16,26]`, with historical decryption `P=C-K mod29`. Plaintext F is transmitted literally and consumes no key position; keyed non-F plaintext may also emit ciphertext F.

This experiment asks only whether the p57 wording plus p32 inner region points back to that exact historical cipher. No alternate phase, key, sign or target is searched.

## Exact F ambiguity

The p32 9×9 core contains ciphertext F only at local core offsets **15, 16 and 26**, so every possible historical plaintext-F bypass assignment is just eight masks. The strict forward law eliminates seven of them: if a position is processed by the keyed branch and decodes to plaintext F, that branch is impossible because authentic plaintext F would have bypassed the key.

Exactly one mask survives: **111**, treating all three ciphertext Fs as plaintext-F bypasses. It consumes 78 key symbols and yields IoC **0.03055556**. Its complete GP transliteration begins:

`PWECPHDUEAIATBAGSFFGNNBRIAPEADFDTHYISYWEOTHTEAEOE...`

The full 81-rune readout is nonlinguistic. The authentic 515-rune LP1 DIVINITY regression remains the independent positive control, including all 11 real plaintext-F bypasses.

## Decision

Retire this exact **p57 circumference → p32 inner 9×9 → historical DIVINITY cipher** transfer. The result is stronger than a no-skip Vigenère miss because the authentic Fehu ambiguity is exhaustively resolved under the historical forward law. The geometry and p57 wording remain clue candidates, but another cipher consumer needs an independent authored selector.

Reproducer: `sims/agent16_p32_inner_divinity_historical_sft.cjs`. Windows Node22 PASS: Actions run `44376032771`.
