-- pgvector (image pgvector/pgvector:pg18-trixie ships it)
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'user',
    "prompt" TEXT,
    "dsl" TEXT,
    "root" JSONB NOT NULL,
    "screenshot" BYTEA,
    "screenshot_type" TEXT,
    "embedding" vector(768),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generations" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "dsl" TEXT NOT NULL,
    "root" JSONB NOT NULL,
    "engine" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "embedding" vector(768),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "templates_kind_idx" ON "templates"("kind");

-- CreateIndex
CREATE INDEX "generations_created_at_idx" ON "generations"("created_at");


-- Approximate nearest-neighbour indexes for cosine search
CREATE INDEX "templates_embedding_idx" ON "templates" USING hnsw ("embedding" vector_cosine_ops);
CREATE INDEX "generations_embedding_idx" ON "generations" USING hnsw ("embedding" vector_cosine_ops);
