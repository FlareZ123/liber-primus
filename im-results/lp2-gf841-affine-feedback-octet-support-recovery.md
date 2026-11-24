# GF841 affine-feedback key recovery from typed BASE29 octet support

Director #2535, Agent5, 2026-11-24.

## Source and exact conditional model

The visually grouped original pp33–39 contains 1,680 GP runes = 840 pairs, the multiplicative-group order of GF(29²). The previously developed representation u²=3u+8 and the signed 2013 BASE29 conversion supply the conditional field and integer conventions (see the existing p33–39 field and whole-stream BASE29 gates). A typed two-digit octet is a different intermediate register from source-native prose. The source does not explicitly prescribe octet framing or this cipher.

Read each pair as high*u + low, represented by integer 29*high+low. Let P_i be a BASE29-padded octet (0..255). The proposed dynamic reversible law is C_i = a P_i + b C_(i-1) + d in GF(841), a nonzero, C_(-1)=0. All three parameters are unknown; 840*841²=594116040 keys (29.146 bits). This is distinct from a fixed pair permutation, a fixed field-power clock, the reciprocal feedback family, and a native-prose Hill fit. For uniformly distributed candidate field outputs, the support restriction offers log2(841/256)=1.716 bits per observation, though shared-key dependencies mean this is not an independence-based proof.

## Complete attack

For each b in 0..840 compute R_i=C_i-b C_(i-1). A valid key implies R_i=a P_i+d, a fixed bijection on 841 field values, so the residual support cannot exceed 256 distinct elements. For each surviving b enumerate every nonzero inverse multiplier ai and every field offset e; retain precisely those with all ai R_i+e in 0..255. Recover a=ai^-1 and d=-a e. This is full exact key inference, not a frequency or language ranking. The support obstruction also excludes any fixed bijection of residual pairs to octets for this feedback form.

Freeze 600 pairs for inference and 240 for continuation. A deterministic xorshift32 byte plant (seed 0x0c1cada3) has a hidden synthetic key a=445,b=127,d=713. Inference receives only training ciphertext. It identifies b=127 alone (236 distinct residuals); the subsequent affine-support intersection identifies exactly one full key, the true key. Decode the unseen 240 pairs with that key: 240/240 correct original plant bytes, no parameter retuning.

## Original

On the first 600 actual pairs of pp33–39, **the minimum residual cardinality over all 841 feedback multipliers is 404**, attained at b=800. Not a single multiplier is compatible with 256-valued octet support. Thus no affine key exists and there is no original candidate to predict the 240-pair holdout. The contradiction requires no English model or frequency significance test. It does not extend to arbitrary time-varying feedback or unspecified alternative framing. The original chapter remains undeciphered.

Reproduce with `node sims/lp2_gf841_affine_feedback_octet_support_recovery_sft.cjs`. Executed exact algorithm against the repository corpus in this invocation; no CI run claimed.
