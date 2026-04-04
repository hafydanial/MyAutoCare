MyAutoCare — Smart Vehicle Maintenance Management System
A web-based vehicle maintenance management system that helps vehicle owners in Malaysia track service history, set automated reminders, store receipts digitally, and share verified maintenance records with used car buyers.
Live Demo: https://hafydanial.github.io/myautocare/

About the Project
MyAutoCare addresses three key problems in vehicle ownership in Malaysia:

No centralized records — vehicle owners have no single platform to track maintenance history across different workshops and vehicle types
Untrusted used vehicle market — buyers cannot verify a vehicle's maintenance history, leading to fraud and hidden defects
Poor maintenance habits — owners miss service dates due to lack of a structured reminder and documentation system

MyAutoCare solves all three by providing a secure, easy-to-use web platform for both car and motorcycle owners.

Features

User Authentication — Register, login, and secure session management
Vehicle Management — Add and manage multiple vehicles (cars and motorcycles)
Maintenance Log — Log every service with date, mileage, workshop name, and cost
Smart Reminders — Set due-date reminders for next service, road tax, insurance expiry, and more
Workshop Finder — Interactive map powered by Leaflet.js and OpenStreetMap to find nearby workshops
Cost Analysis — Charts showing monthly spending trends and service type breakdown
Report Generation — Printable maintenance history report with a verified badge
Buyer History Share — Generate a secure public link for used car buyers to view service history without logging in


Tech Stack

HTML5, CSS3, JavaScript (Vanilla)
Chart.js — data visualizations
Leaflet.js + OpenStreetMap — interactive workshop map
Browser localStorage — client-side data storage (no backend required)
Google Fonts: Outfit + Urbanist


Getting Started

Download or clone this repository
Extract the files into a folder
Open index.html in any web browser

No server setup, no installation, and no internet connection required. The app runs entirely in the browser.

Demo Account
A pre-loaded demo account is available with sample data to explore all features immediately.
FieldValueEmailhafy@demo.comPassworddemo1234
The demo includes 2 vehicles (Perodua Myvi and Honda Wave 125), 5 maintenance records, and 3 reminders.

Project Structure
myautocare/
├── index.html          — Landing page
├── login.html          — User login
├── register.html       — New account registration
├── dashboard.html      — Main dashboard with charts
├── vehicles.html       — Vehicle management
├── maintenance.html    — Maintenance log
├── reminders.html      — Reminders and due dates
├── workshops.html      — Interactive workshop map
├── analysis.html       — Cost analysis and charts
├── reports.html        — Report generator and share link
├── public-report.html  — Public buyer view (no login needed)
├── app.css             — Global styles
├── app-core.js         — Data layer, auth, and utilities
└── layout.js           — Shared sidebar and navigation

Academic Information
FieldDetailsProject TitleMyAutoCare — Smart Vehicle Maintenance Management SystemCourseCSP600 — Industrial Training and Final Year ProjectProgrammeCDCS240 — Bachelor of Computer Science (Hons.)InstitutionUniversiti Teknologi MARA (UiTM)StudentHafy Danial Bin Selamat (2023858786)SupervisorEn. Ahmad Zambri Bin ShahuddinYear2026

MyAutoCare · CSP600 Final Year Project · UiTM CDCS240 · 2026
