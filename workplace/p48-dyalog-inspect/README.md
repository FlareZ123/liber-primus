# LP2 page 48: OutGuess / Dyalog candidate

## Hypothesis

A historical extraction archive records a 46,559-byte OutGuess 0.13 result from the original LP2 page 48 JPEG. The archive's `48.jpg.check` identifies that result as `Dyalog APL version 100.40`. This is a discriminating file-format signature, not yet proof that the payload is a valid workspace or intentional puzzle content.

## Source and evidence

- Pinned source repository: https://github.com/neuroretransmit/cicada
- Source commit: `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`
- Extracted file: `2014/011-seventh-onion/48.jpg.bin` (46,559 bytes; Git blob `840f63b5bdb05259437c7497905d76474b24ca05`)
- Extraction record: `2014/011-seventh-onion/48.jpg.check`

## Decisive test

The workflow downloads the pinned extraction and asks Dyalog 20.0 to copy its objects using `⎕CY`. It lists names, function/operator source, variable values, and the saved latent expression. It does **not** load the candidate as the active workspace or execute its functions. The interpreter is also invoked with `-x` as a defensive guard against latent-expression execution.

A successful `⎕CY` load with coherent objects would establish that this is a readable Dyalog workspace. A format/load error would demote the signature match to a weak or false-positive lead. Even a valid workspace is not a Liber Primus solution unless its contents provide source-selected key material or a reproducible decipherment operation.
