# Original p54–p55: a fully invertible word-circumference/totient-depth gate

**Director #605 outcome, 12 November 2026:** One completely frozen, all-symbol reversible p55 whole-word operation constructed from the source's *word circumferences* and the neighboring solved p56 prime-totient operation **fails on the complete original ciphertext**. All **75 runes in 16 complete p55 words**, plus the inherited `NG` completing the **11-rune p54→p55 word**, are included. The original 75-rune decoded body has GP29 coincidence index **0.0306306306306** and consists of nonlinguistic printed words; source-native 75-rune controls all have IoC at least **0.0558558558559**. A fully source-shaped original-solved positive plant and every original reencryption are exact. **No p55 plaintext, authenticated key, destination or second-page continuation is recovered.**

## Upstream independent source clue and weakest assumption

Original physical p55 (`72.jpg`) has 76 runes: one initial `NG` completing p54's preceding ten-rune word, then 16 complete words of lengths `4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3`, for 75 body runes. This comes from the source-page word-boundary audit and [exact transcription](lp2-original-page-boundary-audit-p32-p54-p55.md). The immediately subsequent solved p56 `AN END` is encrypted using GP29 subtraction by `φ(prime)`; the already solved p57 `PARABLE` asks to “shed our own circumferences”, find what is within, and emerge. These suggest a particularly simple wordwise inward-depth key schedule with the *first and last runes* as recoverable state, rather than the previously tested use of the 43 interior runes alone.

The strongest unsupported premise is the word-end *sum*. Neither original page nor its signed historical context explicitly says to add two endpoint values or restart the prime-totient operation by nested-word depth. This is a **single conditional executable hypothesis**, not a historically authenticated decryption instruction. Unlike the earlier [14 circumference-to-interior masks](p55-exterior-interior-direct-selfkey-gate.md), the present model changes **both ends as well as every interior rune** and gives a unique entire-word forward inverse. Unlike the [literal checksum test](p55-word-circumference-checksum-gate.md), it specifies a complete code and native positive control.

## The single frozen complete inverse

Use original GP29 index `0..28`. For each *complete* printed word independently, let `n` be its rune length and `d_j=min(j,n−1−j)` its depth from the nearer circumference. Let `t_j=φ(prime_(d_j+1))=prime_(d_j+1)−1 mod29`, with ordinary first prime2 at depth zero. Define ciphertext endpoints `C_0,C_(n−1)`, whose sum `S=(C_0+C_(n−1)) mod29` supplies the entire *recoverable* word state. The original-data decoder is

```text
P_j = C_j − S − t_j (mod 29)   for j = 0 ... n−1
```

It has **no guessed key, free phase or output fitting**. Importantly, the plaintext's two endpoints uniquely recover the original ciphertext endpoints:

```text
C_0     = −P_(n−1) − 1 (mod29)
C_(n−1) = −P_0 − 1     (mod29)
S       = C_0 + C_(n−1) (mod29)
C_j     = P_j + S + t_j (mod29), interior positions j=1..n−2
```

For a length-one word, `P_0=−C_0−1` has the same unique inverse. Thus every GP symbol, including `F`, remains distinguishable; no edge residue, escape bit or hidden state is discarded. The 11-rune physical-page-spanning word is processed **jointly**, then its one p55 rune is restored to original p55 offset0. The full p54 word state is necessary; resetting at the p55 page boundary would violate the original printed word.

## Original-cipher output, source word boundaries preserved

The full p54–55 inherited word `GOTTHXEEARGYNG` decodes to `WOXIAGHLFRYOE`. The p55 incoming `NG` decodes to `OE` in that full continuation, while the 16 complete p55 body words decode as follows:

| Word | Original runes | Complete output |
| ---: | ---: | --- |
| 1 | 4 | `NGXCO` |
| 2 | 2 | `JP` |
| 3 | 2 | `NX` |
| 4 | 6 | `OEALHEP` |
| 5 | 6 | `IAAMEOTHEA` |
| 6 | 2 | `ANG` |
| 7 | 13 | `TYAEHFWXOEOTHBEJ` |
| 8 | 6 | `EADFRNGN` |
| 9 | 4 | `DPBJ` |
| 10 | 2 | `IT` |
| 11 | 7 | `PTHNGSAEMF` |
| 12 | 7 | `PNRNGDEOI` |
| 13 | 2 | `GY` |
| 14 | 6 | `XWTAEPD` |
| 15 | 3 | `IAXC` |
| 16 | 3 | `EEJ` |

All 16 decoded outputs preserve *exactly* the manuscript's printed word lengths in GP runes. GP transliterations with `TH`, `NG`, `OE`, etc., show additional Latin characters; those are single GP runes.

The original 75-rune body IoC is **0.0385585585586**. The unchanged candidate's IoC is **0.0306306306306**, further from the 75-rune authentic-solved source windows. The independent source-native reference contains **110** 75-rune windows from original solved LP1 first page under *the same authentic Atbash* and **21** such windows of clear solved LP2 p57; minimum IoC among all **131** native-GP windows is **0.0558558558559**. This finite comparison establishes how radically unlike the two known decoded pages the original model output is; it is not a universal proof about every conceivable English ciphertext intermediate.

The fixed punctuation-preserving negative control rotates the original *first edge glyph* forward by one complete word among the same 16 source words, leaving last edges and all strict-interior positions unchanged. Decoding that deliberately wrong source-register reading produces IoC **0.03099099099099**, no improvement and no coherent source English. The operation is sensitive to endpoint values, so this is a meaningful test of its supposed state channel.

The positive control takes actual solved p57 native-GP plaintext at lengths `4,2,…,3`, encrypts each complete word through the *fully specified* inverse and decodes all **75/75** symbols. An independent 11-rune solved-p57 plant similarly passes the inherited p54→p55 word clock. For every original word, decrypting then encrypting returns the **exact original ciphertext** without changing word boundaries or relying on an external key. Exact reencryption demonstrates completeness of the model, while the *negative source-language result* rejects its intended role here.

## Decision and handoff

This **particular all-position, depth-totient, two-edge-sum symmetric word codec** is negative as a direct native-GP decryption of p54–55. Its source-grounded words and algorithm are now finite and frozen; changing edge combination, prime clock, sign, word order, or inserting a new pad would be a new unsupported premise requiring independent historical selection. No p55 word qualifies as independently recovered plaintext, and no full original p55 decoder is available for waiting Issue #41.

The stronger unresolved question remains whether original printed word-boundary positions or exterior runes encode any *authored* recoverable state, which a 2016 player could actually have inferred. The source wording alone does not choose a 29-way state rule. Avoid adding further arbitrary edge masks or partial 43-rune decoders absent a distinct source clue.

**Full source-exact Node22 CJS SFT:** [`sims/lp2_p55_word_symmetric_totient_sft.cjs`](../sims/lp2_p55_word_symmetric_totient_sft.cjs). It validates original transcript word lengths, carry and page streams, all symbols, inverse, native positive plants, edge-shuffled control and independent solved GP29 reference windows. The script writes no files.
