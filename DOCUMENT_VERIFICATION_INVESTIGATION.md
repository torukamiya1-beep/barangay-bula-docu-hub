# Document Verification & Reupload Feature - Investigation Report

**Date:** October 20, 2025  
**Project:** Barangay Bula Document Hub  
**Feature:** Admin Document Verification + Client Reupload Flow

---

## 1. CURRENT SYSTEM ANALYSIS

### 1.1 Database Schema
**Table:** `residency_documents`

**Columns:**
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `account_id` (INT, NOT NULL) - References client_accounts(id)
- `document_type` (ENUM: 'utility_bill', 'barangay_certificate', 'valid_id', 'lease_contract', 'other')
- `document_name` (VARCHAR(255))
- `file_path` (VARCHAR(500))
- `file_size` (INT)
- `mime_type` (VARCHAR(100))
- **`verification_status`** (ENUM: **'pending', 'approved', 'rejected'**) ✅ **ALREADY EXISTS**
- `verified_by` (INT, NULL) - References admin_employee_accounts(id)
- `verified_at` (TIMESTAMP, NULL)
- `rejection_reason` (TEXT, NULL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Status:** ✅ Database schema is complete and supports verification workflow.

---

### 1.2 Backend API Endpoints (Existing)

#### **File:** `rhai_backend/src/routes/residencyRoutes.js`

| Endpoint | Method | Access | Purpose | Status |
|----------|--------|--------|---------|--------|
| `/api/residency/upload` | POST | Client | Upload residency documents | ✅ Exists |
| `/api/residency/upload-registration` | POST | Public | Upload during registration | ✅ Exists |
| `/api/residency/documents/:accountId` | GET | Client/Admin | Get account documents | ✅ Exists |
| `/api/residency/verification-status` | GET | Client | Get verification status | ✅ Exists |
| `/api/residency/pending` | GET | Admin | Get pending verifications | ✅ Exists |
| **`/api/residency/approve`** | **POST** | **Admin** | **Approve verification** | ✅ **Exists** |
| **`/api/residency/reject`** | **POST** | **Admin** | **Reject verification** | ✅ **Exists** |
| `/api/residency/documents/:documentId` | DELETE | Client | Delete document | ✅ Exists |
| `/api/residency/documents/:documentId/file` | GET | Client/Admin | Get document file | ✅ Exists |

**Status:** ✅ Core approval/rejection endpoints already exist.

---

### 1.3 Frontend Components (Existing)

#### **File:** `src/components/admin/ResidencyDocumentsModal.vue`

**Current Features:**
- ✅ Displays user information
- ✅ Shows uploaded documents in grid layout
- ✅ Document preview with thumbnails
- ✅ Shows verification_status badge (pending/approved/rejected)
- ✅ Has Approve/Reject buttons in footer
- ⚠️ **Missing:** Individual document approve/reject actions
- ⚠️ **Missing:** Notification trigger on rejection

**Current Approve/Reject Implementation:**
```vue
<!-- Lines 126-146 -->
<button @click="$emit('reject')" :disabled="processing">Reject</button>
<button @click="$emit('approve')" :disabled="processing">Approve</button>
```

**Status:** ⚠️ UI exists but emits events to parent - need to trace parent handler.

---

#### **File:** `src/components/admin/DocumentViewer.vue`

**Current Features:**
- ✅ Full-screen document viewer
- ✅ Image zoom controls
- ✅ PDF viewer support
- ✅ Download functionality
- ⚠️ **Missing:** Approve/Reject actions within viewer

**Status:** ⚠️ View-only component, needs approve/reject buttons.

---

#### **File:** `src/components/client/ClientRegistration.vue`

**Current Features:**
- ✅ Multi-step registration (Account → Profile → Documents → Verify)
- ✅ Document upload for 5 types (utility_bill, barangay_certificate, valid_id, lease_contract, other)
- ✅ File validation and preview
- ✅ Multiple file upload support
- ⚠️ **Missing:** Reupload capability for rejected documents
- ⚠️ **Missing:** Display of rejection status

**Status:** ⚠️ Upload-only, no reupload flow for rejected documents.

---

### 1.4 Frontend Services (Existing)

#### **File:** `src/services/residencyService.js`

**Existing Methods:**
```javascript
✅ getAccountDocuments(accountId)
✅ getPendingVerifications(params)
✅ approveVerification(accountId, documentIds)
✅ rejectVerification(accountId, rejectionReason, documentIds)
✅ getDocumentFileUrl(documentId)
✅ deleteDocument(documentId)
```

**Status:** ✅ Service methods exist for approve/reject.

---

#### **File:** `src/services/notificationService.js`

**Existing Features:**
- ✅ Context-aware notification service (admin/client)
- ✅ SSE (Server-Sent Events) real-time notifications
- ✅ In-app notification bell support
- ✅ Browser notification support
- ✅ Methods: `getNotifications()`, `getUnreadCount()`, `markAsRead()`
- ⚠️ **Missing:** SMS notification integration
- ⚠️ **Missing:** Email notification integration

**Status:** ⚠️ In-app notifications exist, need SMS/Email integration.

---

## 2. MISSING COMPONENTS & FEATURES

### 2.1 Backend Missing Features

#### ❌ **Individual Document Status Update Endpoint**
**Required:** `PATCH /api/residency-documents/:id/status`

**Purpose:** Update single document verification status (not entire account)

**Payload:**
```json
{
  "verification_status": "approved" | "rejected"
}
```

**Current Limitation:** Existing `/api/residency/approve` and `/api/residency/reject` work at account level, not individual document level.

---

#### ❌ **Get Documents by Status Endpoint**
**Required:** `GET /api/documents?status=rejected&user_id=:userId`

**Purpose:** Fetch all rejected documents for a client

**Current Limitation:** `/api/residency/documents/:accountId` returns all documents, no filtering by status.

---

#### ❌ **Document Reupload Endpoint**
**Required:** `POST /api/residency-documents/:id/reupload`

**Purpose:** Replace rejected document with new file

**Payload:** `multipart/form-data` with file

**Design Decision Needed:**
- **Option A:** Replace existing document record (update file_path, reset status to 'pending')
- **Option B:** Create new version record (preserve history, link to original)

**Recommendation:** Option A (replace) for simplicity, unless audit trail is critical.

---

#### ❌ **SMS Notification Service**
**Required:** Backend service to send SMS on rejection

**Current Status:** No SMS service found in backend

**Implementation Needed:**
- Create `src/services/smsService.js`
- Integrate SMS provider (Twilio, Semaphore, etc.)
- Add environment variables for API credentials
- Trigger on document rejection

---

#### ❌ **Email Notification Service**
**Required:** Backend service to send Gmail on rejection

**Current Status:** No email service found in backend

**Implementation Needed:**
- Create `src/services/emailService.js`
- Use Nodemailer or similar
- Add environment variables for SMTP credentials
- Create email template for rejection
- Trigger on document rejection

---

#### ❌ **In-App Notification Creation on Rejection**
**Required:** Create notification record when document is rejected

**Current Status:** Notification service exists but not integrated with residency rejection

**Implementation Needed:**
- Add notification creation in `residencyController.rejectVerification()`
- Store notification in database
- Emit SSE event to client
- Include deep link to RejectedDocuments view

---

### 2.2 Frontend Missing Components

#### ❌ **RejectedDocuments.vue Component**
**Required:** `src/components/client/RejectedDocuments.vue`

**Purpose:** Display all rejected documents and allow reupload

**Features Needed:**
1. Fetch rejected documents on mount
2. Group by document category
3. Display: thumbnail, filename, upload date, status, version
4. Reupload button per document
5. File picker/drag-drop
6. Client-side validation (file type, size)
7. Preview before upload
8. Progress bar during upload
9. Optimistic UI update
10. Success/error handling
11. Empty state when no rejected documents
12. Accessibility (keyboard, screen reader)

**Status:** ❌ Does not exist, must be created.

---

#### ❌ **Admin UI: Individual Document Actions**
**Required:** Update `ResidencyDocumentsModal.vue` and `DocumentViewer.vue`

**Features Needed:**
1. Approve/Reject buttons on each document card
2. Disable buttons based on current status
3. Prevent duplicate actions
4. Show loading state during API call
5. Update UI immediately on success
6. Trigger notifications on rejection

**Current Limitation:** Only account-level approve/reject buttons exist.

---

#### ❌ **Client UI: Reupload in ClientRegistration.vue**
**Required:** Update `ClientRegistration.vue` to show rejection status and allow reupload

**Features Needed:**
1. Check document status on mount
2. Display rejection badge if status = 'rejected'
3. Enable reupload for rejected documents
4. Disable upload for approved documents
5. Link to RejectedDocuments view

**Status:** ❌ Not implemented.

---

### 2.3 Frontend Service Updates Needed

#### ⚠️ **residencyService.js Updates**

**New Methods Needed:**
```javascript
// Update single document status
async updateDocumentStatus(documentId, status) { ... }

// Get rejected documents for current user
async getRejectedDocuments(userId) { ... }

// Reupload rejected document
async reuploadDocument(documentId, file) { ... }
```

---

#### ⚠️ **Notification Integration**

**Updates Needed in:**
- `ResidencyDocumentsModal.vue`: Trigger notification on reject
- `RejectedDocuments.vue`: Mark notification as read when opened
- Backend `residencyController.js`: Create notification on rejection

---

## 3. CRITICAL REQUIREMENTS & CONSTRAINTS

### 3.1 Professor Requirements

⚠️ **NO REJECTION REASON DISPLAY**
- Do NOT show rejection_reason in UI, SMS, or email
- Backend stores rejection_reason for admin audit only
- Client only sees "Document rejected - please reupload"

### 3.2 Notification Requirements

**On Document Rejection, Send:**
1. ✅ **SMS:** Short message (e.g., "Your [document type] was rejected. Please reupload in your account.")
2. ✅ **Email:** Similar message with link to RejectedDocuments view
3. ✅ **In-App Bell:** Notification with deep link

**Constraints:**
- Send only once per rejection action
- Log all send attempts and failures
- Use verified phone number from user profile
- Use environment variables for credentials (no hardcoding)

### 3.3 Security & Validation

**Server-Side:**
- Validate and sanitize uploaded files
- Enforce auth/ownership checks on reupload
- Prevent unauthorized access to documents

**Client-Side:**
- Validate file type and size before upload
- Match existing upload validation rules
- Show clear error messages

### 3.4 Design Decision: Replace vs. Versioning

**Question:** When client reuploads a rejected document, should we:
- **A) Replace:** Update existing record (file_path, status → 'pending')
- **B) Version:** Create new record linked to original

**Recommendation:** **Option A (Replace)** for simplicity
- Simpler implementation
- Matches user mental model ("fix and resubmit")
- Preserves document ID for tracking
- Old file can be deleted or archived

**If Versioning Required:**
- Add `version` column to residency_documents
- Add `original_document_id` column
- Keep old records with status history

---

## 4. IMPLEMENTATION PLAN

### Phase 1: Backend API Endpoints ✅ (Partially Done)

**Existing:**
- ✅ Approve/Reject at account level
- ✅ Get documents by account

**To Add:**
1. ❌ Individual document status update endpoint
2. ❌ Get rejected documents endpoint
3. ❌ Reupload document endpoint
4. ❌ SMS service integration
5. ❌ Email service integration
6. ❌ In-app notification creation on rejection

---

### Phase 2: Admin UI Updates

**Files to Modify:**
1. `src/components/admin/ResidencyDocumentsModal.vue`
   - Add individual Approve/Reject buttons per document
   - Integrate notification trigger on rejection
   - Update UI optimistically

2. `src/components/admin/DocumentViewer.vue`
   - Add Approve/Reject buttons in viewer
   - Show current verification status
   - Disable actions if already processed

**Files to Update:**
1. `src/services/residencyService.js`
   - Add `updateDocumentStatus(documentId, status)` method

---

### Phase 3: Client UI - RejectedDocuments Component

**Create:**
1. `src/components/client/RejectedDocuments.vue`
   - Fetch rejected documents
   - Display grouped by category
   - Reupload functionality
   - Validation, preview, progress
   - Success/error handling
   - Empty state

**Update:**
1. `src/services/residencyService.js`
   - Add `getRejectedDocuments(userId)` method
   - Add `reuploadDocument(documentId, file)` method

---

### Phase 4: Client UI - Registration Updates

**Update:**
1. `src/components/client/ClientRegistration.vue`
   - Check document status on load
   - Show rejection badge
   - Enable reupload for rejected docs
   - Link to RejectedDocuments view

---

### Phase 5: Notification Integration

**Backend:**
1. Create `src/services/smsService.js`
2. Create `src/services/emailService.js`
3. Update `residencyController.rejectVerification()` to trigger notifications

**Frontend:**
1. Update `RejectedDocuments.vue` to mark notifications as read
2. Ensure notification bell updates in real-time

---

### Phase 6: Testing & Documentation

**Test Cases:**
1. Admin approves document → status = 'approved'
2. Admin rejects document → status = 'rejected' + notifications sent
3. Client sees rejected documents in RejectedDocuments view
4. Client reuploads → status = 'pending', file replaced
5. Validation errors handled gracefully
6. Notifications delivered (SMS, email, in-app)

