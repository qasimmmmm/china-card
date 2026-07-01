# Filing service container — runs a real browser to fill the portal and relay
# the CAPTCHA to the customer. Deploy this to any container host (Railway, Render,
# Fly.io, a VPS). The image already bundles Chromium, so no download is needed.
#
# The tag MUST match the "playwright" version in package.json (1.61.1).
FROM mcr.microsoft.com/playwright:v1.61.1-noble

WORKDIR /app

# Install only production deps.
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

# App code + the bundled mock portal.
COPY . .

# Hosts inject PORT; the service reads it and binds 0.0.0.0.
ENV NODE_ENV=production
EXPOSE 4100

# Chromium is preinstalled in this image; use it (not a system "chrome" channel).
ENV WORKER_BROWSER_CHANNEL=""
ENV WORKER_HEADLESS="true"

CMD ["node", "filing-service.js"]
