// ទាញយកទិន្នន័យពី LocalStorage (រក្សាទុកលំនាំដើមបង)
let stockInList = JSON.parse(localStorage.getItem('NH_Manual_stockInList')) || [];
let stockOutList = JSON.parse(localStorage.getItem('NH_Manual_stockOutList')) || [];
let exchangeRate = parseInt(localStorage.getItem('NH_Manual_exchangeRate')) || 4100;
let currentCurrency = localStorage.getItem('NH_Manual_currency') || 'USD'; 

// បង្កើតអថេរទុកឈ្មោះអតិថិជនដើម្បីកែប្រែបាននៅលើទំព័រ Report មុនបោះពុម្ភ
let customerName = "";
let customerAddress = "";
let customerPhone = "";

function saveToLocalStorage() {
    localStorage.setItem('NH_Manual_stockInList', JSON.stringify(stockInList));
    localStorage.setItem('NH_Manual_stockOutList', JSON.stringify(stockOutList));
    localStorage.setItem('NH_Manual_exchangeRate', exchangeRate.toString());
    localStorage.setItem('NH_Manual_currency', currentCurrency);
}

function updateExchangeRate(val) {
    exchangeRate = parseInt(val) || 4100;
    saveToLocalStorage();
    refreshActivePage();
}

function switchCurrency(curr) {
    currentCurrency = curr;
    saveToLocalStorage();
    refreshActivePage();
}

function refreshActivePage() {
    const activeItem = document.querySelector('.menu-item.active');
    if (activeItem) {
        const activePage = activeItem.getAttribute('data-page');
        loadPage(activePage);
    }
}

function formatMoney(amountInUSD) {
    if (currentCurrency === 'KHR') {
        return `${(amountInUSD * exchangeRate).toLocaleString()} ៛`;
    } else {
        return `$${amountInUSD.toFixed(2)}`;
    }
}

// មុខងាររួមសម្រាប់បង្ហាញរបារប្តូរប្រាក់ និងប៊ូតុងប្តូររូបិយប័ណ្ណ ($ / ៛) នៅគ្រប់ទំព័រ
function renderCurrencyController() {
    return `
        <div class="control-panel-box no-print">
            <div class="rate-input-group">
                <label>អត្រាប្តូរប្រាក់៖ $1 = </label>
                <input type="number" value="${exchangeRate}" onchange="updateExchangeRate(this.value)"> <span>៛</span>
            </div>
            <div class="currency-switch-group">
                <span style="font-weight:bold; color:#333;">បង្ហាញទិន្នន័យជា៖</span>
                <button class="btn-toggle-curr ${currentCurrency === 'USD' ? 'active' : ''}" onclick="switchCurrency('USD')">ដុល្លារ ($)</button>
                <button class="btn-toggle-curr ${currentCurrency === 'KHR' ? 'active' : ''}" onclick="switchCurrency('KHR')">រៀល (៛)</button>
            </div>
        </div>
    `;
}

// មុខងារសម្អាតទិន្នន័យទាំងអស់ (Clear All)
function clearStockIn() {
    if (confirm("តើបងពិតជាចង់លុប 'បញ្ជីទំនិញចូលស្តុក' ទាំងអស់នេះមែនទេ?")) {
        stockInList = [];
        saveToLocalStorage();
        refreshActivePage();
    }
}

function clearStockOut() {
    if (confirm("តើបងពិតជាចង់លុប 'បញ្ជីលក់ចេញ' ទាំងអស់ដើម្បីធ្វើវិក្កយបត្រថ្មីមែនទេ?")) {
        stockOutList = [];
        customerName = "";
        customerAddress = "";
        customerPhone = "";
        saveToLocalStorage();
        refreshActivePage();
    }
}

