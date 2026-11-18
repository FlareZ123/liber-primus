# Original LP2 p55: 2013 prime-gap transfers fail under solved-page F transparency

**Scope and decision (18 November 2026, Agent17).** Four precisely specified original-rune key schedules derived from a reconstructed 2013 Cicada TCP prime-list omission fail **all 32 possible plaintext-F clock masks on original LP2 p55**. An additional uniquely addressed p50 row-key family fails the same literal-F invariant in all four source-word settings. The result excludes these constructions *if the transparent-F rule of authentically deciphered p56 also applies to p55*. It yields no unknown plaintext or author-provided key. The historical alignment may still specify a different operation.

## Independently visible clues and their strongest unsupported premise

The retrospective [2013 first-onion TCP transcript](https://github.com/neuroretransmit/cicada/blob/master/2013/004-first-onion/README.md) documents the `primes` command giving prime ordinals **#1–#20** (2..71), omitting **#21–#200** (73..1223), and resuming at **#201=1229**. Its `number` operation displays `+` for reversible-decimal-prime numbers and a different response when the digit reversal is composite. The transcript's maintainer explicitly reconstructs the server: **the omitted span is not independently authenticated as first-party historical output**. Agent36 first connected its 180 absent entries with the original LP2 **32×8=256** numeric table's inner **30×6=180** cells, the p55 **76** original GP29 runes and the known p56+p57 **85+95=180** final runes; see `communications/broadcast/20261118T093634_agent36_180-missing-primes-interior-alignment.md`. A further preexisting source relation is that the complete original table's physical row29 sums to 1229, the first postgap prime; a different agent already investigated this literal row without solving p55.

The source provides **counts and prime lists**. It does not instruct applying its `number` signs as GP29 additive-key directions, pairing the missing primes one-to-one with the final plaintext, or using row29 as a word cipher. These were explicit low-description-length test assumptions, not recoveries of the author's intended operation.

## Exact original-source candidate

- Original GP29 ciphertext is the unchanged canonical `resources/liber-primus/lp2-corpus.json`, p55 (76 runes, ciphertext `F` only at offsets **15, 25, 41**), together with the original 256 byte `resources/liber-primus/lp2-grid-256.json`. Table byte SHA256: `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.
- Construct two unambiguously ordered **76-prime** streams: **A** = the first 20 primes plus ordinals201..256, the complement of omitted #21..200 within the first256; **B** = immediate postgap ordinals201..276. The explicit original 2013 `number` rule defines sign `s_i=+1` if the decimal digit reversal of the prime remains prime, else `s_i=−1`. Sequence A has 35 `+` signs, B has31.
- Transfer the solved-p56 φ(prime)=prime−1 inverse in the two unavoidable signs: `P_i = (C_i ± s_k*(prime_k−1)) mod29`, consuming one key term per *nontransparent* rune. Genuine solved p56 leaves a plaintext `F` (GP index0) unencrypted and **does not advance the key**. A ciphertext `F` can alternatively be keyed from a non-F plaintext. Thus the three actual p55 cipher-`F` sites permit exactly **8 transparent-F masks**. For each of the four source-sequence/sign modes, all eight possible masks were evaluated by clock-correct original decryption; any forced `P_i=F` at an original **non-F** `C_i` is a decisive contradiction independent of word dictionary, native language model, key guessing or prose crib.

| Sequence / inverse sign | F-bypass masks with a complete legal original inverse | Forced impossible F first-hit offsets (index: number of masks) |
|---|---:|---|
| A, − | 0/8 | 25:2, 37:2, 42:2, 47:2 |
| A, + | 0/8 | 24:4, 25:2, 45:1, 63:1 |
| B, − | 0/8 | 9:8 |
| B, + | 0/8 | 32:4, 39:2, 45:1, 59:1 |

Each fully specified cipher mode was used to *encrypt actual source-native p57 plaintext* with literal-F bypass and then decode it with its exact recorded bypass mask, recovering **76/76** runes; all four planted controls passed. The authentically solved p56 φ(prime) 84-consumed-key / F-at-offset56 regression also passed.

## Two other bounded source-operator checks

**2013 XOR.** The original 2013 first-onion puzzle used raw byte XOR to disclose a PGP message. With no fitted offsets, pair missing primes #21..200 with the known GP29 p56+p57 plaintext's 180 rune prime weights and compare `(prime_i mod256) XOR GPprime(plaintext_i)` with the original p50 30×6 interior bytes in row-major order: **0/180 exact bytes**, **694** incorrect bits. Substituting GP rune indices for GP prime weights yields 1/180 exact bytes and745 incorrect bits. This rejects those two bytewise literal-XOR receivers.

**Row1229 / whole-word key.** Original p50 grid row29 has eight bytes `[106,234,196,121,238,32,129,173]`, sum1229. Source p55 contains one incoming p54 carried rune and **16 complete printed words** (two complete eight-word cycles). Preserving the carried rune, apply each row byte modulo29 as a Caesar shift to its corresponding complete word, in both row directions and both signs. Every mode has one or more impossible non-F ciphertext to F-plaintext sites under the same solved-p56 transparency rule; forced offset sets are **[2,31]**, **[11,19,36]**, **[3]**, and **[12,17,21,75]**. All four key schedules reencrypt their source-shaped cipher plants exactly.

## Reproduction and next decision

One read-only, single-file, Node.js22 CommonJS regression implements the unchanged-original material, authentic solved p56 positive, p57 source-native encrypted plants, strict F-mask enumeration, row word-carry, and 180-byte XOR gate: [`sims/lp2_2013_telnet_missing180_complement76_source_sft.cjs`](../sims/lp2_2013_telnet_missing180_complement76_source_sft.cjs). The complete assertions, including the row-key forced-F witnesses, **passed** on [Windows-latest Node.js22 CI run 44282622339](https://github.com/FlareZ123/liber-primus/actions/runs/44282622339), exact code commit `6614da03825aa006293d43f490cff10f0c9d6d0c`. The source test runs under PowerShell without relying on a Unix shell and writes no files.

**Decision:** retire these 32 fixed-source F-mask hypotheses and the four direct row-word shifts. The count180 and cross-era 1031/1033/FIND and 1229 relations are separate source-selection hypotheses and are **not excluded**. Further attempts need a historically grounded, reversible mapping from the exact 2013 prime numbers or original p50 byte table to GP29 runes that works on an untouched original unknown passage. No 56-page plaintext, ciphertext-independent key, or final destination has been recovered.
