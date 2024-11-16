# nowhere-game-client

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/avandeventer/nowhere-game-client)

npm run build
docker build -t us-east4-docker.pkg.dev/nowhere-af065/nowhere-game-client-repo/nowhere-game-client .
docker push us-east4-docker.pkg.dev/nowhere-af065/nowhere-game-client-repo/nowhere-game-client
gcloud run deploy nowhere-game-client --image us-east4-docker.pkg.dev/nowhere-af065/nowhere-game-client-repo/nowhere-game-client --platform managed --region us-east4 --allow-unauthenticated