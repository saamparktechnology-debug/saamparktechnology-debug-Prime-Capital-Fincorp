CREATE DATABASE  IF NOT EXISTS `microfinance_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `microfinance_db`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: microfinance_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `admin_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `otp_code` varchar(6) DEFAULT NULL,
  `otp_expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'pcf.fincorp@gmail.com','$2b$10$DE.Om7nfUjivC7WGNFeZ4OEyNP99NKtco7ZPSoJAnROBHWxFFHFUi','System Administrator','9876543210',1,'2026-09-26 18:39:33','2026-10-04 05:29:00',NULL,NULL);
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agent_documents`
--

DROP TABLE IF EXISTS `agent_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agent_documents` (
  `document_id` int NOT NULL AUTO_INCREMENT,
  `agent_id` int NOT NULL,
  `document_type` varchar(50) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `uploaded_by_role` enum('admin','agent') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`document_id`),
  KEY `fk_agent_docs_agent` (`agent_id`),
  CONSTRAINT `fk_agent_docs_agent` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`agent_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agent_documents`
--

LOCK TABLES `agent_documents` WRITE;
/*!40000 ALTER TABLE `agent_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `agent_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agent_kyc`
--

DROP TABLE IF EXISTS `agent_kyc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agent_kyc` (
  `kyc_id` int NOT NULL AUTO_INCREMENT,
  `agent_id` int NOT NULL,
  `agent_code` varchar(20) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `marital_status` enum('single','married','widowed','divorced') DEFAULT NULL,
  `father_name` varchar(255) DEFAULT NULL,
  `mother_name` varchar(255) DEFAULT NULL,
  `primary_phone` varchar(20) DEFAULT NULL,
  `alternate_phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `current_address` varchar(500) DEFAULT NULL,
  `current_city` varchar(100) DEFAULT NULL,
  `current_state` varchar(100) DEFAULT NULL,
  `current_pincode` varchar(10) DEFAULT NULL,
  `same_as_current` tinyint(1) DEFAULT '1',
  `permanent_address` varchar(500) DEFAULT NULL,
  `permanent_city` varchar(100) DEFAULT NULL,
  `permanent_state` varchar(100) DEFAULT NULL,
  `permanent_pincode` varchar(10) DEFAULT NULL,
  `national_id_number` varchar(50) DEFAULT NULL,
  `pan_number` varchar(20) DEFAULT NULL,
  `voter_id_number` varchar(50) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `branch_name` varchar(255) DEFAULT NULL,
  `account_holder_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `ifsc_code` varchar(20) DEFAULT NULL,
  `occupation_type` varchar(50) DEFAULT NULL,
  `employer_or_business_name` varchar(255) DEFAULT NULL,
  `work_experience_years` int DEFAULT NULL,
  `monthly_income` decimal(12,2) DEFAULT NULL,
  `primary_income_source` varchar(255) DEFAULT NULL,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_relationship` varchar(100) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `nominee_full_name` varchar(255) DEFAULT NULL,
  `nominee_relationship` varchar(100) DEFAULT NULL,
  `nominee_phone` varchar(20) DEFAULT NULL,
  `nominee_dob` date DEFAULT NULL,
  `kyc_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `issue_date` date DEFAULT NULL,
  `valid_till` date DEFAULT NULL,
  `kyc_rejection_reason` text,
  `reviewed_by` int DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`kyc_id`),
  UNIQUE KEY `uk_agent_kyc_agent` (`agent_id`),
  UNIQUE KEY `uk_agent_kyc_code` (`agent_code`),
  KEY `fk_agent_kyc_agent` (`agent_id`),
  KEY `fk_agent_kyc_reviewer` (`reviewed_by`),
  CONSTRAINT `fk_agent_kyc_agent` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`agent_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_agent_kyc_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `admins` (`admin_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agent_kyc`
--

LOCK TABLES `agent_kyc` WRITE;
/*!40000 ALTER TABLE `agent_kyc` DISABLE KEYS */;
/*!40000 ALTER TABLE `agent_kyc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agent_permissions`
--

DROP TABLE IF EXISTS `agent_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agent_permissions` (
  `permission_id` int NOT NULL AUTO_INCREMENT,
  `agent_id` int NOT NULL,
  `module_name` varchar(50) NOT NULL,
  `can_create` tinyint(1) DEFAULT '0',
  `can_read` tinyint(1) DEFAULT '1',
  `can_update` tinyint(1) DEFAULT '0',
  `can_delete` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`permission_id`),
  UNIQUE KEY `uk_agent_module` (`agent_id`,`module_name`),
  CONSTRAINT `agent_permissions_ibfk_1` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`agent_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agent_permissions`
--

LOCK TABLES `agent_permissions` WRITE;
/*!40000 ALTER TABLE `agent_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `agent_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agents`
--

DROP TABLE IF EXISTS `agents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agents` (
  `agent_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `otp_code` varchar(6) DEFAULT NULL,
  `otp_expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`agent_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agents`
--

LOCK TABLES `agents` WRITE;
/*!40000 ALTER TABLE `agents` DISABLE KEYS */;

