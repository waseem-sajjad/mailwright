-- Embeddings are gone: drop the pgvector columns (their HNSW indexes go with them).
ALTER TABLE "templates" DROP COLUMN IF EXISTS "embedding";
ALTER TABLE "generations" DROP COLUMN IF EXISTS "embedding";
