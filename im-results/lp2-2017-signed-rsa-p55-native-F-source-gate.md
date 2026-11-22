# 2017 authenticated RSA/SHA512 signature as a direct native-F GP29 key for p55

**Decision, 18 November 2026, Agent44.** The actual original Cicada-signed 2017 warning contains a 543-byte OpenPGP signature packet with a 512-byte RSA signature MPI. Its plain RSA signature bytes provide a reproducible, independent historical operand for one deliberately limited LP2 key test. **No unknown ciphertext plaintext, usable key, new cipher mechanism or hidden destination was recovered.**

## Original source and human route

The preserved first-party warning is `resources/historical/cicada2017-yEiTHhvF.asc`. It admonishes solvers to verify signatures, and the original statement has a contextual Fibonacci/2017 link to physical p55 already analyzed in `im-results/signed2016-fibonacci-page-route.md`. A 2017 reader could extract an RSA signature from an authenticated PGP message; doing so is historically executable.

**Critical missing selector:** The first-party warning asks players to *verify* the signature. It does not instruct using its RSA signature MPI as a keystream, reading page55, starting from byte zero, or converting signature bytes to GP29. Those are investigator hypotheses. This source does not date to the original 2014 LP2 delivery and cannot retroactively authenticate an intended original solve path.

## Exact finite experiment

Parse the sole original old-format OpenPGP signature packet, assert a v4 RSA/SHA512 signature and its 512-byte MPI, then read those RSA bytes in signature-packet order. Use the untouched 76 GP29 ciphertext indices of physical LP2 p55. Two direct serializations are fixed in advance:

1. Each unsigned signature byte reduced modulo29, giving 512 GP29 symbols.
2. Each unsigned signature byte written as a high and low base29 digit `(floor(byte/29), byte%29)`, giving 1024 GP29 symbols.

For either stream, start at its first symbol, consume one per encrypted ciphertext rune, and apply both `C=P+K (mod29)` and `C=P−K (mod29)`. The historically authenticated solved-LP1/p56 rule **plaintext F (index0) is literal and consumes no key** is enforced exactly. The printed p55 ciphertext contains precisely three F runes at original page-local offsets **15,25,41**; therefore every one of their eight possible literal/nonliteral F-bypass masks is enumerated. If a putatively encrypted ciphertext rune would decrypt to plaintext F, that branch is illegal. Every surviving 76-rune candidate must reproduce the *whole original ciphertext byte-for-byte* on reencryption.

| Original signature GP29 serialization | Additive encryption sign | Legal complete p55 bypass masks | Highest whole-page GP29 IoC |
| --- | ---: | ---: | ---: |
| byte mod29 | + | 0 | none |
| byte mod29 | − | 2 | 0.037192982 |
| byte as two base29 digits | + | 2 | 0.034385965 |
| byte as two base29 digits | − | 7 | 0.040701754 |

The original p55 IoC is **0.037894737**; the independently clear p57 page has IoC **0.062709966**. No survivor yields coherent native-GP English or a documented source-selected key. These low IoCs are descriptive, not a strict universal impossibility theorem about unknown languages or secondary transformation layers.

## Genuine native positive, exact test and limits

For each of the four fixed serializations/signs, the test encrypts **the unchanged first 76 solved-p57 runes** with the same signature pad and the authentic literal-F bypass. The decoder recovers that 76-rune known text exactly, with original F positions preserved and all key clocks consistent. Every original surviving branch exactly reencrypts its whole 76-rune source. Results are from [Windows Node22 PASS run 44262995716](https://github.com/FlareZ123/liber-primus/actions/runs/44262995716) using the single independent [source SFT](../sims/lp2_2017_rsa_mpi_p55_ftransparent_sft.cjs) and [bounded manual workflow](../.github/workflows/agent44-2017-rsa-mpi-p55-manual.yml).

**Fork:** Retire **only** these two literal RSA-MPI-to-GP29 serializations, both arithmetic signs, and all authentic F-bypass masks at zero key phase on p55. The signature should remain treated as an authentication envelope. Further source-to-key research needs a new printed operation selecting any transform of the signature or genuine unknown plaintext from an original precursor artifact. Do not fit arbitrary signature offsets, key generators or secret hash derivations after seeing these negative outputs.
