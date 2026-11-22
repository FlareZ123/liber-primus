/* Losslessly re-encode JPEG DCT coefficients with deterministic libjpeg tables.
 * Build: cc -O2 jpeg_entropy_reencode.c -ljpeg -o jpeg_entropy_reencode
 */
#include <stdio.h>
#include <stdlib.h>
#include <jpeglib.h>

int main(int argc, char **argv) {
    if (argc != 4) {
        fprintf(stderr, "expected input.jpg output.jpg optimize_flag\n");
        return 1;
    }
    FILE *in = fopen(argv[1], "rb");
    FILE *out = fopen(argv[2], "wb");
    if (!in || !out) {
        perror("JPEG input/output");
        return 2;
    }
    struct jpeg_decompress_struct source;
    struct jpeg_compress_struct dest;
    struct jpeg_error_mgr source_error, dest_error;
    source.err = jpeg_std_error(&source_error);
    dest.err = jpeg_std_error(&dest_error);
    jpeg_create_decompress(&source);
    jpeg_create_compress(&dest);
    jpeg_stdio_src(&source, in);
    jpeg_read_header(&source, TRUE);
    jvirt_barray_ptr *coefficients = jpeg_read_coefficients(&source);
    jpeg_stdio_dest(&dest, out);
    jpeg_copy_critical_parameters(&source, &dest);
    dest.optimize_coding = atoi(argv[3]) != 0;
    jpeg_write_coefficients(&dest, coefficients);
    jpeg_finish_compress(&dest);
    jpeg_finish_decompress(&source);
    jpeg_destroy_compress(&dest);
    jpeg_destroy_decompress(&source);
    fclose(in);
    fclose(out);
    return 0;
}
