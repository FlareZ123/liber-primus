# Signed 2013 DH example reconstructs the original LP2 lag-six affine echo

**Status, 12 November 2026:** a new, exact, historically **pre-2014** source-to-ciphertext correspondence, recognized retrospectively. The signed 2013 protocol example can supply every numerical parameter of LP2's previously documented strongest word-local affine echo. The source does **not** specify combining those numbers as a cipher. This is no recovered original plaintext, cipher, key, or destination.

**Original independent source:** the [signature-verified 26 January 2013 TCP challenge](../resources/external/2013-tcp-server-signed-source.md) demonstrates BASE29 3301 → 3QO and Diffie–Hellman modulo23 with generator5, server public8, client public19 and shared key2. The verified historical payload precedes Liber Primus. [Read-only CJS test](../sims/lp2_signed2013_dh6_lag6_bridge_sft.cjs) · [successful manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/43156485571).

## A complete numerical reconstruction

The BASE29 digits of 3QO are **[3,26,24]**, corresponding to 3301. The units digit is **24**. In the worked historical DH example:

\[
5^6\bmod23=8,\qquad 5^{15}\bmod23=19,\qquad
19^6\bmod23=8^{15}\bmod23=2.
\]

Thus the server's private exponent is **6** modulo22, the client's is **15**, and the shared key is **2**. The candidate rule formed by (i) server private exponent as rune delay, (ii) negative shared key as multiplier, (iii) BASE29 units digit as intercept, exactly yields

\[
\boxed{T(x)=24-2x\pmod{29},\qquad C_{w,j}=T(C_{w,j-6}).}
\]

This is precisely the **already independently detected** LP2 word-local lag-six operator. It is a candidate clue connection, since the signed instructions never say to build this affine map or apply it to consecutive printed words. The alternate client exponent15, the group generator5, positive coefficient2, and different BASE29 digits are all possible choices without an extra source rule.

## Original-input comparison and controls

The canonical source-preserving parser retains **2,896 complete unsolved ciphertext words and 12,956 GP29 runes**. With the signed-source triple, there are **80 exact matches in 1,290** eligible word-local lag-six positions, evenly divided **40/40** between the first and second 1,448-word halves. Contrasting other physically printed DH values as lags, under the same negative coefficient and intercept, gives:

| Source-driven test | Eligible word pairs | Matches | Uniform-reference expected |
| --- | ---: | ---: | ---: |
| lag2 (shared key), 24−2x | 7,247 | 257 | 249.90 |
| lag5 (generator), 24−2x | 2,105 | 59 | 72.59 |
| **lag6 (server exponent), 24−2x** | **1,290** | **80** | **44.48** |
| lag8 (server public), 24−2x | 388 | 11 | 13.38 |
| lag6, 24+2x (opposite sign) | 1,290 | 34 | 44.48 |

The uniform reference is only a scale comparator; the original manuscript exhibits nonuniform wordwise dependencies. The previously published [strict null calibration](lag6-conditioned-echo.md) uses exact word multisets and adjacent-repeat counts. It estimated **45.93 ± 6.53** lag-six hits under 3,000 constrained randomizations, none at or above80, with a separate full **5,684-model** affine-plus-lag scan calibrated against 1,000 null manuscripts giving a **13/1,001** add-one familywise upper tail. Those tests were developed around the original anomaly **before this 2013 source reading**, and the familywise calibration does not account for the far larger freedom of retrospectively composing historical parameters. No new significance level is asserted.

## Cross-check against another original printed structure

That same signed 2013 example yields **two independent polynomial signatures** already established in the repository:

- BASE29 3QO gives \(\;H(X)=3+26X+24X^2\;\) over GF29.
- DH shared key2, generator5 and client exponent15 yield \(\;G(X)=27+5X+15X^2\;\), reading 27 as −2 modulo29.

The original physical p39 red triad is **exactly [27,5,15]**. The original p49–51 **256-cell** table, read as one source-ordered GF29 polynomial in descending degree, is divisible by **both H and G with zero remainder**. These factor facts, including source-correction and independent checks, were already established by [the 2013/grid analysis](2013-base29-gf29-grid-factor.md). The new observation is that the **remaining worked DH exponent6** and shared key2 together with the BASE29 units digit24 also produce the strongest observed local ciphertext echo.

This creates a compact human-solve-path hypothesis linking one historically prior signed instruction set, the red inscription, the numeric table and the unusually structured ciphertext. It does not identify what the inventor actually did. Selection of signs, ordering, state role and boundaries after seeing LP2 is a serious alternative explanation.

## A concrete architectural exclusion and decision

A direct reversible additive cipher with the word-local rule \(\;C_j=P_j+f(C_{j-6})\bmod29\;\) already failed the [stronger all-29-secret-lookup positive-controlled original test](lp2-wordlag6-allsecret-lookup-heldout.md). Our inferred affine \(f(x)=24-2x\) is a strict subset; rerunning or adjusting its phase cannot rescue the direct stationary model. The source-linked 28-cycle output substitution and step clocks also failed direct original-inverse tests, as documented in [the T6 register decision](t6-source-register-gate.md).

**Next discriminating requirement:** an independently printed rule must specify whether the historical tuple marks a rare word-local null/escape, alters key consumption, or addresses original table entries. Demand a **source-fixed reversible decoder that produces native plaintext** or an independently recoverable key. The agreement of already known numbers alone is insufficient. No new ciphertext entropy/key budget or unproven plain reading is claimed.
