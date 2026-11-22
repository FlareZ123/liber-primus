# A page-29 quadratic syndrome shared with the page-39 red triad

**Agent 37, 17 November 2026. Classification: new bounded original-ciphertext arithmetic observation, not a recovered key, instruction, or plaintext.** The coincidence has a substantial null probability after screening physical pages. Do not promote it to an established encoding mechanism.

## Independent source operand and exact candidate

The source-selected quadratic in the existing [2013 BASE29 / table-factor analysis](2013-base29-gf29-grid-factor.md) is the **three-red-rune inscription on physical LP2 page 39**, with GP indices `[27,5,15]`. Its ascending-power polynomial is `G(X)=27+5X+15X^2=15(X−24)^2` over GF(29). It exactly divides the 256-byte physical p49–51 table, after reducing original row-major bytes modulo 29. The historical/source rationale for G and the full table factorization predate this experiment; no new G factor is claimed.

The independent candidate target is the untouched physical page **p29**, original scan `46.jpg`, which has **277 GP29 runes** in `resources/liber-primus/lp2-corpus.json`. Treat each page's runes as a descending-degree polynomial, in the same convention used for the table. Exact Euclidean division gives the p29 `G` remainder **[0,0]**. Across all **55 nonempty unsolved physical pages p0–55**, p29 is the **only** page with this complete zero remainder. The alternative source-derived `H(X)=3+26X+24X²`, originally from the 2013 signed `BASE29 3301 → 3QO` example, gives p29 remainder **[16,20]**, and reversing p29's rune order gives `G` remainder **[10,5]**. The positive table control has both `G` and `H` remainder [0,0].

In particular, the first 275 original p29 runes **uniquely determine** a two-rune parity suffix if the requirement `G|P` is imposed, because the divisor has a nonzero constant term and degree two. The suffix computed solely from that fixed prefix is **[8,19]**, exactly the two original page-terminal glyph indices. A one-rune mutation makes the remainder nonzero. This suffix reconstruction is algebraically the same observation as zero remainder and provides no independent evidence.

## Literal source-factor quotient does not recover prose

The immediate, fully reversible decipherment hypothesis is to **divide** the original p29 277-term GP29 polynomial by its already selected `G` factor, read the **275-term quotient** in source order as GP runes, and recognize natural language. Since `G` is degree two, there is no hidden key, phase, or variable manuscript length in this direct operation. Exact ascending-source-factor division gives a GP29 quotient beginning with indices

`[4,6,26,27,11,9,15,25,15,21,7,0,18,26,8,28,7,5,23,12,6,1,18,0,22,2,28,6,14,13]`

which transliterates `RGYIAJNSAESNGWFEYHEAWCDEOGUEFINGTHEAGXP` (digraph-aware GP rune values), with **IoC 2566 / 75,350 = 0.0340544**, indistinguishable from a near-uniform rune stream by that statistic. It has no coherent native English sentence or detected original-script command. Multiplying all 275 quotient terms by G exactly reconstructs **all 277 original p29 ciphertext indices**; this controls the algebra without selecting or repairing glyphs. The exact control and first thirty indices are now asserted in the same reproducer.

This directly tests the simplest potential ciphertext consumer of the three-red-rune clue and rejects its plain-GP reading. It does not exclude G as an error-detection factor, an operator embedded inside another cipher, or a key derivation ingredient; all those require an independent instruction before further work.

## Why it is not yet an encoding mechanism

The simple independent-uniform-symbol null assigns a probability `1/29²=1/841` to a fixed page having zero degree-two remainder. Checking 55 nonempty original physical pages would then produce at least one match with probability `1−(840/841)^55≈0.06334`. This is a comparison reference, not a calibrated significance value: the original source may have non-independent runes, the examined G was known from past analyses, and many other factors and segmentation schemes have been studied. There is no source instruction selecting p29 as a checksum register or placing two parity glyphs at its end.

Crucially, p29 **ends in the middle of a printed word**, continued onto p30, as preserved in the original rune-line transcription. A physically paginated original author message would require a reason to insert checksum glyphs within a crossing word. The contiguous visual chapter p27–31 has `G` remainder **[22,25]**, so the match disappears under a more natural source-text boundary. The p29 full page also fails the independently selected `H` factor, whereas the 256-byte table satisfies both; the two objects are not established instances of a common two-factor code.

Therefore this is a **low-priority intermediate constraint** worth retaining only in case future source instructions independently select p29 and `G`. It does not justify a grid-derived keystream search, correction of the original ciphertext, extrapolation to other pages, or any claim of recovered plaintext.

**Execution:** Original-source, direct-quotient and mutation controls passed under [on-demand Windows Node22 GitHub Actions run 44109800684](https://github.com/FlareZ123/liber-primus/actions/runs/44109800684), completed successfully on 17 November 2026.

**Single-file, read-only reproducer:** [`sims/lp2_p29_red39_factor_syndrome_sft.cjs`](../sims/lp2_p29_red39_factor_syndrome_sft.cjs), CommonJS Node 22; source-derived H/G factors, original corpus and base60 grid only. It asserts the all-55-page census, p29 suffix prediction, two original negative orientations, table positive and one-symbol mutation control.
