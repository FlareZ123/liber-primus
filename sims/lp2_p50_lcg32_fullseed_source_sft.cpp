// Exhaustive 2^24 initial-state choices consistent with the first byte,
// for five commonplace 32-bit LCGs and six byte-window placements.
// Portable C++17; reads the original-derived p50 base60 byte table.
#include <array>
#include <cassert>
#include <cctype>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <iterator>
#include <stdexcept>
#include <string>

struct Generator {const char* name; uint32_t a, c;};
constexpr Generator gens[]={
 {"MSVC",214013u,2531011u},
 {"ANSI",1103515245u,12345u},
 {"NumericalRecipes",1664525u,1013904223u},
 {"Borland",22695477u,1u},
 {"Delphi",134775813u,1u}
};
constexpr int shifts[]={0,8,15,16,23,24};

std::array<uint8_t,256> read_table(const std::string& path){
 std::ifstream f(path,std::ios::binary);
 if(!f)throw std::runtime_error("Cannot read source grid: "+path);
 std::string t((std::istreambuf_iterator<char>(f)),std::istreambuf_iterator<char>());
 size_t index=t.find("\"byte_rows\"");
 if(index==std::string::npos)throw std::runtime_error("Missing byte_rows");
 index=t.find('[',index);
 std::array<uint8_t,256> out{};
 size_t n=0;
 while(index<t.size() && n<out.size()){
  if(!std::isdigit(static_cast<unsigned char>(t[index]))){++index;continue;}
  unsigned value=0;
  do{value=value*10+(t[index++]-'0');}
  while(index<t.size()&&std::isdigit(static_cast<unsigned char>(t[index])));
  if(value>255)throw std::runtime_error("Invalid byte_rows value");
  out[n++]=static_cast<uint8_t>(value);
 }
 if(n!=256)throw std::runtime_error("Expected 256 source bytes");
 assert(out[0]==203&&out[1]==231&&out[2]==167&&out[7]==183);
 return out;
}

uint32_t construct_state(uint32_t z,uint8_t first,int shift){
 const uint32_t mask=(uint32_t(1)<<shift)-1u;
 const uint32_t upper=shift==24?0u:((z>>shift)<<(shift+8));
 return (z&mask)|(uint32_t(first)<<shift)|upper;
}

int main(int argc,char**argv){
 try{
  const auto row=read_table(argc>1?argv[1]:"resources/liber-primus/base60-grid.json");
  std::array<uint8_t,256> column{};
  for(int c=0;c<8;c++)for(int r=0;r<32;r++)column[32*c+r]=row[8*r+c];
  const std::array<std::array<uint8_t,256>,2> input={row,column};

  for(int shift:shifts){
   const uint32_t truth=0x98765432u;
   const uint8_t first=static_cast<uint8_t>((truth>>shift)&255u);
   const uint32_t mask=(uint32_t(1)<<shift)-1u;
   uint32_t z=(truth&mask)|((shift==24?0u:truth>>(shift+8))<<shift);
   assert(construct_state(z,first,shift)==truth);
  }
  std::cout<<"Positive: all six bit windows enumerate an arbitrary planted state.\n";

  unsigned models=0,accepted=0;
  for(const auto&g:gens)for(int shift:shifts)for(int order=0;order<2;order++){
   const auto& b=input[order];
   unsigned found=0,longest=1;
   for(uint32_t z=0;z<(uint32_t(1)<<24);z++){
    uint32_t state=construct_state(z,b[0],shift);
    int n=1;
    for(;n<16;n++){
     state=state*g.a+g.c;
     if(((state>>shift)&255u)!=b[n])break;
    }
    if(static_cast<unsigned>(n)>longest)longest=static_cast<unsigned>(n);
    if(n==16){found++;std::cout<<"MATCH "<<g.name<<" "<<shift<<" "<<order<<"\n";}
   }
   models++;accepted+=found;
   std::cout<<g.name<<" shift="<<shift<<" reading="<<(order?"column":"row")
            <<" prefix="<<longest<<" full16="<<found<<"\n";
  }
  assert(models==60&&accepted==0);
  std::cout<<"Original: 60 models, 1006632960 exact candidate initial states, zero 16-byte matches.\n";
 }catch(const std::exception&e){std::cerr<<e.what()<<'\n';return 1;}
}
