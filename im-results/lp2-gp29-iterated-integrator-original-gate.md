# GP29 iterated running-sum inverse on the original LP2 register

## Decision and scope

An iterated cumulative-sum cipher over the authentic **29-symbol Gematria Primus register** is a compact possible explanation for the 86 adjacent equalities in 12,956 ciphertext runes. In such a cipher, repeated adjacent glyphs can mean a rare value of the plaintext increment. A direct source-era motivation is the recorded February 2015 solver's prime-shift/difference experiment on the first visual chapter, although that participant's operation was **not** an authenticated Cicada instruction.

The entire finite family of **0 through 28 consecutive modular first differences** has now been applied to original LP2 ciphertext with no learned coefficients or output-based parameters. Neither its page-reset nor its printed-word-reset output resembles native GP29 English. This is an exclusion of the **pure k-fold GP29 integration plus a stationary rune relabelling** architecture for the tested resets. It does **not** exclude a separately specified running keystream, a position-dependent alphabet, another plaintext register, or source-driven transposition.

## Original input and executable inverse

Read the unchanged `resources/liber-primus/lp2-corpus.json`, original LP2 pages **0–55**, preserving rune order. The source spans **12,956 runes**, with **86 within-page adjacent equalities**. For the word-reset check, read the original `resources/lp2-transcription.txt`: hyphens and periods terminate words, while slashes and page boundaries do not. This yields **2,896 printed complete words**, and their concatenated rune indices agree with the page corpus at all **12,956 positions**.

Let `D(x)[i] = (x[i+1] - x[i]) mod 29` for a runic sequence. Direct `D^k` is an exact inverse of a `k`-fold modular running sum, after the first `k` register positions, irrespective of its unknown integration constants. Any stationary bijection of rune labels preserves the output index of coincidence (IoC). Original page resets were applied independently to each of the **55 rune-bearing pages** for every `k=0..28`; printed-word resets were applied independently to all 2,896 words for `k=0..6`, with the latter capped while over 1,200 original positions remain.

| Register and orders | Output rune counts | Highest IoC | Highest single-symbol fraction |
|---|---:|---:|---:|
| Original k=0 | 12,956 | 0.034478 | 0.0380 |
| Original page reset k=1 | 12,901 | 0.035325 | 0.03953 |
| Original page reset k=2..28 | 12,846 down to 11,416 | 0.034528 | below 0.0391 |
| Original printed-word reset k=1..6 | 10,060 down to 1,290 | 0.035330 | 0.0434 |
| Authentic unencrypted p57 native-GP English control | 95 | **0.062710** | independently source-derived |

The **maximum page-reset IoC in each of the nine original visual chapters** across all 29 orders is respectively `0.03549, 0.03571, 0.03544, 0.03540, 0.03519, 0.03536, 0.03542, 0.03545, 0.03720`; no chapter yields a native-English distribution even allowing a **different secret fixed rune substitution for each visual chapter**. In the word-reset runs, all seven orders, including the original baseline, likewise remain approximately uniform.

The solved, clear p57 source is also a constructive positive control: for every `k=1..28`, `k` successive modular integrations followed by `k` successive differences reproduce **every surviving source GP29 index**. This guards against confusing the inverse's output position alignment or modular sign. The expected alphabet response is established on real Cicada plaintext, rather than synthetic English orthography alone.

## Consequence for the next plaintext decision

Simple cumulative integration is sufficient to suppress repeated ciphertext letters under a rare-increment plaintext model, but the original inverse's almost uniform GP29 histogram rejects that model as a complete **direct native-English** decoder. In particular, adding more pure integration stages up to the GP29-sized bound cannot repair the original frequency deficit, and stationary substitutions cannot repair it at all. Reconsider the integration branch only with a separate original source instruction selecting a **nonstationary value-changing layer** or a **different, recoverable plaintext representation**; do not re-run derivative orders or retune offsets to invent English.

**Reproduction:** [single-run original-cipher SFT](../sims/lp2_gp29_finite_difference_28_source_gate.cjs), executed with `node sims/lp2_gp29_finite_difference_28_source_gate.cjs`. The original and word-reset outputs, per-chapter maxima, and all 28 known-p57 inverse plants are logged deterministically; this report is a bounded negative and contains **no recovered unknown plaintext or key**.
