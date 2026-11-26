#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <sstream>
#include <vector>
using namespace std;
constexpr unsigned ALL=8191;
const array<int,13> TITLE={0,3,5,6,8,15,15,18,18,19,21,26,27};
unsigned advance(unsigned m){return ((m<<1)|(m>>12))&ALL;}
uint64_t pack(const array<int,13>& k){uint64_t v=0;for(int j=1;j<13;j++)v=(v<<5)|k[j];return v;}
int main(int argc,char**argv){if(argc!=4)return 1;ifstream in(argv[1]);string line,s;getline(in,line);stringstream ss(line);vector<int> C;while(getline(ss,s,','))C.push_back(stoi(s));assert(C.size()==716);int first=stoi(argv[3]);auto t=chrono::steady_clock::now();array<int,13> k=TITLE;auto it=find(k.begin()+1,k.end(),first);assert(it!=k.end());swap(k[1],*it);sort(k.begin()+2,k.end());vector<uint64_t> neg,pos;uint64_t n=0;do{unsigned forbidden[29]={};for(int j=0;j<13;j++)forbidden[k[j]]|=1u<<j;unsigned m=ALL,p=ALL;for(int c:C){if(m){unsigned z=advance(m&~forbidden[c]);m=z|(c==0?m:0);}if(p){unsigned z=advance(p&~forbidden[c?29-c:0]);p=z|(c==0?p:0);}if(!(m|p))break;}if(m)neg.push_back(pack(k));if(p)pos.push_back(pack(k));n++;}while(next_permutation(k.begin()+2,k.end()));string prefix=string(argv[2])+"_"+to_string(first);ofstream fm(prefix+"_minus.bin",ios::binary),fp(prefix+"_plus.bin",ios::binary);fm.write(reinterpret_cast<char*>(neg.data()),neg.size()*sizeof(uint64_t));fp.write(reinterpret_cast<char*>(pos.data()),pos.size()*sizeof(uint64_t));cout<<"first="<<first<<" cycles="<<n<<" minus="<<neg.size()<<" plus="<<pos.size()<<" elapsed="<<chrono::duration<double>(chrono::steady_clock::now()-t).count()<<endl;}
