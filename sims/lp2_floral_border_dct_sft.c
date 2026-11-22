/*
 * Source-original LibJPEG DCT comparison for LP2 physical p40..p55.
 * Run from a checkout containing resources/liber-primus/57.jpg..72.jpg.
 * C11 + libjpeg, e.g. gcc -O2 sims/lp2_floral_border_dct_sft.c -ljpeg -lm.
 * Source page p maps to original JPEG filename (p+17).jpg.
 */
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <jpeglib.h>
#include <stdint.h>
#include <string.h>

#define FIRST_PAGE 40
#define LAST_PAGE 55
#define BLOCK_W 300
#define BLOCK_H 450
#define BORDER_W 75
#define BORDER_BLOCKS (2 * BORDER_W)
#define BLOCK_COEFFS 64

static int border_column(int x) {
  if (x < BORDER_W) return x;
  if (x >= BLOCK_W - BORDER_W) return x - (BLOCK_W - BORDER_W) + BORDER_W;
  return -1;
}

static void fail(const char *message) {
  fprintf(stderr, "FAIL: %s\n", message);
  exit(1);
}

int main(int argc, char **argv) {
  const char *folder = argc == 2 ? argv[1] : "resources/liber-primus";
  if (argc > 2) fail("usage: sft [source-jpeg-folder]");
  JCOEF *reference = calloc((size_t)BLOCK_H * BORDER_BLOCKS * BLOCK_COEFFS, sizeof(JCOEF));
  if (!reference) fail("allocating original coefficient reference");
  unsigned int *reference_quant = calloc(64, sizeof(unsigned int));
  if (!reference_quant) fail("allocating quantization reference");
  unsigned long long original_border_eligible = 0;
  double min_border_fraction = 1.0;

  puts("page,image,channels,editable_all,editable_border,border_fraction,differing_border_blocks,differing_border_coefficients");
  for (int page = FIRST_PAGE; page <= LAST_PAGE; page++) {
    char path[1024];
    snprintf(path, sizeof(path), "%s/%02d.jpg", folder, page + 17);
    FILE *input = fopen(path, "rb");
    if (!input) { fprintf(stderr, "Cannot open %s\n", path); return 1; }

    struct jpeg_decompress_struct jpg;
    struct jpeg_error_mgr error;
    jpg.err = jpeg_std_error(&error);
    jpeg_create_decompress(&jpg);
    jpeg_stdio_src(&jpg, input);
    if (jpeg_read_header(&jpg, TRUE) != JPEG_HEADER_OK) fail("invalid JPEG header");
    if (jpg.image_width != 2400 || jpg.image_height != 3600) fail("unrecognized source image dimensions");
    jvirt_barray_ptr *coefficient_arrays = jpeg_read_coefficients(&jpg);
    jpeg_component_info *component = &jpg.comp_info[0];
    if (component->width_in_blocks != BLOCK_W || component->height_in_blocks != BLOCK_H)
      fail("unexpected block dimensions or subsampling in Y plane");
    JQUANT_TBL *q = jpg.quant_tbl_ptrs[component->quant_tbl_no];
    if (!q) fail("missing original quantization table");
    for (int k = 0; k < BLOCK_COEFFS; k++) {
      if (page == FIRST_PAGE) reference_quant[k] = q->quantval[k];
      else if (reference_quant[k] != q->quantval[k]) fail("different quantization table");
    }

    unsigned long long editable_all = 0, editable_border = 0;
    unsigned long long diff_blocks = 0, diff_coefficients = 0;
    for (JDIMENSION row = 0; row < component->height_in_blocks; row++) {
      JBLOCKARRAY blocks = (*jpg.mem->access_virt_barray)(
          (j_common_ptr)&jpg, coefficient_arrays[0], row, 1, FALSE);
      for (int col = 0; col < BLOCK_W; col++) {
        int bc = border_column(col);
        JCOEF *values = blocks[0][col];
        int changed = 0;
        for (int k = 0; k < BLOCK_COEFFS; k++) {
          if (k && abs(values[k]) >= 2) {
            editable_all++;
            if (bc >= 0) editable_border++;
          }
          if (bc < 0) continue;
          size_t position = ((size_t)row * BORDER_BLOCKS + (size_t)bc) * BLOCK_COEFFS + (size_t)k;
          if (page == FIRST_PAGE) reference[position] = values[k];
          else if (reference[position] != values[k]) {
            diff_coefficients++;
            changed = 1;
          }
        }
        if (changed) diff_blocks++;
      }
    }
    double fraction = (double)editable_border / (double)editable_all;
    if (fraction < min_border_fraction && page <= 54) min_border_fraction = fraction;
    if (page == FIRST_PAGE) original_border_eligible = editable_border;
    if (page <= 54 && (diff_blocks != 0 || diff_coefficients != 0))
      fail("border coefficients changed on p40..p54");
    if (page <= 54 && editable_border != original_border_eligible)
      fail("source-border editable counts changed");
    printf("%d,%02d.jpg,%d,%llu,%llu,%.9f,%llu,%llu\n", page, page + 17,
           jpg.num_components, editable_all, editable_border, fraction,
           diff_blocks, diff_coefficients);
    jpeg_destroy_decompress(&jpg);
    fclose(input);
  }
  /* A calibrated probabilistic scope statement, conditional on uniform AC selection. */
  double log10_none_200 = 200.0 * log10(1.0 - min_border_fraction);
  printf("PASS: p40..p54 have identical original luma border coefficients; "
         "minimum eligible-AC border share %.9f; "
         "uniform 200-edit none-in-border log10 probability %.3f\n",
         min_border_fraction, log10_none_200);
  puts("SCOPE: p55 has separate artwork; text, chroma, template-preprocessing and nonuniform spatial selection remain open.");
  free(reference_quant);
  free(reference);
  return 0;
}
