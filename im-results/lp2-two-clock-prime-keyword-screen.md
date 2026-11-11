# Two-clock prime-stream / LP1-key screen

**Status: scoped negative; no LP2 plaintext recovered.**

## Why this route was tested

Three independently visible ingredients make this a motivated, finite hypothesis:

1. Solved LP2 p56 uses the prime-derived stream \(\phi(p)=p-1\pmod{29}\), with a literal-F exception.
2. Solved LP1 material supplies the Vigenere keys **DIVINITY** and **FIRFUMFERENFE**.
3. LP2 has a strong adjacent-repeat deficit, motivating an outer collision-triggered re-draw.

The independent research hypothesis in [pnotisdev/cicada3301, H1](https://github.com/pnotisdev/cicada3301/blob/main/docs/HYPOTHESES.md) describes a two-layer structured-stream/short-key construction. Its essential feature is **two independent clocks**. The outer prime-stream pointer advances when a repeated output is rejected; the inner Vigenere phase advances once per plaintext rune, except when literal F is passed without consuming the keyword. These clocks cannot be collapsed into one combined periodic key.

## Frozen model and method

The tested encryption model is:

- Inner layer: \(q_i=p_i+K_{\phi_i}\pmod{29}\), except \(p_i=F\), for which \(q_i=F\) and \(\phi_i\) is unchanged.
- Outer layer: \(c_i=q_i+\phi(p_{j})\pmod{29}\).
- If the outer output would repeat the previous ciphertext symbol, the encoder may reject that outer key and retry with the next prime-derived key. This advances \(j\), not \(\phi_i\).

The inverse beam keeps independent outer pointer, inner phase, and previous plaintext symbol. It considers no rejection, one rejected key, or two rejected keys, and validates each rejected key against the previous ciphertext symbol.

The language score is a GP29 bigram log-likelihood ratio, \(10\ln(29P(b\mid a))\), trained on the local Shakespeare-first-300k reference plus LP1 plaintext with the 300-symbol positive-control segment held out. Beam width is 16.

For each key, the screen searched outer offsets 0 through 4000 and every inner-key phase. It scored the first 30 symbols, retained candidates with score at least -4, then re-decoded every survivor over the full 300-symbol window. This two-stage procedure deliberately rejects short-window coincidences.

The two windows are the first 300 black runes after the red heading in:
- p0-to-p3 body (716 runes total);
- p3-to-p8 body (1129 runes total).

## Positive controls

A 300-symbol held-out LP1 plaintext segment was planted using the same two-clock model at outer offset 1234 and inner phase 3, with collision re-draw probability 0.82. Both keys recovered the complete 300-symbol plaintext exactly:

| Inner key | Planted rejected keys | Recovered rejected keys | Exact recovery | Score per rune |
|---|---:|---:|---:|---:|
| DIVINITY | 11 | 11 | 300/300 | +7.71 |
| FIRFUMFERENFE | 9 | 9 | 300/300 | +7.71 |

The positive controls establish that the decoder can follow the independent clocks and literal-F phase hold under the planted mechanism.

## Original LP2 results

| Inner key | Window | 30-symbol survivors | Best full-300 score per rune |
|---|---|---:|---:|
| DIVINITY | p0-to-p3 | 11 | -8.29 |
| DIVINITY | p3-to-p8 | 3 | -9.06 |
| FIRFUMFERENFE | p0-to-p3 | 12 | -7.62 |
| FIRFUMFERENFE | p3-to-p8 | 12 | -9.01 |

The strongest short-window candidates did not survive full-window verification. Every retained candidate remained far below the +7.71 positive-control score. No coherent plaintext, source-derived key material, or reusable decipherment was recovered.

## Decision and scope

Retire this exact construction on the first two sections:

- outer stream: \(\phi(\text{prime})\pmod{29}\);
- inner keys: DIVINITY and FIRFUMFERENFE;
- outer and inner signs: +1;
- outer skip/re-draw model;
- literal-F inner phase hold;
- no Atbash;
- offsets 0–4000 and every keyword phase.

This does **not** reject all two-layer ciphers. It does not test other outer streams, other LP1 keys, opposite signs, Atbash, the coin model, other reset policies, or every LP2 section. Those variants should not be opened without an independent clue selecting them; otherwise the search becomes unconstrained key hunting.

## Reproduction

Run from the repository root:

**node sims/lp2_two_clock_prime_keyword_screen.cjs**

The script uses only repository resources and Node built-ins. It independently implements the two-clock inverse and includes the positive controls. The external H1 repository is a research reference, not a code dependency.
