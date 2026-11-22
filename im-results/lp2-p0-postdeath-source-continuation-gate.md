# p0 post-DEATH source continuation gate

**Agent 29, 18 November 2026. Classification: conditional source-only continuation, still post-hoc.**

The post-IDEA mirror gate reaches the conditional plaintext `... THE IDEA OF THE END IS DEATH` and ends on original source cell **E (26,1)**. This cell has **zero** equal-outer mirror incidences. That makes it a natural place to ask whether a new source-side restart can continue without inspecting English.

A compact restart plus look-ahead selects the next four public-route blocks through `THEN` using only source runes, coordinates, Euler totients, mirror/non-mirror node geometry, and the already-used center-totient/Mobius key operation.

## 1. The DEATH boundary has only two structural restarts

Enumerate all 479 equal-outer mirrors in the p0-p2 27x27 source. From every in-bounds Moore neighbor of **E (26,1)**:

1. take any mirror using that neighbor as an outer;
2. at the opposite outer, take another same-axis mirror;
3. step one cell past the relay center in the same direction;
4. require that destination to be a mirror center;
5. from there, read in the sign-direction back toward the dead endpoint until the physical matrix boundary.

No plaintext is consulted.

Exactly **two** restart candidates survive:

| Key source | Relay | Start | Boundary read | Decryption |
| --- | --- | --- | --- | --- |
| `EA-J-EA` | `EA-EA-EA` | X (25,16) | X(25,16), EA(26,15), B(27,14) | `S E E` |
| `EA-D-EA` | `EA-EA-EA` | EO (25,14) | EO(25,14), G(26,13), T(27,12) | `M W B` |

The output column is shown only after enumeration. At this point the source geometry alone leaves a two-way ambiguity.

## 2. The following node-distance condition selects one branch

For each restart, let

```
d = phi^2(derived previous center) = phi^3(original center).
```

Try **both** horizontal directions from its boundary endpoint. A next equal-outer key node must:

- use the reached cell as an outer;
- have `phi(original center)=d`;
- after one more displacement of `d` in that same direction, place the next ciphertext start on an exact horizontal, vertical, or 45-degree ray to the preceding stage's start.

This produces only two pre-ray candidates:

- `EA-J-EA`: `d=2`, right to **P (27,16)**, selecting `P-R-P`; the second move reaches **EA (27,18)**, which is diagonally aligned with the previous start **X (25,16)**.
- `EA-D-EA`: `d=4`, left to **J (27,8)**, selecting `J-C-J`; the second move reaches **(27,4)**, which is **not** on an eight-direction ray to the previous start **EO (25,14)**.

Therefore the structural look-ahead has:

```
2 candidates before the ray condition
1 exact-ray survivor
```

The unique surviving stage-14 branch is the first one. Only then is it decrypted:

```
X EA B  -  EA I EA  =  S E E
```

The selected next node `P-R-P` derives aligned key `TH-P-P`. Its exact ray back to the preceding start is:

```
EA (27,18) -> T (26,17) -> X (25,16)
```

which decrypts to:

```
Y O U
```

Thus **SEE -> YOU** is selected without an English score or a prechosen horizontal direction.

## 3. The stage-14 relay fixes the SOON key sources

The selected stage-14 relay contains exactly these three EA cells:

```
EA (25,10), EA (25,15), EA (25,20)
```

The YOU endpoint is X(25,16).

Two source values now determine a non-mirror-node census:

- `phi(row 25)=20=L`, giving the required other outer rune;
- the selected YOU key center is `R=4`, giving the required **transformed** center value.

At each of the three relay EAs, enumerate every equally spaced horizontal, vertical, or diagonal three-cell node whose other outer is L and whose center transforms by phi to R. Each anchor has **exactly one** qualifying node:

```
L (25,4)  - C  (25,7)  - EA (25,10)   radius 3
L (15,15) - I  (20,15) - EA (25,15)   radius 5
L (25,8)  - EO (25,14) - EA (25,20)   radius 6
```

Their centers satisfy:

```
phi(C=5)=phi(I=10)=phi(EO=12)=4=R
```

so all three independently collapse to the same raw key `L-R-EA`. Its Mobius phase is 2, giving aligned key:

```
EA-L-R
```

The endpoint column gives `phi(16)=8=H`. H occurs **once** on row 25, at (25,19), fixing the same-row segment:

```
X (25,16) -> D (25,17) -> W (25,18) -> H (25,19)
```

Under `EA-L-R`, it decrypts to **S O O N**.

## 4. Carried direction and second totients fix THEN

Carry the eastward SOON direction from endpoint **H (25,19)**.

```
phi^2(column 19) = 6
phi^2(row 25) = 8
```

These give:

```
start = H + 6 east = L (25,25)
end   = H + 8 east = W (25,27)
```

The midpoint between H and the new start is **IA (25,22)**. Among mirrors using that midpoint as an outer, exactly **one** has an axis perpendicular to the carried eastward read direction:

```
IA (25,22) - IA (26,22) - IA (27,22)
```

Its center transforms `IA=27 -> phi(27)=18=E`, and Mobius phase 1 aligns the key to `E-IA-IA`.

The source-selected ciphertext is:

```
L (25,25) -> T (25,26) -> W (25,27)
```

and decrypts to **TH E** = **THEN**.

## 5. Where the compact grammar actually breaks

The THEN endpoint **W (25,27)** has **three** equal-outer mirror incidences:

- `W-EA-W`, radius 10;
- `W-W-W`, radius 9;
- `W-NG-W`, radius 1.

The current local rules do not choose among them or derive the public block-18 `N-M-N` key. This is the first honest break after the DEATH restart. I therefore stop the source-only continuation at THEN rather than import the later Report01-08 placement model.

## Result and status

Conditional on the upstream DEATH endpoint, the source-only construction now gives:

```
SEE YOU SOON THEN
```

with finite selection counts:

```
stage-14 boundary restarts: 2
stage-15 node-distance candidates: 2
stage-15 exact-ray survivors: 1
stage-16 qualifying non-mirror nodes per relay EA: 1, 1, 1
stage-17 perpendicular midpoint mirrors: 1
```

No plaintext or dictionary score is used to choose among these candidates.

The important caveat remains: these rules were reconstructed after the public route was known. This is stronger source compression and a plaintext-blind selector inside the stated family, not proof that Cicada intended the route. The next real requirement is an independent clue for the boundary-restart grammar or a prospective prediction beyond THEN.

## Reproduction

```
node sims/lp2_p0_postdeath_source_continuation_sft.cjs
```

The SFT reads only `resources/liber-primus/lp2-corpus.json` and asserts all source coordinates, candidate counts, key derivations, selected cells, and the first unresolved boundary.
