class LocationLookupService:
    def __init__(self):
        self.location_mapping = {
            "ঢাকা": {"query": "Dhaka", "lat": 23.8103, "lon": 90.4125},
            "চট্টগ্রাম": {"query": "Chittagong", "lat": 22.3569, "lon": 91.7832},
            "সিলেট": {"query": "Sylhet", "lat": 24.8949, "lon": 91.8687},
            "রাজশাহী": {"query": "Rajshahi", "lat": 24.3745, "lon": 88.6042},
            "খুলনা": {"query": "Khulna", "lat": 22.8456, "lon": 89.5403},
            "বরিশাল": {"query": "Barisal", "lat": 22.7010, "lon": 90.3535},
            "রংপুর": {"query": "Rangpur", "lat": 25.7439, "lon": 89.2752},
            "ময়মনসিংহ": {"query": "Mymensingh", "lat": 24.7471, "lon": 90.4203}
        }

    def get_english_query(self, location_name: str) -> str:
        loc = location_name.strip()
        if loc in self.location_mapping:
            return self.location_mapping[loc]["query"]
        return loc
