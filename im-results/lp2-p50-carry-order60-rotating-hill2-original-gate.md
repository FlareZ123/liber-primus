# The source-carry Hill2 matrix has order60, but its frozen full-book rotating inverse fails

**Agent27, 22 November 2026. Classification: exact source-associated algebra and complete original-input negative for one reversible native-GP cipher. No new plaintext, authentic key schedule or destination.**

## Source operand and new exact clock identity

Existing physical p50 integer-modulo841 carries, extracted from the independently sourced signed-2013 H quadratic and red p39 G quadratic, give **[8,5]** and **[15,2]**. Interpreting these complete ordered pairs as rows of the most economical GP29 Hill2 matrix yields:

```
M = [ 8  5 ]       M^-1 = [27  5]
    [15  2 ]              [15 21]
det M = −1 mod29
tr M = 10 mod29
χM(X) = X²−10X−1 mod29, discriminant=17 (nonsquare)
```

A new exact computation shows:

```
M^15 = 12 I
M^30 = −I
M^60 = I
M^12, M^20, M^30 ≠ I
therefore ord(M)=60
```

The p50 printed byte codec is base60, and the toy DH packet's `b=15, a=6, K=2` gives **`M^b=(K·a) I=12 I`**, with `12²=−1 mod29`. All identities hold over the literal source-linked M, without fitted ciphertext or language models.

**Independent broad family caution:** Of the 484 exact toy DH variants `(a,b)∈[1,22]^2` with `p=23,g=5,A=5^a mod23,K=A^b mod23`, just **5** of the matrices `[[A,g],[b,K]]` have order60 and **3** satisfy `M^b=(K·a)I`, including the signed original. These are descriptive families devised after observing this exact M, not prospective p-values. The source does **not** command turning the two H/G carry vectors into a matrix, and the period60 equality may be a coincidental consequence of postselected field arithmetic.

## One original full-register inverse fixed before opening its output

The [immutable prospective specification](../workplace/agent27-p50-carry-order60-rotating-hill2-original-precommit.md) selected the complete **12,956 unmodified original LP2 pp0–55 GP29 ciphertext symbols** (55 rune-bearing pages; p50 contains none). Pair into **6,478 consecutive two-rune columns** across page boundaries, start at `i=0`, and use the exact time-varying matrix

`P_i=M^(−i) C_i mod29`.

The forward cipher is `C_i=M^i P_i`, with the matrix clock incrementing once per *pair*, no inserted/rerun symbols, no sign, shift, alternate seed, phase, word reset or page reset. Its period is60 pairs =120 printed runes. This tests a **moving matrix cipher**, distinct from the previously rejected stationary Hill2 family.

| Original corpus / inverse | Native GP trigram mean nats/rune | GP IoC |
| --- | ---: | ---: |
| Original 12,956 GP ciphertext runes | −3.4174416532 | 0.0344783979 |
| **Entire source-carry M^(−i) decoder** | **−3.4164449598** | **0.0344646471** |
| Independently solved LP2 p57 GP runes | −2.4681447142 | 0.0627099664 |

The decoded first 160 original GP symbols spell, without invented spaces:

`SHHXBUESFECXUCNCIOYCFXEAGTTDMHALUAENEAULLPYNAEHABNUJEAOEGINGBHINGAEEOCIBUDFDAEOOEETHUYAEOOECOUIOXWIOYIORJDGEIPMOEFEADGHEAITHYAHNBIEAWTEEORWEAEAUGAWPDITHOPECTHJIOWTMNGJMGHINGFRIJTHHBOUJYEAGAJEAEXEASM`.

All **12,956/12,956** original cipher indices regenerate exactly under the single forward rule. Source-native solved-LP1 GP symbols planted under the same full-length M^i stream recover exactly 12,956/12,956. No page or contiguous 150-rune passage resembles native-GP English, and the entire decoded IoC remains essentially uniform. The full-register language test therefore **rejects this exact rotating-Hill2 plaintext explanation**.

This does not reject a different source-selected clock function on M, an alternate non-native plaintext register, or a missing creator-defined key derivation. Do not invent an additive seed, phase, transposition or new row order to force a readable output from this completed test.

## Reproduction and decision

[Read-only Node22/CommonJS SFT](../sims/lp2_p50_carry_order60_rotating_hill2_wholebook_sft.cjs) checks M order60 and exact inverse; reopens only the canonical original corpus and solved LP1 source; regenerates 12,956 ciphertext runes and recovers a full source-native encrypted positive. Original calculations were also performed independently in the connected repository analytical runtime. No CI pass is claimed.

**Decision:** preserve the concise order60 source/radix identity as a potential clock hint, but **retire** the exact whole-book zero-phase rotating Hill2 candidate. An actual LP2 cipher decoder remains absent.
