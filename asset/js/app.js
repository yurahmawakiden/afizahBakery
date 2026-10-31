// ===== Ambil elemen DOM =====
const menuEl = document.getElementById("menu");
const filterEl = document.getElementById("filter-produk");
const jumlahEl = document.getElementById("jumlah-produk");
const daftarEl = document.getElementById("daftar-produk");
const formKontak = document.getElementById("form-kontak");
const statusEl = document.getElementById("form-status");
const tahunEl = document.getElementById("tahun");

// ===== Data & state =====
const MENU = [
  { id: "beranda", label: "Beranda" },
  { id: "produk", label: "Produk" },
  { id: "kontak", label: "Kontak" },
];

let filterKategori = "semua";
let PRODUCTS = []; // diisi setelah data.json berhasil dimuat

// ===== Fungsi bantu =====
function rupiah(angka) {
  return "Rp " + Number(angka).toLocaleString("id-ID");
}

function esc(teks) {
  return String(teks ?? "").replace(/[&<>"']/g, function (c) {
    return {
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c];
  });
}

// ===== Render menu =====
function renderMenu() {
  menuEl.innerHTML = MENU.map(function (m) {
    return `<li><a href="#${esc(m.id)}">${esc(m.label)}</a></li>`;
  }).join("");
}

// ===== Render produk =====
function kartuProduk(p) {
  return `
  <article class="card">
    <img class="card-img" src="${esc(p.img)}" alt="${esc(p.alt || p.nama)}" loading="lazy">
    <h3>${esc(p.nama)}</h3>
    <p class="meta">${esc(p.kategori)}</p>
    <p>${esc(p.deskripsi)}</p>
    <p class="price">${rupiah(p.harga)}</p>
  </article>
  `;
}

function renderProduk() {
  const daftar = filterKategori === "semua"
    ? PRODUCTS
    : PRODUCTS.filter(function (p) {
        return p.kategori === filterKategori;
      });

  jumlahEl.textContent = "Menampilkan " + daftar.length + " produk";

  if (daftar.length === 0) {
    daftarEl.innerHTML = "<p>Belum ada produk pada kategori ini.</p>";
    return;
  }
  daftarEl.innerHTML = daftar.map(kartuProduk).join("");
}

// ===== Render filter (kategori otomatis dari data) =====
function renderFilter() {
  const kategori = ["semua", ...new Set(PRODUCTS.map(function (p) {
    return p.kategori;
  }))];

  filterEl.innerHTML = kategori.map(function (k) {
    const aktif = k === filterKategori ? "active" : "";
    return `<button type="button" class="filter ${aktif}" data-kategori="${esc(k)}">${esc(k)}</button>`;
  }).join("");
}

filterEl.addEventListener("click", function (e) {
  const tombol = e.target.closest("[data-kategori]");
  if (!tombol) return;
  filterKategori = tombol.dataset.kategori;
  renderFilter();
  renderProduk();
});

// ===== Form kontak =====
formKontak.addEventListener("submit", function (e) {
  e.preventDefault();
  const nama = formKontak.nama.value.trim();
  const pesan = formKontak.pesan.value.trim();

  if (nama === "" || pesan === "") {
    statusEl.textContent = "Nama dan pesan wajib diisi.";
    return;
  }

  statusEl.textContent = `Terima kasih, ${nama}! Pesan Anda sudah kami terima.`;
  formKontak.reset();
});

// ===== Inisialisasi =====
tahunEl.textContent = new Date().getFullYear();
renderMenu();
jumlahEl.textContent = "";
daftarEl.innerHTML = "<p>Memuat produk...</p>";

// Path relatif terhadap index.html, bukan terhadap app.js
fetch("data/data.json")
  .then(function (response) {
    if (!response.ok) {
      throw new Error("Gagal memuat data (status " + response.status + ")");
    }
    return response.json();
  })
  .then(function (data) {
    if (!data || !Array.isArray(data.produk)) {
      throw new Error('Format data.json salah: harus { "produk": [ ... ] }');
    }
    PRODUCTS = data.produk;
    renderFilter(); // dirender setelah data tersedia
    renderProduk();
  })
  .catch(function (error) {
    console.error("Gagal mengambil data produk:", error);
    jumlahEl.textContent = "";
    daftarEl.innerHTML =
      "<p>Gagal memuat produk. Pastikan aplikasi dijalankan lewat server lokal dan file data/data.json tersedia.</p>";
  });