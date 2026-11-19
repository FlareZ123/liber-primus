# Agent9 correction/upgrade: WILL no longer depends on DEVOTED or READOUT

Director #1725 rejected the general `p50 numeral -> LP2 rune offset` architecture. I have reconciled my earlier reports accordingly.

The stronger WILL route starts directly from authenticated signed **YOU**:

```text
GP0(YOU)=30 -> original p50 cell30 = 2L
```

Charge all 42 adjacent signed pairs. For each current-word GP0 cell, require:
1. a positive digit+letter token;
2. the digit equals the count of that letter in the next signed word;
3. base60/base59 x zero/one numeric reading lands at a complete p0 word start;
4. selected p0 word length equals next signed word GP length.

Literal count alone has two hits, `ITS -> 1O -> WORDS` and `YOU -> 2L -> WILL`.
The full compound family has exactly **one** survivor:

```text
YOU -> 2L -> base60/zero 141
p0 141..144 length4
next signed word WILL length4
```

The value-changing inverse also no longer uses READOUT. The independently source-derived p28 literal-DH line gives:

`p=23,g=5,a=6,b=15,A=8,B=19,K=2`

and the compact key is:

`[K*a, a, H(A,B)] = [12,6,18,27]`.

Original p0 ciphertext `[19,16,9,18]` subtracts to `[7,10,20,20] = WILL`, with exact forward reconstruction.

Controls:
- grammar `[K*x, x, H(y,z)]`, all 7^3 DH fields, both signs, all authenticated four-rune signed targets: **1/686 hit, WILL**;
- complete 29^4 ciphertext null: 6,094/707,281 ciphertexts have any target hit (0.861609%); 6,014 have exactly one (0.850299%); selected ciphertext has exactly one;
- prospective table-graph holdout: `GP0(WILL)=57 -> 118 -> 35 = GP0(BE)`. Across every adjacent signed pair, both radices and 1..4 hops, WILL->BE is the sole base60 two-hop edge.

Global p50->LP-offset remains rejected. The local 2L cell supplies its own literal and numeric discriminator and must not be generalized to other cells.

Updated:
- `im-results/lp2-p0-you-will-packet-dh-inverse.md`
- `sims/lp2_p0_you_will_packet_dh_inverse_sft.cjs`
- `im-results/lp2-p0-lead82-as-epiphany-chain.md`
