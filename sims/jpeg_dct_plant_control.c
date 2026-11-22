#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <jpeglib.h>
static const int zz[64]={0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63};
int main(int argc,char**argv){
 if(argc!=4){fprintf(stderr,"source target hex-payload\n");return 2;}
 size_t hexlen=strlen(argv[3]);if(hexlen%2){fprintf(stderr,"odd hexlen\n");return 2;}
 size_t len=hexlen/2;uint8_t*payload=malloc(len);if(!payload)return 2;
 for(size_t j=0;j<len;j++){unsigned int x;if(sscanf(argv[3]+j*2,"%2x",&x)!=1)return 2;payload[j]=(uint8_t)x;}
 FILE*f=fopen(argv[1],"rb"),*w=fopen(argv[2],"wb");if(!f||!w)return 2;
 struct jpeg_decompress_struct c; struct jpeg_error_mgr e;
 c.err=jpeg_std_error(&e);jpeg_create_decompress(&c);jpeg_stdio_src(&c,f);jpeg_read_header(&c,TRUE);
 jvirt_barray_ptr*coef=jpeg_read_coefficients(&c);jpeg_component_info*com=&c.comp_info[0];
 const JDIMENSION mcu_cols=(c.image_width+8*c.max_h_samp_factor-1)/(8*c.max_h_samp_factor);
 const JDIMENSION mcu_rows=(c.image_height+8*c.max_v_samp_factor-1)/(8*c.max_v_samp_factor);
 size_t bit=0,modified=0;
 for(JDIMENSION my=0;my<mcu_rows && bit<8*len;my++)for(JDIMENSION mx=0;mx<mcu_cols && bit<8*len;mx++)
 for(int vy=0;vy<com->v_samp_factor && bit<8*len;vy++)for(int hx=0;hx<com->h_samp_factor && bit<8*len;hx++){
  JDIMENSION by=my*com->v_samp_factor+vy,bx=mx*com->h_samp_factor+hx;
  if(by>=com->height_in_blocks||bx>=com->width_in_blocks)continue;
  JBLOCKARRAY row=(*c.mem->access_virt_barray)((j_common_ptr)&c,coef[0],by,1,TRUE);
  for(int k=1;k<64 && bit<8*len;k++){
   JCOEF*v=&row[0][bx][zz[k]];int magnitude=abs(*v);
   if(magnitude<=1)continue;
   int desired=(payload[bit/8]>>(7-(bit%8)))&1;
   if((magnitude&1)!=desired){magnitude++;*v=(JCOEF)(*v<0?-magnitude:magnitude);modified++;}
   bit++;
  }
 }
 if(bit!=8*len){fprintf(stderr,"not enough capacity\n");return 2;}
 struct jpeg_compress_struct d;struct jpeg_error_mgr de;d.err=jpeg_std_error(&de);jpeg_create_compress(&d);jpeg_stdio_dest(&d,w);
 jpeg_copy_critical_parameters(&c,&d);jpeg_write_coefficients(&d,coef);
 jpeg_finish_compress(&d);jpeg_destroy_compress(&d);
 jpeg_finish_decompress(&c);jpeg_destroy_decompress(&c);
 fclose(w);fclose(f);free(payload);
 printf("payload_bytes=%zu changed_coefficients=%zu\n",len,modified);return 0;
}
