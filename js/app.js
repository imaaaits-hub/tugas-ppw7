import {PRODUCTS,PRODUCT_SIZE} from "./data.js";
import {WHATSAPP_NUMBER} from "./config.js";
const $=s=>document.querySelector(s);
const ORDER_HISTORY_KEY="my-fashionstore-order-history";
const state={items:[],history:loadOrderHistory()};
const currency=new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0});
const money=amount=>currency.format(amount);
function loadOrderHistory(){
 try{
  const saved=localStorage.getItem(ORDER_HISTORY_KEY);
  if(!saved)return [];
  const history=JSON.parse(saved);
  if(!Array.isArray(history))throw new Error("Format riwayat tidak valid.");
  return history;
 }catch(error){
  $("#status").textContent="Riwayat pesanan tidak dapat dibaca dari penyimpanan browser.";
  return [];
 }
}
function saveOrderHistory(){
 try{
  localStorage.setItem(ORDER_HISTORY_KEY,JSON.stringify(state.history));
  return true;
 }catch(error){
  $("#status").textContent="Riwayat tidak dapat disimpan. Periksa ruang dan izin penyimpanan browser.";
  return false;
 }
}
function renderProducts(){
 const q=$("#search").value.trim().toLocaleLowerCase("id-ID"),f=$("#filter").value;
 const found=PRODUCTS.filter(p=>(f==="all"||p.category===f)&&`${p.name} ${p.label} ${p.description}`.toLocaleLowerCase("id-ID").includes(q));
 $("#result-count").textContent=`${found.length} produk ditemukan`;
 const target=$("#products");target.replaceChildren();
 if(!found.length){const p=document.createElement("p");p.className="empty";p.textContent="Produk belum ditemukan. Coba kata pencarian lain.";target.append(p);return;}
 for(const p of found){
  const card=document.createElement("article");card.className="product";
  const photo=document.createElement("div");photo.className="product-photo";
  const img=document.createElement("img");img.src=p.image;img.alt=p.name;img.loading="lazy";
  const tag=document.createElement("span");tag.className="product-tag";tag.textContent=p.tag;photo.append(img,tag);
  const info=document.createElement("div");info.className="product-info";
  const cat=document.createElement("span");cat.className="category";cat.textContent=p.label;
  const title=document.createElement("h3");title.textContent=p.name;
  const desc=document.createElement("p");desc.textContent=p.description;
  const size=document.createElement("span");size.className="product-size";size.textContent=`Ukuran: ${PRODUCT_SIZE}`;
  const bottom=document.createElement("div");bottom.className="product-bottom";
  const price=document.createElement("span");price.className="price";price.textContent=money(p.price);
  const add=document.createElement("button");add.className="add";add.type="button";add.textContent="TAMBAH KE KERANJANG +";add.addEventListener("click",()=>{const item=state.items.find(i=>i.id===p.id);if(item)item.qty=Math.min(99,item.qty+1);else state.items.push({id:p.id,qty:1});renderBag();$("#status").textContent=`${p.name} ditambahkan ke keranjang.`;});
  bottom.append(price,add);info.append(cat,title,desc,size,bottom);card.append(photo,info);target.append(card);
 }
}
function renderGallery(){
 const target=$("#gallery-grid");
 target.replaceChildren();
 for(const p of PRODUCTS){
  const link=document.createElement("a");link.className="gallery-item";link.href="#collection";link.setAttribute("aria-label",`Lihat ${p.name} di koleksi`);
  const img=document.createElement("img");img.src=p.image;img.alt=p.name;img.loading="lazy";
  const caption=document.createElement("span");caption.textContent=p.name;
  link.append(img,caption);target.append(link);
 }
}
function renderBag(){
 const target=$("#bag-items");target.replaceChildren();
 let count=0;state.items.forEach(i=>count+=i.qty);
 $("#cart-count").textContent=count;$("#bag-total-count").textContent=`${count} item`;
 const total=state.items.reduce((sum,item)=>{const product=PRODUCTS.find(p=>p.id===item.id);return sum+(product?product.price*item.qty:0);},0);
 $("#bag-subtotal").textContent=money(total);
 if(!state.items.length){const p=document.createElement("p");p.className="empty";p.textContent="Keranjangmu masih kosong.";target.append(p);return;}
 for(const item of state.items){
  const p=PRODUCTS.find(x=>x.id===item.id);if(!p)continue;
  const row=document.createElement("div");row.className="bag-row";
  const info=document.createElement("div");const strong=document.createElement("strong");strong.textContent=p.name;const small=document.createElement("small");small.textContent=`${p.label} · Ukuran ${PRODUCT_SIZE} · ${money(p.price)} / item`;info.append(strong,small);
  const qty=document.createElement("div");qty.className="qty";
  const minus=document.createElement("button");minus.type="button";minus.textContent="−";minus.setAttribute("aria-label",`Kurangi ${p.name}`);
  minus.addEventListener("click",()=>{item.qty--;if(item.qty<=0)state.items=state.items.filter(x=>x.id!==item.id);renderBag();});
  const num=document.createElement("span");num.textContent=item.qty;
  const plus=document.createElement("button");plus.type="button";plus.textContent="+";plus.setAttribute("aria-label",`Tambah ${p.name}`);plus.addEventListener("click",()=>{item.qty=Math.min(99,item.qty+1);renderBag();});
  const remove=document.createElement("button");remove.type="button";remove.className="remove";remove.textContent="Hapus";remove.addEventListener("click",()=>{state.items=state.items.filter(x=>x.id!==item.id);renderBag();});
  qty.append(minus,num,plus,remove);row.append(info,qty);target.append(row);
 }
}
function renderOrderHistory(){
 const target=$("#order-history-list");
 target.replaceChildren();
 $("#history-count").textContent=`${state.history.length} pesanan`;
 if(!state.history.length){const empty=document.createElement("p");empty.className="empty";empty.textContent="Belum ada riwayat pemesanan.";target.append(empty);return;}
 for(const order of state.history){
  const card=document.createElement("article");card.className="history-order";
  const heading=document.createElement("div");heading.className="history-order-heading";
  const id=document.createElement("strong");id.textContent=order.id;
  const date=document.createElement("time");date.dateTime=order.createdAt;date.textContent=new Date(order.createdAt).toLocaleString("id-ID",{dateStyle:"medium",timeStyle:"short"});
  heading.append(id,date);
  const customer=document.createElement("p");customer.className="history-customer";customer.textContent=`${order.name} · ${order.phone}`;
  const items=document.createElement("ul");
  for(const item of order.items){
   const entry=document.createElement("li");entry.textContent=`${item.name} × ${item.qty} · Ukuran ${item.size}${item.unitPrice?` · ${money(item.unitPrice*item.qty)}`:""}`;items.append(entry);
  }
  const payment=document.createElement("p");payment.className="history-customer";payment.textContent=`Pembayaran: ${order.paymentMethod||"Belum dipilih"}${Number.isFinite(order.total)?` · Total ${money(order.total)}`:""}`;
  const status=document.createElement("span");status.className="history-status";status.textContent=order.status;
  card.append(heading,customer,items,payment,status);target.append(card);
 }
}
function checkout(){
 if(!state.items.length){$("#status").textContent="Tambahkan minimal satu produk ke keranjang terlebih dahulu.";return;}
 const name=$("#customer-name").value.trim();if(!name){$("#status").textContent="Isi nama lengkap terlebih dahulu.";$("#customer-name").focus();return;}
 const phone=$("#customer-phone").value.trim();if(!/^[+()\d\s-]{8,20}$/.test(phone)||phone.replace(/\D/g,"").length<8){$("#status").textContent="Masukkan nomor WhatsApp yang valid.";$("#customer-phone").focus();return;}
 const paymentMethod=$("#payment-method").value;
 if(!paymentMethod){$("#status").textContent="Pilih metode pembayaran yang kamu inginkan.";$("#payment-method").focus();return;}
 if(!/^\d{8,15}$/.test(WHATSAPP_NUMBER)){ $("#status").textContent="Nomor WhatsApp admin belum diatur. Hubungi pemilik website untuk mengisi js/config.js.";return;}
 const orderItems=state.items.map(i=>{const p=PRODUCTS.find(x=>x.id===i.id);return {name:p.name,qty:i.qty,size:PRODUCT_SIZE,label:p.label,unitPrice:p.price};});
 const total=orderItems.reduce((sum,item)=>sum+item.unitPrice*item.qty,0);
 const lines=orderItems.map(i=>`• ${i.name} x ${i.qty} — ${money(i.unitPrice)} / item — ${money(i.unitPrice*i.qty)} — Ukuran ${i.size}`);
 const note=$("#customer-note").value.trim();
 const msg=["Halo my fashionstore! Saya ingin memesan produk berikut:","",`Nama: ${name}`,`Nomor WhatsApp: ${phone}`,...lines,"",`Subtotal produk: ${money(total)}`,`Metode pembayaran pilihan: ${paymentMethod}`,"Ongkos kirim belum termasuk dan akan dikonfirmasi admin.","Mohon konfirmasi harga final, ketersediaan metode pembayaran, dan detail pembayaran resmi sebelum saya membayar.",`Catatan: ${note||"-"}`,"Terima kasih!"].join("\n");
 const order={id:`MFS-${Date.now()}`,createdAt:new Date().toISOString(),name,phone,note,items:orderItems,total,paymentMethod,status:"Menunggu konfirmasi admin"};
 state.history.unshift(order);
 const saved=saveOrderHistory();
 renderOrderHistory();
 window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,"_blank","noopener,noreferrer");
 if(saved)$("#status").textContent="Pesanan dicatat. Tunggu konfirmasi harga final, ongkir, dan detail pembayaran dari admin sebelum membayar.";
}
$("#search").addEventListener("input",renderProducts);$("#filter").addEventListener("change",renderProducts);$("#checkout").addEventListener("click",checkout);
$("#year").textContent=new Date().getFullYear();renderProducts();renderGallery();renderBag();renderOrderHistory();
