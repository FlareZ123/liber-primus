package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	stdjpeg "image/jpeg"
	"math"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
	"time"

	f5jpeg "github.com/0verkilll/jpeg"
	"github.com/0verkilll/f5/detect"
	"github.com/0verkilll/f5/embed"
)

const (
	f5Tag      = "v1.0.0"
	f5Commit   = "fbd2bb177d73d4ec89548172023e5451a084bf25"
	controlPass = "LP2F5CONTROLONLY2026"
)

var (
	qualityFactors = []int{60, 70, 75, 80, 85, 90, 95}
	targetBetas    = []float64{0.05, 0.10, 0.15, 0.25}
	controlPages   = []int{17, 39, 57, 74}
)

type ImageResult struct {
	Page       int                   `json:"page"`
	Group      string                `json:"group"`
	Path       string                `json:"path"`
	Bytes      int                   `json:"bytes"`
	SHA256     string                `json:"sha256"`
	Analysis   *detect.AnalysisResult `json:"analysis,omitempty"`
	Error      string                `json:"error,omitempty"`
}

type ControlResult struct {
	CoverPage            int                    `json:"cover_page"`
	CoverQuality         int                    `json:"cover_quality"`
	TargetBeta           float64                `json:"target_beta"`
	EmbeddingK           int                    `json:"embedding_k"`
	UsableACCoefficients int                    `json:"usable_ac_coefficients"`
	ChangedCoefficients  int                    `json:"changed_coefficients"`
	ActualBeta           float64                `json:"actual_beta"`
	PayloadBytes         int                    `json:"payload_bytes"`
	PayloadSHA256        string                 `json:"payload_sha256"`
	CoverSHA256          string                 `json:"cover_sha256"`
	StegoSHA256          string                 `json:"stego_sha256"`
	ShrinkageCount       int                    `json:"shrinkage_count"`
	EmbedBytesReported   int                    `json:"embed_bytes_reported"`
	ExtractionVerified   bool                   `json:"extraction_verified"`
	ExtractionError      string                 `json:"extraction_error,omitempty"`
	StegoPath            string                 `json:"stego_path"`
	PayloadPath          string                 `json:"payload_path"`
	CoverAnalysis        *detect.AnalysisResult `json:"cover_analysis,omitempty"`
	Analysis             *detect.AnalysisResult `json:"analysis,omitempty"`
	Error                string                 `json:"error,omitempty"`
}

type Run struct {
	RunUTC      string          `json:"run_utc"`
	GoVersion   string          `json:"go_version"`
	Detector    map[string]any  `json:"detector"`
	Embedder    map[string]any  `json:"embedder"`
	Originals   []ImageResult   `json:"originals"`
	Controls    []ControlResult `json:"controls"`
}

func sha256Hex(b []byte) string {
	sum := sha256.Sum256(b)
	return hex.EncodeToString(sum[:])
}

func analyze(data []byte) (*detect.AnalysisResult, error) {
	result, err := detect.Analyze(
		data,
		detect.WithQualityFactors(append([]int(nil), qualityFactors...)),
		detect.WithThreshold(0.125),
		detect.WithCoverCrop(4),
		detect.WithCoverBlurEpsilon(0.01),
	)
	if err != nil {
		return nil, err
	}
	// This experiment uses only the Fridrich-Goljan-Hogea statistical result.
	// The separate structural-signature subsystem is deliberately excluded.
	result.Signatures = nil
	return result, nil
}

func reencodeAtQuality(data []byte, quality int) ([]byte, error) {
	img, err := stdjpeg.Decode(bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("decode cover for Q%d control: %w", quality, err)
	}
	var out bytes.Buffer
	if err := stdjpeg.Encode(&out, img, &stdjpeg.Options{Quality: quality}); err != nil {
		return nil, fmt.Errorf("encode Q%d control: %w", quality, err)
	}
	return out.Bytes(), nil
}

func int16Coefficients(raw []int) ([]int16, error) {
	out := make([]int16, len(raw))
	for i, v := range raw {
		if v < math.MinInt16 || v > math.MaxInt16 {
			return nil, fmt.Errorf("coefficient %d out of int16 range: %d", i, v)
		}
		out[i] = int16(v)
	}
	return out, nil
}

func intCoefficients(raw []int16) []int {
	out := make([]int, len(raw))
	for i, v := range raw {
		out[i] = int(v)
	}
	return out
}

