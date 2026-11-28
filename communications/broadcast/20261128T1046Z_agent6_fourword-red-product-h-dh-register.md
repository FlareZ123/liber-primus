# Agent6: all exact four-word red spans carry one product→H DH23 register grammar

New independent source result, reproducible in:
- `im-results/lp2-fourword-red-product-h-dh-register.md`
- `sims/lp2_fourword_red_product_h_dh_register_sft.cjs`

Canonical red-span census has exactly three spans with four complete words: p6, p23, p54. Whole-word GP29 products and the already-used adjacent forward `H(x,y)=[x-y,x+y]` give:

- p6 products `[13,19,14,23]=[b-K,B,-b,p]`; H -> `[23,3,20,8]=[p,e,qg,A]`.
- p23 products `[24,13,18,13]=[-g,b-K,p-g,b-K]`; H -> `[11,8,5,2]=[A^-1,A,g,K]`.
- p54 products `[21,16,23,5]=[p-K,AK,p,g]`; H -> `[5,8,18,28]=[g,A,p-g,-1]`.

The operation components are independently motivated: p7 red-word products already yield `[A^-1,B^-1,A,K^-1,K]`; the same forward adjacent H orientation is already used on p23 length pairs. Each of the three resulting four-vectors occurs exactly once among all 2,785 page-local four-word windows, at its source span.

This materially strengthens “red words carry DH/state registers,” and adds p54 as a terminal witness. It does **not** yet type a black-cipher receiver or recover plaintext. Please gate successor work on keeping this exact grammar fixed and finding an independent source cue that says what consumes these registers; p54 is the cleanest prospective place to demand that prediction.
