from sqlalchemy.orm import Session
from app.core.security import hash_password
from app.models.orm import (
    User,
    UserRole,
    CropMarketPrice,
    CropDisease,
    AgriArticle,
    TransportRoute,
    TransportSchedule,
    EmergencyContact,
    ForumPost,
    TrainingCourse,
    ServiceApplication,
    ApplicationStatus
)

def init_db(db: Session, close_db: bool = False) -> None:
    try:
        default_pwd_hash = hash_password("password123")

        admin = db.query(User).filter(User.phone_number == "+8801700000000").first()
        if not admin:
            admin = User(
                full_name="সিস্টেম এডমিন (প্রধান কার্যালয়)",
                phone_number="+8801700000000",
                email="admin@pollibondhu.gov.bd",
                nid_number="1990123456789",
                role=UserRole.ADMIN,
                division="ঢাকা",
                district="ঢাকা",
                upazila="সাভার",
                password_hash=default_pwd_hash
            )
            db.add(admin)

        officer = db.query(User).filter(User.phone_number == "+8801800000000").first()
        if not officer:
            officer = User(
                full_name="মোঃ রফিকুল ইসলাম (উপসহকারী কৃষি কর্মকর্তা)",
                phone_number="+8801800000000",
                email="officer.rafiq@pollibondhu.gov.bd",
                nid_number="1988987654321",
                role=UserRole.OFFICER,
                division="ঢাকা",
                district="ঢাকা",
                upazila="ধামরাই",
                password_hash=default_pwd_hash
            )
            db.add(officer)

        farmer = db.query(User).filter(User.phone_number == "+8801812345678").first()
        if not farmer:
            farmer = User(
                full_name="আব্দুল কুদ্দুস (ক্ষুদ্র কৃষক)",
                phone_number="+8801812345678",
                email="kuddus.farmer@gmail.com",
                nid_number="1995555444333",
                role=UserRole.CITIZEN,
                division="ঢাকা",
                district="ঢাকা",
                upazila="ধামরাই",
                password_hash=default_pwd_hash
            )
            db.add(farmer)
        db.commit()

        if db.query(CropMarketPrice).count() < 25:
            db.query(CropMarketPrice).delete()
            prices = [
                CropMarketPrice(crop_name="Aman Paddy", crop_name_bn="আমন ধান", market_name="ধামরাই হাট", district="ঢাকা", division="ঢাকা", price_bdt_per_mon=1350.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Boro Paddy", crop_name_bn="বোরো ধান", market_name="জয়দেবপুর বাজার", district="গাজীপুর", division="ঢাকা", price_bdt_per_mon=1420.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Potato", crop_name_bn="আলু (কার্ডিনাল)", market_name="শিবগঞ্জ বাজার", district="বগুড়া", division="রাজশাহী", price_bdt_per_mon=950.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Onion", crop_name_bn="দেশি পেঁয়াজ", market_name="পাবনা পাইকারি হাট", district="পাবনা", division="রাজশাহী", price_bdt_per_mon=2800.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Wheat", crop_name_bn="গম", market_name="রংপুর কাস্টম মোড়", district="রংপুর", division="রংপুর", price_bdt_per_mon=1600.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Jute", crop_name_bn="কাঁচা পাট (তোষা)", market_name="যশোর রাজাহাট", district="যশোর", division="খুলনা", price_bdt_per_mon=3200.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Garlic", crop_name_bn="দেশি রসুন", market_name="নাটোর স্টেশন বাজার", district="নাটোর", division="রাজশাহী", price_bdt_per_mon=4500.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Chili", crop_name_bn="কাঁচা মরিচ", market_name="পাহাড়তলী বাজার", district="চট্টগ্রাম", division="চট্টগ্রাম", price_bdt_per_mon=3600.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Tomato", crop_name_bn="পাকা টমেটো", market_name="শ্রীমঙ্গল সবজি আড়ত", district="মৌলভীবাজার", division="সিলেট", price_bdt_per_mon=1800.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Brinjal", crop_name_bn="বেগুন", market_name="বরিশাল পোট রোড", district="বরিশাল", division="বরিশাল", price_bdt_per_mon=1400.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Mustard", crop_name_bn="সরিষা", market_name="ময়মনসিংহ মেছুয়া বাজার", district="ময়মনসিংহ", division="ময়মনসিংহ", price_bdt_per_mon=3400.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Lentil", crop_name_bn="মসুর ডাল", market_name="কুষ্টিয়া বড় বাজার", district="কুষ্টিয়া", division="খুলনা", price_bdt_per_mon=4800.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Banana", crop_name_bn="সবরি কলা", market_name="নরসিংদী বাজার", district="নরসিংদী", division="ঢাকা", price_bdt_per_mon=650.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Cabbage", crop_name_bn="বাঁধাকপি", market_name="দিনাজপুর গাবতলী", district="দিনাজপুর", division="রংপুর", price_bdt_per_mon=800.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Fish", crop_name_bn="রুই মাছ (২ কেজি+)", market_name="চাঁদপুর ঘাট", district="চাঁদপুর", division="চট্টগ্রাম", price_bdt_per_mon=12000.0, reported_by_id=officer.id),
                
                CropMarketPrice(crop_name="Aman Paddy", crop_name_bn="আমন ধান (সিলেট)", market_name="সিলেট সুবহানিঘাট আড়ত", district="সিলেট", division="সিলেট", price_bdt_per_mon=1380.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Boro Paddy", crop_name_bn="বোরো ধান (কদমতলী)", market_name="কদমতলী শস্য বাজার", district="সিলেট", division="সিলেট", price_bdt_per_mon=1450.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Chili", crop_name_bn="কাঁচা মরিচ (সিলেট)", market_name="বন্দরবাজার পাইকারি আড়ত", district="সিলেট", division="সিলেট", price_bdt_per_mon=3400.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Pineapple", crop_name_bn="আনারস (হানি কুইন)", market_name="জিন্দাবাজার ফল মার্কেট", district="সিলেট", division="সিলেট", price_bdt_per_mon=1200.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Banana", crop_name_bn="কাঁচকলা ও সবরি কলা", market_name="আম্বরখানা কাঁচাবাজার", district="সিলেট", division="সিলেট", price_bdt_per_mon=720.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Cauliflower", crop_name_bn="ফুলকপি", market_name="সিলেট বন্দরবাজার", district="সিলেট", division="সিলেট", price_bdt_per_mon=1100.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Gourd", crop_name_bn="লাউ ও কদু", market_name="সিলেট সুবহানিঘাট আড়ত", district="সিলেট", division="সিলেট", price_bdt_per_mon=900.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Leafy Vegetables", crop_name_bn="লাল শাক ও পালং শাক", market_name="কদমতলী বাজার", district="সিলেট", division="সিলেট", price_bdt_per_mon=650.0, reported_by_id=officer.id),
                
                CropMarketPrice(crop_name="Tea Leaf", crop_name_bn="কাঁচা চা পাতা", market_name="শ্রীমঙ্গল চা বাগান আড়ত", district="মৌলভীবাজার", division="সিলেট", price_bdt_per_mon=2200.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Lemon", crop_name_bn="জারা ও এলাচি লেবু", market_name="শ্রীমঙ্গল পাইকারি বাজার", district="মৌলভীবাজার", division="সিলেট", price_bdt_per_mon=2500.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Mustard", crop_name_bn="সরিষা (মৌলভীবাজার)", market_name="কুলাউড়া সমশেরনগর বাজার", district="মৌলভীবাজার", division="সিলেট", price_bdt_per_mon=3500.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Potato", crop_name_bn="গোল আলু", market_name="মৌলভীবাজার চৌমুহনা হাট", district="মৌলভীবাজার", division="সিলেট", price_bdt_per_mon=980.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Pumpkin", crop_name_bn="মিষ্টি কুমড়া", market_name="কমলগঞ্জ শমশেরনগর বাজার", district="মৌলভীবাজার", division="সিলেট", price_bdt_per_mon=750.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Beans", crop_name_bn="উচ্চ ফলনশীল শিম", market_name="শ্রীমঙ্গল সবজি আড়ত", district="মৌলভীবাজার", division="সিলেট", price_bdt_per_mon=1300.0, reported_by_id=officer.id),
                
                CropMarketPrice(crop_name="Katari Paddy", crop_name_bn="সুগন্ধি কাটারিভোগ ধান", market_name="হবিগঞ্জ চৌধুরী বাজার", district="হবিগঞ্জ", division="সিলেট", price_bdt_per_mon=1680.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Garlic", crop_name_bn="দেশি রসুন (হবিগঞ্জ)", market_name="মাধবপুর পাইকারি হাট", district="হবিগঞ্জ", division="সিলেট", price_bdt_per_mon=4600.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Onion", crop_name_bn="দেশি পেঁয়াজ (হবিগঞ্জ)", market_name="শায়েস্তাগঞ্জ নতুন বাজার", district="হবিগঞ্জ", division="সিলেট", price_bdt_per_mon=2750.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Brinjal", crop_name_bn="বেগুন (হবিগঞ্জ)", market_name="হবিগঞ্জ চৌধুরী বাজার", district="হবিগঞ্জ", division="সিলেট", price_bdt_per_mon=1350.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Cucumber", crop_name_bn="শশা ও খিরা", market_name="নবীগঞ্জ বাজার", district="হবিগঞ্জ", division="সিলেট", price_bdt_per_mon=850.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Maize", crop_name_bn="ভুট্টা (হবিগঞ্জ)", market_name="চুনারুঘাট মধ্যবাজার", district="হবিগঞ্জ", division="সিলেট", price_bdt_per_mon=1150.0, reported_by_id=officer.id),
                
                CropMarketPrice(crop_name="Haor Fish", crop_name_bn="হাওরের বোয়াল ও রুই মাছ", market_name="সুনামগঞ্জ মধ্যবাজার আড়ত", district="সুনামগঞ্জ", division="সিলেট", price_bdt_per_mon=11500.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Haor Boro Paddy", crop_name_bn="বোরো ধান (হাওর এলাকা)", market_name="ছাতক পুরান বাজার", district="সুনামগঞ্জ", division="সিলেট", price_bdt_per_mon=1390.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Mango", crop_name_bn="আম (আম্রপালি)", market_name="জগন্নাথপুর আড়ত", district="সুনামগঞ্জ", division="সিলেট", price_bdt_per_mon=3200.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Cabbage", crop_name_bn="বাঁধাকপি (সুনামগঞ্জ)", market_name="সুনামগঞ্জ মধ্যবাজার", district="সুনামগঞ্জ", division="সিলেট", price_bdt_per_mon=820.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Lentil", crop_name_bn="মসুর ডাল (সুনামগঞ্জ)", market_name="দিরাই বাজার", district="সুনামগঞ্জ", division="সিলেট", price_bdt_per_mon=4700.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Wheat", crop_name_bn="গম (ছাতক)", market_name="ছাতক বাজার", district="সুনামগঞ্জ", division="সিলেট", price_bdt_per_mon=1580.0, reported_by_id=officer.id)
            ]
            db.add_all(prices)
            db.commit()

        if db.query(CropDisease).count() < 20:
            db.query(CropDisease).delete()
            diseases = [
                CropDisease(crop_name_bn="ধান", crop_name_en="Rice", disease_name_bn="ধানের ব্লাস্ট রোগ", disease_name_en="Rice Blast", symptoms_bn="পাতায় চোখের মতো বাদামী দাগ পড়ে, শিষ শুকিয়ে মরে যায়।", treatment_bn="ট্রাইসাইক্লাজোল (Tricyclazole) গ্রুপের ছত্রাকনাশক (যেমন: ট্রুপার) প্রতি লিটার পানিতে ০.৭৫ গ্রাম মিশিয়ে স্প্রে করুন।", prevention_bn="সুষম নাইট্রোজেন ব্যবহার করা এবং জমিতে পর্যাপ্ত পানি ধরে রাখা।"),
                CropDisease(crop_name_bn="ধান", crop_name_en="Rice", disease_name_bn="ধানের পাতা পোড়া (ব্যাকটেরিয়াল লিফ ব্লাইট)", disease_name_en="Bacterial Leaf Blight", symptoms_bn="পাতার প্রান্ত থেকে লালচে-হলুদ দাগ নিচের দিকে ছড়িয়ে পড়ে।", treatment_bn="কপার অক্সিক্লোরাইড + ব্যাকটিনল পানিতে মিশিয়ে প্রয়োগ করুন।", prevention_bn="রোগমুক্ত বীজ ও সুষম পটাশ সার ব্যবহার।"),
                CropDisease(crop_name_bn="ধান", crop_name_en="Rice", disease_name_bn="ধানের খোল পচা রোগ", disease_name_en="Rice Sheath Blight", symptoms_bn="খোলের ওপর সাপের চামড়ার মতো ধূসর-সবুজ দাগ পড়ে।", treatment_bn="হেক্সাকোনাজোল (যেমন: কন্টাফ) প্রতি লিটার পানিতে ২ মিলি স্প্রে করুন।", prevention_bn="গাছ ঘন না করা ও সার সুষম রাখা।"),
                CropDisease(crop_name_bn="ধান", crop_name_en="Rice", disease_name_bn="ধানের বাদামী গাছফড়িং (কারেন্ট পোকা)", disease_name_en="Brown Planthopper (BPH)", symptoms_bn="গাছের গোড়ায় পোকা জমে চুষে খায়, খেতের মাঝখানে গোল হয়ে পুড়ে যাওয়ার মতো শুকায়।", treatment_bn="পাইমেট্রোজিন (যেমন: প্যাক্সার) বা ইমিডাক্লোপ্রিড প্রয়োগ করুন।", prevention_bn="আলোর ফাঁদ ব্যবহার ও পানির স্তর নামিয়ে শুকানো।"),
                CropDisease(crop_name_bn="আলু", crop_name_en="Potato", disease_name_bn="আলুর মড়ক (লেট ব্লাইট) রোগ", disease_name_en="Potato Late Blight", symptoms_bn="পাতায় কালচে ভেজা দাগ এবং সকালের দিকে পাতার নিচে সাদা পাউডারের মতো ছত্রাক দেখা যায়।", treatment_bn="ম্যানকোজেব + মেটালেক্সিল (যেমন: রিডোমিল গোল্ড) ২ গ্রাম/লিটার পানিতে স্প্রে করুন।", prevention_bn="কুয়াশাচ্ছন্ন আবহাওয়ায় আগাম প্রতিরক্ষামূলক স্প্রে।"),
                CropDisease(crop_name_bn="আলু", crop_name_en="Potato", disease_name_bn="আলুর আগাম ধসা (আর্লি ব্লাইট)", disease_name_en="Potato Early Blight", symptoms_bn="পাতায় চক্রাকার বাদামী দাগ পড়ে পাতার চারপাশে হলুদ বলয় তৈরি হয়।", treatment_bn="আইপ্রোডিয়ন (যেমন: রোভরাল) ২ গ্রাম/লিটার পানিতে মিশিয়ে স্প্রে করুন।", prevention_bn="ফসল পর্যায় অনুসরন করা ও সুষম সার প্রদান।"),
                CropDisease(crop_name_bn="আলু", crop_name_en="Potato", disease_name_bn="আলুর ঢলে পড়া (ব্যাকটেরিয়াল উইল্ট)", disease_name_en="Bacterial Wilt", symptoms_bn="গাছের ডালপালা হঠাৎ ঢলে পড়ে এবং কান্ড কাটলে সাদা আঠালো রস বের হয়।", treatment_bn="আক্রান্ত গাছ উঠিয়ে পুড়িয়ে ফেলা এবং জমি ব্লিচিং পাউডার দিয়ে শোধন।", prevention_bn="রোগমুক্ত সার্টিফাইড বীজ ব্যবহার।"),
                CropDisease(crop_name_bn="গম", crop_name_en="Wheat", disease_name_bn="গমের ব্লাস্ট রোগ", disease_name_en="Wheat Blast", symptoms_bn="শীষের গোড়া শুকিয়ে পুরো শীষ সাদা হয়ে যায় এবং দানা পুষ্ট হয় না।", treatment_bn="নেটিভো (Nativo) ৭৫ ডব্লিউজি ১ গ্রাম/লিটার পানিতে শেষ বিকেলে স্প্রে করুন।", prevention_bn="১৫ নভেম্বরের মধ্যে আগাম গম বপন করা।"),
                CropDisease(crop_name_bn="গম", crop_name_en="Wheat", disease_name_bn="গমের মরিচা রোগ (রানিং রাস্ট)", disease_name_en="Wheat Rust", symptoms_bn="পাতায় ও কান্ডে হলুদ বা লালচে গুঁড়ো পাউডারের মতো দাগ দেখা যায়।", treatment_bn="প্রোপিকোনাজোল (যেমন: টিল্ট) ১ মিলি/লিটার পানিতে মিশিয়ে স্প্রে করুন।", prevention_bn="প্রতিরোধক জাতের গম চাষ করা।"),
                CropDisease(crop_name_bn="টমেটো", crop_name_en="Tomato", disease_name_bn="টমেটোর পাতা কোঁকড়ানো ভাইরাস", disease_name_en="Tomato Leaf Curl Virus", symptoms_bn="পাতা কোঁকড়ে ছোট হয়ে যায়, গাছ খর্বাকৃতি হয় এবং ফল ধরে না।", treatment_bn="সাদা মাছি দমনে ইমিডাক্লোপ্রিড (যেমন: এডমিয়ার) ০.৫ মিলি/লিটার স্প্রে করুন।", prevention_bn="হলুদ আঠালো ফাঁদ ব্যবহার ও আক্রান্ত গাছ তুলে ফেলা।"),
                CropDisease(crop_name_bn="টমেটো", crop_name_en="Tomato", disease_name_bn="টমেটোর নাবি ধসা রোগ", disease_name_en="Tomato Late Blight", symptoms_bn="পাতায় ও ফলে কালচে ছোপ ছোপ দাগ পড়ে ও পচে যায়।", treatment_bn="ম্যানকোজেব ২ গ্রাম/লিটার পানিতে মিশিয়ে স্প্রে।", prevention_bn="পানি নিষ্কাশন ও বাতাস চলাচলের ব্যবস্থা রাখা।"),
                CropDisease(crop_name_bn="বেগুন", crop_name_en="Brinjal", disease_name_bn="বেগুনের ডগা ও ফল ছিদ্রকারী পোকা", disease_name_en="Brinjal Fruit & Shoot Borer", symptoms_bn="কচি ডগা নেতিয়ে পড়ে এবং ফলে ছিদ্র করে ভেতরে পোকা থাকে।", treatment_bn="স্পিনোস্যাড (যেমন: ট্রেসার) ০.৪ মিলি/লিটার পানিতে স্প্রে করুন।", prevention_bn="ফেরোমোন ফাঁদ ব্যবহার ও আক্রান্ত ডগা কেটে ফেলা।"),
                CropDisease(crop_name_bn="বেগুন", crop_name_en="Brinjal", disease_name_bn="বেগুনের লিটল লিফ (ছোট পাতা) রোগ", disease_name_en="Brinjal Little Leaf", symptoms_bn="পাতা অত্যন্ত ছোট ও ঝোপালো গুচ্ছ আকার ধারণ করে।", treatment_bn="রোগবাহী জাসিড পোকা দমনে ডায়ামেথোয়েট ২ মিলি/লিটার প্রয়োগ।", prevention_bn="আক্রান্ত গাছ তুলে ধ্বংস করা।"),
                CropDisease(crop_name_bn="মরিচ", crop_name_en="Chili", disease_name_bn="মরিচের ডাই ব্যাক বা ফল পচা রোগ", disease_name_en="Chili Anthracnose", symptoms_bn="ডাল ওপর থেকে শুকিয়ে আসে এবং পাকা ফলে গোলাকার দাগ হয়ে পচে।", treatment_bn="কারবেন্ডাজিম (যেমন: অটোস্টিন) ১ গ্রাম/লিটার পানিতে প্রয়োগ করুন।", prevention_bn="বীজ শোধন ও সুষম সেচ দেয়া।"),
                CropDisease(crop_name_bn="পাট", crop_name_en="Jute", disease_name_bn="পাটের কান্ড পচা রোগ", disease_name_en="Jute Stem Rot", symptoms_bn="কান্ডে কালো দাগ পড়ে আঁশ পচে খসে পড়ে।", treatment_bn="ম্যানকোজেব ২.৫ গ্রাম/লিটার পানিতে প্রয়োগ করুন।", prevention_bn="পানি নিষ্কাশন উন্নত করা।"),
                CropDisease(crop_name_bn="ভুট্টা", crop_name_en="Maize", disease_name_bn="ভুট্টার ফল আর্মিওয়ার্ম পোকা", disease_name_en="Fall Armyworm", symptoms_bn="ভুট্টার মাইজ খায় ও পাতায় বড় বড় ছিদ্র করে ফেলে।", treatment_bn="স্পিনোস্যাড বা এমামেকটিন বেঞ্জোয়েট প্রয়োগ করুন।", prevention_bn="জৈব বালাইনাশক ও ফেরোমোন ফাঁদ সেট করা।"),
                CropDisease(crop_name_bn="পেঁয়াজ", crop_name_en="Onion", disease_name_bn="পেঁয়াজের পার্পল ব্লচ (বেগুনি দাগ)", disease_name_en="Onion Purple Blotch", symptoms_bn="পাতায় লম্বাটে বেগুনি রঙের চাপ পড়ে পাতা ভেঙে পড়ে।", treatment_bn="রোভরাল ২ গ্রাম/লিটার পানিতে মিশিয়ে স্প্রে করুন।", prevention_bn="পানি জমার সমস্যা দূর করা।"),
                CropDisease(crop_name_bn="সরিষা", crop_name_en="Mustard", disease_name_bn="সরিষার জাব পোকা", disease_name_en="Mustard Aphid", symptoms_bn="কচি ফুল ও ফলে শত শত ছোট পোকা চুষে খেয়ে ফলন নষ্ট করে।", treatment_bn="মাল্যাথিয়ন বা ইমিডাক্লোপ্রিড বিকেলে স্প্রে করুন।", prevention_bn="আগাম বীজ রোপণ ও সাবান পানি ছিটানো।"),
                CropDisease(crop_name_bn="আম", crop_name_en="Mango", disease_name_bn="আমের অ্যানথ্রাকনোজ (কালি দাগ)", disease_name_en="Mango Anthracnose", symptoms_bn="মুকুল ও কচি আমে কালো ছোপ দাগ পড়ে ঝরে যায়।", treatment_bn="এমিস্টার টপ ১ মিলি/লিটার পানিতে মুকুল আসার আগে ও পরে স্প্রে।", prevention_bn="গাছের মরা ডালপালা ছাঁটাই করা।"),
                CropDisease(crop_name_bn="পেঁপে", crop_name_en="Papaya", disease_name_bn="পেঁপের রিং স্পট ভাইরাস", disease_name_en="Papaya Ring Spot Virus", symptoms_bn="পাতায় হলুদ মোজাইক দাগ এবং ফলে বলয়ের মতো দাগ পড়ে।", treatment_bn="বাহক জাব পোকা দমনে কীটনাশক ব্যবহার।", prevention_bn="রোগমুক্ত চারা রোপণ ও ভাইরাসমুক্ত পরিচ্ছন্ন বাগান।"),
                CropDisease(crop_name_bn="মসুর", crop_name_en="Lentil", disease_name_bn="মসুর ডালের স্টেমফিলিয়াম ব্লাইট", disease_name_en="Lentil Stemphylium Blight", symptoms_bn="পাতায় পিন মাথার মতো দাগ পড়ে পুরো গাছ তামাটে হয়ে শুকায়।", treatment_bn="রোভরাল বা টিল্ট স্প্রে করা।", prevention_bn="বীজ শোধন করে রোপণ।")
            ]
            db.add_all(diseases)
            db.commit()

        if db.query(AgriArticle).count() < 6:
            db.query(AgriArticle).delete()
            articles = [
                AgriArticle(title_bn="আমন ধানের বাম্পার ফলনে আধুনিক সুষম সার ব্যবস্থাপনা", category="fertilizer", summary_bn="ইউরিয়া, টিএসপি এবং ডিএপি সারের সঠিক প্রয়োগ মাত্রা ও উপরিপ্রয়োগের সময়সূচী।", content_bn="আমন ধান চাষে ফলন বাড়াতে সুষম সার প্রয়োগ অত্যন্ত জরুরি। প্রতি শতকে ইউরিয়া ৮০০ গ্রাম, টিএসপি ৪০০ গ্রাম, ও এমপি ৫০০ গ্রাম প্রযোগ করতে হবে। ইউরিয়া ৩ কিস্তিতে উপরিপ্রয়োগ করুন।", author="কৃষি সম্প্রসারণ অধিদপ্তর"),
                AgriArticle(title_bn="চলতি মৌসুমে ভুট্টা চাষ ও ফল আর্মিওয়ার্ম পোকা দমন নির্দেশিকা", category="crop_guide", summary_bn="ফল আর্মিওয়ার্ম পোকা দমনে জৈব বালাইনাশক ও ফেরোমোন ফাঁদ ব্যবহারের কার্যকারিতা।", content_bn="ভুট্টায় ফল আর্মিওয়ার্ম দমনে জৈব বালাইনাশক এবং ফেরোমেন ফাঁদ ব্যবহার নিশ্চিত করুন। প্রাথমিক অবস্থায় সাবান পানি স্প্রে করেও পোকা দমন করা যায়।", author="বিএআরআই (BARI)"),
                AgriArticle(title_bn="শীতকালীন টমেটো চাষে রোগ প্রতিরোধ ও পরিচর্যা কৌশল", category="crop_guide", summary_bn="টমেটোর নাবি ধসা ও পাতা কোঁকড়ানো রোগ দমনে জরুরি ব্যবস্থা।", content_bn="শীতকালীন টমেটোতে সময়মতো বাঁশ দিয়ে খুঁটি বেঁধে দেয়া এবং ছাদ বা তুঁতের মিশ্রণ স্প্রে করলে রোগাক্রান্ত হওয়ার ঝুঁকি বহুলাংশে কমে।", author="কৃষি তথ্য সার্ভিস"),
                AgriArticle(title_bn="উচ্চ ফলনশীল সরিষা চাষ ও মৌমাছি পালনে দ্বিগুণ লাভ", category="organic", summary_bn="সরিষা খেতের পাশে মৌ-বাক্স স্থাপন করে মধু সংগ্রহ ও পরাগায়ন বৃদ্ধি।", content_bn="সরিষা খেতের পাশে মৌবাক্স বসালে পরাগায়ন ১৫-২০% বৃদ্ধি পায় এবং প্রচুর প্রাকৃতিক মধু সংগ্রহ করা সম্ভব হয়।", author="মৌমাছি উন্নয়ন ফাউন্ডেশন"),
                AgriArticle(title_bn="জলবায়ু সহনশীল শস্য চাষ ও ড্রিপ সেচ প্রযুক্তি", category="irrigation", summary_bn="পানির অপচয় রোধে ড্রিপ সেচ ও সোলার পাম্পের আধুনিক ব্যবহার।", content_bn="ড্রিপ সেচ প্রযুক্তির মাধ্যমে গাছের গোড়ায় ফোঁটা ফোঁটা পানি সরবরাহ করা হয়, ফলে ৭০% সেচের পানি সাশ্রয় হয়।", author="কৃষি প্রকৌশল বিভাগ"),
                AgriArticle(title_bn="জৈব বালাইনাশক তৈরি ও কেঁচো সার (ভার্মিকম্পোস্ট) প্রস্তুত প্রণালী", category="organic", summary_bn="বাড়িতে তৈরি কেঁচো সার ও নিম পাতার নির্যাস দিয়ে পরিবেশবান্ধব চাষাবাদ।", content_bn="সবজির খোসা ও গবাদিপশুর গোবর ব্যবহার করে খুব সহজেই ২১ দিনে পুষ্টিকর কেঁচো সার প্রস্তুত করা যায়।", author="জৈব কৃষি নেটওয়ার্ক")
            ]
            db.add_all(articles)
            db.commit()

        if db.query(TransportRoute).count() < 6:
            db.query(TransportRoute).delete()
            route1 = TransportRoute(route_code="ROUTE-DHAMRAI-GABTOLI", origin_bn="ধামরাই", destination_bn="গাবতলী (ঢাকা)", distance_km=38.5, estimated_duration_minutes=75, vehicle_type="bus", operator_name_bn="ধামরাই এক্সপ্রেস ও ডি-লিংক", fare_bdt=95.0)
            route2 = TransportRoute(route_code="ROUTE-SAVAR-MANIKGANJ", origin_bn="সাভার", destination_bn="মানিকগঞ্জ", distance_km=42.0, estimated_duration_minutes=80, vehicle_type="bus", operator_name_bn="শুভযাত্রা পরিবহন", fare_bdt=110.0)
            route3 = TransportRoute(route_code="ROUTE-SADARGHAT-BARISHAL", origin_bn="ঢাকা (সদরঘাট)", destination_bn="বরিশাল লঞ্চ টার্মিনাল", distance_km=180.0, estimated_duration_minutes=360, vehicle_type="launch", operator_name_bn="সুন্দরবন ও সুরভী নেভিগেশন", fare_bdt=350.0)
            route4 = TransportRoute(route_code="ROUTE-DHAKA-RAJSHAHI-TRAIN", origin_bn="ঢাকা (কমলাপুর)", destination_bn="রাজশাহী স্টেশন", distance_km=250.0, estimated_duration_minutes=300, vehicle_type="train", operator_name_bn="বনলতা এক্সপ্রেস (বাংলাদেশ রেলওয়ে)", fare_bdt=420.0)
            route5 = TransportRoute(route_code="ROUTE-DHAMRAI-LOCAL-AUTO", origin_bn="ধামরাই বাজার", destination_bn="কাওয়ালতিয়া ইউনিয়ন", distance_km=12.0, estimated_duration_minutes=25, vehicle_type="auto", operator_name_bn="লোকাল ইজি-বাইক সমিতি", fare_bdt=30.0)
            route6 = TransportRoute(route_code="ROUTE-CHATTOGRAM-COXBAZAR", origin_bn="চট্টগ্রাম (অলংকার)", destination_bn="কক্সবাজার টার্মিনাল", distance_km=150.0, estimated_duration_minutes=240, vehicle_type="bus", operator_name_bn="মার্শা ও শ্যামলী পরিবহন", fare_bdt=380.0)
            db.add_all([route1, route2, route3, route4, route5, route6])
            db.commit()

            schedules = [
                TransportSchedule(route_id=route1.id, departure_time="০৬:৩০ AM", arrival_time="০৭:৪৫ AM", days_of_week="দৈনিক (Daily)"),
                TransportSchedule(route_id=route1.id, departure_time="০৯:০০ AM", arrival_time="১০:১৫ AM", days_of_week="দৈনিক (Daily)"),
                TransportSchedule(route_id=route2.id, departure_time="০৭:০০ AM", arrival_time="০৮:২০ AM", days_of_week="দৈনিক (Daily)"),
                TransportSchedule(route_id=route3.id, departure_time="০৮:৩০ PM", arrival_time="০৪:৩০ AM", days_of_week="দৈনিক (Daily)"),
                TransportSchedule(route_id=route4.id, departure_time="০৬:০০ AM", arrival_time="১১:০০ AM", days_of_week="শুক্রবার ব্যতীত (Daily except Fri)"),
                TransportSchedule(route_id=route5.id, departure_time="প্রতি ১৫ মিনিট পর", arrival_time="২৫ মিনিট পর", days_of_week="দৈনিক (Daily)"),
                TransportSchedule(route_id=route6.id, departure_time="০৭:৩০ AM", arrival_time="১১:৩০ AM", days_of_week="দৈনিক (Daily)")
            ]
            db.add_all(schedules)
            db.commit()

        if db.query(EmergencyContact).count() == 0:
            contacts = [
                EmergencyContact(title_bn="জাতীয় জরুরি সেবা (National Emergency Service)", category="national", phone_number="999", available_hours="২৪/৭ (২৪ ঘণ্টা)", district="জাতীয়", description_bn="পুলিশ, ফায়ার সার্ভিস ও অ্যাম্বুলেন্স জরুরি কলের জন্য বিনামূল্যে টোল-ফ্রি হেল্পলাইন।", icon_symbol="🚨"),
                EmergencyContact(title_bn="জাতীয় তথ্য ও সরকারি সেবা হেল্পলাইন", category="national", phone_number="333", available_hours="২৪/৭ (২৪ ঘণ্টা)", district="জাতীয়", description_bn="সরকারি সেবা, সামাজিক সমস্যা ও তথ্য সহায়তার জন্য জাতীয় কল সেন্টার।", icon_symbol="📞"),
                EmergencyContact(title_bn="কৃষি কল সেন্টার (Agri Call Center)", category="agriculture", phone_number="16123", available_hours="সকাল ৯টা - বিকাল ৫টা", district="জাতীয়", description_bn="কৃষি, মৎস্য ও প্রাণিসম্পদ বিষয়ক সমস্যা সমাধানে সরাসরি কৃষি বিশেষজ্ঞ পরামর্শ।", icon_symbol="🌾"),
                EmergencyContact(title_bn="নারী ও শিশু নির্যাতন প্রতিরোধ হেল্পলাইন", category="women_child", phone_number="109", available_hours="২৪/৭ (২৪ ঘণ্টা)", district="জাতীয়", description_bn="নারী ও শিশুদের জরুরি সুরক্ষা এবং আইনি সহায়তা হেল্পলাইন।", icon_symbol="🛡️"),
                EmergencyContact(title_bn="ধামরাই উপজেলা ফায়ার সার্ভিস ও সিভিল ডিফেন্স", category="fire", phone_number="+8801730002211", available_hours="২৪/৭ (২৪ ঘণ্টা)", district="ঢাকা", description_bn="ধামরাই ও সাভার এলাকার অগ্নিনির্বাপণ ও জরুরি উদ্ধার কাজ।", icon_symbol="🚒"),
                EmergencyContact(title_bn="উপজেলা স্বাস্থ্য কমপ্লেক্স জরুরি অ্যাম্বুলেন্স", category="health", phone_number="+8801711998877", available_hours="২৪/৭ (২৪ ঘণ্টা)", district="ঢাকা", description_bn="ধামরাই উপজেলা স্বাস্থ্য কমপ্লেক্স সরকারি অ্যাম্বুলেন্স সার্ভিস।", icon_symbol="🚑")
            ]
            db.add_all(contacts)
            db.commit()

        if db.query(ForumPost).count() < 10 and farmer:
            db.query(ForumPost).delete()
            posts = [
                ForumPost(user_id=farmer.id, author_name=farmer.full_name, title="আমন ধানের ফলন বৃদ্ধিতে লাল পোকা দমন করার সহজ উপায় কী?", category="কৃষি পরামর্শ", content="আমাদের ধামরাই ব্লকে নতুন ধান গাছে লাল পোকার আক্রমণ দেখা দিয়েছে। জৈব উপায়ে কীভাবে এটি দমন করা সম্ভব?", views_count=42),
                ForumPost(user_id=farmer.id, author_name=farmer.full_name, title="উপজেলা কৃষি অফিস থেকে পাওয়ার টিলার অনুদানের নিয়ম জানতে চাই", category="সাধারণ প্রশ্ন", content="কৃষি যন্ত্রপাতি ৫০% অনুদানে পেতে হলে প্রয়োজনীয় কাগজপত্র ও কৃষক দলের নিয়মসমূহ কি কি?", views_count=18),
                ForumPost(user_id=farmer.id, author_name="মোছাম্মৎ রহিমা খাতুন (মহিলা কৃষক)", title="শীতকালীন বেগুন ও টমেটোতে জৈব বালাইনাশক নিম নির্যাস তৈরির নিয়ম", category="জৈব কৃষি", content="রাসায়নিক বিষ না ছিটিয়ে বাড়িতে নিম পাতা ও সাবান পানি দিয়ে কীভাবে পোকা দমন করা যায়?", views_count=65),
                ForumPost(user_id=farmer.id, author_name="মোঃ শফিকুল ইসলাম (মৎস্য চাষী)", title="পুকুরে মাছের লাল রানিং রোগ ও পানি শোধন পদ্ধতি", category="মৎস্য চাষ", content="পুকুরের পানিতে চুন ও পটাশ সারের সঠিক মাত্রা প্রয়োগ করার নিয়ম জানতে চাই।", views_count=39),
                ForumPost(user_id=farmer.id, author_name="কৃষিবিদ মোঃ জহিরুল ইসলাম", title="বোরো ধান রোপণের আগে জমি তৈরিতে দস্তা সারের প্রয়োজনীয়তা", category="মাটি ও সার", content="দস্তার অভাবে ধানের খাটো রোগ হয়। প্রতি শতকে ২০ গ্রাম দস্তা সার প্রয়োগের সুফল।", views_count=88),
                ForumPost(user_id=farmer.id, author_name="আব্দুর রাজ্জাক (নরসিংদী)", title="সবরি ও মিছরি কলা বাগান তৈরিতে আধুনিক চারা নির্বাচন", category="ফল চাষ", content="টিস্যু কালচার চারায় দ্রুত ফলন পাওয়া যায় এবং রোগ আক্রমণ কম হয়।", views_count=52),
                ForumPost(user_id=farmer.id, author_name="জসিম উদ্দিন (রংপুর)", title="আলু সংরক্ষণে প্রাকৃতিক হিমঘর ও আধুনিক সেড তৈরি পদ্ধতি", category="শস্য সংরক্ষণ", content="হিমঘরে আলু রাখার আগে ছায়াযুক্ত স্থানে বাতাসে শুকিয়ে নেয়া জরুরী।", views_count=71),
                ForumPost(user_id=farmer.id, author_name="সোহেল রানা (যশোর)", title="তোষা পাট ধোলাই ও পচানোর জন্য রিফন পদ্ধতি ব্যবহার", category="পাট চাষ", content="কম পানিতে পাট পচাতে রিবনার মেশিন ও ব্যাকটেরিয়া কালচার ব্যবহারে আঁশের উজ্জ্বলতা বাড়ে।", views_count=29),
                ForumPost(user_id=farmer.id, author_name="আমির হোসেন (পাবনা)", title="দেশি পেঁয়াজ সংরক্ষণে কিউরিং ও বাতাস চলাচলের শেলফ গাইড", category="পেঁয়াজ চাষ", content="পেঁয়াজ তোলার পর ৭ দিন বাতাসে শুকিয়ে বাঁশের মাচায় রাখলে পচন ধরে না।", views_count=94),
                ForumPost(user_id=farmer.id, author_name="আনোয়ার পারভেজ (বগুড়া)", title="উপজেলা কৃষি অফিসে স্মার্ট কৃষক কার্ড কার্ড নিবন্ধনের নিয়মাবলী", category="সরকারি সেবা", content="NID ও ২ কপি ছবি নিয়ে নিকটস্থ ইউনিয়ন ডিজিটাল সেন্টারে ফ্রিতে নিবন্ধন করা যায়।", views_count=110)
            ]
            db.add_all(posts)
            db.commit()

        # Update Training Courses with the 5 EXACT verified YouTube Videos
        db.query(TrainingCourse).delete()
        courses = [
            TrainingCourse(
                title_bn="বায়োফ্লক মৎস্য চাষ ও পুকুর ছাড়া কমার্শিয়াল মাছ চাষ গাইড (ভিডিও-১)",
                category="মৎস্য চাষ",
                instructor_bn="কৃষিবিদ তানভীর আহমেদ (Agro BD)",
                duration_hours=4,
                video_url="https://www.youtube.com/embed/otggMdQPJGI",
                description_bn="পুকুর ছাড়াই বায়োফ্লক প্রযুক্তিতে আধুনিক কমার্শিয়াল মৎস্য চাষের বাস্তবসম্মত ভিডিও নির্দেশিকা।"
            ),
            TrainingCourse(
                title_bn="শীতের বাগান জমজমাট করার F1 বীজ কালেকশন ও বপন নির্দেশিকা",
                category="সবজি চাষ",
                instructor_bn="মোছাঃ শিরিন আক্তার (কৃষি বিশেষজ্ঞ)",
                duration_hours=5,
                video_url="https://www.youtube.com/embed/FH0aTF_GqpA",
                description_bn="শীতকালীন হাইব্রিড F1 সবজি বীজ নির্বাচন, চারা তৈরি ও পরিচর্যার বিশেষ ভিডিও ক্লাস।"
            ),
            TrainingCourse(
                title_bn="বিকাশ, নগদ, রকেট হ্যাক হয় কীভাবে? নিরাপদ থাকার সঠিক উপায়",
                category="ডিজিটাল আর্থিক সুরক্ষা",
                instructor_bn="মোঃ আরিফ হোসাইন (আইটি সুরক্ষা কনসালট্যান্ট)",
                duration_hours=3,
                video_url="https://www.youtube.com/embed/zFUwF9WGwR8",
                description_bn="গ্রামীণ নাগরিকদের জন্য বিকাশ, নগদ ও রকেট মোবাইল ব্যাংকিং হ্যাকিং প্রতিরোধ ও ডিজিটাল নিরাপত্তার কৌশল।"
            ),
            TrainingCourse(
                title_bn="বাংলাদেশের প্রযুক্তি নির্ভর আধুনিক ক্যাটেল ডেইরি ফার্ম (Nahar Dairy)",
                category="প্রাণিসম্পদ",
                instructor_bn="ড. মোঃ কামরুল হাসান (কৃষিকথা)",
                duration_hours=7,
                video_url="https://www.youtube.com/embed/iwl58ID80Vs",
                description_bn="প্রযুক্তি নির্ভর ক্যাটেল ফার্ম ও আধুনিক ডেইরি র্যাঞ্চ পরিচালনার সম্পূর্ণ প্র্যাকটিক্যাল গাইডলাইন।"
            ),
            TrainingCourse(
                title_bn="ধানের কুশি বৃদ্ধির বিশেষ কৌশল ও সুষম ব্যবস্থাপনা (Smart Agro Seeds)",
                category="শস্য প্রযুক্তি",
                instructor_bn="ড. মোঃ আহসান হাবীব (ব্ররি)",
                duration_hours=6,
                video_url="https://www.youtube.com/embed/HHmTHEaLR64",
                description_bn="আমন ও বোরো ধান চাষে গাছে অধিক কুশি বৃদ্ধি ও বাম্পার ফলন পাওয়ার বৈজ্ঞানিক পদ্ধতি।"
            )
        ]
        db.add_all(courses)
        db.commit()

        app_rec = db.query(ServiceApplication).filter(ServiceApplication.application_number == "APP-2026-8801").first()
        if not app_rec and farmer:
            app_rec = ServiceApplication(
                application_number="APP-2026-8801",
                user_id=farmer.id,
                service_type="agri_loan",
                sub_service_name="কৃষি ঋণ (Subsidized Agri Loan)",
                status=ApplicationStatus.PENDING,
                applicant_name=farmer.full_name,
                applicant_phone=farmer.phone_number,
                assigned_officer_id=officer.id,
                remarks="প্রাথমিক ঋণের আবেদন জমা হয়েছে"
            )
            db.add(app_rec)
            db.commit()

    finally:
        if close_db:
            db.close()
