#include <boost/multiprecision/cpp_int.hpp>
#include <algorithm>
#include <array>
#include <bit>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <string>

/**
 * Original LP2 p2 as sixth ssss 0.5 share (versus p23–26 five 201-rune strands).
 * Exact historical monic-quintic 6-point identity in GF(2^984).
 * C++20 and Boost multiprecision, no network, original GP29 source frozen below.
 *
 * Exhaustive 10P6 decimal-ID assignments 01..10, four source strand readings,
 * both p2 orientations = 1,209,600 original-cipher six-share tests.
 */
using boost::multiprecision::cpp_int;
using B=cpp_int;
const B TOP=B(1)<<984;
const B POLY=TOP|(B(1)<<24)|(B(1)<<9)|(B(1)<<3)|1;

int digit(char c) {
 if(c>='0' && c<='9')return c-'0';
 if(c>='A' && c<='S')return c-'A'+10;
 return -1;
}
B num29(const std::string& s) {
 B v=0;
 for(char c:s) {
  const int d=digit(c);
  assert(d>=0 && d<29);
  v=v*29+d;
 }
 return v;
}
uint64_t smallProduct(uint64_t a,uint64_t b) {
 uint64_t z=0;
 while(b) {
  if(b&1)z^=a;
  a<<=1;b>>=1;
 }
 return z;
}
B multiplySmall(const B& y,uint64_t bits) {
 B result=0,v=y;
 while(bits) {
  if(bits&1)result^=v;
  bits>>=1;
  v<<=1;
  if((v&TOP)!=0)v^=POLY;
 }
 return result;
}
B smallPower(B x,int exponent) {
 B result=1;
 for(int i=0;i<exponent;i++) {
  B z=0, v=result;
  auto b=x.convert_to<uint64_t>();
  while(b) {
   if(b&1)z^=v;
   b>>=1;v<<=1;
   if((v&TOP)!=0)v^=POLY;
  }
  result=z;
 }
 return result;
}

