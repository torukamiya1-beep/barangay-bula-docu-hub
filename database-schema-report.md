# Database Schema Inspection Report

**Database:** barangay_management_system
**Generated:** 2025-09-13T11:05:16.509Z

## Table: admin_employee_accounts

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| username | varchar | NO | NULL | UNI |  |  |
| password_hash | varchar | NO | NULL |  |  |  |
| role | enum | NO | NULL | MUL |  |  |
| status | enum | YES | 'active' | MUL |  |  |
| last_login | timestamp | YES | NULL |  |  |  |
| password_changed_at | timestamp | NO | current_timestamp() |  |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |
| updated_at | timestamp | NO | current_timestamp() |  | on update current_timestamp() |  |

**Row Count:** 3

## Table: admin_employee_profiles

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| account_id | int | NO | NULL | MUL |  |  |
| employee_id | varchar | YES | NULL | UNI |  |  |
| first_name | varchar | NO | NULL |  |  |  |
| middle_name | varchar | YES | NULL |  |  |  |
| last_name | varchar | NO | NULL | MUL |  |  |
| suffix | varchar | YES | NULL |  |  |  |
| phone_number | varchar | YES | NULL |  |  |  |
| email | varchar | YES | NULL | UNI |  |  |
| profile_picture | varchar | YES | NULL |  |  |  |
| position | varchar | YES | NULL |  |  |  |
| department | varchar | YES | NULL |  |  |  |
| hire_date | date | YES | NULL |  |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |
| updated_at | timestamp | NO | current_timestamp() |  | on update current_timestamp() |  |

**Row Count:** 3

## Table: audit_logs

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| user_id | int | YES | NULL | MUL |  |  |
| user_type | enum | NO | NULL |  |  |  |
| action | varchar | NO | NULL | MUL |  |  |
| table_name | varchar | YES | NULL |  |  |  |
| record_id | int | YES | NULL |  |  |  |
| old_values | longtext | YES | NULL |  |  |  |
| new_values | longtext | YES | NULL |  |  |  |
| ip_address | varchar | YES | NULL |  |  |  |
| user_agent | text | YES | NULL |  |  |  |
| created_at | timestamp | NO | current_timestamp() | MUL |  |  |

**Row Count:** 0

## Table: authorization_documents
**Comment:** Stores authorization documents (letters, IDs) for pickup persons

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| authorized_pickup_person_id | int | NO | NULL | MUL |  |  |
| document_type | varchar | NO | NULL | MUL |  |  |
| document_name | varchar | NO | NULL |  |  |  |
| file_path | varchar | NO | NULL |  |  |  |
| file_size | int | YES | NULL |  |  |  |
| mime_type | varchar | YES | NULL |  |  |  |
| is_verified | tinyint | YES | 0 |  |  |  |
| verified_by | int | YES | NULL | MUL |  |  |
| verified_at | timestamp | YES | NULL |  |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |
| verification_notes | text | YES | NULL |  |  |  |

**Row Count:** 0

## Table: authorized_pickup_persons
**Comment:** Stores information about people authorized to pick up documents on behalf of others

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| request_id | int | NO | NULL | MUL |  |  |
| first_name | varchar | NO | NULL |  |  |  |
| middle_name | varchar | YES | NULL |  |  |  |
| last_name | varchar | NO | NULL | MUL |  |  |
| suffix | varchar | YES | NULL |  |  |  |
| phone_number | varchar | YES | NULL |  |  |  |
| email | varchar | YES | NULL |  |  |  |
| id_type | varchar | YES | NULL |  |  |  |
| id_number | varchar | YES | NULL | MUL |  |  |
| id_expiry_date | date | YES | NULL |  |  |  |
| authorization_letter_path | varchar | YES | NULL |  |  |  |
| relationship_to_beneficiary | varchar | YES | NULL |  |  |  |
| is_verified | tinyint | YES | 0 | MUL |  |  |
| verified_by | int | YES | NULL | MUL |  |  |
| verified_at | timestamp | YES | NULL |  |  |  |
| verification_notes | text | YES | NULL |  |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |
| updated_at | timestamp | NO | current_timestamp() |  | on update current_timestamp() |  |
| id_image_path | varchar | YES | NULL |  |  |  |
| id_image_name | varchar | YES | NULL |  |  |  |
| id_image_size | int | YES | NULL |  |  |  |
| id_image_mime_type | varchar | YES | NULL |  |  |  |

