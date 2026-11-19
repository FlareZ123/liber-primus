# P40 same-diagonal EMPTY-center receiver is a unique p±1 state packet; p36 GOOD codec does not transfer

**Agent4, 19 November 2026. Classification: target-independent state/navigation packet plus a decisive prospective transfer failure.** The p36 EMPTY-center result suggested one sharp holdout: look for another canonical five-rune object whose literal center is authenticated `q=4=EMPTY` and which is independently selected by the same one-based source-number/page-word diagonal.

Exactly one such second object exists. It is p40 canonical word41, source-assigned to signed word40 **PATHS**.

## Frozen receiver family

The established one-based diagonal reads zero-based source word `i` at physical page `i`, canonical one-based word `i+1`.

Across all 318 canonical five-rune words on unknown pages, exactly nine have center rune `q=4`: p2 word9, p5 word37, p8 word22, p17 word17, p18 word57, p36 word37, p39 word24, p40 word41, and p49 word16.

Only two are simultaneously on the same page/ordinal diagonal: `p36 word37 -> signed36 GOOD` and `p40 word41 -> signed40 PATHS`. P36 is the already published GOOD receiver. P40 is therefore the sole untouched same-family holdout.

## P40 state packet before plaintext

P40 word41 occupies offsets171..175 with `C5=[0,23,4,28,6]`. Fixed outside-in H5 gives `H5(C5)=[23,24,4,22,6]=[p,p+1,q,p-1,a]`.

This is target-independent. The shell is also unique under a finite authenticated-state family. Draw `x,y` from the nine DH fields and charge `[x,x+1,q,x-1,y]`. Across `9×9×318=25,758` shell/word comparisons, one hit survives: `x=p, y=a`, p40 word41.

Literal EMPTY-center deletion gives `C4=[0,23,28,6]` and `H4(C4)=[23,24,22,6]=[p,p+1,p-1,a]`. The two middle values span exactly `(p+1)-(p-1)=2=K`, matching the independently established p40 red-title RISE magnitude. That relation is descriptive here and is not used to claim plaintext.

## Prospective p36 codec transfer fails

The p36 decoder was frozen before this holdout was evaluated: key `[25,19,27,26]`, subtraction. Applied unchanged after EMPTY-center deletion, `[0,23,28,6]-[25,19,27,26]=[4,4,1,9]`, which is neither PATHS nor any authenticated four-rune source word.

The full narrow p36 family is all 24 permutations of `{THEIR1=19, THEIR2=25, NUMBERS=26, ARE=27}` under both signs. Exhaust all 48 operations on the held-out p40 receiver. There are zero authenticated four-rune outputs. No alternate ordering rescues the transfer.

Thus the p36 EMPTY-center source-number codec is local. P40 does not support a universal decoder claim.

## Relationship to the existing p40 PATHS candidate

P40 already has a separate independently selected four-rune PATHS receiver at offsets71..74, `[4,15,14,21] -> PATHS`, under the published exact-GP0/source-state selector and local inverse. The new q-centered object is at offsets171..175 and was selected by a different route. Keep these objects distinct.

For reference only, if one target-conditions the new emptied receiver on PATHS, its exact subtraction key is `[16,28,26,20]`, with `H4(key)=[25,2,25,7]=[p+K,K,p+K,g+K]`. That shell is compact and compatible with the page's RISE=K theme, but it was recognized after assigning PATHS. It is not promoted as a decoder without an independent rule selecting the repeated `p+K` shell.

## Decision

Preserve p40 word41 -> `[0,23,4,28,6]` -> `H5=[p,p+1,q,p-1,a]` as a manuscript-unique, target-independent state packet selected by the same diagonal/EMPTY-center family that produced p36 GOOD.

Also preserve the prospective negative: the p36 EMPTY-center direction-number decoder does not transfer to p40.

This sharpens the intended-route model. The center marker and diagonal can select state-bearing objects on more than one page, while the local plaintext key schedule may be receiver-specific. The existing p40 PATHS candidate at offset71 remains independently supported. Do not call word41 PATHS plaintext until a source-visible operation derives its key before using the target.

## Reproduction

`node sims/lp2_p40_empty_center_state_holdout_sft.cjs`
