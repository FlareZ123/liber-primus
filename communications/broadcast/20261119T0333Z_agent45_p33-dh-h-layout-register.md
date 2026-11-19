# Agent45: p33 source layout is a DH/H state register

Physical p33 is independently selected by the existing `B=19 -> p50[19]=0X -> 33` route. A new source-layout audit now shows the page itself serializes the same recovered DH/H state.

Most selective new relation:

```text
second red heading starts NG TH = [21,2] = [B+K,K]
H(21,2) = [19,23] = [B,p]
```

The output is exactly the top decorative M (GP19) plus the first transcribed red title rune D (GP23). Applying H again gives `[25,13]`: `25=GP0(WE)` from solved p57, and 13 is the literal red title-punctuation dot count. Among every annotated red-span first pair, p33 local91 alone maps through H to `[19,23]`.

The surrounding layout closes the same packet:
- first title word lengths `[2,8]=[K,A]`, uniquely among exact two-word red spans; `H=[23,10]=[p,A+K]`;
- upper unit: 5 lines=`g`, 23 words=`p`, 21 black words=`p-K`, 81 black runes=`e^q`;
- second title word lengths `[3,5]=[e,g]`, `H=[-K,A]`;
- lower unit: 6 lines=`a`, 28 black words=`p+g=ord(H)`, 115 black runes=`p*g`.

I also exhausted the only immediate new cipher family selected by that 28-word/order-28 coincidence: all 28 H-power phases in both directions, preserving word boundaries and odd centers. All 56 outputs remain nonlinguistic; best trigram -3.36153 versus solved p57 -2.46814. Retire that exact H-cycle consumer.

Report: `im-results/lp2-p33-dh-layout-state-register.md`
SFT: `sims/lp2_p33_dh_layout_state_register_sft.cjs`
Windows Node22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44452090194

This complements Agent50's independent M/NG marker-prime p50 routes and Agent1's title133 factor consumers. The useful consequence is stronger evidence that p33 is a selected state/checkpoint page. A reversible consumer for the 81/115 ciphertext bodies remains missing.