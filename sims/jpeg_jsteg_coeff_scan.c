/*
 * Source-level JSteg-style AC-coefficient LSB extraction/planting.
 * Uses libjpeg's original quantized DCT coefficient arrays; no pixel
 * re-encoding is performed during extraction.
 */
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <errno.h>
#include <jpeglib.h>

static const int ZIGZAG[64] = {
  0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,
  12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,
  28,35,42,49,56,57,50,43,36,29,22,15,23,30,37,
  44,51,58,59,52,45,38,31,39,46,53,60,61,54,47,
  55,62,63
};

typedef int (*block_callback)(JCOEF *block, void *context);

static int visit_blocks(struct jpeg_decompress_struct *cinfo,
                        jvirt_barray_ptr *coef, int mcu_order, int writable,
                        block_callback callback, void *context) {
  if (!mcu_order) {
    for (int ci = 0; ci < cinfo->num_components; ci++) {
      jpeg_component_info *comp = &cinfo->comp_info[ci];
      for (JDIMENSION y = 0; y < comp->height_in_blocks; y++) {
        JBLOCKARRAY row = (*cinfo->mem->access_virt_barray)(
          (j_common_ptr)cinfo, coef[ci], y, 1, writable);
        for (JDIMENSION x = 0; x < comp->width_in_blocks; x++)
          if (callback(row[0][x], context)) return 1;
      }
    }
    return 0;
  }

  int mcu_cols = (int)((cinfo->image_width + cinfo->max_h_samp_factor * DCTSIZE - 1) /
                       (cinfo->max_h_samp_factor * DCTSIZE));
  int mcu_rows = (int)((cinfo->image_height + cinfo->max_v_samp_factor * DCTSIZE - 1) /
                       (cinfo->max_v_samp_factor * DCTSIZE));
  JBLOCKARRAY cache[4][4];
  for (int my = 0; my < mcu_rows; my++) {
    memset(cache, 0, sizeof(cache));
    for (int ci = 0; ci < cinfo->num_components; ci++) {
      jpeg_component_info *comp = &cinfo->comp_info[ci];
      for (int vy = 0; vy < comp->v_samp_factor; vy++) {
        JDIMENSION y = (JDIMENSION)(my * comp->v_samp_factor + vy);
        if (y < comp->height_in_blocks)
          cache[ci][vy] = (*cinfo->mem->access_virt_barray)(
            (j_common_ptr)cinfo, coef[ci], y, 1, writable);
      }
    }
    for (int mx = 0; mx < mcu_cols; mx++) {
      for (int ci = 0; ci < cinfo->num_components; ci++) {
        jpeg_component_info *comp = &cinfo->comp_info[ci];
        for (int vy = 0; vy < comp->v_samp_factor; vy++) {
          JDIMENSION y = (JDIMENSION)(my * comp->v_samp_factor + vy);
          if (y >= comp->height_in_blocks || !cache[ci][vy]) continue;
          for (int hx = 0; hx < comp->h_samp_factor; hx++) {
            JDIMENSION x = (JDIMENSION)(mx * comp->h_samp_factor + hx);
            if (x < comp->width_in_blocks && callback(cache[ci][vy][0][x], context)) return 1;
          }
        }
      }
    }
  }
  return 0;
}

typedef struct {
  FILE *fp;
  uint8_t byte;
  int used;
  uint64_t bits, ones, skipped_zero, skipped_one;
  uint64_t hist[32768];
  uint64_t prefix_hist[3][32768];
  uint64_t prefix_count[3];
} ExtractState;
static const uint64_t PREFIX_LIMITS[3] = {256, 4096, 65536};

