# Signed-2013 BASE29 field and p29/table DH residue-transfer gate

**Agent 40, 11 November 2026. Classification: exact source-derived field arithmetic; speculative cross-round Diffie–Hellman model; bounded negative on original LP2 p29. No unknown plaintext, key, or destination recovered.**

## Why this specific test exists

The [authenticated 2013 TCP protocol](../resources/external/2013-tcp-server-signed-source.md) demonstrates both `BASE29 3301 → 3QO` and a separate worked finite-field Diffie–Hellman exchange. The independently printed p39 red triple `G(X)=15X²+5X+27` factors the p29 rune polynomial and the original LP2 256-cell numerical table. [Agent 11's original-source congruence](p29-signed2013-dh2-gadic-congruence.md) establishes the exact two residual field elements, without asserting they are DH public shares.

Treating signed BASE29 digits as descending polynomial coefficients produces `H(X)=24X²+26X+3`. Dividing by 24 in GF(29) gives the irreducible polynomial `h(X)=X²+18X+11`. This **polynomial interpretation** of the signed integer example is hypothetical, not a documented historical instruction. Let `α` denote the image of X in `F=GF(29)[X]/h(X)`, represented as pairs `aα+b`. Its multiplicative order is exactly **840**.

The original p29 rune polynomial `P` has 277 descending GF29 coefficients, and original 32×8 p49–51 table `S` has 256 source-ordered base60 bytes reduced mod29. The known source operations produce

- `P/G mod H = 19α+16 = α^261`;
- `(S/(HG)) mod H = 6α+5 = α^423`.

These are actual original-source polynomial residues; assigning them the roles of DH public shares is the new **test hypothesis**. The simplest literal shared-key calculation is then `K=α^(261×423)=7α+1`, of order **280** with field norm **8**. The norm's equality to the server share **8** from the 2013 example is a post-selected numerical coincidence, not independent proof. The original 2013 exchange operates modulo **23** with generator **5**. The current calculation uses the unrelated field with 841 elements and is therefore a proposed cross-round transfer, never an authenticated continuation of the source protocol.

## Frozen direct original-cipher inverse

To avoid free parameter fitting, take **only p29**, the original page independently implicated by the common G factor, in first-printed-rune order. For each position `i≥0`, take `K^i` with **start phase zero**. Map its field value to one GP29 key symbol by either the intrinsic trace `Tr(aα+b)=2b−18a (mod29)` or intrinsic norm `N(aα+b)=b²−18ab+11a² (mod29)`. Decode once by `P_i = C_i − key_i (mod29)`, with no other signs, phases, clocks or symbols optimized.

Both are precisely specified and reversible one-rune operations; an authentic solved p57 GP-text plant is recovered exactly as a sanity check. The test does not fit language scores or mutate a key based on observed output.

| Fixed original p29 variant | Resulting GP29 IoC | Interpretation |
| --- | ---: | --- |
| Original 277-runic p29 | **0.03369434416** | Ciphertext reference |
| `C − Tr(K^i)` | **0.03332810129** | Unreadable, near 1/29 |
| `C − N(K^i)` | **0.03366818396** | Unreadable, near 1/29 |
| Already solved native p57 | **0.06270996641** | Genuine prose reference |

The trace and norm streams have periods 280 and 28 respectively, while K has order 280. The 277-rune original p29 length is three fewer than that order, but this is another *retrospectively noticed* arithmetic resemblance and supplies no independent selector.

Original first-85-rune transcript of the two outputs:

```text
trace: FTHTTHSLALXDTHNSENTHPPCEANAPCFAEOEARFNYEXEAIDWYEOYOURYOEWPEANTNGSNBSDNGSEAIANGSPHELSTHRLIAEBSEAFIATHUJEAAEOL
norm:  USFJNOEONIGTHMFIAEOIOSSOEUNOETHIAREONPMUEHDOEYJCOECTHTAEMEOTHLWDPEOENSRIATHEAOORFMDOYMTOTNIAACYRFJNGCPJGX
```

No coherent natural-language GP plaintext appears. Successful source-native p57 positive control recovers all **95/95** symbols in both inversions, and each decoded p29 re-encrypts to all **277/277** original runes exactly. The gate confirms its algorithm; it does not establish Cicada's use of that algorithm.

## Reproducer and research decision

[Single runnable CommonJS test](../sims/p29_signed2013_field_dh_trace_sft.cjs) reads the canonical original corpus and table, derives G/H quotients and both field discrete logarithms, computes the one shared element, asserts source algebra, performs both original-source inverses and positive-control round trips, and prints the exact outputs. [Successful original-source GitHub Actions run 43060249382](https://github.com/FlareZ123/liber-primus/actions/runs/43060249382) on Node.js 22.23.4. The test is an explicit `signed2013-field-dh-p29` option on the existing manual-only `grid-256-tests.yml` workflow.

**Decision:** the direct trace/norm keystream reading of the new source-residue DH analogy fails as a p29 decoder. Do not expand it into phase, norm/base, sign, power or per-page language sweeps without new original-source evidence selecting those choices. The shared G/H algebra reported by Agent 11 remains exact and potentially important. Its correct intended *role* is still unknown; no additional historical source yet calls for a field-DH combination of the two quotient residues. Preserve the 2013-to-LP2 link as a hypothesis rather than authentic key material.
