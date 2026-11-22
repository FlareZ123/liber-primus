/*
 * Exact libjpeg coefficient histogram for Q92 F5 shrinkage/parity tests.
 * Source-art independent: output 3x3 frequency-band magnitude counts.
 * Usage: f5_mag_hist image.jpg
 */
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <jpeglib.h>

int main(int argc, char **argv) {
  if (argc != 2) { fprintf(stderr, "usage: f5_mag_hist file.jpg\n"); return 2; }
  FILE *in = fopen(argv[1], "rb");
  if (!in) { perror(argv[1]); return 2; }
  struct jpeg_decompress_struct d = {0};
  struct jpeg_error_mgr e;
  d.err = jpeg_std_error(&e);
  jpeg_create_decompress(&d);
  jpeg_stdio_src(&d, in);
  if (jpeg_read_header(&d, TRUE) != JPEG_HEADER_OK) return 3;
  jvirt_barray_ptr *data = jpeg_read_coefficients(&d);
  uint64_t n[3][3][10] = {{{0}}};
  uint64_t slots[3][3] = {{0}};
  int components = d.num_components < 3 ? d.num_components : 3;
  for (int c = 0; c < components; ++c) {
    jpeg_component_info *ci = &d.comp_info[c];
    for (JDIMENSION y = 0; y < ci->height_in_blocks; ++y) {
      JBLOCKARRAY blocks = (*d.mem->access_virt_barray)((j_common_ptr)&d, data[c], y, 1, FALSE);
      for (JDIMENSION x = 0; x < ci->width_in_blocks; ++x) {
        for (int k = 1; k < 64; ++k) {
          int spectral = k / 8 + k % 8;
          int band = spectral <= 3 ? 0 : (spectral <= 7 ? 1 : 2);
          int coefficient = blocks[0][x][k];
          int absval = coefficient < 0 ? -coefficient : coefficient;
          int mag = absval > 8 ? 9 : absval;
          n[c][band][mag]++;
          slots[c][band]++;
        }
      }
    }
  }
  for (int c = 0; c < components; ++c) {
    for (int band = 0; band < 3; ++band) {
      printf("%d,%d,%llu", c, band, (unsigned long long)slots[c][band]);
      for (int mag = 0; mag < 10; ++mag)
        printf(",%llu", (unsigned long long)n[c][band][mag]);
      putchar('\n');
    }
  }
  jpeg_destroy_decompress(&d);
  fclose(in);
  return 0;
}
