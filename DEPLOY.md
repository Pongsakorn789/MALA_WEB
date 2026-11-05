# Deploy MALA for a free demo

The frontend remains on Firebase Hosting. The FastAPI service runs separately on Render Free and uses fixed screening guidance; it does not load the Hugging Face model, PyTorch, or require a GPU.

## 1. Deploy the API on Render

1. Push the project to GitHub.
2. In Render, choose **New → Blueprint** and connect the `MALA_WEB` repository.
3. Render reads `render.yaml` and creates the `mala-api` web service. Wait for its first deploy.
4. Copy the service URL, for example `https://mala-api.onrender.com`. Check that opening `<service-url>/health` returns `{"status":"ok"}`.

## 2. Point Firebase Hosting at the API

1. Copy `.env.example` to `.env.production`.
2. Replace the example value with the Render service URL, without a trailing slash.
3. Build and deploy the frontend from the project folder:

   ```powershell
   npm run build
   firebase deploy --only hosting
   ```

The `.env.production` file is ignored by Git. If the Render URL changes, update it and redeploy Firebase Hosting.

## Notes

- Render Free may pause the API after 15 minutes without requests. Its first request after pausing can take about a minute while it starts again.
- This setup is for a demo. The API is publicly reachable and has no user authentication, so do not send real patient-identifiable or health information until access controls and the deployment have been reviewed for the intended clinical use.
- The API returns fixed guidance based on the entered screening factors. It is not generative AI and does not replace clinical review.
