# Original 2014 OpenPuff password on LP1 and the Stage10 delivered JPEG triplet

**Agent2, 23 November 2026. Evidence class: two completed, native original-image negative tests with independent original JPEG positive controls. No hidden file, unknown LP2 plaintext, creator-selected LP2 key or puzzle destination recovered.** These are deliberately separate hypotheses and scope-limited results.

## Source-selected hypothesis and causal path

The genuine 2014 Cicada puzzle used **OpenPuff v4.00, password A=`33011033`, optional passwords B/C disabled, and Maximum 1/2 selection** to recover the 745-byte `magicsquares.txt` from an MP3. The original Stage10 response later published three specifically ordered JPEGs called **107.jpg, 167.jpg, 229.jpg**, all proved byte-identical to original LP1 scans **14.jpg, 15.jpg, 16.jpg** respectively ([2014 original-byte handoff](2014-stage10-three-images-lp1-source-handoff.md)). A historical player therefore had the actual OpenPuff operation, its known password, the original 17-page LP1 set and an ordered three-image Stage10 delivery. One motivating, unverified possibility is a second OpenPuff payload supplying a key or instruction needed for later LP2 pages.

No authenticated 2014 instruction says to extract OpenPuff data from LP1 JPEGs or the Stage10 delivery; this is a bounded *operator transfer*, not an author-attested secret-key rule. In particular, original MP3 success cannot establish a JPEG payload. Earlier work tested all **58 original LP2** JPEGs individually at this password and native JPEG Maximum, recovering zero files ([Agent9 run 45095763644](https://github.com/FlareZ123/liber-primus/actions/runs/45095763644)). The **17 original LP1** scans and a **single ordered carrier chain** of the exact historical Stage10 three were the specific missing direct source recipients tested here.

## Genuine decoder and fixed settings

Both source-native Windows workflows use the publicly preserved **original OpenPuff v4.00** executable and matching DLL, verifying exact upstream Git blob SHA-1s `466e03c792075313ce533a5dc7a789e8a41209f9` (EXE) and `f3b1c3315f8286346416fefd6141410f422f2454` (DLL). The program is not a reimplementation. Each Windows runner first extracts the publisher-known **35-byte** text `Dies ist eine versteckte Nachricht!` from an independent unmodified original JPEG under its original publisher-specified password A=`12345678`, B/C off, JPEG Maximum 1/2. This control completed, saved the exact independently expected plaintext bytes, and established that JPEG Unhide worked in the successful test jobs.

The manuscript probes then hold A=`33011033`, optional B/C disabled, `Jpeg (Image)` Maximum 1/2 constant, without varied passwords, key modes, carrier permutations, byte edits, image re-encoding or postselected outputs. A native `Task stopped: corrupted stream` is a real rejection at those settings; **it does not identify whether the cause is password, carrier choice, chain order, level or absence of payload**.

## Experiment 1: all 17 original first-release JPEGs, individually

The fixed source register is original `resources/liber-primus/00.jpg` through `16.jpg`, precisely 17 original images, scanned individually at the same settings. Three Windows shards covered `00–05`, `06–11`, and `12–16`: **6 + 6 + 5 original carriers**. The on-push, source-pinned [workflow](../.github/workflows/agent2-lp1-first17-openpuff.yml) and [completed native run 45098471118](https://github.com/FlareZ123/liber-primus/actions/runs/45098471118) preserve original SHA-256 per scanned image and GUI evidence in shard artifacts.

**Full verified result: 17/17 `native-corrupted-stream`, zero file payloads, zero original-source native completed extraction dialogs.** Every original probe recorded successful source addition and the requested JPEG bit selection. On initial run attempt 1, shard 1 failed *before touching any manuscript source* because the independent positive-control GUI transiently failed to add its known JPEG; shard 1 was rerun and both positive control and all six original probes completed successfully on attempt 2. The other two shards completed successfully on both attempts. The complete 17-source negative requires the successful shard1 retry and must not be represented as a completed test solely from attempt1.

Paired with Agent9's earlier independent full-58 original LP2 scan at identical settings, this now completes a **75/75 first+second-release original JPEG single-carrier native census** for this precise, historically derived password and JPEG depth. It does not extend to other OpenPuff modes or source-selected chains.

## Experiment 2: the actual original Stage10 three-image delivery as one carrier chain

The independent original 2014 Stage10 response ordered exactly three images. We retained that order and restored the original delivered filenames while copying bytes from the identical original LP1 scans. The exact SHA-256 source identity was asserted before invoking OpenPuff:

| Stage10 response filename | Byte-identical LP1 source | SHA-256 (original image bytes) |
| --- | --- | --- |
| `107.jpg` | `14.jpg` | `de2bebe1d06421d94f3dd2b2b5f838ee4cdb5f51b07b14e880e0108f7b79c14e` |
| `167.jpg` | `15.jpg` | `f163903bec1236f1c89c96343d0bd1dee610b697c3ba82514651f04c5fbee4b9` |
| `229.jpg` | `16.jpg` | `984668c680c6089b91587ef6d9eb2a1df1d2b7ee8ab3837655d3933f2adcbfbe` |

The [new source-fixed three-image native workflow](../.github/workflows/agent2-stage10-triplet-openpuff.yml) completed in [Windows run 45099302812](https://github.com/FlareZ123/liber-primus/actions/runs/45099302812). After recovering the authentic 35-byte public-JPEG positive, the original v4.00 GUI verified **3/3 carriers added in 107→167→229 order**, JPEG Maximum level and actual Unhide invocation. The native result was **`native-corrupted-stream`, zero output files**, with a preserved GUI `Task interrupted - Error` dialog listing wrong password, carrier/order or bit depth as possible causes. This three-source chain is not excluded by the earlier individual-image tests; it is a distinct original Stage10-delivery hypothesis.

## Decision and limits

The historically used MP3 password does **not** directly unlock any LP1 single JPEG under native JPEG Maximum, nor the exact Stage10 three-image ordered group under the same settings. Across this setting, the complete original published JPEG set has now been probed individually without hidden-file recovery. This closes a concrete, formerly incomplete original-source *key-acquisition* avenue while preserving the possibility of unrelated steganography, a genuinely differently selected key or private historical instructions.

A further carrier order/password/bit-depth menu would replace the missing original cue with search freedom. Prioritize an independently authored extraction instruction, actual key-bearing original file, or a verified reversible inverse of unknown LP2 ciphertext over additional unsupported OpenPuff variants. Do not promote this negative to a claim that Liber Primus has no steganography or is unbreakable.
