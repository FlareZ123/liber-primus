# Source-derived PRNG seed candidate: 2013 prime-clause product

**Status:** completed negative for the exact CPython 2.7 MT19937 `random29` / keyskip1 construction. The prime-clause product remains an authenticated source signature, not a recovered key.

## Source observation

The 2013 Cicada audio's ID3 TXXX field contains `Parable 1595277641`. The number is exactly:

`1259 × 1031 × 1229 = 1,595,277,641`

Those three factors are prime clause sums from the Parable text. The source supports the number as an intentional prime-clause checksum/signature. It does **not** explicitly call it a PRNG seed.

## Solve-path hypothesis

A human solver who notices that the TXXX number is the product of prime clause sums might try it as a 32-bit seed for a deterministic key generator. The most economical first test is CPython 2.7 MT19937 with `random29` (equivalent to `randrange/randint/choice` in that runtime), using the exact keyskip1 additive relation already implemented in the repository.

The full 32-bit MT seed-domain search covered this integer under a mixed historical 9/12-register screening panel, but this specific seed has not been re-adjudicated under the current 12-register R36 panel. The direct Stage-B test below closes that narrow gap; it does not reopen the completed seed domain.

## Executed test and result

- Seed: `1595277641`
- Generator: CPython 2.7 MT19937, `init_by_array([seed])`, reducer `random29`
- Cipher model: additive mod 29, sign -1, offset 0, exact keyskip1
- Input: first 240 unsolved runes
- Decoder: pinned `Dukotah/cicada3301@f63501d8f2d835b80c30230eb89a1110fb9197d2`
- Scorer: 12-register panel R36; report full plaintext path, pmax, best register, English score, and 60/180 held-out path agreement

### Result

The pinned Stage-B workflow completed successfully: [GitHub Actions run 43452779173](https://github.com/FlareZ123/liber-primus/actions/runs/43452779173).

| Measurement | Result |
|---|---:|
| Seed | 1,595,277,641 |
| Cipher length | 240 runes |
| Panel | 12-register R36 |
| pmax | 3.706964631 |
| Best register | EN_HALFVOWEL |
| English score | −7.199652019 |
| Held-out agreement | 1.000 |
| Key skips | 5 |

The output transliteration begins `BNGOOEIABNGUXTHLMOUIYWTHNSTWAESCWONGTBUNSBEGOOEH...` and remains unreadable throughout. The high held-out agreement measures agreement between two decodes under the same key and model; it is not independent evidence of plaintext. The pmax is below the project's 5.0 candidate-screen threshold.

**Decision:** reject this exact source-derived seed / Python 2.7 MT `random29` / sign−1 / offset-0 / keyskip1 construction. Do not extend it to the full book or try additional reducers/generators from this number without a separate source clue. The broader historical PHP MT 32-bit English opening-crib search also found zero two-word matches under its declared natural reductions ([report](php-legacy-mt-opening-crib.md)); that is a separate bounded negative, not a general PHP exclusion.

## Weakest assumption

The prime-clause product may be a checksum/authentication field rather than a key seed. No Cicada source explicitly says “seed,” and the source-derived number does not itself select MT19937 or keyskip1. This test is therefore a cheap, falsifiable exploratory probe, not a high-confidence intended mechanism.