/*!40000 ALTER TABLE `agents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `audit_id` int NOT NULL AUTO_INCREMENT,
  `actor_type` enum('admin','agent','system') NOT NULL,
  `actor_id` int NOT NULL,
  `action` varchar(100) NOT NULL,
  `target_entity` varchar(50) NOT NULL,
  `target_id` int NOT NULL,
  `old_value` text,
  `new_value` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`)
) ENGINE=InnoDB AUTO_INCREMENT=138 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banks`
--

DROP TABLE IF EXISTS `banks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banks` (
  `bank_id` int NOT NULL AUTO_INCREMENT,
  `bank_name` varchar(255) NOT NULL,
  `short_code` varchar(20) DEFAULT NULL,
  `tagline` varchar(255) DEFAULT NULL,
  `logo_path` varchar(500) DEFAULT NULL,
  `apply_link` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`bank_id`),
  UNIQUE KEY `bank_name` (`bank_name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banks`
--

LOCK TABLES `banks` WRITE;
/*!40000 ALTER TABLE `banks` DISABLE KEYS */;
INSERT INTO `banks` VALUES (1,'Bharatpe','BHARATPE','BHARATPE','logos/logo_1790959186184-352827537.jpeg','https://customerleads-team.web.app/?hash=BPPEPL&d=d81b1a4ce61418eb054934f9c5a60149&m=379c2037094271a7c1962f45cab55d19',1,1,'2026-10-02 16:39:46','2026-10-02 16:39:46'),(2,'Credit Sea','Credit Sea','Credit Sea','logos/logo_1790959269085-176569926.jpeg','https://customerleads-team.web.app/?hash=CRSEPL&d=d81b1a4ce61418eb054934f9c5a60149&m=379c2037094271a7c1962f45cab55d19',1,0,'2026-10-02 16:41:09','2026-10-02 16:41:18'),(3,'FLOT','FLOT','FLOT','logos/logo_1790959401569-651585915.jpeg','https://customerleads-team.web.app/?hash=FLOTPL&d=d81b1a4ce61418eb054934f9c5a60149&m=379c2037094271a7c1962f45cab55d19',1,2,'2026-10-02 16:41:45','2026-10-02 16:43:21'),(6,'KISSHT','KISSHT','KISSHT','logos/logo_1790959522753-695859459.jpeg','https://customerleads-team.web.app/?hash=KSHTPL&d=d81b1a4ce61418eb054934f9c5a60149&m=379c2037094271a7c1962f45cab55d19',1,3,'2026-10-02 16:43:54','2026-10-02 16:45:22'),(7,'POONAWALA FINCORP','POONAWALA FINCORP','POONAWALA FINCORP','logos/logo_1790960058652-915433883.jpeg','https://customerleads-team.web.app/?hash=PWFCPL&d=d81b1a4ce61418eb054934f9c5a60149&m=379c2037094271a7c1962f45cab55d19',1,5,'2026-10-02 16:46:22','2026-10-02 16:54:18');
/*!40000 ALTER TABLE `banks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_categories`
--

DROP TABLE IF EXISTS `business_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `uk_business_category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_categories`
--

LOCK TABLES `business_categories` WRITE;
/*!40000 ALTER TABLE `business_categories` DISABLE KEYS */;
INSERT INTO `business_categories` VALUES (1,'Sole Proprietorship','Single owner business',1,1,'2026-10-04 08:15:19','2026-10-04 08:15:19'),(2,'Partnership','Partnership firm',1,2,'2026-10-04 08:15:19','2026-10-04 08:15:19'),(3,'LLP','Limited Liability Partnership',1,3,'2026-10-04 08:15:19','2026-10-04 08:15:19'),(4,'Private Limited','Private Limited Company',1,4,'2026-10-04 08:15:19','2026-10-04 08:15:19'),(5,'Public Limited','Public Limited Company',1,5,'2026-10-04 08:15:19','2026-10-04 08:15:19'),(6,'One Person Company','OPC',1,6,'2026-10-04 08:15:19','2026-10-04 08:15:19'),(7,'HUF','Hindu Undivided Family',1,7,'2026-10-04 08:15:19','2026-10-04 08:15:19'),(8,'Other','Other categories',1,99,'2026-10-04 08:15:19','2026-10-04 08:15:19');
/*!40000 ALTER TABLE `business_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_types`
--

DROP TABLE IF EXISTS `business_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_types` (
  `type_id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`type_id`),
  UNIQUE KEY `uk_business_type_name` (`type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_types`
--

LOCK TABLES `business_types` WRITE;
/*!40000 ALTER TABLE `business_types` DISABLE KEYS */;
INSERT INTO `business_types` VALUES (1,'Retail','Retail shop or store',1,1,'2026-10-04 08:15:06','2026-10-04 08:15:06'),(2,'Wholesale','Wholesale trading business',1,2,'2026-10-04 08:15:06','2026-10-04 08:15:06'),(3,'Manufacturing','Manufacturing or production unit',1,3,'2026-10-04 08:15:06','2026-10-04 08:15:06'),(4,'Service','Service-based business',1,4,'2026-10-04 08:15:06','2026-10-04 08:15:06'),(5,'Trading','Trading and distribution',1,5,'2026-10-04 08:15:06','2026-10-04 08:15:06'),(6,'Agriculture','Farming or agriculture-related',1,6,'2026-10-04 08:15:06','2026-10-04 08:15:06'),(8,'Other','Other business types',1,99,'2026-10-04 08:15:06','2026-10-04 08:15:06'),(9,'Food','jhfghjgfftyjfgjf',1,0,'2026-10-04 09:23:59','2026-10-04 09:23:59');
/*!40000 ALTER TABLE `business_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_profile`
--

DROP TABLE IF EXISTS `company_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_profile` (
  `company_id` int NOT NULL AUTO_INCREMENT,
  `company_name` varchar(255) NOT NULL,
  `tagline` varchar(255) DEFAULT NULL,
  `logo_path` varchar(500) DEFAULT NULL,
  `address_line1` varchar(255) DEFAULT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `card_validity_years` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_profile`
--

LOCK TABLES `company_profile` WRITE;
/*!40000 ALTER TABLE `company_profile` DISABLE KEYS */;
INSERT INTO `company_profile` VALUES (1,'Capital Fincorp Pvt. Ltd.','Better Credit, Brighter Future','documents/doc_1791089069922-671352545.png','144 GT Road East End','2nd Floor, Posripally','Burdwan','West Bengal','713103','+91 81700 82678','info@yourcompany.com',NULL,1,'2026-09-29 13:54:34','2026-10-04 04:44:29');
/*!40000 ALTER TABLE `company_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `credit_card_applications`
--

DROP TABLE IF EXISTS `credit_card_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit_card_applications` (
  `application_id` int NOT NULL AUTO_INCREMENT,
  `card_type` enum('fd','normal') NOT NULL,
  `bank_id` int DEFAULT NULL,
  `agent_id` int DEFAULT NULL,
  `applied_from_office` tinyint(1) NOT NULL DEFAULT '0',
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `aadhaar_number` varchar(20) DEFAULT NULL,
  `pan_number` varchar(20) DEFAULT NULL,
  `aadhaar_doc_path` varchar(500) DEFAULT NULL,
  `pan_doc_path` varchar(500) DEFAULT NULL,
  `pincode` varchar(10) NOT NULL,
  `status` enum('initiated','completed','cancelled') DEFAULT 'initiated',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`application_id`),
  KEY `idx_cc_agent` (`agent_id`),
  KEY `idx_cc_type` (`card_type`),
  KEY `idx_cc_bank` (`bank_id`),
  CONSTRAINT `fk_cc_agent` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`agent_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_cc_bank` FOREIGN KEY (`bank_id`) REFERENCES `credit_card_banks` (`bank_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `credit_card_applications`
--

LOCK TABLES `credit_card_applications` WRITE;
/*!40000 ALTER TABLE `credit_card_applications` DISABLE KEYS */;

