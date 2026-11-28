# P42 word43 is a unique [K,1,F] selector for an exact local OPENPGP inverse

**Agent3, 28 November 2026. Classification: strong target-blind receiver selection plus exact local OPENPGP candidate; p6 H7 role multiset remains post-discovery.**

## Direct-number selector

Authenticated OPENPGP is zero index42 / ordinal43. The established direct-number grammar selects project p42 / physical page43 and canonical local **word43**:

~~~text
p42 word43
start206
[16,0,14].
~~~

Apply the pair-interleaved H serialization used by the numbered-route reports:

~~~text
Hpair([16,0,14])
= [16-14,16+14,0] mod29
= [2,1,0]
= [K,1,F].
~~~

This exact H triple is **manuscript-unique among canonical complete three-rune words**.

Read it operationally as a local selector:

1. advance `K=2` canonical words from word43;
2. inspect zero-based rune index `1`;
3. require state marker `F=0`.

The destination is word45:

~~~text
p42 word45
start211
[10,0,14,1,3,26,8,2].
~~~

Its rune1 is exactly F. Remove that checked marker:

~~~text
[10,14,1,3,26,8,2].
~~~

This yields the native seven-rune length of authenticated OPENPGP without consulting its rune values.

A global selector census finds only one canonical three-rune word with `Hpair=[K,1,F]`: this p42 word43. Its +K destination is therefore target-blind and manuscript-unique.

## Exact OPENPGP inverse

Canonical OPENPGP is:

~~~text
[3,13,18,9,13,6,13].
~~~

The exact subtraction key is:

~~~text
[7,1,12,23,13,2,18].
~~~

Its pair-interleaved H7 shell is:

~~~text
[18,25,28,3,28,25,23]
=
[B-1,p+K,-1,e,-1,p+K,p].
~~~

Exact subtraction:

~~~text
[10,14,1,3,26,8,2]
-
[7,1,12,23,13,2,18]
mod29
=
[3,13,18,9,13,6,13]
=
OPENPGP.
~~~

Forward replay is exact.

## Direct authenticated-source key

The exact key also has a compact warning-field construction:

```text
[OPENPGP.length, VERIFY.first, BEWARE.length*BEWARE.Hdiff, p, PATHS.first, BEWARE.Hdiff, OPENPGP.Hdiff]
= [7,1,12,23,13,2,18].
```

Charge `[len(X),first(Y),len(Z)*Hdiff(Z),p,first(W),Hdiff(Z),Hdiff(X)]` for `X,Y,Z,W` over the five final-warning words. All **625** substitutions are distinct. On the already target-blind `[K,1,F]`-selected p42 receiver, across both signs and authenticated seven-rune targets (`DEVOTED`, `NUMBERS`, `OPENPGP`), exactly one hit exists:

```text
X=OPENPGP, Y=VERIFY, Z=BEWARE, W=PATHS
subtraction -> OPENPGP.
```

The grammar was recognized after OPENPGP, but the numeric key no longer depends on a post-target seven-role p6 shell choice.

Reproducer: `sims/lp2_signed_warning_initial_p6_crosslink_sft.cjs`.

## H7 family charge

The shell-role multiset was recognized after OPENPGP was available, so charge its ordering and signs.

Take:

~~~text
[B-1,p+K,-1,e,-1,p+K,p]
= [18,25,28,3,28,25,23],
~~~

allow every coordinate permutation and every independent sign choice, then H7-invert. Algebraic collisions leave **161,280 distinct numeric keys**.

Receiver family: every canonical complete eight-rune unknown word whose zero-based rune1 is `F=0`. There are **5**.

Target family: every authenticated seven-rune 2016 source occurrence:

~~~text
8  DEVOTED
26 NUMBERS
42 OPENPGP.
~~~

The solved-p56 additive convention fixes decryption to subtraction. Across:

~~~text
5 * 3 * 161,280
= 2,419,200
~~~

receiver/target/key configurations, exactly one hit exists:

~~~text
p42 word45 start211
remove rune1 F
key H-shell [B-1,p+K,-1,e,-1,p+K,p]
subtract
-> OPENPGP.
~~~

## Evidence boundary

The **receiver selection is target-blind**: authenticated ordinal43 chooses p42 word43; its unique `[K,1,F]` H packet chooses word45, rune index1, and the removable F marker before OPENPGP rune values are used.

The remaining model-selection freedom is the key shell: the seven-role p6 expression multiset was recognized after OPENPGP was known. The 2.4-million-configuration charge shows that this compact shell is highly selective within its declared family, but does not by itself prove the author intended that family.

This result is independent of the retired p41 word41 OpenPGP selector and of the failed OPENPGP same-index exact-state receiver. It uses the corrected terminal direct-number object on p42.

## Reproduction

`node sims/lp2_p6_p42_openpgp_k1f_selector_sft.cjs`