static void put_bit(ExtractState *s, unsigned bit) {
  s->byte = (uint8_t)((s->byte << 1) | (bit & 1));
  if (++s->used == 8) { fputc(s->byte, s->fp); s->byte = 0; s->used = 0; }
  s->bits++;
  s->ones += (bit & 1);
}
static int extract_block(JCOEF *block, void *context) {
  ExtractState *s = (ExtractState *)context;
  for (int k = 1; k < 64; k++) {
    int v = (int)block[ZIGZAG[k]];
    unsigned mag = (unsigned)(v < 0 ? -v : v);
    if (mag == 0) { s->skipped_zero++; continue; }
    if (mag == 1) { s->skipped_one++; continue; }
    if (mag < 32768) s->hist[mag]++;
    for (int j = 0; j < 3; j++) if (s->prefix_count[j] < PREFIX_LIMITS[j]) {
      if (mag < 32768) s->prefix_hist[j][mag]++;
      s->prefix_count[j]++;
    }
    put_bit(s, mag & 1U);
  }
  return 0;
}
static void finish_bits(ExtractState *s) {
  if (s->used) { s->byte <<= (8 - s->used); fputc(s->byte, s->fp); s->byte = 0; s->used = 0; }
}
static double chi_pair(const uint64_t *h) {
  double x = 0.0;
  for (int a = 2; a + 1 < 256; a += 2) {
    uint64_t u = h[a], v = h[a + 1];
    if (u + v) { double d = (double)u - (double)v; x += d * d / (double)(u + v); }
  }
  return x;
}
static double imbalance_pair(const uint64_t *h) {
  uint64_t num = 0, den = 0;
  for (int a = 2; a + 1 < 256; a += 2) {
    uint64_t u = h[a], v = h[a + 1]; num += u > v ? u - v : v - u; den += u + v;
  }
  return den ? (double)num / (double)den : 0.0;
}

static int extract_image(const char *inpath, const char *outpath, int mcu_order) {
  FILE *in = fopen(inpath, "rb");
  if (!in) { fprintf(stderr, "open %s: %s\n", inpath, strerror(errno)); return 0; }
  struct jpeg_decompress_struct cinfo; struct jpeg_error_mgr jerr;
  cinfo.err = jpeg_std_error(&jerr); jpeg_create_decompress(&cinfo); jpeg_stdio_src(&cinfo, in);
  if (jpeg_read_header(&cinfo, TRUE) != JPEG_HEADER_OK) { fprintf(stderr, "bad JPEG %s\n", inpath); return 0; }
  jvirt_barray_ptr *coef = jpeg_read_coefficients(&cinfo);
  FILE *out = fopen(outpath, "wb");
  if (!out) { fprintf(stderr, "open %s: %s\n", outpath, strerror(errno)); return 0; }
  ExtractState s = {0}; s.fp = out;
  visit_blocks(&cinfo, coef, mcu_order, 0, extract_block, &s);
  finish_bits(&s); fclose(out);
  printf("%s,%s,%u,%u,%d,%d,%d,%d,%llu,%llu,%llu,%llu,%llu,%llu,%llu,%llu,%.6f,%.6f,%.6f,%.6f,%.6f,%.6f,%.6f,%.6f\n",
    inpath, mcu_order ? "mcu" : "component", cinfo.image_width, cinfo.image_height,
    cinfo.num_components, cinfo.data_precision,
    cinfo.comp_info[0].h_samp_factor, cinfo.comp_info[0].v_samp_factor,
    (unsigned long long)s.bits, (unsigned long long)s.ones,
    (unsigned long long)(s.bits - s.ones), (unsigned long long)s.skipped_zero,
    (unsigned long long)s.skipped_one,
    (unsigned long long)s.prefix_count[0], (unsigned long long)s.prefix_count[1],
    (unsigned long long)s.prefix_count[2],
    chi_pair(s.prefix_hist[0]), imbalance_pair(s.prefix_hist[0]),
    chi_pair(s.prefix_hist[1]), imbalance_pair(s.prefix_hist[1]),
    chi_pair(s.prefix_hist[2]), imbalance_pair(s.prefix_hist[2]),
    chi_pair(s.hist), imbalance_pair(s.hist));
  jpeg_finish_decompress(&cinfo); jpeg_destroy_decompress(&cinfo); fclose(in); return 1;
}

