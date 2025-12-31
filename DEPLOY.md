# Deploying to AWS Amplify

This guide will walk you through deploying your MySQL Dashboard to AWS Amplify.

## Prerequisites

1. AWS Account with Amplify access
2. Git repository (GitHub, GitLab, Bitbucket, or AWS CodeCommit)
3. Your MySQL database credentials

## Step 1: Push Code to Git Repository

If you haven't already, initialize git and push your code:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - MySQL Dashboard ready for Amplify"

# Add your remote repository
git remote add origin <your-repo-url>

# Push to main/master branch
git push -u origin main
```

## Step 2: Connect to AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click **"New app"** → **"Host web app"**
3. Choose your Git provider (GitHub, GitLab, Bitbucket, or AWS CodeCommit)
4. Authorize AWS Amplify to access your repository
5. Select your repository and branch (usually `main` or `master`)
6. Click **"Next"**

## Step 3: Configure Build Settings

Amplify should automatically detect Next.js. Verify these settings:

- **App name**: `trepo-dash` (or your preferred name)
- **Build settings**: Should auto-detect `amplify.yml`
- **Branch**: Your main branch

Click **"Next"** to proceed.

## Step 4: Add Environment Variables

**CRITICAL**: Add your MySQL database credentials:

1. In the Amplify setup, go to **"Environment variables"**
2. Add the following variables:

```
DB_HOST = database-1.cvig8u6s25dz.us-east-1.rds.amazonaws.com
DB_USER = admin
DB_PASSWORD = <your-actual-mysql-password>
DB_NAME = mysqlTutorial
```

**Important**: 
- Replace `<your-actual-mysql-password>` with your real MySQL password
- These are sensitive - never commit them to git
- Amplify will encrypt these automatically

## Step 5: Review and Deploy

1. Review your settings
2. Click **"Save and deploy"**
3. Amplify will:
   - Install dependencies (`npm ci`)
   - Build your Next.js app (`npm run build`)
   - Deploy to a CDN
   - Provide you with a live URL

## Step 6: Verify Deployment

Once deployment completes:

1. Click on your app in Amplify Console
2. You'll see a URL like: `https://main.xxxxx.amplifyapp.com`
3. Visit the URL to verify your dashboard is working
4. Check the logs if there are any issues

## Step 7: Configure Custom Domain (Optional)

1. In Amplify Console, go to **"Domain management"**
2. Click **"Add domain"**
3. Enter your domain name
4. Follow the DNS configuration instructions

## Troubleshooting

### Build Fails

- Check build logs in Amplify Console
- Verify `amplify.yml` is correct
- Ensure all dependencies are in `package.json`

### Database Connection Issues

- Verify environment variables are set correctly
- Check that your RDS instance allows connections from Amplify
- Ensure security groups allow traffic from Amplify IPs
- Check RDS is in the same region or accessible publicly

### App Not Loading

- Check browser console for errors
- Verify API routes are working (`/api/health`)
- Check Amplify function logs

## Continuous Deployment

Amplify automatically deploys when you push to your connected branch:

```bash
git add .
git commit -m "Update dashboard"
git push
```

Amplify will automatically rebuild and redeploy!

## Environment-Specific Deployments

You can create multiple environments (staging, production):

1. In Amplify Console, click **"Add environment"**
2. Choose a branch (e.g., `staging`)
3. Configure environment variables for that environment
4. Deploy!

## Security Best Practices

1. ✅ Never commit `.env.local` to git (already in `.gitignore`)
2. ✅ Use Amplify Environment Variables for all secrets
3. ✅ Enable AWS WAF for additional protection
4. ✅ Use HTTPS (enabled by default in Amplify)
5. ✅ Regularly rotate database passwords

## Support

If you encounter issues:
- Check Amplify build logs
- Review Next.js deployment docs: https://nextjs.org/docs/deployment
- AWS Amplify docs: https://docs.aws.amazon.com/amplify/

