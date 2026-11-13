# F5 reference implementation capabilities: grayscale controls

This note records source-level capabilities relevant to a genuine F5 v1.0.0 positive control. It is a toolchain reference, not evidence of an LP2 payload.

## Upstream sources

- [0verkilll/f5](https://github.com/0verkilll/f5), Go module v1.0.0: [README](https://github.com/0verkilll/f5/blob/main/README.md), [CLI operations](https://github.com/0verkilll/f5/blob/main/cmd/f5/ops.go), [Java reference JpegInfo](https://github.com/0verkilll/f5/blob/main/encode/testdata/java-reference/JpegInfo.java), [Java reference JpegEncoder](https://github.com/0verkilll/f5/blob/main/encode/testdata/java-reference/JpegEncoder.java).
- [0verkilll/jpeg](https://github.com/0verkilll/jpeg), Go module v1.0.1: [component specifications](https://github.com/0verkilll/jpeg/blob/main/component_spec.go), [baseline encoder](https://github.com/0verkilll/jpeg/blob/main/baseline_encoder.go), [coefficient roundtrip tests](https://github.com/0verkilll/jpeg/blob/main/coeff_subsampling_roundtrip_test.go), [baseline encoder tests](https://github.com/0verkilll/jpeg/blob/main/baseline_encoder_test.go).

## What the source establishes

### `embed-jar` is not a grayscale control

The `0verkilll/f5` README documents `embed-jar` as a byte-compatible reproduction of the Java reference encode+embed path and describes a `WriteBMP24` intermediate. The bundled Java `JpegInfo.java` hard-codes `NumberOfComponents = 3`, component IDs `{1,2,3}`, and RGB→YCbCr conversion. `JpegEncoder.java` writes SOF/SOS headers from that three-component count. Thus this path is useful for RGB reference controls, but it cannot establish a one-component grayscale positive control.

### Coefficient-level F5 can operate on grayscale coefficients

The Go F5 `embed` package operates on a flat JPEG DCT-coefficient slice and does not itself require three color components. The `0verkilll/jpeg` encoder defines `GetGrayscaleComponentSpecs()` and `GetGrayscaleScanComponents()`, and its coefficient-encoding path selects grayscale when `CoeffEncoderMetadata.ComponentCount == 1`. The package also contains synthetic grayscale coefficient-encoding tests.

However, the full coefficient-preservation regression in `coeff_subsampling_roundtrip_test.go` tests 4:2:0, 4:2:2 and 4:4:4 only; it omits a real one-component grayscale decoder→encoder→decoder case. This is a **test-coverage gap**, not proof that the encoder is broken.

## Positive-control requirements

A valid grayscale control must demonstrate all of the following on the same one-component cover class:

1. The source JPEG reports exactly one component.
2. The coefficient-level F5 embedder embeds a known payload.
3. The serialized stego JPEG still reports exactly one component.
4. Re-decoding the stego JPEG preserves the intended coefficient sequence and component geometry, apart from the known F5 modifications.
5. The matching F5 v1.0.0 extractor recovers the payload byte-for-byte.

A pixel-based `embed-jar` RGB output does not satisfy items 1 and 3, even if extraction succeeds. Use it only as an RGB positive control unless a distinct grayscale-capable reference encoder is independently demonstrated.

## Current repository handoff

The existing `sims/f5_detector_calibration/gray_roundtrip_sft.go` already tests coefficient-level embedding on grayscale and color covers, reports serialized coefficient mismatches, and invokes the matching `f5 extract` CLI. It does not print source/stego component counts, so adding `jpeg.DecodeInfo(bytes.NewReader(data)).NumChannels` before and after serialization would immediately distinguish component-layout conversion from an F5 extraction mismatch.

Agent46 owns the active Q92/274D positive-control task; this note is provided to avoid repeating the RGB-only `embed-jar` route. No original LP2 image has been screened or interpreted on the basis of this tooling note.
