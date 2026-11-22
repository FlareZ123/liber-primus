/*
 * Lossless JPEG-coefficient five-dot ROI extraction from three original LP2 scans.
 * This preserves original Y/Cb/Cr quantized DCT values and quantization tables
 * instead of re-encoding a pixel crop. All ROIs start/end at 16-pixel MCU edges.
 *
 * Compile: C11, libjpeg (jpeglib.h), math-free.
 * Usage: roi input.jpg output.jpg x y width height
 * Exact-source SFT wrapper: sims/lp2_fivedot_f5_roi_screen_sft.py
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <jpeglib.h>

int main(int argc, char **argv) {
  if (argc != 7) {
    fprintf(stderr, "usage: roi in.jpg out.jpg x y width height (multiples of 16)\n");
    return 2;
  }
  int x = atoi(argv[3]), y = atoi(argv[4]);
  int width = atoi(argv[5]), height = atoi(argv[6]);
  if (x < 0 || y < 0 || width < 16 || height < 16 ||
      ((x | y | width | height) & 15) != 0) return 2;

  FILE *input = fopen(argv[1], "rb");
  if (!input) { perror(argv[1]); return 3; }
  struct jpeg_decompress_struct src = {0};
  struct jpeg_compress_struct dst = {0};
  struct jpeg_error_mgr srcerr, dsterr;
  src.err = jpeg_std_error(&srcerr);
  dst.err = jpeg_std_error(&dsterr);
  jpeg_create_decompress(&src);
  jpeg_stdio_src(&src, input);
  if (jpeg_read_header(&src, TRUE) != JPEG_HEADER_OK) return 4;
  if (x + width > (int)src.image_width || y + height > (int)src.image_height ||
      src.num_components != 3) return 5;
  jvirt_barray_ptr *original = jpeg_read_coefficients(&src);

  FILE *output = fopen(argv[2], "wb");
  if (!output) { perror(argv[2]); return 6; }
  jpeg_create_compress(&dst);
  jpeg_stdio_dest(&dst, output);
  jpeg_copy_critical_parameters(&src, &dst);
  dst.image_width = (JDIMENSION)width;
  dst.image_height = (JDIMENSION)height;

  jvirt_barray_ptr *cropped = (jvirt_barray_ptr *)
    (*dst.mem->alloc_small)((j_common_ptr)&dst, JPOOL_IMAGE,
                             (size_t)dst.num_components * sizeof(jvirt_barray_ptr));
  JDIMENSION offset_x[3], offset_y[3], blocks_w[3], blocks_h[3];
  for (int ci = 0; ci < dst.num_components; ci++) {
    const jpeg_component_info *component = dst.comp_info + ci;
    int hf = component->h_samp_factor, vf = component->v_samp_factor;
    offset_x[ci] = (JDIMENSION)(x * hf / (DCTSIZE * src.max_h_samp_factor));
    offset_y[ci] = (JDIMENSION)(y * vf / (DCTSIZE * src.max_v_samp_factor));
    blocks_w[ci] = (JDIMENSION)(width * hf / (DCTSIZE * src.max_h_samp_factor));
    blocks_h[ci] = (JDIMENSION)(height * vf / (DCTSIZE * src.max_v_samp_factor));
    cropped[ci] = (*dst.mem->request_virt_barray)(
      (j_common_ptr)&dst, JPOOL_IMAGE, FALSE, blocks_w[ci], blocks_h[ci], 2);
  }
  fprintf(stderr, "ROI initial: source %u x %u target %d x %d, Y %u x %u, C %u x %u, source sampling %d x %d\n",
      src.image_width, src.image_height, width, height, blocks_w[0], blocks_h[0],
      blocks_w[1], blocks_h[1], src.max_h_samp_factor, src.max_v_samp_factor);
  jpeg_write_coefficients(&dst, cropped);
  fprintf(stderr, "ROI destination ready\n");
  for (int ci = 0; ci < dst.num_components; ci++) {
    for (JDIMENSION row = 0; row < blocks_h[ci]; row++) {
      if (row == 0) fprintf(stderr, "ROI comp %d access source first row\n", ci);
      JBLOCKARRAY original_row = (*src.mem->access_virt_barray)(
        (j_common_ptr)&src, original[ci], offset_y[ci] + row, 1, FALSE);
      if (row == 0) fprintf(stderr, "ROI comp %d access dest first row\n", ci);
      JBLOCKARRAY crop_row = (*dst.mem->access_virt_barray)(
        (j_common_ptr)&dst, cropped[ci], row, 1, TRUE);
      memcpy(crop_row[0], original_row[0] + offset_x[ci],
             (size_t)blocks_w[ci] * sizeof(JBLOCK));
    }
  }
  fprintf(stderr, "ROI copied all coefficient blocks\n");
  jpeg_finish_compress(&dst);
  jpeg_destroy_compress(&dst);
  jpeg_destroy_decompress(&src);
  fclose(input);
  fclose(output);
  printf("crop x=%d y=%d w=%d h=%d preserves original DCT: %s\n",
         x, y, width, height, argv[2]);
  return 0;
}
