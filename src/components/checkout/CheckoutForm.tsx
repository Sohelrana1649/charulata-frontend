'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCheckoutMutation, useGuestCheckoutMutation, useValidateCouponMutation } from '@/store/api/orderApi';
import { useGetCartQuery, useRemoveFromCartMutation, useUpdateCartQuantityMutation } from '@/store/api/cartApi';
import { useGetDistrictsQuery, useCompleteProfileMutation } from '@/store/api/userApi';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/authSlice';
import Link from 'next/link';
import Image from '@/components/SafeImage';
import { ShoppingCart, MapPin, Truck, Phone, User, FileText, CheckCircle2, Ticket, Loader2, Sparkles, Lock, ArrowRight, ArrowLeft, Printer, Package, Eye, EyeOff, Mail, History, Navigation, BadgeCheck, X, Minus, Plus, CreditCard, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { fbEvent, getCatalogProductId, getFbp, getFbc, generateMetaEventId } from '@/components/analytics/FacebookPixel';
import { useTranslation } from '@/i18n/LanguageContext';
import { useGetProductsQuery } from '@/store/api/productApi';
import { useGetSettingsQuery } from '@/store/api/settingsApi';
import { getGuestCart, removeFromGuestCart, clearGuestCart, updateGuestCartQuantity } from '@/utils/guestCart';
import { getThanasForDistrict, IThana } from '@/data/bangladeshLocations';
import { formatOrderDisplayAddress, parseAndFormatOrderAddress } from '@/utils/orderAddress';
import confetti from 'canvas-confetti';

const BANGLA_DISTRICT_MAP: Record<string, string> = {
  'ঢাকা': 'Dhaka',
  'চট্টগ্রাম': 'Chattogram',
  'সিলেট': 'Sylhet',
  'রাজশাহী': 'Rajshahi',
  'খুলনা': 'Khulna',
  'বরিশাল': 'Barishal',
  'রংপুর': 'Rangpur',
  'ময়মনসিংহ': 'Mymensingh',
  'কুমিল্লা': 'Cumilla',
  'গাজীপুর': 'Gazipur',
  'নারায়ণগঞ্জ': 'Narayanganj',
  'বগুড়া': 'Bogura',
  'কক্সবাজার': "Cox's Bazar",
  'যশোর': 'Jashore',
  'পাবনা': 'Pabna',
  'দিনাজপুর': 'Dinajpur',
  'ফরিদপুর': 'Faridpur',
  'নোয়াখালী': 'Noakhali',
  'ফেনী': 'Feni',
  'টাঙ্গাইল': 'Tangail',
  'জামালপুর': 'Jamalpur',
  'শেরপুর': 'Sherpur',
  'কিশোরগঞ্জ': 'Kishoreganj',
  'মানিকগঞ্জ': 'Manikganj',
  'মুন্সীগঞ্জ': 'Munshiganj',
  'রাজবাড়ী': 'Rajbari',
  'গোপালগঞ্জ': 'Gopalganj',
  'মাদারীপুর': 'Madaripur',
  'শরীয়তপুর': 'Shariatpur',
  'সাতক্ষীরা': 'Satkhira',
  'বাগেরহাট': 'Bagerhat',
  'ঝিনাইদহ': 'Jhenaidah',
  'মাগুরা': 'Magura',
  'নড়াইল': 'Narail',
  'কুষ্টিয়া': 'Kushtia',
  'চুয়াডাঙ্গা': 'Chuadanga',
  'মেহেরপুর': 'Meherpur',
  'সিরাজগঞ্জ': 'Sirajganj',
  'নাটোর': 'Natore',
  'নওগাঁ': 'Naogaon',
  'চাঁপাইনবাবগঞ্জ': 'Chapainawabganj',
  'জয়পুরহাট': 'Joypurhat',
  'পঞ্চগড়': 'Panchagarh',
  'ঠাকুরগাঁও': 'Thakurgaon',
  'নীলফামারী': 'Nilphamari',
  'লালমনিরহাট': 'Lalmonirhat',
  'কুড়িগ্রাম': 'Kurigram',
  'গাইবান্ধা': 'Gaibandha',
  'হবিগঞ্জ': 'Habiganj',
  'মৌলভীবাজার': 'Moulvibazar',
  'সুনামগঞ্জ': 'Sunamganj',
  'ব্রাহ্মণবাড়িয়া': 'Brahmanbaria',
  'চাঁদপুর': 'Chandpur',
  'লক্ষ্মীপুর': 'Lakshmipur',
  'রাঙ্গামাটি': 'Rangamati',
  'বান্দরবান': 'Bandarban',
  'খাগড়াছড়ি': 'Khagrachhari',
  'পটুয়াখালী': 'Patuakhali',
  'ভোলা': 'Bhola',
  'বরগুনা': 'Barguna',
  'ঝালকাঠি': 'Jhalokati',
  'পিরোজপুর': 'Pirojpur',
  'নেত্রকোনা': 'Netrokona'
};

const ENGLISH_TO_BANGLA_DISTRICT_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(BANGLA_DISTRICT_MAP).map(([bn, en]) => [en.toLowerCase(), bn])
);

