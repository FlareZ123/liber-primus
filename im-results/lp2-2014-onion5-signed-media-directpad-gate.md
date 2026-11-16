# Signed 2014 Fifth Onion media as a literal LP2 running pad

**16 November 2026, Agent20. Classification: source-rooted, bounded original-cipher negative.** No new Liber Primus plaintext, key, cipher mechanism or destination was recovered. The underlying **2014 Cicada-authored media bytes** are genuine historical puzzle material, but **reusing them as an LP2 running pad is an investigator's hypothesis**, never stated by the signer.

## Why this source offers a concrete decrypting test

The archived [original 2014 Fifth Onion signed message](https://github.com/krisyotam/cicada3301/blob/main/archives/cijhho/2014/additional%20docs/onion%205%20signed%20message.txt) begins “Very good. You have done well to come this far”, and embeds **12,007 bytes of literal hexadecimal media** before the Gödel, Escher, Bach book-coordinate handoff. The archived source is now pinned as [the byte-preserving clearsigned source](../resources/historical/cicada2014-onion5-signed.asc), making a distinct original-text contributor available without reconstructions from modern essays. The media comprise three contiguous first-party units:

| Original signed media segment | Byte offsets, half-open | Bytes |
| --- | --- | ---: |
| Gödel-themed JPEG | [0,1084) | **1,084** |
| Escher *Eye* JPEG | [1084,2719) | **1,635** |
| Bach audio (MPEG) | [2719,12007) | **9,288** |
| Complete author-authenticated binary payload | [0,12007) | **12,007** |

Each JPEG has its own original `FFD8` and `FFD9` markers; the audio starts `FFF3`. These component sizes and their historical source role are independently described in [the established Onion5-to-Onion6 reconstruction](../results/2014-onion-chain.md). The media's full first-party status provides a better key-source premise than an arbitrary literary text; the missing step is an **authored instruction to use this raw media as a GP29 pad**. The historical stage actually used them to identify GEB and derive the next onion address.

## Frozen inverse on the untouched LP2 ciphertext

Read the original 55 rune-bearing unknown LP2 pages p0–55, **12,956 GP29 rune indices**, preserving every rune and physical page. An original binary byte `b` gives either `b mod 29` or `floor(29b/256)`; the only GP29 transformations are `P=(C−k) mod29` and `P=(C+k) mod29`. Read the whole media payload and each of the three complete source components. For each, test a **book-continuous** clock or a **page-local offset-zero reset**, with each source stream repeating only after its exact original byte length. No edited source bytes, extra keys, fitted shifts, partial-language cribs, red-title offsets, cross-page edits, or alternative carrier encodings are admitted.

The finite model count is **4 sources × 2 byte projections × 2 signs × 2 clocks = 32 complete original-corpus inverses**, all implemented in [the original-input single-file Node22 CommonJS test](../sims/lp2_onion5_signed_media_directpad_sft.cjs). The source parser admits only complete hexadecimal lines strictly before the first GEB coordinate, so the signed metadata and downstream book-code labels cannot silently enter the pad.

## Original-cipher outcome

| Diagnostic | Exact GP29 pooled index of coincidence |
| --- | ---: |
| Original untouched LP2 ciphertext | **0.0344783978645** |
| Lowest of 32 source-fixed inverses | **0.0344556864316** |
| Highest of 32 inverses | **0.0345442562536** |
| Uniform 29-rune reference | **0.0344827586207** |
| Independently solved original p57 GP-native prose | **0.0627099664054** |

The highest original IoC comes from **Bach audio, `byte mod29`, positive sign, page-reset clock**. Even this postselected maximum is essentially at the uniform reference and far from the independent genuine LP2 English control. None of the 32 original full-corpus outputs has a credible GP-native English marginal or a coherent readable section. This is a **descriptive original-input result**, not a calibrated p-value for all potential cipher models.

A real solved-p57 95-rune GP plaintext encrypted under **each candidate media component, projection and clock** roundtrips exactly with the corresponding inverse: **32/32** original-register plants fully recovered. Independently re-encrypting all 12,956 original ciphertext runes after each inverse also returns their exact original values: **32/32**. The recipher test establishes arithmetic reversibility; the positive controls establish correct recovery for the tested family when its key is actually used.

## Decision and next meaningful step

**Retire the literal raw-byte pad of the complete 2014 Fifth Onion signed media and each of its three author-defined component boundaries** under the declared zero-phase additive GP29 projections and page/book clocks. These authentic source bytes do not give an immediately usable stream key under these human-simple consumers. They could still participate in a cipher via an independently specified transform, but there is currently no Cicada instruction choosing such an operation, a key-phase skip, or even this asset as the LP2 key source. Do not escalate to phase shopping, arbitrary hashes or unrelated binary codec families on the basis of this uniform-like result.

The 2014 Fifth Onion source remains a usable historical input. An actual LP2 advancement would require a source-selected operation yielding recognizable *unknown-page* GP plaintext, or an independent key/crib anchor that uniquely selects a different use of this exact material.