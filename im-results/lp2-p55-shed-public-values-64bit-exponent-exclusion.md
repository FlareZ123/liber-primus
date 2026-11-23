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

The fully original-source read-only Node22 CommonJS [single-file test](../sims/lp2_p55_shed_public_values_full64_dlog_sft.cjs) regenerates P,Q from the **unchanged original 76 p55 runes**, checks shell/interior sizes and factors, executes the two complete searches, checks both planted positives, and prints PASS. It also optionally accepts three CADO virtual logs and performs complete CRT plus direct original-field exponentiation and a fixed 43-symbol GP0 readout. **The exact original-input SFT passed cleanly on Windows Node22, [Actions run 45125095557](https://github.com/FlareZ123/liber-primus/actions/runs/45125095557): both 29,266-position exhaustions, both planted exponents and all original p55 input assertions succeeded.**

## Complete prime-field logarithms: original-input verified, fixed plaintext receiver fails

The official [CADO-NFS GF(p) DLP implementation](https://github.com/cado-nfs/cado-nfs/blob/master/README.dlp) performs a **single large-subgroup index-calculus precomputation** on the actual P with `ell=R`. Its separate individual descents for Q,43,8 use that same original-field database. [Actions run 45124056922](https://github.com/FlareZ123/liber-primus/actions/runs/45124056922) completed **successfully on 23 November 2026**. The first [failed run 45122777933](https://github.com/FlareZ123/liber-primus/actions/runs/45122777933) exposed only a CLI incompatibility; it compiled CADO but had supplied an obsolete workdir spelling. The successful run uses current `--workdir` syntax.

CADO reports the following **virtual logarithms**, all modulo the original 157-bit R in one arbitrary but shared generator base:

```text
R     = 101149063843788281988908603592862658065019147521
logQ  = 97177182119505488787450641888952849267188113103
log43 = 58078282667687694670884451880964459541759378088
log8  = 2238269577806535885929259066426301788624493571
```

The unknown CADO virtual base cancels when dividing by `logQ` modulo R. Use `x8_R=log8/logQ`, `xE_R=1+log43/logQ` and the *independently known* x residues moduloM. Exact CRT yields **both complete original-source conditional private exponents**:

| Source-conditional equation | Complete exponent x (base10) | x modulo R | x bit length |
| --- | --- | --- | ---: |
| `Q^x=8 modP` | `14347449201966638813083683299370469317053765371148427588804751` | `43870182398455967548054954653128522859138643088` | 204 |
| `Q^x=E modP` | `58027263295081800276048492624932826148348813312381561491440230` | `3514059847361986014044855366874037440049858274` | 206 |

**Direct original P-field modular exponentiation verifies both equalities exactly**, so this is *complete conditional finite-field logarithm recovery*, beyond the 64-bit exclusion above. No generic 2^78 brute force was needed. CADO verified its virtual-log normalization against separate base2/3 checks. Both exponents are too large to be simple 64-bit DH secrets.

### Frozen 43-rune original cipher recipient: decisive negative

**This recipient was specified and committed before the CADO full logs were inspected.** Since `0≤x<P−1<29^43`, the complete x has a unique exactly 43-digit, big-endian zero-padded GP0 representation. Under the same page-local source packet there are exactly 43 original p55 strict word-interior runes. Use the historically solved LP1 *subtraction* direction, with zero offset and unchanged word layout:

```text
GPkey[i] = base29_digit_i(x)          for i=0..42
P55innerPlain[i] = (P55innerCipher[i] - GPkey[i]) mod29
```

This is a complete, deterministic, reversible candidate operation on original unknown ciphertext. The 32 original exterior runes are not modified and the sixteen original complete-word interior slots are retained. Actual full-log readouts, with vertical bars separating the original **16 word-interior slots** (empty slots represent two-rune source words):

```text
Target8:
MA | | | MWRB | OJIEO | | MEODFWRSJWGD | RIPEA | FP | | GCSIAOE | TNGNUEA | | XYCEO | Y | OE

TargetE:
BC | | | TIAFOE | WSEAG | | AETFHAEGNGYEACAE | AAESE | CY | | TNGADL | FLNGHS | | WTFH | AE | J
```

The recovered 43-symbol core IoC values are **0.02547065** (target8) and **0.04429679** (targetE), both unlike the previously measured native-GP English control regime around0.07. The frozen readings have no sustained coherent sentence, word or creator instruction, and do not resemble valid contiguous native-GP plaintext even with the original partial-word caveat. **This exact source-derived P/Q DH-log -> GP43 additive core-inverse route fails its plaintext gate**. No retuned phase, sign, IV, ciphertext window or KDF is justified. [The reproducible original-source SFT](../sims/lp2_p55_shed_public_values_full64_dlog_sft.cjs) takes the three virtual logs, reconstructs the CRT exponents, checks `Q^x` against the *actual* source numbers, and emits both exact 16-slot ciphertext-consumer reads.

The source packet itself is not fully authenticated: including the p54→p55 crossing word erases N=8P. Thus even mathematically unique logarithms cannot establish a creator-selected key, and the 43-rune direct-read failure is conditional on this exact receiver.

## Decision

**Established mathematics under the disclosed source parse:** both full 206-bit prime-field logarithms are now recovered, exactly verified by modular exponentiation, and the earlier 64-bit private-exponent search is a strict subset of this complete recovery.

**Decipherment result:** the only pre-registered direct original 43-rune GP29 inverse fails to produce unknown manuscript plaintext under *both* complete logarithms. P/Q as a manuscript key remains unauthenticated because of the genuine p54/p55 carried-word competitor and absent explicit cipher-opcode instruction. Do not re-run arbitrary variations of this branch; require an independent first-party selector for a new ciphertext consumer. This calculation may supply test data if such an instruction is independently discovered.

**Unknown LP2 plaintext recovered:** none.
