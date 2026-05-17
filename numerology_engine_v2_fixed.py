

class RealLoShuEngine:
    def __init__(self):
        # Chaldean Numerology mapping for letter values
        self.chaldean_map = {
            'A': 1, 'I': 1, 'J': 1, 'Q': 1, 'Y': 1,
            'B': 2, 'K': 2, 'R': 2,
            'C': 3, 'G': 3, 'L': 3, 'S': 3,
            'D': 4, 'M': 4, 'T': 4,
            'E': 5, 'H': 5, 'N': 5, 'X': 5,
            'U': 6, 'V': 6, 'W': 6,
            'O': 7, 'Z': 7,
            'F': 8, 'P': 8
        }

    def reduce_num(self, n):
        """Reduces a number to a single digit (1-9), preserving the essence."""
        while n > 9:
            n = sum(int(d) for d in str(n))
        return n

    def get_chaldean_total(self, name_str):
        """Calculates the total compound value of a name string."""
        return sum(self.chaldean_map[char] for char in name_str.upper() if char in self.chaldean_map)

    def generate_spelling_suggestions(self, name_str, driver, conductor):
        """Suggests spelling modifications to harmonize with Driver/Conductor numbers."""
        clean_name = "".join(c for c in name_str.upper() if c.isalpha())
        if not clean_name:
            return []
            
        test_modifications = ["", "A", "I", "E", "N", "S", "R"]
        suggestions = []
        seen_totals = set()

        for mod in test_modifications:
            test_name = clean_name + mod
            c_total = self.get_chaldean_total(test_name)
            dest_num = self.reduce_num(c_total)
            
            if dest_num in seen_totals: 
                continue
            seen_totals.add(dest_num)

            # Scoring Logic: 1, 5, 6 are generally auspicious; matching D/C is high harmony
            if dest_num in [1, 5, 6]:
                harmony = 95 if dest_num == 5 else 90
                strengths = "Brings exceptional business growth potential and shields against financial leakage."
            elif dest_num == driver or dest_num == conductor:
                harmony = 85
                strengths = "Resonates symmetrically with native timeline nodes, amplifying organic luck."
            else:
                harmony = 65
                strengths = "Functional baseline for localized community management and routine operations."

            suggestions.append({
                "spelling": test_name.title(), 
                "total": c_total, 
                "destiny": dest_num, 
                "harmony": harmony, 
                "strengths": strengths
            })
            
        return sorted(suggestions, key=lambda x: x['harmony'], reverse=True)[:3]

    def analyze(self, dob_str, name_str):
        """Main analysis engine for DOB and Name relationship."""
        clean_dob = "".join(c for c in dob_str if c.isdigit())
        if len(clean_dob) != 8: 
            return "Invalid DOB. Use DDMMYYYY format."

        # Core Calculations
        day = int(clean_dob[0:2])
        driver = self.reduce_num(day)
        conductor = self.reduce_num(sum(int(d) for d in clean_dob))
        
        name_compound = self.get_chaldean_total(name_str)
        destiny = self.reduce_num(name_compound)

        # Lo Shu Grid Logic
        raw_counts = {i: "" for i in range(1, 10)}
        for digit_char in clean_dob:
            d = int(digit_char)
            if d in raw_counts: 
                raw_counts[d] += str(d)
        
        present_numbers = [n for n in raw_counts if len(raw_counts[n]) > 0]
        
        # Grid Planes Analysis
        planes_def = {
            "Mental Plane (4-9-2)": [4, 9, 2], 
            "Emotional Plane (3-5-7)": [3, 5, 7], 
            "Practical Plane (8-1-6)": [8, 1, 6],
            "Planning Axis (4-3-8)": [4, 3, 8], 
            "Willpower Axis (9-5-1)": [9, 5, 1], 
            "Activity Axis (2-7-6)": [2, 7, 6]
        }
        active_planes = {}
        for p_name, p_nums in planes_def.items():
            match_count = sum(1 for num in p_nums if num in present_numbers)
            status = "Fully Realized" if match_count == 3 else "Partially Active" if match_count > 0 else "Missing"
            active_planes[p_name] = status

        # Detailed Explanations
        driver_desc = {
            1: "Owned by the Sun. Highly independent mindset and fierce leadership.",
            2: "Ruled by the Moon. Deep emotional intelligence and sharp intuition.",
            3: "Governed by Jupiter. Supreme knowledge, wisdom, and structured discipline.",
            4: "Governed by Rahu. Unique analytical processing and unconventional thinking.",
            5: "Ruled by Mercury. Ultimate business and communication cluster.",
            6: "Ruled by Venus. Planet of luxury, art, and relational loyalty.",
            7: "Governed by Ketu. Highly spiritual, research-driven, and mystical.",
            8: "Ruled by Saturn. Destiny, labor, and heavy material execution.",
            9: "Ruled by Mars. Energy of a true humanitarian warrior."
        }

        # Structure final data
        return {
            "core": {"driver": driver, "conductor": conductor, "destiny": destiny},
            "driver_explanation": driver_desc.get(driver),
            "planes": active_planes,
            "grid": [
                [raw_counts[4] or ".", raw_counts[9] or ".", raw_counts[2] or "."],
                [raw_counts[3] or ".", raw_counts[5] or ".", raw_counts[7] or "."],
                [raw_counts[8] or ".", raw_counts[1] or ".", raw_counts[6] or "."]
            ],
            "suggestions": self.generate_spelling_suggestions(name_str, driver, conductor)
        }

# --- Usage Example ---
engine = RealLoShuEngine()
report = engine.analyze("15051990", "John Doe")

print(f"--- Numerology Report ---")
print(f"Driver: {report['core']['driver']} | Conductor: {report['core']['conductor']}")
print(f"Personality: {report['driver_explanation']}")
print("\nLo Shu Grid:")
for row in report['grid']:
    print(row)
