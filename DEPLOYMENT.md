# Extempore AI Coach Deployment Guide

## Prerequisites

- Docker and Docker Compose
- Google Cloud Platform account with Speech-to-Text API enabled
- PostgreSQL (for local development)
- Node.js 18+

## Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/extempored.git
cd extempored
```

2. Create environment files:

For the client (.env.local):
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_AUTH_URL=http://localhost:3001
NEXT_PUBLIC_RECORDING_URL=http://localhost:3002
```

For the auth service (services/auth/.env):
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/extempored_auth
JWT_SECRET=your-secure-jwt-secret
PORT=3001
```

For the recording service (services/recording/.env):
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/extempored_recording
GOOGLE_CLOUD_PROJECT=your-project-id
PORT=3002
```

3. Set up Google Cloud credentials:
- Create a service account in Google Cloud Console
- Download the JSON key file
- Save it as `google-credentials.json` in the project root

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Initialize the databases:
```bash
cd services/auth
npx prisma migrate dev
cd ../recording
npx prisma migrate dev
```

3. Start the development servers:
```bash
npm run dev
```

## Production Deployment

1. Build and start the containers:
```bash
docker-compose up -d --build
```

2. Initialize the databases:
```bash
docker-compose exec auth npx prisma migrate deploy
docker-compose exec recording npx prisma migrate deploy
```

3. The services will be available at:
- Client: http://localhost:3000
- Auth Service: http://localhost:3001
- Recording Service: http://localhost:3002

## Monitoring and Maintenance

1. View logs:
```bash
docker-compose logs -f
```

2. Update services:
```bash
git pull
docker-compose up -d --build
```

3. Backup databases:
```bash
docker-compose exec db pg_dump -U postgres extempored_auth > backup_auth.sql
docker-compose exec db pg_dump -U postgres extempored_recording > backup_recording.sql
```

## Security Considerations

1. Update the JWT secret in production
2. Secure the Google Cloud credentials
3. Use HTTPS in production
4. Regularly update dependencies
5. Monitor system resources and logs

## Troubleshooting

1. If services fail to start:
- Check logs: `docker-compose logs [service_name]`
- Verify environment variables
- Ensure ports are available

2. Database connection issues:
- Check database credentials
- Verify database is running
- Check network connectivity

3. Recording analysis fails:
- Verify Google Cloud credentials
- Check API quotas
- Validate input file format

## Support

For issues and support:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation 