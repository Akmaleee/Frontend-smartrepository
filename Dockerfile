# ==========================================
# 1. Tahap Install Dependencies (deps)
# ==========================================
FROM oven/bun:1-alpine AS deps
WORKDIR /app

# Salin file package.json dan bun.lock (atau bun.lockb)
# Menggunakan wildcard (*) agar tidak error jika ekstensi lock-nya berbeda
COPY package.json bun.lock* ./

# Install dependencies tanpa mengubah file lock
RUN bun install --frozen-lockfile

# ==========================================
# 2. Tahap Build Aplikasi (builder)
# ==========================================
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Salin node_modules dari tahap pertama
COPY --from=deps /app/node_modules ./node_modules

# Salin seluruh source code frontend kamu
COPY . .

# Matikan pengumpulan data telemetri Next.js agar build lebih cepat
ENV NEXT_TELEMETRY_DISABLED=1

# Jalankan proses build (karena di next.config.ts sudah ada "standalone")
RUN bun run build

# ==========================================
# 3. Tahap Produksi (runner) - Image Super Ringan
# ==========================================
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Keamanan tingkat lanjut: Buat user non-root khusus untuk menjalankan aplikasi
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Salin folder public (berisi gambar, logo, ikon svg yang kamu miliki)
COPY --from=builder /app/public ./public

# Salin hasil build standalone dan folder static (CSS/JS)
# Set kepemilikan file langsung ke user 'nextjs'
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Pindah hak akses ke user non-root
USER nextjs

# Buka port 3000 untuk diakses dari luar container
EXPOSE 3000

# Jalankan server Next.js versi standalone menggunakan Bun
CMD ["bun", "run", "server.js"]