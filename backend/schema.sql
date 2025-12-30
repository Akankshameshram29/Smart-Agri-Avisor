-- Smart Agri Advisor Database Schema
-- Run this in Supabase SQL Editor to create tables

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    joined_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster phone lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Create index for faster user message lookups
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

-- Farmer Records Table (Analysis History)
CREATE TABLE IF NOT EXISTS farmer_records (
    id VARCHAR(20) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    district VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    data TEXT NOT NULL
);

-- Create index for faster user record lookups
CREATE INDEX IF NOT EXISTS idx_farmer_records_user_id ON farmer_records(user_id);

-- Verify tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
