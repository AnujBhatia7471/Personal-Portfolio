**🌐 Personal Portfolio – Full Stack Web Application**

A fully responsive, glassmorphism-based personal portfolio built with Flask, SQLite, HTML, CSS, JavaScript, and WebGL.   
It features a secure admin panel, dynamic project management, email verification with OTP, and a modern animated UI.   
This project is designed to demonstrate real-world full-stack development, secure authentication, and production-ready UI/UX.  
🚀 Live Features  
🔐 Secure Admin Panel  
Admin authentication system 
Session-based login 
Full CRUD support for projects: 
Create, 
Read, 
Update, 
Delete, 




**📁 Dynamic Project Management**
Projects are stored in SQLite database  
Admin can add:  
Title, 
Description, 
Image, 
Live link, 
Projects are automatically rendered on the public portfolio page 
No hard-coded project data  
📧 Email & OTP Verification System 
Contact form requires email verification 
OTP is sent via SMTP 
Only verified emails can send messages 
Prevents spam and fake submissions 




**💬 Contact System**   
Verified users can send messages  
Messages are delivered directly to admin email  
Includes name, email & message  




**🎨 Modern UI & WebGL Effects**  
Glassmorphism UI  
Smooth hover animations  
WebGL canvas background  
Interactive distortion & motion effects  
Fully responsive for:  
Mobile 
Tablet 
Desktop 



**🛠 Tech Stack**  
Frontend   
HTML5  
CSS3 (Glassmorphism + Animations)  
JavaScript  
Bootstrap 5  
WebGL + GLSL  
AOS (Animate on Scroll)  
Backend  
Python (Flask)  
SQLite (DBMS)  
Flask Sessions  
SMTP (Email & OTP System)  




**🔑 Admin Workflow**  
Admin logs in securely  
Admin adds or updates projects  
Data is stored in SQLite database  
Portfolio page loads projects dynamically  
Any update reflects instantly on live website  




**📬 Email Verification Flow**  
User enters email  
OTP is sent via SMTP  
User verifies OTP  
Contact form unlocks   
Message is sent to admin email  




**This prevents:**  
Spam  
Fake emails  
Bot abuse  




**⚙ Installation & Setup**  
1️⃣ Clone the Repository  
git clone https://github.com/your-username/Personal-Portfolio.git  
cd Personal-Portfolio  
2️⃣ Create Virtual Environment  
python -m venv venv  
source venv/bin/activate  
3️⃣ Install Dependencies  
pip install -r requirements.txt  
4️⃣ Run the Server  
python Admin-Project/admin/app.py  
Open in browser:  
http://127.0.0.1:5000/home  




**🔐 Environment Variables**  
Create a .env file:  
EMAIL_ADDRESS=your_email@gmail.com  
EMAIL_PASSWORD=your_app_password  
SECRET_KEY=your_secret_key  




**📸 Why This Project Is Strong**  
This is not a static portfolio.  
It is a real-world full-stack application featuring:  
Database  
Authentication  
Email verification  
Admin dashboard  
Live content management  
WebGL & animations  




**👨‍💻 Author**  
Anuj Bhatia  
Full Stack Developer | UI/UX Enthusiast | WebGL & AI Integration  