**Row Count:** 0

## Table: barangay_clearance_applications

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| request_id | int | NO | NULL | UNI |  |  |
| has_pending_cases | tinyint | YES | 0 |  |  |  |
| pending_cases_details | text | YES | NULL |  |  |  |
| voter_registration_number | varchar | YES | NULL |  |  |  |
| precinct_number | varchar | YES | NULL |  |  |  |
| emergency_contact_name | varchar | YES | NULL |  |  |  |
| emergency_contact_relationship | varchar | YES | NULL |  |  |  |
| emergency_contact_phone | varchar | YES | NULL |  |  |  |
| emergency_contact_address | text | YES | NULL |  |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |
| updated_at | timestamp | NO | current_timestamp() |  | on update current_timestamp() |  |

**Row Count:** 1

## Table: beneficiary_verification_documents

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| beneficiary_id | int | NO | NULL |  |  |  |
| document_type | varchar | NO | NULL |  |  |  |
| document_name | varchar | NO | NULL |  |  |  |
| file_path | varchar | NO | NULL |  |  |  |
| file_size | int | YES | NULL |  |  |  |
| mime_type | varchar | YES | NULL |  |  |  |
| is_verified | tinyint | YES | 0 |  |  |  |
| verified_by | int | YES | NULL |  |  |  |
| verified_at | timestamp | YES | NULL |  |  |  |
| verification_notes | text | YES | NULL |  |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |
| updated_at | timestamp | NO | current_timestamp() |  | on update current_timestamp() |  |

**Row Count:** 0

## Table: cedula_applications

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| request_id | int | NO | NULL | UNI |  |  |
| occupation | varchar | YES | NULL | MUL |  |  |
| employer_name | varchar | YES | NULL |  |  |  |
| employer_address | text | YES | NULL |  |  |  |
| monthly_income | decimal | YES | NULL |  |  |  |
| annual_income | decimal | YES | NULL |  |  |  |
| business_name | varchar | YES | NULL |  |  |  |
| business_address | text | YES | NULL |  |  |  |
| business_type | varchar | YES | NULL |  |  |  |
| business_income | decimal | YES | NULL |  |  |  |
| business_gross_receipts | decimal | YES | 0.00 |  |  |  |
| has_real_property | tinyint | YES | 0 |  |  |  |
| has_personal_property | tinyint | YES | 0 |  |  |  |
| personal_property_value | decimal | YES | 0.00 |  |  |  |
| property_assessed_value | decimal | YES | NULL |  |  |  |
| property_location | text | YES | NULL |  |  |  |
| tin_number | varchar | YES | NULL | MUL |  |  |
| previous_ctc_number | varchar | YES | NULL |  |  |  |
| previous_ctc_date_issued | date | YES | NULL |  |  |  |
| previous_ctc_place_issued | varchar | YES | NULL |  |  |  |
| computed_tax | decimal | YES | NULL |  |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |
| updated_at | timestamp | NO | current_timestamp() |  | on update current_timestamp() |  |

**Row Count:** 2

## Table: civil_status

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| status_name | varchar | NO | NULL | UNI |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |

**Row Count:** 5

## Table: client_accounts

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| username | varchar | NO | NULL | UNI |  |  |
| password_hash | varchar | NO | NULL |  |  |  |
| status | enum | YES | 'pending_verification' | MUL |  |  |
| email_verified | tinyint | YES | 0 |  |  |  |
| phone_verified | tinyint | YES | 0 |  |  |  |
| last_login | timestamp | YES | NULL |  |  |  |
| password_changed_at | timestamp | NO | current_timestamp() |  |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |
| updated_at | timestamp | NO | current_timestamp() |  | on update current_timestamp() |  |

