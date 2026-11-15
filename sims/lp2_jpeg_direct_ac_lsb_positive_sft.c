/*
 * Independent positive for the keyless LP2 sequential AC-LSB receiver.
 * Uses an unmodified original JPEG as cover, modifies only an in-memory
 * coefficient array, encodes a new JPEG in memory and decodes it again.
 * No source JPEG and no output file are changed on disk.
 * Requires libjpeg with jpeg_mem_src / jpeg_mem_dest.
 */
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <jpeglib.h>

static const int zig[64] = {
  0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,
  26,33,40,48,41,34,27,20,13,6,7,14,21,28,35,42,49,
  56,57,50,43,36,29,22,15,23,30,37,44,51,58,59,52,
  45,38,31,39,46,53,60,61,54,47,55,62,63
};
static const unsigned char message[] = "LP2_DCT_LSB_POSITIVE_2026";

/** Recover the embedded marker from a source-size encoded JPEG. */
static int receive(struct jpeg_decompress_struct *d, jvirt_barray_ptr *blocks,
                   unsigned char *out, size_t length) {
  jpeg_component_info *c = &d->comp_info[0];
  size_t bit = 0;
  memset(out, 0, length);
  for (JDIMENSION y = 0; y < c->height_in_blocks && bit < length * 8; y++) {
    JBLOCKARRAY row = (*d->mem->access_virt_barray)(
      (j_common_ptr)d, blocks[0], y, 1, FALSE);
    for (JDIMENSION x = 0; x < c->width_in_blocks && bit < length * 8; x++) {
      for (int k = 1; k < 64 && bit < length * 8; k++) {
        const int v = row[0][x][zig[k]];
        if (abs(v) < 2) continue;
        out[bit / 8] |= (unsigned char)((abs(v) & 1) << (7 - (bit % 8)));
        bit++;
      }
    }
  }
  return bit == length * 8 ? 0 : -1;
}

int main(int argc, char **argv) {
  if (argc != 2) {
    fprintf(stderr, "Expected one unchanged source JPEG path.\n");
    return 2;
  }
  FILE *fp = fopen(argv[1], "rb");
  if (fp == NULL) return 2;
  struct jpeg_decompress_struct d;
  struct jpeg_error_mgr de;
  d.err = jpeg_std_error(&de);
  jpeg_create_decompress(&d);
  jpeg_stdio_src(&d, fp);
  jpeg_read_header(&d, TRUE);
  jvirt_barray_ptr *src = jpeg_read_coefficients(&d);
  jpeg_component_info *c = &d.comp_info[0];
  size_t bit = 0;
  const size_t length = sizeof(message) - 1;

  for (JDIMENSION y = 0; y < c->height_in_blocks && bit < length * 8; y++) {
    JBLOCKARRAY row = (*d.mem->access_virt_barray)(
      (j_common_ptr)&d, src[0], y, 1, TRUE);
    for (JDIMENSION x = 0; x < c->width_in_blocks && bit < length * 8; x++) {
      for (int k = 1; k < 64 && bit < length * 8; k++) {
        JCOEF *v = &row[0][x][zig[k]];
        const int absval = abs((int)*v);
        if (absval < 2) continue;
        const int expected = (message[bit / 8] >> (7 - (bit % 8))) & 1;
        if ((absval & 1) != expected) {
          const int adjusted = absval == 2 ? 3 : absval - 1;
          *v = (JCOEF)(*v >= 0 ? adjusted : -adjusted);
        }
        bit++;
      }
    }
  }
  if (bit != length * 8) {
    fprintf(stderr, "Insufficient source AC capacity.\n");
    return 3;
  }

  struct jpeg_compress_struct encoder;
  struct jpeg_error_mgr encoder_errors;
  encoder.err = jpeg_std_error(&encoder_errors);
  jpeg_create_compress(&encoder);
  unsigned char *encoded = NULL;
  unsigned long encoded_size = 0;
  jpeg_mem_dest(&encoder, &encoded, &encoded_size);
  jpeg_copy_critical_parameters(&d, &encoder);
  jpeg_write_coefficients(&encoder, src);
  jpeg_finish_compress(&encoder);
  jpeg_destroy_compress(&encoder);
  jpeg_finish_decompress(&d);
  jpeg_destroy_decompress(&d);
  fclose(fp);

  struct jpeg_decompress_struct reread;
  struct jpeg_error_mgr reread_errors;
  reread.err = jpeg_std_error(&reread_errors);
  jpeg_create_decompress(&reread);
  jpeg_mem_src(&reread, encoded, encoded_size);
  jpeg_read_header(&reread, TRUE);
  jvirt_barray_ptr *outcoeff = jpeg_read_coefficients(&reread);
  unsigned char recovered[sizeof(message) - 1];
  const int matched = receive(&reread, outcoeff, recovered, length) == 0
    && memcmp(recovered, message, length) == 0;
  printf("embedded_bits=%zu jpeg_bytes=%lu exact_recovery=%s text=%.*s\n",
         length * 8, encoded_size, matched ? "yes" : "no",
         (int)length, recovered);
  jpeg_finish_decompress(&reread);
  jpeg_destroy_decompress(&reread);
  free(encoded);
  return matched ? 0 : 4;
}
