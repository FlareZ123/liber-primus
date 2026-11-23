/*
 * Source-exact p40-55 JPEG syntax normalization (C11 and libjpeg).
 * From repository root with original JPEGs in resources/liber-primus/.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <jpeglib.h>
/** @return the first DQT marker offset, n if absent */
static size_t dqt_start(const unsigned char *b,size_t n) {
  for(size_t i=0;i+1<n;i++)if(b[i]==255&&b[i+1]==219)return i;
  return n;
}
static void verify(int page) {
  char filename[128];
  snprintf(filename,sizeof(filename),
    "resources/liber-primus/%d.jpg",page+17);
  FILE *input=fopen(filename,"rb");
  if(!input){perror(filename);exit(2);}
  fseek(input,0,SEEK_END);
  long length=ftell(input);
  rewind(input);
  if(length<=0)exit(2);
  unsigned char *original=malloc((size_t)length);
  if(!original||fread(original,1,(size_t)length,input)!=(size_t)length)
    exit(2);
  rewind(input);
  struct jpeg_decompress_struct decoder;
  struct jpeg_compress_struct encoder;
  struct jpeg_error_mgr source_error,target_error;
  decoder.err=jpeg_std_error(&source_error);
  encoder.err=jpeg_std_error(&target_error);
  jpeg_create_decompress(&decoder);
  jpeg_create_compress(&encoder);
  jpeg_stdio_src(&decoder,input);
  jpeg_read_header(&decoder,TRUE);
  jvirt_barray_ptr *coefficients=jpeg_read_coefficients(&decoder);
  jpeg_copy_critical_parameters(&decoder,&encoder);
  encoder.optimize_coding=TRUE;
  unsigned char *encoded=NULL;
  unsigned long encoded_size=0;
  jpeg_mem_dest(&encoder,&encoded,&encoded_size);
  jpeg_write_coefficients(&encoder,coefficients);
  jpeg_finish_compress(&encoder);
  jpeg_finish_decompress(&decoder);
  jpeg_destroy_compress(&encoder);
  jpeg_destroy_decompress(&decoder);
  fclose(input);
  size_t start=dqt_start(original,(size_t)length);
  size_t other=dqt_start(encoded,encoded_size);
  if(start==(size_t)length||other==encoded_size||
     (size_t)length-start!=encoded_size-other||
     memcmp(original+start,encoded+other,encoded_size-other)){
    fprintf(stderr,"DQT-to-EOI source mismatch on p%d\n",page);
    exit(3);
  }
  // Planted single-byte perturbation must fail the same exact comparator.
  encoded[other+10]^=1;
  if(memcmp(original+start,encoded+other,encoded_size-other)==0)exit(4);
  encoded[other+10]^=1;
  printf("p%d PASS: %zu original bytes from first DQT through EOI match\n",
    page,encoded_size-other);
  free(original);
  free(encoded);
}
int main(void){
  for(int page=40;page<=55;page++)verify(page);
  return 0;
}