**Row Count:** 11

## Table: client_profiles

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| account_id | int | NO | NULL | MUL |  |  |
| first_name | varchar | NO | NULL |  |  |  |
| middle_name | varchar | YES | NULL |  |  |  |
| last_name | varchar | NO | NULL | MUL |  |  |
| suffix | varchar | YES | NULL |  |  |  |
| birth_date | date | NO | NULL | MUL |  |  |
| gender | enum | NO | NULL |  |  |  |
| civil_status_id | int | NO | NULL | MUL |  |  |
| nationality | varchar | YES | 'Filipino' |  |  |  |
| phone_number | varchar | NO | NULL | MUL |  |  |
| email | varchar | YES | NULL | MUL |  |  |
| house_number | varchar | YES | NULL |  |  |  |
| street | varchar | YES | NULL |  |  |  |
| subdivision | varchar | YES | NULL |  |  |  |
| barangay | varchar | NO | NULL | MUL |  |  |
| city_municipality | varchar | NO | NULL |  |  |  |
| province | varchar | NO | NULL |  |  |  |
| region | varchar | YES | NULL |  |  |  |
| region_code | varchar | YES | NULL |  |  |  |
| province_code | varchar | YES | NULL |  |  |  |
| city_code | varchar | YES | NULL |  |  |  |
| barangay_code | varchar | YES | NULL |  |  |  |
| postal_code | varchar | YES | NULL |  |  |  |
| years_of_residency | int | YES | NULL |  |  |  |
| months_of_residency | int | YES | NULL |  |  |  |
| profile_picture | varchar | YES | NULL |  |  |  |
| is_verified | tinyint | YES | 0 |  |  |  |
| residency_verified | tinyint | YES | 0 | MUL |  |  |
| residency_verified_by | int | YES | NULL | MUL |  |  |
| residency_verified_at | timestamp | YES | NULL |  |  |  |
| verified_by | int | YES | NULL | MUL |  |  |
| verified_at | timestamp | YES | NULL |  |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |
| updated_at | timestamp | NO | current_timestamp() |  | on update current_timestamp() |  |

**Row Count:** 7

## Table: document_beneficiaries

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| request_id | int | NO | NULL | MUL |  |  |
| first_name | varchar | NO | NULL |  |  |  |
| middle_name | varchar | YES | NULL |  |  |  |
| last_name | varchar | NO | NULL | MUL |  |  |
| suffix | varchar | YES | NULL |  |  |  |
| birth_date | date | NO | NULL | MUL |  |  |
| gender | enum | NO | NULL |  |  |  |
| civil_status_id | int | NO | NULL | MUL |  |  |
| nationality | varchar | YES | 'Filipino' |  |  |  |
| phone_number | varchar | YES | NULL |  |  |  |
| email | varchar | YES | NULL |  |  |  |
| house_number | varchar | YES | NULL |  |  |  |
| street | varchar | YES | NULL |  |  |  |
| subdivision | varchar | YES | NULL |  |  |  |
| barangay | varchar | NO | NULL |  |  |  |
| city_municipality | varchar | NO | NULL |  |  |  |
| province | varchar | NO | NULL |  |  |  |
| region | varchar | YES | NULL |  |  |  |
| region_code | varchar | YES | NULL |  |  |  |
| province_code | varchar | YES | NULL |  |  |  |
| city_code | varchar | YES | NULL |  |  |  |
| barangay_code | varchar | YES | NULL |  |  |  |
| postal_code | varchar | YES | NULL |  |  |  |
| years_of_residency | int | YES | NULL |  |  |  |
| months_of_residency | int | YES | NULL |  |  |  |
| relationship_to_requestor | varchar | NO | NULL |  |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |
| updated_at | timestamp | NO | current_timestamp() |  | on update current_timestamp() |  |
| verification_image_path | varchar | YES | NULL |  |  |  |
| verification_image_name | varchar | YES | NULL |  |  |  |
| verification_image_size | int | YES | NULL |  |  |  |
| verification_image_mime_type | varchar | YES | NULL |  |  |  |
| verification_status | enum | YES | 'pending' |  |  |  |
| verified_by | int | YES | NULL |  |  |  |
| verified_at | timestamp | YES | NULL |  |  |  |
| verification_notes | text | YES | NULL |  |  |  |

