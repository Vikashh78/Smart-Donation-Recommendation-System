🏥 Smart Donation Recommendation System using ML

A Machine Learning-powered web platform that intelligently connects donors with hospitals by matching real-time needs with available resources, ensuring faster delivery, reduced waste, and better healthcare outcomes.

🚀 Overview

The healthcare sector often suffers from inefficient resource allocation and unusable donations. This project solves that using a data-driven recommendation system that:

Matches hospital requests with suitable donors
Prioritizes urgent needs using ML scoring
Reduces wastage of medical resources
Improves transparency and delivery efficiency

📌 Based on research, up to 70% of medical donations go unused — this system aims to fix that.

🧠 Key Features
🤖 ML-based Smart Matching (Random Forest)
🔔 Real-time Notifications for donors
📍 Location-based filtering
📊 Analytics Dashboard for hospitals
🔐 JWT Authentication & Role-based Access
🔄 End-to-End Workflow Tracking
🏗️ System Architecture

🔹 Client Layer
React.js + Tailwind CSS
Donor & Hospital portals

🔹 Backend/API Layer
FastAPI (Python)
REST APIs for:
Authentication
Donation management
Request handling
Recommendation engine

🔹 Data Layer
MongoDB Atlas
Collections:
users
donations
requests
donor_notifications
accepted_matches

🔹 ML Layer
scikit-learn (Random Forest)
Predicts priority score (0–100)

⚙️ Tech Stack
Layer	Technology
Frontend	React.js, Tailwind CSS
Backend	FastAPI (Python)
Database	MongoDB
ML Model	scikit-learn
Auth	JWT
Tools	Axios, Git, GitHub

🔄 Workflow
Hospital posts request (item, urgency, deadline)
System searches matching donations
ML model assigns priority score
Request sent to top donor
Donor accepts/rejects
Delivery details shared
Status updated → Completed

🧪 Machine Learning Logic
Feature Engineering:
urgency_score
deadline_hours
quantity normalization
interaction features (most important)
Model:
Random Forest (150 trees)
Output:
Priority Score (0–100)

📊 Results & Impact
⏱️ Faster delivery of critical resources
📉 Reduced unusable donations
📈 Improved donor engagement
💰 Cost savings for hospitals
🔍 Better transparency & tracking

📦 Installation & Setup

1️⃣ Clone the repository
git clone https://github.com/Vikashh78/Smart-Donation-Recommendation-System.git
cd smart-donation-system

2️⃣ Backend Setup
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

3️⃣ Frontend Setup
cd frontend
npm install
npm run dev
🔐 Environment Variables

Create .env file in backend:

MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key

👨‍💻 Developers
Vikash Sharma
Navneet Verma

👨‍🏫 Guide
Mr. Amit Pratap Singh
Assistant Professor, Department of Data Science

🏫 College
Galgotias College of Engineering and Technology
Greater Noida, Uttar Pradesh, India

📌 Future Scope
📱 Mobile Application
🗺️ Maps Integration (real-time tracking)
💬 Chat system (Donor ↔ Hospital)
🤖 Advanced ML models
🔮 Demand forecasting improvements

🤝 Contribution
Feel free to fork, contribute, and improve the system!

📄 License
This project is for academic and research purposes.
