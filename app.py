"""
Flask Backend Application for ADP Tech Computers - Kanchipuram
Address: 33b, Thirumetrali Street, Pillaiyar Palayam, Kanchipuram
Contact: 7806888984
Features REST APIs for Customer Queries, Service Appointments, 9 Core Services,
Products, Admin Management, and serves the responsive modern frontend.
"""
import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from datetime import datetime
import database

# Initialize database
database.init_db()

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# --- WEB PAGE ROUTES ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/services')
def services_page():
    return render_template('index.html', active_tab='services')

@app.route('/products')
def products_page():
    return render_template('index.html', active_tab='products')

@app.route('/achievements')
def achievements_page():
    return render_template('index.html', active_tab='achievements')

@app.route('/about')
def about_page():
    return render_template('index.html', active_tab='about')

@app.route('/contact')
def contact_page():
    return render_template('index.html', active_tab='contact')

@app.route('/admin')
def admin_page():
    return render_template('admin.html')

# --- REST API ENDPOINTS ---

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for cloud hosting providers (Render, Railway, AWS, PythonAnywhere)"""
    return jsonify({
        'status': 'healthy',
        'service': 'ADP Tech Computers - Kanchipuram Platform',
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'version': '3.0.0'
    })

@app.route('/api/products', methods=['GET'])
def get_products():
    """Retrieve catalog of spare parts, RAM, SSDs, SMPS, and displays"""
    category = request.args.get('category')
    products = database.get_products(category)
    return jsonify({'success': True, 'count': len(products), 'data': products})

@app.route('/api/services', methods=['GET'])
def get_services():
    """Retrieve all 9 core hardware and chip-level repair services with fair Kanchipuram pricing"""
    services = database.get_services()
    return jsonify({'success': True, 'count': len(services), 'data': services})

@app.route('/api/inquiries', methods=['GET', 'POST'])
def handle_inquiries():
    """
    POST: Submit customer repair query / quotation form
    GET: List all customer inquiries for admin review
    """
    if request.method == 'POST':
        data = request.get_json(silent=True) or request.form.to_dict()
        
        if not data.get('name') or not data.get('phone') or not data.get('message'):
            return jsonify({
                'success': False,
                'error': 'Missing required fields: Name, Phone number, and Complaint details are required.'
            }), 400

        try:
            inquiry = database.create_inquiry(data)
            return jsonify({
                'success': True,
                'message': 'Your repair query has been logged with ADP Tech Computers service desk.',
                'ticket_id': inquiry['ticket_id'],
                'data': inquiry
            }), 201
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    else:
        status = request.args.get('status')
        search = request.args.get('search')
        inquiries = database.get_all_inquiries(status=status, search=search)
        return jsonify({'success': True, 'count': len(inquiries), 'data': inquiries})

@app.route('/api/inquiries/<inquiry_id>/status', methods=['PATCH'])
def update_inquiry_status(inquiry_id):
    """Update status of a customer query ticket (New, In Review, Contacted, Resolved)"""
    data = request.get_json(silent=True) or {}
    new_status = data.get('status')
    if not new_status:
        return jsonify({'success': False, 'error': 'Status is required'}), 400

    success = database.update_inquiry_status(inquiry_id, new_status)
    return jsonify({'success': success, 'message': f'Ticket status updated to {new_status}'})

@app.route('/api/appointments', methods=['GET', 'POST'])
def handle_appointments():
    """
    POST: Book an appointment for doorstep pickup or carry-in service in Kanchipuram
    GET: Retrieve scheduled appointments for admin desk
    """
    if request.method == 'POST':
        data = request.get_json(silent=True) or request.form.to_dict()

        required = ['name', 'phone', 'service', 'appointment_date', 'time_slot']
        missing = [f for f in required if not data.get(f)]
        if missing:
            return jsonify({
                'success': False,
                'error': f'Please fill in all required booking fields: {", ".join(missing)}'
            }), 400

        try:
            appointment = database.create_appointment(data)
            return jsonify({
                'success': True,
                'message': 'Service appointment confirmed with ADP Tech Computers!',
                'booking_ref': appointment['booking_ref'],
                'data': appointment
            }), 201
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    else:
        status = request.args.get('status')
        search = request.args.get('search')
        appointments = database.get_all_appointments(status=status, search=search)
        return jsonify({'success': True, 'count': len(appointments), 'data': appointments})

@app.route('/api/appointments/<appt_id>/status', methods=['PATCH'])
def update_appointment_status(appt_id):
    """Update status of an appointment (Confirmed, Rescheduled, Completed, Cancelled)"""
    data = request.get_json(silent=True) or {}
    new_status = data.get('status')
    if not new_status:
        return jsonify({'success': False, 'error': 'Status is required'}), 400

    success = database.update_appointment_status(appt_id, new_status)
    return jsonify({'success': success, 'message': f'Appointment status updated to {new_status}'})

@app.route('/api/dashboard/stats', methods=['GET'])
def dashboard_stats():
    """Retrieve operational and business statistics for the admin dashboard"""
    stats = database.get_dashboard_stats()
    return jsonify({'success': True, 'data': stats})

@app.route('/api/newsletter', methods=['POST'])
def newsletter_signup():
    """Subscribe to special discount offers & upgrade announcements"""
    data = request.get_json(silent=True) or request.form.to_dict()
    email = data.get('email')
    if not email or '@' not in email:
        return jsonify({'success': False, 'error': 'Please provide a valid email address'}), 400

    database.add_newsletter(email)
    return jsonify({'success': True, 'message': 'Subscribed to ADP Tech Computers Service Updates!'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 ADP Tech Computers Portal running on http://127.0.0.1:{port}")
    print(f"📍 Address: 33b, Thirumetrali Street, Pillaiyar Palayam, Kanchipuram")
    print(f"📞 Contact: 7806888984")
    print(f"📊 Admin Dashboard available at: http://127.0.0.1:{port}/admin")
    app.run(host='0.0.0.0', port=port, debug=True)