**Row Count:** 0

## Table: document_requests

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| request_number | varchar | NO | NULL | UNI |  |  |
| client_id | int | NO | NULL | MUL |  |  |
| is_third_party_request | tinyint | YES | 0 |  |  |  |
| document_type_id | int | NO | NULL | MUL |  |  |
| purpose_category_id | int | NO | NULL | MUL |  |  |
| purpose_details | text | YES | NULL |  |  |  |
| requestor_notes | text | YES | NULL |  |  |  |
| status_id | int | NO | NULL | MUL |  |  |
| priority | enum | YES | 'normal' |  |  |  |
| processed_by | int | YES | NULL | MUL |  |  |
| approved_by | int | YES | NULL | MUL |  |  |
| processed_at | timestamp | YES | NULL |  |  |  |
| approved_at | timestamp | YES | NULL |  |  |  |
| payment_method_id | int | YES | NULL | MUL |  |  |
| payment_status | enum | YES | 'pending' | MUL |  |  |
| payment_reference | varchar | YES | NULL |  |  |  |
| payment_provider_reference | varchar | YES | NULL |  |  |  |
| paid_at | timestamp | YES | NULL |  |  |  |
| delivery_method | enum | YES | 'pickup' |  |  |  |
| delivery_address | text | YES | NULL |  |  |  |
| total_document_fee | decimal | NO | 0.00 | MUL |  |  |
| requested_at | timestamp | NO | current_timestamp() | MUL |  |  |
| target_completion_date | date | YES | NULL |  |  |  |
| completed_at | timestamp | YES | NULL |  |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |
| updated_at | timestamp | NO | current_timestamp() |  | on update current_timestamp() |  |

**Row Count:** 3

## Table: document_types

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| type_name | varchar | NO | NULL | UNI |  |  |
| description | text | YES | NULL |  |  |  |
| base_fee | decimal | NO | 0.00 |  |  |  |
| is_active | tinyint | YES | 1 |  |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |

**Row Count:** 2

## Table: generated_documents

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| request_id | int | NO | NULL | MUL |  |  |
| document_number | varchar | NO | NULL | UNI |  |  |
| document_path | varchar | YES | NULL |  |  |  |
| qr_code_data | text | YES | NULL |  |  |  |
| issued_date | date | NO | NULL | MUL |  |  |
| expiry_date | date | YES | NULL |  |  |  |
| is_valid | tinyint | YES | 1 |  |  |  |
| issued_by | int | NO | NULL | MUL |  |  |
| authorized_signatory | varchar | YES | NULL |  |  |  |
| security_hash | varchar | YES | NULL |  |  |  |
| verification_code | varchar | YES | NULL | MUL |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |

**Row Count:** 0

## Table: notifications

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| recipient_type | enum | NO | 'admin' | MUL |  |  |
| recipient_id | int | YES | NULL | MUL |  |  |
| type | varchar | NO | NULL | MUL |  |  |
| title | varchar | NO | NULL |  |  |  |
| message | text | NO | NULL |  |  |  |
| data | longtext | YES | NULL |  |  |  |
| priority | enum | YES | 'normal' | MUL |  |  |
| is_read | tinyint | YES | 0 | MUL |  |  |
| read_at | timestamp | YES | NULL |  |  |  |
| created_at | timestamp | NO | current_timestamp() | MUL |  |  |
| updated_at | timestamp | NO | current_timestamp() |  | on update current_timestamp() |  |

