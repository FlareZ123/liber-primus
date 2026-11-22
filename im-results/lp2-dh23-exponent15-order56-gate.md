# DH23 exponent-15 / GF841 order-56 pairwise power gate

**11 November 2026 · Agent37 · source-motivated necessary-condition test, negative.** No plaintext, key, or destination recovered.

## Hypothesis and human-visible path

Three independent source facts suggest one narrow nonlinear operation:

1. The authenticated 2013 worked Diffie–Hellman exchange is over modulus **23**, with base **5**, server public share **8**, client public share **19**, and shared secret **2** ([signed-source specification](../resources/external/2013-tcp-server-signed-source.md)). The client exponent is not printed, but is uniquely recovered from the small signed values:
   [
   5^6equiv8pmod{23},qquad 5^{15}equiv19pmod{23},qquad 8^{15}equiv19^6equiv2pmod{23}.
   ]
   Thus the derived client exponent is **15**; this is an arithmetic derivation from authenticated public values, not a quoted secret.
2. The original p39 red triad is ([27,5,15]), whose ascending-coefficient polynomial is (15(X-24)^2). The p3 red triad independently fixes the field (K=mathrm{GF}(29^2)=mathrm{GF}(29)[u]/(u^2-3u-8)), with (u) of multiplicative order **840** ([three-source triad report](lp2-three-source-triad-gf841-bridge.md)).
3. LP2 has **56** unsolved pages. On (K^*), the 15th-power map has image size
   [
   rac{840}{gcd(840,15)}=56.
   ]
   Its image is the unique subgroup (H_{56}=langle u^{15}angle). Within this subgroup, exponent 15 is its own inverse because (15^2equiv1pmod{56}).

This suggests a simple pairwise transport: encode adjacent original GP29 runes as (z=a+bu), and use (zmapsto z^{15}) on (H_{56}). The 15→56 alignment is a hypothesis, not proof of authorial intent.

## Decisive prediction

Every nonzero output of (zmapsto z^{15}) in (K^*) must lie in (H_{56}), equivalently satisfy (z^{56}=1). Therefore, if untouched LP2 ciphertext pairs are outputs of this reversible pairwise power map, **every nonzero ciphertext pair must pass (z^{56}=1)**. This is a necessary condition; it does not require language scoring, a key fit, or a statistical threshold.

The reproducer first checks the source arithmetic, the p3 field order, the exact order-56 image, and the fact that exponent 15 is self-inverse on that image. It then evaluates the untouched original 12,956-rune stream under the canonical p3-basis pairing (z=a+bu).

## Original-cipher result

| Pair clock | Pairs | Nonzero pairs | In (H_{56}) | Outside (H_{56}) | Membership |
|---|---:|---:|---:|---:|---:|
| Continuous book stream | 6,478 | 6,477 | **465** | **6,012** | **7.179%** |
| Reset at each physical page | 6,462 | 6,461 | **442** | **6,019** | **6.841%** |

Uniform nonzero field elements would fall in (H_{56}) with probability (56/840=1/15approx6.667%). Both observed rates are close to that random baseline. The continuous pairing contains **832 distinct pair values**, far more than the 56 values allowed by the proposed image subgroup.

**Decision: reject the pairwise 15th-power transport on the canonical p3 field pairing.** A 15th-power map cannot be a reversible encryption of these original ciphertext pairs on (H_{56}), because 6,012 of 6,477 nonzero pairs are outside the required image. The page-local reset convention does not rescue it.

## Scope

This excludes only the specific pairwise GF841 15th-power image-subgroup model selected by the derived DH exponent 15 and the p3 field basis. It does not exclude using 15 as a scalar, a key-schedule parameter, or a state transition in a different source-defined construction. It also does not establish that the numerical 15→56 correspondence was intended. No further exponent, basis, pair-phase, or offset sweep is justified without a new original-source instruction.

**Reproducer:** [`sims/lp2_dh23_exponent15_order56_gate.cjs`](../sims/lp2_dh23_exponent15_order56_gate.cjs). Run from repository root with `node sims/lp2_dh23_exponent15_order56_gate.cjs`.
