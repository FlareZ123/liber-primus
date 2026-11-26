#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <sstream>
#include <vector>
using namespace std;
constexpr int ALL=8191,STATES=13*900;
float lp[30*30*29];
unsigned ror(unsigned x){return (x>>1)|((x&1)<<12);}
array<int,13> unpack(uint64_t v){array<int,13> k{};for(int j=12;j>0;j--){k[j]=v&31;v>>=5;}return k;}
struct Result{float score;uint64_t packed;};
float solve(const vector<int>& C,const array<int,13>& k,int sign,vector<int>* output=nullptr){unsigned forb[29]={};for(int j=0;j<13;j++)forb[sign<0?k[j]:(k[j]?29-k[j]:0)]|=1u<<j;array<unsigned,717> B{};B[C.size()]=ALL;for(int i=C.size()-1;i>=0;i--)B[i]=(ror(B[i+1])&~forb[C[i]])|(C[i]==0?B[i+1]:0);if(!B[0])return -1e30f;
array<float,STATES> val[2];array<int,STATES> active[2];int count[2]={0,0};array<int,STATES> tag{};vector<vector<pair<int,int>>> trace;if(output)trace.resize(C.size());int p=0;for(int j=0;j<13;j++)if(B[0]&(1u<<j)){int id=j*900+899;active[0][count[0]++]=id;val[0][id]=0;}
for(int i=0;i<(int)C.size();i++){int c=C[i],q=p^1;count[q]=0;for(int n=0;n<count[p];n++){int id=active[p][n],j=id/900,ab=id%900,b=ab%30;float v=val[p][id];auto step=[&](int x,int jj){if(!(B[i+1]&(1u<<jj)))return;int ni=jj*900+b*30+x;float w=v+lp[ab*29+x];if(tag[ni]!=i+1){tag[ni]=i+1;active[q][count[q]++]=ni;val[q][ni]=w;if(output)trace[i].push_back({ni,id});}else if(w>val[q][ni]){val[q][ni]=w;if(output){for(auto &e:trace[i])if(e.first==ni){e.second=id;break;}}}};if(c==0)step(0,j);int x=c+sign*k[j];if(x<0)x+=29;else if(x>=29)x-=29;if(x)step(x,j==12?0:j+1);}p=q;assert(count[p]);}
int best=active[p][0];for(int n=1;n<count[p];n++)if(val[p][active[p][n]]>val[p][best])best=active[p][n];float score=val[p][best]/C.size();if(output){output->resize(C.size());for(int i=C.size()-1;i>=0;i--){(*output)[i]=best%30;auto it=find_if(trace[i].begin(),trace[i].end(),[&](auto e){return e.first==best;});assert(it!=trace[i].end());best=it->second;}int j=best/900;for(int i=0;i<(int)C.size();i++){int x=(*output)[i],c=x?((x-sign*k[j++%13]+29)%29):0;assert(c==C[i]);}}
return score;}
int main(int argc,char**argv){if(argc<5)return 1;ifstream m(argv[1],ios::binary);m.read(reinterpret_cast<char*>(lp),sizeof(lp));assert(m.gcount()==sizeof(lp));ifstream in(argv[2]);string line,s;getline(in,line);stringstream ss(line);vector<int>C;while(getline(ss,s,','))C.push_back(stoi(s));assert(C.size()==716);int sign=stoi(argv[3]);ifstream keys(argv[4],ios::binary);uint64_t packed;vector<Result> top;uint64_t n=0;double sum=0;auto t=chrono::steady_clock::now();int limit=argc>5?stoi(argv[5]):0;
while(keys.read(reinterpret_cast<char*>(&packed),8)){auto k=unpack(packed);float v=solve(C,k,sign);assert(v>-1e20);n++;sum+=v;if(top.size()<10||v>top.back().score){top.push_back({v,packed});sort(top.begin(),top.end(),[](auto a,auto b){return a.score>b.score;});if(top.size()>10)top.pop_back();}if(limit&&n>=uint64_t(limit))break;}
cout<<setprecision(9)<<"sign="<<sign<<" n="<<n<<" mean="<<sum/n<<" elapsed="<<chrono::duration<double>(chrono::steady_clock::now()-t).count()<<endl;for(auto a:top){auto k=unpack(a.packed);vector<int>P;float v=solve(C,k,sign,&P);cout<<v<<" key=";for(int x:k)cout<<x<<',';cout<<" plain=";for(int x:P)cout<<x<<',';cout<<'\n';}}
