FROM node:lts AS base

# 仅在需要时安装依赖
FROM base AS deps
WORKDIR /app

COPY package.json yarn.lock* ./

# 安装并启用 corepack，然后使用 yarn 安装依赖
RUN npm install -g corepack && corepack enable && yarn install --no-lockfile --network-timeout 600000

# 仅在需要时重新构建源代码
FROM base AS builder
WORKDIR /app

# 构建参数：默认共享目录路径
ARG NEXT_PUBLIC_DEFAULT_SHARE_DIR=/mnt/azure/shared

# 从 deps 阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 安装并启用 corepack，然后执行构建
RUN npm install -g corepack && corepack enable && yarn run build


# 生产环境镜像，复制所有文件并运行 Next.js
FROM base AS runner
WORKDIR /app

# 创建系统用户组和用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制静态资源
COPY --from=builder /app/public ./public

# 为预渲染缓存设置正确的权限
RUN mkdir .next
RUN chown nextjs:nodejs .next

# 利用输出跟踪自动减少镜像体积
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 创建持久化数据目录
RUN mkdir -p /app/shared && chmod -R 777 /app/shared

# 切换到非 root 用户运行
USER nextjs

# 暴露应用端口
EXPOSE 3000

# 环境变量配置
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 启动应用（JSON 格式防止信号处理问题）
CMD ["node", "server.js"]