// ==========================================
// ១. ផ្ទាំងទំនិញចូលស្តុក (បន្ថែមប៊ូតុង Clear)
// ==========================================
function renderStockInPage() {
    let html = `<div class="table-title no-print"> គ្រប់គ្រងទំនិញចូលស្តុក / Stock In</div>`;
    
    html += renderCurrencyController();
    
    html += `<div class="input-form-container no-print">
        <form onsubmit="addStockIn(event)" class="form-grid">
            <div class="form-group"><label>កូដទំនិញ:</label><input type="text" id="si-code" required></div>
            <div class="form-group"><label>ឈ្មោះទំនិញ:</label><input type="text" id="si-name" required></div>
            <div class="form-group"><label>ចំនួន:</label><input type="number" id="si-qty" required></div>
            <div class="form-group"><label>តម្លៃដើម ($):</label><input type="number" step="0.01" id="si-cost" required></div>
            <button type="submit" class="btn-submit">បញ្ចូលស្តុក</button>
        </form>
    </div>`;

    html += `
        <div style="display: flex; justify-content: space-between; align-items: center; margin: 15px 0 10px 0;" class="no-print">
            <h3 style="margin: 0; color:#002566;">📝 បញ្ជីរាយនាមទំនិញចូលស្តុក</h3>
            <button class="btn-danger" style="padding: 6px 15px; font-weight: bold;" onclick="clearStockIn()"> (Clear All)</button>
        </div>
    `;

    html += `<div class="table-responsive"><table class="data-table"><thead><tr><th>លរ</th><th>កូដ</th><th>ឈ្មោះទំនិញ</th><th>ចំនួន</th><th>តម្លៃឯកតា</th><th>សរុប</th><th class="no-print">សកម្មភាព</th></tr></thead><tbody>`;
    if(stockInList.length === 0){
        html += `<tr><td colspan="7" style="text-align:center; color:#999; padding:15px;">មិនទាន់មានទិន្នន័យចូលស្តុកឡើយ</td></tr>`;
    } else {
        stockInList.forEach((si, index) => {
            html += `<tr><td>${index+1}</td><td>${si.code}</td><td>${si.name}</td><td>${si.qty}</td><td>${formatMoney(si.cost)}</td><td>${formatMoney(si.qty*si.cost)}</td><td class="no-print"><button class="btn-danger" onclick="deleteStockIn(${index})">លុប</button></td></tr>`;
        });
    }
    html += `</tbody></table></div>`;
    return html;
}

// ==========================================
// ២. ផ្ទាំងទំនិញលក់ចេញ / POS (បន្ថែមប៊ូតុង Clear សម្រាប់ធ្វើវិក្កយបត្រថ្មី)
// ==========================================
function renderStockOutPage() {
    let html = `<div class="table-title no-print"> ផ្ទាំងលក់ទំនិញចេញ / POS Sales</div>`;
    
    html += renderCurrencyController();
    
    html += `<div class="input-form-container no-print">
        <form onsubmit="addStockOut(event)" class="form-grid">
            <div class="form-group"><label>កូដទំនិញ:</label><input type="text" id="so-code" required></div>
            <div class="form-group"><label>ឈ្មោះទំនិញ:</label><input type="text" id="so-name" required></div>
            <div class="form-group"><label>ចំនួនលក់:</label><input type="number" id="so-qty" required></div>
            <div class="form-group"><label>តម្លៃលក់ ($):</label><input type="number" step="0.01" id="so-price" required></div>
            <button type="submit" class="btn-submit">រក្សាទុក</button>
        </form>
    </div>`;

    html += `
        <div style="display: flex; justify-content: space-between; align-items: center; margin: 15px 0 10px 0;" class="no-print">
            <h3 style="margin: 0; color:#002566;">📝 បញ្ជីរាយនាមទំនិញលក់ចេញ</h3>
            <button class="btn-danger" style="padding: 6px 15px; font-weight: bold; background-color: #dc3545;" onclick="clearStockOut()"> (Clear all)</button>
        </div>
    `;

    html += `<div class="table-responsive"><table class="data-table"><thead><tr><th>លរ</th><th>កូដ</th><th>ឈ្មោះទំនិញ</th><th>ចំនួនលក់</th><th>តម្លៃលក់</th><th>សរុប</th><th class="no-print">សកម្មភាព</th></tr></thead><tbody>`;
    if(stockOutList.length === 0){
        html += `<tr><td colspan="7" style="text-align:center; color:#999; padding:15px;">មិនទាន់មានទិន្នន័យលក់ចេញឡើយ</td></tr>`;
    } else {
        stockOutList.forEach((so, index) => {
            html += `<tr><td>${index+1}</td><td>${so.code}</td><td>${so.name}</td><td>${so.qty}</td><td>${formatMoney(so.price)}</td><td>${formatMoney(so.qty*so.price)}</td><td class="no-print"><button class="btn-danger" onclick="deleteStockOut(${index})">លុប</button></td></tr>`;
        });
    }
    html += `</tbody></table></div>`;
    return html;
}

function addStockIn(e){ e.preventDefault(); stockInList.push({code:document.getElementById('si-code').value, name:document.getElementById('si-name').value, qty:parseInt(document.getElementById('si-qty').value), cost:parseFloat(document.getElementById('si-cost').value)}); saveToLocalStorage(); refreshActivePage(); }
function addStockOut(e){ e.preventDefault(); stockOutList.push({code:document.getElementById('so-code').value, name:document.getElementById('so-name').value, qty:parseInt(document.getElementById('so-qty').value), price:parseFloat(document.getElementById('so-price').value)}); saveToLocalStorage(); refreshActivePage(); }
function deleteStockIn(i){ stockInList.splice(i,1); saveToLocalStorage(); refreshActivePage(); }
function deleteStockOut(i){ stockOutList.splice(i,1); saveToLocalStorage(); refreshActivePage(); }

