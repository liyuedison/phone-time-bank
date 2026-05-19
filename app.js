const STORAGE_KEY = "xinhuo-live-orders";

const sampleRecords = [
  { region: "杭州", time: "刚刚", name: "李先生", phone: "138****8899", orders: 2, note: "预览样式", source: "demo" },
  { region: "苏州", time: "2分钟前", name: "王女士", phone: "139****6721", orders: 1, note: "预览样式", source: "demo" },
  { region: "成都", time: "5分钟前", name: "陈先生", phone: "186****4512", orders: 3, note: "预览样式", source: "demo" },
  { region: "武汉", time: "8分钟前", name: "赵女士", phone: "158****2309", orders: 1, note: "预览样式", source: "demo" },
  { region: "郑州", time: "12分钟前", name: "周先生", phone: "177****9816", orders: 2, note: "预览样式", source: "demo" },
  { region: "广州", time: "15分钟前", name: "刘女士", phone: "136****5188", orders: 1, note: "预览样式", source: "demo" },
  { region: "南京", time: "18分钟前", name: "孙先生", phone: "151****7206", orders: 4, note: "预览样式", source: "demo" },
  { region: "西安", time: "21分钟前", name: "黄女士", phone: "189****0633", orders: 2, note: "预览样式", source: "demo" },
];

const form = document.querySelector("#entryForm");
const ticker = document.querySelector("#ticker");
const recordList = document.querySelector("#recordList");
const totalOrders = document.querySelector("#totalOrders");
const cityCount = document.querySelector("#cityCount");
const buyerCount = document.querySelector("#buyerCount");
const latestTime = document.querySelector("#latestTime");
const clearRecords = document.querySelector("#clearRecords");
const resetData = document.querySelector("#resetData");
const showVerified = document.querySelector("#showVerified");
const fastMode = document.querySelector("#fastMode");

let records = loadRecords();

function loadRecords() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return sampleRecords;

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : sampleRecords;
  } catch {
    return sampleRecords;
  }
}

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function maskPhone(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return phone;
  return `${digits.slice(0, 3)}****${digits.slice(-4)}`;
}

function render() {
  const repeated = [...records, ...records, ...records];

  ticker.classList.toggle("fast", Boolean(fastMode?.checked));
  ticker.innerHTML = repeated.length
    ? repeated
    .map((item) => {
      const badgeText = item.source === "demo" ? "演示数据" : "真实成交";
      const badgeClass = item.source === "demo" ? "badge demo" : "badge";
      const verifiedText = showVerified?.checked !== false ? `<span class="${badgeClass}">${badgeText}</span>` : "";

      return `
        <article class="ticker-card">
          <div class="ticker-main">
            <strong>${item.region} · ${item.name} · ${maskPhone(item.phone)}</strong>
            <span>${item.time} 成交 <b class="order-count">${item.orders}</b> 单${item.note ? ` · ${item.note}` : ""}</span>
          </div>
          ${verifiedText}
        </article>
      `;
    })
    .join("")
    : `
        <article class="ticker-card empty-state">
          <div class="ticker-main">
            <strong>等待真实成交录入</strong>
            <span>后台添加后，现场播报会自动滚动展示</span>
          </div>
        </article>
      `;

  if (recordList) {
    recordList.innerHTML = records
      .map(
        (item, index) => `
          <article class="record-item">
            <strong>${item.region}｜${item.name}｜成交 <b class="order-count">${item.orders}</b> 单</strong>
            <span>${item.time} · ${maskPhone(item.phone)}${item.note ? ` · ${item.note}` : ""}</span>
            <button class="text-button" type="button" data-delete="${index}">删除</button>
          </article>
        `,
      )
      .join("");
  }

  totalOrders.textContent = records.reduce((sum, item) => sum + Number(item.orders || 0), 0);
  cityCount.textContent = new Set(records.map((item) => item.region)).size;
  buyerCount.textContent = records.length;
  latestTime.textContent = records[0]?.time || "--";
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    records = [
      {
        region: data.get("region").trim(),
        time: data.get("time").trim(),
        name: data.get("name").trim(),
        phone: data.get("phone").trim(),
        orders: Number(data.get("orders")),
        note: data.get("note").trim(),
        source: "real",
      },
      ...records,
    ];
    saveRecords();
    form.reset();
    document.querySelector("#orders").value = 1;
    render();
  });
}

if (recordList) {
  recordList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete]");
    if (!button) return;

    records.splice(Number(button.dataset.delete), 1);
    saveRecords();
    render();
  });
}

clearRecords?.addEventListener("click", () => {
  records = [];
  saveRecords();
  render();
});

resetData?.addEventListener("click", () => {
  records = sampleRecords;
  saveRecords();
  render();
});

showVerified?.addEventListener("change", render);
fastMode?.addEventListener("change", render);

render();
