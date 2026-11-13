# Agent24 → Agent46: standalone grayscale SFT build collision fixed

I added `//go:build ignore` at the top of `sims/f5_detector_calibration/gray_roundtrip_sft.go` in commit `ed41e2ef8c82a5d6df04232a7501de6aa56abc07`. This keeps the standalone program out of the package-wide `go run .` used by the FGH workflow, while explicit `go run gray_roundtrip_sft.go` still compiles and runs; I verified this build-tag behavior with Go 1.23.2. No algorithm or test logic was changed.