// =========================================================================
// ៣. ផ្ទាំងរបាយការណ៍សរុប
// =========================================================================
function renderReportPage() {
    let totalCapital = 0, totalRevenue = 0;
    stockInList.forEach(si => totalCapital += (si.qty * si.cost));
    stockOutList.forEach(so => totalRevenue += (so.qty * so.price));

    let today = new Date();
    let currentDateStr = String(today.getMonth() + 1).padStart(2, '0') + '/' + String(today.getDate()).padStart(2, '0') + '/' + today.getFullYear();

    let html = `
        <div class="table-title no-print"> របាយការណ៍ទិញលក់សរុប / System Report</div>
        
        <!-- ប៊ូតុងប្តូររូបិយប័ណ្ណនៅលើទំព័រ Report -->
        ${renderCurrencyController()}
        
        <!-- ផ្ទាំងសម្រាប់កែព័ត៌មានអតិថិជនមុនចុច Print -->
        <div class="input-form-container no-print">
            <h3>✍️ បំពេញព័ត៌មានអតិថិជនសម្រាប់វិក្កយបត្របោះពុម្ភ</h3>
            <div class="form-grid">
                <div class="form-group"><label>ឈ្មោះអតិថិជន៖</label><input type="text" id="c-name" value="${customerName}" oninput="syncInvData()"></div>
                <div class="form-group"><label>អាសយដ្ឋាន៖</label><input type="text" id="c-addr" value="${customerAddress}" oninput="syncInvData()"></div>
                <div class="form-group"><label>ទូរស័ព្ទលេខ៖</label><input type="text" id="c-phone" value="${customerPhone}" oninput="syncInvData()"></div>
                <button class="btn-print" onclick="window.print()"><i class="fa-solid fa-print"></i> បោះពុម្ភវិក្កយបត្រ (Print)</button>
            </div>
        </div>

        <!-- តារាងបញ្ជីទំនិញចូលស្តុក -->
        <div class="table-responsive no-print" style="margin-bottom: 20px;">
            <h3 style="margin: 15px 0 10px 0; color:#002566;">📝 បញ្ជីរាយនាមទំនិញចូលស្តុក</h3>
            <table class="data-table">
                <thead>
                    <tr><th>លរ</th><th>កូដទំនិញ</th><th>ឈ្មោះទំនិញ</th><th>ចំនួនចូល</th><th>តម្លៃដើមឯកតា</th><th>សរុបទឹកប្រាក់</th></tr>
                </thead>
                <tbody>`;
                
                if(stockInList.length === 0){
                    html += `<tr><td colspan="6" style="text-align:center; color:#999; padding:10px;">មិនទាន់មានទិន្នន័យចូលស្តុកឡើយ</td></tr>`;
                } else {
                    stockInList.forEach((si, index) => {
                        html += `<tr><td>${index+1}</td><td>${si.code}</td><td><b>${si.name}</b></td><td>${si.qty}</td><td>${formatMoney(si.cost)}</td><td>${formatMoney(si.qty*si.cost)}</td></tr>`;
                    });
                }
                
    html += `</tbody></table></div>`;

    // តារាងបញ្ជីទំនិញលក់ចេញចុងក្រោយ
    html += `
        <div class="table-responsive no-print">
            <h3 style="margin: 15px 0 10px 0; color:#002566;">📝 បញ្ជីរាយនាមទំនិញលក់ចេញចុងក្រោយ</h3>
            <table class="data-table">
                <thead>
                    <tr><th>លរ</th><th>កូដទំនិញ</th><th>ឈ្មោះទំនិញ</th><th>ចំនួនលក់</th><th>តម្លៃលក់ឯកតា</th><th>សរុបទឹកប្រាក់</th></tr>
                </thead>
                <tbody>`;
                
                if(stockOutList.length === 0){
                    html += `<tr><td colspan="6" style="text-align:center; color:#999; padding:10px;">មិនទាន់មានទិន្នន័យលក់ចេញឡើយ</td></tr>`;
                } else {
                    stockOutList.forEach((so, index) => {
                        html += `<tr><td>${index+1}</td><td>${so.code}</td><td><b>${so.name}</b></td><td>${so.qty}</td><td>${formatMoney(so.price)}</td><td>${formatMoney(so.qty*so.price)}</td></tr>`;
                    });
                }
                
    html += `</tbody></table></div>`;

    /* =========================================================================
       --- កូដបង្កើតទម្រង់វិក្កយបត្របោះពុម្ភលាក់ទុក (បង្ហាញតែពេលបោះពុម្ភ) ---
       ========================================================================= */
    html += `
        <div id="invoice-print-area">
            <div class="inv-header-banner">
                <div class="inv-logo-box">
                    <img src="images/Logo.JPG" alt="Logo">
                </div>
                <div class="inv-title-box">
                    <h1>វិក្កយបត្រ</h1>
                    <h2>NH បោះដុំអាហារ</h2>
                </div>
            </div>

            <div class="inv-info-row">
                <div class="inv-cust-side">
                    <div><b>ឈ្មោះអតិថិជន៖</b> <span id="lbl-c-name">${customerName}</span></div>
                    <div><b>អាសយដ្ឋាន៖</b> <span id="lbl-c-addr">${customerAddress}</span></div>
                    <div><b>ទូរស័ព្ទលេខ៖</b> <span id="lbl-c-phone">${customerPhone}</span></div>
                </div>
                <div class="inv-shop-side">
                    <div><b>កាលបរិច្ឆេទ៖</b> ${currentDateStr}</div>
                    <div><b>លេខទំនាក់ទំនង៖</b> 010 90 72 71 / 016 661 138</div>
                </div>
            </div>

            <table class="inv-table">
                <thead>
                    <tr>
                        <th style="width: 10%;">ល.រ</th>
                        <th style="width: 45%;">មុខទំនិញ</th>
                        <th style="width: 15%;">ចំនួន</th>
                        <th style="width: 15%;">តម្លៃរាយ</th>
                        <th style="width: 15%;">តម្លៃសរុប</th>
                    </tr>
                </thead>
                <tbody>`;

    if (stockOutList.length === 0) {
        html += `<tr><td style="text-align:center;">1</td><td style="text-align:center;">-</td><td style="text-align:center;">0</td><td style="text-align:right;">$0.00</td><td style="text-align:right;">$0.00</td></tr>`;
    } else {
        stockOutList.forEach((item, index) => {
            html += `<tr>
                <td style="text-align:center;">${index + 1}</td>
                <td>${item.name}</td>
                <td style="text-align:center;">${item.qty}</td>
                <td style="text-align:right;">${formatMoney(item.price)}</td>
                <td style="text-align:right;">${formatMoney(item.qty * item.price)}</td>
            </tr>`;
        });
    }

    html += `
                    <tr class="inv-total-row">
                        <td colspan="4" style="text-align:right;">តម្លៃសរុបទាំងអស់/Total</td>
                        <td style="text-align:right;">${formatMoney(totalRevenue)}</td>
                    </tr>
                </tbody>
            </table>

            <div class="inv-footer">
                <div class="inv-qr-group">
                    <div class="inv-qr-box"><img src="images/qr-abakh.png" alt="QR"></div>
                    <div class="inv-qr-box"><img src="images/qr-abausd.png" alt="QR"></div>
                </div>
                <div class="inv-aba-name">ABA: HOUN NHAN</div>
                <div class="inv-thanks">សូមអរគុណ! សម្រាប់ការគាំទ្រ !!</div>
            </div>
        </div>
    `;

    return html;
}

