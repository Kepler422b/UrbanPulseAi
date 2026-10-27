import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure parent directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import DatabaseManager
from app.core.security import get_password_hash
from app.services.priority_service import calculate_priority_score
from app.services.insight_service import analyze_patterns_and_generate_insights

DEMO_REPORTS = [
    # 1. Garbage Cluster in Silver Park (Deliberate Hotspot)
    {
        "public_report_id": "UP-2026-SP001",
        "category": "garbage_overflow",
        "title": "Severe garbage overflow near Silver Park vegetable market",
        "description": "Commercial waste and organic vegetable market refuse spilling over sidewalk onto the main road. Foul odor and stray cattle obstructing morning traffic.",
        "locality": "Silver Park",
        "approximate_address": "Near Silver Park Market Junction, Mira Road",
        "latitude": 19.2882,
        "longitude": 72.8643,
        "severity": "high",
        "status": "reported",
        "assigned_to": None,
        "days_ago": 2,
    },
    {
        "public_report_id": "UP-2026-SP002",
        "category": "garbage_overflow",
        "title": "Overfilled dumper bin at Silver Park Sector 3",
        "description": "Secondary waste bin has not been cleared for over 48 hours. Plastic bags and dry packaging scattered across pedestrian pavement.",
        "locality": "Silver Park",
        "approximate_address": "Behind Holy Cross Convent, Silver Park",
        "latitude": 19.2890,
        "longitude": 72.8638,
        "severity": "medium",
        "status": "in_progress",
        "assigned_to": "Sanitation Beat Team 4",
        "days_ago": 3,
    },
    {
        "public_report_id": "UP-2026-SP003",
        "category": "garbage_overflow",
        "title": "Illegal construction debris dumped along roadside",
        "description": "Bricks, plaster sacks, and demolition rubble dumped overnight adjacent to the stormwater drain.",
        "locality": "Silver Park",
        "approximate_address": "Opposite Silver Park Bus Stop",
        "latitude": 19.2875,
        "longitude": 72.8650,
        "severity": "high",
        "status": "reported",
        "assigned_to": None,
        "days_ago": 1,
    },
    {
        "public_report_id": "UP-2026-SP004",
        "category": "garbage_overflow",
        "title": "Overflowing waste bin attracting stray dogs",
        "description": "Community bin near residential complex gate overflowing. Waste needs immediate mechanized clearing.",
        "locality": "Silver Park",
        "approximate_address": "Wing B, Regency Enclave, Silver Park",
        "latitude": 19.2885,
        "longitude": 72.8640,
        "severity": "medium",
        "status": "reported",
        "days_ago": 0.5,
    },

    # 2. Potholes & Damaged Roads in Kanakia Park (Deliberate Road Cluster)
    {
        "public_report_id": "UP-2026-KP001",
        "category": "potholes_damaged_roads",
        "title": "Deep asphalt crater on Kanakia main boulevard",
        "description": "Approx 3-foot wide, 6-inch deep pothole causing two-wheeler skids. Exposed gravel and uneven trenching from recent utility pipeline digging.",
        "locality": "Kanakia Park",
        "approximate_address": "Near Cineworld Junction, Kanakia Road",
        "latitude": 19.2864,
        "longitude": 72.8688,
        "severity": "critical",
        "status": "in_progress",
        "assigned_to": "Ward 3 PWD Asphalt Crew",
        "days_ago": 4,
    },
    {
        "public_report_id": "UP-2026-KP002",
        "category": "potholes_damaged_roads",
        "title": "Sunken road surface near school bus boarding bay",
        "description": "Road surface depressed by several inches near RBK School gate. Rainwater accumulates creating hazardous driving conditions.",
        "locality": "Kanakia Park",
        "approximate_address": "Near RBK International Academy, Kanakia",
        "latitude": 19.2858,
        "longitude": 72.8695,
        "severity": "high",
        "status": "reported",
        "assigned_to": None,
        "days_ago": 2,
    },
    {
        "public_report_id": "UP-2026-KP003",
        "category": "potholes_damaged_roads",
        "title": "Continuous longitudinal road crack and surface peel",
        "description": "Top layer of tar washed away over a 50-meter stretch following pipeline repair works.",
        "locality": "Kanakia Park",
        "approximate_address": "Kanakia Police Chowki Lane",
        "latitude": 19.2870,
        "longitude": 72.8680,
        "severity": "medium",
        "status": "reported",
        "assigned_to": None,
        "days_ago": 1,
    },

    # 3. Broken Streetlights in Bhayandar West (Prolonged outage cluster)
    {
        "public_report_id": "UP-2026-BW001",
        "category": "broken_streetlights",
        "title": "Entire stretch of streetlights dark on Station Road",
        "description": "Six consecutive LED streetlights out of commission from railway ticket counter towards market circle. Complete corridor blackout after 7:30 PM.",
        "locality": "Bhayandar West",
        "approximate_address": "Station Approach Road, Bhayandar West",
        "latitude": 19.3082,
        "longitude": 72.8465,
        "severity": "high",
        "status": "reported",
        "assigned_to": "Electrical Maintenance Division",
        "days_ago": 5,  # >72 hours, triggers prolonged outage alert
    },
    {
        "public_report_id": "UP-2026-BW002",
        "category": "broken_streetlights",
        "title": "Flickering high-mast lamp pole near vegetable market",
        "description": "High mast sodium lamp continually cycles on and off every few seconds, causing extreme strobe glare.",
        "locality": "Bhayandar West",
        "approximate_address": "Vegetable Market Square, Bhayandar West",
        "latitude": 19.3090,
        "longitude": 72.8458,
        "severity": "medium",
        "status": "reported",
        "assigned_to": None,
        "days_ago": 4,  # >72 hours
    },

    # 4. Poonam Sagar Complex
    {
        "public_report_id": "UP-2026-PS001",
        "category": "garbage_overflow",
        "title": "Accumulated wet waste behind Poonam Sagar shopping center",
        "description": "Community bin lid damaged and refuse scattered by scavengers across the alleyway.",
        "locality": "Poonam Sagar",
        "approximate_address": "Cluster D Lane, Poonam Sagar Complex",
        "latitude": 19.2891,
        "longitude": 72.8611,
        "severity": "medium",
        "status": "resolved",
        "assigned_to": "Sanitation Beat Team 2",
        "days_ago": 6,
        "resolved_days_ago": 1,
        "resolution_notes": "Mechanized dumper cleared 2.4 tons of mixed waste. Fresh bin lid installed and surrounding area treated with bleaching powder.",
    },
    {
        "public_report_id": "UP-2026-PS002",
        "category": "potholes_damaged_roads",
        "title": "Hazardous road edge erosion near Poonam Sagar roundabout",
        "description": "Edge of road degraded next to open stormwater gutter. Vehicles forced to swerve into oncoming lane.",
        "locality": "Poonam Sagar",
        "approximate_address": "Circle near Sagar Sweets, Poonam Sagar",
        "latitude": 19.2898,
        "longitude": 72.8619,
        "severity": "high",
        "status": "in_progress",
        "assigned_to": "Ward 2 Road Repair Gang",
        "days_ago": 3,
    },

    # 5. Shanti Nagar
    {
        "public_report_id": "UP-2026-SN001",
        "category": "broken_streetlights",
        "title": "Damaged streetlight pole leaning dangerously after vehicle impact",
        "description": "Streetlight pole bent at a 30-degree angle with exposed wire harness near base. Immediate electrocution and structural hazard.",
        "locality": "Shanti Nagar",
        "approximate_address": "Sector 4, Shanti Nagar Road",
        "latitude": 19.2845,
        "longitude": 72.8612,
        "severity": "critical",
        "status": "resolved",
        "assigned_to": "Emergency Response Line Unit",
        "days_ago": 8,
        "resolved_days_ago": 7,
        "resolution_notes": "Damaged pole safely disconnected and removed. Replacement galvanized steel tubular pole installed with 70W LED fixture.",
    },
    {
        "public_report_id": "UP-2026-SN002",
        "category": "potholes_damaged_roads",
        "title": "Multiple small potholes opposite community garden",
        "description": "Clusters of shallow potholes slowing traffic near pedestrian walkway.",
        "locality": "Shanti Nagar",
        "approximate_address": "Opposite Shanti Nagar Park Gate 2",
        "latitude": 19.2852,
        "longitude": 72.8605,
        "severity": "low",
        "status": "reported",
        "days_ago": 1.5,
    },

    # 6. Kashimira & Highway Junction
    {
        "public_report_id": "UP-2026-KM001",
        "category": "potholes_damaged_roads",
        "title": "Heavy cratering at Kashimira Flyover underpass",
        "description": "Large road degradation where Western Express Highway meets local arterial road. Heavy container trucks causing severe vibration and axle damage.",
        "locality": "Kashimira",
        "approximate_address": "Under Kashimira Flyover, WEH Junction",
        "latitude": 19.2785,
        "longitude": 72.8715,
        "severity": "critical",
        "status": "in_progress",
        "assigned_to": "PWD Highway Maintenance Cell",
        "days_ago": 4,
    },
    {
        "public_report_id": "UP-2026-KM002",
        "category": "garbage_overflow",
        "title": "Commercial packing cartons abandoned on highway slip lane",
        "description": "Industrial corrugated boxes and plastic strap bands dumped on highway service road.",
        "locality": "Kashimira",
        "approximate_address": "Service Road near Hotel Express Inn, Kashimira",
        "latitude": 19.2770,
        "longitude": 72.8725,
        "severity": "medium",
        "status": "resolved",
        "assigned_to": "Sanitation Beat Team 5",
        "days_ago": 10,
        "resolved_days_ago": 8,
        "resolution_notes": "Litter seized and cleared via secondary collection truck. Warning notice issued to adjacent commercial godowns.",
    },

    # 7. Deepak Hospital Area & Golden Nest
    {
        "public_report_id": "UP-2026-GN001",
        "category": "broken_streetlights",
        "title": "Dark pedestrian crossing near Deepak Hospital Junction",
        "description": "Overhead street lamp failed right above ambulance entry lane and zebra crossing. Hospital visitors crossing in poor visibility.",
        "locality": "Deepak Hospital Area",
        "approximate_address": "Emergency Gate, Deepak Hospital Road",
        "latitude": 19.2920,
        "longitude": 72.8580,
        "severity": "high",
        "status": "in_progress",
        "assigned_to": "Ward 4 Electrical Crew",
        "days_ago": 2,
    },
    {
        "public_report_id": "UP-2026-GN002",
        "category": "potholes_damaged_roads",
        "title": "Paver blocks loosened and jutting out at Golden Nest Circle",
        "description": "Interlocking paver blocks displaced after heavy commercial bus turning movement. Loose stones flying when wheels pass over.",
        "locality": "Golden Nest",
        "approximate_address": "Golden Nest Circle, Mira Bhayandar Main Road",
        "latitude": 19.2985,
        "longitude": 72.8560,
        "severity": "high",
        "status": "reported",
        "days_ago": 1,
    },

    # 8. Bhayandar East (Cabin Road & Navghar)
    {
        "public_report_id": "UP-2026-BE001",
        "category": "garbage_overflow",
        "title": "Refuse container overflowing onto railway boundary wall",
        "description": "Garbage heap accumulating against railway perimeter fence. Waste collection vehicle missing scheduled morning collection.",
        "locality": "Bhayandar East",
        "approximate_address": "Cabin Road, Near East Railway Footbridge",
        "latitude": 19.3110,
        "longitude": 72.8590,
        "severity": "medium",
        "status": "reported",
        "days_ago": 2,
    },
    {
        "public_report_id": "UP-2026-BE002",
        "category": "broken_streetlights",
        "title": "Blown capacitor causing continuous hum and dead bulb",
        "description": "Lamp post buzzing loudly with non-functioning luminaire near auto stand.",
        "locality": "Bhayandar East",
        "approximate_address": "Navghar Road Auto Stand, Bhayandar East",
        "latitude": 19.3125,
        "longitude": 72.8605,
        "severity": "low",
        "status": "resolved",
        "assigned_to": "Ward 1 Electrical Services",
        "days_ago": 12,
        "resolved_days_ago": 11,
        "resolution_notes": "Choke and starter capacitor replaced. 45W LED luminaire tested and functioning normally.",
    },

    # 9. Maxus Mall / 150ft Road
    {
        "public_report_id": "UP-2026-MM001",
        "category": "potholes_damaged_roads",
        "title": "Wide asphalt surface depression near Maxus Mall signal",
        "description": "Road depression across both lanes causing severe braking and evening bumper-to-bumper congestion.",
        "locality": "Maxus Mall Area",
        "approximate_address": "150 Feet Road, opposite Maxus Mall",
        "latitude": 19.3015,
        "longitude": 72.8510,
        "severity": "medium",
        "status": "in_progress",
        "assigned_to": "Road Maintenance Gang B",
        "days_ago": 3,
    },

    # 10. Jesal Park & Uttan Road
    {
        "public_report_id": "UP-2026-JP001",
        "category": "broken_streetlights",
        "title": "Promenade streetlight pole fixture unshielded",
        "description": "Waterfront walkway lighting out for three poles along the creek embankment.",
        "locality": "Jesal Park",
        "approximate_address": "Jesal Park Chowpatty Promenade",
        "latitude": 19.3040,
        "longitude": 72.8420,
        "severity": "medium",
        "status": "reported",
        "days_ago": 1.5,
    },
    {
        "public_report_id": "UP-2026-UR001",
        "category": "potholes_damaged_roads",
        "title": "Deep trench on Uttan coastal road curve",
        "description": "Sharp hairpin turn road edge crumbling down coastal slope. Needs immediate guardrail check and asphalt rebuilding.",
        "locality": "Uttan Road",
        "approximate_address": "Near Uttan Lighthouse Turnoff",
        "latitude": 19.2800,
        "longitude": 72.8050,
        "severity": "critical",
        "status": "reported",
        "days_ago": 2.5,
    },
]

