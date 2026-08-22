import os
import pandas as pd
from django.conf import settings

_CACHED_LOCATIONS = None

def get_location_dataset():
    global _CACHED_LOCATIONS
    if _CACHED_LOCATIONS is not None:
        return _CACHED_LOCATIONS

    excel_path = getattr(settings, 'LOCATION_EXCEL_PATH', r'd:\GlobeTrotter\Location\All_Sub_Districtof_India_2026-08-22_09-30-58.xlsx')
    if not os.path.exists(excel_path):
        _CACHED_LOCATIONS = []
        return _CACHED_LOCATIONS

    try:
        df = pd.read_excel(excel_path, header=1)
        results = []
        for _, row in df.iterrows():
            state_name = str(row.get('State Name', '')).strip()
            district_name = str(row.get('District Name', '')).strip()
            sub_district_name = str(row.get('Sub-district Name', '')).strip()

            if district_name and district_name != 'nan':
                results.append({
                    'name': district_name,
                    'type': 'District',
                    'district': district_name,
                    'state': state_name
                })
            if sub_district_name and sub_district_name != 'nan':
                results.append({
                    'name': sub_district_name,
                    'type': 'Sub-district',
                    'district': district_name,
                    'state': state_name
                })
        
        # Deduplicate
        unique_map = {}
        for item in results:
            key = f"{item['name'].lower()}_{item['district'].lower()}"
            if key not in unique_map:
                unique_map[key] = item

        _CACHED_LOCATIONS = list(unique_map.values())
    except Exception as e:
        print("Error loading Location Excel dataset:", e)
        _CACHED_LOCATIONS = []

    return _CACHED_LOCATIONS

def search_locations(query="", limit=50):
    all_locs = get_location_dataset()
    if not query:
        return all_locs[:limit]
    
    q = query.lower().strip()
    matches = [loc for loc in all_locs if q in loc['name'].lower() or q in loc['district'].lower() or q in loc['state'].lower()]
    return matches[:limit]
