# Stateful 28-choice byte coding: exact original-ciphertext compatibility witness

**Agent 4, 2026-11-10. Evidence class:** constructive mathematical counterexample to transferring fixed-global-alphabet byte-code exclusions to unconstrained state-dependent alphabets. **No original LP2 plaintext, author key, file format, or true cipher mechanism recovered.**

## Why this question matters

The earlier [direct byte inverse](adaptive-radix28-byte-recovery.md) and [global-permutation-independent sieve](adaptive-radix28-global-order-sieve.md) exclude fixed-order 5n base-28 digits per 3n bytes across many phase and doublet conventions. Neither exclusion covers an arbitrary, **previous-ciphertext-rune-dependent** ordering of the 28 next glyphs. Before attempting an enormous 29×28 secret table search, ask the exact finite question: **can any such table make the real source ciphertext obey every three-byte capacity constraint under one explicitly fixed framing?**

The answer is **yes**. This demonstrates a large identifiability loophole. A byte-capacity-pass alone under free context-dependent orderings supplies no evidence of genuine plaintext recovery.

## Reversible model

Let \(C_i\in\{0,\ldots,28\}\) be the original LP2 rune index. Every preceding rune \(a\) has a private row \(S_a\), a permutation of the 28 symbols other than \(a\). Inverse and forward maps are exact:

\[
d_i=S_{C_{i-1}}^{-1}(C_i)\in\{0,\ldots,27\},\quad
C_i=S_{C_{i-1}}(d_i).
\]

For each of the 55 nonempty unsolved physical pages, use its first rune only as initial context. Beginning at the next rune, group successive transitions into five-digit packets at phase zero. A packet touching any immediate repeated glyph is conservatively treated as marker-affected and is omitted entirely. An ordinary complete packet describes three unsigned bytes precisely when

\[
V=d_0 28^4+d_1 28^3+d_2 28^2+d_3 28+d_4<256^3.
\]

If \(d_0\le26\), validity follows automatically because \(27\cdot28^4<256^3\). If \(d_0=27\), validity requires \(d_1\le8\). These are exact integer inequalities.

## Explicit witness, no language fitting

The checked-in [standalone decoder and constructive witness](../sims/radix28_stateful_byte_capacity_witness.cjs) fixes which outgoing rune receives maximal digit 27 in each of the 29 rows, in GP index order:

```text
[8,5,21,25,18,23,15,21,17,7,28,7,18,2,17,26,21,10,25,15,0,18,0,2,0,26,17,7,0]
```

For each maximum-ranked edge \(a\to b\), collect the actual clean packet's second glyphs following that edge. Assign all collected followers to the first available low digits of \(S_b\), with deterministic ascending-order tie breaking. Complete each row by the other available glyphs in ascending order, keeping its chosen maximum glyph at digit 27. All 29 rows contain 28 distinct symbols, none equal to their predecessor state. The largest required low-rank set contains only **two** glyphs and there is no conflict with a row's maximum. The algorithm derives every rank without using guessed English, compressed-file headers, or a cryptographic decryption score.

The resulting **original LP2**, as opposed to synthetic only, has:

| Test | Observed |
|---|---:|
| Full five-digit packets before marker exception | 2,561 |
| Marker-affected packets omitted | 85 |
| Unmarked packets with exact rank inverse | **2,476** |
| Three-byte capacity overflows | **0** |
| Packets with leading digit 27 | 6 |
| Packets re-encoded rune-for-rune | **2,476 / 2,476** |
| Independently generated three-byte positive roundtrips | **1,000 / 1,000** |
| Recovered unconstrained three-byte output length | 7,428 bytes |

The inverse table SHA256 over JSON serialization is `3d0c87f554ddaca7f365b01d2febeec978a751bb0ed749804973c617036aec16`. The decoded 7,428-byte output SHA256 is `ec09fd2f75632d62d6d70d6111f54d352e9028b198b59a28f43925dbc57667ec`. The table and output are **post-selected to pass the observed capacity test**. Their bytes have no demonstrated plaintext interpretation; full packet roundtrips alone are evidence of consistency, not authorship.

All source, model, key-table construction and independent byte plants passed on the exact checked-in code in [on-demand Actions run 42774150997](https://github.com/FlareZ123/liber-primus/actions/runs/42774150997). The command is `node sims/radix28_stateful_byte_capacity_witness.cjs`. It uses the authoritative [numeric corpus](../resources/liber-primus/lp2-corpus.json) and no third-party packages. The previous manual radix28 workflow is reused; there is no per-commit trigger.

## What is established and what remains open

**Established:** a freely chosen state-indexed set of 29 outgoing permutations admits a perfect reversible three-byte-capacity interpretation of every original unmarked five-digit packet under the declared phase and page-start convention, while its fixed global alphabet counterparts fail. This makes plain capacity validity a poor discriminator for the free-row hypothesis, even though capacity was decisive for the much narrower fixed-key models. The witness is an existence proof, hence it cannot show that these 29 rows were used by Cicada 3301.

**Unknown:** the real source-register encoding, packet boundaries, doublet meaning, compressed or uncompressed source data, whether a shared table was ever used, and any independently generated key. Nothing here deciphers even one original LP2 rune into verified intended text.

**Research decision:** additional unfitted table searches with byte validity as the sole objective are underconstrained. A worthwhile attack needs a *source-derived small table family*, a reliable original binary-format prefix, a separately predicted marker/phase rule, or jointly recovering a plaintext with exact independently verified ciphertext reproduction. Repeatedly building unconstrained satisfying tables will not solve LP2.
