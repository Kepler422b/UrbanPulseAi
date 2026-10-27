# UrbanPulse AI — API Reference Documentation

All endpoints are prefixed with `/api`. Protected routes require a Bearer token in the `Authorization` header:
`Authorization: Bearer <access_token>`

---

## 1. System Health
- **`GET /api/health`**
  - **Auth**: None
  - **Description**: Returns operational status, environment mode, and database connection type (`live MongoDB` or `embedded mongomock`).

---

## 2. Authentication
- **`POST /api/auth/register`**
  - **Auth**: None
  - **Body**: `{ "name": "...", "email": "...", "password": "..." }`
  - **Description**: Registers a new citizen account with enforced `citizen` role.
- **`POST /api/auth/login`**
  - **Auth**: None
  - **Body**: `{ "email": "...", "password": "..." }`
  - **Description**: Verifies credentials and issues a signed JWT token.
- **`GET /api/auth/me`**
  - **Auth**: Bearer Token
  - **Description**: Returns the authenticated user's profile and assigned role.
- **`POST /api/auth/change-password`**
  - **Auth**: Bearer Token
  - **Body**: `{ "current_password": "...", "new_password": "..." }`
  - **Description**: Updates the authenticated user's password.

---

## 3. Civic Reports (Citizen & Public)
- **`POST /api/reports`**
  - **Auth**: Optional (Associates submitter if authenticated, otherwise accepts guest submissions)
  - **Body**:
    ```json
    {
      "category": "potholes_damaged_roads",
      "title": "Severe road crater near Cineworld",
      "description": "Approx 3-foot wide pothole causing skids...",
      "locality": "Kanakia Park",
      "approximate_address": "Cineworld Junction, Kanakia",
      "latitude": 19.2864,
      "longitude": 72.8688,
      "severity": "critical",
      "image_url": "/uploads/example.jpg"
    }
    ```
  - **Description**: Creates a complaint, calculates initial priority, checks for duplicates, and assigns a public report ID (`UP-2026-XXXX`).
- **`POST /api/reports/upload-image`**
  - **Auth**: None / Optional
  - **Form-data**: `file` (JPEG, PNG, WEBP, max 5MB)
  - **Description**: Securely stores uploaded photographic evidence and returns relative URL.
- **`GET /api/reports/my`**
  - **Auth**: Bearer Token
  - **Description**: Returns only submissions reported by the current citizen.
- **`GET /api/reports/{report_id}`**
  - **Auth**: Optional (Hides reporter details and internal notes from public viewers)
  - **Description**: Returns complete details for an individual report.
- **`GET /api/reports/{report_id}/history`**
  - **Auth**: None / Public
  - **Description**: Returns audit trail of status changes, reasons, and timestamps.
- **`GET /api/reports/{report_id}/notes`**
  - **Auth**: Administrator only (`admin`)
  - **Description**: Returns private operational notes.

---

## 4. Public Explorer
- **`GET /api/public/reports`**
  - **Auth**: None
  - **Query parameters**:
    - `category`: Filter by category identifier
    - `status`: `reported`, `in_progress`, `resolved`, `duplicate`
    - `locality`: Substring match on locality
    - `search`: Keyword search in title or address
    - `page`: Page number (default: 1)
    - `limit`: Items per page (default: 50)
  - **Description**: Privacy-safe list of reports with pagination.

---

## 5. Administration & Triage (Requires Admin Role)
- **`GET /api/admin/reports`**
  - **Query parameters**: `category`, `status`, `severity`, `locality`, `search`, `sort_by` (`newest`, `priority`, `oldest`), `page`, `limit`
  - **Description**: Comprehensive admin queue with priority scores and internal audit counters.
- **`PATCH /api/admin/reports/{report_id}/status`**
  - **Body**: `{ "status": "in_progress", "reason": "Dispatched crew" }`
- **`PATCH /api/admin/reports/{report_id}/assign`**
  - **Body**: `{ "assigned_to": "Ward 3 PWD Asphalt Crew", "note": "Cold-mix patch" }`
- **`POST /api/admin/reports/{report_id}/notes`**
  - **Body**: `{ "note": "Spoke with Ward Officer." }`
- **`POST /api/admin/reports/{report_id}/resolve`**
  - **Body**: `{ "resolution_notes": "Repaired and compacted." }`
- **`POST /api/admin/reports/{report_id}/mark-duplicate`**
  - **Body**: `{ "original_report_id": "UP-2026-SP001", "reason": "Duplicate report" }`
- **`GET /api/admin/export/reports.csv`**
  - **Description**: Streams filtered report records as a downloadable CSV.
- **`POST /api/admin/demo/reset`**
  - **Description**: Resets demo records to factory baseline.

---

## 6. Analytics & AI Insights
- **`GET /api/admin/analytics/summary`**: KPI counts and average turnaround hours.
- **`GET /api/admin/analytics/trends`**: Daily reported vs resolved velocity.
- **`GET /api/admin/analytics/categories`**: Category share distribution.
- **`GET /api/admin/analytics/hotspots`**: Spatial cluster coordinates and unresolved counts.
- **`GET /api/admin/analytics/resolution-times`**: Average hours to resolution by division.
- **`GET /api/admin/insights`**: Fetches detected operational patterns and recommendations.
- **`POST /api/admin/insights/analyze`**: Triggers immediate pattern detection recalculation.
