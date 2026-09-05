function card(p){
  const fav=state.favs.has(p.id);
  const gallery=(p.images&&p.images.length?p.images:[p.img]);
  const discount=p.old?Math.max(1,Math.round((1-parsePrice(p.price)/parsePrice(p.old))*100)):0;
  const galleryControls=gallery.length>1?`<div class="card-gallery-dots" aria-label="${gallery.length} صور">${gallery.map((_,i)=>`<i class="${i===0?'active':''}"></i>`).join('')}</div>`:'';
  const storeRecord=storesData.find(s=>s.name===p.store)||null;
  const purchasable=!!(p.offerId||p.variants?.some(v=>v.offerId));
  return `<article class="product-card" data-product="${p.id}"><div class="product-image card-gallery" data-gallery="${gallery.map(x=>encodeURIComponent(x)).join('|')}" data-gallery-index="0"><button class="fav ${fav?'active':''}" data-action="fav" data-id="${p.id}" aria-label="المفضلة">${icon('heart',19)}</button>${discount?`<span class="discount-badge">-${discount}%</span>`:''}<img class="card-gallery-img" src="${absoluteProductImage(gallery[0])}" alt="${esc(p.name)}" onerror="this.onerror=null;this.src='${A}placeholder-product.svg'">${galleryControls}<button class="plus icon-button" data-action="add" data-id="${p.id}" aria-label="إضافة إلى السلة" ${!purchasable?'disabled':''}>${icon('plus',20)}</button></div><div class="pname">${p.name}</div>${purchasable?(p.old?`<div class="sale"><b class="sale-price">${displayPrice(p.price)}</b><span class="old">${displayPrice(p.old)}</span></div>`:`<div class="price">${displayPrice(p.price)}</div>`):`<div class="price">غير متاح حالياً</div>`}<div class="meta"><span class="rating-line">${icon('star',15)} ${p.rating}</span><button class="card-store-link" data-action="open-store" data-store="${storeRecord?.id||''}">${p.store}</button></div></article>`;
}