typedef struct { const unsigned char *payload; size_t length; uint64_t bitpos; } PlantState;
static int plant_block(JCOEF *block, void *context) {
  PlantState *s = (PlantState *)context;
  uint64_t total = (uint64_t)s->length * 8;
  for (int k = 1; k < 64 && s->bitpos < total; k++) {
    int v = (int)block[ZIGZAG[k]], mag = v < 0 ? -v : v;
    if (mag <= 1) continue;
    unsigned bit = (s->payload[s->bitpos / 8] >> (7 - (s->bitpos % 8))) & 1U;
    if (((unsigned)mag & 1U) != bit) {
      if (v > 0) block[ZIGZAG[k]] = (JCOEF)(v < 32767 ? v + 1 : v - 1);
      else block[ZIGZAG[k]] = (JCOEF)(v > -32768 ? v - 1 : v + 1);
    }
    s->bitpos++;
  }
  return s->bitpos >= total;
}
static int plant_image(const char *inpath, const char *outpath, const char *payload_path, int mcu_order) {
  FILE *pf = fopen(payload_path, "rb");
  if (!pf) { fprintf(stderr, "open payload %s: %s\n", payload_path, strerror(errno)); return 0; }
  fseek(pf, 0, SEEK_END); long plen = ftell(pf); rewind(pf);
  if (plen < 0) { fclose(pf); return 0; }
  unsigned char *payload = (unsigned char *)malloc((size_t)plen ? (size_t)plen : 1);
  if (!payload || fread(payload, 1, (size_t)plen, pf) != (size_t)plen) { fclose(pf); free(payload); return 0; }
  fclose(pf);
  FILE *in = fopen(inpath, "rb");
  if (!in) { fprintf(stderr, "open %s: %s\n", inpath, strerror(errno)); free(payload); return 0; }
  struct jpeg_decompress_struct src; struct jpeg_error_mgr sj;
  src.err = jpeg_std_error(&sj); jpeg_create_decompress(&src); jpeg_stdio_src(&src, in);
  if (jpeg_read_header(&src, TRUE) != JPEG_HEADER_OK) { fprintf(stderr, "bad JPEG %s\n", inpath); return 0; }
  jvirt_barray_ptr *coef = jpeg_read_coefficients(&src);
  PlantState ps = {payload, (size_t)plen, 0};
  visit_blocks(&src, coef, mcu_order, 1, plant_block, &ps);
  if (ps.bitpos != (uint64_t)plen * 8) {
    fprintf(stderr, "capacity too small: %llu/%llu bits\n", (unsigned long long)ps.bitpos, (unsigned long long)plen * 8);
    return 0;
  }
  FILE *out = fopen(outpath, "wb");
  if (!out) { fprintf(stderr, "open %s: %s\n", outpath, strerror(errno)); return 0; }
  struct jpeg_compress_struct dst; struct jpeg_error_mgr dj;
  dst.err = jpeg_std_error(&dj); jpeg_create_compress(&dst); jpeg_stdio_dest(&dst, out);
  jpeg_copy_critical_parameters(&src, &dst); jpeg_write_coefficients(&dst, coef); jpeg_finish_compress(&dst);
  fclose(out); jpeg_finish_decompress(&src); jpeg_destroy_compress(&dst); jpeg_destroy_decompress(&src); fclose(in); free(payload);
  printf("PLANTED %llu bits (%ld bytes) order=%s into %s\n", (unsigned long long)ps.bitpos, plen, mcu_order ? "mcu" : "component", outpath);
  return 1;
}

int main(int argc, char **argv) {
  if (argc == 6 && strcmp(argv[1], "extract") == 0) {
    const char *indir = argv[2], *outdir = argv[3]; int first = atoi(argv[4]), last = atoi(argv[5]);
    printf("file,order,width,height,components,precision,first_h_samp,first_v_samp,bits,ones,zeros,skipped_zero,skipped_one,prefix256,prefix4096,prefix65536,chi256,imbalance256,chi4096,imbalance4096,chi65536,imbalance65536,chi_full,imbalance_full\n");
    for (int p = first; p <= last; p++) {
      char ip[1024], op[1024]; snprintf(ip, sizeof(ip), "%s/%02d.jpg", indir, p);
      for (int order = 0; order < 2; order++) {
        snprintf(op, sizeof(op), "%s/%02d_%s.bin", outdir, p, order ? "mcu" : "component");
        if (!extract_image(ip, op, order)) return 1;
      }
    }
    return 0;
  }
  if (argc == 6 && strcmp(argv[1], "plant") == 0) {
    int mcu_order = strcmp(argv[5], "mcu") == 0;
    if (strcmp(argv[5], "mcu") != 0 && strcmp(argv[5], "component") != 0) return 2;
    return plant_image(argv[2], argv[3], argv[4], mcu_order) ? 0 : 1;
  }
  fprintf(stderr, "usage:\n  %s extract <input-dir> <output-dir> <first-page> <last-page>\n  %s plant <input.jpg> <output.jpg> <payload.bin> <component|mcu>\n", argv[0], argv[0]);
  return 2;
}
