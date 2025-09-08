import prisma from "../config/db.config";
import { Prisma } from "@prisma/client";

export async function createNews(
    title: string,
    description: string,
    news_date?: string,
    location?: string,
    category?: string,
    startup_id?: number,
    image?: string,
) {
    try {
        const data: any = { title, description };

        if (news_date != null && news_date !== '')
            data.news_date = news_date;
        if (location != null && location !== '')
            data.location = location;
        if (category != null && category !== '')
            data.category = category;
        if (typeof startup_id === 'number' && !isNaN(startup_id))
            data.startup_id = startup_id;
        if (image != null && image !== '')
            data.image = image;

        const news = await prisma.newsDetail.create({ data });
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
