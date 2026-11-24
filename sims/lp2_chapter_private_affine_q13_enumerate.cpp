#include <array>
#include <bitset>
#include <cstdint>
#include <iostream>
#include <string>
#include <vector>
#include <fstream>
#include <chrono>
using namespace std;
constexpr int Q=13,N=812;
using Mask=bitset<N>;using Dom=array<Mask,Q>;
array<array<Mask,29>,2> allowed;
vector<vector<int>> runs;vector<bool> zeroSingleton;
vector<array<Dom,Q>> compiled;
uint64_t nodes=0,leaves=0,cap=200000000;bool capped=false;
ofstream out;
void dfs(size_t t,int p,const Dom &D,uint64_t holds){
 if(++nodes>cap){capped=true;return;}
 Dom e;for(int j=0;j<Q;j++){e[j]=D[j]&compiled[t][p][j];if(e[j].none())return;}
 p=(p+runs[t].size())%Q;
 if(t==zeroSingleton.size()){
  leaves++;out<<holds;for(auto &m:e){out<<' ';bool first=true;for(int j=0;j<N;j++)if(m[j]){if(!first)out<<',';out<<j;first=false;}}out<<'\n';return;
 }
 if(!zeroSingleton[t])dfs(t+1,p,e,holds|(1ULL<<t));if(capped)return;
 e[p]&=allowed[zeroSingleton[t]][0];if(e[p].any())dfs(t+1,(p+1)%Q,e,holds);
}
int main(int argc,char **argv){
 if(argc<3)return 1;ifstream in(argv[1]);out.open(argv[2]);if(!in||!out)return 2;if(argc>3)cap=stoull(argv[3]);
 string C;in>>C;vector<bool> sing(C.size());int s;while(in>>s)sing.at(s)=true;
 for(int a=1;a<29;a++)for(int b=0;b<29;b++)for(int p=1;p<29;p++)if(p!=12&&p!=22){int c=(a*p+b)%29,k=(a-1)*29+b;allowed[0][c].set(k);if(p==10||p==24)allowed[1][c].set(k);}
 runs.emplace_back();for(size_t i=0;i<C.size();i++){int c=C[i]<='9'?C[i]-'0':C[i]-'a'+10;if(c==0){zeroSingleton.push_back(sing[i]);runs.emplace_back();}else runs.back().push_back(c+29*sing[i]);}
 if(zeroSingleton.size()>63)return 3;
 compiled.resize(runs.size());for(size_t t=0;t<runs.size();t++)for(int p=0;p<Q;p++){
  auto &d=compiled[t][p];for(auto &m:d)m.set();for(size_t j=0;j<runs[t].size();j++){int c=runs[t][j];d[(p+j)%Q]&=allowed[c/29][c%29];}
 }
 Dom d;for(auto &m:d)m.set();auto start=chrono::steady_clock::now();dfs(0,0,d,0);out.close();
 cerr<<"nodes="<<nodes<<" leaves="<<leaves<<" capped="<<capped<<" seconds="<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<'\n';return capped?4:0;
}
