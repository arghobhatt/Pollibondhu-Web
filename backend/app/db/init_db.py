from sqlalchemy.orm import Session
from app.db.database import engine, Base, SessionLocal
from app.models.orm import (
    User,
    UserRole,
    ServiceApplication,
    ApplicationStatus,
    CropMarketPrice,
    CropDisease,
    AgriArticle,
    TransportRoute,
    TransportSchedule,
    EmergencyContact,
    ForumPost,
    TrainingCourse
)

def init_db(db: Session = None):
    Base.metadata.create_all(bind=engine)
    
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        from app.core.security import hash_password
        default_pwd_hash = hash_password("password123")

        admin = db.query(User).filter(User.phone_number == "+8801700000000").first()
        if not admin:
            admin = User(
                full_name="পল্লীবন্ধু অ্যাডমিন",
                phone_number="+8801700000000",
                email="admin@pollibondhu.gov.bd",
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
                role=UserRole.CITIZEN,
                division="ঢাকা",
                district="ঢাকা",
                upazila="ধামরাই",
                password_hash=default_pwd_hash
            )
            db.add(farmer)
        db.commit()

        if db.query(CropMarketPrice).count() == 0:
            prices = [
                CropMarketPrice(crop_name="Aman Paddy", crop_name_bn="আমন ধান", market_name="ধামরাই বাজার", district="ঢাকা", price_bdt_per_mon=1350.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Boro Paddy", crop_name_bn="বোরো ধান", market_name="সাভার হাট", district="ঢাকা", price_bdt_per_mon=1420.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Potato", crop_name_bn="আলু", market_name="শিবগঞ্জ বাজার", district="বগুড়া", price_bdt_per_mon=950.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Onion", crop_name_bn="দেশি পেঁয়াজ", market_name="পাবনা হাট", district="পাবনা", price_bdt_per_mon=2800.0, reported_by_id=officer.id),
                CropMarketPrice(crop_name="Wheat", crop_name_bn="গম", market_name="রংপুর কাস্টম মোড়", district="রংপুর", price_bdt_per_mon=1600.0, reported_by_id=officer.id),
            ]
            db.add_all(prices)
            db.commit()

        if db.query(CropDisease).count() == 0:
            diseases = [
                CropDisease(
                    crop_name_bn="ধান",
                    crop_name_en="Rice",
                    disease_name_bn="ধানের পাতা পোড়া (ব্ল্যাস্ট) রোগ",
                    disease_name_en="Rice Blast Disease",
                    symptoms_bn="পাতায় চোখের মতো বাদামী দাগ পড়ে, দাগের কেন্দ্র ছাই রঙের হয় এবং পরবর্তীতে পুরো পাতা শুকিয়ে যায়।",
                    treatment_bn="ট্রাইসাইক্লাজোল (Tricyclazole) গ্রুপের ছত্রাকনাশক (যেমন: ট্রুপার বা ট্রাইপার) প্রতি লিটার পানিতে ০.৭৫ গ্রাম মিশিয়ে স্প্রে করুন।",
                    prevention_bn="সুষম মাত্রায় নাইট্রোজেন ব্যবহার করা এবং জমিতে পর্যাপ্ত পানি ধরে রাখা।",
                    image_symbol="🍂"
                ),
                CropDisease(
                    crop_name_bn="আলু",
                    crop_name_en="Potato",
                    disease_name_bn="আলুর মড়ক (লেট ব্লাইট) রোগ",
                    disease_name_en="Potato Late Blight",
                    symptoms_bn="পাতায় ভেজা দাগ দেখা যায় এবং সকালের দিকে পাতার নিচে সাদা তুলার মতো ছত্রাক দেখা যায়।",
                    treatment_bn="ম্যানকোজেব + মেটালেক্সিল গ্রুপের ছত্রাকনাশক (যেমন: রিডোমিল গোল্ড) প্রতি লিটার পানিতে ২ গ্রাম মিশিয়ে স্প্রে করুন।",
                    prevention_bn="রোগমুক্ত বীজ ব্যবহার করা এবং কুয়াশাচ্ছন্ন আবহাওয়ায় আগাম স্প্রে করা।",
                    image_symbol="🍃"
                ),
                CropDisease(
                    crop_name_bn="গম",
                    crop_name_en="Wheat",
                    disease_name_bn="গমের ব্লাস্ট রোগ",
                    disease_name_en="Wheat Blast",
                    symptoms_bn="শীষের গোড়া শুকিয়ে যায় এবং পুরো শীষ সাদা হয়ে মরে যায়।",
                    treatment_bn="টেরিবল বা নেটিভো (Nativo) প্রতি লিটার পানিতে ১ গ্রাম মিশিয়ে শেষ বিকেলে স্প্রে করুন।",
                    prevention_bn="আগাম গম বপন করা (১৫ নভেম্বরের মধ্যে)।",
                    image_symbol="🌾"
                )
            ]
            db.add_all(diseases)
            db.commit()

        if db.query(AgriArticle).count() == 0:
            articles = [
                AgriArticle(
                    title_bn="আমন ধানের বাম্পার ফলনে আধুনিক সুষম সার ব্যবস্থাপনা",
                    category="fertilizer",
                    summary_bn="ইউরিয়া, টিএসপি এবং ডিএপি সারের সঠিক প্রয়োগ মাত্রা ও উপরিপ্রয়োগের সময়সূচী।",
                    content_bn="আমন ধান চাষে ফলন বাড়াতে সুষম সার প্রয়োগ অত্যন্ত জরুরি। প্রতি শতকে ইউরিয়া ৮০০ গ্রাম, টিএসপি ৪০০ গ্রাম, ও এমপি ৫০০ গ্রাম প্রযোগ করতে হবে। ইউরিয়া ৩ কিস্তিতে উপরিপ্রয়োগ করুন।",
                    author="কৃষি সম্প্রসারণ অধিদপ্তর"
                ),
                AgriArticle(
                    title_bn="চলতি মৌসুমে ভুট্টা চাষ ও পোকা দমন নির্দেশিকা",
                    category="crop_guide",
                    summary_bn="ফল ফলওয়ার্ম পোকা দমনে কম খরচে সেক্স ফেরোমেন ফান্দ ব্যবহারের কার্যকারিতা।",
                    content_bn="ভুট্টায় ফল ফলওয়ার্ম দমনে জৈব বালাইনাশক এবং ফেরোমেন ফাঁদ ব্যবহার নিশ্চিত করুন। প্রাথমিক অবস্থায় সাবান পানি স্প্রে করেও পোকা দমন করা যায়।",
                    author="বিএআরআই (BARI)"
                )
            ]
            db.add_all(articles)
            db.commit()

        if db.query(TransportRoute).count() == 0:
            route1 = TransportRoute(
                route_code="ROUTE-DHAMRAI-GABTOLI",
                origin_bn="ধামরাই",
                destination_bn="গাবতলী (ঢাকা)",
                distance_km=38.5,
                estimated_duration_minutes=75,
                vehicle_type="bus",
                operator_name_bn="ধামরাই এক্সপ্রেস ও ডি-লিংক",
                fare_bdt=95.0
            )
            route2 = TransportRoute(
                route_code="ROUTE-SAVAR-MANIKGANJ",
                origin_bn="সাভার",
                destination_bn="মানিকগঞ্জ",
                distance_km=42.0,
                estimated_duration_minutes=80,
                vehicle_type="bus",
                operator_name_bn="শুভযাত্রা পরিবহন",
                fare_bdt=110.0
            )
            route3 = TransportRoute(
                route_code="ROUTE-DHAMRAI-SADARGHAT",
                origin_bn="ধামরাই",
                destination_bn="সদরঘাট লঞ্চ টার্মিনাল",
                distance_km=48.0,
                estimated_duration_minutes=95,
                vehicle_type="bus",
                operator_name_bn="পল্লী সার্ভিস",
                fare_bdt=120.0
            )
            db.add_all([route1, route2, route3])
            db.commit()

            schedules = [
                TransportSchedule(route_id=route1.id, departure_time="০৬:৩০ AM", arrival_time="০৭:৪৫ AM", days_of_week="দৈনিক (Daily)"),
                TransportSchedule(route_id=route1.id, departure_time="০৯:০০ AM", arrival_time="১০:১৫ AM", days_of_week="দৈনিক (Daily)"),
                TransportSchedule(route_id=route1.id, departure_time="০২:১৫ PM", arrival_time="০৩:৩০ PM", days_of_week="দৈনিক (Daily)"),
                TransportSchedule(route_id=route2.id, departure_time="০৭:০০ AM", arrival_time="০৮:২০ AM", days_of_week="দৈনিক (Daily)"),
                TransportSchedule(route_id=route2.id, departure_time="১১:৩০ AM", arrival_time="১২:৫০ PM", days_of_week="দৈনিক (Daily)"),
                TransportSchedule(route_id=route3.id, departure_time="০৬:০০ AM", arrival_time="০৭:৩৫ AM", days_of_week="দৈনিক (Daily)")
            ]
            db.add_all(schedules)
            db.commit()

        if db.query(EmergencyContact).count() == 0:
            contacts = [
                EmergencyContact(
                    title_bn="জাতীয় জরুরি সেবা (National Emergency Service)",
                    category="national",
                    phone_number="999",
                    available_hours="২৪/৭ (২৪ ঘণ্টা)",
                    district="জাতীয়",
                    description_bn="পুলিশ, ফায়ার সার্ভিস ও অ্যাম্বুলেন্স জরুরি কলের জন্য বিনামূল্যে টোল-ফ্রি হেল্পলাইন।",
                    icon_symbol="🚨"
                ),
                EmergencyContact(
                    title_bn="জাতীয় তথ্য ও সরকারি সেবা হেল্পলাইন",
                    category="national",
                    phone_number="333",
                    available_hours="২৪/৭ (২৪ ঘণ্টা)",
                    district="জাতীয়",
                    description_bn="সরকারি সেবা, সামাজিক সমস্যা ও তথ্য সহায়তার জন্য জাতীয় কল সেন্টার।",
                    icon_symbol="📞"
                ),
                EmergencyContact(
                    title_bn="কৃষি কল সেন্টার (Agri Call Center)",
                    category="agriculture",
                    phone_number="16123",
                    available_hours="সকাল ৯টা - বিকাল ৫টা",
                    district="জাতীয়",
                    description_bn="কৃষি, মৎস্য ও প্রাণিসম্পদ বিষয়ক সমস্যা সমাধানে সরাসরি কৃষি বিশেষজ্ঞ পরামর্শ।",
                    icon_symbol="🌾"
                ),
                EmergencyContact(
                    title_bn="নারী ও শিশু নির্যাতন প্রতিরোধ হেল্পলাইন",
                    category="women_child",
                    phone_number="109",
                    available_hours="২৪/৭ (২৪ ঘণ্টা)",
                    district="জাতীয়",
                    description_bn="নারী ও শিশুদের জরুরি সুরক্ষা এবং আইনি সহায়তা হেল্পলাইন।",
                    icon_symbol="🛡️"
                ),
                EmergencyContact(
                    title_bn="ধামরাই উপজেলা ফায়ার সার্ভিস ও সিভিল ডিফেন্স",
                    category="fire",
                    phone_number="+8801730002211",
                    available_hours="২৪/৭ (২৪ ঘণ্টা)",
                    district="ঢাকা",
                    description_bn="ধামরাই ও সাভার এলাকার অগ্নিনির্বাপণ ও জরুরি উদ্ধার কাজ।",
                    icon_symbol="🚒"
                ),
                EmergencyContact(
                    title_bn="উপজেলা স্বাস্থ্য কমপ্লেক্স জরুরি অ্যাম্বুলেন্স",
                    category="health",
                    phone_number="+8801711998877",
                    available_hours="২৪/৭ (২৪ ঘণ্টা)",
                    district="ঢাকা",
                    description_bn="ধামরাই উপজেলা স্বাস্থ্য কমপ্লেক্স সরকারি অ্যাম্বুলেন্স সার্ভিস।",
                    icon_symbol="🚑"
                )
            ]
            db.add_all(contacts)
            db.commit()

        if db.query(ForumPost).count() == 0 and farmer:
            posts = [
                ForumPost(
                    user_id=farmer.id,
                    author_name=farmer.full_name,
                    title="আমন ধানের ফলন বৃদ্ধিতে লাল পোকা দমন করার সহজ উপায় কী?",
                    category="কৃষি পরামর্শ",
                    content="আমাদের ধামরাই ব্লকে নতুন ধান গাছে লাল পোকার আক্রমণ দেখা দিয়েছে। জৈব উপায়ে কীভাবে এটি দমন করা সম্ভব?",
                    views_count=42
                ),
                ForumPost(
                    user_id=farmer.id,
                    author_name=farmer.full_name,
                    title="উপজেলা কৃষি অফিস থেকে পাওয়ার টিলার অনুদানের নিয়ম জানতে চাই",
                    category="সাধারণ প্রশ্ন",
                    content="কৃষি যন্ত্রপাতি ৫০% অনুদানে পেতে হলে প্রয়োজনীয় কাগজপত্র ও কৃষক দলের নিয়মসমূহ কি কি?",
                    views_count=18
                )
            ]
            db.add_all(posts)
            db.commit()

        if db.query(TrainingCourse).count() == 0:
            courses = [
                TrainingCourse(
                    title_bn="আধুনিক প্রযুক্তি নির্ভর স্মার্ট ধান চাষাবাদ ও কীটনাশক মুক্ত ফলন",
                    category="ডিজিটাল কৃষি",
                    instructor_bn="ড. মোঃ আহসান হাবীব (প্রধান বৈজ্ঞানিক কর্মকর্তা, BRRI)",
                    duration_hours=6,
                    video_url="https://youtube.com/watch?v=smart_agri_demo",
                    description_bn="ড্রোন দিয়ে সার ছিটানো, সেচ সেন্সর ব্যবহার এবং জৈব বালাইনাশক স্প্রে করার আধুনিক কৃষক প্রশিক্ষণ কোর্স।"
                ),
                TrainingCourse(
                    title_bn="বায়োফ্লক মৎস্য চাষ ও পুকুর ব্যবস্থাপনা অনলাইন গাইড",
                    category="মৎস্য চাষ",
                    instructor_bn="কৃষিবিদ তানভীর আহমেদ",
                    duration_hours=4,
                    video_url="https://youtube.com/watch?v=biofloc_demo",
                    description_bn="কম জমিতে বায়োফ্লক পদ্ধতিতে অধিক মাছ উৎপাদনের বৈজ্ঞানিক গাইডলাইন।"
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
