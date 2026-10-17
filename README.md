# ADP Tech Computers - Kanchipuram

A production-ready, fullstack web platform for **Computer Hardware, Laptop Repair & Chip-Level Motherboard Servicing** localized for **Kanchipuram, Tamil Nadu**.

- **Business Name**: ADP Tech Computers
- **Address**: 33b, Thirumetrali Street, Pillaiyar Palayam, Kanchipuram - 631501, Tamil Nadu
- **Contact Number**: 7806888984 (Direct Call & WhatsApp)

---

## 🚀 Free Hosting Guide (100% Free, Zero Cost)

Here are the easiest methods to host this site on the web for free:

### Method 1: Render.com (Recommended - Easiest & Automatic)

Render gives you a **free public URL** (e.g., `https://adp-tech-computers.onrender.com`) with a free SSL certificate (`https://`).

1. **Step 1: Put your project on GitHub**
   - Create a free account at [github.com](https://github.com) if you don't have one.
   - Create a new repository named `adp-tech-computers`.
   - In your project folder, open terminal and push the code:
     ```bash
     git init
     git add .
     git commit -m "ADP Tech Computers initial release"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/adp-tech-computers.git
     git push -u origin main
     ```

2. **Step 2: Sign up on Render.com**
   - Go to [render.com](https://render.com) and click **Sign Up** using your GitHub account.

3. **Step 3: Create a Free Web Service**
   - Click the blue **New +** button at the top and select **Web Service**.
   - Choose **Build and deploy from a Git repository**.
   - Select your repository `adp-tech-computers`.
   - Settings:
     - **Name**: `adp-tech-computers`
     - **Region**: Singapore or Frankfurt (fastest for India)
     - **Branch**: `main`
     - **Runtime**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn app:app`
     - **Instance Type**: Select **Free** ($0 / month)
   - Click **Create Web Service**.

4. **Step 4: Live!**
   - Render will build your site in ~2 minutes.
   - Your live website URL will be displayed at the top: `https://adp-tech-computers.onrender.com`.

---

### Method 2: PythonAnywhere (100% Free Forever - No Card Needed)

1. Create a free beginner account at [pythonanywhere.com](https://www.pythonanywhere.com).
2. Go to the **Consoles** tab and start a **Bash** console.
3. Clone your GitHub repository or upload your files:
   ```bash
   git clone https://github.com/YOUR_USERNAME/adp-tech-computers.git
   cd adp-tech-computers
   pip install -r requirements.txt
   ```
4. Go to the **Web** tab:
   - Click **Add a new web app**.
   - Select **Manual configuration** -> **Python 3.10 / 3.11 / 3.12**.
   - Under **Code**, set Source code path to `/home/YOUR_USERNAME/adp-tech-computers`.
   - Click on the **WSGI configuration file** link and replace its content with:
     ```python
     import sys
     path = '/home/YOUR_USERNAME/adp-tech-computers'
     if path not in sys.path:
         sys.path.append(path)
     from app import app as application
     ```
   - Click the green **Reload** button at the top.
5. Your site is live at `https://YOUR_USERNAME.pythonanywhere.com`!

---

### Method 3: Vercel (1-Click Deployment)

1. Install the Vercel CLI or visit [vercel.com](https://vercel.com).
2. Import your GitHub repository.
3. Vercel will automatically read the included [`vercel.json`](vercel.json) and deploy your site immediately with a free `vercel.app` domain.

---

## 🛠️ The 9 Simple Core Services & Fair Kanchipuram Rates

| # | Service Name | Scope | Fair Rate |
|---|---|---|---|
| 1 | **DeskTop Service** | Deep dust blowout, thermal repasting, OS optimization, health check | **₹399** |
| 2 | **Chip Level process** | BGA rework, micro-soldering, short-circuit detection, IC replacement | **₹999** |
| 3 | **Motherboard Check** | 19V/5V/3.3V rail voltage check, capacitor replacement, BIOS flash | **₹499** |
| 4 | **SMPS Service** | Power supply repair, blown fuse & varistor fix, voltage stabilization | **₹349** |
| 5 | **RAM and Processer Issue** | BSOD crash analysis, memory slot cleaning, thermal throttle fix | **₹299** |
| 6 | **Display Complaint** | Screen flickering fix, 14"/15.6" IPS panel replacement, hinge repair | **₹499** |
| 7 | **Printer Service** | Paper jam fixes, pickup roller replacement, cartridge toner refilling | **₹449** |
| 8 | **Scanner Service** | Flatbed & ADF roller repair, lamp replacement, scanner calibration | **₹399** |
| 9 | **Laptop Service** | Complete disassembly, fan de-clogging, keyboard, DC jack repair | **₹499** |

---

## 🏃 Running Locally on Windows

Double-click `run.bat` or run:
```powershell
python app.py
```
- **Website**: `http://127.0.0.1:5000`
- **Admin Desk**: `http://127.0.0.1:5000/admin`
