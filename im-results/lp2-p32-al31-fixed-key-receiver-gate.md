# p32 receiver gate: the fixed AL=31 / p31 key does not decode p32

**Agent35, 21 November 2026. Classification: bounded negative on one source-motivated key transfer.** No unknown plaintext, authentic global key, or final destination recovered.

## Question and causal path

The candidate key route already has three independently described components:

1. The conditional p23 reading **THE ORIGIN | AL** points to the historically published Thelemic value **AL=31**. The page-label-to-T-cardinal step remains a hypothesis, not an authenticated Cicada instruction. See the p23 AL=31 source report: lp2-p23-origin-al31-readout-key.md.
2. AL=31 selects physical p31. Its unique equal-chunk line pair with lower-to-upper rune-count rise K=2 is lines 0 and 6: five chunks each, 21 and 23 runes. The solved p56 positive-cardinal serializer maps [5,21,23] to [10,14,24], and the fixed H3 inverse gives key **[17,14,7]**. The original p50 cell 31 is hex **2D**, ASCII minus, fixing the subtraction sign. The existing local controls are p31 word32 AND and p33 word29 YOU. See the p31/p33 report: lp2-p31-and-p33-you-rise-will.md.
3. Separately, the 2016 word-map / p50 functional-graph route selects p32 as a navigation destination: **EPIPHANY SEEKS THE DEVOTED → p32**. This is a receiver candidate, not itself a decipherment. See the p50 graph report: lp2-p50-functional-graph-2016-wordmap.md.

This makes p32 a reasonable untouched receiver for one direct test of the already fixed key. It does **not** establish that the p31 key should repeat on p32. That clock choice is the remaining hypothesis being tested here.

## Frozen input and operation

Inputs are the repository's original canonical resources:

- resources/liber-primus/lp2-transcription.txt, Git blob 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7
- resources/liber-primus/lp2-corpus.json, Git blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165
- resources/liber-primus/base60-grid.json, Git blob 4698c0806e6bab06a39cfbc3c3283b862de58b35

Physical p32 is the 121-rune page in transcription segment 32 (original archive image 49.jpg). The exact key is not fitted to p32: [17,14,7] is derived from p31's original line geometry and p56 T serializer; the sign is fixed by p50[31]=2D.

Use the standard additive GP29 inverse:

\[
P_i = C_i - k_{i\bmod 3} \pmod {29}.
\]

The solved p56 F-transparent convention is retained: a literal F rune passes through unchanged and does not consume a key position. No key, sign, phase, permutation, or offset is searched.

Only two simple page clocks are tested:

- **Continuous:** repeat [17,14,7] over the page's rune stream; preserve F without advancing the key.
- **Word-reset:** repeat the same key from phase zero at each printed hyphen/period word boundary; printed line wraps (slash and whitespace) do not reset it; F remains transparent.

These are exploratory transfer conventions, not author-authenticated clocks. No other key/sign/phase/layout family is tested.

## Result

p32 has **121 runes**, of which **4** are literal F and **117** consume the key.

Original p32 GP29 index IoC is **0.03415978**. The two fixed outputs are:

### Continuous page clock

~~~text
O-BEM-JDAEPIA-MWUMOEOIAHJOEP-SMBUF/
-PYEABF-FAEX.DAETHRWMNHOFN-XFIAL/
OI-FGAEYTHMTHNG-AMFLX-OEIIAMWIF/
B-POUJ-OEXPDCRPNGD-UGXTH-SRE/
EOFTTIA-OR-JMS-UA-THMNGDOIAEN-TN/
FDTH-BEOC.
~~~

- 117 key advances; output IoC **0.03622590**.
- No exact word among the seven authenticated three-rune 2016 targets PATH, WAY, ITS, ARE, MAP, AND, YOU.

### Word-reset clock

~~~text
O-XJF-HTGIL-MWUMOEOIAHJOEP-COEALO/
-IMNXF-FSB.LEEOUFFGUPFG-ROCI/
GB-MNTHHFNNCEA-XOEWIB-MOHTFLY/
I-POUJ-MWDLIAXIXR-IAEAAEA-CWAE/
THODGU-FY-JMS-UA-NGOEEAPGBSEO-PTH/
FREA-WNGIA.
~~~

- 117 key advances; output IoC **0.03429752**.
- No exact word among the same seven authenticated three-rune targets.

The outputs do not produce recognizable English plaintext. The IoC changes are small and do not approach the clear solved-page control regime; IoC is reported as a descriptive check, not a standalone language test. The known p31 AND and p33 YOU local controls still reproduce under the unchanged key/sign, so this is not an implementation failure.

## Decision

Reject the **simple repeated [17,14,7] key transfer to p32** under both continuous-page and printed-word-reset clocks. This closes a concrete next consumer of the AL=31/p31 key hypothesis; it does not refute the conditional AL=31 source route, the p50 navigation to p32, or other p32 operations. In particular, the p32 tree illustration does not by itself select another key schedule, and no alternative traversal or key family is proposed here.

Do not expand this into phase, sign, permutation, reset, or key searches without a new original source instruction. The strongest current positive remains a small local structure: p31 AND, p33 YOU, then p33's THEIR RISE to WILL. No complete unknown page is decrypted.

## Reproduction

Run from the repository root:

~~~sh
node sims/lp2_p32_al31_fixed_key_receiver_gate_sft.cjs
~~~

The source-locked script reconstructs the p31 helper packet and key, checks the p31 AND / p33 YOU controls, verifies p50[31]'s minus sign, and reproduces both p32 outputs and their statistics.