**Row Count:** 115

## Table: otps

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| email | varchar | NO | NULL | MUL |  |  |
| otp_code | varchar | NO | NULL | MUL |  |  |
| purpose | enum | YES | 'registration' |  |  |  |
| expires_at | datetime | NO | NULL | MUL |  |  |
| is_used | tinyint | YES | 0 |  |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |
| updated_at | timestamp | NO | current_timestamp() |  | on update current_timestamp() |  |

**Row Count:** 16

## Table: payment_methods

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| method_name | varchar | NO | NULL | UNI |  |  |
| method_code | varchar | NO | NULL | UNI |  |  |
| description | text | YES | NULL |  |  |  |
| is_online | tinyint | YES | 0 |  |  |  |
| is_active | tinyint | YES | 1 |  |  |  |
| processing_fee_percentage | decimal | YES | 0.00 |  |  |  |
| processing_fee_fixed | decimal | YES | 0.00 |  |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |
| requires_verification | tinyint | YES | 0 |  |  | Whether payment method requires manual verification |

**Row Count:** 6

## Table: payment_transactions

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| request_id | int | NO | NULL | MUL |  |  |
| payment_method_id | int | NO | NULL | MUL |  |  |
| transaction_id | varchar | NO | NULL | UNI |  |  |
| external_transaction_id | varchar | YES | NULL | MUL |  |  |
| paymongo_payment_intent_id | varchar | YES | NULL | MUL |  |  |
| paymongo_payment_method_id | varchar | YES | NULL |  |  |  |
| paymongo_source_id | varchar | YES | NULL |  |  |  |
| amount | decimal | NO | NULL |  |  |  |
| processing_fee | decimal | YES | 0.00 |  |  |  |
| net_amount | decimal | NO | NULL |  |  |  |
| currency | varchar | YES | 'PHP' |  |  |  |
| status | enum | YES | 'pending' | MUL |  |  |
| failure_reason | text | YES | NULL |  |  |  |
| payment_description | text | YES | NULL |  |  |  |
| customer_email | varchar | YES | NULL |  |  |  |
| customer_phone | varchar | YES | NULL |  |  |  |
| webhook_data | longtext | YES | NULL |  |  |  |
| callback_url | varchar | YES | NULL |  |  |  |
| success_url | varchar | YES | NULL |  |  |  |
| cancel_url | varchar | YES | NULL |  |  |  |
| initiated_at | timestamp | NO | current_timestamp() | MUL |  |  |
| completed_at | timestamp | YES | NULL |  |  |  |
| expires_at | timestamp | YES | NULL |  |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |
| updated_at | timestamp | NO | current_timestamp() |  | on update current_timestamp() |  |
| verified_by | int | YES | NULL | MUL |  | Admin who verified in-person payment |
| verified_at | timestamp | YES | NULL | MUL |  | When payment was verified |
| receipt_number | varchar | YES | NULL | MUL |  | Physical receipt number for cash payments |
| verification_notes | text | YES | NULL |  |  | Additional notes from payment verification |

**Row Count:** 0

## Table: payment_verifications

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| request_id | int | NO | NULL | MUL |  |  |
| payment_method_id | int | NO | NULL | MUL |  |  |
| amount_received | decimal | NO | NULL |  |  |  |
| receipt_number | varchar | YES | NULL |  |  |  |
| verification_notes | text | YES | NULL |  |  |  |
| proof_image_path | varchar | YES | NULL |  |  |  |
| verified_by | int | NO | NULL | MUL |  |  |
| verified_at | timestamp | NO | current_timestamp() | MUL |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |

**Row Count:** 0

