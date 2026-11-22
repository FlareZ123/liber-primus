# Agent22: NUMBERS/PRIMUS source-state architecture and new plaintext candidates

Run: agent22-gpt5.6sol-20261119T014722Z-draw7-d76b962f1779

## Strongest new source-only result: NUMBERS direction opcode

Authenticated 2016 source word NUMBERS has GP0=83, so p50[83]=3D. Base59/base60 with one-based p0 semantics land adjacent starts189/192, lengths [3,4], exactly matching the two immediately preceding signed-source GP lengths AND/THEIR. Complete charge over every authenticated source occurrence and both receiver origins:

- only PRIMUS, NUMBERS, OPENPGP produce any adjacent dual-radix p0 word-start pair;
- only NUMBERS matches its two preceding source-word GP lengths.

The immediately preceding p0 word183..188 has exact H shell
[K^2,p+K,K^2,g+K,p+1,B] = [4,25,4,7,24,19], unique among all 252 complete six-rune unknown words; its coordinate sum is 83=GP0(NUMBERS). Among the three dual-radix source cases, only NUMBERS has predecessor-shell-sum = source GP0.

The token 3D is uniquely (e,p) among authenticated source-address tokens: high digit3=e, GP(D)=23=p.

## AND is now deterministically source-derived

From the predecessor terminal B and token H(p,e)=[p-e,p+e], form odd key shell [B,p-e,p+e]. Inverting its outer H pair gives [g,b], so the key is deterministically [g,p+e,b]=[5,26,15]. It decrypts p0 189..191 to AND.

A complete 84-key charge [x,H(p,e)[j],y] over distinct x,y in {g,a,b,A,B,K,e} had exactly one authenticated three-rune hit, the same AND key.

## THEIR is strongly constrained but PATHS remains competing

For p0 192..195, the complete 98-key family [H(p,x)[j],p,K*y,y] over the same seven state variables yields exactly one authenticated four-rune hit:
THEIR with key [p-a,p,K*g,g]=[17,23,10,5].

Its key shell is [K*a,p-1,p-K*g,K^2]. This is much tighter than the older post-target distinct-field grammar, but the independent PATHS inverse at the same receiver remains a live competing model.

## NUMBERS receiver returns to READOUT

ROAD zero-bracket geometry independently selects the seven-rune p0 receiver228..234. Raw H shell:
[b-a,K*a,A+e,B,H(A,B)[0],g,a-g].
Exact shell unique among 214 seven-rune unknown words. Shell sum75=GP0(READOUT), and p50[75]=2v base60=177, exactly the independently fixed center of whole READOUT 166..188. Existing B-boundary join and (A,K) selector then return to THE ROAD.

The exact NUMBERS key has H shell
[b,H(K,b)[1],A+a,A+a,H(K,b)[1],p+e,p-K*g];
among authenticated seven-rune targets DEVOTED/NUMBERS/OPENPGP only NUMBERS has the charged mirrored-core + state-expression property. Criterion is retrospective, so NUMBERS remains strong candidate rather than promoted plaintext.

## PRIMUS state pair and IS

GP0(PRIMUS)=62 -> p50[62]=24. Base59/base60 zero-based outputs land adjacent p0 starts122/124. Their raw H shells are:
[H(A,B)[0],b] and [H(A,B)[1],p+K,p-K].
Exact ordered pair unique among all 123 adjacent 2->3 unknown pairs and reconstructs A,B,p,K,b,e.

Generic charged rule over all 123 pairs: reverse the right three-rune shell's outer coordinates and use them as the two-rune additive key. Scoring authenticated two-rune targets THE/IS/BE gives exactly one hit, IS at p0 122..123.

Adjacent p0 word124 decrypts to independently reconstructed WAY with compact key [B,p+e,K]; local key order remains target-aware.

## Source triad

The complete dual-radix qualifying source set is PRIMUS, NUMBERS, OPENPGP at signed-word indices 10,26,42, exactly 16 apart. Their raw base60 outputs reduce mod29 to [A,B,e]; base59 outputs reduce to [a,H(K,b)[0],F]. This is value-free with respect to candidate receiver plaintexts.

## Reproduction

- sims/lp2_road_numbers_readout_state_bridge_sft.cjs
- im-results/lp2-road-numbers-readout-state-bridge.md
- sims/lp2_primus_is_way_state_pair_sft.cjs
- im-results/lp2-primus-is-way-state-pair.md
- sims/lp2_their_state80_will_found_bridge_sft.cjs
- im-results/lp2-their-state80-will-found-bridge.md
