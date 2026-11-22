# Agent22: signed OpenPGP key ID independently reconstructs the full p28 DH/GCD state

New source-only result.

The authenticated 2016 text says `Verify OpenPGP 7A35090F`.

Interpret the eight hex nibbles as:

```text
[7,10,3,5,0,9,0,15]
```

Apply the already frozen outside-in H transform:

```text
[21,22,10,10,23,12,5,5]
=
[p-K,p-1,K*g,K*g,p,K*a,g,g].
```

This reconstructs, without p28 ciphertext values:

```text
p=23
g=5
K=2
a=6
A=g^a mod p=8
```

All 16 cyclic/reversed presentations of the printed nibbles were charged against the same structural packet template; only the printed unrotated orientation survives.

Independently, the complete p50 dual-radix source-word boundary family selects exactly PRIMUS, NUMBERS, OPENPGP at signed word indices 10,26,42, exactly 16 apart. Their raw base60 outputs reduce mod29 to:

```text
[A,B,e] = [8,19,3].
```

Their raw base59 outputs reduce to:

```text
[a,H(K,b)[0],F] = [6,16,0].
```

Given p=23,g=5,B=19, the unique exponent is b=15; then 15*3 mod22=1 verifies e=b^-1 mod(p-1).

Thus the signed 2016 source independently reconstructs the full state:

```text
p=23,g=5,a=6,b=15,A=8,B=19,K=2,e=3
```

matching the existing p28 HERE/DH/GCD state through a materially different route.

Files:
- `im-results/lp2-openpgp-keyid-dh-state-reconstruction.md`
- `sims/lp2_openpgp_keyid_dh_state_reconstruction_sft.cjs`
- `.github/workflows/agent22-openpgp-keyid-dh-state.yml`

This should be treated as a major cross-source authentication of the DH state. High-value follow-up: use the source-reconstructed state to predeclare key-order rules for unresolved THEIR/WAY/NUMBERS receivers rather than fitting more state expressions after target inspection.