**Documentation:**
1. Create developer README
2. Document API endpoints
3. Document reupload flow
4. Document notification configuration

---

## 5. FILES TO CREATE

### Backend
1. ❌ `rhai_backend/src/services/smsService.js`
2. ❌ `rhai_backend/src/services/emailService.js`
3. ⚠️ Update `rhai_backend/src/controllers/residencyController.js`
4. ⚠️ Update `rhai_backend/src/routes/residencyRoutes.js`
5. ⚠️ Update `rhai_backend/src/services/residencyService.js`

### Frontend
1. ❌ `src/components/client/RejectedDocuments.vue`
2. ⚠️ Update `src/components/admin/ResidencyDocumentsModal.vue`
3. ⚠️ Update `src/components/admin/DocumentViewer.vue`
4. ⚠️ Update `src/components/client/ClientRegistration.vue`
5. ⚠️ Update `src/services/residencyService.js`

### Documentation
1. ❌ `DOCUMENT_VERIFICATION_README.md`

---

## 6. NEXT STEPS

**Immediate Actions:**
1. ✅ Complete investigation (this document)
2. ❌ Decide on replace vs. versioning approach
3. ❌ Implement backend endpoints
4. ❌ Implement admin UI updates
5. ❌ Create RejectedDocuments component
6. ❌ Integrate notifications
7. ❌ Test end-to-end flow
8. ❌ Create documentation

**Estimated Effort:**
- Backend: 4-6 hours
- Admin UI: 2-3 hours
- Client UI: 3-4 hours
- Notifications: 2-3 hours
- Testing: 2-3 hours
- Documentation: 1-2 hours

**Total:** 14-21 hours

---

## 7. CRITICAL QUESTIONS FOR CLARIFICATION

1. **Versioning:** Replace or create new version on reupload?
   - **Recommendation:** Replace for simplicity

2. **SMS Provider:** Which SMS service to use (Twilio, Semaphore, etc.)?
   - **Action:** Check .env for existing SMS credentials

3. **Email Service:** Use existing SMTP or new service?
   - **Action:** Check .env for existing email credentials

4. **Notification Scope:** Reject individual documents or entire account?
   - **Current:** Account-level rejection exists
   - **Proposed:** Add individual document rejection

5. **Multiple Rejections:** Can admin reject some documents and approve others?
   - **Current:** All-or-nothing approach
   - **Proposed:** Individual document control

---

**END OF INVESTIGATION REPORT**