/*!40000 ALTER TABLE `credit_card_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `credit_card_banks`
--

DROP TABLE IF EXISTS `credit_card_banks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit_card_banks` (
  `bank_id` int NOT NULL AUTO_INCREMENT,
  `bank_name` varchar(255) NOT NULL,
  `short_code` varchar(20) DEFAULT NULL,
  `logo_path` varchar(500) DEFAULT NULL,
  `apply_link` varchar(500) NOT NULL,
  `tagline` varchar(255) DEFAULT NULL,
  `target_audience` text NOT NULL,
  `documents_required` text NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`bank_id`),
  UNIQUE KEY `uk_cc_bank_name` (`bank_name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `credit_card_banks`
--

LOCK TABLES `credit_card_banks` WRITE;
/*!40000 ALTER TABLE `credit_card_banks` DISABLE KEYS */;
INSERT INTO `credit_card_banks` VALUES (1,'IndusInd Bank Credit Card','INDUSIND',NULL,'https://leads.goldenteam.in/?h=TDBHeTM0eDM1WThaQm1CSG56UDFFSEtTV0hOUmxlK3pmVnphNkdNMjFwbz0=','IndusInd Bank','Age: 21 to 60 years\nEmployment Type: Salaried (Service sector) or Self-Employed (Small business owners)\nAnnual Income: ₹3 Lakhs or more\nCredit Score: 680+ with no negative credit history','Aadhaar Card\nPAN Card\nAddress Proof (Utility bill, Aadhaar, Rent agreement, etc.)\nIncome Proof - Salaried: Latest payslip or last 3 months payslips\nIncome Proof - Self-Employed: Latest ITR with tax computation',1,1,'2026-10-08 04:16:32','2026-10-08 04:16:32'),(2,'Scapia Axis Bank Credit Card',NULL,NULL,'https://leads.goldenteam.in/?h=TnNtN3JHWDdZRVZCQ3o4OXdzeW1DSFdDaUN2UHVuR0tQNWxoR0Y3Z0VVWT0=',NULL,'Age:\n– 21 to 65 years (Salaried)\n– 25 to 65 years (Self-Employed)\n\n Income:\n– ₹18,000/month (Salaried)\n– ₹4 Lakhs/year (Self-Employed)\n\nCustomer Type:\n– New to Bank (NTB) only\n\nRequirement:\n– Must have a regular & stable income\n\nCIBIL Score:\n– Minimum 740+\n– Credit Enquiries: ≤ 5 in the last 180 days\n– No Current DPD (Days Past Due)','Aadhar Card\nPan details and physical pan card for VKYC',1,0,'2026-10-08 05:25:10','2026-10-08 05:25:10');
/*!40000 ALTER TABLE `credit_card_banks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `agent_id` int NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `marital_status` enum('single','married','widowed','divorced') NOT NULL,
  `father_name` varchar(100) NOT NULL,
  `mother_name` varchar(100) NOT NULL,
  `primary_phone` varchar(20) NOT NULL,
  `alternate_phone` varchar(20) DEFAULT NULL,
  `email_address` varchar(150) DEFAULT NULL,
  `current_address_line1` varchar(255) NOT NULL,
  `current_address_line2` varchar(255) DEFAULT NULL,
  `current_city` varchar(100) NOT NULL,
  `current_state` varchar(100) NOT NULL,
  `current_pincode` varchar(20) NOT NULL,
  `residence_type` enum('owned','rented','family') NOT NULL,
  `same_as_current` tinyint(1) DEFAULT '0',
  `permanent_address_line1` varchar(255) DEFAULT NULL,
  `permanent_city` varchar(100) DEFAULT NULL,
  `permanent_state` varchar(100) DEFAULT NULL,
  `permanent_pincode` varchar(20) DEFAULT NULL,
  `family_type` enum('nuclear','joint','extended') NOT NULL,
  `total_family_members` int NOT NULL,
  `earning_members_count` int NOT NULL,
  `dependents_count` int NOT NULL,
  `national_id_number` varchar(50) NOT NULL,
  `tax_id_number` varchar(50) NOT NULL,
  `voter_id_number` varchar(50) DEFAULT NULL,
  `bank_name` varchar(100) NOT NULL,
  `branch_name` varchar(100) NOT NULL,
  `account_holder_name` varchar(100) NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `ifsc_code` varchar(20) NOT NULL,
  `occupation_type` enum('salaried','self_employed','business','farmer','freelancer','other') NOT NULL,
  `employer_or_business_name` varchar(100) NOT NULL,
  `work_experience_years` int NOT NULL,
  `monthly_personal_income` decimal(12,2) NOT NULL,
  `monthly_household_income` decimal(12,2) NOT NULL,
  `primary_income_source` varchar(100) NOT NULL,
  `nominee_full_name` varchar(100) NOT NULL,
  `nominee_relationship` varchar(50) NOT NULL,
  `nominee_phone` varchar(20) NOT NULL,
  `nominee_dob` date NOT NULL,
  `kyc_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `kyc_rejection_reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `primary_phone` (`primary_phone`),
  UNIQUE KEY `national_id_number` (`national_id_number`),
  UNIQUE KEY `tax_id_number` (`tax_id_number`),
  KEY `agent_id` (`agent_id`),
  CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`agent_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;

/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `demat_applications`
--

DROP TABLE IF EXISTS `demat_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `demat_applications` (
  `application_id` int NOT NULL AUTO_INCREMENT,
  `bank_id` int NOT NULL,
  `agent_id` int NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `aadhaar_number` varchar(20) DEFAULT NULL,
  `pan_number` varchar(20) DEFAULT NULL,
  `pincode` varchar(10) NOT NULL,
  `status` enum('initiated','completed','cancelled') DEFAULT 'initiated',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`application_id`),
  KEY `idx_demat_agent` (`agent_id`),
  KEY `idx_demat_bank` (`bank_id`),
  CONSTRAINT `demat_applications_ibfk_1` FOREIGN KEY (`bank_id`) REFERENCES `demat_banks` (`bank_id`) ON DELETE RESTRICT,
  CONSTRAINT `demat_applications_ibfk_2` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`agent_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `demat_applications`
--

LOCK TABLES `demat_applications` WRITE;
/*!40000 ALTER TABLE `demat_applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `demat_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `demat_banks`
--

DROP TABLE IF EXISTS `demat_banks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `demat_banks` (
  `bank_id` int NOT NULL AUTO_INCREMENT,
  `bank_name` varchar(255) NOT NULL,
  `short_code` varchar(20) DEFAULT NULL,
  `logo_path` varchar(500) DEFAULT NULL,
  `apply_link` varchar(500) NOT NULL,
  `tagline` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`bank_id`),
  UNIQUE KEY `uk_demat_bank_name` (`bank_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `demat_banks`
--

LOCK TABLES `demat_banks` WRITE;
/*!40000 ALTER TABLE `demat_banks` DISABLE KEYS */;
INSERT INTO `demat_banks` VALUES (1,'Incred Stock Demat A/C','Incred Stock Demat','logos/logo_1790960157698-578503465.jpeg','https://leads.goldenteam.in/?h=cG54QnR0RE1UQTcwY09lK3Y2S1JTWi9GQmg3M1hyZWdvdlBEOE1nNVgzND0=','Complete first trade of minimum ₹100 within same month',1,0,'2026-10-02 16:55:57','2026-10-02 16:56:29'),(2,'Angelone Demat A/C','Angelone Demat A/C','logos/logo_1790960936791-137784167.jpeg','https://leads.goldenteam.in/?h=MU9oNng0d2w3V1lOYXdCWmxMOFZudmMveHFGakF4WHpOLzRvYW11S3JJRT0=','Complete first trade of minimum ₹200 within same month',1,0,'2026-10-02 16:57:27','2026-10-02 17:08:56'),(3,'Kotak securities','Kotak securities','logos/logo_1790960951550-674099339.jpeg','https://customerleads-team.web.app/?hash=KSECDA&d=d81b1a4ce61418eb054934f9c5a60149&m=379c2037094271a7c1962f45cab55d19','Kotak securities',1,0,'2026-10-02 16:58:07','2026-10-02 17:09:11'),(4,'Upstox Demat Account','Upstox Demat Account','logos/logo_1790961018410-428951607.jpeg','https://customerleads-team.web.app/?hash=UPAPDA&d=d81b1a4ce61418eb054934f9c5a60149&m=379c2037094271a7c1962f45cab55d19','Upstox Demat Account',1,0,'2026-10-02 16:59:17','2026-10-02 17:10:18');
/*!40000 ALTER TABLE `demat_banks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `document_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `document_type` varchar(50) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `uploaded_by_role` enum('agent','admin') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`document_id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loans`
--

DROP TABLE IF EXISTS `loans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loans` (
  `loan_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `aadhaar_number` varchar(20) DEFAULT NULL,
  `pan_number` varchar(20) DEFAULT NULL,
  `loan_type` varchar(100) NOT NULL DEFAULT 'General',
  `agent_id` int NOT NULL,
  `requested_amount` decimal(12,2) NOT NULL,
  `approved_amount` decimal(12,2) DEFAULT NULL,
  `tenure_months` int NOT NULL,
  `interest_rate` decimal(5,2) NOT NULL,
  `interest_type` enum('flat','reducing') NOT NULL DEFAULT 'flat',
  `purpose` varchar(255) NOT NULL,
  `business_name` varchar(255) DEFAULT NULL,
  `business_type_id` int DEFAULT NULL,
  `business_category_id` int DEFAULT NULL,
  `business_age_years` int DEFAULT NULL,
  `annual_turnover` decimal(15,2) DEFAULT NULL,
  `ownership_type` enum('owned','rented','leased','family') DEFAULT NULL,
  `business_address` varchar(500) DEFAULT NULL,
  `business_landmark` varchar(255) DEFAULT NULL,
  `business_city` varchar(100) DEFAULT NULL,
  `business_state` varchar(100) DEFAULT NULL,
  `business_pincode` varchar(10) DEFAULT NULL,
  `client_dob` date DEFAULT NULL,
  `client_marital_status` enum('single','married','widowed','divorced') DEFAULT NULL,
  `client_spouse_name` varchar(255) DEFAULT NULL,
  `client_mother_name` varchar(255) DEFAULT NULL,
  `client_alternate_phone` varchar(20) DEFAULT NULL,
  `client_address` varchar(500) DEFAULT NULL,
  `client_landmark` varchar(255) DEFAULT NULL,
  `client_city` varchar(100) DEFAULT NULL,
  `client_state` varchar(100) DEFAULT NULL,
  `client_pincode` varchar(10) DEFAULT NULL,
  `aadhaar_doc_path` varchar(500) DEFAULT NULL,
  `pan_doc_path` varchar(500) DEFAULT NULL,
  `business_reg_doc_path` varchar(500) DEFAULT NULL,
  `bank_statement_doc_path` varchar(500) DEFAULT NULL,
  `loan_status` enum('Draft','Applied','Under Review','Approved','Rejected','Disbursed','Active','Completed','Overdue','Cancelled') DEFAULT 'Draft',
  `bank_reference_number` varchar(100) DEFAULT NULL,
  `rejection_reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `bank_id` int DEFAULT NULL,
  PRIMARY KEY (`loan_id`),
  KEY `customer_id` (`customer_id`),
  KEY `agent_id` (`agent_id`),
  KEY `fk_loan_bank` (`bank_id`),
  KEY `fk_loans_business_type` (`business_type_id`),
  KEY `fk_loans_business_category` (`business_category_id`),
  CONSTRAINT `fk_loan_bank` FOREIGN KEY (`bank_id`) REFERENCES `banks` (`bank_id`),
  CONSTRAINT `fk_loans_business_category` FOREIGN KEY (`business_category_id`) REFERENCES `business_categories` (`category_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_loans_business_type` FOREIGN KEY (`business_type_id`) REFERENCES `business_types` (`type_id`) ON DELETE SET NULL,
  CONSTRAINT `loans_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE RESTRICT,
  CONSTRAINT `loans_ibfk_2` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`agent_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loans`
--

LOCK TABLES `loans` WRITE;
/*!40000 ALTER TABLE `loans` DISABLE KEYS */;

