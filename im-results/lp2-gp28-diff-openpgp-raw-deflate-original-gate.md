# LP2 GP28 predecessor differences as raw historical OpenPGP ZIP packets

**Agent 42, 22 November 2026. Independent replication and tightened packet-consumption criterion on an ALREADY STUDIED source gate. No unknown plaintext, source-selected key or continuation recovered.** This replicates a proper subset of Agent43's broader original-source GP28-to-raw-DEFLATE search of 13 November 2026 (91 scopes, 10,556 byte candidates, 174 short accidental raw decompressions and no readable payload). My 157-candidate sample adds an explicit full-input-consumption check; it is NOT a new cipher-family exclusion or a novel decryption route.

## Human-readable hypothesis and decisive receiver

The ciphertext has only **86 adjacent identical runes** among 12,956 original unknown GP29 symbols. A natural proposed encoding writes each *nonzero* predecessor difference modulo29 as one of **28** digit values. The signed Cicada 2013 materials demonstrate positional BASE29 transport; the same earlier Cicada OpenPGP teaching material uses ZIP compressed-data algorithm1, whose body is **raw RFC1951 DEFLATE**, without a conventional zlib/gzip header. These clues motivate this specific binary-format consumer; the creator has not authenticated the GP28 predecessor encoder, zero-step deletion, byte width or its use as a compression format.

Let source ciphertext ordinals be \(c_i\in[0,28]\) and the chosen direction be \(s\in\{+1,-1\}\). On each source-visible unit, start after its first rune and compute \(d_i=(s(c_i-c_{i-1}))\bmod29\). Record the 86/other actual \(d_i=0\) events; omit those for this **proposed** exception convention. Encode each remaining \(d_i-1\in[0,27]\) as a most-significant-first positional base28 integer. Serialize that integer as (a) shortest unsigned big-endian bytes and (b) the fixed maximum width \(\lceil n\log_2(28)/8\rceil\) bytes, deduplicating identical width results *within each orientation and unit*.

Test two exact offset-zero receiver types only:

1. The entire byte array as one raw RFC1951 DEFLATE payload, with a 1 MiB decompressed-output ceiling.
2. If its first byte is **literally 01**, interpret it as the native OpenPGP ZIP compression-algorithm indicator and inflate the exact remaining bytes.

For any syntactically accepted raw stream, accept a complete packet only if Node's \`engine.bytesWritten\` equals **all** bytes supplied to its decoder. Do not accept early-terminating empty DEFLATE blocks as payloads. A plausible readable result additionally needs ≥32 decompressed bytes and ≥80% printable ASCII/whitespace; the packet-completeness check is independent of that heuristic.

## Original source and replication result

Input is canonical \`resources/liber-primus/lp2-corpus.json\`, all unsolved original physical p0–55, **12,956 GP29 runes on 55 rune-bearing pages** (the numeric p50 contains zero prose runes). Source-visible chapter boundaries are p0,3,8,15,23,27,33,40,54. Each input is used only in original rune order, with no fitted key, deletion apart from the explicitly named zero-step convention, arbitrary byte offset or language-score optimization.

| Exact original-input measurement | Outcome |
| --- | ---: |
| Book + nine visual chapters + 55 rune-bearing pages | **65 source units** |
| Both independently frozen predecessor-difference directions | **130 source unit/orientation pairs** |
| Distinct canonical minimal/fixed-width byte candidates | **157** |
| Complete original raw RFC1951 streams | **0** |
| Complete source-typed OpenPGP ZIP algorithm1 bodies | **0** |
| Complete coherent printable unknown-page plaintext | **0** |
| Syntactically accepted but incomplete raw parses | **4** |

The four partial packets in this narrower replication are physical p5 (sign−), p19 (sign+), p29 (sign−) and p37 (sign−), each under **minimal** width. All four consume exactly **2 input bytes**, decode exactly **0 bytes** and leave the full remaining source serialization unused. Agent43 had already identified 174 raw-DEFLATE successes across its larger original family, with at most 17 decompressed bytes and no text; these are consistent bounded negatives. My extra strict bytes-consumed test only strengthens the rejection of my four prefix coincidences.

## Verified positive, scope and decision

The same decoder recovers a planted, compressed text made from **original solved p57's 95 known GP runes repeated three times**. A second positive recovers the same text from a literal algorithm-one prefixed packet. An intentionally appended junk suffix is detected by the input-byte consumption check. The full script exits successfully on [Windows Server 2022, Node.js 22, manual run 45020841498](https://github.com/FlareZ123/liber-primus/actions/runs/45020841498).

- [Original source-exact single-file CommonJS SFT](../sims/lp2_gp28_diff_openpgp_zip_raw_original_sft.cjs).
- [Manual reproduction workflow](../.github/workflows/agent42-gp28-diff-openpgp-zip-manual.yml).
- **Critical prior art:** [Agent43's original LP2 GP28-to-compressed-file gate, 13 November 2026](lp2-gp28-unframed-compressed-binary-gate.md) already included the same delta-derived base28 integer to raw RFC1951 operation, broader in scope and seed selection; its reproduction is [lp2_rank28_raw_compressed_file_sft.cjs](../sims/lp2_rank28_raw_compressed_file_sft.cjs). [Agent10's GP28 direct binary gate](lp2-gp28-difference-direct-binary-transport-gate.md) and [untransformed direct GP29 as raw RFC1951](lp2-original-base29-raw-deflate-gate.md) are additional related prior experiments. My specific exact-F format, 65 scopes and full-packet assertion are stricter in one dimension, but not a new conceptual search.

**Decision:** retain this as an independent full-packet replication of the already-retired complete source-unit, unkeyed successor-difference GP28 integer → offset-zero raw DEFLATE/OpenPGP ZIP-body hypothesis. **Do not commission a successor based on this replication.** The original may contain keyed/encrypted binary, zero-step escape data, a different historical packet frame, a non-binary plaintext transport or external key material. Because zero-step omission itself requires an unproven exception rule, failure of this one direct decoder does not establish the manuscript's real cipher mechanism.
