export interface IThana {
  bn: string;
  en: string;
}

export interface IDistrictLocations {
  districtBn: string;
  districtEn: string;
  thanas: IThana[];
}

export const BANGLADESH_DISTRICT_THANAS: Record<string, IThana[]> = {
  // --- DHAKA DIVISION ---
  'Dhaka': [
    { bn: 'ধানমন্ডি', en: 'Dhanmondi' },
    { bn: 'গুলশান', en: 'Gulshan' },
    { bn: 'বনানী', en: 'Banani' },
    { bn: 'উত্তরা', en: 'Uttara' },
    { bn: 'মিরপুর', en: 'Mirpur' },
    { bn: 'মোহাম্মদপুর', en: 'Mohammadpur' },
    { bn: 'বাড্ডা', en: 'Badda' },
    { bn: 'তেজগাঁও', en: 'Tejgaon' },
    { bn: 'মতিঝিল', en: 'Motijheel' },
    { bn: 'পল্টন', en: 'Paltan' },
    { bn: 'রমনা', en: 'Ramna' },
    { bn: 'খিলগাঁও', en: 'Khilgaon' },
    { bn: 'রামপুরা', en: 'Rampura' },
    { bn: 'যাত্রাবাড়ী', en: 'Jatrabari' },
    { bn: 'কদমতলী', en: 'Kadamtali' },
    { bn: 'ডেমরা', en: 'Demra' },
    { bn: 'শ্যামপুর', en: 'Shyampur' },
    { bn: 'লালবাগ', en: 'Lalbagh' },
    { bn: 'কোতোয়ালী', en: 'Kotwali' },
    { bn: 'বংশাল', en: 'Bangshal' },
    { bn: 'চকবাজার', en: 'Chawkbazar' },
    { bn: 'কামরাঙ্গীরচর', en: 'Kamrangirchar' },
    { bn: 'হাজারীবাগ', en: 'Hazaribagh' },
    { bn: 'শাহবাগ', en: 'Shahbagh' },
    { bn: 'নিউ মার্কেট', en: 'New Market' },
    { bn: 'কলাবাগান', en: 'Kalabagan' },
    { bn: 'সবুজবাগ', en: 'Sabujbagh' },
    { bn: 'মুগদা', en: 'Mugda' },
    { bn: 'শাহজাহানপুর', en: 'Shahjahanpur' },
    { bn: 'খিলক্ষেত', en: 'Khilkhet' },
    { bn: 'ভাটারা', en: 'Vatara' },
    { bn: 'কাফরুল', en: 'Kafrul' },
    { bn: 'মিরপুর মডেল', en: 'Mirpur Model' },
    { bn: 'পল্লবী', en: 'Pallabi' },
    { bn: 'রূপনগর', en: 'Rupnagar' },
    { bn: 'দারুস সালাম', en: 'Darus Salam' },
    { bn: 'শাহ আলী', en: 'Shah Ali' },
    { bn: 'ক্যান্টনমেন্ট', en: 'Cantonment' },
    { bn: 'ভাষানটেক', en: 'Bhashantek' },
    { bn: 'তুরাগ', en: 'Turag' },
    { bn: 'উত্তরখান', en: 'Uttarkhan' },
    { bn: 'দক্ষিণখান', en: 'Dakkhinkhan' },
    { bn: 'বিমানবন্দর', en: 'Airport' },
    { bn: 'আদাবর', en: 'Adabor' },
    { bn: 'হাতিরঝিল', en: 'Hatirjheel' },
    { bn: 'সাভার', en: 'Savar' },
    { bn: 'ধামরাই', en: 'Dhamrai' },
    { bn: 'কেরানীগঞ্জ', en: 'Keraniganj' },
    { bn: 'নবাবগঞ্জ', en: 'Nawabganj' },
    { bn: 'দোহার', en: 'Dohar' },
    { bn: 'আশুলিয়া', en: 'Ashulia' }
  ],
  'Gazipur': [
    { bn: 'গাজীপুর সদর', en: 'Gazipur Sadar' },
    { bn: 'টঙ্গী', en: 'Tongi' },
    { bn: 'কালিয়াকৈর', en: 'Kaliakair' },
    { bn: 'শ্রীপুর', en: 'Sreepur' },
    { bn: 'কাপাসিয়া', en: 'Kapasia' },
    { bn: 'কালীগঞ্জ', en: 'Kaliganj' }
  ],
  'Narayanganj': [
    { bn: 'নারায়ণগঞ্জ সদর', en: 'Narayanganj Sadar' },
    { bn: 'ফতুল্লা', en: 'Fatullah' },
    { bn: 'সিদ্ধিরগঞ্জ', en: 'Siddhirganj' },
    { bn: 'বন্দর', en: 'Bandar' },
    { bn: 'রূপগঞ্জ', en: 'Rupganj' },
    { bn: 'সোনারগাঁও', en: 'Sonargaon' },
    { bn: 'আড়াইহাজার', en: 'Araihazar' }
  ],
  'Tangail': [
    { bn: 'টাঙ্গাইল সদর', en: 'Tangail Sadar' },
    { bn: 'মির্জাপুর', en: 'Mirzapur' },
    { bn: 'দেলদুয়ার', en: 'Delduar' },
    { bn: 'ঘাটাইল', en: 'Ghatail' },
    { bn: 'কালিহাতী', en: 'Kalihati' },
    { bn: 'মধুপুর', en: 'Madhupur' },
    { bn: 'গোপালপুর', en: 'Gopalpur' },
    { bn: 'ভূঞাপুর', en: 'Bhuapur' },
    { bn: 'সখিপুর', en: 'Sakhipur' },
    { bn: 'বাসাইল', en: 'Basail' },
    { bn: 'নাগরপুর', en: 'Nagarpur' },
    { bn: 'ধনবাড়ী', en: 'Dhanbari' }
  ],
  'Faridpur': [
    { bn: 'ফরিদপুর সদর', en: 'Faridpur Sadar' },
    { bn: 'বোয়ালমারী', en: 'Boalmari' },
    { bn: 'ভাঙ্গা', en: 'Bhanga' },
    { bn: 'নগরকান্দা', en: 'Nagarkanda' },
    { bn: 'মধুখালী', en: 'Madhukhali' },
    { bn: 'সদরপুর', en: 'Sadarpur' },
    { bn: 'চরভদ্রাসন', en: 'Charbhadrasan' },
    { bn: 'আলফাডাঙ্গা', en: 'Alfadanga' },
    { bn: 'সালথা', en: 'Saltha' }
  ],
  'Manikganj': [
    { bn: 'মানিকগঞ্জ সদর', en: 'Manikganj Sadar' },
    { bn: 'সিংগাইর', en: 'Singair' },
    { bn: 'শিবালয়', en: 'Shibalaya' },
    { bn: 'সাটুরিয়া', en: 'Saturia' },
    { bn: 'ঘিওর', en: 'Ghior' },
    { bn: 'দৌলতপুর', en: 'Daulatpur' },
    { bn: 'হরিরামপুর', en: 'Harirampur' }
  ],
  'Munshiganj': [
    { bn: 'মুন্সীগঞ্জ সদর', en: 'Munshiganj Sadar' },
    { bn: 'শ্রীনগর', en: 'Sreenagar' },
    { bn: 'সিরাজদিখান', en: 'Sirajdikhan' },
    { bn: 'লৌহজং', en: 'Louhajang' },
    { bn: 'গজারিয়া', en: 'Gazaria' },
    { bn: 'টংগীবাড়ী', en: 'Tongibari' }
  ],
  'Gopalganj': [
    { bn: 'গোপালগঞ্জ সদর', en: 'Gopalganj Sadar' },
    { bn: 'টুঙ্গিপাড়া', en: 'Tungipara' },
    { bn: 'কোটালীপাড়া', en: 'Kotalipara' },
    { bn: 'কাশিয়ানী', en: 'Kashiani' },
    { bn: 'মুকসুদপুর', en: 'Muksudpur' }
  ],
  'Madaripur': [
    { bn: 'মাদারীপুর সদর', en: 'Madaripur Sadar' },
    { bn: 'শিবচর', en: 'Shivchar' },
    { bn: 'কালকিনি', en: 'Kalkini' },
    { bn: 'রাজৈর', en: 'Rajoir' },
    { bn: 'ডাসার', en: 'Dasar' }
  ],
  'Rajbari': [
    { bn: 'রাজবাড়ী সদর', en: 'Rajbari Sadar' },
    { bn: 'পাংশা', en: 'Pangsha' },
    { bn: 'কালুখালী', en: 'Kalukhali' },
    { bn: 'বালিয়াকান্দি', en: 'Baliakandi' },
    { bn: 'গোয়ালন্দ', en: 'Goalanda' }
  ],
  'Shariatpur': [
    { bn: 'শরীয়তপুর সদর', en: 'Shariatpur Sadar' },
    { bn: 'জাজিরা', en: 'Zajira' },
    { bn: 'নড়িয়া', en: 'Naria' },
    { bn: 'ভেদরগঞ্জ', en: 'Bhedarganj' },
    { bn: 'ডামুড্যা', en: 'Damudya' },
    { bn: 'গোসাইরহাট', en: 'Gosairhat' }
  ],
  'Kishoreganj': [
    { bn: 'কিশোরগঞ্জ সদর', en: 'Kishoreganj Sadar' },
    { bn: 'ভৈরব', en: 'Bhairab' },
    { bn: 'বাজিতপুর', en: 'Bajitpur' },
    { bn: 'হোসেনপুর', en: 'Hossainpur' },
    { bn: 'করিমগঞ্জ', en: 'Karimganj' },
    { bn: 'কটিয়াদী', en: 'Katiadi' },
    { bn: 'কুলিয়ারচর', en: 'Kuliarchar' },
    { bn: 'তাড়াইল', en: 'Tarail' },
    { bn: 'পাকুন্দিয়া', en: 'Pakundia' },
    { bn: 'ইটনা', en: 'Itna' },
    { bn: 'মিঠামইন', en: 'Mithamain' },
    { bn: 'অষ্টগ্রাম', en: 'Austagram' },
    { bn: 'নিকলী', en: 'Nikli' }
  ],

  // --- CHATTOGRAM DIVISION ---
  'Chattogram': [
    { bn: 'কোতোয়ালী', en: 'Kotwali' },
    { bn: 'পাঁচলাইশ', en: 'Panchlaish' },
    { bn: 'হালিশহর', en: 'Halishahar' },
    { bn: 'খুলশী', en: 'Khulshi' },
    { bn: 'ডবলমুরিং', en: 'Double Mooring' },
    { bn: 'পাহাড়তলী', en: 'Pahartali' },
    { bn: 'বাকলিয়া', en: 'Bakalia' },
    { bn: 'চান্দগাঁও', en: 'Chandgaon' },
    { bn: 'বন্দর', en: 'Bandar' },
    { bn: 'পতেঙ্গা', en: 'Patenga' },
    { bn: 'বায়োজিদ', en: 'Bayazid' },
    { bn: 'আকবরশাহ', en: 'Akbar Shah' },
    { bn: 'কর্ণফুলী', en: 'Karnaphuli' },
    { bn: 'সীতাকুণ্ড', en: 'Sitakunda' },
    { bn: 'মীরসরাই', en: 'Mirsharai' },
    { bn: 'পটিয়া', en: 'Patiya' },
    { bn: 'হাটহাজারী', en: 'Hathazari' },
    { bn: 'রাউজান', en: 'Raozan' },
    { bn: 'রাঙ্গুনিয়া', en: 'Rangunia' },
    { bn: 'বোয়ালখালী', en: 'Boalkhali' },
    { bn: 'আনোয়ারা', en: 'Anwara' },
    { bn: 'চন্দনাইশ', en: 'Chandanpukur' },
    { bn: 'বাঁশখালী', en: 'Banshkhali' },
    { bn: 'লোহাগাড়া', en: 'Lohagara' },
    { bn: 'সাতকানিয়া', en: 'Satkania' },
    { bn: 'সন্দ্বীপ', en: 'Sandwip' },
    { bn: 'ফটিকছড়ি', en: 'Fatikchhari' }
  ],
  "Cox's Bazar": [
    { bn: 'কক্সবাজার সদর', en: "Cox's Bazar Sadar" },
    { bn: 'চকরিয়া', en: 'Chakaria' },
    { bn: 'টেকনাফ', en: 'Teknaf' },
    { bn: 'উখিয়া', en: 'Ukhia' },
    { bn: 'রামু', en: 'Ramu' },
    { bn: 'মহেশখালী', en: 'Maheshkhali' },
    { bn: 'পেকুয়া', en: 'Pekua' },
    { bn: 'কুতুবদিয়া', en: 'Kutubdia' },
    { bn: 'ঈদগাঁও', en: 'Eidgaon' }
  ],
  'Cumilla': [
    { bn: 'কুমিল্লা আদর্শ সদর', en: 'Cumilla Adarsha Sadar' },
    { bn: 'কুমিল্লা সদর দক্ষিণ', en: 'Cumilla Sadar Dakshin' },
    { bn: 'দাউদকান্দি', en: 'Daudkandi' },
    { bn: 'চান্দিনা', en: 'Chandina' },
    { bn: 'দেবিদ্বার', en: 'Debidwar' },
    { bn: 'হোমনা', en: 'Homna' },
    { bn: 'মুরাদনগর', en: 'Muradnagar' },
    { bn: 'বুড়িচং', en: 'Burichang' },
    { bn: 'ব্রাহ্মণপাড়া', en: 'Brahmanpara' },
    { bn: 'চৌদ্দগ্রাম', en: 'Chauddagram' },
    { bn: 'লাকসাম', en: 'Laksam' },
    { bn: 'বরুড়া', en: 'Barura' },
    { bn: 'নাঙ্গলকোট', en: 'Nangalkot' },
    { bn: 'মনোহরগঞ্জ', en: 'Monohargonj' },
    { bn: 'মেঘনা', en: 'Meghna' },
    { bn: 'তিতাস', en: 'Titas' },
    { bn: 'লালমাই', en: 'Lalmai' }
  ],
  'Feni': [
    { bn: 'ফেনী সদর', en: 'Feni Sadar' },
    { bn: 'দাগনভূঞা', en: 'Daganbhuiyan' },
    { bn: 'সোনাগাজী', en: 'Sonagazi' },
    { bn: 'ছাগলনাইয়া', en: 'Chhagalnaiya' },
    { bn: 'পরশুরাম', en: 'Parshuram' },
    { bn: 'ফুলগাজী', en: 'Fulgazi' }
  ],
  'Noakhali': [
    { bn: 'নোয়াখালী সদর (সুধারাম)', en: 'Noakhali Sadar' },
    { bn: 'বেগমগঞ্জ', en: 'Begumganj' },
    { bn: 'চাটখিল', en: 'Chatkhil' },
    { bn: 'কোম্পানীগঞ্জ', en: 'Companiganj' },
    { bn: 'হাতিয়া', en: 'Hatiya' },
    { bn: 'সেনবাগ', en: 'Senbagh' },
    { bn: 'সোনাইমুড়ী', en: 'Sonaimuri' },
    { bn: 'সুবর্ণচর', en: 'Subarnachar' },
    { bn: 'কবিরহাট', en: 'Kabirhat' }
  ],
  'Chandpur': [
    { bn: 'চাঁদপুর সদর', en: 'Chandpur Sadar' },
    { bn: 'হাজীগঞ্জ', en: 'Hajiganj' },
    { bn: 'ফরিদগঞ্জ', en: 'Faridganj' },
    { bn: 'মতলব উত্তর', en: 'Matlab Uttar' },
    { bn: 'মতলব দক্ষিণ', en: 'Matlab Dakshin' },
    { bn: 'কচুয়া', en: 'Kachua' },
    { bn: 'শাহরাস্তি', en: 'Shahrasti' },
    { bn: 'হাইমচর', en: 'Haimchar' }
  ],
  'Lakshmipur': [
    { bn: 'লক্ষ্মীপুর সদর', en: 'Lakshmipur Sadar' },
    { bn: 'রায়পুর', en: 'Raipur' },
    { bn: 'রামগঞ্জ', en: 'Ramganj' },
    { bn: 'রামগতি', en: 'Ramgati' },
    { bn: 'কমলনগর', en: 'Kamalnagar' }
  ],
  'Brahmanbaria': [
    { bn: 'ব্রাহ্মণবাড়িয়া সদর', en: 'Brahmanbaria Sadar' },
    { bn: 'আশুগঞ্জ', en: 'Ashuganj' },
    { bn: 'সরাইল', en: 'Sarail' },
    { bn: 'নবীনগর', en: 'Nabinagar' },
    { bn: 'বাঞ্ছারামপুর', en: 'Bancharampur' },
    { bn: 'কসবা', en: 'Kasba' },
    { bn: 'আখাউড়া', en: 'Akhaura' },
    { bn: 'নাসিরনগর', en: 'Nasirnagar' },
    { bn: 'বিজয়নগর', en: 'Bijoynagar' }
  ],
  'Rangamati': [
    { bn: 'রাঙ্গামাটি সদর', en: 'Rangamati Sadar' },
    { bn: 'কাপ্তাই', en: 'Kaptai' },
    { bn: 'বাঘাইছড়ি', en: 'Baghaichhari' },
    { bn: 'কাউখালী', en: 'Kawkhali' },
    { bn: 'নানিয়ারচর', en: 'Naniarchar' },
    { bn: 'লংগদু', en: 'Langadu' },
    { bn: 'বরকল', en: 'Barkal' },
    { bn: 'জুরাইছড়ি', en: 'Juraichhari' },
    { bn: 'বিলাইছড়ি', en: 'Belaichhari' },
    { bn: 'রাজস্থলী', en: 'Rajasthali' }
  ],
  'Bandarban': [
    { bn: 'বান্দরবান সদর', en: 'Bandarban Sadar' },
    { bn: 'রুমা', en: 'Ruma' },
    { bn: 'থানচি', en: 'Thanchi' },
    { bn: 'রোয়াংছড়ি', en: 'Rowangchhari' },
    { bn: 'লামা', en: 'Lama' },
    { bn: 'আলীকদম', en: 'Ali Kadam' },
    { bn: 'নাইক্ষ্যংছড়ি', en: 'Naikhongchhari' }
  ],
  'Khagrachhari': [
    { bn: 'খাগড়াছড়ি সদর', en: 'Khagrachhari Sadar' },
    { bn: 'দীঘিনালা', en: 'Dighinala' },
    { bn: 'পানছড়ি', en: 'Panchhari' },
    { bn: 'মহালছড়ি', en: 'Mahalchhari' },
    { bn: 'মাটিরাঙ্গা', en: 'Matiranga' },
    { bn: 'মানিকছড়ি', en: 'Manikchhari' },
    { bn: 'রামগড়', en: 'Ramgarh' },
    { bn: 'লক্ষ্মীছড়ি', en: 'Lakshmichhari' },
    { bn: 'গুইমারা', en: 'Guimara' }
  ],

  // --- SYLHET DIVISION ---
  'Sylhet': [
    { bn: 'সিলেট সদর', en: 'Sylhet Sadar' },
    { bn: 'দক্ষিণ সুরমা', en: 'Dakshin Surma' },
    { bn: 'গোলাপগঞ্জ', en: 'Golapganj' },
    { bn: 'বিয়ানীবাজার', en: 'Beanibazar' },
    { bn: 'জকিগঞ্জ', en: 'Zakiganj' },
    { bn: 'কানাইঘাট', en: 'Kanaighat' },
    { bn: 'ফেঞ্চুগঞ্জ', en: 'Fenchuganj' },
    { bn: 'বালাগঞ্জ', en: 'Balaganj' },
    { bn: 'বিশ্বনাথ', en: 'Bishwanath' },
    { bn: 'কোম্পানীগঞ্জ', en: 'Companiganj' },
    { bn: 'গোয়াইনঘাট', en: 'Gowainghat' },
    { bn: 'জৈন্তাপুর', en: 'Jaintiapur' },
    { bn: 'ওসমানীনগর', en: 'Osmani Nagar' }
  ],
  'Moulvibazar': [
    { bn: 'মৌলভীবাজার সদর', en: 'Moulvibazar Sadar' },
    { bn: 'শ্রীমঙ্গল', en: 'Sreemangal' },
    { bn: 'কমলগঞ্জ', en: 'Kamalganj' },
    { bn: 'কুলাউড়া', en: 'Kulaura' },
    { bn: 'বড়লেখা', en: 'Barlekha' },
    { bn: 'জুড়ী', en: 'Juri' },
    { bn: 'রাজনগর', en: 'Rajnagar' }
  ],
  'Habiganj': [
    { bn: 'হবিগঞ্জ সদর', en: 'Habiganj Sadar' },
    { bn: 'মাধবপুর', en: 'Madhabpur' },
    { bn: 'চুনারুঘাট', en: 'Chunarughat' },
    { bn: 'বাহুবল', en: 'Bahubal' },
    { bn: 'নবীগঞ্জ', en: 'Nabiganj' },
    { bn: 'বানিয়াচং', en: 'Baniachong' },
    { bn: 'আজমিরীগঞ্জ', en: 'Ajmiriganj' },
    { bn: 'লাখাই', en: 'Lakhai' },
    { bn: 'শায়েস্তাগঞ্জ', en: 'Shayestaganj' }
  ],
  'Sunamganj': [
    { bn: 'সুনামগঞ্জ সদর', en: 'Sunamganj Sadar' },
    { bn: 'ছাতক', en: 'Chhatak' },
    { bn: 'জগন্নাথপুর', en: 'Jagannathpur' },
    { bn: 'দেরাই', en: 'Derai' },
    { bn: 'তাহিরপুর', en: 'Tahirpur' },
    { bn: 'ধর্মপাশা', en: 'Dharmapasha' },
    { bn: 'জামালগঞ্জ', en: 'Jamalganj' },
    { bn: 'শাল্লা', en: 'Shalla' },
    { bn: 'বিশ্বম্ভরপুর', en: 'Bishwamvarpur' },
    { bn: 'দোয়ারাবাজার', en: 'Dowarabazar' },
    { bn: 'দক্ষিণ সুনামগঞ্জ (শান্তিগঞ্জ)', en: 'Shantiganj' },
    { bn: 'মধ্যনগর', en: 'Madhyanagar' }
  ],

  // --- RAJSHAHI DIVISION ---
  'Rajshahi': [
    { bn: 'বোয়ালিয়া', en: 'Boalia' },
    { bn: 'রাজপাড়া', en: 'Rajpara' },
    { bn: 'মতিহার', en: 'Motihar' },
    { bn: 'শাহ মখদুম', en: 'Shah Makhdum' },
    { bn: 'চন্দ্রিমা', en: 'Chandrima' },
    { bn: 'কাটাখালী', en: 'Katakhal' },
    { bn: 'পবা', en: 'Paba' },
    { bn: 'গোদাগাড়ী', en: 'Godagari' },
    { bn: 'তানোর', en: 'Tanor' },
    { bn: 'বাগমারা', en: 'Bagmara' },
    { bn: 'মোহনপুর', en: 'Mohanpur' },
    { bn: 'চারঘাট', en: 'Charghat' },
    { bn: 'বাঘা', en: 'Bagha' },
    { bn: 'পুঠিয়া', en: 'Puthia' },
    { bn: 'দুর্গাপুর', en: 'Durgapur' }
  ],
  'Bogura': [
    { bn: 'বগুড়া সদর', en: 'Bogura Sadar' },
    { bn: 'শেরপুর', en: 'Sherpur' },
    { bn: 'ধুনট', en: 'Dhunat' },
    { bn: 'শিবগঞ্জ', en: 'Shibganj' },
    { bn: 'গাবতলী', en: 'Gabtali' },
    { bn: 'কাহালু', en: 'Kahalu' },
    { bn: 'দুপচাঁচিয়া', en: 'Dupchanchia' },
    { bn: 'আদমদীঘি', en: 'Adamdighi' },
    { bn: 'নন্দীগ্রাম', en: 'Nandigram' },
    { bn: 'সারিয়াকান্দি', en: 'Sariakandi' },
    { bn: 'সোনাতলা', en: 'Sonatala' },
    { bn: 'শাজাহানপুর', en: 'Shajahanpur' }
  ],
  'Pabna': [
    { bn: 'পাবনা সদর', en: 'Pabna Sadar' },
    { bn: 'ঈশ্বরদী', en: 'Ishwardi' },
    { bn: 'সুজানগর', en: 'Sujanagar' },
    { bn: 'সাঁথিয়া', en: 'Santhia' },
    { bn: 'চাটমোহর', en: 'Chatmohar' },
    { bn: 'ফরিদপুর', en: 'Faridpur' },
    { bn: 'ভাঙ্গুড়া', en: 'Bhangura' },
    { bn: 'বেড়া', en: 'Bera' },
    { bn: 'আটঘরিয়া', en: 'Atgharia' }
  ],
  'Sirajganj': [
    { bn: 'সিরাজগঞ্জ সদর', en: 'Sirajganj Sadar' },
    { bn: 'শাহজাদপুর', en: 'Shahjadpur' },
    { bn: 'উল্লাপাড়া', en: 'Ullapara' },
    { bn: 'বেলকুচি', en: 'Belkuchi' },
    { bn: 'রায়গঞ্জ', en: 'Raiganj' },
    { bn: 'তাড়াশ', en: 'Tarash' },
    { bn: 'কামারখন্দ', en: 'Kamarkhanda' },
    { bn: 'কাজীপুর', en: 'Kazipur' },
    { bn: 'চৌহালী', en: 'Chauhali' }
  ],
  'Naogaon': [
    { bn: 'নওগাঁ সদর', en: 'Naogaon Sadar' },
    { bn: 'পত্নীতলা', en: 'Patnitala' },
    { bn: 'মহাদেবপুর', en: 'Mohadevpur' },
    { bn: 'ধামইরহাট', en: 'Dhamoirhat' },
    { bn: 'মান্দা', en: 'Manda' },
    { bn: 'রানীনগর', en: 'Raninagar' },
    { bn: 'আত্রাই', en: 'Atrai' },
    { bn: 'বদলগাছী', en: 'Badalgachhi' },
    { bn: 'পোরশা', en: 'Porsha' },
    { bn: 'সাপাহার', en: 'Sapahar' },
    { bn: 'নিয়ামতপুর', en: 'Niamatpur' }
  ],
  'Natore': [
    { bn: 'নাটোর সদর', en: 'Natore Sadar' },
    { bn: 'বড়াইগ্রাম', en: 'Baraigram' },
    { bn: 'সিংড়া', en: 'Singra' },
    { bn: 'গুরুদাসপুর', en: 'Gurudaspur' },
    { bn: 'লালপুর', en: 'Lalpur' },
    { bn: 'বাগাতিপাড়া', en: 'Bagatipara' },
    { bn: 'নলডাঙ্গা', en: 'Naldanga' }
  ],
  'Chapainawabganj': [
    { bn: 'চাঁপাইনবাবগঞ্জ সদর', en: 'Chapainawabganj Sadar' },
    { bn: 'শিবগঞ্জ', en: 'Shibganj' },
    { bn: 'গোমস্তাপুর', en: 'Gomastapur' },
    { bn: 'নাচোল', en: 'Nachole' },
    { bn: 'ভোলাহাট', en: 'Bholahat' }
  ],
  'Joypurhat': [
    { bn: 'জয়পুরহাট সদর', en: 'Joypurhat Sadar' },
    { bn: 'পাঁচবিবি', en: 'Panchbibi' },
    { bn: 'কালাই', en: 'Kalai' },
    { bn: 'ক্ষেতলাল', en: 'Khetlal' },
    { bn: 'আক্কেলপুর', en: 'Akkelpur' }
  ],

  // --- KHULNA DIVISION ---
  'Khulna': [
    { bn: 'খুলনা সদর', en: 'Khulna Sadar' },
    { bn: 'সোনাডাঙ্গা', en: 'Sonadanga' },
    { bn: 'খালিশপুর', en: 'Khalishpur' },
    { bn: 'দৌলতপুর', en: 'Daulatpur' },
    { bn: 'খানজাহান আলী', en: 'Khan Jahan Ali' },
    { bn: 'হরিণটানা', en: 'Harintana' },
    { bn: 'ডুমুরিয়া', en: 'Dumuria' },
    { bn: 'ফুলতলা', en: 'Phultala' },
    { bn: 'দিঘলিয়া', en: 'Dighalia' },
    { bn: 'রূপসা', en: 'Rupsha' },
    { bn: 'তেরখাদা', en: 'Terokhada' },
    { bn: 'বটিয়াঘাটা', en: 'Batiaghata' },
    { bn: 'দাকোপ', en: 'Dacope' },
    { bn: 'পাইকগাছা', en: 'Paikgachha' },
    { bn: 'কয়রা', en: 'Koyra' }
  ],
  'Jashore': [
    { bn: 'যশোর সদর', en: 'Jashore Sadar' },
    { bn: 'শার্শা (বেনাপোল)', en: 'Sharsha' },
    { bn: 'ঝিকরগাছা', en: 'Jhikargachha' },
    { bn: 'চৌগাছা', en: 'Chaugachha' },
    { bn: 'মণিরামপুর', en: 'Manirampur' },
    { bn: 'কেশবপুর', en: 'Keshabpur' },
    { bn: 'বাঘারপাড়া', en: 'Bagherpara' },
    { bn: 'অভয়নগর', en: 'Abhaynagar' }
  ],
  'Kushtia': [
    { bn: 'কুষ্টিয়া সদর', en: 'Kushtia Sadar' },
    { bn: 'কুমারখালী', en: 'Kumarkhali' },
    { bn: 'মিরপুর', en: 'Mirpur' },
    { bn: 'ভেড়ামারা', en: 'Bheramara' },
    { bn: 'দৌলতপুর', en: 'Daulatpur' },
    { bn: 'খোকসা', en: 'Khoksa' }
  ],
  'Satkhira': [
    { bn: 'সাতক্ষীরা সদর', en: 'Satkhira Sadar' },
    { bn: 'কলারোয়া', en: 'Kalaroa' },
    { bn: 'তালা', en: 'Tala' },
    { bn: 'কালীগঞ্জ', en: 'Kaliganj' },
    { bn: 'শ্যামনগর', en: 'Shyamnagar' },
    { bn: 'আশাশুনি', en: 'Assasuni' },
    { bn: 'দেবহাটা', en: 'Debhata' }
  ],
  'Bagerhat': [
    { bn: 'বাগেরহাট সদর', en: 'Bagerhat Sadar' },
    { bn: 'মোংলা', en: 'Mongla' },
    { bn: 'ফকিরহাট', en: 'Fakirhat' },
    { bn: 'রামপাল', en: 'Rampal' },
    { bn: 'মোরেলগঞ্জ', en: 'Morrelganj' },
    { bn: 'শরণখোলা', en: 'Sarankhola' },
    { bn: 'কচুয়া', en: 'Kachua' },
    { bn: 'মোল্লাহাট', en: 'Mollahat' },
    { bn: 'চিতলমারী', en: 'Chitalmari' }
  ],
  'Jhenaidah': [
    { bn: 'ঝিনাইদহ সদর', en: 'Jhenaidah Sadar' },
    { bn: 'কালীগঞ্জ', en: 'Kaliganj' },
    { bn: 'কোটচাঁদপুর', en: 'Kotchandpur' },
    { bn: 'মহেশপুর', en: 'Maheshpur' },
    { bn: 'শৈলকুপা', en: 'Shailkupa' },
    { bn: 'হরিণাকুণ্ডু', en: 'Harinakunda' }
  ],
  'Chuadanga': [
    { bn: 'চুয়াডাঙ্গা সদর', en: 'Chuadanga Sadar' },
    { bn: 'আলমডাঙ্গা', en: 'Alamdanga' },
    { bn: 'দামুড়হুদা', en: 'Damurhuda' },
    { bn: 'জীবননগর', en: 'Jibannagar' }
  ],
  'Meherpur': [
    { bn: 'মেহেরপুর সদর', en: 'Meherpur Sadar' },
    { bn: 'গাংনী', en: 'Gangni' },
    { bn: 'মুজিবনগর', en: 'Mujibnagar' }
  ],
  'Magura': [
    { bn: 'মাগুরা সদর', en: 'Magura Sadar' },
    { bn: 'শ্রীপুর', en: 'Sreepur' },
    { bn: 'মহম্মদপুর', en: 'Mohammadpur' },
    { bn: 'শালিখা', en: 'Shalikha' }
  ],
  'Narail': [
    { bn: 'নড়াইল সদর', en: 'Narail Sadar' },
    { bn: 'লোহাগড়া', en: 'Lohagara' },
    { bn: 'কালিয়া', en: 'Kalia' }
  ],

  // --- BARISHAL DIVISION ---
  'Barishal': [
    { bn: 'বরিশাল সদর', en: 'Barishal Sadar' },
    { bn: 'বাবুগঞ্জ', en: 'Babuganj' },
    { bn: 'উজিরপুর', en: 'Wazirpur' },
    { bn: 'বাকেরগঞ্জ', en: 'Bakerganj' },
    { bn: 'গৌরনদী', en: 'Gournadi' },
    { bn: 'আগৈলঝাড়া', en: 'Agailjhara' },
    { bn: 'বানারীপাড়া', en: 'Banaripara' },
    { bn: 'মুলাদী', en: 'Muladi' },
    { bn: 'মেহেন্দিগঞ্জ', en: 'Mehendiganj' },
    { bn: 'হিজলা', en: 'Hizla' }
  ],
  'Patuakhali': [
    { bn: 'পটুয়াখালী সদর', en: 'Patuakhali Sadar' },
    { bn: 'বাউফল', en: 'Bauphal' },
    { bn: 'গলাচিপা', en: 'Galachipa' },
    { bn: 'কলাপাড়া (কুয়াকাটা)', en: 'Kalapara' },
    { bn: 'মির্জাগঞ্জ', en: 'Mirzaganj' },
    { bn: 'দুমকি', en: 'Dumki' },
    { bn: 'দশমিনা', en: 'Dashmina' },
    { bn: 'রাঙ্গাবালী', en: 'Rangabali' }
  ],
  'Bhola': [
    { bn: 'ভোলা সদর', en: 'Bhola Sadar' },
    { bn: 'দৌলতখান', en: 'Daulatkhan' },
    { bn: 'বোরহানউদ্দিন', en: 'Borhanuddin' },
    { bn: 'লালমোহন', en: 'Lalmohan' },
    { bn: 'চরফ্যাশন', en: 'Char Fasson' },
    { bn: 'তজুমদ্দিন', en: 'Tajumuddin' },
    { bn: 'মনপুরা', en: 'Monpura' }
  ],
  'Pirojpur': [
    { bn: 'পিরোজপুর সদর', en: 'Pirojpur Sadar' },
    { bn: 'ভান্ডারিয়া', en: 'Bhandaria' },
    { bn: 'মঠবাড়িয়া', en: 'Mathbaria' },
    { bn: 'নাজিরপুর', en: 'Nazirpur' },
    { bn: 'কাউখালী', en: 'Kawkhali' },
    { bn: 'নেছারাবাদ (স্বরূপকাঠি)', en: 'Nesarabad' },
    { bn: 'ইন্দুরকানী (জিয়ানগর)', en: 'Indurkani' }
  ],
  'Barguna': [
    { bn: 'বরগুনা সদর', en: 'Barguna Sadar' },
    { bn: 'আমতলী', en: 'Amtali' },
    { bn: 'পাথরঘাটা', en: 'Patharghata' },
    { bn: 'বেতাগী', en: 'Betagi' },
    { bn: 'বামনা', en: 'Bamna' },
    { bn: 'তালতলী', en: 'Taltali' }
  ],
  'Jhalokati': [
    { bn: 'ঝালকাঠি সদর', en: 'Jhalokati Sadar' },
    { bn: 'নলছিটি', en: 'Nalchity' },
    { bn: 'রাজাপুর', en: 'Rajapur' },
    { bn: 'কাঠালিয়া', en: 'Kathalia' }
  ],

  // --- RANGPUR DIVISION ---
  'Rangpur': [
    { bn: 'রংপুর সদর', en: 'Rangpur Sadar' },
    { bn: 'পীরগঞ্জ', en: 'Pirganj' },
    { bn: 'বদরগঞ্জ', en: 'Badarganj' },
    { bn: 'মিঠাপুকুর', en: 'Mithapukur' },
    { bn: 'গঙ্গাচড়া', en: 'Gangachhara' },
    { bn: 'কাউনিয়া', en: 'Kaunia' },
    { bn: 'পীরগাছা', en: 'Pirgachha' },
    { bn: 'তারাগঞ্জ', en: 'Taraganj' }
  ],
  'Dinajpur': [
    { bn: 'দিনাজপুর সদর', en: 'Dinajpur Sadar' },
    { bn: 'বীরগঞ্জ', en: 'Birganj' },
    { bn: 'বিরামপুর', en: 'Birampur' },
    { bn: 'ফুলবাড়ী', en: 'Phulbari' },
    { bn: 'পার্বতীপুর', en: 'Parbatipur' },
    { bn: 'কাহারোল', en: 'Kaharole' },
    { bn: 'বোচাগঞ্জ', en: 'Bochaganj' },
    { bn: 'চিরিরবন্দর', en: 'Chirirbandar' },
    { bn: 'খানসামা', en: 'Khansama' },
    { bn: 'নবাবগঞ্জ', en: 'Nawabganj' },
    { bn: 'ঘোড়াঘাট', en: 'Ghoraghat' },
    { bn: 'হাকিমপুর (হিলি)', en: 'Hakimpur' }
  ],
  'Thakurgaon': [
    { bn: 'ঠাকুরগাঁও সদর', en: 'Thakurgaon Sadar' },
    { bn: 'পীরগঞ্জ', en: 'Pirganj' },
    { bn: 'রাণীশংকৈল', en: 'Ranisankail' },
    { bn: 'বালিয়াডাঙ্গী', en: 'Baliadangi' },
    { bn: 'হরিপুর', en: 'Haripur' }
  ],
  'Panchagarh': [
    { bn: 'পঞ্চগড় সদর', en: 'Panchagarh Sadar' },
    { bn: 'তেঁতুলিয়া', en: 'Tetulia' },
    { bn: 'বোদা', en: 'Boda' },
    { bn: 'আটোয়ারী', en: 'Atwari' },
    { bn: 'দেবীগঞ্জ', en: 'Debiganj' }
  ],
  'Nilphamari': [
    { bn: 'নীলফামারী সদর', en: 'Nilphamari Sadar' },
    { bn: 'সৈয়দপুর', en: 'Saidpur' },
    { bn: 'ডোমার', en: 'Domar' },
    { bn: 'ডিমলা', en: 'Dimla' },
    { bn: 'জলঢাকা', en: 'Jaldhaka' },
    { bn: 'কিশোরগঞ্জ', en: 'Kishoreganj' }
  ],
  'Kurigram': [
    { bn: 'কুড়িগ্রাম সদর', en: 'Kurigram Sadar' },
    { bn: 'নাগেশ্বরী', en: 'Nageshwari' },
    { bn: 'ভূরুঙ্গামারী', en: 'Bhurungamari' },
    { bn: 'উলিপুর', en: 'Ulipur' },
    { bn: 'চিলমারী', en: 'Chilmari' },
    { bn: 'রাজারহাট', en: 'Rajarhat' },
    { bn: 'রৌমারী', en: 'Roumari' },
    { bn: 'চর রাজিবপুর', en: 'Char Rajibpur' },
    { bn: 'ফুলবাড়ী', en: 'Phulbari' }
  ],
  'Lalmonirhat': [
    { bn: 'লালমনিরহাট সদর', en: 'Lalmonirhat Sadar' },
    { bn: 'পাটগ্রাম', en: 'Patgram' },
    { bn: 'হাতীবান্ধা', en: 'Hatibandha' },
    { bn: 'কালীগঞ্জ', en: 'Kaliganj' },
    { bn: 'আদিতমারী', en: 'Aditmari' }
  ],
  'Gaibandha': [
    { bn: 'গাইবান্ধা সদর', en: 'Gaibandha Sadar' },
    { bn: 'গোবিন্দগঞ্জ', en: 'Gobindaganj' },
    { bn: 'সুন্দরগঞ্জ', en: 'Sundarganj' },
    { bn: 'পলাশবাড়ী', en: 'Palashbari' },
    { bn: 'সাদুল্লাপুর', en: 'Sadullapur' },
    { bn: 'ফুলছড়ি', en: 'Phulchhari' },
    { bn: 'সাঘাটা', en: 'Saghata' }
  ],

  // --- MYMENSINGH DIVISION ---
  'Mymensingh': [
    { bn: 'ময়মনসিংহ সদর', en: 'Mymensingh Sadar' },
    { bn: 'মুক্তাগাছা', en: 'Muktagachha' },
    { bn: 'ত্রিশাল', en: 'Trishal' },
    { bn: 'ভালুকা', en: 'Bhaluka' },
    { bn: 'গফরগাঁও', en: 'Gafargaon' },
    { bn: 'ঈশ্বরগঞ্জ', en: 'Ishwarganj' },
    { bn: 'নান্দাইল', en: 'Nandail' },
    { bn: 'ফুলপুর', en: 'Phulpur' },
    { bn: 'হালুয়াঘাট', en: 'Haluaghat' },
    { bn: 'ধোবাউড়া', en: 'Dhobaura' },
    { bn: 'ফুলবাড়িয়া', en: 'Phulbaria' },
    { bn: 'গৌরীপুর', en: 'Gouripur' },
    { bn: 'তারাকান্দা', en: 'Tarakanda' }
  ],
  'Jamalpur': [
    { bn: 'জামালপুর সদর', en: 'Jamalpur Sadar' },
    { bn: 'মেলান্দহ', en: 'Melandaha' },
    { bn: 'মাদারগঞ্জ', en: 'Madarganj' },
    { bn: 'ইসলামপুর', en: 'Islampur' },
    { bn: 'সরিষাবাড়ী', en: 'Sarishabari' },
    { bn: 'বকশীগঞ্জ', en: 'Bakshiganj' },
    { bn: 'দেওয়ানগঞ্জ', en: 'Dewanganj' }
  ],
  'Sherpur': [
    { bn: 'শেরপুর সদর', en: 'Sherpur Sadar' },
    { bn: 'নকলা', en: 'Nakla' },
    { bn: 'নালিতাবাড়ী', en: 'Nalitabari' },
    { bn: 'শ্রীবরদী', en: 'Sreebardi' },
    { bn: 'ঝিনাইগাতী', en: 'Jhenaigati' }
  ],
  'Netrokona': [
    { bn: 'নেত্রকোনা সদর', en: 'Netrokona Sadar' },
    { bn: 'দুর্গাপুর', en: 'Durgapur' },
    { bn: 'কেন্দুয়া', en: 'Kendua' },
    { bn: 'মদন', en: 'Madan' },
    { bn: 'মোহনগঞ্জ', en: 'Mohanganj' },
    { bn: 'বারহাট্টা', en: 'Barhatta' },
    { bn: 'কলমাকান্দা', en: 'Kalmakanda' },
    { bn: 'পূর্বধলা', en: 'Purbadhala' },
    { bn: 'আটপাড়া', en: 'Atpara' },
    { bn: 'খালিয়াজুড়ী', en: 'Khaliajuri' }
  ]
};

/**
 * Helper to get list of thanas for any district name (Bangla or English)
 */
export function getThanasForDistrict(districtName: string): IThana[] {
  if (!districtName) return [];
  const normalized = districtName.trim().toLowerCase();

  // Try direct key match
  for (const [key, thanas] of Object.entries(BANGLADESH_DISTRICT_THANAS)) {
    if (key.toLowerCase() === normalized) {
      return thanas;
    }
  }

  // Try matching against thanas from mapped district
  return [];
}
