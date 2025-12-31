# 🚀 AWS Amplify Deployment Checklist

## ✅ Pre-Deployment Checklist

- [x] Build succeeds locally (`npm run build`)
- [x] All dependencies installed
- [x] `amplify.yml` configured correctly
- [x] Environment variables documented
- [x] `.gitignore` includes sensitive files

## 📋 Deployment Steps

### 1. Initialize Git (if not done)
```bash
git init
git add .
git commit -m "Initial commit - MySQL Dashboard"
```

### 2. Push to Remote Repository
```bash
# Create a new repo on GitHub/GitLab/Bitbucket, then:
git remote add origin <your-repo-url>
git push -u origin main
```

### 3. Connect to AWS Amplify
1. Go to https://console.aws.amazon.com/amplify
2. Click **"New app"** → **"Host web app"**
3. Select your Git provider
4. Authorize and select your repository
5. Select branch: `main`

### 4. Configure Environment Variables ⚠️ CRITICAL
In Amplify Console → Environment variables, add:

```
DB_HOST = database-1.cvig8u6s25dz.us-east-1.rds.amazonaws.com
DB_USER = admin
DB_PASSWORD = <YOUR_ACTUAL_PASSWORD>
DB_NAME = mysqlTutorial
```

### 5. Deploy
- Click **"Save and deploy"**
- Wait for build to complete (~5-10 minutes)
- Get your live URL!

## 🔍 Post-Deployment Verification

- [ ] Visit the Amplify URL
- [ ] Dashboard loads without errors
- [ ] Tables are discovered
- [ ] Charts display correctly
- [ ] Data loads from MySQL

## 🐛 Troubleshooting

**Build fails?**
- Check Amplify build logs
- Verify `package.json` has all dependencies
- Ensure `amplify.yml` is correct

**Database connection fails?**
- Verify environment variables are set
- Check RDS security groups allow Amplify IPs
- Verify database is accessible from internet

**App loads but no data?**
- Check browser console for errors
- Verify API routes work: `/api/health`
- Check Amplify function logs

## 📚 Resources

- Full deployment guide: [DEPLOY.md](./DEPLOY.md)
- AWS Amplify Docs: https://docs.aws.amazon.com/amplify/
- Next.js Deployment: https://nextjs.org/docs/deployment

