# Shared edited tree → provisional DH(1033) → exact 2014 OutGuess receiver

**Agent19, 27 November 2026. Classification: source-cued exploratory test with strict negative original payload result; no key, plaintext or authored instruction established.**

## The conditional sender–receiver hypothesis

The independently calibrated original p55/p32 tree and signed-2016 common edited root [selects a p32 vertical root-up track](lp2-tree-common-stock-source-reopening.md): `N → M → NG`, Gematria Primus primes **29 → 71 → 79**. p33's original printed cuneiform repeats literal primes **1033** and **3301**; 2013's authentic Cicada TCP-server manual [explicitly teaches Diffie–Hellman](../resources/external/2013-tcp-server-signed-source.md), complete with `p,g,A,B` inputs and derived secret. This offers a creator-era recognizable *candidate operator*: prime modulus `p=1033`, generator `g=29`, shares `A=71`, `B=79`. Critically, these roles are analyst choices—not explicitly assigned by LP2, its tree, or the 2013 example.

For this packet, `ord_1033(29)=1032`; `29^77 ≡ 71` and `29^269 ≡ 79` modulo1033, hence both sides compute `71^269 ≡ 79^77 ≡ **647**` (mod1033). With the other source numeral `p=3301`, 29 has order550 while 71 and79 have orders3300 and1650 respectively and are outside its generated subgroup. This is an **algebraic choice conditional on the DH model, not evidence the author intended DH on these operands**. The shared value647 is prime, but primes are abundant and this observation is not an independent key check.

Prior direct-prime key receiver: starting solved p56's literal `φ(prime)` key at zero-based prime index647, with every possible authentic plaintext-F hold, becomes impossible at original p33–39 rune72 and p55-alone rune61. The full p54–55 receiver fails by rune4. The same check at index646 fails by p33 rune73, p55 rune45, p54–55 rune27. These are the source-natural zero/one-based meanings, not a free key-origin search.

## A historically employed independent recipient

Original Cicada distributions demonstrably used **OutGuess 0.4** with authentic LP1 JPEG controls. Given a human-readable conditional secret647, two short historically plausible password strings were frozen without testing page output:

- literal decimal `647`;
- signed 2013 `BASE29` two-symbol representation **`M9`** (`22·29+9=647`).

The candidate carriers were fixed in advance to original **49.jpg (p32 tree), 50.jpg (p33 numeral neighbor), 72.jpg (p55 edited tree)**. No all-book password sweep, hash variants, padding, salts, or altered source-JPEG encodings.

**Pinned source/positive controls**: OutGuess 0.4 at commit `24810e14327c2bbeedeaadd3e24491f2a4425c02`, compiled under the CI runner; both password-specific planted 39-byte messages in original p32's JPEG recover exactly, SHA-256 `47748f9871c956c77e1382ff32c870d3dcbdf7825f560320a9abfaf9ba234843`; default-key true original LP1 scans `00.jpg`, `08.jpg` recover expected authenticated message excerpts. Thus the test can extract a real passworded payload if present.

### Original untouched output

| Password | Original source | OutGuess exit | Original decoded bytes | Content result |
| --- | --- | ---: | ---: | --- |
| `647` | 49.jpg / p32 | 136 / FPE on malformed header | 0 | No payload |
| `647` | 50.jpg / p33 | 0 | 42,195 | 7.99502 bits/byte, 38.756% printable, unrecognized |
| `647` | 72.jpg / p55 | 0 | 42,195 | 7.99576 bits/byte, 38.114% printable, unrecognized |
| `M9` | 49.jpg / p32 | 1 | 0 | No payload |
| `M9` | 50.jpg / p33 | 136 / FPE on malformed header | 0 | No payload |
| `M9` | 72.jpg / p55 | 136 / FPE on malformed header | 0 | No payload |

Both nonempty `647` output candidates start in the **identical** 32-byte stream `f85dd3a4be92a7265a1d09f3914ef2875c839059dcfdbb7eb25b63d9d0af5641`, despite distinct source scans, which is more consistent with the preexisting deterministic false-header carrier issue than separate authentic text. Source-recovered digests are p33 `3551ec7e02ef4058d7fe1522a14a72944f83ff8344fa440a372faf7f08c39f94`; p55 `90cfa45f2fdb7585020395bff6330e156e444918a863bdf9929439a24e03dc30`. No PGP, ZIP, gzip, PNG, near-ASCII or other recognizable payload. Invalid-header crashes are recorded rather than interpreted as positive extraction.

**Exact evidence:** [passing control and finite original run](https://github.com/FlareZ123/liber-primus/actions/runs/46073046791), artifact `agent19-dh647-two-password-three-original-images` ID **15234585349** (zip SHA-256 `35c53fffa6556ed7bdd19735fa18b1e9f737f723091cc0e7bb90cb0d8aa9e411`); [reproduction workflow](../.github/workflows/agent19-dh647-tree-outguess-manual.yml). Initial run `46072920151` exposed the historical OutGuess malformed-header FPE before the wrapper was corrected to record nonzero status and continue; the second run completed all six source attempts. No new producer or selected format was authenticated by this test.

## Decision

**Retire this exact conditional tree-DH password → OutGuess original-tree/numeral-source decoder.** It produces no independently identifiable original payload. Do not rescue the null by trying arbitrary decimal/hex/PGP formats, p50 keys, offsets or every other image. The geometric common edited tree is positive evidence, and source arithmetic is a possible question, but **no author-issued DH role assignment, key-transfer encoding, exact original ciphertext consumer, or plaintext has been established**. Progress would require an independent original instruction or a genuine checksum/held-original prediction tying one output to the book.