## Table: payment_webhooks

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| webhook_id | varchar | NO | NULL | MUL |  |  |
| event_type | varchar | NO | NULL | MUL |  |  |
| transaction_id | varchar | YES | NULL | MUL |  |  |
| payment_transaction_id | int | YES | NULL | MUL |  |  |
| payload | longtext | NO | NULL |  |  |  |
| signature | varchar | YES | NULL |  |  |  |
| processed | tinyint | YES | 0 | MUL |  |  |
| processed_at | timestamp | YES | NULL |  |  |  |
| error_message | text | YES | NULL |  |  |  |
| retry_count | int | YES | 0 |  |  |  |
| created_at | timestamp | NO | current_timestamp() | MUL |  |  |

**Row Count:** 28

## Table: pending_residency_verifications
**Comment:** VIEW

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| account_id | int | NO | 0 |  |  |  |
| username | varchar | NO | NULL |  |  |  |
| account_status | enum | YES | 'pending_verification' |  |  |  |
| registration_date | timestamp | NO | current_timestamp() |  |  |  |
| first_name | varchar | YES | NULL |  |  |  |
| middle_name | varchar | YES | NULL |  |  |  |
| last_name | varchar | YES | NULL |  |  |  |
| email | varchar | YES | NULL |  |  |  |
| phone_number | varchar | YES | NULL |  |  |  |
| barangay | varchar | YES | NULL |  |  |  |
| city_municipality | varchar | YES | NULL |  |  |  |
| province | varchar | YES | NULL |  |  |  |
| years_of_residency | int | YES | NULL |  |  |  |
| months_of_residency | int | YES | NULL |  |  |  |
| document_count | bigint | NO | 0 |  |  |  |
| latest_document_upload | timestamp | YES | current_timestamp() |  |  |  |

**Row Count:** 0

## Table: pickup_schedules

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| request_id | int | NO | NULL | MUL |  |  |
| authorized_pickup_person_id | int | YES | NULL | MUL |  |  |
| scheduled_date | date | NO | NULL | MUL |  |  |
| scheduled_time_start | time | NO | NULL |  |  |  |
| scheduled_time_end | time | NO | NULL |  |  |  |
| pickup_notes | text | YES | NULL |  |  |  |
| scheduled_by | int | NO | NULL | MUL |  |  |
| client_confirmed | tinyint | YES | 0 |  |  |  |
| client_confirmed_at | timestamp | YES | NULL |  |  |  |
| actual_pickup_at | timestamp | YES | NULL | MUL |  |  |
| picked_up_by_name | varchar | YES | NULL |  |  |  |
| picked_up_by_id_type | varchar | YES | NULL |  |  |  |
| picked_up_by_id_number | varchar | YES | NULL |  |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |
| updated_at | timestamp | NO | current_timestamp() |  | on update current_timestamp() |  |

**Row Count:** 0

## Table: purpose_categories

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| category_name | varchar | NO | NULL |  |  |  |
| description | text | YES | NULL |  |  |  |
| is_active | tinyint | YES | 1 |  |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |

**Row Count:** 10

## Table: request_status

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| status_name | varchar | NO | NULL | UNI |  |  |
| description | text | YES | NULL |  |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |

**Row Count:** 9

## Table: request_status_history

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| request_id | int | NO | NULL | MUL |  |  |
| old_status_id | int | YES | NULL | MUL |  |  |
| new_status_id | int | NO | NULL | MUL |  |  |
| changed_by | int | NO | NULL | MUL |  |  |
| change_reason | text | YES | NULL |  |  |  |
| changed_at | timestamp | NO | current_timestamp() | MUL |  |  |

**Row Count:** 6

## Table: residency_documents

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| account_id | int | NO | NULL | MUL |  |  |
| document_type | enum | NO | NULL | MUL |  |  |
| document_name | varchar | NO | NULL |  |  |  |
| file_path | varchar | NO | NULL |  |  |  |
| file_size | int | YES | NULL |  |  |  |
| mime_type | varchar | YES | NULL |  |  |  |
| verification_status | enum | YES | 'pending' | MUL |  |  |
| verified_by | int | YES | NULL | MUL |  |  |
| verified_at | timestamp | YES | NULL |  |  |  |
| rejection_reason | text | YES | NULL |  |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |
| updated_at | timestamp | NO | current_timestamp() |  | on update current_timestamp() |  |

