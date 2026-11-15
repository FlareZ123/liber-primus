/*
 * LP2 original JPEG keyless sequential DCT-AC LSB receiver.
 *
 * Self-contained read-only experiment, libjpeg 6b/8/9 compatible.
 * Inputs: exact Stage11 JPEG scans 17.jpg through 74.jpg (arguments).
 * Modes: (0) zigzag skip |v|<=1; (1) zigzag include |v|=1;
 *        (2) native coefficient order skip |v|<=1;
 *        (3) native coefficient order include |v|=1.
 * All modes omit DC and zero AC, traverse the luminance block raster
 * top-to-bottom, then read 512 bytes of MSB-packed abs(coefficient)&1.
 *
 * This is not a claim about keyed OutGuess or OpenPuff extraction.
 * Usage: compile with libjpeg and pass the 58 original JPEG paths.
 * Each output row: source path, mode, eligible bits, 512-byte hex.
 */
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <jpeglib.h>

static const int zigzag[64] = {
  0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,
  26,33,40,48,41,34,27,20,13,6,7,14,21,28,35,42,49,
  56,57,50,43,36,29,22,15,23,30,37,44,51,58,59,52,
  45,38,31,39,46,53,60,61,54,47,55,62,63
};

/** Read first 512 output bytes from an original JPEG's luma coefficients. */
static int receive(const char *filename, int mode, unsigned char out[512]) {
  FILE *file = fopen(filename, "rb");
  if (file == NULL) {
    perror(filename);
    return -1;
  }
  struct jpeg_decompress_struct src;
  struct jpeg_error_mgr errors;
  src.err = jpeg_std_error(&errors);
  jpeg_create_decompress(&src);
  jpeg_stdio_src(&src, file);
  jpeg_read_header(&src, TRUE);
  jvirt_barray_ptr *coeff = jpeg_read_coefficients(&src);
  jpeg_component_info *comp = &src.comp_info[0];
  int bits = 0;
  memset(out, 0, 512);
  const int native_order = (mode & 2) != 0;
  const int allow_one = (mode & 1) != 0;

  for (JDIMENSION y = 0; y < comp->height_in_blocks && bits < 4096; y++) {
    JBLOCKARRAY rows = (*src.mem->access_virt_barray)(
      (j_common_ptr)&src, coeff[0], y, 1, FALSE);
    for (JDIMENSION x = 0; x < comp->width_in_blocks && bits < 4096; x++) {
      JCOEF *block = rows[0][x];
      for (int k = 1; k < 64 && bits < 4096; k++) {
        const int v = (int)block[native_order ? k : zigzag[k]];
        if (v == 0 || (!allow_one && abs(v) == 1)) continue;
        const unsigned int bit = (unsigned int)abs(v) & 1u;
        out[bits / 8] |= (unsigned char)(bit << (7 - (bits & 7)));
        bits++;
      }
    }
  }
  jpeg_finish_decompress(&src);
  jpeg_destroy_decompress(&src);
  fclose(file);
  return bits;
}

int main(int argc, char **argv) {
  if (argc < 2) {
    fprintf(stderr, "Expected original JPEG paths as arguments.\n");
    return 2;
  }
  unsigned char out[512];
  for (int source = 1; source < argc; source++) {
    for (int mode = 0; mode < 4; mode++) {
      const int bits = receive(argv[source], mode, out);
      if (bits < 0) return 2;
      printf("%s\t%d\t%d\t", argv[source], mode, bits);
      for (int byte = 0; byte < 512; byte++) printf("%02x", out[byte]);
      putchar('\n');
    }
  }
  return 0;
}
