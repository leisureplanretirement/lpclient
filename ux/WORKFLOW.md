# Web App Workflow

This document describes how the React web application works and its communication with the backend API.

## Workflow Overview
The user interacts with the app thru a conversational UX (an input box on a web page).
He/she types their questions into a chat prompt. The question is sent to the server. The server is an LLM that has a tool that does the retirement calculations. The LLM formulates the inputs to the tool, and then summarizes the results from the tool and answers the user's specific questions. The server will also generate some static charts, tables and other visual artifacts.
Each new chat from the user gets a new Id. This is called the ChatQueryId (a GUID).
The web page client polls the server server status using this ChatQueryId. 
When the status is DONE, then the client retrieves all the items it needs from the server using this same ChatQueryId.
The user then can enter further follow-up questions.


## Architecture

- **React + Vite** frontend with Material UI 3
- **Layout**: Banner → Left Menu → Main Area (Chat + Results)
- **Routing**: React Router with `/plans`, `/settings`, and default chat route

## Chat Workflow (App.jsx → MainChat component)

### 1. User Input → `handleSend(text)`
- Adds user message to chat window
- POSTs to `/api/Chat` with message + optional sessionId
- Backend returns: `chatSessionId`, `chatQueryId`, initial `reply`

### 2. Async Processing → `pollQueryStatus()`
- Polls `/api/Chat/QueryStatus` every 1 second (max 300 polls)
- Shows progress bar during `Working`/`Preprocessing` states
- Fetches dialog updates in real-time while working

### 3. Results Loading → `loadResults()` when status = `Done`
- **Dialog**: Full conversation from `/api/Chat/Dialog` (parsed into USER/ASSISTANT messages)
- **Model Inputs**: Retirement plan data from `/api/Chat/RetirementCalculatorInputs`
- **Charts**: Flows and Balances images from `/api/Chat/Chart`

### 4. Display Results
- **ChatWindow**: Shows parsed dialog (USER/ASSISTANT format)
- **ResultsWindow**: Shows charts + tables (accounts, assumptions, settings)

## Key Components

- **ChatInput**: User text entry
- **ChatWindow**: Message display with user/agent bubbles
- **PollingProgressBar**: Shows polling progress during async processing
- **ResultsWindow**: Charts + data tables
- **Menu**: Navigation sidebar (Plans/Settings pages TBD)

## Backend Integration (api.js)

All API calls go to `/api/Chat/*` endpoints with sessionId/queryId tracking for stateful conversations:

- `POST /api/Chat` - Send user message
- `GET /api/Chat/QueryStatus` - Poll query processing status
- `GET /api/Chat/Dialog` - Fetch full conversation dialog
- `GET /api/Chat/RetirementCalculatorInputs` - Fetch retirement plan data
- `GET /api/Chat/Chart` - Fetch chart images (Flows/Balances)
- `GET /api/Chat/History` - Fetch chat history

## State Management

- **sessionId**: Persists across messages in the same conversation
- **queryId**: Unique identifier for each user query
- **queryStatus**: Tracks async processing (`Working` → `Done` → load results)
- **dialog**: Backend-generated conversation text (overrides local messages when available)
- **results**: Charts and data tables displayed in ResultsWindow
