
import svgwrite
import os

"""
Polar SVG Wireframe Generator (Final Lock)
Theme: POLAR (Mandatory)
Maps: Master + Terminal Drill-downs
"""

# THEME: POLAR (LOCKED)
THEME = {
    "name": "Polar",
    "bg": "#f3f4f6",         # Gray-100
    "surface": "#ffffff",    # White
    "border": "#e5e7eb",     # Gray-200
    "text_main": "#0f172a",  # Slate-900 (High Readability)
    "text_muted": "#64748b", # Slate-500
    "accent": "#0f766e",     # Teal-700 (Aviation/Safety)
    "critical": "#b91c1c",   # Red-700
    "warning": "#ca8a04",    # Yellow-600
    "good": "#15803d",       # Green-700
    # Map Colors
    "runway": "#cbd5e1",     # Slate-300
    "terminal": "#e2e8f0",   # Slate-200
    "tarmac": "#f1f5f9"      # Slate-100
}

WIDTH = 1920
HEIGHT = 1080

def draw_master_map(dwg, x, y, w, h):
    """Draws the Master Airport Overview (Runways + Terminals)"""
    dwg.add(dwg.rect(insert=(x, y), size=(w, h), fill=THEME["tarmac"], stroke=THEME["border"]))
    
    # Runways (Parallel)
    dwg.add(dwg.rect(insert=(x + 100, y + 100), size=(w - 200, 60), fill=THEME["runway"], rx=5))
    dwg.add(dwg.text("RUNWAY 01L/19R", insert=(x + 120, y + 140), font_size="24px", fill=THEME["text_muted"], font_weight="bold", opacity="0.5"))
    
    dwg.add(dwg.rect(insert=(x + 100, y + h - 160), size=(w - 200, 60), fill=THEME["runway"], rx=5))
    dwg.add(dwg.text("RUNWAY 01R/19L", insert=(x + 120, y + h - 120), font_size="24px", fill=THEME["text_muted"], font_weight="bold", opacity="0.5"))
    
    # Terminals (T1, T2, T3)
    term_w, term_h = 200, 150
    gap = (w - 400 - (3 * term_w)) / 2
    
    for i, t_id in enumerate(["T1", "T2", "T3"]):
        tx = x + 200 + i * (term_w + gap)
        ty = y + (h / 2) - (term_h / 2)
        dwg.add(dwg.rect(insert=(tx, ty), size=(term_w, term_h), fill=THEME["terminal"], stroke=THEME["text_muted"], stroke_width=2))
        dwg.add(dwg.text(f"TERMINAL {t_id}", insert=(tx + 60, ty + 80), font_size="20px", font_weight="bold"))
        # Drill-down hint
        dwg.add(dwg.text("Click to Zoom", insert=(tx + 65, ty + 100), font_size="12px", fill=THEME["accent"]))

def draw_terminal_map(dwg, x, y, w, h, t_id="T1"):
    """Draws a detailed Terminal View (Gates + Zones)"""
    dwg.add(dwg.rect(insert=(x, y), size=(w, h), fill=THEME["tarmac"], stroke=THEME["border"]))
    
    # Main Concourse
    dwg.add(dwg.rect(insert=(x + 100, y + 100), size=(w - 200, 200), fill=THEME["terminal"], stroke=THEME["text_muted"], stroke_width=2))
    dwg.add(dwg.text(f"TERMINAL {t_id} CONCOURSE", insert=(x + w/2 - 100, y + 200), font_size="32px", font_weight="bold", fill=THEME["text_muted"], opacity="0.3"))

    # Gates
    gate_w = 60
    for i in range(10):
        gx = x + 150 + i * (gate_w + 20)
        dwg.add(dwg.rect(insert=(gx, y + 300), size=(gate_w, 80), fill=THEME["surface"], stroke=THEME["border"]))
        dwg.add(dwg.text(f"G{i+1}", insert=(gx + 15, y + 340), font_size="16px", font_weight="bold"))

    # Specific Location Marker (Asset)
    dwg.add(dwg.circle(center=(x + 400, y + 340), r=15, fill=THEME["accent"], stroke=THEME["surface"], stroke_width=2))
    dwg.add(dwg.text("ASSET V-101", insert=(x + 420, y + 330), font_size="14px", font_weight="bold", fill=THEME["accent"]))


import datetime

