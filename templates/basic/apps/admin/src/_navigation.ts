import { defineNavigationConfig } from "@mercurjs/dashboard-sdk"
export default defineNavigationConfig({items:[
 {id:"orders",hidden:true},{id:"offers",hidden:true},{id:"inventory",hidden:true},{id:"price-lists",hidden:true},{id:"campaigns",hidden:true},{id:"customer-groups",hidden:true},{id:"reservations",hidden:true},
 {id:"products",hidden:true},{id:"promotions",hidden:true},{id:"marketplace",hidden:true},
 {id:"collections",label:"المجموعات",rank:30},{id:"categories",label:"الفئات",rank:35},{id:"stores",hidden:true},{id:"customers",label:"العملاء",rank:50},{id:"reviews",label:"التقييمات",rank:65},{id:"payouts",label:"المستحقات",rank:70}
]})