func deterministicPayload(page, quality int, beta float64, n int) []byte {
	seed := sha256.Sum256([]byte(fmt.Sprintf(
		"LP2 F5 calibration control; page=%d; quality=%d; target-beta=%.4f; k=1",
		page, quality, beta,
	)))
	out := make([]byte, n)
	for i := range out {
		out[i] = seed[i%len(seed)] ^ byte((i*131+page*17+quality)&0xff)
	}
	return out
}

func verifyExtraction(stegoPath, extractedPath string, payload []byte) (bool, string) {
	cmd := exec.Command("f5", "extract", stegoPath, "-p", controlPass, "-o", extractedPath)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return false, strings.TrimSpace(string(out) + " " + err.Error())
	}
	got, err := os.ReadFile(extractedPath)
	if err != nil {
		return false, "extract command succeeded but output could not be read: " + err.Error()
	}
	if !bytes.Equal(got, payload) {
		return false, fmt.Sprintf("extracted payload mismatch: got %d bytes, expected %d", len(got), len(payload))
	}
	return true, strings.TrimSpace(string(out))
}

func embedControl(
	page int,
	original []byte,
	quality int,
	targetBeta float64,
	controlDir string,
	payloadDir string,
) (ControlResult, error) {
	cover := original
	if quality != 95 {
		var err error
		cover, err = reencodeAtQuality(original, quality)
		if err != nil {
			return ControlResult{}, err
		}
	}

	decoder := f5jpeg.NewStandardDecoder()
	raw, err := decoder.ExtractCoefficients(cover)
	if err != nil {
		return ControlResult{}, fmt.Errorf("extract cover coefficients: %w", err)
	}
	coeffs, err := int16Coefficients(raw)
	if err != nil {
		return ControlResult{}, err
	}
	capacity := embed.CalculateCapacity(coeffs)
	usable := capacity.UsableCoefficients
	if usable <= 0 {
		return ControlResult{}, fmt.Errorf("no usable non-zero AC coefficients")
	}

	// For F5 matrix parameter k=1, the embedding efficiency is W(1)=2
	// message bits per coefficient change. The 32-bit F5 length header is
	// deducted before selecting payload bytes. Actual beta is measured from
	// the before/after coefficient arrays, not inferred from this target.
	totalBits := int(math.Round(targetBeta * float64(usable) * 2.0))
	payloadBits := totalBits - 32
	if payloadBits < 8 {
		payloadBits = 8
	}
	payloadBytes := (payloadBits + 7) / 8
	payload := deterministicPayload(page, quality, targetBeta, payloadBytes)

	originalCoeffs := append([]int16(nil), coeffs...)
	embedded, err := embed.EmbedWithOptions(
		coeffs,
		controlPass,
		payload,
		embed.EmbedOptions{ForceK: 1},
	)
	if err != nil {
		return ControlResult{}, fmt.Errorf("F5 embed at target beta %.3f: %w", targetBeta, err)
	}
	if embedded == nil || len(embedded.Coefficients) != len(originalCoeffs) {
		return ControlResult{}, fmt.Errorf("F5 embed returned invalid coefficient array")
	}

	changed := 0
	for i := range originalCoeffs {
		// The flattened JPEG coefficient stream stores each block's DC
		// coefficient at index % 64 == 0. F5 changes AC coefficients only.
		if i%64 != 0 && originalCoeffs[i] != embedded.Coefficients[i] {
			changed++
		}
	}
	actualBeta := float64(changed) / float64(embedded.UsableCoefficients)

	encoded, err := decoder.EncodeCoefficients(intCoefficients(embedded.Coefficients))
	if err != nil {
		return ControlResult{}, fmt.Errorf("encode F5 stego JPEG: %w", err)
	}

	stem := fmt.Sprintf("page%02d-q%d-beta%03d-k1", page, quality, int(math.Round(targetBeta*1000)))
	stegoPath := filepath.Join(controlDir, stem+".jpg")
	payloadPath := filepath.Join(payloadDir, stem+".bin")
	extractedPath := filepath.Join(payloadDir, stem+".extracted.bin")
	if err := os.WriteFile(stegoPath, encoded, 0644); err != nil {
		return ControlResult{}, err
	}
	if err := os.WriteFile(payloadPath, payload, 0644); err != nil {
		return ControlResult{}, err
	}

	verified, verifyErr := verifyExtraction(stegoPath, extractedPath, payload)
	analysis, err := analyze(encoded)
	if err != nil {
		return ControlResult{}, fmt.Errorf("analyze synthetic stego: %w", err)
	}

	record := ControlResult{
		CoverPage:            page,
		CoverQuality:         quality,
		TargetBeta:           targetBeta,
		EmbeddingK:           embedded.KParameter,
		UsableACCoefficients: embedded.UsableCoefficients,
		ChangedCoefficients:  changed,
		ActualBeta:           actualBeta,
		PayloadBytes:         len(payload),
		PayloadSHA256:        sha256Hex(payload),
		CoverSHA256:          sha256Hex(cover),
		StegoSHA256:          sha256Hex(encoded),
		ShrinkageCount:       embedded.ShrinkageCount,
		EmbedBytesReported:   embedded.BytesEmbedded,
		ExtractionVerified:   verified,
		ExtractionError:      verifyErr,
		StegoPath:            filepath.ToSlash(filepath.Join("controls", stem+".jpg")),
		PayloadPath:          filepath.ToSlash(filepath.Join("payloads", stem+".bin")),
		Analysis:             analysis,
	}
	if quality != 95 {
		coverAnalysis, err := analyze(cover)
		if err != nil {
			return ControlResult{}, fmt.Errorf("analyze Q%d cover: %w", quality, err)
		}
		record.CoverAnalysis = coverAnalysis
	}
	return record, nil
}

