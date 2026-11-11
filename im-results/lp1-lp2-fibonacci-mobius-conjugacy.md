# Fibonacci companion and LP1 magic-square Möbius bridge

**Classification:** an exact, previously unrecorded cross-release matrix identity, together with one source-fixed and fully reversible original-LP2 decoding test that fails native-GP plaintext. The identity supplies a possible common algebraic state space but does **not** select a historical cipher, key schedule, or decoded unknown text.

## Independent visible premises

1. The original first-release p05 *SOME WISDOM* square has corner entries `272,151;151,272`. Its rune-word cell `MOBIUS` has GP-prime sum **226**. The original p16 second magic square has corners `434,966;966,434` and magic constant **3301**. Earlier repository work already established their **sixth-power** projective relation and the p05 28-cycle; see [the paired-square study](magic-square-5x5-direct-pad.md) and [its reproducer](../sims/lp1_mobius_corner_power6.cjs).
2. Original LP2 p15 is a 4×4 prime-distance array derived from the consecutive distinct Fibonacci values, with a red **3299** next to **3298** and a central spiral. The index Fibonacci recursion selects the conventional companion matrix `Q=[[1,1],[1,0]]`; see [source proof](../results/lp2-p15-fibonacci-prime-spiral.md).
3. The GP alphabet supplies the natural field `F_29`. None of the matrix identifications below requires fitting unsolved ciphertext.

## New exact algebra

Reduce the original square corners modulo 29:

```text
M05 = [[11,6],[6,11]]
M16 = [[28,9],[9,28]]
Q   = [[ 1,1],[1, 0]]
S   = [[ 0,1],[16,21]]     det(S) = 13 mod29
```

All of these are invertible except the interpretation of Q as a *cipher* is still hypothetical. Direct multiplication over `F_29` gives

```text
M05^2 = [[12,16],[16,12]] = 24 * S Q S^-1
M16   = [[28, 9],[ 9,28]] = 14 * S Q^3 S^-1
M16   = 21 * M05^6
```

The scalar **24** equals `3301 mod29` and `trace(M05²)`. The Fibonacci Q eigenvalues in `F_29` are **6,24**, so their ratio is **22**. The p05 Möbius eigenvalue ratio is **15**, with `15²=22 mod29`. LP2 p15's red **3299 mod29 = 22**, directly forced by the printed 3301−2 construction.

The same `S` simultaneously transports `Q` and `Q³` into the independently printed p05/p16 corner matrices; no choice of two unrelated basis changes is needed. But `S` was algebraically selected after observing the source matrices: the two-dimensional intertwiner space does not uniquely determine this normalized representation. The match to red 3299 is **not** an independent second coincidence, since 3299=3301−2. More broadly, several power relations occur among order-28 projective matrices. This is a structural correspondence rather than demonstrated author intent.

## One direct source-frozen original inverse

A player reading `MOBIUS`, its prime sum 226, and the alphabet's 29-value field could hypothesize encoding plaintext as an advance on the p05 28-cycle. The p05 map `x ↦ (11x+6)/(6x+11)` with source seed `226 mod29=23` produces the exact 28-symbol cycle

```text
[23,14,20,17,13,2,5,22,21,3,1,26,8,7,24,27,
 16,12,9,15,6,4,18,10,0,19,11,25]
```

In the source-locked proposed decoder, each page starts in cycle state zero. For a ciphertext symbol in this cycle, subtract the previous cycle index modulo 28, then subtract one to obtain the plaintext's cycle index. This is a nonzero-step **projective Möbius rotor**; the off-cycle `EA` (GP index28) passes as a literal escape and resets the source seed. These conventions are stated before scoring original text; the zero-step restriction was motivated by the striking scarcity of original doublets. This distinct original-cipher model is fully reversible for **every** GP29 string, unlike the earlier additive GP29 `cᵢ−cᵢ₋₁` differential test. The singular EA escape/reset is a hypothesized design convention, not an authenticated instruction.

The exact CJS SFT tests all **12,956** original unknown runes on 55 rune-bearing pages, preserves 86 source doublets, confirms every rune by inverse reencryption, and builds a planted English control of identical page lengths. A Gibran-trained GP29 trigram model scores these without tuning against ciphertext. An independently held-out Shakespeare control of equal length is included.

| Source / registered test | GP index of coincidence | GP trigram nats/rune | EA symbols |
| --- | ---: | ---: | ---: |
| Original unsolved ciphertext | 0.03447840 | −14.327697 | 460 |
| Direct Möbius rotor decoding | **0.03518721** | **−14.252015** | 460 |
| Held-out Shakespeare GP control | 0.06098953 | −8.316942 | 90 |

The decoder additionally yields **100 AE** plaintext indices, while the held-out native window contains zero. Its beginning is `NGOAUPEONGESUWMJGRCFXNGXNGAHBNEOUPIAOTHH...`, without coherent words. The planted 12,956-symbol English message round-trips exactly. These measurements **reject the explicit source-frozen rotor as a direct native-GP English decoder**; an arbitrary extra layer would be unmotivated by this test.

**Executable source and passed run:** [`sims/lp1_lp2_fibonacci_mobius_bridge_sft.cjs`](../sims/lp1_lp2_fibonacci_mobius_bridge_sft.cjs) and [manual GitHub Actions run 42997114545](https://github.com/FlareZ123/liber-primus/actions/runs/42997114545), Node.js 22. The existing [manual LP1-P40 workflow](../.github/workflows/lp1-p40-cayley-source.yml) now also invokes this SFT. The project's no-per-commit-workflow restriction is preserved.

## Causal next decision

An authentic continuation must add **an independently source-selected input/output representation or state/key operation** that makes the Fibonacci/Möbius conjugacy predict unknown LP2 plaintext. A proposal should identify the original artifact that chooses `S`, the PGL2 points, page reset, and direction before testing ciphertext. Do not escalate into an unrestricted matrix basis/phase search: the source mathematics alone admits infinitely many natural-looking but equally reversible encoders. The exact identity can be reused as a cheap gate if such a selector appears; meanwhile this direct rotor branch is closed.

**Outcome:** exact new source relation and a decisive negative original-input test; zero unknown plaintext, historic key or solved destination.
