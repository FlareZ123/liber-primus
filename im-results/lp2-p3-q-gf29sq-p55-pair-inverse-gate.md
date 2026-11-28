# P55 original 38-pair Q-field inverse does not recover native GP plaintext

**Agent15 · 28 November 2026 · source-constrained, prospectively frozen original-cipher negative. No unknown Liber Primus plaintext, cipher key or continuation recovered.**

## Why this is a particularly natural new cipher consumer

An original visually marked p3 red triad defines the nontrivial field `GF(29²)=GF29[u]/(u²−3u−8)`. Independently the exact p15-second-red11 minus solved-p57-red7 polynomial quotient gives `Q=[5,5,14,9,10,4,27,17,25]`, `E(Q)=[17,24]` and a field multiplication matrix

```text
M_Q = [[17,18],
       [24, 2]] (mod29).
```

Those entries read authenticated 2016 words **THE MAP AND PATH** under the previously fixed zero-based numbering. The row-major word reading was discovered after Q, but the matrix itself is fully determined by the first-party red algebra. It is an unusually **literal executable cipher operation** compared with treating isolated modular identities as keys.

Physical p55, a short terminal 76-rune unknown page, has exactly 38 consecutive GP29 rune pairs. The original p54 red-nine heading is independently a held-out Q-field receiver `[0,20]`, so p55 is a plausible (not authenticated) attached body. Before running this inverse, the [pretarget lock](../workplace/lp2-p3-q-gf29sq-original-p55-pair-inverse-pretarget.md) fixed pair origin at p55 offset0, all38 original pairs, both opposite fixed field directions, native-GP readable-prose criterion and no phase or extra key. [Lock commit `0632630`](https://github.com/FlareZ123/liber-primus/commit/0632630399fcbeee252d79f873447e95ed1c36e3).

## Two exact whole-original inversions

The determinant of `M_Q` is8, so its field inverse is uniquely

```text
M_Q^-1 = [[22, 5],
          [26,13]] (mod29)
```

These are two fully reversible, fixed, 76-symbol pair substitutions. No secret Q exponent, reset or additional cipher is necessary. With source `C=(C_0,...,C_75)`, decode either `P_{2i..2i+1}=M_Q(C_{2i},C_{2i+1})` or `M_Q^-1` on each of38 pairs.

| Complete original physical p55 (76 GP29 runes) | IoC pair numerator `Σn(n−1)` | IoC |
| --- | ---: | ---: |
| Original ciphertext | **216** | **0.037894736842** |
| Applying M_Q to each pair | **198** | **0.034736842105** |
| Applying M_Q^-1 to each pair | **196** | **0.034385964912** |
| Minimum across all **2,304** contiguous 76-rune authentic solved native-GP controls | **260** | **0.045614035088** |

All IoCs have denominator `76×75=5,700`. Every native-GP76 window has more ordinary language collision concentration than either candidate output. The complete source-order transliterations are also nonlinguistic:

```text
M_Q:
AOIEOEOAMUPOEOEINGCMLNGFTHEOIANYXEOCEOHOEDFUNGTHCJPOEWYEOEIAERHGCBEOBLIAFEAMWWEODAEIAACNTHMBEONDRFOEB

M_Q^-1:
WURSYFNSFOERPDSEAEOEEAOEXEAUEAGWOIUBXUNLBWNFOEONGAEMHAEAFGAICEMMWXSPAAELWAENMEUAEXGOEITLSJE
```

Both candidates exactly forward-reencrypt all **76/76** original rune indices. For each branch, a different real solved-native76 GP source is encrypted under the corresponding inverse and independently recovered **76/76**. These reversibility checks are mathematical validation, not decryption evidence.

## Research decision

The only **literal** source Q multiplication or division on paired GP29 runes does **not** decrypt the original short terminal p55 page as a single-stage native-GP cipher at its natural physical origin. This narrows the potential *consumer* of the field state without falsifying the separate p3 polynomial division, Q × red9 state, signed 2016 matrix interpretation, or any unknown higher-stage cipher.

The strongest weakness of the test is that p55's very first rune continues a printed word from p54; the page-local pair origin is therefore a visible but author-unselected hypothesis. The natural next alternative would be a global unbroken book-pair register, **only if source evidence identifies its starting point and key advance**. Do not rescue this negative by tuning pair phase, arbitrary Q powers, modulo29 shifts, transposition, or other plaintext-dependent ingredients.

[Complete standalone CJS source reproducer](../sims/lp2_p3_q_gf29sq_p55_pair_inverse_sft.cjs): recomputes Q from original red spans, verifies the matrix and its inverse exactly, opens the unchanged p55 source, decodes both full source candidates, enumerates 2,304 actual solved-GP76 controls and checks true source-native positive ciphertext plants.