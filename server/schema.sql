-- ============================================================
--  SecureVault — Production Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS securevault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE securevault;

-- ─────────────────────────────────────────────
-- 1. Users (with lockout & device tracking)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    email            VARCHAR(255) UNIQUE NOT NULL,
    password_hash    VARCHAR(255)        NOT NULL,
    role             ENUM('admin','user') DEFAULT 'user',

    login_attempts   INT     DEFAULT 0,
    lock_until       DATETIME,

    last_login_ip    VARCHAR(45),
    last_login_device TEXT,

    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_email (email)
);

-- ─────────────────────────────────────────────
-- 2. Sessions (Zero Trust — device + IP tracking)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    token       TEXT   NOT NULL,
    ip_address  VARCHAR(45),
    device_info TEXT,
    is_active   BOOLEAN DEFAULT TRUE,

    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_active (is_active)
);

-- ─────────────────────────────────────────────
-- 3. Files (Core Vault Feature)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS files (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT NOT NULL,

    file_name     VARCHAR(255),
    file_path     TEXT,
    encrypted_key TEXT,

    file_size     BIGINT,
    mime_type     VARCHAR(100),

    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_files_user (user_id)
);

-- ─────────────────────────────────────────────
-- 4. Activity Logs (Full Audit Trail)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT,

    action      VARCHAR(100),
    ip_address  VARCHAR(45),
    device_info TEXT,
    status      ENUM('success','failed'),

    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_activity_user (user_id),
    INDEX idx_activity_created (created_at)
);

-- ─────────────────────────────────────────────
-- 5. Threat Logs (Behavior-based Detection)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS threat_logs (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT,

    threat_type VARCHAR(100),
    risk_score  INT,
    blocked     BOOLEAN DEFAULT FALSE,

    ip_address  VARCHAR(45),

    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_threats_user (user_id),
    INDEX idx_threats_blocked (blocked)
);

-- ─────────────────────────────────────────────
-- 6. OTP / Password Reset
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS password_resets (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,

    otp_hash    VARCHAR(255),
    expires_at  DATETIME,

    attempts    INT DEFAULT 0,

    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reset_user (user_id)
);
