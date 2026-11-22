//go:build ignore

package main

import (
    "bytes"
    "crypto/sha256"
    "fmt"
    "os"
    "os/exec"
    "path/filepath"

    jpeg "github.com/0verkilll/jpeg"
    "github.com/0verkilll/f5/embed"
)

// SFT of genuine F5 v1.0.0 grayscale and color coefficient-preserving
// embedding with a fixed source-only password and synthetic random payload.
// No original page is being screened for an unknown payload.
const testPass = "LP2-BLIND274-Q92-CONTROL-ONLY"

func checkCover(filename, f5 string) error {
    data, err := os.ReadFile(filename)
    if err != nil { return err }
    dec := jpeg.NewStandardDecoder()
    ints, err := dec.ExtractCoefficients(data)
    if err != nil { return err }
    controlDir, err := os.MkdirTemp("", "f5-gray-sft-")
    if err != nil { return err }
    defer os.RemoveAll(controlDir)
    for _, size := range []int{256, 1024, 4096} {
        payload := make([]byte, size)
        for offset := 0; offset < size; offset += 32 {
            seed := sha256.Sum256([]byte(fmt.Sprintf("F5-BLIND274-GRAY-CONTROL-%04d-%d", offset, size)))
            copy(payload[offset:], seed[:])
        }
        for _, k := range []int{1, 2, 4, 8} {
            coefficients := make([]int16, len(ints))
            for i, v := range ints { coefficients[i] = int16(v) }
            result, err := embed.EmbedWithOptions(coefficients, testPass, payload, embed.EmbedOptions{ForceK:k})
            if err != nil {
                fmt.Printf("CONTROL_ERROR cover=%s size=%d k=%d embed=%v\n", filepath.Base(filename), size, k, err)
                continue
            }
            encodedCoefficients := make([]int, len(result.Coefficients))
            for i, v := range result.Coefficients { encodedCoefficients[i] = int(v) }
            encoded, err := dec.EncodeCoefficients(encodedCoefficients)
            if err != nil { return err }
            controlDecoder := jpeg.NewStandardDecoder()
            recoded, err := controlDecoder.ExtractCoefficients(encoded)
            if err != nil { return err }
            mismatch := 0
            limit := len(recoded)
            if len(encodedCoefficients) < limit { limit = len(encodedCoefficients) }
            for i := 0; i < limit; i++ {
                if recoded[i] != encodedCoefficients[i] { mismatch++ }
            }
            missing := len(encodedCoefficients) - len(recoded)
            stego := filepath.Join(controlDir, fmt.Sprintf("%d-%d.jpg", size, k))
            recovered := filepath.Join(controlDir, fmt.Sprintf("%d-%d.out", size, k))
            if err := os.WriteFile(stego, encoded, 0600); err != nil { return err }
            diagnostic, extractErr := exec.Command(f5, "extract", stego, "-p", testPass, "-o", recovered).CombinedOutput()
            got, _ := os.ReadFile(recovered)
            match := extractErr == nil && bytes.Equal(got, payload)
            fmt.Printf("CONTROL_RESULT cover=%s size=%d k=%d roundtrip=%t serialized_coeff_mismatch=%d coefficient_count_difference=%d jpeg_bytes=%d shrinkages=%d msg=%q\n",
                filepath.Base(filename), size, k, match, mismatch, missing, len(encoded), result.ShrinkageCount, bytes.TrimSpace(diagnostic))
        }
    }
    return nil
}

func main() {
    if len(os.Args) != 4 { panic("Usage: gray_roundtrip_sft.go grayscale.jpg color.jpg f5-cli") }
    for _, cover := range os.Args[1:3] {
        if err := checkCover(cover, os.Args[3]); err != nil { panic(err) }
    }
}
