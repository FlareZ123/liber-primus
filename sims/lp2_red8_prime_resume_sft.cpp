// Resume only the unfinished prime-vector control from run 45718447093.
// The first 7357 seeds completed with no capped leaves; control 1133 passed.
// Original prime fit remains gated on exact recovery of control 3401.
#define main earlier_red8_main
#include "lp2_red8_fixed_numeric_cycle_carry_sft.cpp"
#undef main
int main(){try{dictionary();string src=read("resources/liber-primus/lp2-page-groups-54-55-derived.json");
auto body=strings(src,"body_groups",src.find("\"heading_groups\": [")),p55=strings(src,"groups",src.rfind("\"p55\""));
require(body.size()==48&&body.back()=="63g2eis46q"&&p55.size()==17&&p55[0]=="l","physical carry");
vector<string> train(body.begin(),body.end()-1),hold(p55.begin()+1,p55.end());
Key k=numbers(src,"prime_mod29");require(k==Key{13,21,2,20,5,18,2,13},"prime key");
cout<<"Resuming prime seed 3401 at index 7357, previous independently passed control 1133"<<endl;
if(!control(train,hold,k,3401,7357,180)){cout<<"ORIGINAL GATED OFF: prime resume control failed"<<endl;return 1;}
Search s(k,train,body.back());s.run(420);
if(!s.found){cout<<"ORIGINAL no key; exact exclusion only if !timed and residual==0 and all seeds completed"<<endl;return 1;}
auto m=maps(s.answer,k);vector<string> held{body.back()+p55[0]};held.insert(held.end(),hold.begin(),hold.end());cout<<"ORIGINAL frozen holdout"<<endl;
for(size_t i=0;i<held.size();i++){auto d=decode(held[i],m,dict);cout<<i<<" "<<held[i]<<" candidates="<<d.size();int n=0;for(const auto&w:d){if(n++>=5)break;cout<<" "<<w;}cout<<endl;}
return 1;
}catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
