/*
  Warnings:

  - You are about to drop the column `description` on the `Idea` table. All the data in the column will be lost.
  - Added the required column `abstract` to the `Idea` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Idea" DROP COLUMN "description",
ADD COLUMN     "abstract" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Keyword" (
    "id" SERIAL NOT NULL,
    "keyword" TEXT NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_IdeaToKeyword" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_keyword_key" ON "Keyword"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "_IdeaToKeyword_AB_unique" ON "_IdeaToKeyword"("A", "B");

-- CreateIndex
CREATE INDEX "_IdeaToKeyword_B_index" ON "_IdeaToKeyword"("B");

-- AddForeignKey
ALTER TABLE "_IdeaToKeyword" ADD CONSTRAINT "_IdeaToKeyword_A_fkey" FOREIGN KEY ("A") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IdeaToKeyword" ADD CONSTRAINT "_IdeaToKeyword_B_fkey" FOREIGN KEY ("B") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;
