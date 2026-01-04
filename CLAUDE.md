# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WeChat Mini Program (微信小程序) for habit tracking and check-in, built with WeChat Cloud Development (微信云开发). Users can create habits, track daily check-ins, and view statistics.

## Development Environment

- **IDE**: WeChat Developer Tools (微信开发者工具)
- **Platform**: WeChat Mini Program with Cloud Development
- **Backend**: Serverless cloud functions (Node.js)
- **Database**: Cloud Database (MongoDB-like)

## Project Structure

```
miniprogram/           # Frontend mini program code
├── pages/             # Page components (index, stats, mine, checkin, habit, history)
├── components/        # Reusable components (habit-card, calendar, stats-card, chart)
├── utils/             # Utilities (api.js, constants.js, date.js, storage.js)
└── app.js/json/wxss   # App entry and global config

cloudfunctions/        # Backend cloud functions
├── login/             # User authentication
├── createHabit/       # Create new habit
├── updateHabit/       # Update habit
├── deleteHabit/       # Soft delete habit
├── getHabits/         # Get habit list
├── checkIn/           # Record daily check-in
├── getCheckIns/       # Get check-in records
├── getStats/          # Get statistics
└── calculateStreak/   # Calculate consecutive days

database/              # Database schema definitions
└── collections.json   # Collection structure for users, habits, check_ins
```

## Architecture

### Frontend-Backend Communication
- All API calls go through `miniprogram/utils/api.js` which wraps `wx.cloud.callFunction()`
- Two call patterns: `callFunction()` (with loading indicator) and `callFunctionSilent()` (background)

### Cloud Functions Pattern
Each cloud function:
1. Initializes with `cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })`
2. Gets user identity via `cloud.getWXContext().OPENID`
3. Performs database operations and returns `{ success: boolean, ... }`

### Database Collections
- **users**: User profile and settings
- **habits**: User-created habits (uses soft delete with `isActive` flag)
- **check_ins**: Daily check-in records (unique on `_openid + habitId + date`)

### Key Conventions
- Dates stored as strings in `YYYY-MM-DD` format
- All data is user-scoped via `_openid` field
- Habits use soft delete (`isActive: false`) to preserve history
- Constants defined in `miniprogram/utils/constants.js`

## Development Workflow

### Adding a New Page
1. Create page directory in `miniprogram/pages/`
2. Create `.js`, `.json`, `.wxml`, `.wxss` files
3. Register in `miniprogram/app.json` pages array

### Adding a New Component
1. Create component directory in `miniprogram/components/`
2. Create `.js`, `.json`, `.wxml`, `.wxss` files
3. Set `"component": true` in the `.json` file
4. Import in page's `.json` via `usingComponents`

### Adding a New Cloud Function
1. Create directory in `cloudfunctions/`
2. Create `index.js` and `package.json`
3. Add API wrapper method in `miniprogram/utils/api.js`
4. Deploy via WeChat Developer Tools: right-click → "Upload and Deploy"

## Configuration

Before running, update the cloud environment ID in two places:
- `miniprogram/app.js`: `globalData.cloudEnvId`
- `miniprogram/utils/constants.js`: `CLOUD_ENV_ID`

## Tab Size

Project uses 2-space indentation (configured in `project.config.json`).