/*!40000 ALTER TABLE `loans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `recipient_type` enum('admin','agent','customer') NOT NULL,
  `recipient_id` int NOT NULL,
  `channel` enum('email','sms') NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('pending','sent','failed') DEFAULT 'pending',
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repayment_emis`
--

DROP TABLE IF EXISTS `repayment_emis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `repayment_emis` (
  `emi_id` int NOT NULL AUTO_INCREMENT,
  `loan_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `installment_number` int NOT NULL,
  `emi_amount` decimal(12,2) NOT NULL,
  `due_date` date NOT NULL,
  `installments_left` int NOT NULL,
  `status` enum('Pending','Paid','Overdue') DEFAULT 'Pending',
  `paid_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`emi_id`),
  KEY `loan_id` (`loan_id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `repayment_emis_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`) ON DELETE CASCADE,
  CONSTRAINT `repayment_emis_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `repayment_emis`
--

LOCK TABLES `repayment_emis` WRITE;
/*!40000 ALTER TABLE `repayment_emis` DISABLE KEYS */;
/*!40000 ALTER TABLE `repayment_emis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `savings_applications`
--

DROP TABLE IF EXISTS `savings_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `savings_applications` (
  `application_id` int NOT NULL AUTO_INCREMENT,
  `bank_id` int NOT NULL,
  `agent_id` int NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `aadhaar_number` varchar(20) DEFAULT NULL,
  `pan_number` varchar(20) DEFAULT NULL,
  `pincode` varchar(10) NOT NULL,
  `status` enum('initiated','completed','cancelled') DEFAULT 'initiated',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`application_id`),
  KEY `idx_savings_agent` (`agent_id`),
  KEY `idx_savings_bank` (`bank_id`),
  KEY `idx_savings_status` (`status`),
  CONSTRAINT `savings_applications_ibfk_1` FOREIGN KEY (`bank_id`) REFERENCES `savings_banks` (`bank_id`) ON DELETE RESTRICT,
  CONSTRAINT `savings_applications_ibfk_2` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`agent_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `savings_applications`
--

LOCK TABLES `savings_applications` WRITE;
/*!40000 ALTER TABLE `savings_applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `savings_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `savings_banks`
--

DROP TABLE IF EXISTS `savings_banks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `savings_banks` (
  `bank_id` int NOT NULL AUTO_INCREMENT,
  `bank_name` varchar(255) NOT NULL,
  `short_code` varchar(20) DEFAULT NULL,
  `logo_path` varchar(500) DEFAULT NULL,
  `apply_link` varchar(500) NOT NULL,
  `tagline` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`bank_id`),
  UNIQUE KEY `uk_savings_bank_name` (`bank_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `savings_banks`
--

LOCK TABLES `savings_banks` WRITE;
/*!40000 ALTER TABLE `savings_banks` DISABLE KEYS */;
INSERT INTO `savings_banks` VALUES (1,'DBS BANK','DBS','logos/logo_1791129366072-106897502.jpeg','https://leads.goldenteam.in/?h=Y1htVGFpTnhmcVJ6enR4ZmQvNWNzV0NtMFRscWZRQnBHRWMzeGhDOGI5cz0=','Savings account',1,0,'2026-10-04 05:39:22','2026-10-04 15:56:46'),(2,'KOTAK 811','KOTAK 811','logos/logo_1791129514672-565583926.jpeg','https://leads.goldenteam.in/?h=ZGtrU3Z0eTBGTnlpc3hLd3V4cldBcVBWL001KzJEb3dobnFTTHRIaXpDMD0=','KOTAK 811',1,0,'2026-10-04 15:58:34','2026-10-04 15:58:34'),(3,'AXIS BANK','AXIS BANK','logos/logo_1791129612330-404535523.jpeg','https://leads.goldenteam.in/?h=d3RHblR2Uy85akpJTEl2bnZwNjd2U0pwNUgvUjBCbTVwdXVlWU84ZXRnYz0=','AXIS BANK',1,0,'2026-10-04 16:00:12','2026-10-04 16:00:12'),(4,'AIRTEL PAYMENT BANK','AIRTEL PAYMENT BANK','logos/logo_1791129675215-304967609.jpeg','https://leads.goldenteam.in/?h=M0RCb0VSR0RWREtWWlF2RUhCMDBaM1RrSHRJWFRYNDRQdXVzZDAwYyttbz0=','AIRTEL PAYMENT BANK',1,0,'2026-10-04 16:01:15','2026-10-04 16:01:15'),(5,'KOTAK 811 SUPER','KOTAK 811 SUPER','logos/logo_1791129871457-964542255.jpeg','https://customerleads-team.web.app/?hash=KTFVSA&d=d81b1a4ce61418eb054934f9c5a60149&m=379c2037094271a7c1962f45cab55d19','KOTAK 811 SUPER ACCOUNT 5K FUNDING',1,0,'2026-10-04 16:04:31','2026-10-04 16:04:31');
/*!40000 ALTER TABLE `savings_banks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'microfinance_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-08 11:12:21
