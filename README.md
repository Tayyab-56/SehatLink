# 🏥 SehatLink – Healthcare Management Platform

**SehatLink** is a full‑stack healthcare platform that bridges patients, doctors, and administrators. It enables online appointment booking, real‑time chat with file sharing, earnings tracking for doctors, and an AI‑powered symptom checker chatbot. The system demonstrates **polyglot persistence** by using three databases: PostgreSQL, MongoDB, and Neo4j.

![React](https://img.shields.io/badge/React-18.2-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-lightgrey?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
![MongoDB](https://img.shields.io/badge/MongoDB-5.7-green?logo=mongodb)
![Neo4j](https://img.shields.io/badge/Neo4j-5.14-red?logo=neo4j)

---

## 📌 Features

### 👤 Patients
- Browse and filter doctors by specialization and city  
- Book / cancel / reschedule appointments  
- Real‑time chat with doctors (text, images, PDFs)  
- View medical reports and appointment history  
- **Symptom Checker Chatbot** – enter symptoms and get possible disease matches (powered by Neo4j)

### 👨‍⚕️ Doctors
- Manage patient appointments  
- Secure chat with patients  
- View earnings dashboard (monthly/yearly graphs, transaction history)  
- Update profile and availability  

### 🛡️ Admin
- Oversee all users and appointments  
- Manage platform content  

### 🔧 Technical Highlights
- **Role‑based access control** (JWT authentication)  
- **Real‑time messaging** with Socket.io and read receipts  
- **File uploads** (images, PDF) – stored via Multer  
- **Polyglot database architecture** – each database used for its strength  
- **Responsive UI** with Tailwind CSS and Framer Motion animations  

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Tailwind CSS, Framer Motion, Axios, Socket.io‑client, Lucide Icons |
| **Backend** | Node.js, Express.js, Socket.io, bcrypt, Multer |
| **Relational DB** | PostgreSQL (users, appointments, doctors, patients, payments) |
| **Document DB** | MongoDB (conversations, messages) |
| **Graph DB** | Neo4j (diseases, symptoms, relationships – for chatbot) |
