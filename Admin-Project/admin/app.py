import os
import sqlite3
import random
import smtplib
from email.message import EmailMessage
from flask import Flask, render_template, request, jsonify, session, redirect

# -------------------------------------------------
# APP INIT (CORRECT FOR YOUR STRUCTURE)
# -------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# BASE_DIR → Admin-Project/

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static")
)

app.secret_key = "super_secret_key"

EMAIL_ADDRESS = os.environ.get("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD")


DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")


print("EMAIL_ADDRESS =", EMAIL_ADDRESS)
print("EMAIL_PASSWORD =", EMAIL_PASSWORD)


# -------------------------------------------------
# DATABASE
# -------------------------------------------------

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL")

def get_db():
    return sqlite3.connect(DB_PATH, check_same_thread=False)

with get_db() as db:
    db.execute("""
        CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password TEXT,
            otp TEXT
        )
    """)

    db.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            image TEXT,
            description TEXT,
            link TEXT
        )
    """)

    admin_exists = db.execute("SELECT id FROM admin").fetchone()

    if not admin_exists:
        if not ADMIN_EMAIL:
            raise Exception("ADMIN_EMAIL is not set")

        db.execute(
            "INSERT INTO admin (email, password) VALUES (?, ?)",
            (ADMIN_EMAIL, "admin123")
        )
    db.commit()



# ========= EMAIL OTP VERIFICATION FOR LOGIN PAGE ============

def send_otp_email(to_email, otp):
    if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
        print("EMAIL CONFIG NOT SET")
        return

    msg = EmailMessage()
    msg["Subject"] = "Your Admin Login OTP"
    msg["From"] = "Login OTP"
    msg["To"] = to_email
    msg.set_content(f"""
Your OTP for admin login is:

{otp}

This OTP is valid for 5 minutes.
If you did not request this, ignore this email.
""")

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        smtp.send_message(msg)




# ================= CONTACT PAGE EMAIL VERIFICATION =================

contact_otp_store = {}

def send_contact_mail(to, subject, body):
    try:
        msg = EmailMessage()
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = to
        msg["Subject"] = subject
        msg.set_content(body)

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)

        print("EMAIL SENT SUCCESSFULLY")

    except Exception as e:
        print("EMAIL FAILED:", str(e))



@app.route("/contact/send-otp", methods=["POST"])
def contact_send_otp():
    email = request.json["email"]

    otp = str(random.randint(100000, 999999))
    contact_otp_store[email] = otp

    send_contact_mail(email, "Verify your email", f"Your OTP is: {otp}")

    return jsonify({"success": True})


@app.route("/contact/verify-otp", methods=["POST"])
def contact_verify_otp():
    email = request.json["email"]
    otp = request.json["otp"]

    if contact_otp_store.get(email) == otp:
        session["contact_verified"] = email
        return jsonify({"success": True})

    return jsonify({"success": False})


@app.route("/contact/send-message", methods=["POST"])
def contact_send_message():
    if "contact_verified" not in session:
        return jsonify({"error": "Email not verified"}), 403

    data = request.json

    msg = f"""
Name: {data['name']}
Email: {data['email']}

Message:
{data['message']}
"""

    send_contact_mail(ADMIN_EMAIL, "New Contact Message", msg)


    session.pop("contact_verified", None)

    return jsonify({"success": True})



# -------------------------------------------------
# PUBLIC ROUTES
# -------------------------------------------------

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        db = get_db()
        admin = db.execute(
            "SELECT * FROM admin WHERE email=? AND password=?",
            (email, password)
        ).fetchone()

        if not admin:
            return jsonify({"error": "Invalid credentials"})

        otp = str(random.randint(100000, 999999))
        db.execute("UPDATE admin SET otp=? WHERE email=?", (otp, email))
        db.commit()

        session["email"] = email
        session["otp"] = otp

        send_otp_email(email, otp)

        return jsonify({"otp": True})

    return render_template("login.html")



@app.route("/")
def index():
    return render_template("index.html")


@app.route("/home")
def home():
    return render_template("index.html")

@app.route("/test")
def test():
    return render_template("contact-test.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/education")
def education():
    return render_template("education.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")

@app.route("/projects-view")
def public_projects():
    return render_template("projects.html")

# -------------------------------------------------
# ADMIN ROUTES
# -------------------------------------------------

@app.route("/admin")
def admin_panel():
    if not session.get("logged"):
        return redirect("/login")
    return render_template("admin.html")

@app.route("/admin/projects")
def admin_projects():
    return render_template("projects.html")

@app.route("/admin/test")
def admin_test():
    return render_template("test.html")

# -------------------------------------------------
# OTP VERIFY
# -------------------------------------------------

@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    if data.get("otp") == session.get("otp"):
        session["logged"] = True
        return jsonify({"success": True})
    return jsonify({"error": "Invalid OTP"})

# -------------------------------------------------
# LOGOUT
# -------------------------------------------------

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

# -------------------------------------------------
# PROJECT CRUD API (JSON ONLY)
# -------------------------------------------------

@app.route("/projects", methods=["GET", "POST", "PUT", "DELETE"])
def projects():
    db = get_db()

    if request.method == "GET":
        rows = db.execute("SELECT * FROM projects").fetchall()
        return jsonify([
            {
                "id": r[0],
                "name": r[1],
                "image": r[2],
                "description": r[3],
                "link": r[4]
            } for r in rows
        ])

    if request.method == "POST":
        data = request.get_json()
        db.execute(
            "INSERT INTO projects (name, image, description, link) VALUES (?, ?, ?, ?)",
            (data["name"], data["image"], data["description"], data["link"])
        )
        db.commit()
        return jsonify({"added": True})

    if request.method == "PUT":
        data = request.get_json()
        db.execute(
            """
            UPDATE projects
            SET name=?, image=?, description=?, link=?
            WHERE id=?
            """,
            (data["name"], data["image"], data["description"], data["link"], data["id"])
        )
        db.commit()
        return jsonify({"updated": True})

    if request.method == "DELETE":
        project_id = request.args.get("id")
        db.execute("DELETE FROM projects WHERE id=?", (project_id,))
        db.commit()
        return jsonify({"deleted": True})

# -------------------------------------------------
# RUN
# -------------------------------------------------
if __name__ == "__main__":
    app.run()
