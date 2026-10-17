"""
Database layer for ADP Tech Computers - Kanchipuram
Features 9 core hardware & chip-level repair services and fair-priced components.
Address: 33b, Thirumetrali Street, Pillaiyar Palayam, Kanchipuram
Contact: 7806888984
"""
import sqlite3
import os
import random
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'it_services.db')

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(force_reseed=False):
    conn = get_connection()
    cursor = conn.cursor()

    # Inquiries (Customer Query Form)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            company TEXT,
            service_category TEXT NOT NULL,
            urgency TEXT DEFAULT 'Standard',
            subject TEXT,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'New',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Appointments (Booking Process)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_ref TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            company TEXT,
            service TEXT NOT NULL,
            appointment_date TEXT NOT NULL,
            time_slot TEXT NOT NULL,
            meeting_type TEXT DEFAULT 'Doorstep Pickup (Kanchipuram)',
            notes TEXT,
            status TEXT DEFAULT 'Confirmed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Products Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            badge TEXT,
            price_display TEXT NOT NULL,
            description TEXT NOT NULL,
            specs TEXT NOT NULL,
            image_icon TEXT NOT NULL,
            featured INTEGER DEFAULT 0
        )
    ''')

    # Services Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            service_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            short_desc TEXT NOT NULL,
            full_desc TEXT NOT NULL,
            sla TEXT NOT NULL,
            features TEXT NOT NULL,
            icon TEXT NOT NULL,
            price_inr TEXT NOT NULL
        )
    ''')

    # Newsletter Subscribers
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS newsletter (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()

    cursor.execute('SELECT COUNT(*) as cnt FROM services')
    service_count = cursor.fetchone()['cnt']
    if service_count != 9 or force_reseed:
        cursor.execute('DELETE FROM services')
        cursor.execute('DELETE FROM products')
        cursor.execute('DELETE FROM inquiries')
        cursor.execute('DELETE FROM appointments')
        conn.commit()
        seed_services(cursor, conn)
        seed_products(cursor, conn)
        seed_sample_data(cursor, conn)

    conn.close()

def seed_services(cursor, conn):
    services_data = [
        (
            'SERV-DESKTOP',
            'DeskTop Service',
            'Full cabinet deep cleaning, dust blower cleaning, thermal paste repasting, OS optimization & hardware health check in Kanchipuram.',
            'Comprehensive servicing for all desktop PCs (assembled, Dell OptiPlex, HP, Lenovo). Resolves slow boot times, random freezing, interior dust accumulation, and noisy cabinet fans.',
            'Turnaround: Same Day | 30 Days Warranty',
            'High-Pressure Dust Blowout|Processor & Heatsink Thermal Repasting|OS Junk Cleanup & Antivirus Scan|Cabinet Fan & Airflow Optimization|Hard Disk / SSD Health Check',
            'fa-solid fa-desktop',
            '₹399'
        ),
        (
            'SERV-CHIP-LEVEL',
            'Chip Level process',
            'Advanced BGA rework, micro-soldering, short circuit detection via thermal camera, and faulty IC replacement under stereo microscope.',
            'Precision chip-level repair for dead motherboards and liquid-damaged laptops in Kanchipuram. We replace charging ICs, I/O controllers (ITE/Nuvoton), MOSFETs, and re-ball GPU/Chipsets.',
            'Turnaround: 24-48 Hours | 90 Days Warranty',
            'Infrared BGA Machine Chip Reballing|Short Circuit Detection via DC Power Meter|Power IC & Charging Controller Replacement|Liquid Spill Corrosion Cleaning|Burnt Track Micro-Jumpering',
            'fa-solid fa-microchip',
            '₹999'
        ),
        (
            'SERV-MOTHERBOARD',
            'Motherboard Check',
            'No-power diagnosis, 19V/5V/3.3V rail voltage testing, swollen capacitor replacement, and EEPROM BIOS chip reprogramming.',
            'Full board-level checkup for Intel & AMD motherboards. We test standby voltages, clock generator signals, and diagnose continuous beeping, blank screen on startup, and auto-restart issues.',
            'Turnaround: 24 Hours | Genuine OEM Parts',
            'Multimeter Rail Voltage Testing|BIOS Flash & Firmware Recovery|Solid Capacitor & MOSFET Replacement|CMOS Battery & RTC Circuit Testing|Processor Socket Pin Straightening',
            'fa-solid fa-memory',
            '₹499'
        ),
        (
            'SERV-SMPS',
            'SMPS Service',
            'Desktop power supply repair, blown fuse & varistor replacement, voltage fluctuation fixes, and fan servicing.',
            'Expert service for all 450W-1000W SMPS units (Ant Esports, Corsair, Circle, Zebronics). Resolves PC not powering on, electrical burning smell, tripping breaker, and unstable output voltages.',
            'Turnaround: Same Day | Load-Tester Certified',
            'Primary & Secondary Circuit Rectification|High-Voltage Filter Capacitor Replacement|Overvoltage Protection (OVP) Testing|12V, 5V & 3.3V Rail Load Testing|Internal Fan Bearing Lubrication',
            'fa-solid fa-bolt',
            '₹349'
        ),
        (
            'SERV-RAM-CPU',
            'RAM and Processer Issue',
            'Fix for Blue Screen of Death (BSOD), memory slot oxidization cleaning, RAM speed mismatch, and CPU thermal throttling fixes.',
            'Pinpoint diagnosis for memory faults and processor bottlenecks. We run MemTest86 diagnostic passes, clean oxidized gold finger contacts, and upgrade your processor with optimal cooler heatsinks.',
            'Turnaround: 1-2 Hours | Instant Diagnostics',
            'BSOD Memory Dump Crash Analysis|RAM Slot Contact Cleaning & Repair|MemTest86 100% Bit-Error Diagnostic|CPU Overheating & Throttle Remediation|Dual-Channel Matching & Speed Optimization',
            'fa-solid fa-microchip',
            '₹299'
        ),
        (
            'SERV-DISPLAY',
            'Display Complaint',
            'Resolution for blank screen, laptop display flickering, vertical/horizontal lines, cracked LED screen replacement, and hinge repair.',
            'Quick fix for laptop and desktop monitor display issues. We replace broken 14" and 15.6" HD/FHD IPS screens, repair pinched display eDP cables, and fabricate broken laptop body hinges with high-durability epoxy.',
            'Turnaround: 1 Hour for Screen Replacement',
            'Original Grade-A+ Screen Replacement|eDP Flex Cable Replacement & Repair|Backlight Inverter & Dim Screen Fix|Laptop Screen Hinge & Bezel Fabrication|GPU Ribbon Cable Re-seating',
            'fa-solid fa-tv',
            '₹499'
        ),
        (
            'SERV-PRINTER',
            'Printer Service',
            'Complete repair for HP, Canon, Epson, Brother printers in Kanchipuram. Paper jam fixes, pickup roller replacement, and printhead cleaning.',
            'Servicing for LaserJet and InkTank printers. We fix paper feed pickup issues, multiple sheet pulls, faded or blank printouts, carriage errors, and perform cartridge toner refilling with micro-fine powder.',
            'Turnaround: Same Day Service | Free Test Print',
            'LaserJet Pickup Roller & Separation Pad Change|InkTank Printhead Ultrasonic Cleaning|Toner Cartridge Refilling & Drum Replacement|Paper Jam & Carriage Path Alignment|Logic Board & Formatter Card Service',
            'fa-solid fa-print',
            '₹449'
        ),
        (
            'SERV-SCANNER',
            'Scanner Service',
            'Repair of flatbed & ADF document scanners. Lamp replacement, scanning sensor calibration, and driver setup.',
            'Reliable service for HP, Canon, Fujitsu, and Epson scanners. Fixes lines on scanned documents, scanner carriage not moving, calibration errors, and automatic document feeder (ADF) multi-page feed jams.',
            'Turnaround: Same Day Service | Driver Setup Included',
            'Scanner Glass & Optical Mirror Cleaning|ADF Roller Replacement & Tension Adjustment|Scanner Stepper Motor & Belt Repair|TWAIN / Network Driver Configuration|Sensor Calibration & Error Code Clearing',
            'fa-solid fa-scanner',
            '₹399'
        ),
        (
            'SERV-LAPTOP',
            'Laptop Service',
            'Complete laptop disassembly, copper heatsink de-clogging, keyboard replacement, DC charging jack fix, and body rework in Kanchipuram.',
            'End-to-end laptop servicing for Dell, HP, Lenovo, Acer, Asus, and MacBook. Solves severe overheating, sudden shutdown while working, non-working keys, loose charging pin, and broken corners.',
            'Turnaround: 2-3 Hours | Doorstep Pickup Across Kanchipuram',
            'Complete Deep Disassembly & Dust Cleaning|High-Conductivity Thermal Paste Repasting|Keyboard Replacement & Touchpad Tuning|DC Power Jack Re-soldering & Replacement|Hinges & Top/Bottom Base Fabrication',
            'fa-solid fa-laptop',
            '₹499'
        )
    ]

    cursor.executemany('''
        INSERT INTO services (service_id, name, short_desc, full_desc, sla, features, icon, price_inr)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', services_data)
    conn.commit()

def seed_products(cursor, conn):
    products_data = [
        (
            'PROD-RAM-DDR4',
            'Crucial 8GB / 16GB DDR4 3200MHz RAM',
            'Memory',
            'Original Stock',
            '₹1,499 (8GB) / ₹2,750 (16GB)',
            'High-speed desktop and laptop RAM upgrade for smooth multitasking, office work, and gaming. Compatible with Intel and AMD systems.',
            '3200MHz CL22 Low Latency|Available in Desktop (DIMM) & Laptop (SO-DIMM)|3-Year Manufacturer Replacement Warranty|Instant 10-Minute Installation in Kanchipuram|100% Tested Gold Finger Contacts',
            'fa-solid fa-memory',
            1
        ),
        (
            'PROD-SSD-NVME',
            'Crucial / WD 512GB NVMe M.2 High-Speed SSD',
            'Storage',
            'Best Speed Boost',
            '₹2,899 (With OS Migration)',
            'Transform your slow desktop or laptop into a lightning-fast machine. Boots Windows in 8 seconds. Includes free data backup & OS cloning in Kanchipuram.',
            'Up to 3,500 MB/s Read Speeds|PCIe Gen 3.0 / 4.0 x4 Interface|5-Year Limited Manufacturer Warranty|Free Data Migration & Windows Setup|Shock-Resistant Solid State Tech',
            'fa-solid fa-hard-drive',
            1
        ),
        (
            'PROD-SMPS-550',
            'Ant Esports VS500L / VS600L 500W SMPS',
            'Power Supply',
            'Heavy Duty',
            '₹1,999 (Fair Price)',
            'Stable power supply unit with 120mm silent cooling fan, over-voltage protection, and black flat cables for clean desktop cabinet airflow.',
            '500W Continuous Power Output|Single +12V High-Amperage Rail|Built-in Over Power & Short Circuit Protection|120mm Silent Hydraulic Bearing Fan|2-Year Replacement Warranty',
            'fa-solid fa-bolt',
            1
        ),
        (
            'PROD-DISP-156',
            '15.6" Full HD 1080p IPS Laptop Display Screen',
            'Displays',
            'Grade A+ Zero Pixel',
            '₹3,499 (Including Fitting)',
            'Brand-new replacement display for Dell, HP, Lenovo, Acer, and Asus 15.6-inch slim laptops. Crisp colors with 1920x1080 resolution and 30-pin connector.',
            '15.6 Inch Slim LED IPS Panel|Full HD (1920 x 1080) Resolution|30-Pin eDP Bottom-Right Connector|Matte Anti-Glare Finish|Tested for Zero Dead Pixels on Delivery',
            'fa-solid fa-tv',
            1
        ),
        (
            'PROD-MOTHERBOARD-H81',
            'Zeb-H81 / Zeb-H61 Micro-ATX Motherboard',
            'Motherboard',
            'Best Budget Replacement',
            '₹2,850',
            'Reliable replacement motherboard for Intel Core i3 / i5 / i7 (2nd, 3rd, 4th Gen). Features dual DDR3 slots, Gigabit LAN, HDMI, and VGA outputs.',
            'LGA 1150 / 1155 Socket Support|Dual DDR3 1600MHz Slots (Max 16GB)|USB 3.0 & SATA 6Gb/s Ports|Onboard Realtek HD Audio & Gigabit LAN|1-Year Warranty with Quick Service',
            'fa-solid fa-microchip',
            0
        ),
        (
            'PROD-TONER-12A',
            'HP 12A / 88A Premium Compatible Toner Cartridge',
            'Printer Supplies',
            'High Page Yield',
            '₹599 (Bulk: ₹520)',
            'Flawless dark black prints for office billing, documents, and school projects. Factory sealed with OPC drum and micro-fine magnetic toner powder.',
            'Up to 2,000 Crisp Black Pages Yield|Compatible with HP 1020, M1005, P1108, Canon 2900|Smudge-Free Laser Quality Prints|Eco-Friendly Recyclable Shell|Tested Before Delivery',
            'fa-solid fa-fill-drip',
            0
        ),
        (
            'PROD-THERMAL-MX4',
            'Arctic MX-4 High-Performance Thermal Paste (4g)',
            'Cooling & Accessories',
            'Overheating Fix',
            '₹499 (100% Original)',
            'The gold standard in thermal interface material. Reduces CPU and GPU operating temperatures by up to 12°C for cooler, quieter laptops and desktops.',
            'Carbon Micro-Particle Formula|8.5 W/mK Thermal Conductivity|Non-Electrical Conductive (100% Safe)|Long 8-Year Durability on Heatsink|Easy Syringe Applicator Tube',
            'fa-solid fa-temperature-arrow-down',
            0
        ),
        (
            'PROD-WIFI-ROUTER',
            'TP-Link / D-Link 300Mbps High-Gain Wi-Fi Router',
            'Networking',
            'Broadband Ready',
            '₹999',
            'Reliable home and shop Wi-Fi router compatible with BSNL Bharat Fibre, JioFiber, and Airtel in Kanchipuram.',
            '300Mbps 2.4GHz Wireless Transmission|2x 5dBi High-Gain External Antennas|4x Fast Ethernet LAN Ports|WPA3 Wireless Security Encryption|Easy Setup via Mobile App or Web',
            'fa-solid fa-wifi',
            0
        )
    ]

    cursor.executemany('''
        INSERT INTO products (product_id, name, category, badge, price_display, description, specs, image_icon, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', products_data)
    conn.commit()

def seed_sample_data(cursor, conn):
    sample_inquiries = [
        (
            'INQ-2026-3012',
            'R. Vignesh',
            'vignesh.kanchi@gmail.com',
            '7806888984',
            'Pillaiyar Palayam, Kanchipuram',
            'Chip Level process',
            'Critical (Emergency)',
            'Dell Laptop not turning on after power fluctuation',
            'Laptop is completely dead in Pillaiyar Palayam. No power LED when charger connected. Need chip level diagnosis and estimate.',
            'In Review',
            '2026-10-16 10:15:00'
        ),
        (
            'INQ-2026-3045',
            'K. Saravanan',
            'saravanan.silk@gmail.com',
            '98421 65432',
            'Gandhi Road, Kanchipuram',
            'Printer Service',
            'High (Target: 24-48 hrs)',
            'Billing counter HP 1020 printer paper jam & roller replacement',
            'Laser printer picks multiple sheets in our silk saree billing counter on Gandhi Road. Need roller service and toner refill.',
            'Contacted',
            '2026-10-16 16:30:00'
        ),
        (
            'INQ-2026-3088',
            'M. Dinakaran',
            'dina.tech@outlook.com',
            '97890 12345',
            'Ennaikaran, Kanchipuram',
            'DeskTop Service',
            'Standard',
            'Desktop slow speed & dust cleaning needed',
            'Desktop running very slow and fan making noise. Want SSD upgrade and full tower cleaning.',
            'New',
            '2026-10-17 09:20:00'
        )
    ]

    cursor.executemany('''
        INSERT INTO inquiries (ticket_id, name, email, phone, company, service_category, urgency, subject, message, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', sample_inquiries)

    sample_appointments = [
        (
            'APT-2026-4412',
            'S. Karthikeyan',
            'karthi.s@gmail.com',
            '7806888984',
            'Thirumetrali Street, Kanchipuram',
            'DeskTop Service',
            '2026-10-18',
            '10:00 AM - 11:30 AM',
            'Doorstep Service (At Your Home / Office in Kanchipuram)',
            'Computer overheating and shutting down. Need full dust blowout and thermal repasting.',
            'Confirmed',
            '2026-10-16 12:00:00'
        ),
        (
            'APT-2026-4438',
            'K. Jayanthi',
            'jayanthi.k@yahoo.com',
            '94432 98765',
            'Rangaswamy Kulam, Kanchipuram',
            'Display Complaint',
            '2026-10-18',
            '02:30 PM - 04:00 PM',
            'Carry-in to Service Center (Pillaiyar Palayam, Kanchipuram)',
            'Lenovo 15.6" screen display flickering with lines when moving lid.',
            'Confirmed',
            '2026-10-16 15:00:00'
        )
    ]

    cursor.executemany('''
        INSERT INTO appointments (booking_ref, name, email, phone, company, service, appointment_date, time_slot, meeting_type, notes, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', sample_appointments)
    conn.commit()

# --- Database Query Helpers ---

def create_inquiry(data):
    conn = get_connection()
    cursor = conn.cursor()
    ticket_id = f"INQ-2026-{random.randint(1000, 9999)}"
    cursor.execute('''
        INSERT INTO inquiries (ticket_id, name, email, phone, company, service_category, urgency, subject, message, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'New')
    ''', (
        ticket_id,
        data.get('name'),
        data.get('email'),
        data.get('phone', ''),
        data.get('company', 'Kanchipuram'),
        data.get('service_category', 'DeskTop Service'),
        data.get('urgency', 'Standard'),
        data.get('subject', 'ADP Tech Computer Service Query'),
        data.get('message', '')
    ))
    conn.commit()
    inquiry_id = cursor.lastrowid
    cursor.execute('SELECT * FROM inquiries WHERE id = ?', (inquiry_id,))
    row = dict(cursor.fetchone())
    conn.close()
    return row

def get_all_inquiries(status=None, search=None):
    conn = get_connection()
    cursor = conn.cursor()
    query = 'SELECT * FROM inquiries WHERE 1=1'
    params = []
    if status and status != 'All':
        query += ' AND status = ?'
        params.append(status)
    if search:
        query += ' AND (name LIKE ? OR company LIKE ? OR ticket_id LIKE ? OR email LIKE ?)'
        wildcard = f"%{search}%"
        params.extend([wildcard, wildcard, wildcard, wildcard])
    query += ' ORDER BY created_at DESC'
    cursor.execute(query, params)
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows

def update_inquiry_status(inquiry_id, new_status):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE inquiries SET status = ? WHERE id = ? OR ticket_id = ?', (new_status, inquiry_id, inquiry_id))
    conn.commit()
    conn.close()
    return True

def create_appointment(data):
    conn = get_connection()
    cursor = conn.cursor()
    booking_ref = f"APT-2026-{random.randint(1000, 9999)}"
    cursor.execute('''
        INSERT INTO appointments (booking_ref, name, email, phone, company, service, appointment_date, time_slot, meeting_type, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed')
    ''', (
        booking_ref,
        data.get('name'),
        data.get('email'),
        data.get('phone'),
        data.get('company', 'Kanchipuram'),
        data.get('service', 'DeskTop Service'),
        data.get('appointment_date'),
        data.get('time_slot'),
        data.get('meeting_type', 'Doorstep Pickup (Kanchipuram)'),
        data.get('notes', '')
    ))
    conn.commit()
    appt_id = cursor.lastrowid
    cursor.execute('SELECT * FROM appointments WHERE id = ?', (appt_id,))
    row = dict(cursor.fetchone())
    conn.close()
    return row

def get_all_appointments(status=None, search=None):
    conn = get_connection()
    cursor = conn.cursor()
    query = 'SELECT * FROM appointments WHERE 1=1'
    params = []
    if status and status != 'All':
        query += ' AND status = ?'
        params.append(status)
    if search:
        query += ' AND (name LIKE ? OR company LIKE ? OR booking_ref LIKE ? OR service LIKE ?)'
        wildcard = f"%{search}%"
        params.extend([wildcard, wildcard, wildcard, wildcard])
    query += ' ORDER BY appointment_date ASC, time_slot ASC'
    cursor.execute(query, params)
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows

def update_appointment_status(appt_id, new_status):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE appointments SET status = ? WHERE id = ? OR booking_ref = ?', (new_status, appt_id, appt_id))
    conn.commit()
    conn.close()
    return True

def get_products(category=None):
    conn = get_connection()
    cursor = conn.cursor()
    if category and category != 'All':
        cursor.execute('SELECT * FROM products WHERE category = ? ORDER BY featured DESC, id ASC', (category,))
    else:
        cursor.execute('SELECT * FROM products ORDER BY featured DESC, id ASC')
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows

def get_services():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM services ORDER BY id ASC')
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows

def add_newsletter(email):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO newsletter (email) VALUES (?)', (email,))
        conn.commit()
        success = True
    except sqlite3.IntegrityError:
        success = True
    conn.close()
    return success

def get_dashboard_stats():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) as total_inquiries FROM inquiries')
    total_inquiries = cursor.fetchone()['total_inquiries']

    cursor.execute("SELECT COUNT(*) as pending_inquiries FROM inquiries WHERE status IN ('New', 'In Review')")
    pending_inquiries = cursor.fetchone()['pending_inquiries']

    cursor.execute('SELECT COUNT(*) as total_appointments FROM appointments')
    total_appointments = cursor.fetchone()['total_appointments']

    cursor.execute("SELECT COUNT(*) as upcoming_appointments FROM appointments WHERE status = 'Confirmed'")
    upcoming_appointments = cursor.fetchone()['upcoming_appointments']

    cursor.execute('SELECT COUNT(*) as total_products FROM products')
    total_products = cursor.fetchone()['total_products']

    cursor.execute('SELECT COUNT(*) as total_services FROM services')
    total_services = cursor.fetchone()['total_services']

    conn.close()

    return {
        'total_inquiries': total_inquiries,
        'pending_inquiries': pending_inquiries,
        'total_appointments': total_appointments,
        'upcoming_appointments': upcoming_appointments,
        'total_products': total_products,
        'total_services': total_services,
        'recovery_rate': '98.8%',
        'avg_turnaround': '2.4 Hours'
    }