def create_wireframe(filename, context_name, layout_type="3zone", subtype=None):
    dwg = svgwrite.Drawing(filename, size=(WIDTH, HEIGHT))
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")
    
    # Background
    dwg.add(dwg.rect(insert=(0, 0), size=(WIDTH, HEIGHT), fill=THEME["bg"]))
    
    # Styles (Typography Lock)
    style = f"""
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
        text {{ font-family: 'Inter', sans-serif; fill: {THEME['text_main']}; }}
        .header {{ font-size: 32px; font-weight: 600; }}
        .section {{ font-size: 20px; font-weight: 600; }}
        .body {{ font-size: 16px; weight: 400; }}
        .dense {{ font-size: 14px; }}
        .meta {{ font-size: 12px; fill: {THEME['text_muted']}; }}
        .accent {{ fill: {THEME['accent']}; }}
        .critical {{ fill: {THEME['critical']}; }}
    """
    dwg.defs.add(dwg.style(style))
    
    # Header (Fixed 64px)
    dwg.add(dwg.rect(insert=(0, 0), size=(WIDTH, 64), fill=THEME["surface"], stroke=THEME["border"], stroke_width=1))
    dwg.add(dwg.text(f"RIYADH AIRPORT OPERATIONS :: {context_name}", insert=(24, 42), class_="header", font_size="24px"))

    # Metadata Footer (Mandatory per Master Authority)
    dwg.add(dwg.text(f"Resolution: {WIDTH}x{HEIGHT} | Version: {timestamp} | Mode: POLAR - LOCKED", insert=(WIDTH - 450, 42), class_="meta"))
    
    if layout_type == "3zone":
        # Zone 2: Queue (Right Fixed 420px)
        queue_x = WIDTH - 420
        dwg.add(dwg.rect(insert=(queue_x, 64), size=(420, HEIGHT - 64 - 320), fill=THEME["surface"], stroke=THEME["border"], stroke_width=1))
        dwg.add(dwg.text("ACTIVE ITEMS", insert=(queue_x + 20, 100), class_="section"))
        
        # Queue Items (Mock)
        for i in range(5):
            qy = 130 + i * 110
            dwg.add(dwg.rect(insert=(queue_x + 20, qy), size=(380, 100), fill=THEME["bg"], rx=4, stroke=THEME["border"]))
            dwg.add(dwg.text(f"INCIDENT #100{i}", insert=(queue_x + 35, qy + 30), class_="body", font_weight="bold"))
            dwg.add(dwg.text("Category: High Priority", insert=(queue_x + 35, qy + 55), class_="dense"))
            dwg.add(dwg.text("10:42 AM • Terminal 1", insert=(queue_x + 35, qy + 80), class_="meta"))

        # Zone 1: Map (Remaining Width)
        map_width = WIDTH - 420
        map_height = HEIGHT - 64 - 320
        
        if subtype == "master":
            draw_master_map(dwg, 0, 64, map_width, map_height)
        elif subtype == "terminal":
            draw_terminal_map(dwg, 0, 64, map_width, map_height, t_id="T1")
        
        # Zone 3: Workbench (Fixed Bottom 320px)
        wb_y = HEIGHT - 320
        dwg.add(dwg.rect(insert=(0, wb_y), size=(WIDTH, 320), fill=THEME["surface"], stroke=THEME["border"], stroke_width=1))
        dwg.add(dwg.text("WORKBENCH: DETAILS & MEDIA", insert=(20, wb_y + 32), class_="section"))
        
        # Tabs
        dwg.add(dwg.line(start=(0, wb_y + 48), end=(WIDTH, wb_y + 48), stroke=THEME["border"]))
        
        # Media Panel (Required)
        media_label = "LIVE CAMERA FEED" if "ops" in context_name else "DASHCAM FEED" if "fleet" in context_name else "ROBOT OPTICS"
        # Placeholder (Cross-hatched)
        cam_x, cam_y, cam_w, cam_h = WIDTH - 500, wb_y + 60, 480, 240
        dwg.add(dwg.rect(insert=(cam_x, cam_y), size=(cam_w, cam_h), fill="#f1f5f9", stroke=THEME["border"], stroke_width=2))
        # Patterns
        dwg.add(dwg.line(start=(cam_x, cam_y), end=(cam_x + cam_w, cam_y + cam_h), stroke=THEME["border"], stroke_width=2))
        dwg.add(dwg.line(start=(cam_x + cam_w, cam_y), end=(cam_x, cam_y + cam_h), stroke=THEME["border"], stroke_width=2))
        # Label
        dwg.add(dwg.text(media_label, insert=(cam_x + 20, cam_y + 30), font_size="20px", fill=THEME["text_main"], font_weight="bold"))
        # REC Indicator
        dwg.add(dwg.circle(center=(cam_x + cam_w - 30, cam_y + 30), r=8, fill="#ef4444")) 
        dwg.add(dwg.text("REC", insert=(cam_x + cam_w - 55, cam_y + 35), font_size="14px", fill="#ef4444", font_weight="bold"))
        
        # Details Panel
        dwg.add(dwg.text("Asset Status: ACTIVE", insert=(30, wb_y + 80), class_="body"))
        dwg.add(dwg.text("Battery: 85%", insert=(30, wb_y + 110), class_="body"))
        dwg.add(dwg.text("Assigned Task: PATROL SECTOR 4", insert=(30, wb_y + 140), class_="body"))

    elif layout_type == "tickets":
        # Split View: List (Left) / Detail (Right)
        mid = WIDTH / 2
        dwg.add(dwg.line(start=(mid, 64), end=(mid, HEIGHT), stroke=THEME["border"]))
        
        dwg.add(dwg.text("TICKET QUEUE", insert=(20, 100), class_="section"))
        dwg.add(dwg.text("DETAILS & TIMELINE", insert=(mid + 20, 100), class_="section"))
        
        # Evidence Grid
        dwg.add(dwg.text("MEDIA EVIDENCE", insert=(mid + 20, 400), class_="section"))
        for i in range(3):
            dwg.add(dwg.rect(insert=(mid + 20 + i*160, 430), size=(150, 100), fill=THEME["bg"], stroke=THEME["border"]))
            # Cross hatch for placeholder
            dwg.add(dwg.line(start=(mid + 20 + i*160, 430), end=(mid + 170 + i*160, 530), stroke=THEME["border"]))
            dwg.add(dwg.text("JPG", insert=(mid + 80 + i*160, 480), class_="meta"))

    elif layout_type == "simulation":
        # Injector Grid
        dwg.add(dwg.text("ENTITY INJECTOR CONTROL", insert=(20, 100), class_="header"))
        
        cols = ["VISITOR", "VEHICLE", "ROBOT"]
        col_w = (WIDTH - 400) / 3
        
        for i, col in enumerate(cols):
            cx = 20 + i * col_w
            dwg.add(dwg.rect(insert=(cx, 150), size=(col_w - 20, 600), fill=THEME["surface"], stroke=THEME["border"]))
            dwg.add(dwg.text(f"{col} INJECTION", insert=(cx + 20, 200), class_="section"))
            
            # Param Fields
            dwg.add(dwg.rect(insert=(cx + 20, 250), size=(col_w - 60, 40), fill=THEME["bg"], stroke=THEME["border"]))
            dwg.add(dwg.text("ID / Name", insert=(cx + 30, 275), class_="dense"))
            
            dwg.add(dwg.rect(insert=(cx + 20, 310), size=(col_w - 60, 40), fill=THEME["bg"], stroke=THEME["border"]))
            dwg.add(dwg.text("Location (X, Y)", insert=(cx + 30, 335), class_="dense"))
            
            # Button
            dwg.add(dwg.rect(insert=(cx + 20, 500), size=(col_w - 60, 60), fill=THEME["accent"], rx=4))
            dwg.add(dwg.text("INJECT EVENT", insert=(cx + 40, 540), fill="#ffffff", font_size="20px", font_weight="bold"))

        # Audit Log
        min_log = WIDTH - 350
        dwg.add(dwg.rect(insert=(min_log, 64), size=(350, HEIGHT - 64), fill=THEME["bg"], stroke=THEME["border"]))
        dwg.add(dwg.text("AUDIT LOG", insert=(min_log + 20, 100), class_="section"))
        for k in range(10):
            dwg.add(dwg.text(f"[10:42:{k*5}] Event Dispatched", insert=(min_log + 20, 150 + k*30), class_="dense"))

    elif layout_type == "analytics":
         # KPI Row
        for i in range(4):
            x = 20 + i * ((WIDTH - 40) / 4)
            dwg.add(dwg.rect(insert=(x, 100), size=((WIDTH - 60) / 4, 150), fill=THEME["surface"], stroke=THEME["border"], stroke_width=1))
            dwg.add(dwg.text("KPI METRIC", insert=(x + 20, 140), class_="meta"))
            dwg.add(dwg.text("98.5%", insert=(x + 20, 200), font_size="48px", font_weight="bold", fill=THEME["accent"]))
        
        # Charts
        dwg.add(dwg.rect(insert=(20, 300), size=(WIDTH - 400, 700), fill=THEME["surface"], stroke=THEME["border"]))
        dwg.add(dwg.text("TREND CHARTS (PLACEHOLDER)", insert=(WIDTH/3, 600), font_size="32px", fill=THEME["text_muted"], opacity="0.3"))
        
        # Filters
        dwg.add(dwg.rect(insert=(WIDTH - 360, 300), size=(340, 700), fill=THEME["surface"], stroke=THEME["border"]))
        dwg.add(dwg.text("FILTERS", insert=(WIDTH - 340, 340), class_="section"))

    elif layout_type == "global_states":
        # Divide into 4 Quadrants
        dwg.add(dwg.line(start=(WIDTH/2, 64), end=(WIDTH/2, HEIGHT), stroke=THEME["border"]))
        dwg.add(dwg.line(start=(0, HEIGHT/2), end=(WIDTH, HEIGHT/2), stroke=THEME["border"]))
        
        # 1. Loading
        dwg.add(dwg.text("1. LOADING STATE", insert=(20, 100), class_="section"))
        dwg.add(dwg.rect(insert=(50, 150), size=(300, 200), fill=THEME["surface"], stroke=THEME["border"]))
        # Skeleton
        dwg.add(dwg.rect(insert=(70, 170), size=(200, 20), fill="#e5e7eb"))
        dwg.add(dwg.rect(insert=(70, 210), size=(260, 10), fill="#f3f4f6"))
        dwg.add(dwg.rect(insert=(70, 230), size=(260, 10), fill="#f3f4f6"))
        dwg.add(dwg.rect(insert=(70, 250), size=(180, 10), fill="#f3f4f6"))
        
        # 2. Empty
        dwg.add(dwg.text("2. EMPTY STATE", insert=(WIDTH/2 + 20, 100), class_="section"))
        dwg.add(dwg.rect(insert=(WIDTH/2 + 50, 150), size=(300, 200), fill=THEME["surface"], stroke=THEME["border"]))
        dwg.add(dwg.circle(center=(WIDTH/2 + 200, 220), r=30, fill="none", stroke=THEME["text_muted"], stroke_dasharray="4,4"))
        dwg.add(dwg.text("No Items Found", insert=(WIDTH/2 + 150, 280), class_="body"))
        
        # 3. Error
        dwg.add(dwg.text("3. ERROR STATE", insert=(20, HEIGHT/2 + 50), class_="section"))
        dwg.add(dwg.rect(insert=(50, HEIGHT/2 + 100), size=(300, 200), fill="#fef2f2", stroke=THEME["critical"]))
        dwg.add(dwg.text("!", insert=(190, HEIGHT/2 + 160), font_size="48px", fill=THEME["critical"], font_weight="bold"))
        dwg.add(dwg.text("Connection Failed", insert=(130, HEIGHT/2 + 220), class_="body", fill=THEME["critical"]))
        
        # 4. Reduced Motion
        dwg.add(dwg.text("4. REDUCED MOTION", insert=(WIDTH/2 + 20, HEIGHT/2 + 50), class_="section"))
        dwg.add(dwg.rect(insert=(WIDTH/2 + 50, HEIGHT/2 + 100), size=(300, 200), fill=THEME["surface"], stroke=THEME["border"]))
        dwg.add(dwg.rect(insert=(WIDTH/2 + 150, HEIGHT/2 + 180), size=(60, 30), rx=15, fill=THEME["accent"]))
        dwg.add(dwg.circle(center=(WIDTH/2 + 195, HEIGHT/2 + 195), r=12, fill="#ffffff"))
        dwg.add(dwg.text("Animations: OFF", insert=(WIDTH/2 + 140, HEIGHT/2 + 240), class_="body"))

    # Metadata Footer (Mandatory per Master Authority)
    dwg.add(dwg.text(f"Resolution: {WIDTH}x{HEIGHT} | Version: {timestamp} | Mode: POLAR - LOCKED", insert=(WIDTH - 450, 42), class_="meta"))
    
    # Save Logic (One folder per route)
    # Extract route from context_name (e.g., "/ops - ...")
    route_dir = context_name.split(" - ")[0].strip().lstrip("/")
    if layout_type == "global_states":
        route_dir = "global"
    
    output_dir = os.path.join("docs/design", route_dir)
    os.makedirs(output_dir, exist_ok=True)
    
    # Filename should be just the name, path handled by output_dir
    full_path = os.path.join(output_dir, filename)
    dwg.saveas(full_path)

if __name__ == "__main__":
    # Base dir cleared or managed by os.makedirs
    
    # 1. /ops (Master Map + Live Cam)
    create_wireframe("ops_master.svg", "/ops - OPERATION COMMAND", "3zone", "master")
    
    # 2. /fleet (Terminal Map + Dashcam)
    create_wireframe("fleet_terminal.svg", "/fleet - VEHICLE MANAGEMENT", "3zone", "terminal")
    
    # 3. /robots (Terminal Map + Robot Optic)
    create_wireframe("robots_terminal.svg", "/robots - AUTONOMOUS SYSTEMS", "3zone", "terminal")
    
    # 4. /tickets (Timeline + Media)
    create_wireframe("tickets_timeline.svg", "/tickets - RESOLUTION", "tickets")
    
    # 5. /analytics
    create_wireframe("analytics_kpi.svg", "/analytics - OVERSIGHT", "analytics")
    
    # 6. /simulation (Entity Injector)
    create_wireframe("simulation_injector.svg", "/simulation - ENTITY CONTROL", "simulation")

    # 7. Global States
    create_wireframe("global_states.svg", "GLOBAL UI STATES", "global_states")

    print("Polar Wireframe Package Generated (Route Folders).")