// មុខងារចម្លងព័ត៌មានអតិថិជនពីប្រអប់វាយបញ្ចូលទៅកាន់ក្រដាសវិក្កយបត្រស្វ័យប្រវត្ត
function syncInvData() {
    const cNameEl = document.getElementById('c-name');
    const cAddrEl = document.getElementById('c-addr');
    const cPhoneEl = document.getElementById('c-phone');

    customerName = cNameEl ? cNameEl.value : "";
    customerAddress = cAddrEl ? cAddrEl.value : "";
    customerPhone = cPhoneEl ? cPhoneEl.value : "";

    const lblName = document.getElementById('lbl-c-name');
    const lblAddr = document.getElementById('lbl-c-addr');
    const lblPhone = document.getElementById('lbl-c-phone');

    if (lblName) lblName.innerText = customerName;
    if (lblAddr) lblAddr.innerText = customerAddress;
    if (lblPhone) lblPhone.innerText = customerPhone;
}

function loadPage(page) {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;
    
    if (page === 'stock-in') contentArea.innerHTML = renderStockInPage();
    else if (page === 'stock-out') contentArea.innerHTML = renderStockOutPage();
    else if (page === 'report') contentArea.innerHTML = renderReportPage();
}

document.addEventListener('DOMContentLoaded', () => {
    loadPage('stock-in');
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            loadPage(item.getAttribute('data-page'));
        });
    });
});