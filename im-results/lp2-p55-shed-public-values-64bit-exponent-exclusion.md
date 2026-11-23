# P55 original-source field: exact 64-bit private-exponent exclusion

**Agent20, 23 November 2026. Classification:** mathematically exact conditional key-family negative with original rune input and planted positive controls. No decrypted unknown LP2 text, original author-selected cipher, or recovered creator private key.

## Source-selected packet and missing selection

The solved terminal p57 parable instructs readers to "shed circumferences". Prior original-source work strips the first and last rune of each of **16 complete printed words wholly within p55**, leaving **43 interior and 32 endpoint GP29 runes**; one additional initial rune completes an 11-rune word crossing from p54. Original big-endian GP0/base29 integers satisfy:

```text
N = 510043531279477768552291351270111060625364732293226050492113768
  = 8 * P
P = 63755441409934721069036418908763882578170591536653256311514221 (206-bit prime)
E = 54546906948733185277568038540584540814742666891
  = 43 * Q
Q = 1268532719737981052966698570711268391040527137 (primitive root mod P)
```

The full-word rival parse **including the actual p54→p55 crossing word** loses these divisibilities and prime. Thus the field packet remains conditional; the original clue does not authenticate the page-local skip. See [existing original-source extraction and controls](lp2-p55-shed-circumference-prime-shell-original.md).

The authenticated historical 2013 Cicada TCP example provides a plausible Diffie–Hellman operation. Independent previous agents proposed the two *specific* candidate public equations `Q^x=8 modP` and `Q^x=E=43Q modP`; the manuscript itself does not select those DH roles or a downstream ciphertext consumer.

## Complete 64-bit private-exponent search via smooth-subgroup residues

The field group order factors exactly as `P−1=M*R` where

```text
M = 630311729907820
R = 101149063843788281988908603592862658065019147521 (157-bit prime)
```

Previously established full smooth-subgroup discrete logarithms give two *necessary* exponent congruences:

```text
Q^x=8     => x ==  97883509924151 mod M
Q^x=E     => x == 483581994079670 mod M
```

**New exact exclusion:** All nonnegative exponents `x<2^64` satisfying either congruence have form `x=x0+kM`. For each fixed x0, there are exactly **29,266 candidates**. Set `u=Q^x0 modP`, `v=Q^M modP`; test `u` against the actual original-derived target and advance `u=u*v modP`, avoiding an unbounded discrete-log search.

| Conditional public equation | All x below 2^64 | Exact hits |
| --- | ---: | ---: |
| `Q^x=8 modP` | 29,266 / 29,266 | **0** |
| `Q^x=E modP` | 29,266 / 29,266 | **0** |

This extends the earlier 32-bit lower bound for the public8 candidate and identifies a new lower bound for shellE. A planted `T=Q^(x0+12000M) modP` is recovered at exactly `x0+12000M` by the *same* search for both residue classes. For each public value the original actual equality is evaluated over the entire 64-bit range without probabilistic sampling.

The fully original-source read-only Node22 CommonJS [single-file test](../sims/lp2_p55_shed_public_values_full64_dlog_sft.cjs) regenerates P,Q from the **unchanged original 76 p55 runes**, checks shell/interior sizes and factors, executes the two complete searches, checks both planted positives, and prints PASS. It also optionally accepts three CADO virtual logs and performs complete CRT plus direct original-field exponentiation and a fixed 43-symbol GP0 readout.

## Full logarithm attempt, conditional status

Because Q is a primitive root, both private exponent logarithms exist in the full order P−1. Recovering them modulo the unsolved 157-bit R requires a nontrivial finite-field discrete logarithm. An exploratory [CADO-NFS index-calculus workflow](../.github/workflows/agent20-p55-cado-nfs-dlp.yml) uses [upstream's documented GF(p) DLP and reusable virtual-base logs](https://github.com/cado-nfs/cado-nfs/blob/master/README.dlp). Compute virtual logs of Q,43,8 moduloR with one precomputation; divide by virtual logQ in GF(R), combine with x modM using CRT and **verify `Q^x=target modP`**. These numbers are not author-selected key material without an original instruction.

First [Actions run 45122777933](https://github.com/FlareZ123/liber-primus/actions/runs/45122777933) successfully compiled the CADO binary but failed on an outdated `workdir=...` argument. It was corrected to `--workdir` and relaunched as [45124056922](https://github.com/FlareZ123/liber-primus/actions/runs/45124056922). At the time of writing a successful full log has **not** been observed. Do not confuse a computation launch with a decoded manuscript.

## Decision

Under the two stated equations, **no private exponent of at most 64 bits exists**. This is exact and independently reproducible, while the source's 16-word choice and both DH public-value assignments remain hypotheses. Even a completed number-field logarithm would be mathematical recovery of a **conditional** exponent, never by itself a Liber Primus plaintext. A genuine next solve requires a creator-selected reversible consumer on original unknown text, with independently checkable plaintext, not more unconstrained KDF/IV searches.

**Unknown LP2 plaintext recovered:** none.
