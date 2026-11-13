# p36 prime-ordinal 36 → p56 totient-stream transfer (negative)

**Decision:** the one source-derived p36 start tested here does not decrypt p36. This is a bounded negative for a specific transfer, not evidence that p36 is solved or that the authentic p56 mechanism applies elsewhere.

## Why this was worth one test

Physical LP2 p36 (original scan `50.jpg`) contains **238 GP29 runes in 50 printed words**. It is also the page associated with the 2013/2014 numerical material: the participant DH3301 transcript yields a private-exponent class (e\equiv11\pmod{550}); one representative is **1661 = 11×151**, and **151 is the 36th prime**. A solver might therefore try the established p56 prime-totient clock beginning at the 36th prime on physical p36.

This selector is deliberately classified as **weak and retrospective**. The participant transcript is not a signed LP2 instruction; the signed 2013 server challenge authenticates its BASE29/DH teaching protocol, not the participant's particular exponent class or the use of 151 as an LP2 key start. Nor does any source say that the p56 cipher should transfer to p36. The p56 operation itself, however, is independently established on its own page: subtract consecutive prime totients modulo 29, with its one page-specific literal-F interrupter.

## Frozen original-input test

The single candidate is:

\[
P_i = C_i - (p_{36+i}-1)\pmod{29},
\]

where (p_n) is the (n\)-th prime using **1-based prime ordinals**. Thus the first key prime is (p_{36}=151), and the first shift is \(150\bmod29=5\). The key advances continuously over all 238 original GP runes and across printed word boundaries.

The source page's 10-dot event and printed Arabic numeral 1 are non-GP material; they do not consume a rune key. The solved p56 clock passes its internal dot marks and non-runic digest without advancing or resetting, so the p36 candidate likewise uses no non-rune clock event. **No p36 F skip is applied**: the p56 literal-F exception is page-specific and no source selects an analogous p36 position.

No alternative prime starts, signs, resets, phases, or F masks were searched.

## Result

The canonical transcription reproduces the original p36 register exactly: **238 runes / 50 words**.

| Measure | Original p36 | Candidate p56-clock decode |
|---|---:|---:|
| GP29 index of coincidence | **0.03598908** | **0.03407439** |
| Within-word GP trigram mean log score | **−4.342497** | **−4.582592** |

The candidate is worse than the unmodified ciphertext. Its transliteration is nonlinguistic:

```text
NGIA PSDR FIS IS PML POW NGIUAAE CDAEUDR EO CMJEAAE NFDGOG
THOBOENEAWTNGX PIAY TSTDSXRIEA XWTHEAXNIRPS AEIA WIANYNAF
MTEOMC THXMWJ BUAEAIIG XBDM JFU JRDEBPUX RH OEOETC WWU IIAM
IAYOSAEFI PUI EANGAELNG BALI OEO XEITT THOTHLUMAA FIAESW
LTTH LOETHAH TJLROEW LEFEDC RTHAE POE URNGLHOEGEAMTHP
RORYTHRHI CTHAE IAULHIAYTEO SIP CS LEAR EREOT EOCBOEO
```

For calibration, a trigram model was trained on the first 80% of the Shakespeare control's GP-encoded words. The remaining 20% supplied **2,000 deterministic, length-matched 50-word native samples**, preserving the exact p36 GP word-length sequence. Their scores ranged from **−2.350445** to **−1.531877** (median **−1.889255**). The candidate scores below all 2,000 samples; the raw ciphertext also scores below them. This is a finite source-register comparison, not a proof about every possible language.

The SFT also checks exact forward re-encoding of the original p36 ciphertext and a synthetic native-GP positive plant under the same continuous 238-rune key. Both pass. As usual, reversibility verifies implementation, not historical key validity.

## Scope and decision

Reject only the transfer of the verified p56 \(\varphi(\text{prime})\) rule to p36 with the 36th prime as its initial key prime and no p36-specific skip. The result does not exclude a different p36 cipher, a separately sourced key, or a different role for the 2013 numbers. It does show that the attractive (1661=11\times151\), (151=p_{36}) correspondence does not by itself recover p36 plaintext through the known p56 operator.

Do not broaden this into arbitrary prime-start or F-mask searches. Reopen only if an independent source specifies the p36 key start, a p36 interrupter, or a different reversible operation.

**Reproducer:** [`sims/p36_prime36_p56_totient_transfer_sft.cjs`](../sims/p36_prime36_p56_totient_transfer_sft.cjs), Node.js 22. Inputs: `resources/liber-primus/lp2-corpus.json`, `resources/lp2-transcription.txt`, and `resources/control/shakespeare_first300k.txt`. The established p56 mechanism is documented in [`im-results/lp2-punctuation-solved-clock.md`](./lp2-punctuation-solved-clock.md); the 2013 number relationship and its source limitations are summarized in [`im-results/2013-base29-gf29-grid-factor.md`](./2013-base29-gf29-grid-factor.md).
