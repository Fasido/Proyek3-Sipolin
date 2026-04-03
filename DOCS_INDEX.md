# Sipolin Documentation Index

Panduan lengkap untuk menavigasi dokumentasi Sipolin project.

## Documentation Files

### Start Here
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** ⭐
  - 5-minute overview
  - Quick file structure
  - Common tasks & errors
  - Best for: New developers getting started fast

### Main Documentation
- **[README.md](./README.md)**
  - Project overview & architecture
  - Complete feature list
  - API endpoints documentation
  - Database schema detailed explanation
  - Deployment instructions
  - Best for: Understanding the whole project

### Setup & Installation
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**
  - Step-by-step setup instructions
  - Prerequisites checklist
  - Database configuration
  - Environment variables
  - Troubleshooting guide
  - Best for: Getting the project running locally

### Implementation Details
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)**
  - What was built & why
  - Technology stack details
  - Architecture decisions
  - File structure breakdown
  - Security features
  - Performance considerations
  - Best for: Developers wanting deep understanding

### Backend Documentation
- **[backend/README.md](./backend/README.md)**
  - Express.js server setup
  - API endpoints list
  - Environment variables
  - Database migration
  - Best for: Backend development & API integration

### Frontend Documentation
- **[sipolin-mobile/README.md](./sipolin-mobile/README.md)**
  - React Native setup
  - Project structure
  - Key features
  - Development workflow
  - Troubleshooting mobile issues
  - Best for: Mobile app development

---

## Documentation by Use Case

### "I just cloned this project"
1. Read: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (5 min)
2. Follow: [SETUP_GUIDE.md](./SETUP_GUIDE.md) (20 min)
3. Run the app! 🎉

### "I want to understand the project"
1. Read: [README.md](./README.md) - Overview
2. Read: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Details
3. Browse code in `backend/src/` and `sipolin-mobile/app/`

### "I need to add a new feature"
1. Check: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - "Common Tasks"
2. Review: [backend/README.md](./backend/README.md) or [sipolin-mobile/README.md](./sipolin-mobile/README.md)
3. Look at existing code as reference
4. Follow established patterns

### "Something is broken"
1. Check: [SETUP_GUIDE.md](./SETUP_GUIDE.md) - "Troubleshooting"
2. Check: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - "Common Errors"
3. Check logs in terminal
4. Verify environment variables

### "I want to deploy this"
1. Read: [README.md](./README.md) - "Deployment" section
2. Follow specific platform instructions
3. Ensure all environment variables are set
4. Test on staging first

### "I'm integrating with external API"
1. Read: [backend/README.md](./backend/README.md) - API endpoints
2. Check: [sipolin-mobile/services/api.js](./sipolin-mobile/services/api.js) - API client pattern
3. Add new endpoints following existing patterns

---

## File Organization

```
Docs (Root Level):
├── DOCS_INDEX.md                    ← You are here
├── QUICK_REFERENCE.md               ← Start here for quick setup
├── SETUP_GUIDE.md                   ← Detailed setup instructions
├── README.md                         ← Project overview
├── IMPLEMENTATION_SUMMARY.md         ← What was built
└── [Code Folders]
    ├── backend/
    │   ├── README.md               ← Backend API docs
    │   ├── src/
    │   └── prisma/
    └── sipolin-mobile/
        ├── README.md               ← Frontend app docs
        ├── app/
        ├── services/
        └── context/
```

---

## Technology Documentation Links

### Backend
- [Express.js Documentation](https://expressjs.com/)
- [Prisma ORM Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Documentation](https://jwt.io/)

### Frontend
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Documentation](https://expo.github.io/router/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Axios Documentation](https://axios-http.com/docs)

---

## Quick Navigation

### Want to...

#### Run the project?
→ [SETUP_GUIDE.md](./SETUP_GUIDE.md)

#### Understand architecture?
→ [README.md](./README.md) then [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

#### Find an API endpoint?
→ [README.md](./README.md#api-endpoints) or [backend/README.md](./backend/README.md#api-endpoints)

#### Add a new screen?
→ [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#add-new-mobile-screen) then [sipolin-mobile/README.md](./sipolin-mobile/README.md)

#### Add a new endpoint?
→ [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#add-new-report-endpoint) then [backend/README.md](./backend/README.md)

#### Fix a bug?
→ [SETUP_GUIDE.md](./SETUP_GUIDE.md#troubleshooting) or [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#common-errors--solutions)

#### Deploy the app?
→ [README.md](./README.md#deployment)

#### Understand database schema?
→ [README.md](./README.md#database-schema) or [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

#### Configure environment?
→ [SETUP_GUIDE.md](./SETUP_GUIDE.md#environment-setup-details) or [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#environment-variables)

---

## Development Workflow

When working on Sipolin, follow this documentation path:

### Day 1: Getting Started
1. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Overview (5 min)
2. [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Local setup (20 min)
3. Run the project (10 min)
4. Explore app screens (15 min)

### Week 1: Learning
1. [README.md](./README.md) - Project architecture
2. [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Technical details
3. Browse backend code: [backend/](./backend/)
4. Browse frontend code: [sipolin-mobile/app/](./sipolin-mobile/app/)

### Ongoing: Development
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Commands & common tasks
- [backend/README.md](./backend/README.md) - API reference when needed
- [sipolin-mobile/README.md](./sipolin-mobile/README.md) - Frontend reference when needed
- Code comments & existing implementations as reference

---

## Documentation Maintenance

### How to Keep Docs Updated

When making changes to the project:

1. **Added new endpoint?** → Update [README.md](./README.md#api-endpoints) and [backend/README.md](./backend/README.md#api-endpoints)

2. **Changed file structure?** → Update [README.md](./README.md#project-structure) and relevant section docs

3. **Added new environment variable?** → Update [SETUP_GUIDE.md](./SETUP_GUIDE.md#environment-setup-details) and [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#environment-variables)

4. **Fixed a common error?** → Add to [SETUP_GUIDE.md](./SETUP_GUIDE.md#troubleshooting) or [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#common-errors--solutions)

5. **Changed technology or dependency?** → Update [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md#technology-versions)

---

## FAQ

**Q: Where do I start?**
A: Read [QUICK_REFERENCE.md](./QUICK_REFERENCE.md), then follow [SETUP_GUIDE.md](./SETUP_GUIDE.md)

**Q: How do I add a new feature?**
A: Check similar existing feature in code, follow same pattern, reference [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#common-tasks)

**Q: Where is the API documentation?**
A: [README.md](./README.md#api-endpoints) for overview, [backend/README.md](./backend/README.md) for details

**Q: How do I debug?**
A: See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#how-to-debug)

**Q: How do I deploy?**
A: See [README.md](./README.md#deployment)

**Q: Something is broken, what do I do?**
A: Check [SETUP_GUIDE.md](./SETUP_GUIDE.md#troubleshooting)

---

## Document Version Information

- **Created**: 2024
- **Last Updated**: 2024
- **Sipolin Version**: 1.0.0
- **Node.js**: 16+
- **React Native**: 0.73.0+
- **Expo**: 50.0.0+

---

## Support & Questions

For questions about:

- **Setup**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Architecture**: See [README.md](./README.md) & [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Specific Technology**: See links in "Technology Documentation Links" section above
- **Code Issues**: Check relevant `README.md` in `backend/` or `sipolin-mobile/`

---

**Happy Coding! 🚀**

Remember: When in doubt, start with [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for a quick answer or [README.md](./README.md) for deeper understanding.