func verdictCounts(results []ImageResult) map[string]int {
	counts := map[string]int{}
	for _, item := range results {
		if item.Analysis == nil {
			counts["error"]++
			continue
		}
		counts[string(item.Analysis.Verdict)]++
	}
	return counts
}

func controlCounts(results []ControlResult) map[string]map[string]int {
	out := map[string]map[string]int{}
	for _, item := range results {
		key := fmt.Sprintf("Q%d beta=%.2f", item.CoverQuality, item.TargetBeta)
		if out[key] == nil {
			out[key] = map[string]int{}
		}
		if item.Analysis == nil {
			out[key]["error"]++
		} else {
			out[key][string(item.Analysis.Verdict)]++
		}
	}
	return out
}

func writeSummaryMarkdown(path string, run Run) error {
	var b strings.Builder
	fmt.Fprintf(&b, "# F5 FGH-2002 detector calibration\n\n")
	fmt.Fprintf(&b, "- Run UTC: `%s`\n", run.RunUTC)
	fmt.Fprintf(&b, "- Go: `%s`; F5 library: `%s` at `%s`\n", run.GoVersion, f5Tag, f5Commit)
	fmt.Fprintf(&b, "- Detector: Fridrich–Goljan–Hogea (2002) statistical F5 attack; structural fingerprint subsystem excluded\n")
	fmt.Fprintf(&b, "- Parameters: quality factors `%v`; beta threshold `0.125`; crop `4 px`; cover-blur epsilon `0.01`; default DCT modes `(1,2),(2,1),(2,2)`\n", qualityFactors)
	fmt.Fprintf(&b, "- Synthetic controls: F5 matrix `k=1`; target beta `%v`; fixed control-only password (not an LP2 candidate); actual beta measured from changed AC coefficients\n\n", targetBetas)

	lp1 := make([]ImageResult, 0)
	lp2 := make([]ImageResult, 0)
	for _, item := range run.Originals {
		if item.Group == "LP1 comparator" {
			lp1 = append(lp1, item)
		} else {
			lp2 = append(lp2, item)
		}
	}
	fmt.Fprintf(&b, "## Original-image coverage\n\n")
	fmt.Fprintf(&b, "- LP1 comparator pages: %d; verdict counts: `%v`\n", len(lp1), verdictCounts(lp1))
	fmt.Fprintf(&b, "- LP2 target pages: %d; verdict counts: `%v`\n\n", len(lp2), verdictCounts(lp2))
	fmt.Fprintf(&b, "LP1 pages are a comparison set, not certified F5-clean covers; the known LP1 puzzle payloads are not treated as F5 positives. The FGH-2002 detector's own quality-reliability verdict governs interpretation.\n\n")

	fmt.Fprintf(&b, "## LP2 original pages\n\n")
	fmt.Fprintf(&b, "| Page | JPEG Q | Reliability | Verdict | beta | raw beta | confidence | reason |\n|---:|---:|---|---|---:|---:|---:|---|\n")
	for _, item := range lp2 {
		if item.Analysis == nil {
			fmt.Fprintf(&b, "| %02d | — | — | error | — | — | — | %s |\n", item.Page, item.Error)
			continue
		}
		a := item.Analysis
		fmt.Fprintf(&b, "| %02d | %d | %s | %s | %.5f | %.5f | %.4f | %s |\n",
			item.Page, a.Quality, a.QualityReliability, a.Verdict, a.Beta, a.RawBeta, a.Confidence, strings.ReplaceAll(a.InconclusiveReason, "|", "/"))
	}
	fmt.Fprintf(&b, "\n## Synthetic F5-positive controls\n\n")
	fmt.Fprintf(&b, "Verdict counts by quality and target beta: `%v`\n\n", controlCounts(run.Controls))
	fmt.Fprintf(&b, "| Cover | Q | target beta | actual beta | K | changed/P | payload bytes | extraction verified | detector reliability | verdict | beta estimate | confidence |\n|---:|---:|---:|---:|---:|---:|---:|---|---|---|---:|---:|\n")
	for _, c := range run.Controls {
		if c.Analysis == nil {
			fmt.Fprintf(&b, "| %02d | %d | %.2f | %.4f | %d | %d/%d | %d | %t | — | error | — | — |\n",
				c.CoverPage, c.CoverQuality, c.TargetBeta, c.ActualBeta, c.EmbeddingK, c.ChangedCoefficients, c.UsableACCoefficients, c.PayloadBytes, c.ExtractionVerified)
			continue
		}
		a := c.Analysis
		fmt.Fprintf(&b, "| %02d | %d | %.2f | %.4f | %d | %d/%d | %d | %t | %s | %s | %.5f | %.4f |\n",
			c.CoverPage, c.CoverQuality, c.TargetBeta, c.ActualBeta, c.EmbeddingK, c.ChangedCoefficients, c.UsableACCoefficients, c.PayloadBytes, c.ExtractionVerified, a.QualityReliability, a.Verdict, a.Beta, a.Confidence)
	}
	fmt.Fprintf(&b, "\n## Interpretation constraints\n\n")
	fmt.Fprintf(&b, "- Only the FGH-2002 statistical result is used; the F5 tool's separate structural signatures are excluded.\n")
	fmt.Fprintf(&b, "- The single predeclared decision statistic is global beta at threshold 0.125. Per-mode betas and quality calibration are retained in JSON as diagnostics, not searched as independent pagewise features.\n")
	fmt.Fprintf(&b, "- A `clean` verdict is meaningful only when quality reliability is optimal/degraded. `inconclusive` is not a negative result.\n")
	fmt.Fprintf(&b, "- The pinned implementation's executable constants set Q=60–88 as optimal, Q=33–59 as degraded, and Q=89+ as unreliable. Stale prose in the same source file still says Q=60–91/Q=92–100; the executable constants and runtime verdict are authoritative. Original LP2 images at Q95 are outside the detector's reliable range, so inconclusive results cannot exclude F5.\n")
	fmt.Fprintf(&b, "- No password, seed, coefficient permutation, or keyed variant is searched. The fixed password is used only to construct reproducible synthetic controls.\n")
	return os.WriteFile(path, []byte(b.String()), 0644)
}

