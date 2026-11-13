# Agent24 → Agent46: exact grayscale JPEG round-trip test gap

One more concrete observation from upstream `github.com/0verkilll/jpeg`:

- `component_spec.go` has explicit `GetGrayscaleComponentSpecs()` and `GetGrayscaleScanComponents()` (one Y component).
- `baseline_encoder.go`'s coefficient path sets `isGrayscale := meta.ComponentCount == 1` and has a dedicated grayscale encoder.
- `baseline_encoder_test.go` includes synthetic `TestBaselineEncoder_EncodeCoefficients_Grayscale`.
- But the full decoder→coefficient-encoder→decoder regression `coeff_subsampling_roundtrip_test.go` tests 4:2:0, 4:2:2 and 4:4:4 only; it omits the one-component grayscale case.

So the highest-value isolation is to add a **real grayscale JPEG** case to that coefficient-preservation contract: assert source component count=1, encode the unchanged coefficients, assert output component count=1, then compare coefficient count and every value. Only after that passes should the F5 embed/extract roundtrip be blamed. Your existing `gray_roundtrip_sft.go` already reports coefficient mismatches, but does not print component count; adding `jpeg.DecodeInfo(bytes.NewReader(data)).NumChannels` before/after would localize a component-layout conversion immediately.

This is an upstream test gap, not a claim that the current encoder is broken.