def seed_database():
    db = DatabaseManager.get_db()
    now = datetime.now(timezone.utc)

    # 1. Clear existing demo records
    db.users.delete_many({})
    db.reports.delete_many({})
    db.status_history.delete_many({})
    db.internal_notes.delete_many({})
    db.insights.delete_many({})

    # 2. Insert Demo Admin
    admin_doc = {
        "name": "Operations Supervisor (Demo)",
        "email": "admin@urbanpulse.ai",
        "password_hash": get_password_hash("AdminPassword123!"),
        "role": "admin",
        "created_at": now - timedelta(days=30),
        "updated_at": now,
    }
    admin_res = db.users.insert_one(admin_doc)
    admin_id = str(admin_res.inserted_id)

    # 3. Insert Demo Citizens
    citizen1_doc = {
        "name": "Rohan Sharma",
        "email": "citizen@example.com",
        "password_hash": get_password_hash("CitizenPassword123!"),
        "role": "citizen",
        "created_at": now - timedelta(days=20),
        "updated_at": now,
    }
    c1_res = db.users.insert_one(citizen1_doc)
    citizen1_id = str(c1_res.inserted_id)

    citizen2_doc = {
        "name": "Priya Patel",
        "email": "priya.patel@example.com",
        "password_hash": get_password_hash("CitizenPassword123!"),
        "role": "citizen",
        "created_at": now - timedelta(days=15),
        "updated_at": now,
    }
    c2_res = db.users.insert_one(citizen2_doc)
    citizen2_id = str(c2_res.inserted_id)

    citizen_ids = [citizen1_id, citizen2_id]
    citizen_names = ["Rohan Sharma", "Priya Patel"]

    # 4. Insert Reports with calculated priorities and audit history
    for idx, item in enumerate(DEMO_REPORTS):
        days_ago = item.get("days_ago", 1.0)
        c_at = now - timedelta(days=days_ago)
        
        status = item.get("status", "reported")
        resolved_at = None
        if status == "resolved":
            res_days = item.get("resolved_days_ago", 0.5)
            resolved_at = now - timedelta(days=res_days)

        u_id = citizen_ids[idx % len(citizen_ids)]
        u_name = citizen_names[idx % len(citizen_names)]

        # Recurrence simulation for the locality
        loc = item["locality"]
        sim_count = sum(1 for r in DEMO_REPORTS if r["locality"] == loc and r["category"] == item["category"])

        prio_factors = calculate_priority_score(
            severity=item["severity"],
            created_at=c_at,
            similar_recent_count=sim_count,
            locality_name=loc,
            is_resolved=(status == "resolved"),
        )

        doc = {
            "public_report_id": item["public_report_id"],
            "user_id": u_id,
            "reporter_name": u_name,
            "category": item["category"],
            "title": item["title"],
            "description": item["description"],
            "locality": item["locality"],
            "approximate_address": item["approximate_address"],
            "latitude": item.get("latitude"),
            "longitude": item.get("longitude"),
            "severity": item["severity"],
            "priority_score": prio_factors.total_score,
            "priority_level": prio_factors.priority_level,
            "priority_factors": prio_factors.model_dump(),
            "status": status,
            "assigned_to": item.get("assigned_to"),
            "image_url": None,
            "resolution_notes": item.get("resolution_notes"),
            "duplicate_of": None,
            "created_at": c_at,
            "updated_at": resolved_at or c_at,
            "resolved_at": resolved_at,
        }
        db.reports.insert_one(doc)

        # Insert Status History
        db.status_history.insert_one({
            "report_id": item["public_report_id"],
            "old_status": None,
            "new_status": "reported",
            "changed_by_name": u_name,
            "timestamp": c_at,
            "reason": "Report submitted via citizen portal",
        })

        if item.get("assigned_to"):
            assign_time = c_at + timedelta(hours=4)
            db.status_history.insert_one({
                "report_id": item["public_report_id"],
                "old_status": "reported",
                "new_status": "in_progress",
                "changed_by_name": "Operations Supervisor (Demo)",
                "timestamp": assign_time,
                "reason": f"Dispatched work order to {item['assigned_to']}",
            })
            # Add an internal note
            db.internal_notes.insert_one({
                "report_id": item["public_report_id"],
                "admin_name": "Operations Supervisor (Demo)",
                "note": f"Work ticket generated and synced with {item['assigned_to']}. Priority verified.",
                "created_at": assign_time,
            })

        if status == "resolved" and resolved_at:
            db.status_history.insert_one({
                "report_id": item["public_report_id"],
                "old_status": "in_progress" if item.get("assigned_to") else "reported",
                "new_status": "resolved",
                "changed_by_name": "Operations Supervisor (Demo)",
                "timestamp": resolved_at,
                "reason": item.get("resolution_notes", "Resolved on site"),
            })

    # 5. Run pattern detection to seed initial AI insights
    insights = analyze_patterns_and_generate_insights()
    print(f"Successfully seeded database: 1 Admin, 2 Citizens, {len(DEMO_REPORTS)} Reports, {len(insights)} Operational Insights.")

if __name__ == "__main__":
    seed_database()