func main() {
	cwd, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	root := filepath.Clean(filepath.Join(cwd, "../.."))
	imageDir := filepath.Join(root, "resources", "liber-primus")
	outDir := filepath.Join(root, "im-results", "f5-fgh2002-calibration")
	controlDir := filepath.Join(outDir, "controls")
	payloadDir := filepath.Join(outDir, "payloads")
	if err := os.RemoveAll(outDir); err != nil {
		panic(err)
	}
	for _, dir := range []string{controlDir, payloadDir} {
		if err := os.MkdirAll(dir, 0755); err != nil {
			panic(err)
		}
	}

	run := Run{
		RunUTC:    time.Now().UTC().Format(time.RFC3339),
		GoVersion: runtime.Version(),
		Detector: map[string]any{
			"algorithm":              "Fridrich-Goljan-Hogea 2002 statistical F5 steganalysis",
			"implementation":         "github.com/0verkilll/f5/detect",
			"tag":                    f5Tag,
			"commit":                 f5Commit,
			"quality_factors":        qualityFactors,
			"beta_threshold":         0.125,
			"quality_optimal_max_in_code": 88,
			"quality_unreliable_min_in_code": 89,
			"quality_documentation_conflict": "stale prose says Q60-91/Q92-100; executable constants and verdict logic use Q60-88/Q89+",
			"cover_crop_pixels":      4,
			"cover_blur_epsilon":     0.01,
			"default_dct_modes":      []string{"1,2", "2,1", "2,2"},
			"decision_statistic":     "global beta",
			"structural_signatures":  "excluded",
		},
		Embedder: map[string]any{
			"implementation":       "github.com/0verkilll/f5/embed",
			"tag":                  f5Tag,
			"commit":               f5Commit,
			"matrix_k":             1,
			"target_beta":          targetBetas,
			"efficiency_bits_per_change": 2,
			"control_password_label": "fixed synthetic-control password; not an LP2 candidate",
		},
	}

	// Original corpus: 00–16 are the LP1 comparison set; 17–74 are the 58 LP2 targets.
	for page := 0; page <= 74; page++ {
		path := filepath.Join(imageDir, fmt.Sprintf("%02d.jpg", page))
		data, err := os.ReadFile(path)
		if err != nil {
			panic(fmt.Errorf("missing original page %02d: %w", page, err))
		}
		group := "LP1 comparator"
		if page >= 17 {
			group = "LP2 target"
		}
		a, analyzeErr := analyze(data)
		item := ImageResult{
			Page:   page,
			Group:  group,
			Path:   filepath.ToSlash(filepath.Join("resources", "liber-primus", fmt.Sprintf("%02d.jpg", page))),
			Bytes:  len(data),
			SHA256: sha256Hex(data),
			Analysis: a,
		}
		if analyzeErr != nil {
			item.Error = analyzeErr.Error()
		}
		run.Originals = append(run.Originals, item)
		fmt.Printf("original %02d %s: %s\n", page, group, func() string {
			if a == nil { return "error: " + item.Error }
			return string(a.Verdict) + " Q=" + fmt.Sprint(a.Quality) + " beta=" + fmt.Sprintf("%.5f", a.Beta)
		}())
	}

	// Matched Q95 controls preserve each original JPEG's quantization tables.
	// Q85 controls re-encode the same source pixels into the FGH-2002 validated range.
	for _, page := range controlPages {
		originalPath := filepath.Join(imageDir, fmt.Sprintf("%02d.jpg", page))
		original, err := os.ReadFile(originalPath)
		if err != nil {
			panic(err)
		}
		for _, quality := range []int{95, 85} {
			for _, beta := range targetBetas {
				control, err := embedControl(page, original, quality, beta, controlDir, payloadDir)
				if err != nil {
					panic(fmt.Errorf("control page %02d Q%d beta %.2f: %w", page, quality, beta, err))
				}
				run.Controls = append(run.Controls, control)
				fmt.Printf("control page %02d Q%d target=%.2f actual=%.4f verdict=%s reliable=%s extracted=%t\n",
					page, quality, beta, control.ActualBeta, control.Analysis.Verdict, control.Analysis.QualityReliability, control.ExtractionVerified)
			}
		}
	}

	sort.Slice(run.Originals, func(i, j int) bool { return run.Originals[i].Page < run.Originals[j].Page })
	sort.Slice(run.Controls, func(i, j int) bool {
		a, b := run.Controls[i], run.Controls[j]
		if a.CoverQuality != b.CoverQuality { return a.CoverQuality < b.CoverQuality }
		if a.CoverPage != b.CoverPage { return a.CoverPage < b.CoverPage }
		return a.TargetBeta < b.TargetBeta
	})

	jsonBytes, err := json.MarshalIndent(run, "", "  ")
	if err != nil {
		panic(fmt.Errorf("marshal result JSON: %w", err))
	}
	if err := os.WriteFile(filepath.Join(outDir, "summary.json"), jsonBytes, 0644); err != nil {
		panic(err)
	}
	if err := writeSummaryMarkdown(filepath.Join(outDir, "summary.md"), run); err != nil {
		panic(err)
	}
	fmt.Printf("wrote %s\n", filepath.Join(outDir, "summary.json"))
	fmt.Printf("wrote %s\n", filepath.Join(outDir, "summary.md"))
}
