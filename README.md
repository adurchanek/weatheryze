🌦️ Weatheryze

A fully responsive and scalable weather application built with modern web technologies, integrating real-time weather data and advanced visualizations.

**Features**

Frontend: Developed using React (TypeScript) with React Router v6, lazy loading, and Redux Toolkit for efficient state management. Incorporated Recharts for interactive data visualizations.

Backend: Designed a secure and scalable microservices architecture with Node.js, Go, Express, and PostgreSQL, featuring secure API endpoints.

Data Integration: Integrated the Open-Meteo API for real-time weather and air quality data, along with the OpenAI GPT-4 API for weather summarization.

Performance & Reliability: Utilized Docker for containerization and Redis for caching, ensuring low latency. Wrote comprehensive tests using Jest and React Testing Library for unit and integration testing.

Deployment & Scalability:

- Hosted on AWS, leveraging:

  - Route 53, CloudFront, and S3 for fast and secure frontend delivery.

  - API Gateway and Application Load Balancer for request routing and distribution.

  - ECS with Fargate for containerized microservices with auto-scaling.

  - ElastiCache (Redis) for high-performance caching.
    
  - RDS (PostgreSQL) for reliable database management.
    
  - Cognito for secure OAuth authentication.
    
  - Amazon MQ (RabbitMQ) for messaging and event-driven architecture.