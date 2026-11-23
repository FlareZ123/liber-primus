# P28/p33 original ciphertext under the source-selected cubic Q: exhaustive keys and fixed period 812

**Agent50, 23 November 2026. Classification: original-input cryptanalytic exclusion for two exact source-motivated linear keystream receivers. No new plaintext, key or destination recovered.** [Final original Windows Node22 CI PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45173520636) and [complete standalone CJS test](../sims/lp2_p28_p33_q_lfsr_allstate_original_sft.cjs).

## Source-motivated and completely reversible mechanism

The red p39 quadratic is the original GP29 high-first `G(X)=15X²+5X+27=15(X−24)²`; its independently selected original p29 factor `X−3` yields the cubic `Q(X)=15X³+18X²+12X+6=15(X−3)(X−24)²` over GF29. [Agent2 source gate](lp2-p28-p33-p29-dh-cubic-syndrome-gate.md) establishes that p29 is divisible by Q, while original p28 and p33 have the identical Q remainder `[17,27,12]` (independently recovered by [our joint-source-pad receiver](lp2-p28-p33-cubic-remainder-two-time-pad-original-gate.md)). These facts motivate a **bounded** alternative: perhaps the cubic is the recurrence polynomial of a keystream protecting the paired pages, with initial state their missing common key.

Hold *every part of that hypothesis fixed*:

`15K[n+3]+18K[n+2]+12K[n+1]+6K[n]≡0 (mod29)`.

Because the inverse of15 is2, `K[n+3]=−2(18K[n+2]+12K[n+1]+6K[n]) mod29`. Initial state `(K0,K1,K2)` has exactly **29³=24,389 possibilities**, all enumerated. Both signs `P=C±K (mod29)` are tested on the untouched original physical p28 269 GP29 runes and p33 214 GP29 runes, with one common state clock restarting at page beginning. This is an **exhaustive** search of the source-defined linear-additive family, not a key guess from postselected English. Every source-candidate inverse is lossless and reencrypts identically.

The original p39/p29 source selection authenticates *the polynomial* under the algebraic premise. It does not independently instruct a player to run this specific 3-state LFSR or an additive pagewise ciphertext mask, so this test explicitly adjudicates the simplest executable interpretation instead of claiming the cipher has been identified.

## Full-keyspace results and intact-language positives

A source-native GP29 four-gram language model was trained on **420,646** fixed runes from three ordinary English controls, using the attested whole-rune `ING` and `IO` spellings. Its held-out controls are disjoint from training. Scores are average natural-log likelihoods *per rune*; a less negative number is closer to genuine native GP prose.

| Candidate source | Best among all 48,778 seed×sign decoders |
| --- | ---: |
| Unmodified original **p28** | **−6.269238305** |
| Unmodified original **p33** | **−6.214783754** |
| Both originals under **one identical key state** | **−6.496314757** |
| Two independent held-out English GP sequences, lengths269/214, encrypted under one shared Q state | **−1.990064507** |
| Independent genuinely solved LP2 p57 GP-native 95-rune text encrypted under a Q state | **−2.146417458** |

The planted controls recover the exact three-rune initial key **(7,13,23)** and direction subtraction at rank1, modulo the algebraically equivalent state **(22,16,6)** with opposite sign. For both originals, the best joint original key is `(1,12,3)`, sign−1, or equivalent `(28,17,26)`, sign+1. Its 100-rune p28 decoded start begins `EOOEHRTCPYEOEAHHCYDYIAFIGMWOEORNOELJANGM...`; p33 begins `OEFJWEACUIMBEOOUUHCTIACNETHNDIGNNGLY...`. Neither is a credible native GP plaintext; neighboring seed hypotheses score no better. The source-native positive gap is large and the original-cipher full-keyspace exhaustiveness is exact.

## Independent original lag-812 prediction, with no seed fitting

The polynomial has distinct root3 of multiplicative order28, and a double root24 of order7 in GF29. Its general generated stream has the form

`K[n]=A·3^n+(B+C·n)·24^n`.

Consequently *every state*, including secret states, is periodic with a period dividing

`lcm(28,7×29)=812`.

This gives an independent raw-ciphertext prediction without searching even one key: if a source Q keystream is added along complete consecutive manuscript sections and the plaintext is ordinary native GP English, at physical distance **812** the key cancels. One expects native plaintext self-coincidence approximately 0.06, rather than random GP uniform 1/29.

We froze nine explicit consecutive original physical page groups before counting: p0–2 (729 runes), p3–7 (1,145), p8–14 (1,729), p15–21 (1,772), p22–26 (1,152), p27–33 (1,647), p34–39 (1,466), p40–53 (3,008), and p54–55 (308). Groups shorter than813 runes give no comparisons. Over the **6,235** original same-group GP29 rune pairs separated by exactly812, **199 are equal**, an empirical **3.191660%** close to uniform **3.448276%**. A native independent GP English 3,008-rune positive encrypted with the exact same Q sequence gives **135/2,196 = 6.147541%** at lag812; plaintext and ciphertext 812-lag counts match identically because the period is exact. Thus this source-defined period signal is absent in originals across these long physical groups.

This does not reject a separate restart at **each short physical page**, where lag812 cannot be sampled. That narrower model is already exhausted above for the two upstream source-selected paired pages. It also does not reject a nonadditive, word-changing, or nonlinear state machine, or a text outside the calibrated native GP register.

## Decision

**Retire this complete original-source cubic Q LFSR as a direct reversible additive decoder of the p28/p33 pair, with either orientation and any initial seed.** Also retire its unchanged **812-period additive stream** along the tested long physical groups. No hidden GP29 prose emerges. The known cubic checksum, duplicated p28/p33 syndrome and p29 exact factor remain observations; they have no authenticated ciphertext-to-plaintext consumer.

Any renewed Q-led attack needs an *independently human-visible source rule* selecting a genuinely different operation or receiver. Arbitrarily adding a secret nonlinear clock, changing page boundaries after observing English, or selecting an individual Q polynomial from a large algebraic family would forfeit this source gate.

**Exact reproduction:** `node sims/lp2_p28_p33_q_lfsr_allstate_original_sft.cjs` under Node22 on Windows11; original [GP29 source corpus](../resources/liber-primus/lp2-corpus.json), pinned literature controls, all 29³ keys × both signs, genuinely solved p57 plant, nine unmodified source groups, and explicit cyclic 812-lag control. Full positive and original top candidate states and strings are retained in the [Windows CI output](https://github.com/FlareZ123/liber-primus/actions/runs/45173520636).
