import prisma from "../config/db.config";
import { Prisma } from "@prisma/client";

export async function createNews(
    title: string,
    description: string,
    id?: number,
    news_date?: string,
    location?: string,
    category?: string,
    startup_id?: number,
    image?: string,
) {
    try {
        if (id) {
            const newsExist = await prisma.newsDetail.findUnique({
                where: { id }
            });

            if (newsExist) {
                throw new Error("News with this ID already exists");
            }
        }

        const news = await prisma.newsDetail.create({
            data: {
                id,
                news_date,
                location,
                title,
                category,
                startup_id,
                description,
                image
            },
        });
        return news;
    } catch (error) {
        throw error;
    }
}

export async function getNewsById(id: number) {
    try {
        const news = await prisma.newsDetail.findUnique({
            where: { id }
        });
        return news;
    } catch (error) {
        throw error;
    }
}

export async function getAllNews() {
    try {
        const all_news = await prisma.newsDetail.findMany();
        return all_news;
    } catch (error) {
        throw error;
    }
}

export async function updateNews(id: number, updateFields: Prisma.NewsDetailUpdateInput) {
    try {
        const news = await prisma.newsDetail.update({
            where: { id },
            data: { ...updateFields },
        });
        return news;
    } catch (error) {
        throw error;
    }
}

export async function deleteNews(id: number) {
    try {
        const news = await prisma.newsDetail.delete({
            where: { id },
        });
        return news;
    } catch (error) {
        throw error;
    }
}