def analyze_advanced(self, dob_str, name_str, test_name_str=""):
        # 1. INITIALIZATION & CORE REDUCTION
        clean_dob = "".join(c for c in dob_str if c.isdigit())
        if len(clean_dob) != 8: return {"error": "Invalid DOB format. Use DDMMYYYY."}
        
        day = int(clean_dob[0:2])
        driver = self.reduce_num(day)
        conductor = self.reduce_num(sum(int(d) for d in clean_dob))
        
        name_compound = self.get_chaldean_total(name_str)
        destiny = self.reduce_num(name_compound)
        
        # Check if current name is already in harmony
        is_name_correct = destiny in [1, 5, 6] or destiny == driver or destiny == conductor

        # 2. GRID POPULATION
        raw_counts = {i: "" for i in range(1, 10)}
        for digit_char in clean_dob:
            d = int(digit_char)
            if d in raw_counts: raw_counts[d] += str(d)
            
        present_numbers = [n for n in raw_counts if len(raw_counts[n]) > 0]
        missing_numbers = [n for n in range(1, 10) if n not in present_numbers]
        repeated_numbers = [f"{n} (x{len(raw_counts[n])})" for n in present_numbers if len(raw_counts[n]) > 1]

        # 3. PLANE ANALYSIS
        planes_def = {
            "Mental Plane (4-9-2)": [4, 9, 2], "Emotional Plane (3-5-7)": [3, 5, 7], 
            "Practical Plane (8-1-6)": [8, 1, 6], "Planning Axis (4-3-8)": [4, 3, 8], 
            "Willpower Axis (9-5-1)": [9, 5, 1], "Activity Axis (2-7-6)": [2, 7, 6],
            "Spirituality Axis (4-5-6)": [4, 5, 6], "Determination Axis (2-5-8)": [2, 5, 8]
        }
        active_planes = {}
        for p_name, p_nums in planes_def.items():
            match_count = sum(1 for num in p_nums if num in present_numbers)
            status = "Fully Realized" if match_count == 3 else "Completely Empty" if match_count == 0 else "Partially Active"
            active_planes[p_name] = {"score": match_count, "status": status}

        # 4. CAREER RANKINGS LOGIC
        career_scores = {
            "Business & Enterprise": 50, "Engineering & Tech": 50, 
            "Education & Strategy": 50, "Research & Occult Sciences": 50, 
            "Creative Arts & Hospitality": 50, "Governance & Administration": 50
        }
        for core_num in [driver, conductor]:
            if core_num == 1: 
                career_scores["Business & Enterprise"] += 20
                career_scores["Governance & Administration"] += 25
            elif core_num == 2: 
                career_scores["Education & Strategy"] += 15
                career_scores["Creative Arts & Hospitality"] += 20
            elif core_num == 3: career_scores["Education & Strategy"] += 30
            elif core_num == 4: career_scores["Engineering & Tech"] += 30
            elif core_num == 5: career_scores["Business & Enterprise"] += 35
            elif core_num == 6: career_scores["Creative Arts & Hospitality"] += 30
            elif core_num == 7: career_scores["Research & Occult Sciences"] += 35
            elif core_num == 8: career_scores["Governance & Administration"] += 25
            elif core_num == 9: career_scores["Governance & Administration"] += 20

        if active_planes["Mental Plane (4-9-2)"]["score"] == 3: career_scores["Research & Occult Sciences"] += 20
        if active_planes["Practical Plane (8-1-6)"]["score"] == 3: career_scores["Business & Enterprise"] += 20
        ranked_careers = sorted(career_scores.items(), key=lambda x: x[1], reverse=True)

        # 5. CAPACITY METRICS & REMEDIES
        c_confidence = min(100, 60 + (sum(1 for x in [1, 5, 8] if x in present_numbers) * 12))
        r_stability = min(100, 55 + (sum(1 for x in [2, 5, 6] if x in present_numbers) * 15))
        f_strength = min(100, 50 + (sum(1 for x in [5, 6, 8] if x in present_numbers) * 15))
        e_balance = min(100, 50 + (sum(1 for x in [3, 5, 7] if x in present_numbers) * 15))
        l_capacity = min(100, 55 + (sum(1 for x in [1, 9, 4] if x in present_numbers) * 15))
        
        compat_match = {1: "5, 3, 6", 2: "7, 1, 8", 3: "1, 5, 9", 4: "7, 1, 6", 
                        5: "1, 6, 3", 6: "5, 1, 4", 7: "2, 4, 9", 8: "2, 5, 6", 9: "3, 7, 1"}.get(driver, "1, 5, 6")

        remedies = []
        if 5 in missing_numbers:
            remedies.append("Behavioral: Use structured planners. Avoid multi-tasking loops.")
            remedies.append("Crystal: Keep green aventurine near your workspace.")
        if 6 in missing_numbers:
            remedies.append("Relational: Dedicate Fridays to family security/harmony.")
            remedies.append("Environmental: Use premium fragrances or carry a silver coin.")
        if 4 in missing_numbers:
            remedies.append("Discipline: Build strict checklists before launching new projects.")
        if not remedies: 
            remedies.append("Daily Blueprint: 10 mins silent breathing facing East.")

        # 6. TIME-VALUED FORECASTING (2026)
        personal_year = self.reduce_num(driver + conductor + 2026)
        year_text_map = {
            1: "Launch Phase: Ideal for brand identity and independence.",
            2: "Configuration: Focus on networking and contracts.",
            3: "Expansion: Great for creative production and marketing.",
            4: "Foundation: Track assets and organize system backbones.",
            5: "Progress: Rapid shifts and digital project growth.",
            6: "Lifestyle: Luxury upgrades and domestic harmony.",
            7: "Analysis: Skills mastery and inner cleansing.",
            8: "Harvest: Peak cycle for closing deals and wealth.",
            9: "Closure: Clear background clutter for the next cycle."
        }
        
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        monthly_trends = []
        for idx, m_name in enumerate(months):
            m_num = self.reduce_num(personal_year + (idx + 1))
            tag = "Launch Pivot" if m_num in [1, 5] else "Wealth Boost" if m_num == 6 else "System Audit" if m_num in [4, 7] else "Stability"
            monthly_trends.append({"name": m_name, "num": m_num, "text": tag})
import os
from flask import Flask, request, render_template_string

app = Flask(__name__)

