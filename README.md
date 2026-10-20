# Frame | Serverless Image Gallery

Frame is a full-stack image gallery built with React and AWS serverless services. It lets users upload, browse, categorize, edit, and delete photographs through a clean web interface.

## Features

- Upload images directly to Amazon S3 using presigned URLs.
- Browse photographs loaded from the backend.
- Organize photographs by category.
- Edit photograph titles and categories.
- Delete photographs from the gallery and cloud storage.
- Refresh the gallery to retrieve the latest data.
- Validate image types and file sizes before saving.

## Tech Stack

**Frontend**
- React
- JavaScript
- Vite

**Backend and Cloud**
- AWS Lambda
- Amazon API Gateway
- Amazon S3
- Amazon DynamoDB
- AWS IAM

## Architecture

1. The React frontend requests a presigned upload URL from API Gateway.
2. AWS Lambda generates the URL for uploading an image to S3.
3. The browser uploads the image directly to the private S3 bucket.
4. The frontend sends the image metadata to the backend.
5. Lambda stores metadata in DynamoDB.
6. The gallery retrieves image metadata and temporary viewing URLs through the API.

## Current Limitations

- The prototype uses a hardcoded demo user and does not yet provide secure user authentication.
- Image viewing URLs are temporary.
- Production deployment requires additional security, access controls, and operational testing.

## Future Improvements

- User authentication and private galleries.
- Search and filtering.
- Improved mobile responsiveness.
- Production deployment and monitoring.

## Project Status

Under development. Built as a learning project to explore React, REST APIs, and AWS serverless architecture.