**Row Count:** 5

## Table: supporting_documents

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| request_id | int | NO | NULL | MUL |  |  |
| document_name | varchar | NO | NULL |  |  |  |
| document_type | varchar | NO | NULL | MUL |  |  |
| file_path | varchar | NO | NULL |  |  |  |
| file_size | int | YES | NULL |  |  |  |
| mime_type | varchar | YES | NULL |  |  |  |
| uploaded_by | int | NO | NULL | MUL |  |  |
| is_verified | tinyint | YES | 0 |  |  |  |
| verified_by | int | YES | NULL | MUL |  |  |
| verified_at | timestamp | YES | NULL |  |  |  |
| created_at | timestamp | NO | current_timestamp() |  |  |  |

**Row Count:** 3

## Table: system_settings

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| id | int | NO | NULL | PRI | auto_increment |  |
| setting_key | varchar | NO | NULL | UNI |  |  |
| setting_value | text | YES | NULL |  |  |  |
| setting_type | enum | YES | 'string' |  |  |  |
| description | text | YES | NULL |  |  |  |
| is_public | tinyint | YES | 0 |  |  |  |
| updated_by | int | YES | NULL | MUL |  |  |
| updated_at | timestamp | NO | current_timestamp() |  | on update current_timestamp() |  |

**Row Count:** 16

## Table: v_client_complete
**Comment:** VIEW

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| account_id | int | NO | 0 |  |  |  |
| username | varchar | NO | NULL |  |  |  |
| account_status | enum | YES | 'pending_verification' |  |  |  |
| email_verified | tinyint | YES | 0 |  |  |  |
| phone_verified | tinyint | YES | 0 |  |  |  |
| profile_id | int | NO | 0 |  |  |  |
| full_name | varchar | YES | NULL |  |  |  |
| first_name | varchar | NO | NULL |  |  |  |
| middle_name | varchar | YES | NULL |  |  |  |
| last_name | varchar | NO | NULL |  |  |  |
| suffix | varchar | YES | NULL |  |  |  |
| birth_date | date | NO | NULL |  |  |  |
| age | int | YES | NULL |  |  |  |
| gender | enum | NO | NULL |  |  |  |
| civil_status | varchar | NO | NULL |  |  |  |
| nationality | varchar | YES | 'Filipino' |  |  |  |
| phone_number | varchar | NO | NULL |  |  |  |
| email | varchar | YES | NULL |  |  |  |
| complete_address | text | YES | NULL |  |  |  |
| barangay | varchar | NO | NULL |  |  |  |
| city_municipality | varchar | NO | NULL |  |  |  |
| province | varchar | NO | NULL |  |  |  |
| years_of_residency | int | YES | NULL |  |  |  |
| months_of_residency | int | YES | NULL |  |  |  |
| is_verified | tinyint | YES | 0 |  |  |  |
| verified_at | timestamp | YES | NULL |  |  |  |

**Row Count:** 7

## Table: v_document_requests_complete
**Comment:** VIEW

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|

**Row Count:** Error retrieving count

## Table: v_document_requests_with_beneficiary
**Comment:** VIEW

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|

**Row Count:** Error retrieving count

## Table: v_payment_audit_trail
**Comment:** VIEW

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| transaction_id | int | NO | 0 |  |  |  |
| reference_number | varchar | NO | NULL |  |  |  |
| request_number | varchar | NO | NULL |  |  |  |
| document_name | varchar | NO | NULL |  |  |  |
| payment_method | varchar | NO | NULL |  |  |  |
| amount | decimal | NO | NULL |  |  |  |
| processing_fee | decimal | YES | 0.00 |  |  |  |
| net_amount | decimal | NO | NULL |  |  |  |
| payment_status | enum | YES | 'pending' |  |  |  |
| initiated_at | timestamp | NO | current_timestamp() |  |  |  |
| verified_at | timestamp | YES | NULL |  |  | When payment was verified |
| receipt_number | varchar | YES | NULL |  |  | Physical receipt number for cash payments |
| verification_notes | text | YES | NULL |  |  | Additional notes from payment verification |
| client_name | varchar | NO | '' |  |  |  |
| verified_by_name | varchar | YES | NULL |  |  |  |
| payment_type | varchar | YES | NULL |  |  |  |

