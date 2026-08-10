import { toast } from 'react-toastify';
import { HIND_SILIGURI_REGULAR_BASE64, HIND_SILIGURI_BOLD_BASE64 } from '@/lib/fonts/hindSiliguriBase64';

/**
 * High-precision HTML & Base64 Embedded Bengali Font (Hind Siliguri) Invoice Generator.
 * Replaces jsPDF to prevent Bengali unicode character corruption.
 */
export const downloadInvoicePdf = (order: any) => {
  if (!order) {
    toast.error('অবৈধ অর্ডার ডেটা');
    return;
  }

  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('পপ-আপ ব্লক করা আছে, অনুগ্রহ করে পপ-আপ আনব্লক করুন');
      return;
    }

    const orderId = order.orderId || order._id?.slice(-8).toUpperCase() || 'ORDER';
    const items = order.items || [];
    const addr = order.shippingAddress || {};
    const formattedDate = new Date(order.createdAt || Date.now()).toLocaleString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const computedSubtotal = items.reduce(
      (acc: number, item: any) => acc + (item.price || 0) * (item.quantity || 1),
      0
    );
    const subTotal = order.subTotal || order.subtotal || computedSubtotal;
    const shippingCharge = order.shippingCharge || 0;
    const discount = order.discount || 0;
    const totalAmount = order.totalAmount || subTotal + shippingCharge - discount;

    const advancePaid = Number(order.advanceAmount || order.advancePayment || 0);
    const dueCOD = Math.max(0, totalAmount - advancePaid);

    const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${orderId}</title>
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
      font-family: 'Hind Siliguri', 'Segoe UI', Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      padding: 24px;
      line-height: 1.5;
      font-size: 13px;
    }

    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 32px;
      background: #ffffff;
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #800020;
      padding-bottom: 18px;
      margin-bottom: 20px;
    }

    .logo-text {
      font-size: 22px;
      font-weight: 700;
      color: #800020;
      font-family: 'Hind Siliguri', serif;
    }

    .invoice-title {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      text-align: right;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }

    .info-box {
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 8px;
      padding: 14px;
    }

    .info-box h4 {
      font-size: 14px;
      font-weight: 700;
      color: #334155;
      margin-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    th {
      background: #800020;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 10px 14px;
      font-size: 12px;
    }

    td {
      padding: 10px 14px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
    }

    .totals-area {
      width: 300px;
      margin-left: auto;
      margin-bottom: 30px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 13px;
    }

    .totals-row.grand {
      font-size: 15px;
      font-weight: 700;
      color: #800020;
      border-top: 2px solid #800020;
      padding-top: 8px;
      margin-top: 4px;
    }

    .footer-note {
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
    }

    @media print {
      body {
        padding: 0;
      }
      .invoice-card {
        border: none;
        border-radius: 0;
        box-shadow: none;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header-bar">
      <div>
        <div class="logo-text">চারুলতা লাইফস্টাইল</div>
        <p style="font-size: 12px; color: #475569;">গুলশান ফ্ল্যাগশিপ আউটলেট, ঢাকা - ১২১৩</p>
        <p style="font-size: 12px; color: #475569;">হটলাইন: ০১৬২০-৫৫৬২৯৯</p>
      </div>
      <div>
        <div class="invoice-title">ইনভয়েস (INVOICE)</div>
        <p style="font-size: 12px; text-align: right;"><strong>আইডি:</strong> #${orderId}</p>
        <p style="font-size: 12px; text-align: right;"><strong>তারিখ:</strong> ${formattedDate}</p>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <h4>গ্রাহক ও ডেলিভারি তথ্য</h4>
        <p><strong>নাম:</strong> ${addr.recipientName || 'N/A'}</p>
        <p><strong>মোবাইল:</strong> ${addr.recipientPhone || 'N/A'}</p>
        <p><strong>ঠিকানা:</strong> ${addr.addressLine || ''}, ${addr.district || ''}</p>
      </div>
      <div class="info-box">
        <h4>পেমেন্ট ও অর্ডার বিবরণ</h4>
        <p><strong>পেমেন্ট মাধ্যম:</strong> ${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'ক্যাশ অন ডেলিভারি (COD)'}</p>
        <p><strong>পেমেন্ট স্ট্যাটাস:</strong> ${order.paymentStatus || 'Pending'}</p>
        <p><strong>ডেলিভারি স্ট্যাটাস:</strong> ${order.deliveryStatus || 'Pending'}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>ক্রমিক</th>
          <th>পণ্যের নাম</th>
          <th>কালার / সাইজ</th>
          <th style="text-align: center;">পরিমাণ</th>
          <th style="text-align: right;">একক মূল্য</th>
          <th style="text-align: right;">মোট মূল্য</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item: any, idx: number) => `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${item.product?.title || 'Product'}</strong></td>
            <td>${[item.selectedColor ? `কালার: ${item.selectedColor}` : '', item.selectedSize ? `সাইজ: ${item.selectedSize}` : ''].filter(Boolean).join(', ') || '—'}</td>
            <td style="text-align: center;">${item.quantity || 1}</td>
            <td style="text-align: right;">৳${(item.price || 0).toLocaleString('bn-BD')}</td>
            <td style="text-align: right;">৳${((item.price || 0) * (item.quantity || 1)).toLocaleString('bn-BD')}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div class="totals-area">
      <div class="totals-row">
        <span>সাবটোটাল:</span>
        <span>৳${subTotal.toLocaleString('bn-BD')}</span>
      </div>
      <div class="totals-row">
        <span>ডেলিভারি চার্জ:</span>
        <span>৳${shippingCharge.toLocaleString('bn-BD')}</span>
      </div>
      ${
        discount > 0
          ? `
      <div class="totals-row" style="color: #16a34a;">
        <span>ডিসকাউন্ট:</span>
        <span>-৳${discount.toLocaleString('bn-BD')}</span>
      </div>
      `
          : ''
      }
      <div class="totals-row" style="font-weight: 700;">
        <span>মোট অর্ডার মূল্য:</span>
        <span>৳${totalAmount.toLocaleString('bn-BD')}</span>
      </div>
      ${
        advancePaid > 0
          ? `
      <div class="totals-row" style="color: #16a34a; font-weight: 700;">
        <span>অগ্রিম পরিশোধ (${(order.paymentMethod || 'BKASH').toUpperCase()}):</span>
        <span>-৳${advancePaid.toLocaleString('bn-BD')}</span>
      </div>
      `
          : ''
      }
      <div class="totals-row grand">
        <span>${advancePaid > 0 ? 'ডেলিভারিতে দেয় অবশিষ্ট (Due COD):' : 'সর্বমোট দেয় (Grand Total):'}</span>
        <span>৳${(advancePaid > 0 ? dueCOD : totalAmount).toLocaleString('bn-BD')}</span>
      </div>
    </div>

    <div class="footer-note">
      <p style="font-weight: 700;">চারুলতা লাইফস্টাইল থেকে কেনাকাটা করার জন্য ধন্যবাদ!</p>
      <p style="margin-top: 4px; font-size: 11px;">ইমেইল: charulatalifestyl@gmail.com | ওয়েবসাইট: www.charulatalifestyle.com</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    toast.success('ইনভয়েস সফলভাবে প্রস্তুত করা হয়েছে!');
  } catch (err) {
    console.error('Invoice print error:', err);
    toast.error('ইনভয়েস প্রিন্ট করতে ব্যর্থ হয়েছে');
  }
};
