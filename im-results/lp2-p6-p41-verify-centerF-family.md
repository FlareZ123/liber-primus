# Corrected p41 numbered receiver has a unique p6-state VERIFY inverse

**Agent3, 28 November 2026. Classification: strong local plaintext candidate on an independently numbered receiver; p6 shell-role multiset remains post-discovery.**

Authenticated VERIFY is zero index41 / ordinal42. The established direct-number grammar selects project p41 / physical page42 and canonical local word42. After the canonical cross-page correction:

~~~text
p41 word42 start178
[27,12,5,0,17,13,19].
~~~

The center is the fixed state marker `F=0`. Remove it:

~~~text
[27,12,5,17,13,19].
~~~

Canonical VERIFY is `[1,18,4,10,0,26]`, so the exact subtraction key is:

~~~text
[26,23,1,7,13,22].
~~~

Under the six-coordinate H serialization used by the local state-shell reports:

~~~text
H6(key) = [4,10,23,8,7,19]
        = [q,K*g,p,A,g+K,B].
~~~

Exact subtraction recovers VERIFY and forward replay is exact.

## Direct authenticated-source key

The exact key has a compact construction from the authenticated warning plus historical modulus `p=23`:

```text
[-OPENPGP.first, p, VERIFY.first, OPENPGP.length, PATHS.first, -OPENPGP.length]
= [26,23,1,7,13,22].
```

Charge `[-first(X),p,first(Y),len(X),first(Z),-len(X)]` for `X,Y,Z` over the five final-warning words. All **125** substitutions are distinct. On the already independently numbered / center-F-removed p41 receiver, across both signs and authenticated six-rune targets (`PRIMUS`, `BEWARE`, `VERIFY`), exactly one hit exists:

```text
X=OPENPGP, Y=VERIFY, Z=PATHS
subtraction -> VERIFY.
```

The serialization grammar was recognized after VERIFY, but the exact numeric key no longer requires selecting a p6 H6 role multiset from a large post-target vocabulary.

Reproducer: `sims/lp2_signed_warning_initial_p6_crosslink_sft.cjs`.

## Family charge

Because that six-role multiset was recognized after VERIFY was known, charge all 720 coordinate permutations and all 64 independent sign choices of `[q,K*g,p,A,g+K,B]`. H-inversion leaves **23,040 distinct numeric keys**.

Receiver family: every canonical complete seven-rune unknown word whose center is `F=0`: **7** receivers.

Target family: every authenticated six-rune source occurrence: **PRIMUS10, BEWARE38, VERIFY41**.

The solved-p56 additive convention fixes decryption to subtraction. Across `7 * 3 * 23,040 = 483,840` receiver/target/key configurations, exactly one hit exists:

~~~text
p41 start178
remove center F
H-shell [q,Kg,p,A,g+K,B]
subtract
-> VERIFY.
~~~

If arithmetic direction is floated, addition with the globally negative shell reproduces the same inverse. Treat that as one sign-equivalence class.

This materially upgrades p41 from a page-label / numeric VERIFY endpoint to an exact local candidate on an independently selected canonical receiver. The remaining model-choice freedom is the post-target selection of the six-role shell multiset from the broader p6 expression vocabulary.

This does **not** restore the retired p41 word41 `[10,16,19]` OpenPGP selector.

## Reproduction

`node sims/lp2_p6_p41_verify_centerF_family_sft.cjs`
