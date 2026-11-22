# F59 modular-power candidate for the p56 prime-2 start: source-gated audit

## Decision

**Bounded retirement for Director Issue #151.** The equality `24^23 ≡ 2 (mod 59)` is exact, but the original sources do not select the full tuple `(p=59, g=24, x=23)` or the operation that maps its output to the p56 prime-totient start. Preserve it as an exact, selector-underdetermined explanation of a known p56 value; do not promote it to an LP2-wide architecture or test it on unknown pages.

## Reconstructing the candidate

The proposed chain combines:

1. p57's red `PARABLE` title has GP-prime sum **449**.
2. A later-preserved first-onion `NUMBER` transcript reverses decimal digits, producing **944**; factorization gives `944 = 16 × 59`.
3. The p15 image has a **16-cell** ring/circumference, used to select the 16 factor and leave **59** as modulus.
4. The contemporaneous 2013 BASE29 example maps decimal **3301** to `3QO`, whose digits are **3, 26, 24**; the proposal selects the final digit **24** as the modular base.
5. The p3 red-triad root is `z = 23 − 2u`, supplying **23** as exponent and **2** as result.
6. The arithmetic is exact: `pow(24,23,59) = 2`, matching the independently established p56 prime-totient inverse's start prime.

The arithmetic is reproducible. The source-selection chain is not.

## Source boundary: what the 2013 witness actually documents

The contemporary 2013 Twisted mailing-list witness documents a participant-built `BASE29`, `DH`, and `NEXT` service. It provides a BASE29 example `3301 → 3QO` and a worked DH exchange. It does **not** include the first-onion `NUMBER` command or its decimal-digit reversal/factor grammar. The latter is preserved only in a later retrospective transcript/reconstruction, not in the contemporaneous 2013 witness. See [the consolidated BASE29/DH source report](2013-base29-gf29-grid-factor.md), especially its command-provenance correction.

The worked 2013 DH exchange is:

- modulus `p=23`, generator `g=5`;
- server exponent 6 gives public value `5^6 mod23 = 8`;
- client exponent 15 gives public value `5^15 mod23 = 19`;
- shared secret is `19^6 mod23 = 8^15 mod23 = 2`.

This is a real two-party DH example, and its shared secret is indeed 2. It does **not** document `p=59,g=24,x=23`. The candidate equation `24^23 mod59` is a single modular power, not a DH exchange: it has no second private exponent, public-share exchange, or independently computed shared secret. The 2013 example may make modular exponentiation familiar to a human solver, but it does not select the F59 tuple.

The existing p3/p39 analysis does identify a separate correspondence between red-triad values and the 2013 worked DH parameters: p3 supplies 23/2 and p39's `15(X−24)^2` factor supplies 5/15 (with 24 linked to the BASE29 example). This is worth preserving as a distinct historical hypothesis. It still does not state that the example's shared secret should initialize the p56 prime-totient schedule, and it must not be conflated with the F59 construction.

## Source-fixed controls

Only the alternatives naturally supplied by the cited sources were checked:

| Source-fixed alternative | Calculation | Result |
|---|---:|---:|
| Proposed final BASE29 digit 24, p3 root coefficient 23, modulus 59 | `24^23 mod59` | **2** |
| p3 conjugate root coefficient 17 | `24^17 mod59` | 55 |
| Other BASE29 digit 3 | `3^23 mod59` | 45 |
| Other BASE29 digit 26 | `26^23 mod59` | 41 |
| Other factor 16 used as modulus | `24^23 mod16` | 0 |
| p15 ring count 16 used as exponent | `24^16 mod59` | 49 |

The documented DH control gives `5^6 mod23=8`, `5^15 mod23=19`, and shared secret `19^6=8^15=2`. It independently reproduces 2, but only in the documented `p=23,g=5` exchange. No source says to transplant that value into the p56 totient key.

These controls are not a broad search and do not establish uniqueness. They show that the proposed F59 equality depends on the particular choices made after the target value 2 is already known.

## Exact missing instruction

To establish the F59 chain as intended, a primary source would need to select all of the following: the `NUMBER` reversal of 449; the factor-16/59 choice; 59 as modulus; the final BASE29 digit 24 as base; the p3 root coefficient 23 as exponent; modular exponentiation as the operation; and the output 2 as the starting prime for the p56 totient cipher. No such instruction appears in the contemporaneous BASE29/DH/NEXT witness. The later `NUMBER` transcript does not authenticate this chain.

The p56 inverse remains a valid known-plaintext result, but this F59 relation has no independent unknown-page prediction and supplies no new plaintext. The exact 2013 DH test-vector match to 2 should be retained as a separate candidate bridge, not silently merged with the F59 equation.

## Reproduction

Python standard-library calculations:

```python
pow(24, 23, 59)  # 2
pow(24, 17, 59)  # 55: p3 conjugate-root coefficient
pow(3, 23, 59)   # 45: other BASE29 digit
pow(26, 23, 59)  # 41: other BASE29 digit
pow(24, 23, 16)  # 0: other factor as modulus
pow(24, 16, 59)  # 49: ring count as exponent
pow(5, 6, 23)    # 8: documented DH server public value
pow(5, 15, 23)   # 19: documented DH client public value
pow(19, 6, 23)   # 2: documented DH shared secret
pow(8, 15, 23)   # 2: same shared secret
```

Relevant pinned material:

- p56 inverse: `im-results/prime-totient-unknown-index-literalF-recovery.md`.
- p15 ring: `results/lp2-p15-fibonacci-prime-spiral.md`.
- p57 title sum and Parable: `im-results/audio-761-pad-scan.md` and `im-results/onion7-magic-center-source-prime-gate.md`.
- 2013 BASE29/DH/NEXT witness and p3/p39 field work: `im-results/2013-base29-gf29-grid-factor.md`.
- Upstream candidate: `communications/agent7/20261111T080517Z_agent44_f59-dh-key2-chain.md`.

No new cipher search or unknown-page run was justified after the source gate failed.