int main() {
 // Exactly five 201-rune streams in the original p23–26 body after red16.
 const std::string src=
 "S6FPD7JSCBC78A6SH1Q8QL714F3R0RSNM2J59EN2I4C5OBFM174GFIFGQ4SP9NDHRF1NIQ2K7MF6KBPI3527J1360O3RLHS25O4RGM70QL1QAKGPPO4D0J73NSHDLM96JRI39KELARPJ8I7JLDCJRBP3R0QEMP2PH3O2B4B92R0OG9861N52141MN8467GDI0O8S2N40IBP9587CRDS7JK7M7SO9O5O6K2H3716K0F89ELJI21LRDQ1E667NAF2RRD5O31J1E3Q8G3PJ139GSHMH0ADKFLP5PMG13E9RF0IE4J33P012IN9QRFF4KM1819DA8IE2NJDM0D0LPLFMB7SHQM7N0QBAGEK32L0OFRA8H4O1QP1MSOQIMPID0HDBAFLH425CKA1DG5HEIOQ0J5Q487G9REP2M57S0GSL38RSHF8MPASGAFGP848BFR799R7K1IG4L5QOECLFICA8967E5EQFD5M4HQBLIA96OQ6KH1B3LEEOIH2ER4G67BFA0SAR2L9I903JIQO5I57OP7C128E19SK192DF1D4NPM4RPO11JK2SKLDQ3FMO4J2MDKFGA0FI7LJN3SPRHG3FIGO0PHK9FOEM9K7I3KABGHO0EG3MB96F6K6SH6I3O3IN6CJ546DN307CSNQL9A0DKIM15JKPGEB4EAS6K65F3LP2J8M04F52Q3HAP8I1GKKC6MQH928SIBH9AKS4B05FL5D68FJCNCQRIGS1R39S3BQCESOR9NL8DS8R1L82DE1SQDM2FQD0GHAMO6KS8LARKL9NOD69G2FHFFS65SJ1IEH6P03AE0OS4C3ANFK2IHCM6Q696205J3II30H8L5ABO93OD84J4JM26BH42OSEIRN24LBH9GQGFH9P1IA3RBC12K5IKAH10O4SJHNEJ1SGQOBD1DSQ6JRJ1OJLQROIGIFOM58AF0A9DMLC2QGPEIMGNRKIDGOG049OS4S5987HCFA8QF73E73L18LMGK0B6GLBL";
 assert(src.size()==1005);
 const std::string p2=
 "MJ18GHCKN8HJS4H98HI6CNK7CRD38IS7A4A8128Q9EH6BD1LS09AINRL4NHBRMJA0GBNA24KFIC36HGN2O95QRF2NL0KI685I3AG9EDG084NI0GP78H50DOK1S9KBB5K7SN1NCSEN78S2RP5KG7IA5DMN598O4A62SIG6283R7PBILSN3POKHB51EGOHBD0S8N9R1DF17";
 assert(p2.size()==201);
 std::array<std::array<B,5>,4> strands{};
 for(int k=0;k<4;k++)for(int lane=0;lane<5;lane++) {
  std::string digits;
  for(int pos=0;pos<201;pos++)
   digits.push_back(src[k<2?pos*5+lane:lane*201+pos]);
  if(k%2==1)std::reverse(digits.begin(),digits.end());
  strands[k][lane]=num29(digits);
  assert(strands[k][lane]<TOP);
 }
 std::string p2Reversed=p2;
 std::reverse(p2Reversed.begin(),p2Reversed.end());
 const std::array<B,2> p2Values={num29(p2),num29(p2Reversed)};
 int idSets=0;
 long long tested=0,matched=0;
 int smallestHamming=985;
 bool sourceSizedPlant=false;
 for(int mask=0;mask<1024;mask++) {
  if(std::popcount((unsigned)mask)!=6)continue;
  idSets++;
  std::array<int,6> ids{};
  for(int i=0,j=0;i<10;i++)if(mask&(1<<i))ids[j++]=i+1;

  // For six points, D=product of all 15 differences and
  // W[i]=product of the 10 differences between the other five IDs.
  // Multiplying the leading-coefficient Lagrange identity by D yields
  // XOR_i(W[i] * y[i]) == D iff the degree-five coefficient is one.
  uint64_t determinant=1;
  for(int i=0;i<6;i++)for(int j=i+1;j<6;j++)
   determinant=smallProduct(determin,uint64_t(ids[i]^ids[j]));
  std::array<uint64_t,6> weight{};
  for(int omit=0;omit<6;omit++) {
   uint64_t w=1;
   for(int i=0;i<6;i++)for(int j=i+1;j<6;j++)
    if(i!=omit && j!=omit)w=smallProduct(w,uint64_t(ids[i]^ids[j]));
   weight[omit]=w;
  }

  if(!sourceSizedPlant) {
   // Exact planted 201-rune p2 value as the sixth point, x=ids[5].
   const B constant=p2Values[0]^smallPower(B(ids[5]),5);
   B test=0;
   for(int i=0;i<6;i++)
    test^=multiplySmall(smallPower(B(ids[i]),5)^constant,weight[i]);
   assert(test==B(determinant));
   sourceSizedPlant=true;
  }

  for(int layout=0;layout<4;layout++)for(int direction=0;direction<2;direction++) {
   const std::array<B,6> original={
    strands[layout][0],strands[layout][1],strands[layout][2],
    strands[layout][3],strands[layout][4],p2Values[direction]};
   std::array<std::array<B,6>,6> products{};
   for(int i=0;i<6;i++)for(int j=0;j<6;j++)
    products[i][j]=multiplySmall(original[j],weight[i]);
   std::array<int,6> assigned={0,1,2,3,4,5};
   do {
    B lhs=0;
    for(int i=0;i<6;i++)lhs^=products[i][assigned[i]];
    tested++;
    if(lhs==B(determinant)) {
     matched++;
     std::cout<<"Unexpected six-share match\n";
    }
    B residual=lhs^B(determinant);
    int bitChanges=0;
    while(residual!=0) {
     bitChanges++;
     residual&=residual-1;
    }
    smallestHamming=std::min(smallestHamming,bitChanges);
   }while(std::next_permutation(assigned.begin(),assigned.end()));
  }
 }
 assert(idSets==210);
 assert(tested==1209600);
 assert(matched==0);
 assert(smallestHamming==420);
 assert(sourceSizedPlant);
 std::cout<<"PASS: original p2 is not a historical GF(2^984) monic "
  <<"quintic sixth share under "<<tested<<" source/historical-ID assignments; "
  <<"closest residual has "<<smallestHamming<<" changed bits. "
  <<"Full p2-sized plant passes.\n";
}
