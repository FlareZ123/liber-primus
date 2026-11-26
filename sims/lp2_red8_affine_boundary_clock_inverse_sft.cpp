// Known-clock inverse for the sole structural p54 clock; no original p55
// is used in fitting. Optional independent page restart is not authenticated.
#define main previous_line_sft_main
#include "lp2_red8_minimum_line_reset_sft.cpp"
#undef main
const vector<int> L55{24,46,68};
vector<Path> fixedPaths(const string&c,const vector<int>&line,int start){
 set<int> L(line.begin(),line.end());vector<Path>out;Path p;p.start=start;
 function<void(int,int)> walk=[&](int i,int j){
  if(i==int(c.size())){p.end=j;out.push_back(p);return;}
  if(L.count(i))j=(j+6)%8;
  int x=fixed::val(c[i]);
  if(!x){p.key.push_back(-1);walk(i+1,j);p.key.pop_back();}
  if(x!=K[j]){p.key.push_back(K[j]);walk(i+1,(j+5)%8);p.key.pop_back();}
 };
 walk(0,start);return out;
}
Plant affinePlant(const vector<string>&shape,const vector<string>&held,unsigned seed){
 mt19937 rng(seed);Plant p;for(int i=0;i<29;i++)p.pi[i]=i;
 shuffle(p.pi.begin()+1,p.pi.end(),rng);
 int scale=aff::inv[p.pi[19]];for(auto&x:p.pi)x=aff::mul[x][scale];
 auto ip=inverse(p.pi);auto choose=[&](int n){auto&v=fixed::by[n];return v[rng()%v.size()];};
 for(int i=0;i<47;i++)p.truth.push_back(choose(shape[i].size()));
 string carry=choose(11);p.truth.push_back(carry.substr(0,10));p.holdTruth.push_back(carry);
 for(size_t i=1;i<held.size();i++)p.holdTruth.push_back(choose(held[i].size()));
 string plain=join(p.truth)+carry.substr(10);for(size_t i=1;i<p.holdTruth.size();i++)plain+=p.holdTruth[i];
 set<int> L(LINE.begin(),LINE.end());for(int i:L55)L.insert(223+i);
 string cipher;int j=0;p.path.start=0;
 for(int i=0;i<int(plain.size());i++){
  if(L.count(i))j=(j+6)%8;
  int a=fixed::val(plain[i]);if(i<223)p.path.key.push_back(a?K[j]:-1);
  if(a){cipher+=fixed::SYM[ip[(p.pi[a]+p.pi[K[j]])%29]];j=(j+5)%8;}else cipher+='0';
  if(i==222)p.path.end=j;
 }
 p.train=split(cipher.substr(0,223),shape);p.held=split(cipher.substr(223),held);return p;
}
bool affineControl(const vector<string>&train,const vector<string>&held,unsigned seed){
 auto p=affinePlant(train,held,seed);Search s(p.train,p.path);s.run(100);
 bool exact=s.found&&s.answer==p.pi&&s.oov==0;
 bool truth=false;
 if(exact){auto w=split(decode(join(p.train),p.path,s.answer),p.train);
  for(auto&h:fixedPaths(join(p.held),L55,p.path.end)){
   auto q=split(decode(join(p.held),h,s.answer),p.held);q[0]=w.back()+q[0];if(q==p.holdTruth)truth=true;
  }
  exact=exact&&w==p.truth;
 }
 cout<<"AFFINE CONTROL "<<seed<<" exact="<<exact<<" heldout="<<truth<<endl;
 return exact&&truth;
}
int main(){try{
 aff::init();fixed::dictionary();
 auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");
 auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": [")),held=fixed::strings(src,"groups",src.rfind("\"p55\""));
 fixed::require(train.size()==48&&join(train).size()==223&&held.size()==17&&join(held).size()==76,"profile");
 auto pp=fixedPaths(join(train),LINE,0);fixed::require(pp.size()==2,"two structural paths");
 for(auto&p:pp)fixed::require(p.end==2,"p54 end2");
 fixed::require(fixedPaths(join(held),L55,2).empty(),"frozen continuation fails");
 auto reset=fixedPaths(join(held),L55,4);fixed::require(reset.size()==3,"postselected independent p55 start4");
 bool a=affineControl(train,held,3301),b=affineControl(train,held,1033);
 if(!a||!b){cout<<"ORIGINAL GATED OFF"<<endl;return 2;}
 int exhausted=0,candidates=0;uint64_t nodes=0,joins=0,seeds=0,perms=0;
 for(size_t i=0;i<pp.size();i++){
  Search s(train,pp[i]);s.run(180);
  nodes+=s.nodes;joins+=s.joins;seeds+=s.done;perms+=s.perms;
  if(s.found){candidates++;auto w=split(decode(join(train),pp[i],s.answer),train);
   cout<<"TRAIN CANDIDATE "<<aff::str(s.answer)<<" OOV="<<s.oov<<" words";for(auto&x:w)cout<<" "<<x;cout<<endl;
   for(auto&h:reset){auto q=split(decode(join(held),h,s.answer),held);q[0]=w.back()+q[0];
    int hit=count_if(q.begin(),q.end(),[](const string&x){return fixed::dict.count(x);});
    cout<<"POSTSELECTED RESET4 HOLD "<<hit<<"/17";for(auto&x:q)cout<<" "<<x;cout<<endl;
   }
  }else if(!s.timed&&s.done==s.total)exhausted++;
 }
 cout<<"AFFINE ORIGINAL exhausted="<<exhausted<<"/"<<pp.size()<<" candidates="<<candidates<<" nodes="<<nodes<<" joins="<<joins<<" seeds="<<seeds<<" perms="<<perms<<endl;
 return exhausted==int(pp.size())?0:1;
 }catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
