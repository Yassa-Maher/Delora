-- Migration: Support decimal quantities for weight-based products
-- Run this if you need to support products sold by weight (kg, liter, etc.)

ALTER TABLE cart_items MODIFY COLUMN quantity DECIMAL(10, 3) NOT NULL DEFAULT 1;
ALTER TABLE order_items MODIFY COLUMN quantity DECIMAL(10, 3) NOT NULL;
