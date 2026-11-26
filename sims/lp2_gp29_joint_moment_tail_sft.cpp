#include "lp2_gp29_joint_moment_tail.hpp"
#include <chrono>
#include <fstream>
#include <iostream>
#include <numeric>
#include <random>
#include <set>
#include <string>

using namespace joint46;
using Clock=std::chrono::steady_clock;
using Actions=std::set<std::string>;
int dec(char c){return c<='9'?c-'0':c-'a'+10;}
char enc(int x){return x<10?'0'+x:'a'+x-10;}
std::string action(const Perm& p,const Key& k){std::string a;for(auto x:p)a+=enc(x);a+='|';for(auto x:k)a+=enc(x);return a;}
struct Run {Stats stats;Actions actions;long long us=0;};
Run run(const Input& in,bool optimized,bool factor=true,Limits limits={}){
 Run out;auto emit=[&](const Perm& p,const Key& k){if(!out.actions.insert(action(p,k)).second)throw std::runtime_error("duplicate action");};
 const auto start=Clock::now();
 if(optimized)out.stats=joint22::enumerateMomentTail(in,emit,[]{return false;},limits,factor);
 else out.stats=joint46::enumerate(in,emit,[]{return false;},limits,factor);
 out.us=std::chrono::duration_cast<std::chrono::microseconds>(Clock::now()-start).count();return out;
}
void compare(const Run& a,const Run& b){
 if(!a.stats.exhausted||!b.stats.exhausted||!a.stats.eligible||!b.stats.eligible||a.actions!=b.actions)throw std::runtime_error("complete action-set mismatch");
 if(a.stats.nodes!=b.stats.nodes||a.stats.leaves!=b.stats.leaves||a.stats.zeroMasks!=b.stats.zeroMasks)throw std::runtime_error("exact traversal statistic mismatch");
}
int main(int argc,char** argv){
 // Generated affine graph controls, not hidden dictionary/plaintext controls.
 std::mt19937 rng(221126);auto rnd=[&](){return int(rng()%N);};
 const std::vector<std::vector<int>> sizes={{14,14,1},{16,8,5},{12,10,6,1},{13,13,1,1,1},{28,1},{15,14},{10,10,9},{21,5,3},{26,1,1,1}};
 size_t controlActions=0;int planted=0,controls=0;
 for(int trial=0;trial<108;trial++){
  Input in;in.d=trial%3;const bool isPlanted=trial<81;const bool factor=trial%4!=0;
  auto shape=sizes[trial%sizes.size()];std::vector<int> roots;for(size_t j=0;j<shape.size();j++)roots.insert(roots.end(),shape[j],int(j));std::shuffle(roots.begin(),roots.end(),rng);
  Perm pi{};std::iota(pi.begin(),pi.end(),0);std::shuffle(pi.begin(),pi.end(),rng);const int origin=pi[0];for(auto& v:pi)v=mod(int(v)-origin);
  Key k{};for(auto& v:k)v=rnd();if(std::equal(k.begin(),k.begin()+4,k.begin()+4))k[0]=mod(k[0]+1);
  std::array<int,MAXV> hidden{};for(int j=0;j<in.d;j++)hidden[j]=rnd();
  auto form=[&](Form& f,int target){int s=0;for(int j=0;j<in.d;j++){f[j+1]=rnd();s+=f[j+1]*hidden[j];}f[0]=isPlanted?mod(target-s):rnd();};
  for(int i=0;i<N;i++){in.root[i]=roots[i];form(in.off[i],pi[i]);}for(int i=0;i<Q;i++)form(in.key[i],k[i]);
  auto a=run(in,false,factor),b=run(in,true,factor);compare(a,b);controlActions+=b.actions.size();controls++;
  if(isPlanted){if(!b.actions.count(action(pi,k)))throw std::runtime_error("planted action lost");planted++;}
  if(trial==0){Limits l;l.candidates=1;auto capped=run(in,true,factor,l);if(capped.stats.exhausted||capped.actions.size()!=1)throw std::runtime_error("candidate cap failure");}
 }
 std::cout<<"CONTROLS cases="<<controls<<" planted="<<planted<<" actions="<<controlActions<<" all_exact=1\n";
 std::ifstream f(argc>1?argv[1]:"im-results/lp2-gp29-joint-affine-native-fixture.tsv");if(!f)throw std::runtime_error("fixture unavailable");
 int id,d;std::string roots,off,key;size_t total=0;uint64_t rotations[2]{};long long elapsed[2]{};int count=0;
 while(f>>id>>d>>roots>>off>>key){
  if(d<0||d>7||roots.size()!=29||off.size()!=size_t(29*(d+1))||key.size()!=size_t(8*(d+1)))throw std::runtime_error("fixture length");
  Input in;in.d=d;for(int i=0;i<N;i++){in.root[i]=dec(roots[i]);for(int j=0;j<=d;j++)in.off[i][j]=dec(off[i*(d+1)+j]);}for(int i=0;i<Q;i++)for(int j=0;j<=d;j++)in.key[i][j]=dec(key[i*(d+1)+j]);
  // Alternate timing order to reduce systematic cache/order effects.
  Run a,b;if(id%2){b=run(in,true);a=run(in,false);}else{a=run(in,false);b=run(in,true);}compare(a,b);
  std::cout<<"STATE "<<id<<" d="<<d<<" vars="<<a.stats.variables<<" singletons="<<a.stats.singletons<<" nodes="<<a.stats.nodes<<" actions="<<a.actions.size()<<" rotations="<<a.stats.rotations<<","<<b.stats.rotations<<" us="<<a.us<<","<<b.us<<" exact=1\n";
  total+=a.actions.size();rotations[0]+=a.stats.rotations;rotations[1]+=b.stats.rotations;elapsed[0]+=a.us;elapsed[1]+=b.us;count++;std::cout.flush();
 }
 if(count!=32||total!=528)throw std::runtime_error("original fixture count/action total mismatch");
 std::cout<<"TOTAL states="<<count<<" actions="<<total<<" rotations="<<rotations[0]<<","<<rotations[1]<<" us="<<elapsed[0]<<","<<elapsed[1]<<" exact=1\n";
}
