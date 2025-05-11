# 🌩️ Cloud-Based Web App Deployment on AWS

This project showcases a full-stack web application deployed on Amazon Web Services. It features user registration and login, CRUD operations for posts, and file/image uploads, utilizing services like EC2, RDS (MySQL), S3, and Elastic Beanstalk.

## 🛠 Tech Stack
- **Frontend:** React
- **Backend:** Node.js + Express
- **Database:** Amazon RDS (MySQL)
- **File Storage:** Amazon S3
- **Deployment:**
  - Backend on EC2
  - Frontend on Elastic Beanstalk

## 🚀 Deployment Guide

### 🧩 1. Pre-requisites
- AWS Free Tier account
- AWS CLI installed and configured
- Node.js and npm installed
- React installed locally
- Git for cloning the repository

### ☁ 2. AWS Infrastructure Setup

#### 🔹 VPC Configuration
- Custom VPC: `Umair-AppVPC` (CIDR: 10.0.0.0/16)
- Subnets:
  - Public: us-east-1a, us-east-1b
  - Private: us-east-1a, us-east-1b
- Internet Gateway for public access
- 2 NAT Gateways for outbound internet in private subnets
- 3 Route Tables: 1 public, 2 private

#### 🔹 Security Groups
- **EC2:** Ports 22, 80, 443, 5000
- **RDS:** Port 3306 (from EC2 SG only)
- **Elastic Beanstalk:** HTTP/HTTPS from all sources

#### 🔹 IAM Roles
- EC2 Role: Access to S3 and RDS
- Elastic Beanstalk Role: Manage deployment resources

#### 🔹 Amazon RDS (MySQL)
- Deployed in private subnet (Single-AZ)
- Stores user and post data

#### 🔹 Amazon S3
- Bucket for user-uploaded files (images/PDFs)
- Policy restricts access to EC2 IAM role

### ⚙ 3. Backend Deployment (Node.js on EC2)
- Launch EC2 in public subnet with IAM role and SG
- SSH into instance using key pair
- Install Node.js and dependencies
- Set environment variables:
  - `RDS_HOSTNAME`, `RDS_USERNAME`, `RDS_PASSWORD`
  - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
  - `S3_BUCKET_NAME`, `JWT_SECRET`, etc.
- Start server:
  ```bash
  pm2 start server.js
  ```

### 🌐 4. Frontend Deployment (React on Elastic Beanstalk)
- Create Elastic Beanstalk app and environment
- Select custom VPC and public subnets
- Attach Beanstalk IAM role
- Build app:
  ```bash
  npm run build
  ```
- Zip the folder and upload via Beanstalk dashboard

### 🔐 5. Required Environment Variables
- `RDS_HOSTNAME`
- `RDS_USERNAME`
- `RDS_PASSWORD`
- `RDS_DATABASE`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`
- `JWT_SECRET`

## 🌍 Live Demo
- **Frontend:** http://umair-todo-app-frontend-env.eba-sq2agqm9.ap-south-1.elasticbeanstalk.com/
- **Backend:** http://13.201.11.52/
