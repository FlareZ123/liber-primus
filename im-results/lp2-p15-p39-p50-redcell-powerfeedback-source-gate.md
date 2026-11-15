# Original LP2 p15/p39/p50 quotient with ciphertext-powered red-cell feedback

**15 November 2026, Agent18, Director #1173.** One explicitly reversible, ciphertext-dependent four-state decoder, plus two fixed causal-feedback comparators, was run on the unmodified 1,680-rune p33–39 chapter. None recovers coherent unknown plaintext, and all three independent 3,008-rune p40–53 tests remain ciphertext-like. This is a **bounded original-input negative**, with an exact statement about why the original source algebra by itself cannot select a noncommutative operation. No creator key or final destination was recovered.

## Original evidence and candidate human solve path

The [physical p15 image](../resources/liber-primus/32.jpg) prints a four-by-four Fibonacci-prime magnitude square and marks the **red 3299** cell in row 2, column 2. Inferring the two mathematical signs lost to absolute values yields this fixed signed matrix over GF29:

    M = [10  3 20 22;
          1 22 21 25;
         11 17 19  7;
          8 12 12 22].

The signs are inferred, not printed. The [physical p39 image](../resources/liber-primus/56.jpg) prints a red three-rune segment at local offsets 119–121 with original GP29 indices [27,5,15]. Its monic quadratic is (X−24)^2 = X²+10X+25 over GF29. The unchanged [256-cell physical p49–51 table](../resources/liber-primus/lp2-grid-256.json), conventionally parsed as row-major base60 bytes, has SHA256 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290. Its high-first coefficient polynomial divides exactly by the p39 quadratic. Evaluating its complete 254-slot quotient (including leading zero) at signed M gives:

    R = [21 27 22  0;
         28 10 13 22;
         12  0  9 13;
         12 24  7  3].

R is invertible. This source-derived quotient and its already-negative direct Hill4 reading are established in the [prior original-cipher report](lp2-p55-p50-quotient-p15-hill4-original-gate.md). The present test asks whether the same visibly linked objects could instead define a changing-state, ciphertext-controlled cipher.

The source gives **three** p39 red glyphs, not an entire four-rune initialization. Freeze the explicitly provisional seed s0=[0,27,5,15], prepending the GP index F=0. Read the scalar from the same highlighted p15 red-cell coordinate, zero-based index 1. The choices of F prefix, a state cipher and a start on physical p33 are all **unprinted inference**, not Cicada-authenticated instructions.

## Three fixed reversible originals and untouched holdout

The distinct primary operation is a current-ciphertext-powered source quotient:

    k_i = s_i[1]
    P_i = C_i - k_i (mod 29)
    s_(i+1) = R^(C_i) s_i (mod 29).

Encryption works online with exactly the same state: emit C=P+k and then advance by R^C. This is reversible across all 29 GP symbols and uses no extra escape channel, key search, fitted alphabet or tuned phase. The source does **not** instruct readers to exponentiate a four-rune quotient matrix by each ciphertext rune. The historically authenticated 2013 modular exponentiation example is over an ordinary integer DH group, and does not specify this LP2 application.

Two frozen comparators use the same quotient, red-cell coordinate, source triad and seed but different causal feedback inputs:

    s_(i+1) = R s_i + C_i e_1 (mod 29)
    s_(i+1) = R s_i + P_i e_1 (mod 29).

These demonstrate that the independently visible inputs leave multiple apparently natural, fully reversible state updates. Neither source selects a feedback input, state clock, IV or downstream plaintext register.

The original target is the full physical p33–39 chapter (1,680 GP29 runes) and the independently withheld section is physical p40–53 (3,008 runes, including its red heading). All input runes were used in original order, without correcting printed text. Each rule encrypts authentic clear p57 95-rune text and recovers the complete 95/95 plant, then forward-reencrypts **all original ciphertext symbols** of both targets exactly.

| Frozen candidate | p33–39 output IoC | p40–53 output IoC | Known native GP plant | Exact original reencryption |
| --- | ---: | ---: | --- | --- |
| Unchanged original p33–39 ciphertext | 0.034360021555 | n/a | n/a | n/a |
| **Ciphertext-powered R^C** | **0.034718795201** | **0.034405314904** | 95/95 | 1,680 + 3,008 |
| R·s + current cipher C·e₁ | 0.034209705323 | 0.034375464342 | 95/95 | 1,680 + 3,008 |
| R·s + current plain P·e₁ | 0.034394055418 | 0.034406641596 | 95/95 | 1,680 + 3,008 |

The primary candidate's opening 40 output GP symbols are:

    AE G J B T Y L EA S P N EO C NG F W I N A P B E E AE S O D F W AE W TH Y I AE N EA B EO M O S

The ciphertext-injection rival begins:

    AE L Y T OE O S R B IA O EA X H B EA R E B X IA F NG G G IA F NG EO EA Y TH B AE N J X U TH T

These are non-prose in source-authentic GP orthography. All complete original and holdout distributions remain very close to the uniform GP29 IoC reference 1/29 = 0.0344827586. Exact reencryption is mandatory for implementation correctness, but is automatic for every key in a bijective family and is not itself decipherment evidence.

## Exact algebraic limitation and research decision

**Every polynomial evaluated on the single source matrix M commutes with every other polynomial evaluated on M.** The entire algebra GF29[M], including the quotient R, is commutative: specifically, R·M=M·R. Therefore building only polynomial functions from p15 M, p39 G and p50 P cannot generate a noncommutative matrix operator. A genuinely noncommutative update would need an independently selected non-polynomial matrix or state action. A nonlinear update such as R^C likewise needs an unprinted exponent selector and IV.

The source arithmetic is exact *conditional on the inferred sign restoration and table reading*, while the core missing creator instruction remains unfound. The p39 triad does not supply the fourth IV symbol or any instruction selecting cipher feedback, plain feedback, exponent input, first receiver, scalar output and clock. No tested mechanism recovers original unknown GP plaintext. More powers, phases, secret S-boxes or hidden-seed sweeps would fit this gap rather than resolve it.

**Director #1173 decision:** retire only these F-prefixed red-cell quotient-state candidates. Preserve the original algebraic factorization and source-visible red 3299 clue as provisional. Revisit a changing-state interpretation if an independent first-party instruction fixes its missing operand and IV, or a credible authentic unknown plaintext crib permits a locked original-cipher prediction. This study does not exclude all nonlinear LP2 ciphers.

**Reproduce:** [standalone original-corpus Node22 CommonJS SFT](../sims/lp2_p15_p39_p50_redcell_powerfeedback_sft.cjs) recomputes the exact quotient from the full original table, checks R·M=M·R and all recovered IoCs, confirms 95/95 native-GP planted positives and both original reencryption checks. The existing [Agent18 manual workflow](../.github/workflows/agent18-p15-ambiguous-f-allstate-manual.yml) now accepts the redcell target without enabling automatic per-commit CI.
