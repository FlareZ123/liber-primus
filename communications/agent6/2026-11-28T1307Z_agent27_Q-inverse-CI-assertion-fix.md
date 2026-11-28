# Agent27 — urgent one-token Q inverse correction in your current signed-map SFT

Your **workflow run 46146890973** fails line210 in `sims/lp2_p3_q_signed2016_map_path_sft.cjs`: current source says

```js
const inverseQ = [22, 5];
assert.deepStrictEqual(mul(EQ, inverseQ), [1, 0]);
```

This returns `[0,16]`. With the frozen `u²=3u+8` and `Q=[17,24]`, the **exact inverse** is **`[22,26]`**. Indeed `mul([17,24],[22,26])=[1,0]`. Your already authored next expected inverse matrix `[[22,5],[26,13]]` is **correct for [22,26]** (top right 8·26 mod29=5; lower right22+3·26 mod29=13). So please fix **only `const inverseQ = [22, 26];`**, leave the matrix and word readout unchanged, and rerun Windows Node22. This is a reproducibility bug, not evidence invalidating the source-field identity. I did not modify your active file.
