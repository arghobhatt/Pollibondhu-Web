import random
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.orm import User, UtilityBill, Notification
from app.schemas.utility import BillTypeDTO, UtilityPaymentCreateDTO, UtilityBillResponseDTO

class UtilityService:
    def get_bill_types(self) -> List[BillTypeDTO]:
        return [
            BillTypeDTO(
                id="electricity",
                name_bn="পল্লী বিদ্যুৎ বিল",
                name_en="Polli Bidyut Electricity Bill",
                biller_name_bn="বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ড (REB)",
                icon="⚡",
                description_bn="এসএমএস হিসাব নম্বর দিয়ে পল্লী বিদ্যুৎ বিল পরিশোধ করুন।"
            ),
            BillTypeDTO(
                id="water_irrigation",
                name_bn="কৃষি সেচ ও নলকূপ পানি বিল",
                name_en="Irrigation Water Bill",
                biller_name_bn="উপজেলা কৃষি সেচ কমিটি ও বিএমডিএ",
                icon="💧",
                description_bn="গভীর নলকূপ সেচ কমিটি ও কৃষক কার্ড নম্বর দিয়ে পানি বিল পরিশোধ করুন।"
            ),
            BillTypeDTO(
                id="holding_tax",
                name_bn="ইউনিয়ন পরিষদ হোল্ডিং ট্যাক্স",
                name_en="Union Holding Tax",
                biller_name_bn="ধামরাই ইউনিয়ন পরিষদ",
                icon="🏠",
                description_bn="হোল্ডিং নম্বর ও ওয়ার্ড নম্বর দিয়ে বাৎসরিক পৌর/ইউনিয়ন কর প্রদান করুন।"
            ),
            BillTypeDTO(
                id="trade_license",
                name_bn="ইউনিয়ন ট্রেড লাইসেন্স ফি",
                name_en="Trade License Renewal Fee",
                biller_name_bn="ধামরাই ইউনিয়ন পরিষদ",
                icon="📜",
                description_bn="গ্রামীণ ব্যবসায়ী ও ফার্মের লাইসেন্স নবায়ন ফি প্রদান করুন।"
            )
        ]

    def pay_bill(self, db: Session, user: User, req: UtilityPaymentCreateDTO) -> UtilityBillResponseDTO:
        txn_id = f"TXN-2026-{random.randint(100000, 999999)}"
        
        biller_map = {
            "electricity": "বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ড (REB)",
            "water_irrigation": "উপজেলা কৃষি সেচ কমিটি (BMDA)",
            "holding_tax": "ইউনিয়ন পরিষদ হোল্ডিং বিভাগ",
            "trade_license": "ইউনিয়ন ট্রেড লাইসেন্স বিভাগ"
        }
        biller_name = biller_map.get(req.bill_type, "গ্রামীণ সেবা বিভাগ")

        new_bill = UtilityBill(
            transaction_id=txn_id,
            user_id=user.id,
            bill_type=req.bill_type,
            biller_name_bn=biller_name,
            account_number=req.account_number,
            amount_bdt=req.amount_bdt,
            status="Paid"
        )
        db.add(new_bill)
        
        user_notif = Notification(
            user_id=user.id,
            title="ইউটিলিটি বিল পরিশোধ সফল",
            message=f"আপনার {req.amount_bdt} টাকা বিল পরিশোধ সফল হয়েছে। ট্রানজেকশন আইডি: {txn_id}",
            channel="sms",
            is_read=False
        )
        db.add(user_notif)
        db.commit()
        db.refresh(new_bill)

        return UtilityBillResponseDTO.model_validate(new_bill)

    def get_user_bills(self, db: Session, user: User) -> List[UtilityBillResponseDTO]:
        bills = db.query(UtilityBill).filter(UtilityBill.user_id == user.id).order_by(UtilityBill.created_at.desc()).all()
        return [UtilityBillResponseDTO.model_validate(b) for b in bills]

    def get_bill_by_id(self, db: Session, bill_id: int) -> UtilityBillResponseDTO:
        bill = db.query(UtilityBill).filter(UtilityBill.id == bill_id).first()
        if not bill:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill payment record not found")
        return UtilityBillResponseDTO.model_validate(bill)

utility_service = UtilityService()
