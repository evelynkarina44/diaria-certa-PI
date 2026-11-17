import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { profileMenu } from '../../utils/navigationMenu';
export function AdminTabs({navigation,current}:{navigation:any;current:string}){
 return <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{profileMenu('admin').map(item=>
 <TouchableOpacity key={item.route} accessibilityRole="button" accessibilityState={{selected:current===item.route}} onPress={()=>navigation.navigate(item.route)}
 style={{minHeight:44,justifyContent:'center',paddingHorizontal:12,borderRadius:12,backgroundColor:current===item.route?'#E8FAFA':'#F9FAFB'}}>
 <Text style={{fontFamily:'Poppins_500Medium',fontSize:13,color:'#008A99'}}>{item.label}</Text></TouchableOpacity>)}</View>;
}
