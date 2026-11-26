#include "lp2_gp29_joint_affine_completion.hpp"
#include <chrono>
#include <fstream>
#include <iostream>
#include <string>
#include <set>
using namespace joint46;
int dec(char c){return c<='9'?c-'0':c-'a'+10;}
char enc(int x){return x<10?'0'+x:'a'+x-10;}
int main(int argc,char** argv){
 std::ifstream f(argc>1?argv[1]:"im-results/lp2-gp29-joint-affine-native-fixture.tsv");if(!f)throw std::runtime_error("fixture unavailable");
 int id,d;std::string roots,off,key;int wanted=argc>2?std::stoi(argv[2]):-1;
 while(f>>id>>d>>roots>>off>>key){
  if(wanted>=0&&id!=wanted)continue;
  if(d<0||d>7||roots.size()!=29||off.size()!=size_t(29*(d+1))||key.size()!=size_t(8*(d+1)))throw std::runtime_error("fixture length");
  Input in;in.d=d;
  for(int i=0;i<N;i++){in.root[i]=dec(roots[i]);for(int j=0;j<=d;j++)in.off[i][j]=dec(off[i*(d+1)+j]);}
  for(int i=0;i<Q;i++)for(int j=0;j<=d;j++)in.key[i][j]=dec(key[i*(d+1)+j]);
  std::set<std::string> actions;
  auto start=std::chrono::steady_clock::now();
  auto stats=enumerate(in,[&](const Perm& p,const Key& k){std::string a;for(auto x:p)a+=enc(x);a+='|';for(auto x:k)a+=enc(x);if(!actions.insert(a).second)throw std::runtime_error("duplicate action");},[]{return false;},Limits{argc>3?std::stoull(argv[3]):std::numeric_limits<uint64_t>::max(),std::numeric_limits<uint64_t>::max(),1000000},argc<=4||std::string(argv[4])!="unfactored");
  std::cout<<"STATE "<<id<<" d="<<d<<" vars="<<stats.variables<<" singletons="<<stats.singletons<<" nodes="<<stats.nodes<<" rotations="<<stats.rotations<<" leaves="<<stats.leaves<<" actions="<<actions.size()<<" exhausted="<<stats.exhausted<<" ms="<<std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::steady_clock::now()-start).count()<<'\n';
  for(auto& a:actions)std::cout<<"ACTION "<<id<<' '<<a<<'\n';
  std::cout.flush();
 }
}
