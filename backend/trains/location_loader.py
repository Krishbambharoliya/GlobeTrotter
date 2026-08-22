import os
import pandas as pd
from django.conf import settings

_CACHED_LOCATIONS = None

MAJOR_RAILWAY_STATIONS = [
    {"name": "New Delhi Railway Station (NDLS)", "type": "Railway Station", "district": "New Delhi", "state": "Delhi"},
    {"name": "Chhatrapati Shivaji Maharaj Terminus (CSMT)", "type": "Railway Station", "district": "Mumbai", "state": "Maharashtra"},
    {"name": "Mumbai Central (MMCT)", "type": "Railway Station", "district": "Mumbai", "state": "Maharashtra"},
    {"name": "Howrah Junction (HWH)", "type": "Railway Station", "district": "Kolkata", "state": "West Bengal"},
    {"name": "Sealdah Railway Station (SDAH)", "type": "Railway Station", "district": "Kolkata", "state": "West Bengal"},
    {"name": "KSR Bengaluru City Junction (SBC)", "type": "Railway Station", "district": "Bengaluru", "state": "Karnataka"},
    {"name": "Yashvantpur Junction (YPR)", "type": "Railway Station", "district": "Bengaluru", "state": "Karnataka"},
    {"name": "Chennai Central (MAS)", "type": "Railway Station", "district": "Chennai", "state": "Tamil Nadu"},
    {"name": "Chennai Egmore (MS)", "type": "Railway Station", "district": "Chennai", "state": "Tamil Nadu"},
    {"name": "Ahmedabad Junction (ADI)", "type": "Railway Station", "district": "Ahmedabad", "state": "Gujarat"},
    {"name": "Surat Railway Station (ST)", "type": "Railway Station", "district": "Surat", "state": "Gujarat"},
    {"name": "Vadodara Junction (BRC)", "type": "Railway Station", "district": "Vadodara", "state": "Gujarat"},
    {"name": "Jaipur Junction (JP)", "type": "Railway Station", "district": "Jaipur", "state": "Rajasthan"},
    {"name": "Patna Junction (PNBE)", "type": "Railway Station", "district": "Patna", "state": "Bihar"},
    {"name": "Pune Junction (PUNE)", "type": "Railway Station", "district": "Pune", "state": "Maharashtra"},
    {"name": "Varanasi Junction (BSB)", "type": "Railway Station", "district": "Varanasi", "state": "Uttar Pradesh"},
    {"name": "Lucknow Charbagh (LKO)", "type": "Railway Station", "district": "Lucknow", "state": "Uttar Pradesh"},
    {"name": "Hyderabad Deccan (HYB)", "type": "Railway Station", "district": "Hyderabad", "state": "Telangana"},
    {"name": "Secunderabad Junction (SC)", "type": "Railway Station", "district": "Hyderabad", "state": "Telangana"},
    {"name": "Kanpur Central (CNB)", "type": "Railway Station", "district": "Kanpur", "state": "Uttar Pradesh"},
    {"name": "Gorakhpur Junction (GKP)", "type": "Railway Station", "district": "Gorakhpur", "state": "Uttar Pradesh"},
    {"name": "Agra Cantt (AGC)", "type": "Railway Station", "district": "Agra", "state": "Uttar Pradesh"},
    {"name": "Bhopal Junction (BPL)", "type": "Railway Station", "district": "Bhopal", "state": "Madhya Pradesh"},
    {"name": "Indore Junction (INDB)", "type": "Railway Station", "district": "Indore", "state": "Madhya Pradesh"},
    {"name": "Jammu Tawi (JAT)", "type": "Railway Station", "district": "Jammu", "state": "Jammu and Kashmir"},
    {"name": "Gwalior Junction (GWL)", "type": "Railway Station", "district": "Gwalior", "state": "Madhya Pradesh"},
    {"name": "Ranchi Junction (RNC)", "type": "Railway Station", "district": "Ranchi", "state": "Jharkhand"},
    {"name": "Bhubaneswar Railway Station (BBS)", "type": "Railway Station", "district": "Bhubaneswar", "state": "Odisha"},
    {"name": "Guwahati Railway Station (GHY)", "type": "Railway Station", "district": "Kamrup", "state": "Assam"},
    {"name": "Madgaon Junction (MAO)", "type": "Railway Station", "district": "South Goa", "state": "Goa"},
    {"name": "Coimbatore Junction (CBE)", "type": "Railway Station", "district": "Coimbatore", "state": "Tamil Nadu"},
    {"name": "Thiruvananthapuram Central (TVC)", "type": "Railway Station", "district": "Thiruvananthapuram", "state": "Kerala"},
    {"name": "Ernakulam Junction (ERS)", "type": "Railway Station", "district": "Ernakulam", "state": "Kerala"},
    {"name": "Amritsar Junction (ASR)", "type": "Railway Station", "district": "Amritsar", "state": "Punjab"},
    {"name": "Chandigarh Junction (CDG)", "type": "Railway Station", "district": "Chandigarh", "state": "Chandigarh"},
    {"name": "Dehradun Railway Station (DDN)", "type": "Railway Station", "district": "Dehradun", "state": "Uttarakhand"},
    {"name": "Haridwar Junction (HW)", "type": "Railway Station", "district": "Haridwar", "state": "Uttarakhand"}
]

def get_location_dataset():
    global _CACHED_LOCATIONS
    if _CACHED_LOCATIONS is not None:
        return _CACHED_LOCATIONS

    results = list(MAJOR_RAILWAY_STATIONS)
    excel_path = getattr(settings, 'LOCATION_EXCEL_PATH', r'd:\GlobeTrotter\Location\All_Sub_Districtof_India_2026-08-22_09-30-58.xlsx')

    if os.path.exists(excel_path):
        try:
            df = pd.read_excel(excel_path, header=1)
            for _, row in df.iterrows():
                state_name = str(row.get('State Name', '')).strip()
                district_name = str(row.get('District Name', '')).strip()
                sub_district_name = str(row.get('Sub-district Name', '')).strip()

                if district_name and district_name != 'nan':
                    results.append({
                        'name': f"{district_name} Railway Station",
                        'type': 'District Station',
                        'district': district_name,
                        'state': state_name
                    })
                if sub_district_name and sub_district_name != 'nan':
                    results.append({
                        'name': f"{sub_district_name} Station",
                        'type': 'Sub-district Station',
                        'district': district_name,
                        'state': state_name
                    })
        except Exception as e:
            print("Error loading Location Excel dataset:", e)

    # Deduplicate
    unique_map = {}
    for item in results:
        key = item['name'].lower()
        if key not in unique_map:
            unique_map[key] = item

    _CACHED_LOCATIONS = list(unique_map.values())
    return _CACHED_LOCATIONS

def search_locations(query="", limit=50):
    all_locs = get_location_dataset()
    if not query:
        return all_locs[:limit]
    
    q = query.lower().strip()
    matches = [loc for loc in all_locs if q in loc['name'].lower() or q in loc['district'].lower() or q in loc['state'].lower()]
    return matches[:limit]
