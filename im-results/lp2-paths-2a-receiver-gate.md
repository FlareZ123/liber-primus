# PATHS -> 2a prospective receiver gate

**Agent38, 19 November 2026. Classification: precommitted negative on one direct continuation of the current p0 PATHS candidate. No plaintext or key recovered.**

## Question

The current local candidate chain ends at PATHS on p0 word30. Its canonical GP29 values are:

```text
PATHS = [13,24,2,15]
GP0(PATHS) = 54
```

The original p50 table has:

```text
p50[54] = 2a
base60(2a) = 156
drop-f base59(2a) = 154
```

Under the same drop-f base59 convention already used in the preceding LUCK -> PATHS navigation, 154 is exactly the start of p0 word35, offsets 154..157, length4.

Before opening those four ciphertext values, the exact receiver and finite key family were committed in `workplace/agent38-paths-2a-receiver-precommit.md` at commit `387d0206f9dedae8956a7b9214aab8874d33fadf`.

The source-visible token also admits a literal state reading: digit `2` equals reconstructed DH state `K=2`, while the character `a` names the reconstructed DH scalar `a=6`. The precommit therefore tested only eight simple four-rune key shapes built from `(K,a)`, their H images, or direct H-shell inversions, under both additive signs. The authenticated target vocabulary was frozen to the nine four-GP-rune words already used by existing source-family controls.

## Original result

After the precommit, the selected original p0 receiver was opened:

```text
p0 word35
offsets 154..157
cipher = [26,10,23,24]
transliteration = YIDA
```

With `H(x,y)=(x-y,x+y) mod29`:

```text
H(K,a) = [25,8]
H(a,K) = [4,8]
```

The eight unique precommitted numeric keys are:

```text
[ 2, 6, 2, 6]
[ 6, 2, 6, 2]
[25, 8,25, 8]
[ 4, 8, 4, 8]
[ 2,25, 8, 6]
[ 6, 4, 8, 2]
[ 4, 4, 2, 2]
[ 4, 4,27,27]
```

Testing all eight under both additive directions yields **zero** hits against:

```text
LIES THEIR MEANING ROAD SEEK WILL GOOD LUCK PATHS
```

The exact bounded family therefore fails on the prospectively selected receiver.

## Decision

Close this exact continuation:

```text
PATHS -> GP0 54 -> p50[54]=2a
      -> drop-f base59 154 -> p0 word35
      -> simple literal (K,a)/H key
```

Do not rescue it by permuting the key, adding a phase, introducing another DH scalar, or changing target vocabulary after seeing the miss.

The source-level navigation coincidence remains factual: PATHS addresses token `2a`, whose base59 value lands exactly on a four-rune p0 word start. This experiment shows that the most direct literal `(K,a)` value-changing consumer does not turn that selected receiver into another authenticated signed-message four-rune word.

This does not invalidate the upstream PATHS candidate. It narrows one prospective extension and leaves the higher-value problem unchanged: derive a source-selected state transition that predicts both the next receiver and its inverse before opening it.

## Reproduction

- Precommit: `workplace/agent38-paths-2a-receiver-precommit.md`
- SFT: `sims/lp2_paths_2a_receiver_gate_sft.cjs`
