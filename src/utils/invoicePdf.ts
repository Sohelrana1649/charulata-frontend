import { toast } from 'react-toastify';
import { HIND_SILIGURI_REGULAR_BASE64, HIND_SILIGURI_BOLD_BASE64 } from '@/lib/fonts/hindSiliguriBase64';
import { formatOrderDisplayAddress } from '@/utils/orderAddress';

/**
 * Universal High-Precision Invoice PDF Generator for Charulata Lifestyle.
 *
 * Fully supports Bengali font rendering (Hind Siliguri embedded base64).
 * Works across both Desktop and Mobile devices (iOS Safari, Android Chrome, webviews).
 * Includes Logo, Order ID, Date, Product items with details, Discount, Delivery,
 * and explicit Cash on Delivery "Pending (Cash on Delivery)" status.
 */
export const downloadInvoicePdf = (order: any) => {
  if (!order) {
    toast.error('অবৈধ অর্ডার তথ্য');
    return;
  }

  try {
    const orderId = order.orderId || order._id?.slice(-8).toUpperCase() || 'ORDER';
    const items = Array.isArray(order.items) ? order.items : [];
    const addr = order.shippingAddress || {};
    const formattedDate = new Date(order.createdAt || Date.now()).toLocaleString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const computedSubtotal = items.reduce(
      (acc: number, item: any) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
    const subTotal = Number(order.subTotal) || Number(order.subtotal) || computedSubtotal;
    const shippingCharge = Number(order.shippingCharge) || 0;
    const discount = Number(order.discount) || 0;
    const totalAmount = Number(order.totalAmount) || Math.max(0, subTotal + shippingCharge - discount);

    const advancePaid = Number(order.advanceAmount || order.advancePayment || 0);
    const dueCOD = Math.max(0, totalAmount - advancePaid);

    const isCod = !order.paymentMethod || order.paymentMethod.toUpperCase() === 'COD' || order.paymentMethod.toLowerCase().includes('cash');
    const paymentStatusText = isCod
      ? 'Pending (Cash on Delivery)'
      : (order.paymentStatus ? String(order.paymentStatus).toUpperCase() : 'Paid');

    const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice #${orderId} - Charulata Lifestyle</title>
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
      font-family: 'Hind Siliguri', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      padding: 24px;
      line-height: 1.5;
      font-size: 13px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 28px;
      background: #ffffff;
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #800020;
      padding-bottom: 18px;
      margin-bottom: 20px;
    }

    .brand-area {
      display: flex;
      flex-direction: column;
    }

    .brand-logo-img {
      height: 48px;
      width: auto;
      max-width: 180px;
      object-fit: contain;
      margin-bottom: 6px;
    }

    .logo-text {
      font-size: 22px;
      font-weight: 700;
      color: #800020;
      line-height: 1.2;
    }

    .brand-sub {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-top: 2px;
    }

    .brand-contact {
      font-size: 11.5px;
      color: #475569;
      margin-top: 4px;
      line-height: 1.4;
    }

    .invoice-title-block {
      text-align: right;
    }

    .invoice-title {
      font-size: 24px;
      font-weight: 700;
      color: #800020;
      letter-spacing: 0.5px;
    }

    .invoice-badge {
      display: inline-block;
      background: #fdf2f4;
      border: 1px solid #fbcfe8;
      color: #800020;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      margin-top: 4px;
      font-family: monospace;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 22px;
    }

    .info-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
    }

    .info-box h4 {
      font-size: 13px;
      font-weight: 700;
      color: #334155;
      margin-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-box p {
      font-size: 12.5px;
      color: #1e293b;
      margin: 3px 0;
      line-height: 1.4;
    }

    .status-highlight {
      display: inline-block;
      background: #fffbeb;
      color: #b45309;
      border: 1px solid #fde68a;
      padding: 2px 7px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 11.5px;
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
      padding: 9px 12px;
      font-size: 12px;
      letter-spacing: 0.5px;
    }

    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12.5px;
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background-color: #fafafa;
    }

    .item-meta {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }

    .totals-area {
      width: 320px;
      margin-left: auto;
      margin-bottom: 24px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 12.5px;
    }

    .totals-row.grand {
      font-size: 14px;
      font-weight: 700;
      color: #800020;
      border-top: 1.5px dashed #cbd5e1;
      padding-top: 8px;
      margin-top: 6px;
    }

    .totals-row.final-due {
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
      background: #f1f5f9;
      margin: 8px -16px -12px -16px;
      padding: 10px 16px;
      border-radius: 0 0 8px 8px;
      border-top: 2px solid #800020;
    }

    .footer-note {
      text-align: center;
      font-size: 11.5px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      margin-top: 10px;
    }

    @media print {
      body {
        padding: 0;
        background: #ffffff;
      }
      .invoice-card {
        border: none;
        border-radius: 0;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <!-- Header -->
    <div class="header-bar">
      <div class="brand-area">
        <img
          src="https://www.charulatalifestyle.com/logo.png"
          alt="Charulata Lifestyle"
          class="brand-logo-img"
          onerror="this.style.display='none'"
        />
        <div class="logo-text">চারুলতা লাইফস্টাইল</div>
        <div class="brand-sub">CHARULATA LIFESTYLE</div>
        <p class="brand-contact">
          গুলশান ফ্ল্যাগশিপ আউটলেট, ঢাকা - ১২১৩<br/>
          হটলাইন: ০১৬২০-৫৫৬২৯৯ | ইমেইল: info@charulatalifestyle.com
        </p>
      </div>
      <div class="invoice-title-block">
        <div class="invoice-title">ইনভয়েস (INVOICE)</div>
        <div class="invoice-badge">Order ID: #${orderId}</div>
        <p style="font-size: 11.5px; color: #475569; margin-top: 6px;">
          <strong>তারিখ:</strong> ${formattedDate}
        </p>
      </div>
    </div>

    <!-- Info Grid -->
    <div class="info-grid">
      <div class="info-box">
        <h4>গ্রাহক ও ডেলিভারি বিবরণ (Customer Details)</h4>
        <p><strong>নাম:</strong> ${addr.recipientName || 'সম্মানিত গ্রাহক'}</p>
        <p><strong>মোবাইল:</strong> ${addr.recipientPhone || 'N/A'}</p>
        <p><strong>ঠিকানা:</strong> ${formatOrderDisplayAddress(addr)}</p>
        ${order.deliveryNotes ? `<p style="font-size: 11px; color: #64748b;"><strong>নোট:</strong> ${order.deliveryNotes}</p>` : ''}
      </div>
      <div class="info-box">
        <h4>পেমেন্ট ও অর্ডার স্ট্যাটাস (Payment & Order Info)</h4>
        <p><strong>পেমেন্ট মাধ্যম:</strong> ${isCod ? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)' : String(order.paymentMethod || 'Online').toUpperCase()}</p>
        <p><strong>পেমেন্ট স্ট্যাটাস:</strong> <span class="status-highlight">${paymentStatusText}</span></p>
        <p><strong>অর্ডার অবস্থা:</strong> <span style="font-weight: 700; color: #0284c7;">${order.orderStatus || order.deliveryStatus || 'Pending'}</span></p>
        ${order.transactionId ? `<p style="font-size: 11px; color: #64748b;"><strong>TrxID:</strong> ${order.transactionId}</p>` : ''}
      </div>
    </div>

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th style="width: 38px; text-align: center;">#</th>
          <th>পণ্যের বিবরণ (Item Description)</th>
          <th style="width: 90px; text-align: center;">পরিমাণ (Qty)</th>
          <th style="width: 100px; text-align: right;">একক মূল্য (Price)</th>
          <th style="width: 110px; text-align: right;">মোট মূল্য (Total)</th>
        </tr>
      </thead>
      <tbody>
        ${items.length > 0 ? items.map((item: any, idx: number) => {
          const prodTitle = item.product?.title || item.product?.name || item.title || item.name || 'Product';
          const itemPrice = Number(item.price) || Number(item.product?.salePrice) || Number(item.product?.price) || 0;
          const qty = Number(item.quantity) || 1;
          const itemTotal = itemPrice * qty;
          const rawSku = item.sku || item.product?.sku || '';
          const color = item.selectedColor || item.color;
          const size = item.selectedSize || item.size;
          const details = [
            color ? `কালার: ${color}` : '',
            size ? `সাইজ: ${size}` : '',
            rawSku ? `SKU: ${rawSku}` : ''
          ].filter(Boolean).join(' | ');

          return `
            <tr>
              <td style="text-align: center; color: #64748b; font-weight: 700;">${idx + 1}</td>
              <td>
                <strong style="color: #0f172a; font-size: 13px;">${prodTitle}</strong>
                ${details ? `<div class="item-meta">${details}</div>` : ''}
              </td>
              <td style="text-align: center; font-weight: 700;">${qty}</td>
              <td style="text-align: right; font-family: monospace;">৳${itemPrice.toLocaleString('en-IN')}</td>
              <td style="text-align: right; font-weight: 700; font-family: monospace;">৳${itemTotal.toLocaleString('en-IN')}</td>
            </tr>
          `;
        }).join('') : `
          <tr>
            <td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">অর্ডারের পণ্য তালিকা উপলব্ধ নয়</td>
          </tr>
        `}
      </tbody>
    </table>

    <!-- Totals Area -->
    <div class="totals-area">
      <div class="totals-row">
        <span>সাবটোটাল (Subtotal):</span>
        <strong style="font-family: monospace;">৳${subTotal.toLocaleString('en-IN')}</strong>
      </div>
      <div class="totals-row">
        <span>ডেলিভারি চার্জ (Delivery Charge):</span>
        <strong style="font-family: monospace;">+৳${shippingCharge.toLocaleString('en-IN')}</strong>
      </div>
      ${discount > 0 ? `
      <div class="totals-row" style="color: #16a34a;">
        <span>ডিসকাউন্ট (Discount):</span>
        <strong style="font-family: monospace;">-৳${discount.toLocaleString('en-IN')}</strong>
      </div>
      ` : ''}
      <div class="totals-row grand">
        <span>সর্বমোট মূল্য (Total Amount):</span>
        <span style="font-family: monospace;">৳${totalAmount.toLocaleString('en-IN')}</span>
      </div>
      ${advancePaid > 0 ? `
      <div class="totals-row" style="color: #059669; font-weight: 700;">
        <span>অগ্রিম পরিশোধ (${(order.paymentMethod || 'Advance').toUpperCase()}):</span>
        <span style="font-family: monospace;">-৳${advancePaid.toLocaleString('en-IN')}</span>
      </div>
      ` : ''}
      <div class="totals-row final-due">
        <span>${advancePaid > 0 ? 'বকেয়া ক্যাশ অন ডেলিভারি (Due COD):' : 'ক্যাশ অন ডেলিভারিতে প্রদেয় (Pay on Delivery):'}</span>
        <span style="font-family: monospace; color: #800020; font-size: 16px;">৳${(advancePaid > 0 ? dueCOD : totalAmount).toLocaleString('en-IN')}</span>
      </div>
    </div>

    <!-- Footer Note -->
    <div class="footer-note">
      <p style="font-weight: 700; color: #334155;">চারুলতা লাইফস্টাইলের সাথে থাকার জন্য আপনাকে আন্তরিক ধন্যবাদ!</p>
      <p style="margin-top: 3px; font-size: 11px;">
        এটি একটি কম্পিউটার জেনারেটেড ইনভয়েস, কোনো স্বাক্ষরের প্রয়োজন নেই।<br/>
        যেকোনো সহায়তায় আমাদের ফেসবুক পেজে মেসেজ দিন অথবা কল করুন ০১৬২০-৫৫৬২৯৯
      </p>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;

    // Cross-platform print handler (Mobile & Desktop)
    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Hidden iframe avoids mobile popup blocker and triggers native print/Save-to-PDF dialog
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.warn('Iframe print error on mobile, trying popup fallback:', e);
            const win = window.open('', '_blank');
            if (win) {
              win.document.open();
              win.document.write(htmlContent);
              win.document.close();
            }
          }
          setTimeout(() => {
            try { document.body.removeChild(iframe); } catch {}
          }, 3500);
        }, 400);
      }
      toast.success('ইনভয়েস ডাউনলোড/প্রিন্ট প্রস্তুত হচ্ছে...');
      return;
    }

    // Desktop: Try window.open popup first
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      // Popup blocked fallback: Use hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            try { document.body.removeChild(iframe); } catch {}
          }, 3500);
        }, 400);
      }
      toast.success('ইনভয়েস প্রস্তুত করা হয়েছে!');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success('ইনভয়েস প্রস্তুত করা হয়েছে!');
  } catch (err) {
    console.error('Invoice print error:', err);
    toast.error('ইনভয়েস প্রিন্ট করতে ব্যর্থ হয়েছে');
  }
};
