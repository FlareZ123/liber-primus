# 2013 omitted 180 primes and the terminal 180 known LP2 runes: direct source-paired gate

**Agent39, 12 November 2026. Classification:** a previously unindexed cross-round size correspondence and a negative original-source decoder with an all-secret fixed-codebook exclusion. **No original unknown plaintext, authentic key, cipher mechanism or destination is recovered.** The historical source's authenticity and its relation to LP2 remain open.

## A new independent way to select 180, and its weakest link

A surviving transcript of the 2013 first-onion Telnet command `primes` jumps straight from **71 to 1229**, omitting every prime from **73 through 1223**. Those are exactly the primes with **one-based ordinals 21 through 200**, a contiguous **180-prime** interval. This is documented in the archived 2013 walkthroughs [neuroretransmit, first-onion `primes` output](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md) and [scream314, unused hints](https://github.com/scream314/cicada3301/blob/master/hints_never_used.md). The same source reports doubled spaces near primes 29/31 and 3257/3259, but supplies **no explicit rule to apply the missing primes to the later book**. These witnesses are community transcriptions of a historical service, not fresh independently signed 3301 bytes. The missing run may reflect deliberate editing, a server defect or a transcript loss.

This matters because physical LP2 p56 has **85 solved runes** and p57 has **95 clear runes**, exactly **180 known GP29 symbols**. The manuscript's printed p50 **32×8 = 256-cell** number table contains a **30×6 = 180-cell interior** and an exterior perimeter of **76 cells**. Original p55 has **76 ciphertext runes**. Thus three **independently published numerical lengths** support an attractive conditional 180-known/76-unknown terminal layout. The repository had already identified the p50 ring and last-three-page correspondence but had no independent 2013 missing-prime source for the length 180.

The critical selection problem remains: nothing in the preserved 2013 transcript specifies its 180-number gap as a future LP2 key, or instructs identifying it with the 180 solved terminal symbols. The source p55 first rune completes a word begun on p54, so the final three pages do not form a clean self-contained 256-rune plaintext block. An exact count discovered after looking at both artifacts **cannot by itself validate the placement or cipher**.

## A single source-ordered original decipherment attempt

Use only natural **increasing omitted-prime order** and **printed left-to-right, top-to-bottom interior grid order**. The 2013/14 authentic BASE29 and p56 prime-totient cipher provide a minimal GP29 conversion:

\[
D_i=(B_i-(q_i-1))\bmod29,
\]
where \(B_i\) is the printed inner table cell interpreted as a base-60 byte and \(q_i\) is the \(i\)-th omitted prime.

The known target is p56's established plaintext (with its sole literal F at index56 skipped by the genuine p56 encryption prime clock), followed by p57's original clear text. No unknown p55 input, learned key, phase, grid orientation search or language-model score enters this 180-symbol comparison.

| Fixed source test | Exact matches |
| --- | ---: |
| \(D_i\) against known **plaintext** p56–57 | **4/180** |
| \(D_i\) against the **original printed** runes p56–57 | **5/180** |

This direct transfer fails. A simpler use of the first 76 omitted primes as p55 prime-totient shifts also produces nonlinguistic ciphertext-like output, GP29 IoC **0.03824561403508772**, beginning `WCANIATHTHAIAMTHNGONOEATWAEWYU...`. Those 76 prime slots are not source-selected independently, so this is a diagnostic, not a new decoding mechanism.

## Exact all-secret two-residue lookup obstruction

Could an **unknown static lookup table** rescue the matching inner-grid and missing-prime inputs without guessing its entries? Consider **any** function

\[
\operatorname{GPplaintext}_i=F(B_i\bmod29,q_i\bmod29)
\]
with 841 completely unrestricted secret outputs. Identical input pairs must have identical output runes, regardless of how nonlinear the table is. The 180 original source-paired inputs occupy **166 distinct pairs**, but **14 repeated input pairs require incompatible known output runes**.

A concrete contradiction arises **entirely within p56** in the source's 0-based table coordinates:

- Interior index33, grid row6 column4: printed byte86, omitted prime251, requires known plaintext GP index18. Input residues are (28,19).
- Interior index52, grid row9 column5: printed byte144, omitted prime367, requires known plaintext GP index1. Input residues are also (28,19).

No single memoryless function can output both 18 and 1 from (28,19). Inside solved p57 alone there are **two further independent conflicting pairs**; the cross-page model has fourteen. This excludes the entire unconstrained stationary **29×29 source-residue lookup family** on the fixed source order, stronger than failure of one particular additive cipher. It does not exclude a mapping that uses the *full* byte/prime, position, changing state, another grid traversal, or a separate decoder for each page.

## Consequence and direct reproduction

The 2013 omission is now a concrete additional **historical key-material candidate** for the terminal grid hypothesis. It is worth retaining as source context, while the only direct, minimally specified original-cipher decoder and even its unlimited stationary pair-codebook generalization fail. There is no reason to search fitted offsets, invented hidden substitution layers or all possible cell permutations on this count correspondence alone.

The self-contained [Node.js 22/CommonJS reproducer](../sims/lp2_2013_omitted180_prime_terminal_gate_sft.cjs) builds the exact missing-prime interval, reproduces the p56 genuine totient inverse and p57 clear control, uses every one of the 180 table interior cells, asserts both direct match counts, proves all 14 codebook contradictions and page-local subcounts, and tests an **exactly invertible 180/180 synthetic affine positive**. It passed the [manual original-input GitHub Actions run 43312071794](https://github.com/FlareZ123/liber-primus/actions/runs/43312071794). No authoritative `results/README.md` change follows because neither a plaintext nor an independently selected consumer was recovered.
