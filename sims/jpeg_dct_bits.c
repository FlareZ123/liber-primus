#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <jpeglib.h>

/*
 * Export raw entropy-independent quantized-DCT AC parity in a specified
 * deterministic traversal. The first line is the exact bit count, followed
 * by packed MSB-first bytes. Does not modify source JPEGs.
 *
 * ./jpeg_dct_bits FILE order(0=planar,1=MCU) zigzag(0/1) omit_abs_one(0/1)
 */
static const unsigned char zz[64]={
  0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,26,33,
  40,48,41,34,27,20,13,6,7,14,21,28,35,42,49,56,57,50,
  43,36,29,22,15,23,30,37,44,51,58,59,52,45,38,31,39,
  46,53,60,61,54,47,55,62,63};
static unsigned char *data;
static size_t bits,cap;
static void bitout(int value) {
  size_t i=bits>>3;
  if (i>=cap) {
    size_t old=cap;cap=cap?cap*2:8192;
    data=realloc(data,cap);if(!data)exit(3);
    for(size_t j=old;j<cap;j++)data[j]=0;
  }
  data[i]|=(unsigned char)((value&1) << (7-(bits&7)));
  bits++;
}
static void blockbits(JCOEFPTR v,int zig,int ones) {
  for(int j=1;j<64;j++) {
    int n=v[zig?zz[j]:j],a=abs(n);
    if(a==0 || (ones && a==1))continue;
    bitout(a&1);
  }
}
int main(int argc,char **argv) {
  if(argc!=5)return fprintf(stderr,"usage: jpeg_dct_bits jpg order zigzag omit_one\n"),2;
  int order=atoi(argv[2]),zig=atoi(argv[3]),ones=atoi(argv[4]);
  if(order<0||order>1||zig<0||zig>1||ones<0||ones>1)return 2;
  FILE *fp=fopen(argv[1],"rb");if(!fp)return perror(argv[1]),2;
  struct jpeg_decompress_struct jd;
  struct jpeg_error_mgr err;
  jd.err=jpeg_std_error(&err);
  jpeg_create_decompress(&jd);jpeg_stdio_src(&jd,fp);
  jpeg_read_header(&jd,TRUE);
  jvirt_barray_ptr *array=jpeg_read_coefficients(&jd);
  if(!order) {
    for(int k=0;k<jd.num_components;k++) {
      jpeg_component_info *ci=&jd.comp_info[k];
      for(JDIMENSION y=0;y<ci->height_in_blocks;y++) {
        JBLOCKARRAY row=(*jd.mem->access_virt_barray)
          ((j_common_ptr)&jd,array[k],y,1,FALSE);
        for(JDIMENSION x=0;x<ci->width_in_blocks;x++)
          blockbits(row[0][x],zig,ones);
      }
    }
  } else {
    jpeg_component_info *ci0=&jd.comp_info[0];
    JDIMENSION mcus_x=(ci0->width_in_blocks+ci0->h_samp_factor-1)/ci0->h_samp_factor;
    JDIMENSION mcus_y=(ci0->height_in_blocks+ci0->v_samp_factor-1)/ci0->v_samp_factor;
    for(JDIMENSION my=0;my<mcus_y;my++)
      for(JDIMENSION mx=0;mx<mcus_x;mx++)
        for(int k=0;k<jd.num_components;k++) {
          jpeg_component_info *ci=&jd.comp_info[k];
          for(int vy=0;vy<ci->v_samp_factor;vy++) {
            JDIMENSION y=my*ci->v_samp_factor+vy;
            if(y>=ci->height_in_blocks)continue;
            JBLOCKARRAY row=(*jd.mem->access_virt_barray)
              ((j_common_ptr)&jd,array[k],y,1,FALSE);
            for(int hx=0;hx<ci->h_samp_factor;hx++) {
              JDIMENSION x=mx*ci->h_samp_factor+hx;
              if(x<ci->width_in_blocks)blockbits(row[0][x],zig,ones);
            }
          }
        }
  }
  printf("%zu\n",bits);
  fwrite(data,1,(bits+7)/8,stdout);
  free(data);
  jpeg_finish_decompress(&jd);jpeg_destroy_decompress(&jd);fclose(fp);
  return ferror(stdout)?3:0;
}
