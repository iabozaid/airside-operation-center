import svgwrite
import os

def create_demo_diagram():
    output_dir = "docs/demo"
    os.makedirs(output_dir, exist_ok=True)
    filename = os.path.join(output_dir, "demo_architecture_diagram.svg")
    
    dwg = svgwrite.Drawing(filename, size=(1000, 800))
    
    # Styles
    dwg.defs.add(dwg.style("""
        text { font-family: 'Inter', sans-serif; }
        .title { font-size: 24px; font-weight: bold; fill: #111827; }
        .label { font-size: 14px; fill: #374151; }
        .box-label { font-size: 16px; font-weight: bold; fill: #1f2937; }
        .arrow { stroke: #6b7280; stroke-width: 2; fill: none; marker-end: url(#arrowhead); }
        .store { fill: #EFF6FF; stroke: #3B82F6; stroke-width: 2; }
        .mutable { fill: #FEF2F2; stroke: #EF4444; stroke-width: 2; }
        .log { fill: #F0FDF4; stroke: #22C55E; stroke-width: 2; }
        .sim { fill: #F3F4F6; stroke: #4B5563; stroke-width: 2; stroke-dasharray: 5,5; }
    """))
    
    # Arrow Marker
    marker = dwg.marker(insert=(10,5), size=(10,10), orient="auto", id="arrowhead")
    marker.add(dwg.path(d="M0,0 L10,5 L0,10", fill="#6b7280"))
    dwg.defs.add(marker)
    
    # Background
    dwg.add(dwg.rect(insert=(0,0), size=(1000, 800), fill="#ffffff"))
    dwg.add(dwg.text("DEMO ARCHITECTURE: 3-STORE MODEL", insert=(50, 50), class_="title"))

    # --- Backend Zone ---
    dwg.add(dwg.rect(insert=(50, 100), size=(900, 400), rx=10, fill="none", stroke="#e5e7eb", stroke_width=2))
    dwg.add(dwg.text("BACKEND (DEMO_MODE=1)", insert=(70, 130), class_="label"))
    
    # 1. Historical Store (Immutable)
    dwg.add(dwg.rect(insert=(100, 200), size=(200, 100), rx=5, class_="store"))
    dwg.add(dwg.text("HISTORICAL STORE", insert=(120, 230), class_="box-label"))
    dwg.add(dwg.text("(Immutable Baseline)", insert=(120, 250), class_="label"))
    dwg.add(dwg.text("Seeded @ Boot (T-12h)", insert=(120, 270), class_="label", font_size="12px"))

    # 2. Operational Store (Mutable)
    dwg.add(dwg.rect(insert=(400, 200), size=(200, 100), rx=5, class_="mutable"))
    dwg.add(dwg.text("OPERATIONAL STORE", insert=(420, 230), class_="box-label"))
    dwg.add(dwg.text("(Mutable Current)", insert=(420, 250), class_="label"))
    dwg.add(dwg.text("Modified by Sim Only", insert=(420, 270), class_="label", font_size="12px"))

    # 3. Log (Append Only)
    dwg.add(dwg.rect(insert=(700, 200), size=(200, 100), rx=5, class_="log"))
    dwg.add(dwg.text("EVENT LOG", insert=(720, 230), class_="box-label"))
    dwg.add(dwg.text("(Append Only)", insert=(720, 250), class_="label"))
    dwg.add(dwg.text("Audit Trail", insert=(720, 270), class_="label", font_size="12px"))

    # Simulation Engine
    dwg.add(dwg.circle(center=(500, 420), r=50, class_="sim"))
    dwg.add(dwg.text("SIMULATION", insert=(455, 425), class_="box-label", font_size="14px"))
    dwg.add(dwg.text("ENGINE", insert=(470, 445), class_="box-label", font_size="14px"))

    # Flow Arrows
    # Sim -> Ops Store
    dwg.add(dwg.line(start=(500, 370), end=(500, 300), class_="arrow"))
    # Sim -> Log
    dwg.add(dwg.line(start=(550, 420), end=(700, 280), class_="arrow"))
    
    # Read Paths
    dwg.add(dwg.text("State Merging (Read)", insert=(250, 180), class_="label", font_size="10px"))
    dwg.add(dwg.path(d="M200,200 L300,160 L400,200", stroke="#9CA3AF", fill="none", stroke_dasharray="4,4"))

    # --- Frontend Zone ---
    dwg.add(dwg.rect(insert=(50, 550), size=(900, 200), rx=10, fill="none", stroke="#e5e7eb", stroke_width=2))
    dwg.add(dwg.text("FRONTEND (POLAR)", insert=(70, 580), class_="label"))

    # UI Components
    dwg.add(dwg.rect(insert=(100, 620), size=(180, 80), rx=5, fill="#f3f4f6", stroke="#d1d5db"))
    dwg.add(dwg.text("Historical View", insert=(120, 650), class_="box-label"))
    dwg.add(dwg.text("(Get /incidents)", insert=(120, 670), class_="label", font_size="12px"))

    dwg.add(dwg.rect(insert=(400, 620), size=(180, 80), rx=5, fill="#fefce8", stroke="#eab308"))
    dwg.add(dwg.text("Live Overlay", insert=(420, 650), class_="box-label"))
    dwg.add(dwg.text("(SSE /stream/ops)", insert=(420, 670), class_="label", font_size="12px"))

    # Data Flow
    # GET
    dwg.add(dwg.line(start=(190, 620), end=(190, 300), class_="arrow"))
    dwg.add(dwg.text("Initial Fetch", insert=(200, 540), class_="label"))

    # SSE
    dwg.add(dwg.line(start=(750, 300), end=(580, 650), class_="arrow"))
    dwg.add(dwg.text("Real-Time Event Stream", insert=(650, 500), class_="label", font_weight="bold"))

    dwg.save()
    print(f"Diagram generated: {filename}")

if __name__ == "__main__":
    create_demo_diagram()
