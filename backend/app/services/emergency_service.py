from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.orm import EmergencyContact
from app.schemas.emergency import EmergencyContactDTO, EmergencyCategoryDTO

class EmergencyService:
    def get_categories(self) -> List[EmergencyCategoryDTO]:
        return [
            EmergencyCategoryDTO(id="all", name_bn="সকল জরুরি সেবা", icon="🚨"),
            EmergencyCategoryDTO(id="national", name_bn="জাতীয় হেল্পলাইন", icon="📞"),
            EmergencyCategoryDTO(id="agriculture", name_bn="কৃষি হেল্পলাইন", icon="🌾"),
            EmergencyCategoryDTO(id="fire", name_bn="ফায়ার সার্ভিস", icon="🚒"),
            EmergencyCategoryDTO(id="health", name_bn="স্বাস্থ্য ও অ্যাম্বুলেন্স", icon="🚑"),
            EmergencyCategoryDTO(id="women_child", name_bn="নারী ও শিশু সুরক্ষা", icon="🛡️")
        ]

    def get_contacts(
        self,
        db: Session,
        category: Optional[str] = None,
        district: Optional[str] = None
    ) -> List[EmergencyContactDTO]:
        query = db.query(EmergencyContact)

        if category and category.strip() and category.strip() != "all":
            query = query.filter(EmergencyContact.category == category.strip())
        if district and district.strip():
            query = query.filter(
                (EmergencyContact.district == "জাতীয়") |
                (EmergencyContact.district.ilike(f"%{district.strip()}%"))
            )

        contacts = query.order_by(EmergencyContact.id.asc()).all()
        return [EmergencyContactDTO.model_validate(c) for c in contacts]

emergency_service = EmergencyService()
