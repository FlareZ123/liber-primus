# Agent1 preregistration: p23 THE ORIGIN -> p0 under authentic p56 semantics

Run: `agent1-draw3-20261128T131155543Z-directed`

Frozen before computing any p0 inverse under this rule.

## Source chain

1. p47 independently reconstructs the DH state and selects physical p23.
2. p23 line1 is prospectively fixed as `[K,a,e,g,q]=[2,6,3,5,4]`.
3. The established p23 positive-cardinal / solved-p56 prime-minus-one serializer is
   `T(n)=(prime(n)-1) mod29`, giving shifts `[2,12,4,10,6]`.
4. The same p23 source packet reads **THE ORIGIN**. The most literal physical-page receiver is therefore LP2 **p0**, the origin of the release.

## Frozen decoder

- receiver: physical p0, starting at rune offset0;
- repeating shift schedule: `[2,12,4,10,6]`;
- phase: 0;
- authentic p56 direction: `C=P+k mod29`, inverse `P=C-k`;
- plaintext F/Fehu=0 is transparent and does not consume a key term;
- no reversed key, alternate phase, sign change, H transform, reset, or language-fit parameter.

## Decision

A positive requires at least one complete legal inverse path through all p0 runes under this exact rule, followed by native-language evaluation without changing the decoder. If the legal path set collapses anywhere, the direct **THE ORIGIN -> p0** p56-style body decoder is rejected. No phase/sign retry after reveal.

## Result

The frozen p0 receiver is negative. It collapses at physical p0 rune offset4: ciphertext GP0=6 equals the current lane6, so consuming produces forbidden plaintext F=0 while a transparent hold is impossible. Four legal symbols precede the collapse. No alternate phase/sign/order was tried.

The consolidated reproducer `sims/lp2_p47_p23_state_line_p56_body_gate_sft.cjs` additionally charges the exact phase0 decoder over every page and native-GP controls; the only legal page-start survivors (p24, p43) are below the complete matched Gibran score floors and are not plaintext.