class RealLoShuEngine:
    def __init__(self):
        # Chaldean Numerology Chart
        self.chaldean_map = {
            'A': 1, 'I': 1, 'J': 1, 'Q': 1, 'Y': 1,
            'B': 2, 'K': 2, 'R': 2,
            'C': 3, 'G': 3, 'L': 3, 'S': 3,
            'D': 4, 'M': 4, 'T': 4,
            'E': 5, 'H': 5, 'N': 5, 'X': 5,
            'U': 6, 'V': 6, 'W': 6,
            'O': 7, 'Z': 7,
            'F': 8, 'P': 8
        }

    def reduce_num(self, n):
        """Reduces any number to a single digit 1-9."""
        while n > 9:
            n = sum(int(d) for d in str(n))
        return n if n > 0 else 0

    def get_chaldean_total(self, name_str):
        """Calculates the compound Chaldean value of a name."""
        return sum(self.chaldean_map[char] for char in name_str.upper() if char in self.chaldean_map)

    def generate_spelling_suggestions(self, name_str, driver, conductor):
        """Suggests name modifications to achieve harmony with birth numbers."""
        clean_name = "".join(c for c in name_str.upper() if c.isalpha())
        if not clean_name: return []
        
        test_mods = ["", "A", "I", "E", "N", "S", "H"]
        suggestions = []
        seen_destinies = set()

        for mod in test_mods:
            test_name = clean_name + mod
            total = self.get_chaldean_total(test_name)
            destiny = self.reduce_num(total)
            
            if destiny in seen_destinies: continue
            seen_destinies.add(destiny)

            if destiny in [1, 5, 6]:
                harmony = 95 if destiny == 5 else 92
                strength = "Shields wealth leakage and accelerates commercial growth."
            elif destiny == driver or destiny == conductor:
                harmony = 88
                strength = "Syncs with birth vibration for organic identity recognition."
            else:
                harmony = 70
                strength = "Functional baseline; stabilizes routine operations."

            suggestions.append({
                "spelling": test_name.title(),
                "total": total,
                "destiny": destiny,
                "harmony": harmony,
                "strengths": strength
            })
        return sorted(suggestions, key=lambda x: x['harmony'], reverse=True)[:3]

    def analyze(self, dob_str, name_str, test_name_str=""):
        """Main analysis engine processing DOB and Name vibrations."""
        clean_dob = "".join(c for c in dob_str if c.isdigit())
        if len(clean_dob) != 8: return None

        # 1. Core Calculations
        day = int(clean_dob[0:2])
        driver = self.reduce_num(day)
        conductor = self.reduce_num(sum(int(d) for d in clean_dob))
        
        name_compound = self.get_chaldean_total(name_str)
        destiny = self.reduce_num(name_compound)
        
        # 2. Traditional Lo Shu Grid Population (Strict DOB only)
        grid_map = {4: "", 9: "", 2: "", 3: "", 5: "", 7: "", 8: "", 1: "", 6: ""}
        for digit in clean_dob:
            d = int(digit)
            if d in grid_map:
                grid_map[d] += str(d)
        
        present_numbers = [n for n in sorted(grid_map.keys()) if grid_map[n] != ""]
        missing_numbers = [n for n in range(1, 10) if n not in present_numbers]
        repeated_numbers = [f"{n} (x{len(grid_map[n])})" for n in present_numbers if len(grid_map[n]) > 1]

        # 3. Plane Alignment Logic
        planes_def = {
            "Mental Plane (4-9-2)": [4, 9, 2], "Emotional Plane (3-5-7)": [3, 5, 7], 
            "Practical Plane (8-1-6)": [8, 1, 6], "Planning Axis (4-3-8)": [4, 3, 8], 
            "Willpower Axis (9-5-1)": [9, 5, 1], "Activity Axis (2-7-6)": [2, 7, 6]
        }
        active_planes = {}
        for p_name, p_nums in planes_def.items():
            count = sum(1 for n in p_nums if n in present_numbers)
            status = "Fully Realized" if count == 3 else "Completely Empty" if count == 0 else "Partially Active"
            active_planes[p_name] = {"score": count, "status": status}

        # 4. Career Weighted Scoring
        career_scores = {
            "Business & Enterprise": 50, "Engineering & Tech": 50, 
            "Education & Strategy": 50, "Research & Occult": 50, 
            "Creative Arts": 50, "Administration": 50
        }
        for n in [driver, conductor]:
            if n == 1: career_scores["Business & Enterprise"] += 25
            elif n == 3: career_scores["Education & Strategy"] += 30
            elif n == 4: career_scores["Engineering & Tech"] += 30
            elif n == 5: career_scores["Business & Enterprise"] += 35
            elif n == 7: career_scores["Research & Occult"] += 35
            elif n == 8: career_scores["Administration"] += 25

        ranked_careers = sorted(career_scores.items(), key=lambda x: x[1], reverse=True)

        # 5. Temporal Forecasting (Personal Year 2026)
        personal_year = self.reduce_num(driver + conductor + 2026)
        year_text_map = {
            1: "New beginnings and brand identity launches.",
            2: "Networking, partnerships, and configuration.",
            3: "Expansion, creativity, and knowledge gathering.",
            4: "Hard work, discipline, and foundation building.",
            5: "Dynamic change, travel, and business growth.",
            6: "Family harmony, luxury, and responsibility.",
            7: "Research, skill mastery, and introspection.",
            8: "Financial harvest and material success.",
            9: "Completion of cycles and house-cleaning."
        }
        
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        monthly_trends = [{"name": m, "num": self.reduce_num(personal_year + i + 1), "text": "Cycle Active"} for i, m in enumerate(months)]

        # 6. Psychology & Remedial Logic
        driver_texts = {
            1: "Sun influence: Natural leader, resists subordination.", 
            5: "Mercury influence: High-speed business logic and versatility.",
            8: "Saturn influence: Execution-heavy, handles immense pressure."
        }
        psychology = f"Driver {driver}: {driver_texts.get(driver, 'Balanced psychic blueprint.')}\n" \
                     f"Conductor {conductor}: Your life path demands mastery over current environment nodes."

        remedies = []
        if 5 in missing_numbers: remedies.append("Use green accessories; keep a clear desk for mental focus.")
        if 6 in missing_numbers: remedies.append("Support family harmony; wear subtle premium fragrances.")
        if not remedies: remedies.append("Maintain current daily discipline; practice morning sun-gazing.")

        # 7. Name Harmony Assessment
        is_name_correct = (destiny in [1, 5, 6, driver, conductor])
        
        test_total, test_destiny = 0, 0
        if test_name_str:
            test_total = self.get_chaldean_total(test_name_str)
            test_destiny = self.reduce_num(test_total)

        # Final Payload
        return {
            "driver": driver, "conductor": conductor, "destiny_compound": name_compound, "destiny": destiny,
            "grid": [
                [grid_map[4], grid_map[9], grid_map[2]],
                [grid_map[3], grid_map[5], grid_map[7]],
                [grid_map[8], grid_map[1], grid_map[6]]
            ],
            "present_nums": present_numbers, "missing": missing_numbers, "repeated": repeated_numbers,
            "planes": active_planes, "psychology": psychology, "ranked_careers": ranked_careers,
            "c_confidence": min(100, 60 + (len(present_numbers)*5)), 
            "f_strength": 75, "e_balance": 70, "r_stability": 65, "l_capacity": 80,
            "compat_match": {1: "1, 3, 5, 6", 2: "2, 7, 8", 3: "3, 1, 5, 9"}.get(driver, "1, 5, 6"),
            "remedies": remedies, "personal_year": personal_year, 
            "year_text": year_text_map.get(personal_year, "Balanced energetic timeline."),
            "monthly_trends": monthly_trends, "is_name_correct": is_name_correct,
            "name_suggestions": [] if is_name_correct else self.generate_spelling_suggestions(name_str, driver, conductor),
            "display_test": bool(test_name_str), "test_name": test_name_str, 
            "test_total": test_total, "test_destiny": test_destiny
        }

# Initialize Engine
engine = RealLoShuEngine()

# Add your HTML_UI string here (the one provided in your Part A/B)
# HTML_UI = """ ... """ 

@app.route("/", methods=["GET", "POST"])
def home():
    res = None
    if request.method == "POST":
        name = request.form.get("name")
        dob = request.form.get("dob")
        test_name = request.form.get("test_name", "")
        res = engine.analyze(dob, name, test_name)
    # Note: Use your actual HTML template variable here
    return render_template_string("REPLACE_THIS_WITH_YOUR_HTML_UI_VARIABLE", r=res, min=min)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
engine = RealLoShuEngine()

# [INSERT YOUR HTML_UI STRING HERE]

@app.route("/", methods=["GET", "POST"])
def home():
    res = None
    if request.method == "POST":
        name = request.form.get("name")
        dob = request.form.get("dob")
        test_name = request.form.get("test_name")
        res = engine.analyze(dob, name, test_name)
    return render_template_string(HTML_UI, r=res, min=min)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

import os
import re
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional

from flask import Flask, request, render_template_string

app = Flask(__name__)

# =========================================================
# 🔢 AUTHENTIC LO SHU + CHALDEAN ENGINE (DOB-only grid)
# =========================================================

LO_SHU_LAYOUT = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6],
]

