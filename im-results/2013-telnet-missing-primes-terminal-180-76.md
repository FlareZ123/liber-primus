# 2013 telnet missing-prime interval versus the LP2 terminal 180/76 division

**Status:** a new, conditional cross-round source-size correspondence and a finite **negative** direct-key test. No recovered unknown plaintext, authenticated key, or cipher.

## A possible human solve path

A historical 2013 Cicada telnet transcript lists the primes through 71, resumes at 1229, and continues to 3301. The 20th prime is 71 and the 201st is 1229. Thus exactly **180 consecutive primes, with ordinals 21–200 and values 73–1223**, are omitted. This source has been described as an unresolved anomaly in historical community archives; the surviving transcript's completeness and whether the gap was intentional require independent historical confirmation.

- Community transcript: [Possible hints never used, “missing primes on telnet”](https://github.com/krisyotam/cicada3301/blob/main/liber-primus/analysis/HINTS-NEVER-USED.md#missing-primes-on-telnet).
- Independent historical description of the command: [The Telnet Prompt](https://uncovering-cicada.fandom.com/wiki/The_Telnet_Prompt). This page links to a historical pastebin record; it is not an independent authenticated transcript.
- The original LP2 printed numeral table has 32×8 = **256** cells. Its outer one-cell perimeter contains **76 = 2(32+8)−4** cells and the rectangular interior contains **180 = 30×6** cells.
- The terminal runic composition already independently noticed in [the terminal-grid hypothesis](../workplace/integrated-original-inversion-challenge.md) is p53's 179 runes followed by the oversized p54 initial Ac (GP index24), making **180**, while p55 has exactly **76** runes.
- Restricting the historical prime list to the **first 256 primes** creates another exact split: the missing ordinals 21–200 contain 180 primes, and the visible ordinals 1–20 plus 201–256 contain 20+56=**76** primes.

This gives a concrete, if retrospective, possible assignment: **omitted 2013 primes ↔ terminal interior**, **visible early primes ↔ p55 perimeter**. A solver could in principle make both connections from player-visible source numbers, if the historical transcript is authentic. The selection of the first 256 primes is motivated by the table only after seeing both artifacts, and the geometric-to-rune assignment was already under investigation before the telnet connection. These are independent source lengths, not independent evidence that Cicada designed the link.

## Exact limited decryption test

The reproducible [SFT](../sims/lp2_telnet_prime_gap_terminal_sft.cjs) constructs the 464 primes through 3301 and enforces the original boundaries. It extracts unchanged GP indices from [the canonical corpus](../resources/liber-primus/lp2-corpus.json):

- Interior ciphertext = p53[0..178] concatenated with p54[0], length 180.
- Exterior ciphertext = p55[0..75], length 76.
- Interior key = primes 21–200 in ordinary ascending order.
- Exterior key = primes 1–20 followed by 201–256, in historical reading order.

For each region, the *complete, predeclared direct key family* comprises prime value or φ(prime)=prime−1, forward or reversed order, and GP29 add/subtract. These are 8 interpretations per region, **16** original-input tests altogether. The operation is a hypothesis; the historical telnet source does not instruct the solver to use GP29 addition or subtraction. No fitted spaces, column order, crib shift, second layer, or keyed selection was allowed.

**Results of original-input execution:**

| Original region | Original IoC | Range of decoded IoC, 8 cases | Result |
| --- | ---: | ---: | --- |
| p53 + p54[0], 180 runes | 0.03333333 | 0.03370577–0.03656114 | No coherent GP plaintext |
| p55, 76 runes | 0.03789474 | 0.03052632–0.03789474 | No coherent GP plaintext |

All 16 variants preserve the full original rune array under exact forward reencryption. Native-GP plants from cyclic repetitions of the *already solved* p57 runes recover every rune with the same fixed keys, confirming arithmetic reversibility; these are implementation controls, not evidence of the historical mechanism. As a descriptive reference, the 95-rune genuine plaintext p57 has IoC **0.06270997**, but this is a different-sized sample and must not be interpreted as a calibrated p-value.

**Important false-positive trap:** one reversed, totient, additive p55 transliteration begins with the Latin string `SPONGEO...`. Its actual first five GP rune tokens are **S · P · O · NG · EO**, so the apparent substring `SPONGE` is produced by cutting the one-rune **EO** digraph. It is **not** the rune spelling of the word SPONGE, not a plaintext crib, and the remainder is nonlinguistic. The SFT records full rune-index outputs to prevent this ambiguity.

## Independent printed-table numeric check

A separate, language-free source check asks whether the same split has an obvious **bytewise** correspondence with the printed table itself. Freeze the table's natural 30×6 interior row-major reading and the standard outer ring clockwise from the upper-left corner. Compare those 180 and 76 base60-decoded byte values with the two historical prime sets reduced mod256, using either the prime or its φ(prime)=prime−1. There is no fitted rotation or optimized correspondence.

| Original table region versus source key | Equality count | Pearson r |
| --- | ---: | ---: |
| Interior versus missing primes mod256 | 1/180 | −0.09733 |
| Interior versus missing φ(prime) mod256 | 4/180 | −0.09733 |
| Exterior versus visible primes mod256 | 0/76 | +0.10812 |
| Exterior versus visible φ(prime) mod256 | 0/76 | +0.10812 |

The 1, 4, 0 and 0 coincidences are consistent with unrelated bytes under this direct interpretation. This specifically fails to corroborate a literal prime-valued byte table. The historical base59 numeral-codec ambiguity does not provide a reason to optimize the byte interpretation after this negative result.

## What would change the decision

The historic prime-gap interval is a more specific cross-round starting point than another arbitrary 180-number list; its most direct additive uses fail. It should **not** be used to launch permutations, cyclic offsets, multi-layer transformations, or a general prime-pad sweep. The valuable next evidence would be either a truly original 2013 telnet transcript or source-code capture establishing intentional omission, or a historically visible instruction selecting a **specific reversible mapping** from the prime interval and table interior/perimeter to runes. Freeze such a map before looking at original plaintext; use a solved historical control and a distinct original holdout. Until then this remains a provisional source clue with no decrypted text.