**Row Count:** 0

## Table: v_payment_transactions_complete
**Comment:** VIEW

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| transaction_id | int | NO | 0 |  |  |  |
| internal_transaction_id | varchar | NO | NULL |  |  |  |
| external_transaction_id | varchar | YES | NULL |  |  |  |
| paymongo_payment_intent_id | varchar | YES | NULL |  |  |  |
| request_number | varchar | NO | NULL |  |  |  |
| request_id | int | NO | 0 |  |  |  |
| client_name | varchar | YES | NULL |  |  |  |
| client_email | varchar | YES | NULL |  |  |  |
| client_phone | varchar | NO | NULL |  |  |  |
| payment_method | varchar | NO | NULL |  |  |  |
| payment_method_code | varchar | NO | NULL |  |  |  |
| amount | decimal | NO | NULL |  |  |  |
| processing_fee | decimal | YES | 0.00 |  |  |  |
| net_amount | decimal | NO | NULL |  |  |  |
| currency | varchar | YES | 'PHP' |  |  |  |
| payment_status | enum | YES | 'pending' |  |  |  |
| failure_reason | text | YES | NULL |  |  |  |
| initiated_at | timestamp | NO | current_timestamp() |  |  |  |
| completed_at | timestamp | YES | NULL |  |  |  |
| expires_at | timestamp | YES | NULL |  |  |  |
| document_type | varchar | NO | NULL |  |  |  |

**Row Count:** 0

## Table: v_payment_verification_queue
**Comment:** VIEW

| Column | Type | Nullable | Default | Key | Extra | Comment |
|--------|------|----------|---------|-----|-------|----------|
| request_id | int | NO | 0 |  |  |  |
| request_number | varchar | NO | NULL |  |  |  |
| status_id | int | NO | NULL |  |  |  |
| status_name | varchar | NO | NULL |  |  |  |
| document_name | varchar | NO | NULL |  |  |  |
| base_fee | decimal | NO | 0.00 |  |  |  |
| payment_method | varchar | NO | NULL |  |  |  |
| requires_verification | tinyint | YES | 0 |  |  | Whether payment method requires manual verification |
| client_name | varchar | NO | '' |  |  |  |
| client_email | varchar | NO | NULL |  |  |  |
| request_date | timestamp | NO | current_timestamp() |  |  |  |
| approved_at | timestamp | YES | NULL |  |  |  |
| payment_status | enum | YES | 'pending' |  |  |  |
| transaction_id | varchar | YES | NULL |  |  |  |
| payment_amount | decimal | YES | NULL |  |  |  |
| transaction_status | enum | YES | 'pending' |  |  |  |
| verified_by | int | YES | NULL |  |  | Admin who verified in-person payment |
| verified_at | timestamp | YES | NULL |  |  | When payment was verified |
| receipt_number | varchar | YES | NULL |  |  | Physical receipt number for cash payments |
| verified_by_name | varchar | YES | NULL |  |  |  |

**Row Count:** 0

## Activity/Audit Related Tables

Found 3 potential activity/audit tables:
- audit_logs
- request_status_history
- v_payment_audit_trail

## User Management Tables

- admin_employee_accounts
- admin_employee_profiles
- client_accounts
- client_profiles
- v_client_complete

## Request Management Tables

- authorization_documents
- beneficiary_verification_documents
- document_beneficiaries
- document_requests
- document_types
- generated_documents
- request_status
- request_status_history
- residency_documents
- supporting_documents
- v_document_requests_complete
- v_document_requests_with_beneficiary
