```bash
npm run dev
```

```bash
# OLD: npm run build && cd out &&  gcloud storage cp -r ./* gs://ki-storygen.com && cd ..
gcloud run deploy nextjs-ki-storygen --source . --region us-central1 --allow-unauthenticated
```