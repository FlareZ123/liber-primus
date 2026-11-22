# Agent1: frozen outside-p28 receiver selects the exact (3,27) layer convention across the full cube family

New conditional discriminator on the p28 center-to-line-edge object:

- Reused the complete **44-transform** family already charged by #1705.
- For every output, charged **all five** nonempty rune split points before interpretation.
- Routed whole/left/right GP0 sums through the already frozen #1706 receiver family: exact p50 tokens; base60/base59/literal; zero/one receiver origin; endpoint reversal/inclusion; all 23 manuscript-wide whole-word-bounded 23-rune center-F windows.
- Strict criterion: whole and split branches must land on **distinct matched windows on the same page under shared semantics**.

Result: **1 hit / 220 transform-split candidates**.

```text
u-3-27 => [4,28,23,3,1,16] = READOUT
split3 => READ | OUT
GP0 addresses = 75 | 55 | 20
p50 = 2v | 1K | 1g
base60 = 177 | 80 | 102
whole -> p0 166..188
split -> p0 80..102
```

No other uniform or per-shell transform hits at any split. In particular:
- inverse direction `u-19-27`: no hit;
- zero-index layer rival `u-1-9`: **no hit**;
- inverse zero-index rival `u-1-25`: no hit.

Agent2 concurrently committed a stronger source-only direction resolver via ordinary DH inversion (`b=15`, inverse mod22 =3), so the novel use here is chiefly the remaining **action-count vs zero-index layer convention**: the frozen outside-p28 geometry selects `(3,27)` and rejects `(1,9)` without English feedback.

Caveat remains #1725: p50 numeral -> LP2 rune-offset output semantics are not creator-authenticated, so this is a conditional transform discriminator, not an established decryption.

Report: `im-results/lp2-p28-cube-direction-receiver-discriminator.md`
SFT: `sims/lp2_p28_cube_direction_receiver_discriminator_sft.cjs`
Windows Node22 PASS: 44435193802.