ARROWS = {
    # Positive / strength arrows
    "Arrow of Determination": [1, 5, 9],
    "Arrow of Planning": [4, 3, 8],
    "Arrow of Spirituality": [4, 5, 6],
    "Arrow of Emotional Balance": [2, 5, 8],
    "Arrow of Practicality": [8, 1, 6],
    "Arrow of Activity": [2, 7, 6],
    "Arrow of Intellect": [4, 9, 2],
    "Arrow of Memory": [3, 5, 7],
    # Commonly treated as challenge arrow when missing
    "Arrow of Frustration": [1, 5, 9],
}

PLANES = {
    "Mental Plane (4-9-2)": [4, 9, 2],
    "Emotional Plane (3-5-7)": [3, 5, 7],
    "Practical Plane (8-1-6)": [8, 1, 6],
    "Planning Axis (4-3-8)": [4, 3, 8],
    "Willpower Axis (9-5-1)": [9, 5, 1],
    "Activity Axis (2-7-6)": [2, 7, 6],
    "Spirituality Axis (4-5-6)": [4, 5, 6],
    "Determination Axis (2-5-8)": [2, 5, 8],
}


def _digits_from_dob(dob_str: str) -> Optional[List[int]]:
    clean = "".join(c for c in dob_str if c.isdigit())
    if len(clean) != 8:
        return None
    digits = [int(c) for c in clean]
    return digits


def reduce_num(n: int) -> int:
    while n > 9:
        n = sum(int(d) for d in str(n))
    return n


def clamp(n: int, lo: int = 0, hi: int = 100) -> int:
    return max(lo, min(hi, int(n)))


@dataclass
class NameSuggestion:
    spelling: str
    total: int
    destiny: int
    harmony: int
    strengths: str
    weaknesses: str


