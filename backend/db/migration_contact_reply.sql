-- Migration: Add admin reply support to contacts table
ALTER TABLE contacts ADD COLUMN admin_reply TEXT NULL AFTER message;
ALTER TABLE contacts ADD COLUMN replied_at TIMESTAMP NULL AFTER admin_reply;
