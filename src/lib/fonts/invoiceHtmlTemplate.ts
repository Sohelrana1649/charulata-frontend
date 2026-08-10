import { HIND_SILIGURI_REGULAR_BASE64, HIND_SILIGURI_BOLD_BASE64 } from './hindSiliguriBase64';

export interface InvoiceData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  date: string;
}

/**
 * Generates an HTML invoice template embedding Hind Siliguri (Bengali) font in base64.
 * Perfect for Puppeteer PDF rendering without external CDN network dependencies.
 */
export function generateInvoiceHtml(data: InvoiceData): string {
  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice #${data.orderId}</title>
  <style>
    @font-face {
      font-family: 'Hind Siliguri';
      src: url(data:font/woff2;base64,${HIND_SILIGURI_REGULAR_BASE64}) format('woff2');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'Hind Siliguri';
      src: url(data:font/woff2;base64,${HIND_SILIGURI_BOLD_BASE64}) format('woff2');
      font-weight: 700;
      font-style: normal;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Hind Siliguri', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      color: #1e293b;
      background-color: #ffffff;
      padding: 40px;
      line-height: 1.6;
    }

    .invoice-container {
      max-w: 800px;
      margin: 0 auto;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 36px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }

    .brand-title {
      font-size: 24px;
      font-weight: 700;
      color: #800020; /* Primary Burgundy */
    }

    .invoice-label {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      text-align: right;
    }

    .customer-details {
      margin-bottom: 24px;
      background: #f8fafc;
      padding: 16px 20px;
      border-radius: 8px;
    }

    .customer-details h3 {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #334155;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }

    th {
      background-color: #f1f5f9;
      color: #475569;
      font-weight: 700;
      text-align: left;
      padding: 12px 16px;
      font-size: 13px;
      text-transform: uppercase;
    }

    td {
      padding: 12px 16px;
      border-bottom: 1px solid #e2e8f0;
    }

    .totals {
      width: 300px;
      margin-left: auto;
    }

    .totals div {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
    }

    .totals .grand-total {
      font-weight: 700;
      font-size: 18px;
      color: #800020;
      border-top: 2px solid #e2e8f0;
      padding-top: 12px;
      margin-top: 6px;
    }

    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div>
        <div class="brand-title">চারুলতা লাইফস্টাইল (Charulata Lifestyle)</div>
        <p>গুলশান ফ্ল্যাগশিপ আউটলেট, ঢাকা, বাংলাদেশ</p>
        <p>ফোন: ০১৬২০-৫৫৬২৯৯ | ইমেইল: support@charulatalifestyle.com</p>
      </div>
      <div>
        <div class="invoice-label">ইনভয়েস (INVOICE)</div>
        <p><strong>ইনভয়েস নং:</strong> ${data.orderId}</p>
        <p><strong>তারিখ:</strong> ${data.date}</p>
      </div>
    </div>

    <div class="customer-details">
      <h3>গ্রাহকের তথ্য (Customer Information)</h3>
      <p><strong>নাম:</strong> ${data.customerName}</p>
      <p><strong>মোবাইল:</strong> ${data.customerPhone}</p>
      <p><strong>ঠিকানা:</strong> ${data.customerAddress}</p>
    </div>

    <table>
      <thead>
        <tr>
          <th>পণ্য (Item)</th>
          <th style="text-align: center;">পরিমাণ (Qty)</th>
          <th style="text-align: right;">মূল্য (Price)</th>
          <th style="text-align: right;">মোট (Total)</th>
        </tr>
      </thead>
      <tbody>
        ${data.items
          .map(
            (item) => `
          <tr>
            <td>${item.name}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">৳${item.price.toLocaleString('bn-BD')}</td>
            <td style="text-align: right;">৳${(item.quantity * item.price).toLocaleString('bn-BD')}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div class="totals">
      <div>
        <span>সাবটোটাল (Subtotal):</span>
        <span>৳${data.subtotal.toLocaleString('bn-BD')}</span>
      </div>
      <div>
        <span>ডেলিভারি চার্জ (Delivery):</span>
        <span>৳${data.deliveryCharge.toLocaleString('bn-BD')}</span>
      </div>
      <div class="grand-total">
        <span>সর্বমোট (Grand Total):</span>
        <span>৳${data.total.toLocaleString('bn-BD')}</span>
      </div>
    </div>

    <div class="footer">
      <p>চারুলতা লাইফস্টাইল থেকে কেনাকাটার জন্য ধন্যবাদ!</p>
      <p>This is a computer-generated invoice and requires no signature.</p>
    </div>
  </div>
</body>
</html>`;
}