class AuthenticLoShuChaldeanEngine:
    def __init__(self):
        self.chaldean_map = {
            "A": 1, "I": 1, "J": 1, "Q": 1, "Y": 1,
            "B": 2, "K": 2, "R": 2,
            "C": 3, "G": 3, "L": 3, "S": 3,
            "D": 4, "M": 4, "T": 4,
            "E": 5, "H": 5, "N": 5, "X": 5,
            "U": 6, "V": 6, "W": 6,
            "O": 7, "Z": 7,
            "F": 8, "P": 8,
        }

    # -------------------------
    # Chaldean name calculations
    # -------------------------
    def get_chaldean_total(self, name_str: str) -> int:
        return sum(self.chaldean_map.get(ch, 0) for ch in name_str.upper() if ch.isalpha())

    def destiny_number(self, name_str: str) -> Tuple[int, int]:
        total = self.get_chaldean_total(name_str)
        return total, reduce_num(total)

    # -------------------------
    # Lo Shu grid (DOB only)
    # -------------------------
    def dob_counts(self, dob_digits: List[int]) -> Dict[int, int]:
        counts = {i: 0 for i in range(1, 10)}
        for d in dob_digits:
            if d == 0:
                continue
            if 1 <= d <= 9:
                counts[d] += 1
        return counts

    def grid_strings(self, counts: Dict[int, int]) -> Dict[int, str]:
        # Each cell shows repeated digits, e.g., 1 -> "11" if count=2
        return {n: (str(n) * counts[n]) for n in range(1, 10)}

    def grid_display(self, counts: Dict[int, int]) -> List[List[str]]:
        s = self.grid_strings(counts)
        out = []
        for row in LO_SHU_LAYOUT:
            out.append([(s[n] if s[n] else ".") for n in row])
        return out

    def present_missing_repeated(self, counts: Dict[int, int]) -> Tuple[List[int], List[int], List[str]]:
        present = [n for n in range(1, 10) if counts[n] > 0]
        missing = [n for n in range(1, 10) if counts[n] == 0]
        repeated = [f"{n} (x{counts[n]})" for n in range(1, 10) if counts[n] > 1]
        return present, missing, repeated

    # -------------------------
    # Arrow analysis
    # -------------------------
    def arrow_status(self, counts: Dict[int, int], nums: List[int]) -> Tuple[str, int]:
        present = sum(1 for n in nums if counts[n] > 0)
        if present == 3:
            return "Complete", 3
        if present == 0:
            return "Missing", 0
        return "Broken", present

    def analyze_arrows(self, counts: Dict[int, int]) -> Dict[str, Dict[str, object]]:
        arrows = {}
        for name, nums in ARROWS.items():
            status, strength = self.arrow_status(counts, nums)
            arrows[name] = {"nums": nums, "status": status, "strength": strength}
        # De-duplicate Frustration: treat it as the *challenge* view of 1-5-9
        det = arrows["Arrow of Determination"]["status"]
        if det == "Complete":
            arrows["Arrow of Frustration"]["status"] = "Low"
            arrows["Arrow of Frustration"]["strength"] = 0
        elif det == "Missing":
            arrows["Arrow of Frustration"]["status"] = "High"
            arrows["Arrow of Frustration"]["strength"] = 3
        else:
            arrows["Arrow of Frustration"]["status"] = "Moderate"
            arrows["Arrow of Frustration"]["strength"] = 2
        return arrows

    # -------------------------
    # Plane analysis (frequency-aware)
    # -------------------------
    def analyze_planes(self, counts: Dict[int, int]) -> Dict[str, Dict[str, object]]:
        out = {}
        for pname, nums in PLANES.items():
            present = sum(1 for n in nums if counts[n] > 0)
            freq = sum(counts[n] for n in nums)
            if present == 3:
                status = "Fully Realized"
            elif present == 0:
                status = "Completely Empty"
            else:
                status = "Partially Active"
            out[pname] = {"score": present, "freq": freq, "status": status}
        return out

    # -------------------------
    # Driver / Conductor
    # -------------------------
    def driver_conductor(self, dob_digits: List[int]) -> Tuple[int, int, int]:
        clean = "".join(str(d) for d in dob_digits)
        day = int(clean[0:2])
        driver = reduce_num(day)
        conductor = reduce_num(sum(dob_digits))
        return day, driver, conductor

    # -------------------------
    # Weighted career scoring (Lo Shu + core numbers + name harmony)
    # -------------------------
    def career_scores(self, counts: Dict[int, int], driver: int, conductor: int, name_destiny: int) -> Dict[str, int]:
        scores = {
            "Business": 0,
            "Technology": 0,
            "Teaching": 0,
            "Research": 0,
            "Creative": 0,
            "Administration": 0,
        }

        # Base from dominant numbers (frequency)
        for n in range(1, 10):
            c = counts[n]
            if c == 0:
                continue
            # Strength weight: 1 occurrence = 6, 2 = 12, 3+ = 16
            w = 6 if c == 1 else 12 if c == 2 else 16
            if n == 1:
                scores["Business"] += w
                scores["Administration"] += w
            elif n == 2:
                scores["Teaching"] += w
                scores["Creative"] += w
            elif n == 3:
                scores["Teaching"] += w
                scores["Creative"] += w
            elif n == 4:
                scores["Technology"] += w
                scores["Administration"] += w
            elif n == 5:
                scores["Business"] += w
                scores["Creative"] += w
            elif n == 6:
                scores["Creative"] += w
                scores["Business"] += w // 2
            elif n == 7:
                scores["Research"] += w
                scores["Technology"] += w // 2
            elif n == 8:
                scores["Administration"] += w
                scores["Business"] += w
            elif n == 9:
                scores["Administration"] += w
                scores["Business"] += w // 2

        # Missing numbers reduce related clusters
        missing = [n for n in range(1, 10) if counts[n] == 0]
        for n in missing:
            if n == 1:
                scores["Business"] -= 10
                scores["Administration"] -= 10
            elif n == 2:
                scores["Teaching"] -= 8
                scores["Creative"] -= 8
            elif n == 3:
                scores["Teaching"] -= 10
                scores["Creative"] -= 6
            elif n == 4:
                scores["Technology"] -= 12
                scores["Administration"] -= 8
            elif n == 5:
                scores["Business"] -= 12
                scores["Creative"] -= 8
            elif n == 6:
                scores["Creative"] -= 12
                scores["Business"] -= 6
            elif n == 7:
                scores["Research"] -= 14
            elif n == 8:
                scores["Administration"] -= 12
                scores["Business"] -= 10
            elif n == 9:
                scores["Administration"] -= 10

        # Arrow boosts
        arrows = self.analyze_arrows(counts)
        if arrows["Arrow of Determination"]["status"] == "Complete":
            scores["Business"] += 12
            scores["Administration"] += 10
        if arrows["Arrow of Planning"]["status"] == "Complete":
            scores["Technology"] += 10
            scores["Administration"] += 10
        if arrows["Arrow of Intellect"]["status"] == "Complete":
            scores["Research"] += 10
            scores["Teaching"] += 8
        if arrows["Arrow of Activity"]["status"] == "Complete":
            scores["Business"] += 8
            scores["Creative"] += 6
        if arrows["Arrow of Memory"]["status"] == "Complete":
            scores["Teaching"] += 10
            scores["Research"] += 6

        # Core numbers (driver/conductor) as modifiers
        for core in (driver, conductor):
            if core == 1:
                scores["Business"] += 10
                scores["Administration"] += 10
            elif core == 2:
                scores["Teaching"] += 8
                scores["Creative"] += 8
            elif core == 3:
                scores["Teaching"] += 12
            elif core == 4:
                scores["Technology"] += 12
                scores["Administration"] += 6
            elif core == 5:
                scores["Business"] += 14
                scores["Creative"] += 8
            elif core == 6:
                scores["Creative"] += 14
                scores["Business"] += 6
            elif core == 7:
                scores["Research"] += 14
            elif core == 8:
                scores["Administration"] += 14
                scores["Business"] += 10
            elif core == 9:
                scores["Administration"] += 10
                scores["Business"] += 6

        # Name harmony: if destiny matches driver/conductor or is 1/5/6, small boost
        if name_destiny in (driver, conductor):
            scores["Business"] += 6
            scores["Administration"] += 6
        if name_destiny in (1, 5, 6):
            scores["Business"] += 6
            scores["Creative"] += 4

        # Normalize to 0..100-ish
        for k in list(scores.keys()):
            scores[k] = clamp(scores[k] + 50, 0, 100)
        return scores

    # -------------------------
    # Psychology (calculation-linked)
    # -------------------------
    def psychological_analysis(self, counts: Dict[int, int], missing: List[int], arrows: Dict[str, Dict[str, object]]) -> str:
        emo = counts[2] + counts[6]
        emo_text = "High" if emo >= 3 else "Moderate" if emo == 2 else "Low"

        over = counts[7] + counts[9]
        over_text = "High" if over >= 3 else "Moderate" if over == 2 else "Low"

        anger = counts[1] + counts[9]
        anger_text = "High" if anger >= 4 else "Moderate" if anger >= 2 else "Low"

        comm = counts[3] + counts[5]
        comm_text = "Strong" if comm >= 3 else "Developing" if comm == 2 else "Needs practice"

        stress = []
        if 4 in missing:
            stress.append("Under stress you may avoid structure and delay decisions.")
        if 5 in missing:
            stress.append("Under stress you may feel mentally restless and jump between tasks.")
        if 6 in missing:
            stress.append("Under stress you may withdraw from family/relationship responsibilities.")
        if not stress:
            stress.append("Under stress you usually recover faster because your grid has fewer gaps.")

        if counts[2] == 0 and counts[6] == 0:
            attach = "More independent; you may take time to trust emotionally."
        elif counts[2] >= 2 and counts[6] >= 1:
            attach = "Warm and loyal; you prefer stable bonds and consistent reassurance."
        else:
            attach = "Balanced; you value closeness but still need personal space."

        fr = arrows["Arrow of Frustration"]["status"]
        if fr == "High":
            fr_text = "Frustration can build when goals move slowly; patience training is important."
        elif fr == "Moderate":
            fr_text = "You can get irritated when plans change; flexibility helps you stay calm."
        else:
            fr_text = "You usually handle delays well and stay focused on outcomes."

        return (
            f"Emotional sensitivity: {emo_text}.\n"
            f"Hidden fears: often linked to missing numbers {', '.join(map(str, missing)) if missing else 'none'} (areas you may doubt until practiced).\n"
            f"Anger/impulsivity tendency: {anger_text}.\n"
            f"Confidence level: {'High' if counts[1] >= 2 or counts[8] >= 2 else 'Moderate' if counts[1] or counts[8] else 'Developing'}.\n"
            f"Attachment style: {attach}\n"
            f"Communication habits: {comm_text}.\n"
            f"Overthinking pattern: {over_text}.\n"
            f"Stress behavior: {' '.join(stress)}\n"
            f"Emotional regulation note: {fr_text}"
        )

    # -------------------------
    # Remedies (tied to missing numbers + weak arrows)
    # -------------------------
    def remedies(self, missing: List[int], arrows: Dict[str, Dict[str, object]], planes: Dict[str, Dict[str, object]]) -> List[str]:
        r: List[str] = []

        if 1 in missing:
            r += [
                "Behavior: Take one clear decision daily and finish it before starting a new task.",
                "Routine: 20 minutes of morning sunlight + a short walk to build self-drive.",
            ]
        if 2 in missing:
            r += [
                "Behavior: Practice listening without interrupting (2 minutes pause before replying).",
                "Relationship: Weekly check-in with a close person to express feelings clearly.",
            ]
        if 3 in missing:
            r += [
                "Communication: Write 5 lines daily (journal or notes) to strengthen expression.",
                "Skill: Join a speaking/teaching activity once a week.",
            ]
        if 4 in missing:
            r += [
                "Discipline: Use a checklist system (top 3 priorities only) and review nightly.",
                "Direction: Work facing East in the morning for consistency and planning.",
            ]
        if 5 in missing:
            r += [
                "Focus: Avoid multitasking; use 25-minute focus blocks with 5-minute breaks.",
                "Color: Add green in clothing or workspace to support balance and adaptability.",
            ]
        if 6 in missing:
            r += [
                "Relationship: Keep one fixed family/partner commitment weekly (no cancellations).",
                "Environment: Keep bedroom and wallet organized; remove clutter to improve comfort energy.",
            ]
        if 7 in missing:
            r += [
                "Mind: 10 minutes of silent breathing daily to reduce mental noise.",
                "Learning: Read/learn one deep topic weekly to build inner wisdom.",
            ]
        if 8 in missing:
            r += [
                "Finance: Track expenses daily for 30 days to strengthen money discipline.",
                "Work: Choose long-term goals over quick wins; build systems step-by-step.",
            ]
        if 9 in missing:
            r += [
                "Purpose: Do one helpful act weekly (mentoring, volunteering, supporting someone).",
                "Body: Regular physical exercise to channel drive in a healthy way.",
            ]

        if arrows["Arrow of Planning"]["status"] != "Complete":
            r.append("Planning: Before big decisions, write pros/cons and a 7-day action plan.")
        if arrows["Arrow of Determination"]["status"] != "Complete":
            r.append("Willpower: Keep one promise to yourself daily (small but non-negotiable).")
        if planes["Emotional Plane (3-5-7)"]["score"] == 0:
            r.append("Emotional balance: Reduce screen time at night and sleep on a fixed schedule.")

        if not r:
            r.append("Daily: 10 minutes of calm breathing in the morning to keep your strong grid balanced.")

        return r[:12]

    # -------------------------
    # Name correction suggestions (variants)
    # -------------------------
    def _name_variants(self, name: str) -> List[str]:
        base = re.sub(r"[^A-Za-z ]+", "", name).strip()
        base = re.sub(r"\s+", " ", base)
        if not base:
            return []

        parts = base.split(" ")
        first = parts[0]
        rest = " ".join(parts[1:])

        suffixes = ["", "A", "I", "E", "H", "N", "S", "R"]
        doubles = []
        if len(first) >= 2:
            doubles = [first[0] + first[0] + first[1:], first[:-1] + first[-1] + first[-1]]

        variants = set()
        variants.add(base)

        for suf in suffixes:
            variants.add((first + suf + (" " + rest if rest else "")).strip())

        for d in doubles:
            variants.add((d + (" " + rest if rest else "")).strip())
            for suf in suffixes:
                variants.add((d + suf + (" " + rest if rest else "")).strip())

        return sorted({v.title() for v in variants if len(v) >= 2})

    def name_harmony_percent(self, destiny: int, driver: int, conductor: int) -> int:
        if destiny in (driver, conductor):
            return 92
        if destiny in (1, 5, 6):
            return 88
        if destiny in (2, 3):
            return 78
        if destiny in (4, 8):
            return 74
        return 68

    def name_strength_weakness(self, destiny: int) -> Tuple[str, str]:
        if destiny == 1:
            return "Supports leadership and independence.", "Can increase stubbornness if emotions are ignored."
        if destiny == 2:
            return "Supports diplomacy and relationships.", "Can increase sensitivity and mood swings."
        if destiny == 3:
            return "Supports learning, teaching, and expression.", "Can scatter focus if discipline is weak."
        if destiny == 4:
            return "Supports stability and practical planning.", "Can feel heavy or slow if flexibility is missing."
        if destiny == 5:
            return "Supports business, communication, and adaptability.", "Can increase restlessness if routines are absent."
        if destiny == 6:
            return "Supports comfort, family support, and attraction.", "Can increase attachment or over-responsibility."
        if destiny == 7:
            return "Supports research, depth, and spiritual growth.", "Can increase isolation or overthinking."
        if destiny == 8:
            return "Supports authority, finance discipline, and long-term success.", "Can increase pressure and work stress."
        if destiny == 9:
            return "Supports influence and humanitarian leadership.", "Can increase impatience or emotional intensity."
        return "Balanced.", "Balanced."

    def suggest_name_corrections(self, name: str, driver: int, conductor: int, counts: Dict[int, int]) -> List[NameSuggestion]:
        variants = self._name_variants(name)
        if not variants:
            return []

        missing = [n for n in range(1, 10) if counts[n] == 0]

        suggestions: List[NameSuggestion] = []
        seen = set()
        for v in variants:
            total, destiny = self.destiny_number(v)
            if destiny in seen:
                continue
            seen.add(destiny)

            harmony = self.name_harmony_percent(destiny, driver, conductor)

            if missing and destiny in missing:
                harmony = clamp(harmony + 6)

            strengths, weaknesses = self.name_strength_weakness(destiny)
            suggestions.append(NameSuggestion(
                spelling=v,
                total=total,
                destiny=destiny,
                harmony=harmony,
                strengths=strengths,
                weaknesses=weaknesses,
            ))

        suggestions.sort(key=lambda x: (x.harmony, -abs(x.destiny - driver)), reverse=True)
        return suggestions[:5]

    # -------------------------
    # Forecast
    # -------------------------
    def personal_year(self, driver: int, conductor: int, year: int) -> int:
        return reduce_num(driver + conductor + year)

    def year_text(self, py: int) -> str:
        m = {
            1: "A year for new starts, leadership, and taking independent decisions.",
            2: "A year for partnerships, patience, and strengthening relationships.",
            3: "A year for learning, creativity, communication, and visibility.",
            4: "A year for discipline, structure, savings, and building foundations.",
            5: "A year for change, travel/movement, marketing, and flexibility.",
            6: "A year for family, comfort, responsibility, and improving lifestyle.",
            7: "A year for research, inner growth, skill mastery, and reflection.",
            8: "A year for money management, authority, results, and long-term gains.",
            9: "A year for closure, forgiveness, finishing pending work, and letting go.",
        }
        return m.get(py, "A balanced year.")

    def monthly_trends(self, py: int) -> List[Dict[str, object]]:
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        out = []
        for idx, m in enumerate(months):
            mn = reduce_num(py + (idx + 1))
            if mn in (1, 5):
                tag = "Action & change"
            elif mn == 6:
                tag = "Family & comfort"
            elif mn in (4, 8):
                tag = "Work & money focus"
            elif mn == 7:
                tag = "Study & reflection"
            else:
                tag = "Steady progress"
            out.append({"name": m, "num": mn, "text": tag})
        return out

    # -------------------------
    # Main analysis
    # -------------------------
    def analyze(self, dob_str: str, name_str: str, test_name_str: str = "") -> Optional[Dict[str, object]]:
        dob_digits = _digits_from_dob(dob_str)
        if not dob_digits:
            return None

        counts = self.dob_counts(dob_digits)
        grid = self.grid_display(counts)
        present, missing, repeated = self.present_missing_repeated(counts)

        _, driver, conductor = self.driver_conductor(dob_digits)

        name_total, name_destiny = self.destiny_number(name_str)

        arrows = self.analyze_arrows(counts)
        planes = self.analyze_planes(counts)

        is_name_correct = (name_destiny in (driver, conductor)) or (name_destiny in (1, 5, 6))

        name_suggestions = []
        if not is_name_correct:
            name_suggestions = [s.__dict__ for s in self.suggest_name_corrections(name_str, driver, conductor, counts)]

        display_test = bool(test_name_str.strip())
        test_total, test_destiny = (0, 0)
        if display_test:
            test_total, test_destiny = self.destiny_number(test_name_str)

        c_scores = self.career_scores(counts, driver, conductor, name_destiny)
        ranked_careers = sorted(c_scores.items(), key=lambda x: x[1], reverse=True)

        career_conf = clamp(40 + ranked_careers[0][1])
        relationship_stability = clamp(40 + (counts[2] > 0) * 15 + (counts[6] > 0) * 15 + (planes["Emotional Plane (3-5-7)"]["score"] * 8))
        financial_strength = clamp(40 + (counts[5] > 0) * 12 + (counts[8] > 0) * 18 + (planes["Practical Plane (8-1-6)"]["score"] * 8))
        emotional_balance = clamp(40 + (planes["Emotional Plane (3-5-7)"]["score"] * 12) - (10 if arrows["Arrow of Frustration"]["status"] == "High" else 0))
        leadership_capacity = clamp(40 + (counts[1] > 0) * 18 + (counts[9] > 0) * 12 + (arrows["Arrow of Determination"]["status"] == "Complete") * 12)

        psych = self.psychological_analysis(counts, missing, arrows)
        rems = self.remedies(missing, arrows, planes)

        year = 2026
        py = self.personal_year(driver, conductor, year)
        ytext = self.year_text(py)
        mtrend = self.monthly_trends(py)

        return {
            "driver": driver,
            "conductor": conductor,
            "destiny_compound": name_total,
            "destiny": name_destiny,
            "grid": grid,
            "present_nums": present,
            "missing": missing,
            "repeated": repeated,
            "planes": {k: {"score": v["score"], "status": v["status"]} for k, v in planes.items()},
            "arrows": arrows,
            "psychology": psych,
            "ranked_careers": ranked_careers,
            "career_scores": c_scores,
            "c_confidence": career_conf,
            "r_stability": relationship_stability,
            "f_strength": financial_strength,
            "e_balance": emotional_balance,
            "l_capacity": leadership_capacity,
            "remedies": rems,
            "personal_year": py,
            "year_text": ytext,
            "monthly_trends": mtrend,
            "name_suggestions": name_suggestions,
            "display_test": display_test,
            "is_name_correct": is_name_correct,
            "test_name": test_name_str,
            "test_total": test_total,
            "test_destiny": test_destiny
        }


