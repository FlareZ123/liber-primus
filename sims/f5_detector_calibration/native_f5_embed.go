package main

// Historical F5 Q92 control generator. Uses the genuine F5 v1.0.0 embedder,
// and reuses the source JPEG's original quantization tables and component mode.
// No manuscript payloads are extracted; all inputs are synthetic clean covers.
// Separate external F5 extraction must pass before controls enter calibration.
import (
  "bytes"
  "encoding/json"
  "errors"
  "image/color"
  "image/jpeg"
  "flag"
  "fmt"
  "os"
  "path/filepath"

  f5jpeg "github.com/0verkilll/jpeg"
  "github.com/0verkilll/f5/embed"
)

func main() {
  cover := flag.String("cover", "", "clean cover JPEG")
  payload := flag.String("payload", "", "synthetic payload binary")
  password := flag.String("password", "BLIND-F5-Q92-20261113-CONTROL", "synthetic-only password")
  out := flag.String("out", "", "stego JPEG output")
  k := flag.Int("k", 4, "F5 fixed matrix parameter in [1,8]")
  padTail := flag.Bool("pad-trailing-zeros", false, "restore JPEG terminal all-zero MCU blocks before embedding")
  flag.Parse()
  if *cover == "" || *payload == "" || *out == "" || *k < 1 || *k > 8 {
    panic("required -cover, -payload, -out and 1<=k<=8")
  }
  c, err := os.ReadFile(*cover); if err != nil { panic(err) }
  p, err := os.ReadFile(*payload); if err != nil { panic(err) }
  decoder := f5jpeg.NewStandardDecoder()
  raw, err := decoder.ExtractCoefficients(c); if err != nil { panic(err) }
  if *padTail {
    config, err := jpeg.DecodeConfig(bytes.NewReader(c)); if err != nil { panic(err) }
    if config.Width != 2400 || config.Height != 3600 { panic("unexpected LP2 geometry") }
    expected := config.Width * config.Height
    _, grayscale := config.ColorModel.Convert(color.RGBA{R:20,G:40,B:60,A:255}).(color.Gray)
    if !grayscale { expected = 3 * expected / 2 }
    missing := expected - len(raw)
    if missing < 0 || missing % 64 != 0 || missing > 64 * 400 {
      panic(fmt.Sprintf("unsupported source coefficient truncation raw=%d expected=%d", len(raw), expected))
    }
    raw = append(raw, make([]int, missing)...)
    fmt.Fprintf(os.Stderr, "SOURCE_F5_TERMINAL_ZERO_PAD count=%d blocks=%d\n", missing, missing/64)
  }
  coeffs := make([]int16,len(raw))
  for i,v := range raw {
    if v < -32768 || v > 32767 { panic(fmt.Sprintf("coefficient %d out of range",i)) }
    coeffs[i] = int16(v)
  }
  result, err := embed.EmbedWithOptions(coeffs, *password, p, embed.EmbedOptions{ForceK:*k})
  if err != nil { panic(err) }
  final := make([]int,len(result.Coefficients))
  for i,v := range result.Coefficients { final[i] = int(v) }
  jpegData,err := decoder.EncodeCoefficients(final); if err != nil { panic(err) }
  reRead:=f5jpeg.NewStandardDecoder()
  roundtrip,err:=reRead.ExtractCoefficients(jpegData); if err != nil {panic(err)}
  if *padTail && len(roundtrip) < len(final) {
    missing := len(final)-len(roundtrip)
    if missing % 64 != 0 || missing > 64 * 400 {
      panic(fmt.Sprintf("unrepresentable JPEG terminal coefficient gap %d",missing))
    }
    roundtrip = append(roundtrip,make([]int,missing)...)
    fmt.Fprintf(os.Stderr,"SERIALIZED_F5_TERMINAL_ZERO_PAD count=%d blocks=%d\n",missing,missing/64)
  }
  if len(roundtrip)!=len(final) {panic(fmt.Sprintf("JPEG coeff count changed %d -> %d",len(final),len(roundtrip)))}
  for i:=range final {
    if roundtrip[i]!=final[i] {panic(fmt.Sprintf("JPEG coefficient modified at %d",i))}
  }
  if err:=os.MkdirAll(filepath.Dir(*out),0755); err!=nil {panic(err)}
  file,err:=os.CreateTemp(filepath.Dir(*out),".f5-native-*"); if err!=nil {panic(err)}
  tmp:=file.Name()
  if _,err=file.Write(jpegData);err!=nil{file.Close();os.Remove(tmp);panic(err)}
  if err=file.Close();err!=nil{os.Remove(tmp);panic(err)}
  if err=os.Rename(tmp,*out);err!=nil{os.Remove(tmp);panic(err)}
  if len(p)==0 {panic(errors.New("empty payload"))}
  meta:=map[string]any{"cover":*cover,"payload_bytes":len(p),"k":*k,
    "shrinkages":result.ShrinkageCount,"input_jpeg_bytes":len(c),"output_jpeg_bytes":len(jpegData),
    "coefficient_count":len(final),"byte_sha256_equal":bytes.Equal(c,jpegData)}
  enc:=json.NewEncoder(os.Stdout)
  if err:=enc.Encode(meta);err!=nil{panic(err)}
}
