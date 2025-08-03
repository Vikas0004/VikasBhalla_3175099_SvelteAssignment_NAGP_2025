# 🛒 NAGP 2025 E-Commerce Microservices Assignment

This project is an end-to-end **e-commerce portal** built with:
- **Java Spring Boot Microservices**
- **Spring Cloud Eureka Service Discovery**
- **API Gateway**
- **JWT-based Authentication**
- **SvelteKit Frontend**
- **Docker Compose Orchestration**

---

## 🚀 Features

- User login with JWT
- Product search & catalog
- Shopping cart with quantity updates
- Order placement with stock validation
- Order history
- Fully containerized with **Docker Compose**

---

## 📂 Project Structure

project-root/
├── docker-compose.yml
├── SvelteAssignment/ # Frontend source code
│ ├── src/
│ ├── static/
│ ├── svelte.config.js
│ ├── vite.config.ts
│ ├── package.json
│ ├── .env
│ └── Dockerfile
└── README.md


---

## ✅ Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)

---

## ⚙️ How to Run

### 🔥 Local Development (Frontend only)

bash
cd SvelteAssignment
npm install
npm run dev

2️⃣ Full System with Docker Compose

cd SvelteAssignment
docker-compose up --build

Eureka: http://localhost:8761

API Gateway: http://localhost:8080

Frontend: http://localhost:5731

✨ Usage Flow
1️⃣ Login
2️⃣ Browse/search products        
3️⃣ Add to cart
4️⃣ Place order (success & fail cases)
5️⃣ View orders

📜 License
This project is for NAGP 2025 educational purposes.

👤 Author
Vikas Bhalla