engine = AuthenticLoShuChaldeanEngine()

# =========================================================
# UI (keeps your existing template variables + adds arrows)
# =========================================================

HTML_UI = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, user-scalable=yes">
<title>Numero Annand AI Pro</title>
<style>
:root { --neon: #00f2ff; --gold: #ffcc00; --card: rgba(255,255,255,0.04); --border: rgba(255,255,255,0.08); --bg: #03060f; }
body { margin:0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg); color:#fff; padding-bottom: 120px; -webkit-font-smoothing: antialiased; }
.app-shell { max-width: 480px; margin: auto; padding: 16px; box-sizing: border-box; }
.header { text-align: center; padding: 30px 0; background: linear-gradient(180deg, rgba(0,242,255,0.12) 0%, rgba(0,0,0,0) 100%); border-radius: 0 0 36px 36px; margin-bottom: 24px; }
.header h1 { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 4px; color: var(--neon); text-shadow: 0 0 24px rgba(0,242,255,0.25); }
.header p { margin: 6px 0 0; font-size: 11px; opacity: 0.6; letter-spacing: 2px; text-transform: uppercase; color: #8e9bb3; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: 24px; padding: 22px; margin-bottom: 18px; backdrop-filter: blur(25px); box-shadow: 0 10px 35px 0 rgba(0,0,0,0.4); }
.card-title { margin: 0 0 18px; font-size: 13.5px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: var(--neon); display: flex; align-items: center; gap: 8px; border-bottom: 1px solid rgba(0,242,255,0.1); padding-bottom: 8px; }
.form-group { margin-bottom: 14px; }
.form-group label { font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #64748b; margin-left: 4px; display: block; margin-bottom: 6px; text-transform: uppercase;}
input { width: 100%; padding: 16px; border-radius: 14px; border: 1px solid #1c2638; background: #070b14; color: #fff; box-sizing: border-box; font-size: 15px; font-weight: 500; transition: all 0.3s ease; }
input:focus { border-color: var(--neon); box-shadow: 0 0 14px rgba(0,242,255,0.15); outline: none; }
.btn-trigger { width: 100%; padding: 18px; background: linear-gradient(90deg, #00f2ff, #0077ff); color: #000; font-weight: 800; border-radius: 16px; border: none; cursor: pointer; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; transition: transform 0.1s ease; box-shadow: 0 4px 20px rgba(0,242,255,0.25); margin-top: 8px;}
.btn-trigger:active { transform: scale(0.98); }
.grid-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; width: 240px; margin: 20px auto; }
.grid-cell { height: 76px; border: 2px solid rgba(0,242,255,0.25); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--gold); background: rgba(5,9,18,0.8); font-size: 24px; }
.data-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
.data-row:last-child { border: none; }
.lbl { color: #8e9bb3; font-weight: 500; }
.val { font-weight: 700; color: #fff; }
.badge { background: rgba(0,242,255,0.1); color: var(--neon); padding: 4px 10px; border-radius: 8px; font-size: 12px; }
.plane-row { background: rgba(255,255,255,0.02); padding: 12px 14px; border-radius: 12px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.03); }
.plane-hdr { display: flex; justify-content: space-between; font-weight: 700; font-size: 13px; margin-bottom: 4px;}
.metric-bar-wrapper { margin-bottom: 12px; }
.metric-bar-label { display: flex; justify-content: space-between; font-size: 12.5px; font-weight: 600; margin-bottom: 4px; color: #cbd5e1; }
.metric-bar-bg { background: rgba(255,255,255,0.05); height: 8px; border-radius: 4px; overflow: hidden; }
.metric-bar-fill { height: 100%; background: linear-gradient(90deg, var(--neon), #0077ff); border-radius: 4px; }
.timeline-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 14px; }
.timeline-box { background: rgba(5,9,18,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 10px 4px; text-align: center; }
.timeline-month { font-size: 11px; font-weight: 700; color:#8e9bb3; text-transform: uppercase; }
.timeline-val { font-size: 16px; font-weight: 800; color: var(--gold); margin: 2px 0; }
.timeline-tag { font-size: 8px; opacity: 0.6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 2px;}
.list-item { margin-bottom: 12px; line-height: 1.6; font-size: 13.5px; color: #e1e7f0; padding-left: 4px; }
</style>
</head>
<body>
<div class="app-shell">
<div class="header">
<h1>NUMERO ANNAND AI</h1>
<p>Authentic Lo Shu (DOB-only) + Chaldean Name Analysis</p>
</div>

<div class="card">
<div class="card-title">📋 Inputs</div>
<form method="POST">
<div class="form-group">
<label>Full Legal Name</label>
<input name="name" placeholder="Full Legal Name" required autocomplete="off" value="{{ request.form.get('name','') }}">
</div>
<div class="form-group">
<label>Date of Birth</label>
<input name="dob" placeholder="DD/MM/YYYY" required autocomplete="off" value="{{ request.form.get('dob','') }}">
</div>
<div class="form-group" style="margin-top: 18px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 14px;">
<label style="color: var(--gold);">Optional: Test Name Spelling</label>
<input name="test_name" placeholder="Spelling variation to measure" autocomplete="off" value="{{ request.form.get('test_name','') }}">
</div>
<button type="submit" class="btn-trigger">Generate Report</button>
</form>
</div>

{% if r %}

{% if r.display_test %}
<div class="card" style="border: 2px solid var(--gold); background: rgba(255,204,0,0.02);">
<div class="card-title" style="color: var(--gold);">⚖️ Test Name Result</div>
<div class="data-row"><span class="lbl">Tested Spelling</span><span class="val" style="color: var(--gold);">{{ r.test_name }}</span></div>
<div class="data-row"><span class="lbl">Chaldean Total</span><span class="val badge" style="background: rgba(255,204,0,0.1); color: var(--gold);">{{ r.test_total }}</span></div>
<div class="data-row"><span class="lbl">Destiny Number</span><span class="val badge">{{ r.test_destiny }}</span></div>
</div>
{% endif %}

<div class="card" style="border-left: 4px solid var(--neon);">
<div class="card-title">🔢 1. Basic Numbers</div>
<div class="data-row"><span class="lbl">Driver Number (Mulaank)</span><span class="val badge">{{ r.driver }}</span></div>
<div class="data-row"><span class="lbl">Conductor Number (Bhagyaank)</span><span class="val badge">{{ r.conductor }}</span></div>
<div class="data-row"><span class="lbl">Chaldean Name Total</span><span class="val badge" style="background:rgba(255,204,0,0.1); color:var(--gold);">{{ r.destiny_compound }}</span></div>
<div class="data-row"><span class="lbl">Destiny Number (Namank)</span><span class="val badge">{{ r.destiny }}</span></div>
</div>

<div class="card">
<div class="card-title">📊 2. Lo Shu Grid (DOB digits only)</div>
<p style="font-size: 11px; opacity: 0.7; margin: -10px 0 10px 0;">Layout: 4-9-2 / 3-5-7 / 8-1-6. Grid is filled only from DOB digits (0 ignored).</p>
<div class="grid-container">
{% for row in r.grid %}{% for cell in row %}<div class="grid-cell">{{cell}}</div>{% endfor %}{% endfor %}
</div>
<div class="data-row"><span class="lbl">Present Numbers</span><span class="val" style="color:var(--neon);">{{ r.present_nums|join(', ') }}</span></div>
<div class="data-row"><span class="lbl">Missing Numbers</span><span class="val" style="color:#ff4d4d; font-weight:700;">{{ r.missing|join(', ') if r.missing else 'None' }}</span></div>
<div class="data-row"><span class="lbl">Repeated Numbers</span><span class="val" style="color:var(--gold);">{{ r.repeated|join(', ') if r.repeated else 'None' }}</span></div>
</div>

<div class="card">
<div class="card-title">🧭 3. Arrow Analysis</div>
{% for aname, a in r.arrows.items() %}
<div class="plane-row">
<div class="plane-hdr"><span>{{ aname }} ({{ a.nums|join('-') }})</span><strong>{{ a.status }}</strong></div>
</div>
{% endfor %}
</div>

<div class="card">
<div class="card-title">📐 4. Plane Analysis</div>
{% for name, p in r.planes.items() %}
<div class="plane-row">
<div class="plane-hdr"><span>{{ name }}</span><strong>{{ p.status }}</strong></div>
</div>
{% endfor %}
</div>

<div class="card">
<div class="card-title">🧠 5. Psychological Analysis</div>
<div style="font-size: 14.5px; line-height: 1.6; color: #e1e7f0; white-space: pre-line;">{{ r.psychology }}</div>
</div>

<div class="card">
<div class="card-title">💼 6. Career Analysis (weighted)</div>
{% for cluster, score in r.ranked_careers %}
<div class="metric-bar-wrapper">
<div class="metric-bar-label"><span>{{ cluster }}</span><span>{{ score }}%</span></div>
<div class="metric-bar-bg"><div class="metric-bar-fill" style="width: {{ score }}%;"></div></div>
</div>
{% endfor %}
</div>

<div class="card">
<div class="card-title">📈 7. Confidence Scores</div>
<div class="data-row"><span class="lbl">Career confidence</span><span class="val badge">{{ r.c_confidence }}%</span></div>
<div class="data-row"><span class="lbl">Relationship stability</span><span class="val badge">{{ r.r_stability }}%</span></div>
<div class="data-row"><span class="lbl">Financial strength</span><span class="val badge">{{ r.f_strength }}%</span></div>
<div class="data-row"><span class="lbl">Emotional balance</span><span class="val badge">{{ r.e_balance }}%</span></div>
<div class="data-row"><span class="lbl">Leadership capacity</span><span class="val badge">{{ r.l_capacity }}%</span></div>
</div>

<div class="card" style="border: 1px solid {% if r.is_name_correct %}rgba(37,211,102,0.3){% else %}rgba(0,242,255,0.2){% endif %};">
<div class="card-title">🔠 8. Name Correction</div>
{% if r.is_name_correct %}
<p style="margin:0; line-height:1.6; color:#cbd5e1;"><strong style="color:#25d366;">Your name is 100% correct.</strong> Your current spelling is harmonious with your core numbers.</p>
{% else %}
<p style="margin:0 0 12px 0; line-height:1.6; color:#cbd5e1;">Your name vibration can be improved. Suggested spellings below are ranked by harmony with your DOB grid and core numbers.</p>
{% for sug in r.name_suggestions %}
<div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 12px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.04);">
<div style="display:flex; justify-content:space-between; margin-bottom:4px; font-weight:700;">
<span style="color:var(--gold);">{{ sug.spelling }}</span>
<span style="color:var(--neon);">{{ sug.harmony }}% Harmony</span>
</div>
<div style="font-size:11.5px; opacity:0.8; color:#cbd5e1;">Total: {{ sug.total }} (Destiny {{ sug.destiny }})</div>
<div style="font-size:12px; line-height:1.4; margin-top:6px;"><strong style="color:#25d366;">Strengths:</strong> {{ sug.strengths }}<br><strong style="color:#ff4d4d;">Weaknesses:</strong> {{ sug.weaknesses }}</div>
</div>
{% endfor %}
{% endif %}
</div>

<div class="card" style="border-left: 4px solid #25d366;">
<div class="card-title" style="color:#25d366;">🛠️ 9. Remedies</div>
<ul style="padding-left: 16px; margin: 0;">
{% for rem in r.remedies %}<li class="list-item">{{ rem }}</li>{% endfor %}
</ul>
</div>

<div class="card">
<div class="card-title">🔮 10. Forecast</div>
<div class="data-row"><span class="lbl">Personal Year (2026)</span><span class="val badge">{{ r.personal_year }}</span></div>
<p style="margin: 0; font-size: 13.5px; line-height: 1.5; color: #e1e7f0;">{{ r.year_text }}</p>
<div class="timeline-grid">
{% for m in r.monthly_trends %}
<div class="timeline-box">
<div class="timeline-month">{{ m.name }}</div>
<div class="timeline-val">{{ m.num }}</div>
<div class="timeline-tag" title="{{ m.text }}">{{ m.text }}</div>
</div>
{% endfor %}
</div>
</div>

<button onclick="window.print()" class="btn-trigger" style="background: #101726; color: #fff; box-shadow: none;">Export PDF</button>

{% endif %}

</div>
</body>
</html>"""


@app.route("/", methods=["GET", "POST"])
def home():
    res = None
    if request.method == "POST":
        name = request.form.get("name", "")
        dob = request.form.get("dob", "")
        test_name = request.form.get("test_name", "")
        res = engine.analyze(dob, name, test_name)
    return render_template_string(HTML_UI, r=res)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)