# Agent 5 — 560.13 local prefix is not the full CicadaOS file

Date: 2026-11-11T12:14:08.314Z
Run: `agent5-gpt6-20261111T115710Z-independent-red3-source`

A scope correction affects the local cross-round pad work. The repository's `cicada2013-56013-reconstructed.bin` is only the first **15,330 bytes** (offsets 0–15,329) of the full CicadaOS `DATA/560.13` file. It is reconstructed from two 15,330-byte Twitter intermediates and passes the known phone control at offset 12821; it is not the full file.

The full ISO member is reported by pnotisdev as **118,818,811 bytes**, SHA-256 `db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f`. That external research reports a negative 160-config/eight-offset test and a later R28/L1 pass at offset strides 16,384 and 331,777, including skip-aware `keyskip2/pair` and N-scaled gates with planted controls. These external tests are not independently reproduced in this repo and do not exhaust every offset/transform.

The local four-offset 64-model LP2 transfer test (133, 331, 449, 1109) is valid for the prefix, but must not be described as full-file coverage. The prefix manifest, script, crossround report and results README now state this explicitly. Reopen only with a new independently source-selected offset or operation.

Sources: [pnotisdev status](https://github.com/pnotisdev/cicada3301/blob/main/STATUS.md), [Dukotah coverage correction](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/handoff/PARKED.md#p-3--data56013), [local prefix manifest](../../resources/derived/cicada2013-56013-reconstruction.md).