export default function CheckoutForm() {
  const { locale, t } = useTranslation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { data: cartResponse, isLoading: cartLoading, refetch } = useGetCartQuery({}, { skip: !isAuthenticated });
  const { data: districtsResponse, isLoading: districtsLoading } = useGetDistrictsQuery(undefined);
  const { data: settingsResponse } = useGetSettingsQuery();
  const { data: allProductsResponse } = useGetProductsQuery({ limit: 500 });
  const dbProductsList = useMemo(() => allProductsResponse?.data || allProductsResponse?.products || allProductsResponse || [], [allProductsResponse]);

  const settings = settingsResponse?.data;

  const rawAdvanceAmount = settings?.advancePaymentAmount ?? 200;
  const requireAdvancePayment = settings?.requireAdvancePayment !== false && rawAdvanceAmount > 0;
  const advancePaymentAmount = requireAdvancePayment ? rawAdvanceAmount : 0;

  const bkashNumber = settings?.bkashNumber || settings?.paymentPhoneNumber || '01620-556299';
  const nagadNumber = settings?.nagadNumber || settings?.paymentPhoneNumber || '01620-556299';
  const rocketNumber = settings?.rocketNumber || settings?.paymentPhoneNumber || '01620-556299';
  const enableBkash = settings?.enableBkash !== false;
  const enableNagad = settings?.enableNagad !== false;
  const enableRocket = settings?.enableRocket !== false;
  const enableCOD = settings?.enableCOD !== false;
  const paymentInstructions = settings?.paymentInstructions || 'বিকাশ, নগদ বা রকেটের মাধ্যমে নির্ধারিত অগ্রিম টাকা সেন্ড মানি করে ট্রানজেকশন আইডি প্রদান করুন।';

  const paymentPhoneNumber = settings?.paymentPhoneNumber || '01620-556299';
  const paymentMethodsInfo = settings?.paymentMethodsInfo || '(বিকাশ/নগদ/রকেট পার্সোনাল)';
  const prepaymentNoticeTitle = settings?.prepaymentNoticeTitle || t('checkout.prepaymentNoticeTitle');
  const prepaymentRule1 = settings?.prepaymentRule1 || `১. প্রতিটি পণ্য অর্ডার করতে অগ্রিম হিসেবে আমাদের ${advancePaymentAmount} টাকা সেন্ড মানি করতে হবে। এই টাকাটা টোটাল বিল থেকে বাদ দেওয়া হবে।`;
  const prepaymentRule2 = settings?.prepaymentRule2 || t('checkout.prepaymentNoticeLine2');
  const prepaymentRule3 = settings?.prepaymentRule3 || t('checkout.prepaymentNoticeLine3');
  const prepaymentHelpText = settings?.prepaymentHelpText || `যেকোনো সমস্যার জন্য আমাদের ${paymentPhoneNumber} নম্বরে ফোন করুন।`;

  const checkoutSteps = useMemo(() => {
    if (requireAdvancePayment) {
      return [
        { id: 1, label: locale === 'bn' ? 'কার্ট' : 'Cart', sub: locale === 'bn' ? 'পণ্য বাছাই' : 'Items', icon: ShoppingCart, href: '/cart' },
        { id: 2, label: locale === 'bn' ? 'ডেলিভারি তথ্য' : 'Shipping', sub: locale === 'bn' ? 'ঠিকানা ও এলাকা' : 'Address', icon: MapPin },
        { id: 3, label: locale === 'bn' ? 'অগ্রিম পেমেন্ট' : 'Payment', sub: locale === 'bn' ? 'বিকাশ/নগদ' : 'bKash/Nagad', icon: CreditCard },
        { id: 4, label: locale === 'bn' ? 'অর্ডার নিশ্চিত' : 'Confirmation', sub: locale === 'bn' ? 'অর্ডার গ্রহণ' : 'Completed', icon: CheckCircle2 }
      ];
    }
    return [
      { id: 1, label: locale === 'bn' ? 'কার্ট' : 'Cart', sub: locale === 'bn' ? 'পণ্য বাছাই' : 'Items', icon: ShoppingCart, href: '/cart' },
      { id: 2, label: locale === 'bn' ? 'ডেলিভারি তথ্য' : 'Shipping', sub: locale === 'bn' ? 'ঠিকানা ও এলাকা' : 'Address', icon: MapPin },
      { id: 3, label: locale === 'bn' ? 'অর্ডার নিশ্চিত' : 'Confirmation', sub: locale === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery', icon: CheckCircle2 }
    ];
  }, [requireAdvancePayment, locale]);

  const successSteps = useMemo(() => {
    if (requireAdvancePayment) {
      return [
        { id: 1, label: locale === 'bn' ? 'কার্ট' : 'Cart', sub: locale === 'bn' ? 'সম্পন্ন' : 'Done' },
        { id: 2, label: locale === 'bn' ? 'ডেলিভারি তথ্য' : 'Shipping', sub: locale === 'bn' ? 'গৃহীত' : 'Saved' },
        { id: 3, label: locale === 'bn' ? 'অগ্রিম পেমেন্ট' : 'Payment', sub: locale === 'bn' ? 'নিশ্চিত' : 'Verified' },
        { id: 4, label: locale === 'bn' ? 'অর্ডার নিশ্চিত' : 'Confirmation', sub: locale === 'bn' ? 'সফল' : 'Success' }
      ];
    }
    return [
      { id: 1, label: locale === 'bn' ? 'কার্ট' : 'Cart', sub: locale === 'bn' ? 'সম্পন্ন' : 'Done' },
      { id: 2, label: locale === 'bn' ? 'ডেলিভারি তথ্য' : 'Shipping', sub: locale === 'bn' ? 'গৃহীত' : 'Saved' },
      { id: 3, label: locale === 'bn' ? 'অর্ডার নিশ্চিত' : 'Confirmation', sub: locale === 'bn' ? 'সফল' : 'Success' }
    ];
  }, [requireAdvancePayment, locale]);

  const [guestCartItems, setGuestCartItems] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setGuestCartItems(getGuestCart());
      const handleUpdate = () => setGuestCartItems(getGuestCart());
      window.addEventListener('guest_cart_updated', handleUpdate);
      return () => window.removeEventListener('guest_cart_updated', handleUpdate);
    }
  }, [isAuthenticated]);

  const cartData = cartResponse?.data?.cart || cartResponse?.cart || cartResponse?.data || cartResponse; // handle potential nesting

  const items = useMemo(() => {
    const rawItems = isAuthenticated ? (cartData?.items || []) : guestCartItems;
    if (!rawItems.length) return [];

    // Dynamically sync cart items with fresh MongoDB product prices if available
    return rawItems
      .map((item: any) => {
        const prodId = typeof item.product === 'object' ? (item.product?._id || item.product?.id) : item.product;
        const dbProd = Array.isArray(dbProductsList) ? dbProductsList.find((p: any) => String(p._id || p.id) === String(prodId)) : null;
        if (dbProd) {
          return {
            ...item,
            product: dbProd
          };
        }
        return item;
      })
      .filter((item: any) => {
        const p = item?.product;
        if (!p || typeof p !== 'object') return false;
        const title = p.title || p.name;
        if (!title || title === 'Charulata Product' || !p.slug || p.slug === 'undefined') {
          return false;
        }
        return true;
      });
  }, [isAuthenticated, cartData, guestCartItems, dbProductsList]);

  const districtsList = useMemo(() => districtsResponse?.data || districtsResponse || [], [districtsResponse]);
  const [placeOrder, { isLoading: isPlacing }] = useCheckoutMutation();
  const [placeGuestOrder, { isLoading: isPlacingGuest }] = useGuestCheckoutMutation();
  const [completeProfile, { isLoading: isCompletingProfile }] = useCompleteProfileMutation();
  const [removeCartItem, { isLoading: isRemovingCartItem }] = useRemoveFromCartMutation();
  const dispatch = useAppDispatch();

  const handleRemoveCartItem = async (itemId: string) => {
    if (!isAuthenticated) {
      removeFromGuestCart(itemId);
      setGuestCartItems(getGuestCart());
      toast.info(locale === 'bn' ? 'পণ্যটি কার্ট থেকে সরানো হয়েছে' : 'Item removed from cart');
      return;
    }
    try {
      await removeCartItem(itemId).unwrap();
      toast.info(locale === 'bn' ? 'পণ্যটি কার্ট থেকে সরানো হয়েছে' : 'Item removed from cart');
    } catch (err) {
      console.error('Failed to remove item from cart:', err);
      toast.error(locale === 'bn' ? 'পণ্য সরাতে ব্যর্থ হয়েছে' : 'Failed to remove item');
    }
  };

  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'login'>('guest');
  const [upgradePassword, setUpgradePassword] = useState('');
  const [upgradeConfirmPassword, setUpgradeConfirmPassword] = useState('');
  const [upgradeEmail, setUpgradeEmail] = useState('');
  const [isUpgraded, setIsUpgraded] = useState(false);
  const [showUpgradePassword, setShowUpgradePassword] = useState(false);
  const [showUpgradeConfirmPassword, setShowUpgradeConfirmPassword] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    recipientName: '',
    recipientPhone: '',
    district: '',
    thana: '',
    addressLine: ''
  });

  const [districtSearch, setDistrictSearch] = useState('');
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [thanaSearch, setThanaSearch] = useState('');
  const [showThanaDropdown, setShowThanaDropdown] = useState(false);

  const [updateQuantity, { isLoading: isUpdatingQuantity }] = useUpdateCartQuantityMutation();
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const getItemStock = (item: any): number => {
    const product = typeof item?.product === 'object' ? item.product : null;
    if (!product) return 99;

    const selColor = item?.color || item?.selectedColor;
    const selSize = item?.size || item?.selectedSize;
    const selAttrs = item?.selectedAttributes
      ? (item.selectedAttributes instanceof Map ? Object.fromEntries(item.selectedAttributes) : item.selectedAttributes)
      : undefined;

    if (Array.isArray(product?.variants) && product.variants.length > 0) {
      const targetAttrs: Record<string, string> = { ...(selAttrs || {}) };
      if (selColor && !targetAttrs['Color']) targetAttrs['Color'] = selColor;
      if (selSize && !targetAttrs['Size']) targetAttrs['Size'] = selSize;

      const matchedVariant = product.variants.find((v: any) => {
        const vAttrs = v.attributes ? (v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes) : {};
        const vColor = v.color || vAttrs['Color'] || vAttrs['color'];
        const vSize = v.size || vAttrs['Size'] || vAttrs['size'];
        const colorMatch = !selColor || vColor === selColor;
        const sizeMatch = !selSize || vSize === selSize;
        return colorMatch && sizeMatch;
      });

      if (matchedVariant && typeof matchedVariant.stockQuantity === 'number') {
        return Math.max(0, matchedVariant.stockQuantity);
      }
    }

    if (typeof product.stockQuantity === 'number') {
      return Math.max(0, product.stockQuantity);
    }

    return 99;
  };

  const handleQuantityChange = async (itemId: string, currentQty: number, change: number, maxStock: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) {
      handleRemoveCartItem(itemId);
      return;
    }
    if (change > 0 && newQty > maxStock) {
      toast.warning(locale === 'bn' ? `স্টকে আছে মাত্র ${maxStock} পিস!` : `Only ${maxStock} items available in stock!`);
      return;
    }
    setUpdatingItemId(itemId);
    if (!isAuthenticated) {
      updateGuestCartQuantity(itemId, newQty);
      setGuestCartItems(getGuestCart());
      setUpdatingItemId(null);
      return;
    }
    try {
      await updateQuantity({ itemId, quantity: newQty }).unwrap();
    } catch (err) {
      console.error('Failed to update quantity:', err);
      toast.error(locale === 'bn' ? 'পরিমাণ পরিবর্তন করতে ব্যর্থ হয়েছে' : 'Failed to update quantity');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const filteredDistricts = useMemo(() => {
    if (!districtSearch.trim()) return [];
    const query = districtSearch.trim().toLowerCase();
    const mappedQuery = BANGLA_DISTRICT_MAP[districtSearch.trim()]?.toLowerCase() || query;

    return districtsList.filter((d: any) => {
      const enName = (d.district || '').toLowerCase();
      const bnName = ENGLISH_TO_BANGLA_DISTRICT_MAP[enName] || '';
      return enName.includes(query) || enName.includes(mappedQuery) || bnName.includes(query);
    });
  }, [districtSearch, districtsList]);

  const availableThanas = useMemo(() => {
    const activeDist = (shippingAddress.district || districtSearch).trim();
    if (!activeDist) return [];
    const mappedDist = BANGLA_DISTRICT_MAP[activeDist] || activeDist;
    return getThanasForDistrict(mappedDist);
  }, [shippingAddress.district, districtSearch]);

  const filteredThanas = useMemo(() => {
    if (!availableThanas.length) return [];
    if (!thanaSearch.trim()) return availableThanas;
    const query = thanaSearch.trim().toLowerCase();
    return availableThanas.filter((th: IThana) =>
      th.bn.toLowerCase().includes(query) || th.en.toLowerCase().includes(query)
    );
  }, [availableThanas, thanaSearch]);

  const [couponCode, setCouponCode] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successOrder, setSuccessOrder] = useState<any>(null);

  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentSenderNumber, setPaymentSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    if (!requireAdvancePayment) {
      setPaymentMethod('COD');
    }
  }, [requireAdvancePayment]);

  // Trigger vibrant celebratory confetti explosion on order success!
  useEffect(() => {
    if (successOrder) {
      try {
        const count = 220;
        const defaults = { origin: { y: 0.6 } };

        const fire = (particleRatio: number, opts: confetti.Options) => {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio)
          });
        };

        fire(0.25, {
          spread: 30,
          startVelocity: 60,
          colors: ['#10b981', '#059669', '#34d399', '#fbbf24', '#f43f5e']
        });
        fire(0.2, {
          spread: 60,
          colors: ['#10b981', '#059669', '#34d399', '#fbbf24', '#e11d48']
        });
        fire(0.35, {
          spread: 100,
          decay: 0.91,
          scalar: 0.9,
          colors: ['#10b981', '#059669', '#34d399', '#3b82f6', '#ec4899']
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 25,
          decay: 0.92,
          scalar: 1.2,
          colors: ['#10b981', '#059669', '#34d399', '#fbbf24']
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 45,
          colors: ['#10b981', '#059669', '#34d399', '#fbbf24']
        });
      } catch (err) {
        console.error('Confetti animation error:', err);
      }
    }
  }, [successOrder]);

  const handleCompleteProfilePostCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upgradePassword || upgradePassword.length < 6) {
      toast.error('পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (upgradePassword !== upgradeConfirmPassword) {
      toast.error('পাসওয়ার্ড দুটি মিলছে না। আবার চেষ্টা করুন।');
      return;
    }

    try {
      const phoneToUse = shippingAddress.recipientPhone || successOrder?.shippingAddress?.recipientPhone;
      const nameToUse = shippingAddress.recipientName || successOrder?.shippingAddress?.recipientName;

      const res = await completeProfile({
        phone: phoneToUse,
        password: upgradePassword,
        name: nameToUse,
        email: upgradeEmail.trim() || undefined
      }).unwrap();

      if (res?.token && res?.user) {
        localStorage.setItem('charulata_token', res.token);
        localStorage.setItem('charulata_user', JSON.stringify(res.user));
        dispatch(setCredentials({ user: res.user, token: res.token }));
        window.dispatchEvent(new Event('auth_updated'));
        window.dispatchEvent(new Event('storage'));
        setIsUpgraded(true);
        toast.success(
          locale === 'bn'
            ? 'অভিনন্দন! আপনার পাসওয়ার্ড সফলভাবে সেট করা হয়েছে এবং সাইন-ইন সম্পন্ন হয়েছে!'
            : 'Congratulations! Your password has been set and you are now signed in!'
        );
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'পাসওয়ার্ড সেট করতে ব্যর্থ হয়েছে।');
    }
  };

  const getItemPriceInfo = (item: any) => {
    const product = typeof item?.product === 'object' ? item.product : item;
    const isDiscountExpired = product?.discountEndDate && new Date() > new Date(product.discountEndDate);

    // --- Match variant pricing (mirrors backend logic) ---
    let variantRegularPrice: number | null = null;
    let variantSalePrice: number | null = null;
    const selColor = item?.color;
    const selSize = item?.size;
    const selAttrs = item?.selectedAttributes
      ? (item.selectedAttributes instanceof Map ? Object.fromEntries(item.selectedAttributes) : item.selectedAttributes)
      : undefined;

    if (Array.isArray(product?.variants) && product.variants.length > 0) {
      const targetAttrs: Record<string, string> = { ...(selAttrs || {}) };
      if (selColor && !targetAttrs['Color']) targetAttrs['Color'] = selColor;
      if (selSize && !targetAttrs['Size']) targetAttrs['Size'] = selSize;

      const targetEntries = Object.entries(targetAttrs).filter(([_, v]) => Boolean(v));
      
      let matched: any = null;
      let maxScore = -1;

      for (const v of product.variants) {
        const vAttrs = v.attributes ? (v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes) : {};
        let matchCount = 0;
        let nonColorMatchCount = 0;
        let nonColorTotal = 0;
        let hasColorMismatch = false;

        for (const [key, val] of targetEntries) {
          const kLower = key.toLowerCase();
          let itemMatched = false;

          if (kLower === 'color') {
            const vColor = v.color || vAttrs['Color'] || vAttrs['color'];
            if (vColor === val) {
              itemMatched = true;
            } else if (vColor) {
              hasColorMismatch = true;
            }
          } else if (kLower === 'size') {
            nonColorTotal++;
            const vSize = v.size || vAttrs['Size'] || vAttrs['size'];
            if (vSize === val) {
              itemMatched = true;
              nonColorMatchCount++;
            }
          } else {
            nonColorTotal++;
            if (vAttrs[key] === val || vAttrs[kLower] === val) {
              itemMatched = true;
              nonColorMatchCount++;
            }
          }

          if (itemMatched) matchCount++;
        }

        if (targetEntries.length > 0 && matchCount === targetEntries.length) {
          matched = v;
          break;
        }

        let score = matchCount * 10;
        if (nonColorTotal > 0 && nonColorMatchCount === nonColorTotal) {
          score += 50;
        }
        if (hasColorMismatch) {
          score -= 2;
        }

        if (score > maxScore && score > 0) {
          maxScore = score;
          matched = v;
        }
      }

      if (matched) {
        if (typeof matched.price === 'number' && matched.price > 0) variantRegularPrice = matched.price;
        if (typeof matched.salePrice === 'number' && matched.salePrice > 0) variantSalePrice = matched.salePrice;
      }
    }

    const rawPrice = variantRegularPrice !== null ? variantRegularPrice : Number(product?.price);
    const rawSalePrice = variantSalePrice !== null ? variantSalePrice : Number(product?.salePrice);
    const rawItemPrice = Number(item?.price);

    // Regular price is variant/product price or item price
    const regularPrice = (!isNaN(rawPrice) && rawPrice > 0)
      ? rawPrice
      : ((!isNaN(rawItemPrice) && rawItemPrice > 0) ? rawItemPrice : 0);

    // Valid sale price exists if not expired and rawSalePrice > 0
    const hasValidSalePrice = !isDiscountExpired && !isNaN(rawSalePrice) && rawSalePrice > 0;

    let effectivePrice = regularPrice;
    if (hasValidSalePrice && regularPrice > 0 && rawSalePrice < regularPrice) {
      effectivePrice = rawSalePrice;
    } else if (hasValidSalePrice && regularPrice === 0) {
      effectivePrice = rawSalePrice;
    } else if (!hasValidSalePrice && !isNaN(rawItemPrice) && rawItemPrice > 0 && regularPrice > 0 && rawItemPrice < regularPrice) {
      effectivePrice = rawItemPrice;
    }

    const isSale = regularPrice > 0 && effectivePrice < regularPrice;

    return {
      effectivePrice,
      regularPrice: isSale ? regularPrice : effectivePrice,
      isSale,
      discountAmountPerUnit: isSale ? (regularPrice - effectivePrice) : 0
    };
  };

  const regularSubTotal = useMemo(() => {
    return items.reduce((acc: number, item: any) => {
      const { regularPrice } = getItemPriceInfo(item);
      return acc + regularPrice * (item.quantity || 1);
    }, 0);
  }, [items]);

  const subTotal = useMemo(() => {
    return items.reduce((acc: number, item: any) => {
      const { effectivePrice } = getItemPriceInfo(item);
      return acc + effectivePrice * (item.quantity || 1);
    }, 0);
  }, [items]);

  const productOfferDiscount = useMemo(() => {
    return Math.max(0, regularSubTotal - subTotal);
  }, [regularSubTotal, subTotal]);

  // Dynamically find shipping charge from DB districts (defaults to 0 until district selected)
  const activeDistrictQuery = (shippingAddress.district || districtSearch).trim();
  const mappedEnDistrict = BANGLA_DISTRICT_MAP[activeDistrictQuery] || activeDistrictQuery;

  const selectedDistrictObj = districtsList.find((d: any) => {
    const enName = (d.district || '').toLowerCase();
    return enName === mappedEnDistrict.toLowerCase() || enName === activeDistrictQuery.toLowerCase();
  });

  const isDhakaDistrict = /dhaka|ঢাকা/i.test(activeDistrictQuery) || /dhaka/i.test(selectedDistrictObj?.district || '');
  const hasDistrictSelected = Boolean(shippingAddress.district.trim());
  const shippingCharge = hasDistrictSelected
    ? (selectedDistrictObj ? selectedDistrictObj.shippingCharge : (isDhakaDistrict ? 60 : 120))
    : (selectedDistrictObj ? selectedDistrictObj.shippingCharge : 0);

  const [validateCoupon, { isLoading: isValidatingCoupon }] = useValidateCouponMutation();
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError(null);
    try {
      const res = await validateCoupon({
        code: couponCode.trim(),
        orderAmount: subTotal
      }).unwrap();

      const couponResult = res.data || res;
      if (couponResult && couponResult.discountAmount !== undefined) {
        setAppliedCoupon(couponResult);
        toast.success(`Coupon "${couponResult.code}" applied!`);
      } else {
        setCouponError('Invalid coupon response from server.');
      }
    } catch (err: any) {
      console.error('Coupon validation error:', err);
      const errMsg = err?.data?.message || err?.message || 'Invalid coupon code.';
      setCouponError(errMsg);
      toast.error(errMsg);
      setAppliedCoupon(null);
    }
  };

  // coupon discount logic
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalAmount = subTotal + shippingCharge - discount;

  const initiateCheckoutTracked = React.useRef(false);
  useEffect(() => {
    if (items.length > 0 && !initiateCheckoutTracked.current) {
      initiateCheckoutTracked.current = true;
      const contentIds = items.map((item: any) => getCatalogProductId(item.product || item)).filter(Boolean);
      if (contentIds.length > 0) {
        fbEvent('track', 'InitiateCheckout', {
          content_ids: contentIds,
          content_type: 'product',
          value: totalAmount,
          currency: 'BDT',
          num_items: items.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0)
        });
      }
    }
  }, [items, totalAmount]);

  const activeAdvanceAmount = useMemo(() => {
    if (!requireAdvancePayment) return 0;
    return Math.min(advancePaymentAmount, totalAmount);
  }, [requireAdvancePayment, advancePaymentAmount, totalAmount]);

  const highlightPhoneNumber = (text: string) => {
    if (!text) return '';
    const phoneRegex = /(01620-556299)/g;
    const parts = text.split(phoneRegex);
    return parts.map((part, index) =>
      part === '01620-556299' ? (
        <span key={index} className="font-extrabold text-[var(--brand)] bg-[var(--brand)]/10 px-1.5 py-0.5 rounded border border-[var(--brand)]/20 whitespace-nowrap">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!shippingAddress.recipientName.trim()) {
      toast.error(locale === 'bn' ? 'অনুগ্রহ করে আপনার নাম প্রদান করুন।' : 'Please enter your full name.');
      return;
    }
    const cleanPhone = shippingAddress.recipientPhone.replace(/[\s\-]/g, '');
    if (!cleanPhone || !/^(?:\+8801|8801|01)[3-9]\d{8}$/.test(cleanPhone)) {
      toast.error(locale === 'bn' ? 'অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)' : 'Please enter a valid 11-digit Bangladeshi mobile number.');
      return;
    }
    const finalDistrict = (shippingAddress.district || districtSearch).trim();
    if (!finalDistrict || finalDistrict.length < 2) {
      toast.error(locale === 'bn' ? 'অনুগ্রহ করে আপনার জেলা নির্বাচন করুন।' : 'Please select your district.');
      return;
    }
    const finalThana = (shippingAddress.thana || thanaSearch).trim();
    if (!finalThana) {
      toast.error(locale === 'bn' ? 'অনুগ্রহ করে আপনার থানা বা উপজেলা নির্বাচন করুন।' : 'Please select your thana / upazila.');
      return;
    }
    if (!shippingAddress.addressLine.trim()) {
      toast.error(locale === 'bn' ? 'অনুগ্রহ করে আপনার সম্পূর্ণ ঠিকানা প্রদান করুন।' : 'Please enter your full delivery address.');
      return;
    }
    if (requireAdvancePayment) {
      if (!paymentMethod || paymentMethod === 'COD') {
        toast.error(locale === 'bn' ? 'অনুগ্রহ করে বিকাশ, নগদ বা রকেট নির্বাচন করে আপনার পেমেন্ট তথ্য দিন।' : 'Please select a payment method (bKash/Nagad/Rocket) and enter payment details.');
        return;
      }
      if (!paymentSenderNumber.trim()) {
        toast.error(locale === 'bn' ? 'অনুগ্রহ করে যে নম্বর থেকে টাকা পাঠিয়েছেন সেটি লিখুন।' : 'Please enter the sender phone number.');
        return;
      }
      const cleanTrx = transactionId.trim().toUpperCase();
      if (!cleanTrx || !/^[A-Z0-9]{8,12}$/.test(cleanTrx)) {
        toast.error(locale === 'bn' ? 'অনুগ্রহ করে সঠিক আলফানিউমেরিক Transaction ID (TrxID) প্রদান করুন (যেমন: 9K20PLM910)' : 'Please enter a valid alphanumeric Transaction ID (e.g. 9K20PLM910).');
        return;
      }
    }

    const trimmedAddress = shippingAddress.addressLine.trim();
    const finalAddressLine = finalThana && !trimmedAddress.toLowerCase().endsWith(finalThana.toLowerCase())
      ? `${trimmedAddress}, ${finalThana}`
      : trimmedAddress;

    try {
      let res: any;
      const selectedPaymentMethod = paymentMethod || (!requireAdvancePayment ? 'COD' : '');
      const finalSenderNumber = requireAdvancePayment && selectedPaymentMethod !== 'COD' ? paymentSenderNumber.trim() : 'N/A';
      const finalTrxId = requireAdvancePayment && selectedPaymentMethod !== 'COD' ? transactionId.trim().toUpperCase() : 'COD';

      const eventId = generateMetaEventId('purchase');
      const fbp = getFbp();
      const fbc = getFbc();

      if (isAuthenticated) {
        const payload = {
          shippingAddress: {
            recipientName: shippingAddress.recipientName.trim(),
            recipientPhone: cleanPhone,
            district: finalDistrict,
            thana: finalThana,
            addressLine: finalAddressLine
          },
          couponCode: appliedCoupon ? appliedCoupon.code : (couponCode.trim() || undefined),
          deliveryNotes: deliveryNotes.trim() || undefined,
          paymentMethod: selectedPaymentMethod,
          paymentSenderNumber: finalSenderNumber,
          transactionId: finalTrxId,
          _eventId: eventId,
          _fbp: fbp,
          _fbc: fbc
        };
        res = await placeOrder(payload).unwrap();
      } else {
        // Guest Checkout Flow
        const guestItems = items.map((item: any) => ({
          product: item.product?._id || item.product,
          quantity: item.quantity,
          selectedColor: item.color || item.selectedColor,
          selectedSize: item.size || item.selectedSize,
          selectedAttributes: item.selectedAttributes
        }));

        const guestPayload = {
          name: shippingAddress.recipientName.trim(),
          phone: cleanPhone,
          shippingAddress: {
            recipientName: shippingAddress.recipientName.trim(),
            recipientPhone: cleanPhone,
            district: finalDistrict,
            thana: finalThana,
            addressLine: finalAddressLine
          },
          items: guestItems,
          couponCode: appliedCoupon ? appliedCoupon.code : (couponCode.trim() || undefined),
          deliveryNotes: deliveryNotes.trim() || undefined,
          paymentMethod: selectedPaymentMethod,
          paymentSenderNumber: finalSenderNumber,
          transactionId: finalTrxId,
          _eventId: eventId,
          _fbp: fbp,
          _fbc: fbc
        };
        res = await placeGuestOrder(guestPayload).unwrap();
      }

      const orderObj = res.data?.order || res.order || res.data || res;
      if (orderObj) {
        toast.success(locale === 'bn' ? 'আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!' : 'Order placed successfully!');
        setSuccessOrder(orderObj);
        if (!isAuthenticated) {
          clearGuestCart();
          setGuestCartItems([]);
        } else {
          refetch();
        }

        // Track Meta Pixel Purchase event with catalog SKU/IDs matching XML feed <g:id>
        const purchasedContentIds = (orderObj.items || items || []).map((item: any) => {
          const prod = item.product;
          if (typeof prod === 'object' && prod !== null) {
            return getCatalogProductId(prod);
          }
          const matchedItem = items.find((it: any) => {
            const itProdId = typeof it.product === 'object' ? (it.product?._id || it.product?.id) : it.product;
            return String(itProdId) === String(prod);
          });
          if (matchedItem && matchedItem.product) {
            return getCatalogProductId(matchedItem.product);
          }
          const matchedDb = Array.isArray(dbProductsList) ? dbProductsList.find((p: any) => String(p._id || p.id) === String(prod)) : null;
          if (matchedDb) {
            return getCatalogProductId(matchedDb);
          }
          return String(item.sku || prod);
        }).filter(Boolean);

        fbEvent('track', 'Purchase', {
          content_ids: purchasedContentIds,
          content_type: 'product',
          value: orderObj.totalAmount || totalAmount,
          currency: 'BDT',
          num_items: (orderObj.items || items || []).reduce((acc: number, it: any) => acc + (it.quantity || 1), 0)
        }, { eventID: eventId });
      } else {
        setErrorMsg('Invalid checkout response from server.');
      }
    } catch (err: any) {
      console.error('Checkout error details:', {
        status: err?.status,
        data: err?.data,
        message: err?.message,
        error: err?.error,
        raw: err
      });

      let errorData = err?.data || err;
      let parsedErrors: any = null;

      // Check if err itself is a string containing JSON
      if (typeof err === 'string') {
        try {
          const trimmed = err.trim();
          if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            parsedErrors = JSON.parse(trimmed);
          }
        } catch (e) { }
      }

      // Try to parse stringified JSON inside error message or errorData
      if (!parsedErrors && typeof errorData?.message === 'string') {
        try {
          const trimmed = errorData.message.trim();
          if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            parsedErrors = JSON.parse(trimmed);
          }
        } catch (e) { }
      }

      if (!parsedErrors && typeof errorData === 'string') {
        try {
          const trimmed = errorData.trim();
          if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            parsedErrors = JSON.parse(trimmed);
          }
        } catch (e) { }
      }

      if (parsedErrors) {
        errorData = parsedErrors;
      }

      if (Array.isArray(errorData)) {
        errorData.forEach((subErr: any) => {
          let msg = subErr?.message || '';
          if (subErr?.path?.includes('recipientPhone')) {
            msg = 'Please enter a valid phone number.';
          } else if (subErr?.path?.includes('addressLine')) {
            msg = 'Please enter your detailed shipping address.';
          } else if (subErr?.path?.includes('recipientName')) {
            msg = 'Please enter recipient name.';
          }
          if (msg) toast.error(msg);
        });
      } else if (errorData?.errors && Array.isArray(errorData.errors)) {
        errorData.errors.forEach((subErr: any) => {
          let msg = subErr?.message || '';
          if (subErr?.path?.includes('recipientPhone')) {
            msg = 'Please enter a valid phone number.';
          } else if (subErr?.path?.includes('addressLine')) {
            msg = 'Please enter your detailed shipping address.';
          } else if (subErr?.path?.includes('recipientName')) {
            msg = 'Please enter recipient name.';
          }
          if (msg) toast.error(msg);
        });
      } else if (typeof errorData?.message === 'string') {
        toast.error(errorData.message);
      } else if (Array.isArray(errorData?.message)) {
        errorData.message.forEach((subErr: any) => {
          const msg = typeof subErr === 'string' ? subErr : subErr?.message;
          if (msg) toast.error(msg);
        });
      } else {
        const fallbackMsg = err?.data?.message || err?.message || err?.error || 'Something went wrong. Please check details and try again.';
        toast.error(fallbackMsg);
      }
    }
  };

  if (successOrder) {
    const orderIdVal = successOrder.orderId || successOrder._id || successOrder.id || 'N/A';
    const orderItemsList = Array.isArray(successOrder.items) && successOrder.items.length > 0
      ? successOrder.items
      : items;

    const handlePrintInvoice = () => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Pop-up blocked. Please allow pop-ups to print invoice.');
        return;
      }

      const recipientName = successOrder.shippingAddress?.recipientName || shippingAddress.recipientName || 'Customer';
      const recipientPhone = successOrder.shippingAddress?.recipientPhone || shippingAddress.recipientPhone || '';
      const formattedAddress = parseAndFormatOrderAddress(successOrder.shippingAddress || {
        addressLine: shippingAddress.addressLine,
        thana: shippingAddress.thana,
        district: shippingAddress.district
      });
      const addressLine = formattedAddress.street || successOrder.shippingAddress?.addressLine || shippingAddress.addressLine || '';
      const displayLocation = formattedAddress.thana 
        ? `${formattedAddress.thana}, ${formattedAddress.district}` 
        : (formattedAddress.district || successOrder.shippingAddress?.district || shippingAddress.district || '');

      const totalAmt = successOrder.totalAmount || totalAmount || 0;
      const deliveryAmt = (successOrder.shippingCharge !== undefined && successOrder.shippingCharge !== null)
        ? Number(successOrder.shippingCharge)
        : (shippingCharge || 0);
      const itemsSubtotalAmt = (successOrder.subTotal !== undefined && successOrder.subTotal !== null)
        ? Number(successOrder.subTotal)
        : Math.max(0, totalAmt - deliveryAmt);
      const advanceAmt = (successOrder.advanceAmount !== undefined && successOrder.advanceAmount !== null)
        ? Number(successOrder.advanceAmount)
        : (successOrder.advancePayment !== undefined && successOrder.advancePayment !== null)
          ? Number(successOrder.advancePayment)
          : activeAdvanceAmount;
      const dueAmt = Math.max(0, totalAmt - advanceAmt);

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice #${orderIdVal} - Charulata Lifestyle</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.5; }
    .invoice-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e11d48; padding-bottom: 20px; margin-bottom: 25px; }
    .brand-title { color: #e11d48; font-size: 26px; font-weight: 900; margin: 0; letter-spacing: 1px; }
    .brand-sub { color: #64748b; font-size: 12px; margin-top: 2px; text-transform: uppercase; letter-spacing: 2px; }
    .invoice-details { text-align: right; }
    .invoice-details h2 { margin: 0; font-size: 18px; color: #e11d48; }
    .invoice-details p { margin: 3px 0 0 0; font-size: 13px; color: #64748b; font-family: monospace; }
    
    .customer-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 25px; display: flex; justify-content: space-between; }
    .customer-box div { flex: 1; }
    .box-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 5px; }
    .box-val { font-size: 13px; font-weight: 700; color: #0f172a; margin: 0; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
    th { background: #e11d48; color: #ffffff; padding: 10px 14px; text-align: left; font-size: 12px; font-weight: 800; text-transform: uppercase; }
    td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    tr:nth-child(even) { background-color: #f8fafc; }

    .totals-table { width: 320px; margin-left: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 16px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
    .totals-row.final { background: #ffe4e6; font-weight: 900; color: #e11d48; font-size: 15px; border-bottom: none; }

    .footer { margin-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="invoice-header">
    <div>
      <h1 class="brand-title">CHARULATA</h1>
      <p class="brand-sub">Lifestyle Boutique</p>
    </div>
    <div class="invoice-details">
      <h2>OFFICIAL INVOICE</h2>
      <p>Order ID: <strong>#${orderIdVal}</strong></p>
      <p>Date: ${new Date().toLocaleDateString('en-GB')}</p>
    </div>
  </div>

  <div class="customer-box">
    <div>
      <div class="box-title">Customer Info</div>
      <p class="box-val">${recipientName}</p>
      <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">${recipientPhone}</p>
    </div>
    <div>
      <div class="box-title">Shipping Address</div>
      <p class="box-val">${addressLine}</p>
      <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">${displayLocation}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Product Name</th>
        <th>Variant & Details</th>
        <th style="text-align: center;">Qty</th>
        <th style="text-align: right;">Price</th>
        <th style="text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${orderItemsList.map((item: any) => {
        const prodTitle = item.product?.title || item.product?.name || item.title || 'Product';
        const itemPrice = item.price || item.product?.salePrice || item.product?.price || 0;
        const qty = item.quantity || 1;
        const rawSku = item.product?.sku || (typeof item.product === 'object' && item.product?.sku) || '';
        const skuDisplay = rawSku ? `<span style="font-family: monospace; font-size: 11px; color: #64748b; font-weight: bold;">SKU: ${rawSku}</span><br>` : '';
        const colorStr = item.selectedColor || item.color ? `Color: ${item.selectedColor || item.color}` : '';
        const sizeStr = item.selectedSize || item.size ? `Size: ${item.selectedSize || item.size}` : '';
        const details = [colorStr, sizeStr].filter(Boolean).join(', ') || (rawSku ? '' : 'Standard');

        return `
          <tr>
            <td><strong>${prodTitle}</strong></td>
            <td>${skuDisplay}<small style="color:#64748b; font-weight: 500;">${details}</small></td>
            <td style="text-align: center;"><strong>${qty}</strong></td>
            <td style="text-align: right;">BDT ${itemPrice.toLocaleString()}</td>
            <td style="text-align: right;"><strong>BDT ${(itemPrice * qty).toLocaleString()}</strong></td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <div class="totals-table">
    <div class="totals-row">
      <span>Subtotal:</span>
      <strong>BDT ${itemsSubtotalAmt.toLocaleString()}</strong>
    </div>
    <div class="totals-row">
      <span>Delivery Charge:</span>
      <strong>+BDT ${deliveryAmt.toLocaleString()}</strong>
    </div>
    <div class="totals-row">
      <span>Total Amount:</span>
      <strong>BDT ${totalAmt.toLocaleString()}</strong>
    </div>
    ${advanceAmt > 0 ? `
    <div class="totals-row">
      <span>Advance Paid:</span>
      <strong style="color: #10b981;">BDT ${advanceAmt.toLocaleString()}</strong>
    </div>
    ` : ''}
    <div class="totals-row final">
      <span>Due (COD):</span>
      <span>BDT ${dueAmt.toLocaleString()}</span>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for shopping with Charulata Lifestyle!</p>
    <p style="margin-top: 4px;">For support or inquiries, please contact 01620-556299</p>
  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    };

    return (
      <div className="max-w-5xl mx-auto my-4 sm:my-8 space-y-4">
        {/* Dynamic Checkout Progress Indicator (Completed State) */}
        <div className="w-full bg-card border border-border rounded-2xl p-3 sm:p-4 shadow-2xs">
          <div className={`grid ${requireAdvancePayment ? 'grid-cols-4 max-w-2xl' : 'grid-cols-3 max-w-xl'} mx-auto`}>
            {successSteps.map((step, idx, arr) => (
              <div key={step.id} className="relative flex flex-col items-center text-center">
                {/* Connector line to previous step (never extends before step 1) */}
                {idx > 0 && (
                  <div className="absolute top-4 sm:top-4.5 right-1/2 left-0 h-0.5 -translate-y-1/2 bg-emerald-500" />
                )}

                {/* Connector line to next step (never extends after last step) */}
                {idx < arr.length - 1 && (
                  <div className="absolute top-4 sm:top-4.5 left-1/2 right-0 h-0.5 -translate-y-1/2 bg-emerald-500" />
                )}

                <div className="relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-4 ring-emerald-500/20">
                  <Check size={16} className="stroke-[3]" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold mt-1.5 px-1 text-emerald-600 dark:text-emerald-400 truncate max-w-full">
                  {step.label}
                </span>
                <span className="text-[10px] text-muted-foreground hidden sm:block font-medium px-1 truncate max-w-full">
                  {step.sub}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm space-y-4">

          {/* Header Confirmation Banner */}
          <div className="text-center pb-4 border-b border-border/80 relative">
            <div className="relative w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30"></span>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 scale-105">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-serif tracking-tight">
              {t('checkout.orderConfirmed')}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-semibold">
              {t('checkout.thankYou')}
            </p>

            <div className="mt-3.5 inline-flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-3.5 py-1 rounded-full text-xs font-mono font-black shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
              <span>Order ID: {orderIdVal}</span>
            </div>

          <button
            onClick={handlePrintInvoice}
            className="absolute top-0 right-0 hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg text-[11px] font-bold transition cursor-pointer"
            title="Print Official Order Invoice"
          >
            <Printer size={13} />
            <span>Print Invoice</span>
          </button>
        </div>

        {/* 2-Column Responsive Layout: left=order info, right=password+actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

          {/* ── LEFT COLUMN: Order Info + Items + Price ── */}
          <div className="space-y-4">

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Recipient */}
              <div className="bg-muted/40 p-3 rounded-xl border border-border/60 space-y-2">
                <div className="flex items-center space-x-1.5 text-primary">
                  <User size={13} className="shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {locale === 'bn' ? 'গ্রাহকের বিবরণ' : 'Recipient'}
                  </span>
                </div>
                <p className="font-bold text-foreground text-[13px]">{successOrder.shippingAddress?.recipientName || shippingAddress.recipientName}</p>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Phone size={11} className="shrink-0" />
                  <span className="font-medium">{successOrder.shippingAddress?.recipientPhone || shippingAddress.recipientPhone}</span>
                </div>
              </div>

              {/* Address */}
              <div className="bg-muted/40 p-3 rounded-xl border border-border/60 space-y-2">
                <div className="flex items-center space-x-1.5 text-primary">
                  <MapPin size={13} className="shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {locale === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Delivery Address'}
                  </span>
                </div>
                {(() => {
                  const parsed = parseAndFormatOrderAddress(successOrder.shippingAddress || {
                    addressLine: shippingAddress.addressLine,
                    thana: shippingAddress.thana,
                    district: shippingAddress.district
                  });
                  return (
                    <>
                      <p className="font-bold text-foreground text-[13px]">{parsed.street || shippingAddress.addressLine}</p>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Truck size={11} className="shrink-0" />
                        <span className="font-medium">
                          {parsed.thana ? `${parsed.thana}, ` : ''}{parsed.district || shippingAddress.district}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Ordered Items Invoice List */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                <Package size={14} className="text-primary" />
                <span>{locale === 'bn' ? `অর্ডারকৃত পণ্যসমূহ (${orderItemsList.length})` : `Purchased Items (${orderItemsList.length})`}</span>
              </h3>

              <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border/60">
                {orderItemsList.map((item: any, idx: number) => {
                  const prodTitle = item.product?.title || item.product?.name || item.title || 'Product';
                  const prodImg = item.product?.productImages?.[0] || item.product?.images?.[0] || item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400';
                  const itemPrice = item.price || item.product?.salePrice || item.product?.price || 0;
                  const qty = item.quantity || 1;
                  const color = item.selectedColor || item.color;
                  const size = item.selectedSize || item.size;

                  return (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-muted/20 transition">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-14 h-14 rounded-xl border-2 border-border overflow-hidden bg-muted relative shrink-0 shadow-sm">
                          <Image src={prodImg} alt={prodTitle} fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-foreground truncate">{prodTitle}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
                            {color && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 font-semibold">🎨 {color}</span>}
                            {size && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 font-semibold">📐 {size}</span>}
                            <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border font-semibold">×{qty}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-foreground font-mono">৳{(itemPrice * qty).toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">৳{itemPrice.toLocaleString()} each</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Payment & Amount Summary */}
            {(() => {
              const finalTotal = successOrder.totalAmount || totalAmount || 0;
              const finalShipping = (successOrder.shippingCharge !== undefined && successOrder.shippingCharge !== null)
                ? Number(successOrder.shippingCharge)
                : (shippingCharge || 0);
              const finalSubtotal = (successOrder.subTotal !== undefined && successOrder.subTotal !== null)
                ? Number(successOrder.subTotal)
                : Math.max(0, finalTotal - finalShipping);
              const finalAdvance = (successOrder.advanceAmount !== undefined && successOrder.advanceAmount !== null)
                ? Number(successOrder.advanceAmount)
                : (successOrder.advancePayment !== undefined && successOrder.advancePayment !== null)
                  ? Number(successOrder.advancePayment)
                  : activeAdvanceAmount;
              const remainingDue = Math.max(0, finalTotal - finalAdvance);

              return (
                <div className="rounded-xl border border-border/80 overflow-hidden text-xs">
                  {/* Price rows */}
                  <div className="bg-muted/30 p-3 sm:p-4 space-y-2">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span className="font-medium">{locale === 'bn' ? 'পণ্যসমূহের মূল্য:' : 'Products Subtotal:'}</span>
                      <span className="font-bold text-foreground font-mono">৳{finalSubtotal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Truck size={11} />
                        <span className="font-medium">{locale === 'bn' ? 'ডেলিভারি চার্জ:' : 'Delivery Charge:'}</span>
                      </div>
                      <span className="font-bold text-foreground font-mono">+৳{finalShipping.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-foreground font-bold pt-2 border-t border-border/60">
                      <span>{locale === 'bn' ? 'মোট অর্ডার মূল্য:' : 'Total:'}</span>
                      <span className="font-black text-foreground font-mono">৳{finalTotal.toLocaleString('en-IN')}</span>
                    </div>

                    {finalAdvance > 0 && (
                      <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                        <div className="flex items-center space-x-1">
                          <BadgeCheck size={11} />
                          <span className="font-medium">{locale === 'bn' ? 'অগ্রিম পরিশোধ:' : 'Advance Paid:'}</span>
                        </div>
                        <span className="font-bold font-mono">-৳{finalAdvance.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>

                  {/* COD highlighted footer */}
                  <div className="bg-primary/8 border-t-2 border-primary/30 px-4 py-3 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-primary/70">
                        {finalAdvance > 0
                          ? (locale === 'bn' ? 'ডেলিভারিতে বাকি ক্যাশ' : 'Cash Due on Delivery')
                          : (locale === 'bn' ? 'ডেলিভারিতে ক্যাশ দেবেন (COD)' : 'Cash on Delivery (COD)')}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium">{locale === 'bn' ? 'পণ্য হাতে পেয়ে টাকা দিন' : 'Pay when you receive'}</p>
                    </div>
                    <span className="text-2xl font-black text-primary font-mono">৳{remainingDue.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })()}

          </div>
          {/* ── END LEFT COLUMN ── */}

          {/* ── RIGHT COLUMN: Password Setup (Guest) OR Delivery Timeline & Actions (Logged-in) ── */}
          <div className="space-y-4">

            {/* A) Post-Checkout Account Upgrade & Password Setup Card (Only for Guest) */}
            {(!isAuthenticated || !user?.name) && !isUpgraded ? (
              <div className="p-4 sm:p-5 bg-primary/5 border border-primary/20 rounded-2xl text-left space-y-3.5 shadow-2xs">
                <div className="flex items-center space-x-2 text-primary font-bold text-xs sm:text-sm">
                  <Sparkles size={16} />
                  <span>
                    {locale === 'bn' ? 'পাসওয়ার্ড সেট করে প্রোফাইল সম্পূর্ণ করুন!' : 'Set Password & Complete Profile!'}
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {locale === 'bn'
                    ? 'পাসওয়ার্ড সেট করার সাথে সাথেই আপনার অ্যাকাউন্টটি নিবন্ধিত ও সাইন-ইন হয়ে যাবে, যাতে পরবর্তীতে যেকোনো সময় আপনি সহজে লগইন করে অর্ডারের ট্র্যাকিং দেখতে পারেন।'
                    : 'Setting a password registers and signs you in immediately, allowing you to easily log in and track your orders anytime.'}
                </p>

                <form onSubmit={handleCompleteProfilePostCheckout} className="space-y-2.5 pt-0.5">
                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1 uppercase tracking-wider">
                      {locale === 'bn' ? 'নতুন পাসওয়ার্ড লিখুন *' : 'Set New Password *'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type={showUpgradePassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder={locale === 'bn' ? 'নূন্যতম ৬ অক্ষরের পাসওয়ার্ড দিন' : 'Enter password (min 6 characters)'}
                        value={upgradePassword}
                        onChange={(e) => setUpgradePassword(e.target.value)}
                        className="w-full pl-8 pr-9 py-2 text-xs rounded-xl border border-border bg-card focus:border-primary focus:outline-none font-medium text-foreground transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowUpgradePassword(!showUpgradePassword)}
                        className="absolute right-3 top-2 text-muted-foreground hover:text-foreground transition cursor-pointer"
                        tabIndex={-1}
                      >
                        {showUpgradePassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1 uppercase tracking-wider">
                      {locale === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন *' : 'Confirm Password *'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type={showUpgradeConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder={locale === 'bn' ? 'আবার পাসওয়ার্ড লিখুন' : 'Re-enter your password'}
                        value={upgradeConfirmPassword}
                        onChange={(e) => setUpgradeConfirmPassword(e.target.value)}
                        className={`w-full pl-8 pr-9 py-2 text-xs rounded-xl border bg-card focus:outline-none font-medium text-foreground transition ${upgradeConfirmPassword && upgradePassword !== upgradeConfirmPassword
                            ? 'border-rose-500 focus:border-rose-500'
                            : upgradeConfirmPassword && upgradePassword === upgradeConfirmPassword
                              ? 'border-emerald-500 focus:border-emerald-500'
                              : 'border-border focus:border-primary'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowUpgradeConfirmPassword(!showUpgradeConfirmPassword)}
                        className="absolute right-3 top-2 text-muted-foreground hover:text-foreground transition cursor-pointer"
                        tabIndex={-1}
                      >
                        {showUpgradeConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {upgradeConfirmPassword && upgradePassword !== upgradeConfirmPassword && (
                      <p className="text-[10px] text-rose-500 font-semibold mt-1">
                        {locale === 'bn' ? '⚠ পাসওয়ার্ড দুটি মিলছে না' : '⚠ Passwords do not match'}
                      </p>
                    )}
                    {upgradeConfirmPassword && upgradePassword === upgradeConfirmPassword && (
                      <p className="text-[10px] text-emerald-500 font-semibold mt-1">
                        {locale === 'bn' ? '✓ পাসওয়ার্ড মিলেছে' : '✓ Passwords match'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1 uppercase tracking-wider">
                      {locale === 'bn' ? 'ইমেইল ঠিকানা (ঐচ্ছিক)' : 'Email Address (Optional)'}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder={locale === 'bn' ? 'আপনার ইমেইল ঠিকানা (optional)' : 'Your email address (optional)'}
                        value={upgradeEmail}
                        onChange={(e) => setUpgradeEmail(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-border bg-card focus:border-primary focus:outline-none font-medium text-foreground transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isCompletingProfile}
                    className="w-full bg-primary hover:opacity-90 text-white py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 active:scale-95 shadow-md"
                  >
                    {isCompletingProfile ? <Loader2 size={14} className="animate-spin" /> : (
                      <>
                        <span>{locale === 'bn' ? 'পাসওয়ার্ড সেট করুন ও সাইন ইন সম্পন্ন করুন' : 'Set Password & Sign In'}</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* B) Delivery Progress Timeline & Updates (For Logged-in or Completed Users) */
              <div className="space-y-4">
                <div className="p-4 sm:p-5 bg-card border border-border rounded-2xl space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center space-x-2 text-primary font-black text-xs uppercase tracking-wider">
                      <Truck size={16} />
                      <span>{locale === 'bn' ? 'ডেলিভারি ট্র্যাকিং ও আপডেট' : 'Delivery & Next Steps'}</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center space-x-1">
                      <CheckCircle2 size={11} className="mr-0.5" />
                      <span>{locale === 'bn' ? 'অর্ডার গৃহীত' : 'Confirmed'}</span>
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start space-x-3">
                      <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 shadow-xs">
                        ✓
                      </div>
                      <div>
                        <p className="font-extrabold text-foreground">{locale === 'bn' ? 'অর্ডার সফলভাবে গৃহীত হয়েছে' : 'Order Placed Successfully'}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{locale === 'bn' ? 'আমাদের প্রতিনিধি আপনার পার্সেলটি প্যাকিং ও কোয়ালিটি চেকিং শুরু করেছে।' : 'Your parcel is being packed and prepared for quality check.'}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 opacity-80">
                      <div className="h-6 w-6 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{locale === 'bn' ? 'কুরিয়ারে হস্তান্তর (১-২ কার্যদিবস)' : 'Courier Handover (1-2 Days)'}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{locale === 'bn' ? 'পার্সেল কুরিয়ারে পাঠানোর সাথে সাথে SMS-এ ট্র্যাকিং কোড পেয়ে যাবেন।' : 'You will receive SMS with courier tracking code once dispatched.'}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 opacity-80">
                      <div className="h-6 w-6 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{locale === 'bn' ? 'ডেলিভারি ও ক্যাশ অন ডেলিভারি (COD)' : 'Home Delivery & COD'}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{locale === 'bn' ? 'ডেলিভারি ম্যানের কাছ থেকে পণ্য বুঝে পেয়ে বাকি টাকা প্রদান করুন।' : 'Receive your parcel at home and pay remaining cash.'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Need Assistance Card */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div className="space-y-0.5">
                    <p className="text-xs font-extrabold text-foreground">{locale === 'bn' ? 'যেকোনো প্রয়োজনে সহায়তা?' : 'Need Help With Your Order?'}</p>
                    <p className="text-[11px] text-muted-foreground">{locale === 'bn' ? 'আমাদের কাস্টমার সাপোর্টে কল করুন' : 'Call our 24/7 customer support'}</p>
                  </div>
                  <a
                    href="tel:01620556299"
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-primary text-white text-xs font-extrabold rounded-xl shadow-xs hover:opacity-90 transition active:scale-95"
                  >
                    <Phone size={13} />
                    <span>01620-556299</span>
                  </a>
                </div>
              </div>
            )}

            {isUpgraded && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-left text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-2 shadow-2xs">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>
                  {locale === 'bn'
                    ? 'অভিনন্দন! আপনার পাসওয়ার্ড সেট করা হয়েছে এবং সাইন-ইন সম্পন্ন হয়েছে। এখন থেকে আপনি আপনার প্রোফাইলে নিজের সব অর্ডারের তথ্য দেখতে পাবেন!'
                    : 'Congratulations! Your password has been set and you are now signed in. You can view all your order history anytime from your profile!'}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/orders"
                  className="bg-primary text-white py-2.5 rounded-xl font-extrabold text-xs hover:opacity-90 transition shadow-md flex items-center justify-center space-x-1.5 active:scale-95 text-center"
                >
                  <History size={14} />
                  <span>{t('checkout.orderHistory')}</span>
                </Link>
                <Link
                  href="/orders/track"
                  className="bg-muted border border-border text-foreground py-2.5 rounded-xl font-extrabold text-xs hover:bg-muted/80 transition flex items-center justify-center space-x-1.5 active:scale-95 text-center"
                >
                  <Navigation size={14} />
                  <span>{t('checkout.trackOrder')}</span>
                </Link>
              </div>

              <Link
                href="/"
                className="w-full bg-card hover:bg-muted/60 border border-border text-foreground py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 text-center shadow-2xs"
              >
                <ArrowLeft size={14} />
                <span>{locale === 'bn' ? 'আরও কেনাকাটা করুন' : 'Continue Shopping'}</span>
              </Link>
            </div>

          </div>
          {/* ── END RIGHT COLUMN ── */}

        </div>
        {/* ── END 2-COLUMN GRID ── */}

      </div>
    </div>
  );
}

  return (
    <div className="max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 pb-20 lg:pb-8 w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-[var(--border)]">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="text-[var(--brand)]" size={22} />
          <h1 className="text-lg sm:text-xl font-extrabold text-[var(--foreground)] font-serif">{t('checkout.title')}</h1>
          {!isAuthenticated && (
            <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
              {locale === 'bn' ? 'গেস্ট অর্ডার' : 'Guest Checkout'}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {!isAuthenticated && (
            <Link
              href="/login?redirect=checkout"
              className="text-xs font-bold text-muted-foreground hover:text-primary transition underline px-2 py-1"
            >
              {locale === 'bn' ? 'লগইন আছে?' : 'Have account? Login'}
            </Link>
          )}

          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-[var(--brand)] hover:text-white bg-[var(--brand)]/10 hover:bg-[var(--brand)] px-3 py-1.5 rounded-xl transition-all shadow-2xs border border-[var(--brand)]/20 active:scale-95"
          >
            <ArrowLeft size={14} />
            <span>{locale === 'bn' ? 'আরও কেনাকাটা করুন' : 'Continue Shopping'}</span>
          </Link>
        </div>
      </div>

      {/* Dynamic Checkout Progress Indicator */}
      <div className="w-full bg-card border border-border rounded-2xl p-3 sm:p-4 mb-4 sm:mb-5 shadow-2xs">
        <div className={`grid ${requireAdvancePayment ? 'grid-cols-4 max-w-2xl' : 'grid-cols-3 max-w-xl'} mx-auto`}>
          {checkoutSteps.map((step, idx, arr) => {
            const isCompleted = step.id === 1;
            const isCurrent = step.id === 2 || (requireAdvancePayment && step.id === 3);
            const Icon = step.icon;

            return (
              <div key={step.id} className="relative flex flex-col items-center text-center">
                {/* Connector line to previous step (never extends before step 1) */}
                {idx > 0 && (
                  <div
                    className={`absolute top-4 sm:top-4.5 right-1/2 left-0 h-0.5 -translate-y-1/2 ${
                      idx === 1 ? 'bg-emerald-500' : (requireAdvancePayment && idx === 2) ? 'bg-primary/50' : 'bg-border'
                    }`}
                  />
                )}

                {/* Connector line to next step (never extends after last step) */}
                {idx < arr.length - 1 && (
                  <div
                    className={`absolute top-4 sm:top-4.5 left-1/2 right-0 h-0.5 -translate-y-1/2 ${
                      idx === 0 ? 'bg-emerald-500' : (requireAdvancePayment && idx === 1) ? 'bg-primary/50' : 'bg-border'
                    }`}
                  />
                )}

                {/* Step Circle Button / Icon */}
                {step.href ? (
                  <Link
                    href={step.href}
                    className="relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm hover:scale-105 transition active:scale-95 cursor-pointer"
                    title={locale === 'bn' ? 'কার্টে ফিরে যান' : 'Back to Cart'}
                  >
                    <Check size={16} className="stroke-[3]" />
                  </Link>
                ) : (
                  <div
                    className={`relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : isCurrent
                        ? 'bg-primary text-white ring-4 ring-primary/20 shadow-sm'
                        : 'bg-muted text-muted-foreground border border-border'
                    }`}
                  >
                    {isCompleted ? <Check size={16} className="stroke-[3]" /> : <Icon size={15} />}
                  </div>
                )}

                <span
                  className={`text-[11px] sm:text-xs font-bold mt-1.5 px-1 truncate max-w-full ${
                    isCurrent
                      ? 'text-primary'
                      : isCompleted
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[10px] text-muted-foreground hidden sm:block font-medium px-1 truncate max-w-full">
                  {step.sub}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="pb-20 md:pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* Left Column: ALL-IN-ONE Master Shipping & Instructions Card */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-[var(--card)] text-[var(--foreground)] p-4 sm:p-5 rounded-2xl border border-[var(--border)] shadow-md space-y-4">

              {/* 1. Shipping Information Section */}
              <div className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] mb-2.5 flex items-center space-x-2 border-b border-[var(--border)] pb-2">
                  <MapPin size={18} className="text-[var(--brand)]" />
                  <span>{t('checkout.shippingInfo')}</span>
                </h2>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[var(--foreground)] opacity-90 mb-1">
                        {t('checkout.recipientName')} <span className="text-rose-500 font-bold ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-400" />
                        <input
                          type="text"
                          required
                          placeholder={t('checkout.recipientNamePlaceholder')}
                          value={shippingAddress.recipientName}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, recipientName: e.target.value })}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-xs sm:text-sm font-medium focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 transition-all min-h-[44px]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[var(--foreground)] opacity-90 mb-1">
                        {t('checkout.mobileNumber')} <span className="text-rose-500 font-bold ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-400" />
                        <input
                          type="tel"
                          required
                          placeholder="01XXXXXXXXX (১১ ডিজিট)"
                          value={shippingAddress.recipientPhone}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, recipientPhone: e.target.value })}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-xs sm:text-sm font-medium focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 transition-all min-h-[44px]"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] mt-1 text-muted-foreground px-0.5">
                        <span>{locale === 'bn' ? 'ফরম্যাট: 01XXXXXXXXX' : 'Format: 01XXXXXXXXX'}</span>
                        {shippingAddress.recipientPhone && (
                          /^(?:\+8801|8801|01)[3-9]\d{8}$/.test(shippingAddress.recipientPhone.replace(/[\s\-]/g, '')) ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ {locale === 'bn' ? 'সঠিক নম্বর' : 'Valid'}</span>
                          ) : shippingAddress.recipientPhone.replace(/[\s\-]/g, '').length >= 11 ? (
                            <span className="text-rose-500 font-bold">⚠ {locale === 'bn' ? 'সঠিক নম্বর দিন' : 'Invalid number'}</span>
                          ) : null
                        )}
                      </div>
                    </div>
                  </div>

                  {/* District & Thana/Upazila Selector Side by Side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
                    {/* District Selector */}
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[var(--foreground)] opacity-90 mb-1">
                        {t('checkout.district')} <span className="text-rose-500 font-bold ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <Truck className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-400 pointer-events-none z-10" />
                        <input
                          type="text"
                          placeholder={t('checkout.searchDistrict')}
                          value={districtSearch}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDistrictSearch(val);
                            setShowDistrictDropdown(true);
                          }}
                          onFocus={() => setShowDistrictDropdown(true)}
                          onBlur={() => setTimeout(() => setShowDistrictDropdown(false), 200)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-xs sm:text-sm font-medium focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 placeholder-gray-400 transition-all min-h-[44px]"
                        />
                        {showDistrictDropdown && filteredDistricts.length > 0 && (
                          <div className="absolute z-50 left-0 right-0 top-full mt-1 max-h-52 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xl divide-y divide-border/40 custom-scrollbar">
                            {filteredDistricts.map((d: any) => {
                              const enName = d.district;
                              const bnName = ENGLISH_TO_BANGLA_DISTRICT_MAP[(enName || '').toLowerCase()];

                              return (
                                <div key={d._id || d.district} className="bg-card">
                                  {/* Bangla Option */}
                                  {bnName && (
                                    <button
                                      type="button"
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => {
                                        setShippingAddress(prev => ({ ...prev, district: bnName, thana: '' }));
                                        setDistrictSearch(bnName);
                                        setThanaSearch('');
                                        setShowDistrictDropdown(false);
                                      }}
                                      className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm hover:bg-primary/10 transition-colors flex items-center justify-between ${shippingAddress.district === bnName ? 'bg-primary/10 text-primary font-extrabold' : 'text-[var(--foreground)] font-medium'
                                        }`}
                                    >
                                      <span className="font-semibold">{bnName} <span className="text-muted-foreground text-xs font-normal">({enName})</span></span>
                                      <span className="text-xs sm:text-sm text-primary font-bold">৳{d.shippingCharge} {t('checkout.shipping')}</span>
                                    </button>
                                  )}

                                  {/* English Option */}
                                  <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                      setShippingAddress(prev => ({ ...prev, district: enName, thana: '' }));
                                      setDistrictSearch(enName);
                                      setThanaSearch('');
                                      setShowDistrictDropdown(false);
                                    }}
                                    className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm hover:bg-primary/10 transition-colors flex items-center justify-between ${shippingAddress.district === enName ? 'bg-primary/10 text-primary font-extrabold' : 'text-[var(--foreground)] font-medium'
                                      }`}
                                  >
                                    <span className="font-semibold">{enName} {bnName && <span className="text-muted-foreground text-xs font-normal">({bnName})</span>}</span>
                                    <span className="text-xs sm:text-sm text-primary font-bold">৳{d.shippingCharge} {t('checkout.shipping')}</span>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      {shippingAddress.district && (
                        <p className="text-xs sm:text-sm text-primary mt-1 font-bold">✓ {shippingAddress.district} — ৳{shippingCharge} {t('checkout.shipping')}</p>
                      )}
                    </div>

                    {/* Thana / Upazila Selector */}
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[var(--foreground)] opacity-90 mb-1">
                        {locale === 'bn' ? 'থানা / উপজেলা' : 'Thana / Upazila'} <span className="text-rose-500 font-bold ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-400 pointer-events-none z-10" />
                        <input
                          type="text"
                          required
                          placeholder={locale === 'bn' ? 'থানা লিখুন...' : 'Enter thana...'}
                          value={shippingAddress.thana || thanaSearch}
                          onChange={(e) => {
                            const val = e.target.value;
                            setThanaSearch(val);
                            setShippingAddress(prev => ({ ...prev, thana: val }));
                            if (availableThanas.length > 0) {
                              setShowThanaDropdown(true);
                            }
                          }}
                          onFocus={() => {
                            if (availableThanas.length > 0) {
                              setShowThanaDropdown(true);
                            }
                          }}
                          onBlur={() => setTimeout(() => setShowThanaDropdown(false), 200)}
                          className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-xs sm:text-sm font-medium focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 transition-all min-h-[44px]"
                        />
                        {availableThanas.length > 0 && (
                          <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        )}

                        {showThanaDropdown && availableThanas.length > 0 && (
                          <div className="absolute z-50 left-0 right-0 top-full mt-1 max-h-52 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xl divide-y divide-border/40 custom-scrollbar">
                            {filteredThanas.length > 0 ? (
                              filteredThanas.map((th, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    const selectedThana = locale === 'bn' ? th.bn : th.en;
                                    setShippingAddress(prev => ({ ...prev, thana: selectedThana }));
                                    setThanaSearch(selectedThana);
                                    setShowThanaDropdown(false);
                                  }}
                                  className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm hover:bg-primary/10 transition-colors flex items-center justify-between ${
                                    shippingAddress.thana === (locale === 'bn' ? th.bn : th.en) ? 'bg-primary/10 text-primary font-bold' : 'text-foreground'
                                  }`}
                                >
                                  <span className="font-semibold">{th.bn} <span className="text-muted-foreground text-xs font-normal">({th.en})</span></span>
                                  {shippingAddress.thana === (locale === 'bn' ? th.bn : th.en) && (
                                    <Check size={14} className="text-primary stroke-[3]" />
                                  )}
                                </button>
                              ))
                            ) : null}
                          </div>
                        )}
                      </div>
                      {shippingAddress.thana && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-bold">✓ {shippingAddress.thana}</p>
                      )}
                    </div>
                  </div>

                  {/* Full Delivery Address */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-[var(--foreground)] opacity-90 mb-1">
                      {t('checkout.fullAddress')} <span className="text-rose-500 font-bold ml-0.5">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      name="deliveryAddressLine"
                      autoComplete="off"
                      spellCheck={false}
                      data-lpignore="true"
                      data-form-type="other"
                      placeholder={t('checkout.addressPlaceholder')}
                      value={shippingAddress.addressLine}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-xs sm:text-sm font-medium focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 transition-all min-h-[60px]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-rose-500" />
                        <span>{t('checkout.deliveryNotes')}</span>
                      </label>
                      <span className="text-[10px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/50">
                        {locale === 'bn' ? 'ঐচ্ছিক' : 'Optional'}
                      </span>
                    </div>
                    <div className="relative">
                      <textarea
                        rows={2.5}
                        placeholder={locale === 'bn' ? 'যেমন: কল করে গেটের কাছে আসবেন / বাসা ২য় তলা / সন্ধ্যা ৬টার পর দেবেন...' : 'e.g. Please call before delivery / Leave at security gate...'}
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs sm:text-sm font-medium focus:outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 transition-all resize-none shadow-2xs placeholder:text-muted-foreground/60 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Order Instructions / Rules Section */}
              <div className="pt-3 border-t border-[var(--border)]">
                {!requireAdvancePayment ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 space-y-3 shadow-2xs">
                    <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs sm:text-sm">
                      <CheckCircle2 size={18} className="shrink-0" />
                      <span className="tracking-wide uppercase font-serif">
                        {locale === 'bn' ? 'ক্যাশ অন ডেলিভারি সার্ভিস সচল রয়েছে (Cash on Delivery)' : 'Cash on Delivery Available'}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed font-medium">
                      {locale === 'bn'
                        ? 'বর্তমানে কোনো অগ্রিম পেমেন্ট ছাড়াই সরাসরি অর্ডার সম্পন্ন করতে পারবেন। ডেলিভারিম্যান থেকে পণ্য বুঝে পেয়ে সম্পূর্ণ মূল্য পরিশোধ করুন।'
                        : 'Place your order without any advance payment! You can pay the full bill upon receiving your order from the delivery agent.'}
                    </p>

                    {/* Clean Normal Text Delivery Charge Note */}
                    <div className="pt-2 border-t border-emerald-500/20 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 flex items-center space-x-2 leading-relaxed">
                      <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        {locale === 'bn'
                          ? 'নোট: ডেলিভারি চার্জ ঢাকার ভেতরে ৬০ টাকা এবং ঢাকার বাইরে ১২০ টাকা।'
                          : 'Note: Delivery charge is 60 BDT inside Dhaka and 120 BDT outside Dhaka.'}
                      </span>
                    </div>

                    <div className="pt-1.5 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{highlightPhoneNumber(prepaymentHelpText)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[var(--brand)]/[0.03] border border-[var(--brand)]/20 rounded-xl p-3 sm:p-3.5 space-y-2.5">
                    <h3 className="font-extrabold text-[var(--foreground)] text-xs sm:text-sm flex items-center space-x-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--brand)] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--brand)]"></span>
                      </span>
                      <span className="tracking-wide uppercase font-serif">{prepaymentNoticeTitle}</span>
                    </h3>

                    <div className="space-y-2">
                      {/* Step 1 */}
                      <div className="flex items-start space-x-2 bg-[var(--card)] border border-[var(--border)] p-2 rounded-lg text-xs sm:text-sm leading-relaxed">
                        <div className="w-4.5 h-4.5 rounded-full bg-[var(--brand)]/10 flex items-center justify-center font-bold text-xs text-[var(--brand)] shrink-0 mt-0.5">
                          ১
                        </div>
                        <div className="text-[var(--foreground)] font-medium">
                          {highlightPhoneNumber(prepaymentRule1)}
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex items-start space-x-2 bg-[var(--card)] border border-[var(--border)] p-2 rounded-lg text-xs sm:text-sm leading-relaxed">
                        <div className="w-4.5 h-4.5 rounded-full bg-[var(--brand)]/10 flex items-center justify-center font-bold text-xs text-[var(--brand)] shrink-0 mt-0.5">
                          ২
                        </div>
                        <div className="text-[var(--foreground)] font-medium">
                          {highlightPhoneNumber(prepaymentRule2)}
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex items-start space-x-2 bg-[var(--card)] border border-[var(--border)] p-2 rounded-lg text-xs sm:text-sm leading-relaxed">
                        <div className="w-4.5 h-4.5 rounded-full bg-[var(--brand)]/10 flex items-center justify-center font-bold text-xs text-[var(--brand)] shrink-0 mt-0.5">
                          ৩
                        </div>
                        <div className="text-[var(--foreground)] font-medium">
                          {highlightPhoneNumber(prepaymentRule3)}
                        </div>
                      </div>

                      {/* Clean Normal Text Delivery Charge Note inside Advance Payment Box */}
                      <div className="pt-2 border-t border-[var(--border)] text-xs sm:text-sm font-bold text-[var(--foreground)] flex items-center space-x-2 leading-relaxed">
                        <Truck className="w-4 h-4 text-[var(--brand)] shrink-0" />
                        <span>
                          {locale === 'bn'
                            ? 'নোট: ডেলিভারি চার্জ ঢাকার ভেতরে ৬০ টাকা এবং ঢাকার বাইরে ১২০ টাকা।'
                            : 'Note: Delivery charge is 60 BDT inside Dhaka and 120 BDT outside Dhaka.'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[var(--border)] text-xs sm:text-sm font-bold text-[var(--brand)] flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 animate-bounce shrink-0" />
                      <span>{highlightPhoneNumber(prepaymentHelpText)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: ALL-IN-ONE Master Checkout Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 self-start">
            <div className="bg-[var(--card)] text-[var(--foreground)] p-4 sm:p-5 rounded-2xl border border-[var(--border)] shadow-md space-y-3.5">

              {/* 1. Payment Method Selection Section */}
              <div className="space-y-2.5 border-b border-[var(--border)] pb-3">
                <label className="block text-xs sm:text-sm font-bold text-[var(--foreground)] opacity-90">
                  {requireAdvancePayment
                    ? (locale === 'bn' ? 'আপনি কোন মাধ্যমে টাকা পাঠিয়েছেন সেটি সিলেক্ট করুন *' : 'Select the payment method you used *')
                    : (locale === 'bn' ? 'পেমেন্ট পদ্ধতি (Payment Method)' : 'Payment Method')}
                </label>

                {!requireAdvancePayment ? (
                  /* Informative Cash on Delivery Message (No confusing ACTIVE badge or fake selectable card) */
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-start space-x-3 text-xs sm:text-sm">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Truck size={17} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-extrabold text-foreground">
                        {locale === 'bn' ? 'এই মুহূর্তে শুধু ক্যাশ অন ডেলিভারি available' : 'Cash on Delivery is currently available'}
                      </p>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {locale === 'bn'
                          ? 'কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই। নিশ্চিন্তে অর্ডার সম্পন্ন করুন, ডেলিভারির সময় পণ্য হাতে পেয়ে মূল্য পরিশোধ করবেন।'
                          : 'No advance payment required. Place your order and pay when your package arrives at your doorstep.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* bKash, Nagad & Rocket options when Advance Payment is Required (> ৳0) */
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-3 gap-2">
                      {/* bKash */}
                      {enableBkash && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('bkash')}
                          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer text-center relative ${paymentMethod === 'bkash'
                            ? 'bg-pink-500/10 border-pink-500 text-pink-600 dark:text-pink-400 font-extrabold ring-2 ring-pink-500/50 scale-[1.01]'
                            : 'bg-muted/40 border-border text-foreground hover:border-pink-500/40 font-semibold'
                            }`}
                        >
                          <div className="h-7 w-full flex items-center justify-center bg-white dark:bg-zinc-800 rounded-lg px-1.5 py-0.5 border border-pink-500/20 shadow-2xs">
                            <img src="/bKash-logo.svg" alt="bKash Logo" className="h-5.5 w-auto object-contain max-w-[85px]" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-extrabold leading-tight">bKash</p>
                            <p className="text-[10px] text-muted-foreground font-medium">৳{advancePaymentAmount} Adv</p>
                          </div>
                        </button>
                      )}

                      {/* Nagad */}
                      {enableNagad && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('nagad')}
                          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer text-center relative ${paymentMethod === 'nagad'
                            ? 'bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400 font-extrabold ring-2 ring-orange-500/50 scale-[1.01]'
                            : 'bg-muted/40 border-border text-foreground hover:border-orange-500/40 font-semibold'
                            }`}
                        >
                          <div className="h-7 w-full flex items-center justify-center bg-white dark:bg-zinc-800 rounded-lg px-1.5 py-0.5 border border-orange-500/20 shadow-2xs">
                            <img src="/nAgad-logo.svg" alt="Nagad Logo" className="h-5.5 w-auto object-contain max-w-[85px]" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-extrabold leading-tight">Nagad</p>
                            <p className="text-[10px] text-muted-foreground font-medium">৳{advancePaymentAmount} Adv</p>
                          </div>
                        </button>
                      )}

                      {/* Rocket */}
                      {enableRocket && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('rocket')}
                          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer text-center relative ${paymentMethod === 'rocket'
                            ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 font-extrabold ring-2 ring-purple-500/50 scale-[1.01]'
                            : 'bg-muted/40 border-border text-foreground hover:border-purple-500/40 font-semibold'
                            }`}
                        >
                          <div className="h-7 w-full flex items-center justify-center bg-[#8C3493] rounded-lg px-1.5 py-0.5 border border-purple-500/20 shadow-2xs overflow-hidden">
                            <img src="/rOcket-logo.svg" alt="Rocket Logo" className="h-5.5 w-auto object-contain max-w-[85px]" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-extrabold leading-tight">Rocket</p>
                            <p className="text-[10px] text-muted-foreground font-medium">৳{advancePaymentAmount} Adv</p>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {requireAdvancePayment && paymentMethod && paymentMethod !== 'COD' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-fadeIn items-start pt-1.5">
                    <div>
                      <label className="block text-xs font-bold text-[var(--foreground)] opacity-90 mb-1">
                        {t('checkout.senderNumber')} <span className="text-rose-500 font-bold ml-0.5">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder={t('checkout.senderNumberPlaceholder')}
                        value={paymentSenderNumber}
                        onChange={(e) => setPaymentSenderNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-xs sm:text-sm font-medium focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--foreground)] opacity-90 mb-1">
                        {t('checkout.transactionId')} <span className="text-rose-500 font-bold ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={12}
                        placeholder="যেমন: 9K20PLM910"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-xs sm:text-sm font-medium focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 uppercase font-mono min-h-[44px]"
                      />
                      <div className="mt-1 text-[10px] text-muted-foreground">
                        {transactionId && !/^[A-Z0-9]{8,12}$/.test(transactionId.trim()) ? (
                          <span className="text-rose-500 font-bold">⚠ {locale === 'bn' ? 'সঠিক ১০ ক্যারেক্টারের আলফানিউমেরিক TrxID দিন' : 'Alphanumeric TrxID required'}</span>
                        ) : (
                          <span>{locale === 'bn' ? '১০ ক্যারেক্টার আলফানিউমেরিক TrxID' : '10-char alphanumeric TrxID'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Order Summary Section */}
              <div className="space-y-2.5">
                <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] border-b border-[var(--border)] pb-1.5">{t('checkout.orderSummary')}</h2>

                {cartLoading && isAuthenticated ? (
                  <div className="flex items-center justify-center py-4 text-xs sm:text-sm text-gray-400">
                    <Loader2 className="animate-spin text-[var(--brand)] mr-2 w-4 h-4" />
                    <span>{t('checkout.loadingCart')}</span>
                  </div>
                ) : !items.length ? (
                  <div className="py-4 text-center">
                    <p className="text-xs sm:text-sm text-gray-400">{t('checkout.cartEmpty')}</p>
                    <a href="/" className="mt-1 inline-block text-xs sm:text-sm font-semibold text-[var(--brand)] hover:underline">
                      {t('checkout.startShopping')}
                    </a>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Cart Items List - Compact scrollable container with product thumbnails & quantity steppers */}
                    <div className="max-h-[190px] sm:max-h-[220px] overflow-y-auto divide-y divide-[var(--border)] pr-1.5 text-xs sm:text-sm custom-scrollbar">
                      {items.map((item: any) => {
                        const { effectivePrice, regularPrice, isSale } = getItemPriceInfo(item);
                        const qty = item.quantity || 1;
                        const maxStock = getItemStock(item);
                        const itemTotal = effectivePrice * qty;
                        const itemImg = item.product?.productImages?.[0] || item.product?.images?.[0] || item.product?.image || item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400';

                        const selAttrsMap = item.selectedAttributes
                          ? (item.selectedAttributes instanceof Map ? Object.fromEntries(item.selectedAttributes) : item.selectedAttributes)
                          : {};
                        const attrParts: string[] = [];
                        if (item.color || selAttrsMap['Color']) attrParts.push(item.color || selAttrsMap['Color']);
                        if (item.size || selAttrsMap['Size']) attrParts.push(item.size || selAttrsMap['Size']);
                        Object.entries(selAttrsMap).forEach(([k, v]) => {
                          if (k !== 'Color' && k !== 'Size' && v) {
                            attrParts.push(`${k}: ${v}`);
                          }
                        });
                        const specsSummary = attrParts.length > 0 ? `| ${attrParts.join(', ')}` : '';

                        return (
                          <div key={item._id} className="py-2.5 flex items-center justify-between gap-3">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              {/* Product Left Thumbnail Image */}
                              <div className="w-12 h-12 rounded-xl border border-border overflow-hidden bg-muted relative shrink-0 shadow-2xs">
                                <Image
                                  src={itemImg}
                                  alt={item.product?.title || 'Product'}
                                  fill
                                  sizes="60px"
                                  className="object-cover"
                                />
                              </div>

                              {/* Product Title & Interactive Quantity Stepper */}
                              <div className="min-w-0 flex-1 pr-1">
                                <p className="font-bold text-[var(--foreground)] truncate text-xs sm:text-sm leading-snug">{item.product?.title || 'Product'}</p>
                                
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  {/* Stepper */}
                                  <div className="inline-flex items-center border border-border rounded-lg bg-muted/40 p-0.5 shadow-2xs">
                                    <button
                                      type="button"
                                      disabled={updatingItemId === item._id || isRemovingCartItem}
                                      onClick={() => handleQuantityChange(item._id, qty, -1, maxStock)}
                                      className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition cursor-pointer disabled:opacity-40 active:scale-95"
                                      title={locale === 'bn' ? 'কমান' : 'Decrease'}
                                    >
                                      <Minus size={11} />
                                    </button>
                                    <span className="px-2 text-xs font-bold font-mono min-w-[20px] text-center text-foreground">
                                      {updatingItemId === item._id ? <Loader2 size={11} className="animate-spin inline text-primary" /> : qty}
                                    </span>
                                    <button
                                      type="button"
                                      disabled={updatingItemId === item._id || isRemovingCartItem || qty >= maxStock}
                                      onClick={() => handleQuantityChange(item._id, qty, 1, maxStock)}
                                      className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                                      title={qty >= maxStock ? (locale === 'bn' ? 'সর্বোচ্চ স্টক সংখ্যায় পৌঁছেছেন' : 'Max stock reached') : (locale === 'bn' ? 'বাড়ান' : 'Increase')}
                                    >
                                      <Plus size={11} />
                                    </button>
                                  </div>

                                  {qty >= maxStock && (
                                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 whitespace-nowrap">
                                      {locale === 'bn' ? `স্টকে আছে মাত্র ${maxStock} পিস` : `Only ${maxStock} in stock`}
                                    </span>
                                  )}

                                  {specsSummary && <span className="text-[10px] text-muted-foreground truncate">{specsSummary}</span>}
                                </div>
                              </div>
                            </div>

                            {/* Total Item Price & Remove Button */}
                            <div className="flex items-center space-x-2 shrink-0">
                              <div className="text-right">
                                <div className="flex items-center space-x-1.5 justify-end">
                                  {isSale && (
                                    <span className="text-[11px] text-gray-400 line-through font-mono">
                                      ৳{(regularPrice * qty).toLocaleString('en-IN')}
                                    </span>
                                  )}
                                  <span className="font-extrabold text-[var(--foreground)] shrink-0 text-xs sm:text-sm font-mono">
                                    ৳{itemTotal.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveCartItem(item._id)}
                                disabled={isRemovingCartItem}
                                className="p-1 sm:p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                title={locale === 'bn' ? 'কার্ট থেকে মুছুন' : 'Remove from cart'}
                              >
                                <X size={15} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Premium Refined Coupon Code Input */}
                    <div className="pt-2.5 border-t border-[var(--border)] space-y-1.5">
                      <div className="flex gap-2 items-stretch">
                        <div className="relative flex-1">
                          <Ticket className="absolute left-3.5 top-3 h-4.5 w-4.5 text-[var(--brand)] opacity-80" />
                          <input
                            type="text"
                            placeholder={t('checkout.couponPlaceholder')}
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value);
                              if (appliedCoupon && e.target.value.toUpperCase() !== appliedCoupon.code) {
                                setAppliedCoupon(null);
                              }
                              setCouponError(null);
                            }}
                            disabled={isValidatingCoupon}
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-xs sm:text-sm font-semibold focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 placeholder-gray-400 uppercase font-mono tracking-wider transition-all min-h-[42px]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={isValidatingCoupon || !couponCode.trim()}
                          className="px-4.5 py-2.5 min-h-[42px] rounded-xl bg-[var(--brand)] hover:bg-[#b0842e] text-white font-extrabold transition-all shadow-md shadow-[var(--brand)]/20 text-xs sm:text-sm cursor-pointer disabled:opacity-50 shrink-0 active:scale-95 flex items-center justify-center"
                        >
                          {isValidatingCoupon ? (locale === 'bn' ? 'যাচাই...' : 'Applying...') : appliedCoupon ? (locale === 'bn' ? 'প্রয়োগকৃত' : 'Applied') : (locale === 'bn' ? 'প্রয়োগ' : 'Apply')}
                        </button>
                      </div>
                      {appliedCoupon && (
                        <div className="flex items-center justify-between text-xs sm:text-sm text-green-600 dark:text-green-400 font-bold bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20">
                          <span>✓ {t('checkout.promoApplied')} ({appliedCoupon.code}): -৳{appliedCoupon.discountAmount}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setCouponCode('');
                              setAppliedCoupon(null);
                              setCouponError(null);
                            }}
                            className="text-red-500 hover:text-red-700 ml-2 font-bold cursor-pointer text-xs underline"
                          >
                            {locale === 'bn' ? 'মুছুন' : 'Remove'}
                          </button>
                        </div>
                      )}
                      {couponError && (
                        <p className="text-xs text-red-500 font-semibold mt-1">✗ {couponError}</p>
                      )}
                    </div>

                    {/* Single Merged Financial Totals (Zero Repetition) */}
                    <div className="border-t border-[var(--border)] pt-3 space-y-2 text-xs sm:text-sm">
                      {productOfferDiscount > 0 && (
                        <div className="flex justify-between text-[var(--foreground)] font-medium opacity-80">
                          <span>{locale === 'bn' ? 'পণ্যের গায়ের দাম (Regular Price)' : 'Regular Price'}</span>
                          <span className="font-bold text-[var(--foreground)] font-mono">৳{regularSubTotal.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      {productOfferDiscount > 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                          <span>{locale === 'bn' ? 'অফার ছাড় (Product Offer Discount)' : 'Product Discount'}</span>
                          <span className="font-mono">-৳{productOfferDiscount.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-[var(--foreground)] font-semibold">
                        <span>{locale === 'bn' ? 'পণ্যসমূহের মূল্য (Subtotal)' : 'Subtotal'}</span>
                        <span className="font-bold text-[var(--foreground)] font-mono">৳{subTotal.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="flex justify-between text-[var(--foreground)] font-medium opacity-85">
                        <span className="flex items-center space-x-1">
                          <span>{t('checkout.shippingFee')}</span>
                          <span className="text-[10px] bg-[var(--brand)]/10 text-[var(--brand)] px-1.5 py-0.2 rounded font-bold">
                            {shippingAddress.district ? shippingAddress.district : (locale === 'bn' ? 'জেলা ভিত্তিক' : 'Standard')}
                          </span>
                        </span>
                        <span className="font-bold text-[var(--foreground)] font-mono">+৳{shippingCharge.toLocaleString('en-IN')}</span>
                      </div>

                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-extrabold">
                          <span>{t('checkout.discount')} ({appliedCoupon?.code})</span>
                          <span className="font-mono">-৳{discount.toLocaleString()}</span>
                        </div>
                      )}

                      {/* Single Unified Prominent Payment Banner */}
                      {requireAdvancePayment && activeAdvanceAmount > 0 ? (
                        <div className="mt-3 pt-2.5 border-t border-[var(--border)] space-y-2">
                          <div className="flex justify-between items-center text-sm font-bold text-foreground">
                            <span>{locale === 'bn' ? 'মোট বিল (Total Amount):' : 'Total Amount:'}</span>
                            <span className="font-mono text-base font-black">৳{totalAmount.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="p-3 bg-[var(--brand)]/10 border border-[var(--brand)]/20 rounded-xl space-y-1.5">
                            <div className="flex justify-between items-center text-xs font-bold text-[var(--brand)]">
                              <span>{locale === 'bn' ? '১. এখন অগ্রিম দেবেন (bKash/Nagad):' : '1. Advance Payment Now:'}</span>
                              <span className="font-mono font-black">৳{activeAdvanceAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs sm:text-sm font-black text-foreground pt-1 border-t border-[var(--brand)]/20">
                              <span>{locale === 'bn' ? '২. ডেলিভারিতে বাকি ক্যাশ (COD):' : '2. Due on Delivery (COD):'}</span>
                              <span className="font-mono text-base font-black text-rose-600 dark:text-rose-400">
                                ৳{Math.max(0, totalAmount - activeAdvanceAmount).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 pt-2.5 border-t border-[var(--border)]">
                          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
                            <div>
                              <p className="text-xs font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                                {locale === 'bn' ? 'ক্যাশ অন ডেলিভারি (মোট প্রদেয়)' : 'Cash on Delivery (Total Due)'}
                              </p>
                              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                                {locale === 'bn' ? 'পণ্য হাতে পেয়ে ডেলিভারিম্যানকে পরিশোধ করবেন' : 'Pay when you receive the product'}
                              </p>
                            </div>
                            <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono shrink-0">
                              ৳{totalAmount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Embedded Confirm Order Button (Desktop Only to prevent duplicate button on mobile) */}
              <div className="pt-1.5 hidden md:block">
                <button
                  type="submit"
                  disabled={isPlacing || isPlacingGuest || !items.length}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3.5 px-4 rounded-xl font-extrabold transition-all shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer text-sm sm:text-base flex items-center justify-center space-x-2 active:scale-[0.99] leading-snug"
                >
                  {isPlacing || isPlacingGuest ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{t('checkout.placingOrder')}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>{t('checkout.confirmOrder')}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Amazon/Daraz Style Mobile Sticky Bottom CTA Bar for Instant 1-Tap Order Placement */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border p-3 px-4 shadow-[0_-4px_25px_rgba(0,0,0,0.18)] flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
          <div className="min-w-0 flex flex-col justify-center pl-1">
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider leading-none">
              {requireAdvancePayment && activeAdvanceAmount > 0 ? (locale === 'bn' ? 'ক্যাশ দেবেন (COD)' : 'Pay on Delivery') : (locale === 'bn' ? 'মোট বিল' : 'Total Payable')}
            </span>
            <span className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight leading-tight mt-0.5">
              ৳{(requireAdvancePayment && activeAdvanceAmount > 0 ? Math.max(0, totalAmount - activeAdvanceAmount) : totalAmount).toLocaleString()}
            </span>
          </div>

          <button
            type="submit"
            disabled={isPlacing || isPlacingGuest || !items.length}
            className="bg-rose-600 hover:bg-rose-700 text-white py-3.5 px-5 sm:px-6 rounded-xl font-black transition-all shadow-lg shadow-rose-600/30 text-xs sm:text-sm flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer shrink-0 active:scale-95 border border-rose-500/20"
          >
            {isPlacing || isPlacingGuest ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('checkout.placingOrder')}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{t('checkout.confirmOrder')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
