# 2012 phone number as Python MT seed: p41 key-stream and p50 byte-stream gates

## Question

The 2012 Cicada phone number, 2143909608, is independently connected to p41 by the ten-dot ornament: eight filled and two outlined positions match the number's eight nonzero and two zero digits. The integer also fits a signed 32-bit seed domain. This motivates one bounded question: could the exact number seed the standard Python `random.Random` / MT19937 generator used either as (a) the 256-byte p50 table itself, or (b) a GP29 additive key stream for p41?

This is an exploratory receiver test, not evidence that the creator selected Python MT19937. The source does not specify that generator, extraction method, or mapping. The purpose is to test the simplest deterministic interpretation before considering more elaborate phone-derived schemes.

## p50: direct 256-byte output

Source: `resources/liber-primus/lp2-grid-256.json`, a 32×8 byte table (SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`).

With `random.Random(2143909608)`, tested the three standard byte extractions `getrandbits(8)`, `randrange(256)`, and `int(random()*256)`, against both row-major and column-major readings.

| Extraction | Generated first 8 bytes | Row-major matches | Column-major matches | Initial prefix |
|---|---|---:|---:|---:|
| `getrandbits(8)` | `48 cc 3d 1c 83 8c f5 97` | 2/256 | 0/256 | 0 bytes |
| `randrange(256)` | `91 7a 38 00 68 85 24 94` | 1/256 | 2/256 | 0 bytes |
| `int(random()*256)` | `48 3d 83 f5 00 34 83 b6` | 2/256 | 0/256 | 0 bytes |

The source prefixes are `cb e7 a7 ba 61 ed 7e b7` (row-major) and `cb 5c 79 6d 73 50 fd fe` (column-major). All six comparisons disagree at the first byte; none is a full or meaningful prefix match.

Reproducer: `sims/lp2_p50_phone_seed_python_mt_gate.py`. GitHub Actions run: [45321369964](https://github.com/FlareZ123/liber-primus/actions/runs/45321369964) (success).

## p41: F-transparent GP29 key stream

Using the same fixed seed, generated 273 GP29 offsets by three standard methods:

- `randrange(29)`
- `getrandbits(5) % 29`
- `int(random()*29)`

Tested both additive signs, with the p56 plaintext-F-transparent clock: plaintext F passes through and consumes no key value. The original p41 stream was processed with its exact three-rune prefix, 60 body words (265 runes), and five-rune suffix. Dictionary scoring used the repository's 29,060-word GP29 lexicon.

| Key extraction | Sign | Full inverse? | First dead position | Dictionary hits if full |
|---|---|---|---|---:|
| `randrange(29)` | plus | no | chunk 11 / rune 42 | — |
| `randrange(29)` | minus | no | chunk 4 / rune 17 | — |
| `getrandbits(5)%29` | plus | no | chunk 5 / rune 20 | — |
| `getrandbits(5)%29` | minus | no | chunk 3 / rune 13 | — |
| `int(random()*29)` | plus | yes | — | 3/60 |
| `int(random()*29)` | minus | no | chunk 45 / rune 195 | — |

The one complete path is not plaintext: it yields only 3 of 60 dictionary words and IoC 0.0345831, consistent with noise rather than English. All six planted controls, using the same seed, extraction method, sign, page geometry, and F-bypass rule, recover 60/60 dictionary words with exact forward replay. Thus the negative result is not caused by a broken inverse or scoring pipeline.

Reproducer: `sims/lp2_p41_phone_seed_python_mt_gate.py`. GitHub Actions run: [45321701815](https://github.com/FlareZ123/liber-primus/actions/runs/45321701815) (success).

## Assessment

The exact 2012 phone number is **not** the direct Python-MT byte stream of p50 under the three tested extraction methods and either natural table orientation. It also does **not** produce a native p41 plaintext as a Python-MT-derived GP29 additive stream under either sign and the p56 F-transparent rule.

This closes two narrow, reproducible interpretations of the phone-number clue. It does not exclude every PRNG, seed encoding, or use of the phone number. However, no further generator, skip-count, or byte/rune extraction sweep is justified without a first-party instruction selecting it. The earlier direct digit-offset family on p41 is independently excluded in `im-results/lp2-p41-phone-digitpattern-ftransparent-anchor-gate.md`; this report extends that boundary to a fixed Python-MT seed.

## Research consequence

Keep the p41 phone/dot relation as a possible selector or checksum, not an established key-generation mechanism. The p50 table remains an unresolved artifact, but the phone number should not be carried forward as its direct Python-MT seed. A future phone-derived hypothesis needs an independently motivated operation or key selector, not another unconstrained transform.
