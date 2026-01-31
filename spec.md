# No Wait Customer Support Bot for Local Shops

## Overview
A web application that enables local shop owners to create AI-powered customer support chatbots using their own shop information. Shop owners can input their business details, and customers can chat with a bot that answers questions based only on the provided shop data.

## Authentication
- Internet Identity integration for shop owner login
- Only authenticated shop owners can manage their shop data

## Shop Owner Dashboard
- Form interface for shop owners to input and edit shop information including:
  - Business hours
  - Pricing information
  - Services offered
  - Parking availability
  - Accepted payment methods
  - Additional notes
- Display unique customer chat URL for sharing
- Basic analytics showing number of questions asked and common topics

## Customer Chat Interface
- Public chat interface accessible via unique shop URLs (`/shop/[shop-id]`)
- Mobile-friendly design
- Text input for customer questions
- Streamed chat responses
- Maintains chat history within the current session
- No authentication required for customers
- Enhanced error handling with specific user feedback:
  - Display "This shop's information isn't ready yet. Please try again later." when no embeddings exist
  - Display "The AI service is temporarily unavailable. Please try again soon." when OpenAI API calls fail
  - Show generic error message for other technical issues

## Backend Data Storage
- Store shop owner profiles and their associated shop information
- Generate and store text embeddings for shop data using OpenAI API
- Maintain mapping between shop owners and their shop data
- Store chat analytics data (question counts, topics)
- Implement robust error handling for embedding generation and retrieval
- Return specific error codes to frontend for different failure scenarios

## RAG Chatbot Functionality
- Process customer questions by performing similarity search against stored shop embeddings
- Use cosine similarity to find most relevant shop information
- Generate responses using OpenAI API based on retrieved shop data
- Return "I don't know" responses when information is not available in shop data
- Restrict responses to only information provided by the shop owner
- Validate shop data exists before processing chat requests
- Handle OpenAI API failures gracefully with appropriate error responses

## Technical Requirements
- HTTP outcalls to OpenAI API for embeddings generation and chat completions
- Vector similarity search implementation in backend
- Unique shop ID generation for shareable URLs
- Session-based chat history management
- Proper OpenAI API key configuration from environment variables
- Comprehensive error handling for API failures and missing data
- Frontend validation of shop data before API requests

## Pages Structure
- Login/Signup page with Internet Identity
- Shop owner dashboard for data management
- Customer chat page with unique URLs per shop
- Analytics view for shop owners
